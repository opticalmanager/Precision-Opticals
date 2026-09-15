# Precision Optics — Virtual Try-On Accuracy Audit & Diagnostic Report

**Document Date:** September 16, 2026  
**Subject:** Mathematical, Architectural, and Photogrammetric Audit of Eyewear WebAR Pipeline  
**Target File:** `TRY_ON_ACCURACY_AUDIT.md`

---

## 1. Executive Summary

This diagnostic audit evaluates the active WebAR 3D Virtual Try-On pipeline in `Precision Optics`. The investigation traced the complete data flow from the hardware camera sensor to the final WebGL screen rasterization:

Camera -> Video Element -> MediaPipe WASM -> Landmarks / Matrix -> Pose Estimator -> Coordinate Mapper -> Calibration -> Smoothing -> Three.js Scenegraph -> WebGL Canvas

The audit has identified **six fundamental mathematical and architectural defects** in the current implementation that directly cause all ten symptoms reported (undersized frame, unnatural distance scaling, floating/detachment, yaw sluggishness, lag, and poor anatomical fitting).

---

## 2. Current Architecture & Data Flow

1. Browser Webcam / Sensor:
   Resolution: 1280x720 (16:9 landscape) or 720x1280 (9:16 portrait) via CameraManager.

2. HTML5 Video Element:
   CSS: object-fit: cover, transform: -scale-x-100 (mirrored preview).
   Container: dynamic responsive aspect ratio (e.g. 800x500 = 1.6 on desktop, 390x844 = 0.46 on mobile).

3. MediaPipe Face Landmarker (Tasks-Vision 0.10.21):
   Input: Raw un-mirrored video buffer.
   Outputs:
   - faceLandmarks: 478 normalized points (x in [0,1], y in [0,1], z relative)
   - facialTransformationMatrixes: 4x4 matrix (column-major, metric cm space)

4. FacePoseEstimator:
   - calculateInterEyeDistance(rightPupil, leftPupil)
   - computeBaseScale(interEyeDist, faceWidth)
   - computeDynamicDepthZ(interEyeDist, 45)
   - coordMapper.mapNormalizedTo3D(sellion.x, sellion.y, depthZ)
   - Matrix decomposition -> Euler -> mirror flip -> Quaternion

5. SmoothingEngine:
   - Vector3Filter (OneEuro) on Position
   - Adaptive Quaternion SLERP on Rotation
   - OneEuroFilter on Scale

6. FrameCalibration:
   - Multiplies scale by scaleMultiplier
   - Adds local X, Y, Z translation and Euler offsets

7. EyewearModelManager / OcclusionManager:
   - EyewearRoot.position.set(calibrated.position)
   - EyewearRoot.quaternion.set(calibrated.quaternion)
   - EyewearRoot.scale.set(calibrated.scale)

8. Three.js WebGLRenderer:
   Camera: PerspectiveCamera(fov: 45, aspect: containerW / containerH)
   Renderer: tonemapping = ACESFilmic, exposure = 0.95, alpha = true

---

## 3. Coordinate System Definitions & Mismatches

- MediaPipe Image: Origin at Top-Left of uncropped video; +X Right, +Y Down; Normalized [0, 1].
- MediaPipe Metric Camera: Origin at Optical center of sensor; +X Camera Right, +Y Camera Down, +Z Forward (into scene); Units: Centimeters.
- Screen Pixels: Origin at Top-Left of modal container; +X Screen Right, +Y Screen Down; Units: CSS Pixels.
- Three.js NDC: Origin at Center of canvas; +X Screen Right, +Y Screen Up, +Z Into screen; Units: [-1, +1].
- Three.js World Camera: Origin at Camera node (0,0,0); +X Right, +Y Up, -Z Forward (away from camera towards user); Units: Meters.
- Normalized GLB Frame: Origin at Nasal Bridge optical center; +X Model Left, +Y Model Top, +Z Forward (towards camera); Units: Meters.

Basis Conflict:
In MediaPipe metric space, +Y is DOWNWARD and +Z is FORWARD (into scene).
In Three.js world space, +Y is UPWARD and -Z is FORWARD (into scene).
Any rotation or translation without explicit change-of-basis causes pitch and yaw to invert or fight the translation vector.

---

## 4. Optical Analysis & Root Causes of Identified Defects

### Bug 1: Scale & Distance Perspective Double-Counting
In pinhole camera perspective projection, an object of real physical width W = 0.14m placed at distance Z automatically projects onto the viewport according to:
w_screen = W / (|Z| * 2 * tan(fov_x / 2)) * W_viewport
When the user moves closer to the camera:
1. |Z| naturally decreases, which ALREADY increases w_screen in the Three.js perspective camera.
2. But the current implementation simultaneously calculated:
   scale = interEyeDist / REFERENCE_EYE_DISTANCE_NORM
   and assigned container.scale.set(scale, scale, scale).
3. Double-Scaling: The model was magnified by the scale multiplier in 3D world space AND magnified by perspective division by Z.
4. When moving farther away, the opposite occurred: the model shrank twice as fast, quickly becoming tiny.

### Bug 2: Missing Aspect Ratio in Depth Calculation
The calculation in computeDynamicDepthZ was:
Z_est = -IPD_meters / (2 * d_norm * tan(fov_y / 2))
In Three.js, PerspectiveCamera(cameraFov, aspect) interprets cameraFov as the VERTICAL field of view (fov_y = 45 deg).
However, d_norm (inter-pupillary distance) is measured HORIZONTALLY along the X-axis!
The horizontal field of view is:
tan(fov_x / 2) = aspect * tan(fov_y / 2)
For standard desktop viewports (aspect ~ 1.6 - 1.777), omitting aspect caused tan(fov / 2) to be underestimated by 1.7x, causing calculated depth Z to be 1.7x too far away (placing the glasses at -0.75m to -0.85m instead of -0.45m to -0.52m).
At 1.7x distance, the rendered glasses appeared roughly 58% of their intended size on screen!

### Bug 3: Anisotropic Distance in Image Coordinates
MediaPipe normalized coordinates x, y in [0, 1] span the raw video width (1280px) and height (720px).
The Euclidean calculation:
dist = sqrt((x2 - x1)^2 + (y2 - y1)^2)
treats 10% horizontal distance (128px) and 10% vertical distance (72px) as equal. When the user tilts their head (roll), the measured Euclidean distance in normalized coordinate space fluctuates by up to 77%, causing the glasses to visibly shrink and expand as the head tilts.

### Bug 4: Video Aspect Ratio Crop Disconnect
The video element is rendered with object-fit: cover.
When displayed on tall mobile screens or responsive desktop containers:
- Parts of the camera frame are cropped off-screen (cropOffsetX, cropOffsetY).
- mapNormalizedTo3D mapped the position, but the inter-eye distance passed to computeBaseScale was raw uncropped video normalized fraction, completely ignoring the object-fit: cover scale factor.
- On mobile devices, this caused the frame to become severely undersized because interEyeDist was not scaled by the cover crop factor.

### Bug 5: Floating in Front of Face / Displaced Pivot
The anchor point in ModelLoader.ts:
const frontZ = finalBox.max.z;
rawObject.position.set(-finalCenter.x, -bridgeY, -frontZ);
anchors the model at the very front-most surface of the frame (Z = 0), with temples extending to -0.14m.
When FacePoseEstimator assigned position = mapNormalizedTo3D(sellion.x, sellion.y, depthZ):
- The nose bridge sellion landmark sits on the human skin surface.
- Placing the front lens rim at the skin surface means the frame rims sit at Z_skin, but real glasses rest with nose pads on the sellion and the lenses floating 12mm - 15mm in front of the cornea.
- Conversely, if depth Z was placed too far forward, the entire frame appeared detached and hovering in empty air.

### Bug 6: Euler Extraction Gimbal Lock & Mirror Inversion Asymmetry
When decomposing the MediaPipe matrix, converting to Euler angles (setFromRotationMatrix(matrix, 'YXZ')), flipping signs manually (yaw = -euler.y, roll = euler.z), and reconstructing a quaternion (setFromEuler), any extreme yaw or pitch causes angle cross-coupling and gimbal lock.
Furthermore, during mirroring (selfie mode), transforming a 3D rotation requires negating the reflection axis, not arbitrary angle sign flips.

---

## 5. GLB Model Inspection Findings

Using the dedicated developer inspection script on the active models in D:\Downloads\glasses-1:

- glasses-5b.glb (Gucci):
  Raw Dimensions: 0.1369m x 0.0428m x 0.1421m
  Normalized (140mm): 140.0mm x 43.7mm x 145.3mm
  Front Z: [+0.054, +0.065]
  Temple Z: [-0.076, +0.058]
  Status: Modeled in meters; pristine scale.

- glasses-1-.glb (Ray-Ban):
  Raw Dimensions: 1.5578m x 0.4065m x 1.4257m
  Normalized (140mm): 140.0mm x 36.5mm x 128.1mm
  Front Z: [+0.644, +0.703]
  Temple Z: [-0.709, -0.092]
  Status: Modeled in decimeters; 10x raw scale.

- glasses-10.glb:
  Raw Dimensions: 0.5647m x 0.1693m x 0.5461m
  Normalized (140mm): 140.0mm x 42.0mm x 135.4mm
  Front Z: [-0.018, +0.075]
  Temple Z: [+0.075, +0.527]
  Status: Inverted Z-axis; requires 180 deg flip.

Key Takeaway: Raw GLBs arrive with disparate unit conventions (meters, decimeters, centimeters) and inconsistent Z-axis directions. Normalization must enforce:
1. Target frame width = 0.140m (standard adult optical frame: 140mm).
2. Optical pivot = Nasal bridge contact point (X = 0, Y = bridge height, Z = vertex contact point).
3. Temples extending strictly along -Z (into face).

---

## 6. Mathematical Solution Blueprint

### 6.1. Correct Metric Depth Extraction
Let IPD_metric = 0.063m (63mm adult human average).
Let delta_x_screen be the pixel distance between left and right pupils on the displayed canvas.
Let W_canvas and H_canvas be canvas dimensions.
Let fov_y be the vertical FOV of the Three.js PerspectiveCamera.
The focal length in vertical pixels is:
f_y = H_canvas / (2 * tan(fov_y / 2))
The true distance Z_face from the camera to the inter-pupillary line is:
Z_face = -(0.063 * W_canvas) / (2 * delta_x_screen * tan(fov_y / 2) * (W_canvas / H_canvas))
       = -(0.063 * H_canvas) / (2 * delta_x_screen * tan(fov_y / 2)) * aspect_correction

This formula:
- Correctly scales with distance (closer = smaller |Z|; farther = larger |Z|).
- Eliminates camera aspect ratio distortion.
- Operates in true metric space (meters).

### 6.2. 3D Model Scale
Because the GLB model is normalized to a real-world physical frame width (140mm = 0.140m), and Three.js units represent meters:
Base Scale = 1.0
The perspective camera handles distance scaling automatically and photometrically.
The only scaling applied is the per-product physical frame adjustment:
Final Scale = (ProductFrameWidth_mm / 140.0mm) * scaleMultiplier

### 6.3. Anatomical Bridge Alignment & Vertex Offset
Real eyewear sits with the nasal pads on the nose bridge and the lenses approximately 12mm - 14mm in front of the cornea:
P_eyewear = P_sellion + R_face * [0, Delta_Y_bridge, Delta_Z_vertex]^T
where Delta_Z_vertex = +0.010m prevents the frame from penetrating the nose or floating unnaturally forward.

### 6.4. Direct Quaternion Transformation & Change-of-Basis
Transform the face transformation matrix directly into a Three.js Quaternion:
1. Apply change-of-basis C = diag(1, -1, -1, 1) to convert from MediaPipe camera space to OpenGL camera space.
2. In mirrored mode, reflect across the YZ plane:
   Q_mirrored = (q_x, -q_y, -q_z, q_w)
3. Directly apply Q_mirrored to EyewearModelManager container without lossy Euler intermediate steps.

---

## 7. Verification & Acceptance Targets

- Resting Fit: Frame sits on nasal bridge, optical centers aligned with pupils.
- Distance Scaling: Frame width maintains constant physical proportion to face from 40cm to 120cm.
- Yaw Tracking: Temples follow head turn up to 45 deg left/right without disconnecting.
- Pitch Tracking: Frame tilts synchronously when nodding up/down.
- Latency: Motion-to-photon tracking latency < 25ms.
- Frame Rate: >= 55 FPS on desktop, >= 30 FPS on mobile.
- Depth Believability: Zero floating; lenses sit 12mm in front of eyes.
