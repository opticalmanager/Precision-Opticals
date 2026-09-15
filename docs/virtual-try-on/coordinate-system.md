# Coordinate System & Mathematical Transformation

## 1. Coordinate Frames
- **MediaPipe Normalized Space**: Origin at top-left $(0, 0)$, bottom-right $(1, 1)$, normalized by native video stream resolution.
- **HTML5 Video Crop**: Responsive `object-fit: cover` introduces horizontal or vertical cropping offsets $(\Delta x, \Delta y)$ when container aspect ratio differs from video aspect ratio.
- **Mirrored Preview**: Front camera selfie view mirrors horizontal axis via CSS `-scaleX(1)`. The screen mapping inverts $X$:
  $$x_{screen} = W_{container} - (x_{mp} \cdot W_{displayed} - \Delta x)$$
- **Three.js Normalized Device Coordinates (NDC)**:
  $$x_{ndc} = (x_{screen} / W_{container}) \cdot 2 - 1$$
  $$y_{ndc} = -(y_{screen} / H_{container}) \cdot 2 + 1$$
- **Three.js 3D World Space**:
  At depth $Z$:
  $$X_{world} = x_{ndc} \cdot |Z| \cdot \tan(\text{FOV}_y / 2) \cdot \text{Aspect}$$
  $$Y_{world} = y_{ndc} \cdot |Z| \cdot \tan(\text{FOV}_y / 2)$$

## 2. Head Rotation (Euler Angles)
- **Pitch**: Head nodding up/down (-X axis).
- **Yaw**: Head turning left/right (+Y axis).
- **Roll**: Head tilting ear-to-shoulder (-Z axis).
Euler rotation order `YXZ` is used to prevent gimbal lock during standard human head movements.
