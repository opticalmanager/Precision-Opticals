# Try-On Performance & Optimization Plan

## 1. Quantitative Performance Targets

| Metric | Target (High-End / Desktop) | Target (Mid-Tier Mobile) | Minimum Acceptable (Low-End) |
| :--- | :--- | :--- | :--- |
| **WebGL Render FPS** | 60 FPS | 60 FPS | 30 FPS |
| **Vision Tracking Rate** | 30 FPS | 24–30 FPS | 18–20 FPS |
| **Tracking-to-Render Latency** | < 35 ms | < 50 ms | < 75 ms |
| **Model Load Time (Cached)** | < 150 ms | < 250 ms | < 400 ms |
| **Model Load Time (Network)** | < 1.2 s (Fast 4G) | < 2.0 s (4G) | < 3.5 s (3G) |
| **Peak Memory Footprint** | < 80 MB | < 60 MB | < 45 MB |
| **Camera Startup Time** | < 600 ms | < 900 ms | < 1500 ms |

---

## 2. Decoupled Vision and Render Pipeline

Executing MediaPipe Face Landmarker on every single display refresh frame (60 Hz) creates unnecessary CPU/GPU contention and causes thermal throttling on mobile devices.

```text
Time (ms)  0    16.6   33.3   50.0   66.6   83.3   100.0
Render:   [R0]  [R1]   [R2]   [R3]   [R4]   [R5]   [R6]   (60 FPS continuous)
Vision:   [V0]         [V1]          [V2]                 (25-30 FPS gated)
Interpol:  |----->|----->|----->|----->|----->|----->|     (Slerp & Lerp)
```

1. **Render Loop (`requestAnimationFrame`)**:
   - Executes at native screen refresh rate (60 Hz or 120 Hz ProMotion).
   - Interpolates smoothly between the last two known tracking states using spherical linear interpolation (`slerp`) for rotation quaternions and linear interpolation (`lerp`) for 3D coordinates.
   - Updates lighting and renders Three.js scene to the canvas.

2. **Vision Loop**:
   - Gated to ~30 FPS (target interval ~33ms).
   - MediaPipe `detectForVideo` processes current video frame without blocking the UI.
   - When new landmark data is ready, updates target transform vectors for the One-Euro filter.

---

## 3. Zero-Copy Video Pipeline

Conventional AR approaches copy the video frame into a WebGL texture (`gl.texImage2D(video)`) on every frame to render it inside the 3D scene. This incurs:
- High CPU/GPU memory bandwidth overhead (~12 MB/s for 720p at 30 FPS).
- Battery drain and severe thermal throttling on mobile Safari and Chrome.

**Precision Optics Solution**:
- The `<video>` element is rendered natively by the browser's hardware video decoder as a background layer (`position: absolute; inset: 0; object-fit: cover`).
- The WebGL `<canvas>` sits directly above the video with `alpha: true`.
- Zero texture upload is performed during normal tracking.
- Video frame texture upload is only performed if and when the user clicks **Take Photo**, capturing a single composited snapshot.

---

## 4. Asset Compression & Budget

- **Eyewear GLB Asset Budget**: Maximum 2.0 MB per model (Target < 1.0 MB).
- **Polygon Limit**: 15,000 to 25,000 triangles per eyewear frame.
- **Texture Resolutions**:
  - Base Color / Normal / Roughness: 1024x1024 max.
  - Lens textures: Procedural physical materials (zero texture size).
- **DRACO Compression**: Compresses geometry by 70–85% for fast network transfer.
- **Meshopt Compression**: Rapid WebAssembly decompression with zero runtime GC overhead.

---

## 5. Memory Management & Zero-Leak Protocol

### 5.1 Three.js Resource Disposal
Whenever a model is swapped or the Try-On modal closes:
1. Traverse the eyewear object hierarchy:
   ```typescript
   eyewearGroup.traverse((child) => {
     if (child instanceof THREE.Mesh) {
       child.geometry.dispose();
       if (Array.isArray(child.material)) {
         child.material.forEach((m) => m.dispose());
       } else if (child.material) {
         child.material.dispose();
       }
     }
   });
   ```
2. When closing Try-On:
   - Call `renderer.dispose()`.
   - Force WebGL context clean release: `renderer.forceContextLoss()`.
   - Remove `<canvas>` DOM element.

### 5.2 Camera Stream Disposal
```typescript
if (mediaStream) {
  mediaStream.getTracks().forEach((track) => {
    track.stop();
    mediaStream.removeTrack(track);
  });
  mediaStream = null;
}
```

---

## 6. Battery & Thermal Management

1. **Page Visibility Listener**:
   ```typescript
   document.addEventListener('visibilitychange', () => {
     if (document.hidden) {
       // Pause requestAnimationFrame render loop
       // Pause MediaPipe detection loop
     } else {
       // Resume loop seamlessly
     }
   });
   ```
2. **Thermal Dropdown**:
   - If average frame processing time exceeds 40ms over a 3-second window:
     - Step 1: Reduce MediaPipe detection rate from 30 FPS to 20 FPS.
     - Step 2: Disable soft specular highlights.
     - Step 3: Disable 3D occlusion mask depth pass.

---

## 7. Caching Architecture

1. **Browser Cache**: Static GLB assets served with HTTP headers:
   `Cache-Control: public, max-age=31536000, immutable`
2. **In-Memory LRU Cache (`ModelCache.ts`)**:
   - Keeps up to 5 parsed Three.js models in memory for instantaneous switching between frames.
   - Automatically evicts least-recently-used models when threshold is reached.
