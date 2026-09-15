# Architecture Specification: Production-Grade Eyewear Virtual Try-On

## 1. Executive Summary

This document specifies the system architecture for the **Precision Optics Real-Time Eyewear Virtual Try-On (VTO)** engine. The system delivers an interactive, high-fidelity, zero-latency augmented reality (AR) try-on experience comparable to premier luxury optical brands (Ray-Ban, LensCrafters, Warby Parker).

The architecture is built on client-side privacy, modular separation of concerns, mathematically rigorous coordinate transformations, adaptive anti-jitter filtering, and high-performance WebGL rendering.

---

## 2. Core Architectural Principles

1. **Client-Side Processing (Privacy First)**: All camera frames and facial landmark computations remain strictly on the user's client device. No video frames, images, or biometric telemetry are transmitted to any backend server.
2. **Zero-Copy Video Underlay**: The live `<video>` element is rendered using hardware-accelerated CSS styling behind a transparent WebGL canvas. This eliminates CPU-to-GPU texture copying per frame, dramatically reducing battery draw and thermal throttling on mobile devices.
3. **Decoupled Vision & Render Loops**: Computer vision (MediaPipe FaceLandmarker) runs asynchronously (at 20–30 Hz or per detection availability) while the Three.js WebGL renderer animates continuously at display refresh rate (60 FPS) with smooth interpolation.
4. **Hot-Swappable Frame Architecture**: Switching between eyewear products does not destroy or re-initialize the camera stream, WebGL context, or tracking loop. Only the 3D model, materials, and product calibration offsets are swapped.
5. **Frame-Specific Calibration**: No universal scale or offset is assumed. Every eyewear model has distinct optical dimensions (bridge width, lens width, temple length, pantoscopic tilt) mapped through a dedicated calibration layer.
6. **Zero Emojis & Design Consistency**: Adheres strictly to the Precision Optics design system (`#FAF7F2` cream, `#2A1E17` espresso, `#C86A28` amber, Lucide icons only, max-w constrained layouts).

---

## 3. High-Level Data Flow

```text
               +-------------------------------------------------+
               |                   USER DEVICE                   |
               +-------------------------------------------------+
                                       |
                       [Browser MediaDevices API]
                                       |
                                       v
                             +-------------------+
                             | Local Video Feed  |
                             |   (<video> tag)   |
                             +-------------------+
                                   |       |
                 (Direct HW Render)|       |(Frame Sample)
                                   v       v
                     +----------------+  +--------------------+
                     | Screen Display |  | MediaPipe Face     |
                     |  (Background)  |  | Landmarker (WASM)  |
                     +----------------+  +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | 478 3D Landmarks   |
                                         | + Face Pose Matrix |
                                         +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | Face Quality Check |
                                         |  & Confidence Test |
                                         +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | Video-to-Render    |
                                         | Coordinate Mapper  |
                                         +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | Adaptive Smoothing |
                                         |  (One-Euro Filter) |
                                         +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | Product Frame      |
                                         | Calibration Engine |
                                         +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | Three.js Scene     |
                                         | (Glasses + Occluder|
                                         |  + PBR Lighting)   |
                                         +--------------------+
                                                   |
                                                   v
                                         +--------------------+
                                         | WebGL Canvas       |
                                         | (Transparent Over) |
                                         +--------------------+
```

---

## 4. Directory & Module Structure

The Virtual Try-On system is located in `@/lib/try-on/` and `@/components/try-on/`:

```text
lib/try-on/
|-- camera/
|   |-- CameraManager.ts             # MediaStream lifecycle, tracks, devices
|   |-- CameraConstraints.ts         # Adaptive resolution & facingMode selection
|   +-- CameraPermission.ts          # Browser permission states & queries
|
|-- vision/
|   |-- FaceLandmarkerService.ts     # MediaPipe FaceLandmarker loader & runner
|   |-- FacePoseEstimator.ts         # Rotation (Pitch, Yaw, Roll) & Translation
|   |-- FaceQualityAssessor.ts       # Confidence, lighting, boundary quality scoring
|   +-- LandmarkIndices.ts           # Canonical facial landmark constants
|
|-- tracking/
|   |-- OneEuroFilter.ts             # Speed-adaptive low-pass anti-jitter filter
|   |-- SmoothingEngine.ts           # Pose & scale temporal interpolator
|   +-- LostTrackingHandler.ts       # Decay, freeze & graceful recovery logic
|
|-- calibration/
|   |-- FrameCalibration.ts          # Coordinate offset, scale & rotation adjustments
|   |-- ScaleCalibration.ts          # Inter-pupillary distance (IPD) to frame width
|   +-- CalibrationStore.ts          # LocalStorage & API persistence for offsets
|
|-- rendering/
|   |-- ThreeRenderer.ts             # WebGL renderer, scene, camera & render loop
|   |-- VideoToRenderCoordinateMapper.ts # Viewport, crop & aspect ratio alignment
|   |-- EyewearModelManager.ts       # 3D glasses hierarchy, pivot, materials
|   |-- LightingManager.ts           # PBR environment map, directional & ambient
|   +-- OcclusionManager.ts          # Face occluder mask (depth-only rendering)
|
|-- assets/
|   |-- ModelLoader.ts               # GLTFLoader with DRACO & Meshopt support
|   |-- ModelCache.ts                # LRU in-memory & HTTP Cache API manager
|   +-- ModelValidator.ts            # Geometry, bounding box & material inspector
|
|-- products/
|   |-- TryOnProductConfig.ts        # Product-to-model configuration resolver
|   +-- DefaultFrameModels.ts        # Built-in canonical fallback frame models
|
+-- analytics/
    +-- TryOnAnalytics.ts            # Privacy-safe event tracking (no camera data)

components/try-on/
|-- VirtualTryOnModal.tsx            # Main responsive modal / fullscreen container
|-- CameraPermissionUI.tsx          # Permission prompt & instructions
|-- TrackingStatusOverlay.tsx       # Unobtrusive user guidance ("Center face", etc.)
|-- DevDiagnosticsOverlay.tsx       # Real-time developer FPS, latency & pose metrics
|-- FrameSelectorBar.tsx             # Quick frame carousel for switching models
|-- PhotoCaptureModal.tsx            # High-res photo capture & download
+-- AdminCalibratorPage.tsx         # Full developer/admin frame calibration GUI
```

---

## 5. Mathematical Coordinate Transformation

### 5.1 The Coordinate Systems

Four distinct coordinate frames exist in the pipeline:

1. **MediaPipe Normalized Image Space**:
   - $x \in [0, 1]$ (left to right)
   - $y \in [0, 1]$ (top to bottom)
   - $z$: Relative depth scaled by face width

2. **Video Display Frame (CSS Cropped Viewport)**:
   - When the video is rendered with `object-fit: cover`, the displayed video may be cropped horizontally or vertically depending on whether the container aspect ratio ($AR_c = W_c / H_c$) is wider or narrower than the video stream aspect ratio ($AR_v = W_v / H_v$).
   - Video scale: $s = \max(W_c / W_v, H_c / H_v)$
   - Displayed video dimensions: $W_d = W_v \cdot s$, $H_d = H_v \cdot s$
   - Crop offsets: $\Delta x = (W_d - W_c) / 2$, $\Delta y = (H_d - H_c) / 2$

3. **Front-Camera Mirroring**:
   - The user expects the webcam preview to mirror their movements like a real mirror.
   - For visual display, the video element is mirrored via CSS `transform: scaleX(-1)`.
   - To match the mirrored preview, the horizontal landmark position on screen is:
     $$x_{screen} = W_c - (x_{mp} \cdot W_d - \Delta x)$$
   - The vertical position on screen is:
     $$y_{screen} = y_{mp} \cdot H_d - \Delta y$$

4. **Three.js Normalized Device Coordinates (NDC)**:
   $$x_{ndc} = \left(\frac{x_{screen}}{W_c}\right) \cdot 2 - 1$$
   $$y_{ndc} = -\left(\frac{y_{screen}}{H_c}\right) \cdot 2 + 1$$

5. **Three.js 3D World Space**:
   - Using a Three.js `PerspectiveCamera` with vertical field of view $\text{FOV}_y$:
     $$\tan_{\text{half}} = \tan\left(\frac{\text{FOV}_y \cdot \pi}{360}\right)$$
   - At depth $Z_{world} = -Z$:
     $$X_{world} = x_{ndc} \cdot Z \cdot \tan_{\text{half}} \cdot \left(\frac{W_c}{H_c}\right)$$
     $$Y_{world} = y_{ndc} \cdot Z \cdot \tan_{\text{half}}$$

### 5.2 Inter-Pupillary Distance (IPD) & Scale Derivation

The human interpupillary distance (IPD) averages approximately 63 mm. MediaPipe landmark 468 (right pupil) and 473 (left pupil) or eye corner landmarks 33 and 263 provide the distance in image space:

$$\text{Dist}_{eye} = \sqrt{(x_{right} - x_{left})^2 + (y_{right} - y_{left})^2}$$

The 3D scale of the frame is computed dynamically:
$$\text{BaseScale} = \frac{\text{Dist}_{eye}}{\text{ReferenceEyeDist}} \cdot \left(\frac{Z_{ref}}{Z_{current}}\right)$$
$$\text{FinalScale} = \text{BaseScale} \cdot \text{ProductCalibrationMultiplier}$$

---

## 6. Anti-Jitter & Adaptive Smoothing (One-Euro Filter)

Raw video facial landmarks exhibit high-frequency jitter due to sensor noise, compression artifacts, and lighting fluctuations. A naive moving average introduces unacceptable lag during head rotation.

We implement the **One-Euro Filter** (Casiez et al., CHI 2012):
- At low velocities (head stationary), the cutoff frequency decreases to eliminate micro-jitter.
- At high velocities (head turning quickly), the cutoff frequency increases to track motion with zero perceived latency.

$$\alpha = \frac{1}{1 + \frac{\tau}{T_e}}, \quad \tau = \frac{1}{2\pi \cdot f_c}$$
$$f_c = f_{c,\min} + \beta \cdot |\dot{x}|$$

Filter parameters:
- $f_{c,\min} = 1.0\text{ Hz}$ (minimum cutoff frequency for position stability)
- $\beta = 0.007$ (speed coefficient for responsive tracking)
- $f_{c,\text{rate}} = 1.0\text{ Hz}$ (derivative cutoff)

---

## 7. Occlusion & Realistic Attachment

Eyewear temples pass behind the ears and the nose bridge sits on the nasal dorsum. If glasses are rendered purely over the entire face without depth testing, the frame appears to float unnaturally.

The system incorporates an **Invisible Occluder Mesh**:
1. A low-poly 3D head/face geometry aligned with the facial landmarks.
2. Rendered with `colorWrite: false` and `depthWrite: true` into the WebGL depth buffer.
3. When the glasses model is rendered afterward, portions of the temples and nose pads that pass behind the occluder geometry are automatically clipped by GPU depth testing.

---

## 8. Rendering Pipeline & Materials

- **Frame Materials**: Metallic frames utilize Three.js `MeshStandardMaterial` or `MeshPhysicalMaterial` with high metalness ($0.85 - 0.95$), low roughness ($0.15 - 0.3$), and subtle environmental reflection. Acetate frames utilize lower metalness ($0.0 - 0.1$) with higher clearcoat.
- **Lens Materials**: Transparent `MeshPhysicalMaterial` with:
  - Transmission: $0.85 - 0.95$
  - Roughness: $0.05$
  - IOR (Index of Refraction): $1.52$ (standard optical crown glass / CR-39)
  - Subtle anti-reflective coating tint (violet/green specular reflections)
- **Lighting**:
  - Balanced Three.js `AmbientLight` (intensity $0.6$) for base visibility
  - Key `DirectionalLight` (intensity $0.8$, positioned top-front)
  - Subtle `PointLight` for specular catchlights in the lenses.

---

## 9. Error Recovery & Lifecycle Management

- **Camera Permissions**: Graceful fallback UI with step-by-step unblocking guide for iOS Safari and Chrome.
- **WebGL Context Loss**: Listens for `webglcontextlost` and `webglcontextrestored`, re-instantiating textures and buffers cleanly.
- **Lifecycle Cleanup**: Explicit disposal of Three.js scenes, geometries, materials, textures, WebGL renderers, and `MediaStreamTrack.stop()` calls upon modal dismissal.
