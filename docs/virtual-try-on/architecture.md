# Virtual Try-On Architecture Guide

## Overview
The Precision Optics Virtual Try-On (VTO) engine is a client-side augmented reality pipeline designed for real-time 3D eyewear rendering with zero latency, high-fidelity physical materials, and strict privacy protection.

## Component Stack
- **Camera Capture**: `MediaDevices.getUserMedia()` with 720p adaptive front-facing constraints (`CameraManager.ts`).
- **Computer Vision**: Google MediaPipe Face Landmarker WebAssembly engine (`FaceLandmarkerService.ts`).
- **Head Pose Estimation**: Transformation matrix decomposition and anatomical trigonometry (`FacePoseEstimator.ts`).
- **Anti-Jitter Filtering**: Speed-adaptive One-Euro Filter (`SmoothingEngine.ts`, `OneEuroFilter.ts`).
- **Optical Calibration**: Physical IPD-to-scale calibration and frame offsets (`FrameCalibration.ts`, `ScaleCalibration.ts`).
- **3D Graphics Engine**: Three.js WebGL Renderer with PBR physical materials (`ThreeRenderer.ts`).
- **Occlusion**: Invisible 3D depth mask clipping temples and nose pads (`OcclusionManager.ts`).
- **Asset Management**: LRU in-memory model caching with Draco decompression (`ModelLoader.ts`, `ModelCache.ts`).
