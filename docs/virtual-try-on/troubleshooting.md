# Virtual Try-On Troubleshooting Guide

## Common Issues & Resolutions

### 1. Camera Access Denied
- **Symptom**: User sees permission error screen.
- **Cause**: Browser or OS blocked camera access.
- **Resolution**:
  - Desktop Chrome: Click the tune/camera icon left of URL in address bar, toggle Camera to Allow, reload.
  - iOS Safari: Go to iOS Settings > Safari > Camera > Allow.
  - Ensure site is served over HTTPS (or `localhost` during development).

### 2. Glasses Not Visible on Face
- **Check 1**: Is product configured with valid `.glb` model? Verify `hasTryOnModel(product)` returns true.
- **Check 2**: Is face detected? Check tracking status chip or open developer HUD (`DevDiagnosticsOverlay`).
- **Check 3**: WebGL errors in console? Check if model failed to load due to CORS or incorrect file path.

### 3. Jitter or Shaking
- **Resolution**: The One-Euro Filter is enabled by default (`SmoothingEngine.ts`). In developer HUD, verify smoothing is toggled ON. Ensure the user is not in extreme low light where MediaPipe landmark detection confidence drops significantly.

### 4. Frame Mirrored Incorrectly
- **Resolution**: The front-facing webcam preview is mirrored via CSS `transform: scaleX(-1)`. The `VideoToRenderCoordinateMapper` handles this inversion mathematically so that tilting left matches user's physical left.
