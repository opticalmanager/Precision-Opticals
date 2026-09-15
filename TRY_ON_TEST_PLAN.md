# Try-On Test Plan: Automated Tests & Comprehensive AR Matrix

## 1. Automated Unit Tests

Automated tests reside in `__tests__/try-on/` and validate the mathematical engines in isolation without requiring active camera hardware.

### 1.1 Coordinate Transformation Tests (`__tests__/try-on/CoordinateMapper.test.ts`)
- **Test 1: Identical Aspect Ratio (16:9 to 16:9)**: Verifies that $(0.5, 0.5)$ normalized landmark maps to $(0, 0)$ NDC without offset.
- **Test 2: Video Cropped Horizontally (Tall Container, e.g. Mobile 9:19.5)**: Verifies horizontal crop calculation $\Delta x$ and that centered landmarks remain at NDC $x = 0$.
- **Test 3: Video Cropped Vertically (Wide Container, e.g. Ultrawide 21:9)**: Verifies vertical crop calculation $\Delta y$ and that eye landmarks remain vertically aligned.
- **Test 4: Front-Camera Mirroring Inversion**: Verifies that when `mirrored: true`, landmark at $x_{mp} = 0.2$ maps to NDC $x > 0$ matching CSS `-scaleX(1)`.

### 1.2 One-Euro Filter Tests (`__tests__/try-on/OneEuroFilter.test.ts`)
- **Test 1: Jitter Attenuation on Stationary Input**: Feeds high-frequency simulated noise ($\pm 0.005$) around constant position $1.0$. Verifies variance is reduced by $\ge 85\%$.
- **Test 2: Fast Step Response**: Feeds sudden jump from $0.0$ to $1.0$. Verifies that within 3 frames, value reaches $\ge 0.90$ with zero overshoot.
- **Test 3: Quaternion Filtering**: Verifies unit-quaternion normalization is preserved after filtering.

### 1.3 Scale Calibration Tests (`__tests__/try-on/ScaleCalibration.test.ts`)
- **Test 1: IPD Calculation**: Verifies Euclidean distance between landmark 468 and 473.
- **Test 2: Distance Scaling**: Verifies that as face gets closer (inter-eye distance doubles), calculated scale factor doubles proportionally.
- **Test 3: Product Multiplier**: Verifies that custom calibration multiplier (e.g. 1.05x) is applied faithfully.

### 1.4 Face Quality Assessor Tests (`__tests__/try-on/FaceQuality.test.ts`)
- **Test 1: Head Turned Beyond 55°**: Detects extreme yaw angle; transitions status to `LOW_CONFIDENCE` with appropriate user guidance.
- **Test 2: Face Boundary Clipping**: Detects landmarks exceeding visible frame boundary $[0.05, 0.95]$; flags `isCentered: false`.
- **Test 3: Tracking Loss Transition**: Verifies graceful decay state without NaN values.

---

## 2. Integration & Component Tests

### 2.1 Lifecycle Tests (`__tests__/try-on/Lifecycle.test.tsx`)
- **Test 1: Camera Cleanup**: Opens modal, mock-streams video, unmounts modal. Verifies `track.stop()` is invoked on all video tracks.
- **Test 2: Renderer Disposal**: Verifies WebGL context, geometries, and materials are disposed cleanly.
- **Test 3: Product Hot-Swapping**: Changes `product` prop while camera is active. Verifies camera remains streaming and new model is requested.
- **Test 4: WebGL Context Loss Recovery**: Simulates `webglcontextlost` event; verifies engine gracefully attempts restoration without unhandled crash.

---

## 3. Manual AR Verification Matrix

### 3.1 Head Movement & Pose Tracking Matrix
| Test Case | Procedure | Expected Behavior |
| :--- | :--- | :--- |
| **TC-01: Neutral Front** | User looks directly at webcam | Glasses sit squarely on nose bridge; eye pupils centered in lenses. |
| **TC-02: Yaw Left (0° to 45°)** | Slow head turn to left | Left temple recedes, right temple extends in perspective; bridge stays on nose. |
| **TC-03: Yaw Right (0° to 45°)** | Slow head turn to right | Right temple recedes; perspective shifts accurately. |
| **TC-04: Pitch Down (0° to 30°)** | Nod head forward | Top rim tilts forward; nose bridge stays anchored; no floating. |
| **TC-05: Pitch Up (0° to 30°)** | Tilt head back | Underside of bridge and lower rims visible; stays anchored. |
| **TC-06: Roll / Tilt (0° to 35°)** | Tilt head toward left/right shoulder | Glasses roll with head angle with zero delay or inverse inversion. |
| **TC-07: Forward Translation** | Move face from 70cm to 30cm from camera | Frame smoothly grows in scale matching head size; no sudden jumps. |
| **TC-08: Backward Translation** | Move face from 30cm to 100cm from camera | Frame smoothly shrinks; tracking remains locked. |
| **TC-09: Fast Shake** | Quick head shaking | No detachment, floating, or delayed rubber-banding. |

### 3.2 Environmental & Demographic Lighting Matrix
| Test Case | Scenario | Expected Behavior |
| :--- | :--- | :--- |
| **TC-10: Bright Daylight** | Natural window daylight | Frame highlights render naturally; no overexposure blowout. |
| **TC-11: Warm Indoor** | 2700K warm incandescent lighting | Frame reflects warm tones; metallic gold looks authentic. |
| **TC-12: Low Light** | Dim room (< 50 lux) | Smoothing increases; unobtrusive "Move into better light" badge appears if confidence falls. |
| **TC-13: Backlit Room** | Bright window behind user's head | Face detector remains locked; frame remains visible. |
| **TC-14: Diverse Facial Features** | High cheekbones, wide nose bridges, beards, hairstyles | Landmarks lock to facial bones accurately across all skin tones and shapes. |

### 3.3 Device & Browser Compatibility Matrix
| Platform | Browser | Minimum Spec | Test Focus |
| :--- | :--- | :--- | :--- |
| **iOS** | Mobile Safari | iOS 16+ (iPhone 11 to iPhone 16) | Fullscreen camera, touch responsiveness, orientation change. |
| **iOS** | Chrome iOS | iOS 16+ | WKWebView permissions, video stream stability. |
| **Android** | Chrome Mobile | Android 11+ (Snapdragon / Exynos / Tensor) | 60 FPS WebGL rendering, front-camera mirroring. |
| **Android** | Samsung Internet | Android 11+ | Fullscreen modal layout, WebAssembly execution. |
| **macOS** | Safari / Chrome | macOS Sonoma / Sequoia | High-res 1080p webcam, window resize. |
| **Windows** | Chrome / Edge | Windows 10 / 11 | DirectShow webcam, high DPI displays. |

---

## 4. Failure Mode Recovery Matrix

| Failure Scenario | Engine Action | User-Facing UI |
| :--- | :--- | :--- |
| **Camera Permission Denied** | Catches `NotAllowedError` | Displays step-by-step browser camera permission unlock guide with retry button. |
| **Camera in Use by Another App** | Catches `NotReadableError` | "Camera is currently in use by another application. Please close it and retry." |
| **No Camera Detected** | Catches `NotFoundError` | "No camera detected on your device." Allows selecting high-res model presets. |
| **Face Leaves Frame** | Detection returns zero landmarks | Glasses smoothly freeze for 400ms and fade out; shows "Position your face in the frame". |
| **Extreme Head Angle (>60°)** | `FaceQualityAssessor` flags boundary | Glasses remain smoothly locked to last valid pose; shows "Please face the camera directly". |
| **Model Download Failure** | Catches network error on GLB fetch | Seamlessly falls back to canonical local fallback model; notifies user gently via Sonner toast. |
| **WebGL Context Lost** | Catches `webglcontextlost` event | Prevents crash; attempts context restoration when GPU returns. |
