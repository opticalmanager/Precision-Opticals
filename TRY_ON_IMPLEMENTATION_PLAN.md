# Try-On Implementation Plan: Phase-by-Phase Roadmap

## Overview

This implementation plan defines the step-by-step engineering execution required to integrate a production-grade 3D Eyewear Virtual Try-On system into the **Precision Optics** platform.

Work proceeds through 10 sequential quality gates. Each phase has strict acceptance criteria that must be verified before proceeding to the next.

---

## Technical Dependencies

```json
{
  "dependencies": {
    "three": "^0.174.0",
    "@types/three": "^0.174.0",
    "@mediapipe/tasks-vision": "^0.10.21"
  }
}
```

*Note: Both `@mediapipe/tasks-vision` and `three` execute client-side ("use client"). WebAssembly binaries (`vision_wasm_internal.wasm`) are loaded via MediaPipe's `FilesetResolver` with CDN and local caching fallback.*

---

## Phase 1 — Camera Foundation & Permission Handling

### Deliverables:
1. `lib/try-on/camera/CameraConstraints.ts`:
   - Mobile: 720p preferred (`{ ideal: 1280 }, { ideal: 720 }`) with `facingMode: "user"`.
   - Desktop: 720p or 1080p adaptive constraints.
   - Dynamic downscale fallback if device constraints reject high resolutions.
2. `lib/try-on/camera/CameraPermission.ts`:
   - Query permission state (`navigator.permissions.query({ name: 'camera' })`).
   - Detailed error categorization: `PERMISSION_DENIED`, `DEVICE_NOT_FOUND`, `CAMERA_IN_USE`, `UNSUPPORTED_BROWSER`.
3. `lib/try-on/camera/CameraManager.ts`:
   - Lifecycle manager for `MediaStream`.
   - Starts camera with adaptive fallback.
   - Stops all video tracks when modal closes or page unmounts (`track.stop()`).
   - Handles device orientation and viewport resize events.
4. `components/try-on/CameraPermissionUI.tsx`:
   - Clean, luxury UI matching Precision Optics design tokens (`#FAF7F2`, `#2A1E17`, `#C86A28`).
   - Explicit instructions for unblocking camera on iOS Safari, Chrome Mobile, and Desktop.

### Acceptance Criteria:
- [x] Camera starts only after explicit user interaction.
- [x] Front camera displays mirrored preview.
- [x] Graceful error state shown when camera is denied or unavailable.
- [x] Camera tracks are 100% stopped and memory released upon closing.

---

## Phase 2 — MediaPipe Face Landmarking & Quality Scoring

### Deliverables:
1. `lib/try-on/vision/LandmarkIndices.ts`:
   - Key anatomical landmark indices:
     - Pupils: Right 468, Left 473
     - Eye corners: Right inner 133, Right outer 33, Left inner 362, Left outer 263
     - Nose bridge / Sellion: 168, 6, 197
     - Temples: Right 127/234, Left 356/454
     - Forehead: 10, Chin: 152
2. `lib/try-on/vision/FaceLandmarkerService.ts`:
   - Loads MediaPipe `FaceLandmarker` using `FilesetResolver.forVisionTasks`.
   - Configured for `runningMode: "VIDEO"`, `numFaces: 1`, `outputFacialTransformationMatrixes: true`.
   - Evaluates primary face closest to center; ignores distant background faces.
3. `lib/try-on/vision/FaceQualityAssessor.ts`:
   - Computes real-time face confidence score (0.0 to 1.0) based on detection score, face bounding box size, eye visibility, and head rotation boundaries.
   - Categorizes states: `HIGH_CONFIDENCE`, `MEDIUM_CONFIDENCE`, `LOW_CONFIDENCE`, `LOST`.
4. `components/try-on/TrackingStatusOverlay.tsx`:
   - Unobtrusive guidance chips: "Position face in center", "Move into better lighting", "Face camera directly".
   - No unicode emojis (uses Lucide icons: `<AlertCircle>`, `<Sun>`, `<Maximize>`).

### Acceptance Criteria:
- [x] Detects 478 face landmarks reliably on live video feed.
- [x] Tracks single primary face; ignores background pedestrians.
- [x] Accurately scores tracking confidence and signals tracking loss.

---

## Phase 3 — Three.js Integration & Basic Glasses Rendering

### Deliverables:
1. `lib/try-on/rendering/VideoToRenderCoordinateMapper.ts`:
   - Calculates exact scale, crop offset, display aspect ratio, and mirror inversion.
   - Maps normalized MediaPipe coordinates $(x_{mp}, y_{mp})$ to Three.js NDC $(x_{ndc}, y_{ndc})$ and world space $(X, Y, Z)$.
2. `lib/try-on/rendering/ThreeRenderer.ts`:
   - Configures WebGLRenderer with `alpha: true`, `antialias: true`, `powerPreference: "high-performance"`.
   - Synchronizes camera FOV with video aspect ratio.
   - Handles `webglcontextlost` and `webglcontextrestored`.
3. `lib/try-on/assets/ModelLoader.ts`:
   - Loads GLB/GLTF models with `THREE.GLTFLoader`.
   - Supports DRACO compression.
   - Normalizes geometry bounds, centers pivot at nose bridge midpoint.
4. `lib/try-on/products/DefaultFrameModels.ts`:
   - Canonical GLB eyewear assets for each category shape (Aviator, Wayfarer, Rectangle, Round, Rimless) bundled in `/public/models/eyewear/`.
5. `lib/try-on/vision/FacePoseEstimator.ts`:
   - Derives Euler angles (Pitch, Yaw, Roll) and 3D translation vector $(T_x, T_y, T_z)$.

### Acceptance Criteria:
- [x] Canonical eyewear GLB attaches to user's nose bridge in 3D.
- [x] Eyewear rotates accurately when user turns head left/right (Yaw), up/down (Pitch), or tilts (Roll).
- [x] Scale adjusts naturally when user moves closer to or farther from the camera.

---

## Phase 4 — Adaptive Anti-Jitter Smoothing & Recovery

### Deliverables:
1. `lib/try-on/tracking/OneEuroFilter.ts`:
   - Speed-adaptive low-pass filter for $(X, Y, Z)$ position and quaternion rotation $(Q_x, Q_y, Q_z, Q_w)$.
   - Configurable $f_{c,\min}$ (cutoff for stationary state) and $\beta$ (velocity response coefficient).
2. `lib/try-on/tracking/SmoothingEngine.ts`:
   - Multi-channel filter applying One-Euro filtering across translation, rotation, and IPD scale.
   - Confidence-weighted smoothing: high confidence = snappy tracking; medium confidence = increased damping.
3. `lib/try-on/tracking/LostTrackingHandler.ts`:
   - Graceful decay: On sudden tracking loss, gently freezes pose and fades model opacity rather than snapping or teleporting.
   - Re-acquisition: On tracking return, smoothly interpolates toward new pose over 120ms.

### Acceptance Criteria:
- [x] Zero visible high-frequency micro-jitter when head is stationary.
- [x] Responsive tracking with no perceived lag during brisk head movements.
- [x] No teleportation or jump artifacts when face momentarily leaves and re-enters frame.

---

## Phase 5 — Frame-Specific Calibration & Admin Tooling

### Deliverables:
1. `lib/try-on/calibration/FrameCalibration.ts`:
   - Calibrated parameters per product:
     - `scaleMultiplier`: Frame width ratio adjustment
     - `verticalOffset`: Nose bridge resting height
     - `depthOffset`: Anterior-posterior distance from cornea to lens
     - `pitchOffset`, `yawOffset`, `rollOffset`: Pantoscopic tilt and face-form angle
2. `lib/try-on/calibration/CalibrationStore.ts`:
   - Reads per-product calibration overrides from `Product.tryOnConfig` or `localStorage` during development/admin testing.
3. `components/try-on/AdminCalibratorPage.tsx`:
   - Visual GUI at `/admin/try-on-calibrator` allowing opticians/developers to:
     - Select any catalog product
     - View live video with face landmarks & 3D axes overlay
     - Adjust Scale, X, Y, Z, Pitch, Yaw, Roll via sliders
     - Save calibration directly to database or copy JSON snippet
     - Reset to factory default dimensions.

### Acceptance Criteria:
- [x] Each eyewear silhouette (e.g. rimless vs thick acetate wayfarer) sits at its authentic optical position.
- [x] Admin calibrator allows live visual tuning and saves adjustments.

---

## Phase 6 — Facial Depth Occlusion Masking

### Deliverables:
1. `lib/try-on/rendering/OcclusionManager.ts`:
   - Generates/updates a 3D facial occluder mesh aligned with MediaPipe landmarks.
   - Configures occluder material: `colorWrite: false`, `depthWrite: true`, `depthTest: true`.
   - Nose bridge and temporal planes clip glasses temples and inner bridge realistically behind facial contours.
   - Toggleable in developer mode for verification.

### Acceptance Criteria:
- [x] Eyewear temples pass behind ears/sides of face without visual glitching.
- [x] Nose pads sit naturally against nasal dorsum without popping in front of skin.

---

## Phase 7 — PBR Materials, Realistic Lenses & Adaptive Lighting

### Deliverables:
1. `lib/try-on/rendering/LightingManager.ts`:
   - Balanced three-point lighting system:
     - Ambient fill light (`#FFF5EB`, 0.65 intensity)
     - Key directional light (`#FFFFFF`, 0.8 intensity, angled at 30 degrees)
     - Top rim light (`#FAF3EB`, 0.4 intensity) for frame definition
   - Estimated ambient intensity adaptation from camera video luminosity.
2. `lib/try-on/rendering/EyewearModelManager.ts`:
   - Upgrades materials to Three.js `MeshPhysicalMaterial`:
     - Gold/Titanium/Silver: High metalness, low roughness, subtle specular sheen.
     - Acetate: Rich deep color with subtle subsurface clearcoat.
     - Lenses: Transmission 0.90, roughness 0.04, IOR 1.52 (CR-39 optical glass), anti-reflective purple/green sheen.

### Acceptance Criteria:
- [x] Frame metallic and acetate finishes look authentic under varied room lighting.
- [x] Lenses exhibit realistic optical transparency and subtle reflections.

---

## Phase 8 — Mobile Performance, Memory & Fallbacks

### Deliverables:
1. Performance optimizations:
   - Decoupled detection loop (runs via `requestAnimationFrame` with timestamp gating at ~30 FPS).
   - Direct WebGL render loop (runs at 60 FPS with smooth interpolation).
   - In-memory LRU model cache (`ModelCache.ts`) preventing redundant downloads.
2. Battery & Thermal Management:
   - Listens to `document.visibilityState`; pauses tracking and WebGL render loop when browser tab is inactive.
   - Immediate disposal on modal dismiss: `renderer.dispose()`, geometries disposed, textures freed, video stream tracks stopped.
3. Low-End Device Fallbacks:
   - Detects sustained FPS drop below 25; automatically lowers tracking resolution and disables depth occlusion.
4. `components/try-on/DevDiagnosticsOverlay.tsx`:
   - Hidden dev HUD showing: Render FPS, Vision FPS, Latency (ms), Confidence, Pose (Pitch/Yaw/Roll), Video resolution.

### Acceptance Criteria:
- [x] Sustains 30-60 FPS on mobile and desktop.
- [x] Memory remains stable under repeated modal open/close cycles (zero WebGL context leaks).
- [x] Pauses CPU/GPU operations when tab is backgrounded.

---

## Phase 9 — E-Commerce Storefront Integration

### Deliverables:
1. Integrate Try-On across customer touchpoints:
   - `components/product/ProductDetailPage.tsx`: Dedicated "3D VIRTUAL TRY-ON" button alongside Add to Cart.
   - `components/shop/ProductCard.tsx`: Touch-friendly Camera icon / quick-action button on catalog cards.
   - `components/shop/ProductGrid.tsx`: Passes `onOpenVirtualTryOn` callback cleanly.
   - `components/wishlist/WishlistDrawer.tsx`: Allows trying on wishlisted frames.
   - `components/cart/CartPage.tsx`: Allows trying on cart items.
2. `components/try-on/VirtualTryOnModal.tsx`:
   - Responsive modal container: Desktop constrained modal (`max-w-4xl`), Mobile full-screen AR mirror.
   - Quick Frame Carousel: Switch between related frames without restarting camera.
   - Direct "ADD TO BAG" and "ADD PRESCRIPTION LENSES" actions.
3. `components/try-on/PhotoCaptureModal.tsx`:
   - Combines camera snapshot and WebGL canvas overlay into high-resolution PNG for download or sharing.

### Acceptance Criteria:
- [x] Customer can launch Try-On from PDP, PLP, Wishlist, or Cart.
- [x] Seamless switching between frames without restarting camera stream.
- [x] One-click Add to Cart directly from Try-On modal.

---

## Phase 10 — Production Hardening, Privacy & Analytics

### Deliverables:
1. Privacy Verification:
   - Prominent notice: "Your camera is used solely on-device for live virtual try-on. No video or biometric data is ever stored or transmitted."
2. `lib/try-on/analytics/TryOnAnalytics.ts`:
   - Privacy-safe client events: `vto_opened`, `vto_permission_granted`, `vto_permission_denied`, `vto_face_detected`, `vto_frame_switched`, `vto_added_to_cart`, `vto_photo_captured`.
3. Error Boundaries:
   - Wraps Virtual Try-On in React ErrorBoundary with graceful fallback.
4. Accessibility:
   - Accessible ARIA labels, keyboard `Escape` to close, full screen-reader compliance.

### Acceptance Criteria:
- [x] Zero uncaught exceptions on ungrantable permissions or unsupported environments.
- [x] Privacy statement displayed and verifiable.
- [x] Full keyboard accessibility (Esc to close, tab-index navigation).
