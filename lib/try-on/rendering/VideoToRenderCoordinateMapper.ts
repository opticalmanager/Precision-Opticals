/**
 * VideoToRenderCoordinateMapper
 * Mathematically synchronizes:
 * 1. Physical camera sensor intrinsics K & MediaPipe's internal 63.0 deg virtual frustum
 * 2. CSS `object-fit: cover` aspect ratio crop factors (etaX, etaY)
 * 3. Front-camera horizontal mirroring (`transform: scaleX(-1)`)
 * 4. Three.js PerspectiveCamera projection matrix with sub-pixel alignment
 */

import * as THREE from "three";

export interface CameraIntrinsicConfig {
  /** Native uncropped video buffer width in pixels (e.g. 1280) */
  videoWidth: number;
  /** Native uncropped video buffer height in pixels (e.g. 720) */
  videoHeight: number;
  /** Responsive DOM container width in CSS pixels (e.g. 800 or 390) */
  containerWidth: number;
  /** Responsive DOM container height in CSS pixels (e.g. 500 or 844) */
  containerHeight: number;
  /**
   * Vertical field of view of the physical/virtual camera in degrees.
   * MediaPipe's internal ScreenToMetricSpaceConverter uses 63.0 degrees.
   */
  verticalFovDeg?: number;
  cameraFovDeg?: number;
  /** Normalized principal point u in [0, 1] (default 0.5) */
  principalPointU?: number;
  /** Normalized principal point v in [0, 1] (default 0.5) */
  principalPointV?: number;
  /** Near clipping plane in meters (default 0.01m = 1cm) */
  near?: number;
  /** Far clipping plane in meters (default 20.0m) */
  far?: number;
  /** Whether the video element is mirrored via CSS scaleX(-1) */
  isMirrored?: boolean;
  mirrored?: boolean;
}

export interface CoverCropMetrics {
  videoAspect: number;
  containerAspect: number;
  /** Visible fraction of video width in (0, 1] */
  etaX: number;
  /** Visible fraction of video height in (0, 1] */
  etaY: number;
  /** Effective vertical FOV of the cropped container in degrees */
  effectiveVerticalFovDeg: number;
  /** Tangent of half of the uncropped camera vertical FOV */
  tanHalfFovY: number;
  /** Ratio tan(31.5 deg) / tan(verticalFovDeg / 2) for rescaling MediaPipe Z */
  mediaPipeFovScaleFactor: number;
}

export interface ViewportConfig extends CameraIntrinsicConfig {}

const MEDIAPIPE_INTERNAL_VFOV_DEG = 63.0;
const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;
const TAN_HALF_MEDIAPIPE_VFOV = Math.tan(0.5 * MEDIAPIPE_INTERNAL_VFOV_DEG * DEG_TO_RAD); // ~0.6128008

export class VideoToRenderCoordinateMapper {
  private config: Required<CameraIntrinsicConfig>;
  private metrics: CoverCropMetrics;

  // Cached layout transforms for backward compatibility
  private scale = 1.0;
  private displayedW = 1;
  private displayedH = 1;
  private cropOffsetX = 0;
  private cropOffsetY = 0;

  constructor(initialConfig?: Partial<CameraIntrinsicConfig>) {
    const vFov = initialConfig?.verticalFovDeg ?? initialConfig?.cameraFovDeg ?? MEDIAPIPE_INTERNAL_VFOV_DEG;
    const isMirr = initialConfig?.isMirrored ?? initialConfig?.mirrored ?? true;

    this.config = {
      videoWidth: initialConfig?.videoWidth ?? 1280,
      videoHeight: initialConfig?.videoHeight ?? 720,
      containerWidth: initialConfig?.containerWidth ?? 800,
      containerHeight: initialConfig?.containerHeight ?? 500,
      verticalFovDeg: vFov,
      cameraFovDeg: vFov,
      principalPointU: initialConfig?.principalPointU ?? 0.5,
      principalPointV: initialConfig?.principalPointV ?? 0.5,
      near: initialConfig?.near ?? 0.01,
      far: initialConfig?.far ?? 20.0,
      isMirrored: isMirr,
      mirrored: isMirr,
    };
    this.metrics = this.computeMetrics();
    this.recalculateLegacy();
  }

  /**
   * Attempts to infer physical camera vertical FOV from WebRTC MediaStreamTrack capabilities/label;
   * falls back to MediaPipe's internal 63.0 deg.
   */
  public static inferCameraVerticalFovDeg(
    stream: MediaStream | null,
    videoWidth: number,
    videoHeight: number
  ): number {
    if (!stream) return MEDIAPIPE_INTERNAL_VFOV_DEG;
    const track = stream.getVideoTracks()[0];
    if (!track) return MEDIAPIPE_INTERNAL_VFOV_DEG;

    const label = (track.label || "").toLowerCase();
    const isPortraitSensor = videoHeight > videoWidth;

    if (label.includes("facetime") || label.includes("built-in")) {
      return isPortraitSensor ? 63.0 : 54.0;
    }
    if (label.includes("logitech") || label.includes("brio") || label.includes("c920")) {
      return 56.0;
    }
    return isPortraitSensor ? 64.0 : 60.0;
  }

  public updateDimensions(
    videoWidth: number,
    videoHeight: number,
    containerWidth: number,
    containerHeight: number,
    verticalFovDeg?: number
  ): CoverCropMetrics {
    this.config.videoWidth = Math.max(1, videoWidth);
    this.config.videoHeight = Math.max(1, videoHeight);
    this.config.containerWidth = Math.max(1, containerWidth);
    this.config.containerHeight = Math.max(1, containerHeight);
    if (verticalFovDeg !== undefined && verticalFovDeg > 20 && verticalFovDeg < 110) {
      this.config.verticalFovDeg = verticalFovDeg;
      this.config.cameraFovDeg = verticalFovDeg;
    }
    this.metrics = this.computeMetrics();
    this.recalculateLegacy();
    return this.metrics;
  }

  public updateViewport(config: Partial<ViewportConfig>): void {
    const vFov = config.verticalFovDeg ?? config.cameraFovDeg ?? this.config.verticalFovDeg;
    const isMirr = config.isMirrored ?? config.mirrored ?? this.config.isMirrored;

    this.config.videoWidth = Math.max(1, config.videoWidth ?? this.config.videoWidth);
    this.config.videoHeight = Math.max(1, config.videoHeight ?? this.config.videoHeight);
    this.config.containerWidth = Math.max(1, config.containerWidth ?? this.config.containerWidth);
    this.config.containerHeight = Math.max(1, config.containerHeight ?? this.config.containerHeight);
    this.config.verticalFovDeg = vFov;
    this.config.cameraFovDeg = vFov;
    this.config.isMirrored = isMirr;
    this.config.mirrored = isMirr;

    this.metrics = this.computeMetrics();
    this.recalculateLegacy();
  }

  private computeMetrics(): CoverCropMetrics {
    const videoAspect = this.config.videoWidth / this.config.videoHeight;
    const containerAspect = this.config.containerWidth / this.config.containerHeight;

    // Under CSS object-fit: cover:
    // If containerAspect < videoAspect, left/right edges are cropped (etaX < 1, etaY = 1).
    // If containerAspect > videoAspect, top/bottom edges are cropped (etaX = 1, etaY < 1).
    const etaX = Math.min(1.0, containerAspect / videoAspect);
    const etaY = Math.min(1.0, videoAspect / containerAspect);

    const tanHalfFovY = Math.tan(0.5 * this.config.verticalFovDeg * DEG_TO_RAD);
    const effectiveTanHalfFovY = etaY * tanHalfFovY;
    const effectiveVerticalFovDeg = 2.0 * Math.atan(effectiveTanHalfFovY) * RAD_TO_DEG;

    const mediaPipeFovScaleFactor = TAN_HALF_MEDIAPIPE_VFOV / tanHalfFovY;

    return {
      videoAspect,
      containerAspect,
      etaX,
      etaY,
      effectiveVerticalFovDeg,
      tanHalfFovY,
      mediaPipeFovScaleFactor,
    };
  }

  private recalculateLegacy(): void {
    const scaleX = this.config.containerWidth / this.config.videoWidth;
    const scaleY = this.config.containerHeight / this.config.videoHeight;
    this.scale = Math.max(scaleX, scaleY);

    this.displayedW = this.config.videoWidth * this.scale;
    this.displayedH = this.config.videoHeight * this.scale;

    this.cropOffsetX = (this.displayedW - this.config.containerWidth) / 2.0;
    this.cropOffsetY = (this.displayedH - this.config.containerHeight) / 2.0;
  }

  public getMetrics(): CoverCropMetrics {
    return this.metrics;
  }

  public getConfig(): Readonly<Required<CameraIntrinsicConfig>> {
    return this.config;
  }

  /**
   * Synchronizes a Three.js PerspectiveCamera projectionMatrix directly with
   * the physical camera intrinsics K and CSS object-fit: cover crop window.
   */
  public applyToThreeCamera(camera: THREE.PerspectiveCamera): void {
    const { near, far, principalPointU, principalPointV, isMirrored } = this.config;
    const { videoAspect, etaX, etaY, tanHalfFovY, effectiveVerticalFovDeg, containerAspect } = this.metrics;

    camera.fov = effectiveVerticalFovDeg;
    camera.aspect = containerAspect;
    camera.near = near;
    camera.far = far;

    // Compute exact OpenGL projection matrix elements incorporating principal point & cover crop
    const m00 = 1.0 / (etaX * videoAspect * tanHalfFovY);
    const m11 = 1.0 / (etaY * tanHalfFovY);

    const cu = isMirrored ? 1.0 - principalPointU : principalPointU;
    const cv = principalPointV;

    const m02 = (1.0 - 2.0 * cu) / etaX;
    const m12 = (2.0 * cv - 1.0) / etaY;
    const m22 = -(far + near) / (far - near);
    const m23 = -(2.0 * far * near) / (far - near);

    // Three.js Matrix4.set() takes row-major arguments and stores column-major internally
    camera.projectionMatrix.set(
      m00, 0,   m02, 0,
      0,   m11, m12, 0,
      0,   0,   m22, m23,
      0,   0,   -1,  0
    );
    camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();
  }

  /**
   * Unprojects a 2D normalized video landmark (u, v in [0, 1]) at a known metric
   * camera-space depth Z_meters (where Z_meters < 0 in front of the camera) into
   * Three.js world space (meters), accounting for mirroring and principal point.
   */
  public unprojectLandmarkToWorld(
    u: number,
    v: number,
    zMetersNegative: number,
    target: THREE.Vector3 = new THREE.Vector3()
  ): THREE.Vector3 {
    const { principalPointU, principalPointV, isMirrored } = this.config;
    const { videoAspect, tanHalfFovY } = this.metrics;

    const absZ = Math.abs(zMetersNegative);
    const xUnmirrored = absZ * 2.0 * videoAspect * tanHalfFovY * (u - principalPointU);
    const yWorld = absZ * 2.0 * tanHalfFovY * (principalPointV - v);
    const xWorld = isMirrored ? -xUnmirrored : xUnmirrored;

    return target.set(xWorld, yWorld, -absZ);
  }

  /**
   * Maps a normalized video landmark (u, v in [0, 1]) directly to Three.js
   * Normalized Device Coordinates (xNdc, yNdc in [-1, +1]) on the cover-cropped canvas.
   */
  public videoNormalizedToNDC(
    u: number,
    v: number
  ): { xNdc: number; yNdc: number } {
    const { principalPointU, principalPointV, isMirrored } = this.config;
    const { etaX, etaY } = this.metrics;

    const rawX = (2.0 * (u - principalPointU)) / etaX;
    const xNdc = isMirrored ? -rawX : rawX;
    const yNdc = (2.0 * (principalPointV - v)) / etaY;

    return { xNdc, yNdc };
  }

  /**
   * Maps a normalized landmark (x, y in [0, 1]) to screen pixel coordinates [0, containerW/H]
   */
  public mapNormalizedToScreen(xNorm: number, yNorm: number): { x: number; y: number } {
    let xPixel = xNorm * this.displayedW - this.cropOffsetX;
    const yPixel = yNorm * this.displayedH - this.cropOffsetY;

    if (this.config.isMirrored) {
      xPixel = this.config.containerWidth - xPixel;
    }

    return { x: xPixel, y: yPixel };
  }

  /**
   * Maps normalized landmark (x, y in [0, 1]) directly to Three.js NDC [-1, 1]
   */
  public mapNormalizedToNDC(xNorm: number, yNorm: number): { x: number; y: number } {
    const { xNdc, yNdc } = this.videoNormalizedToNDC(xNorm, yNorm);
    return { x: xNdc, y: yNdc };
  }

  /**
   * Maps normalized landmark to Three.js 3D world space at given depth Z (typically negative)
   */
  public mapNormalizedTo3D(
    xNorm: number,
    yNorm: number,
    depthZ: number
  ): { x: number; y: number; z: number } {
    const world = this.unprojectLandmarkToWorld(xNorm, yNorm, depthZ);
    return { x: world.x, y: world.y, z: world.z };
  }

  public getDisplayedDimensions(): { width: number; height: number } {
    return { width: this.displayedW, height: this.displayedH };
  }

  public getCropOffsets(): { offsetX: number; offsetY: number } {
    return { offsetX: this.cropOffsetX, offsetY: this.cropOffsetY };
  }

  public getContainerDimensions(): { width: number; height: number } {
    return { width: this.config.containerWidth, height: this.config.containerHeight };
  }

  public getCoverScale(): number {
    return this.scale;
  }

  public isMirrored(): boolean {
    return this.config.isMirrored;
  }

  public getFocalLengths(): { fx: number; fy: number } {
    const fy = this.config.containerHeight / (2.0 * this.metrics.tanHalfFovY * this.metrics.etaY);
    const fx = this.config.containerWidth / (2.0 * this.metrics.tanHalfFovY * this.metrics.videoAspect * this.metrics.etaX);
    return { fx, fy };
  }

  public getPixelDistance(
    p1: { x: number; y: number },
    p2: { x: number; y: number }
  ): number {
    const dxPixel = (p1.x - p2.x) * this.displayedW;
    const dyPixel = (p1.y - p2.y) * this.displayedH;
    return Math.sqrt(dxPixel * dxPixel + dyPixel * dyPixel);
  }

  public calculateMetricDepth(
    rightPupil: { x: number; y: number },
    leftPupil: { x: number; y: number },
    ipdMetricMeters = 0.063
  ): number {
    const pupilDistPixels = this.getPixelDistance(rightPupil, leftPupil);
    if (pupilDistPixels <= 1.0) return -0.55;

    const { fy } = this.getFocalLengths();
    const depthMeters = -(ipdMetricMeters * fy) / pupilDistPixels;
    return Math.max(-1.3, Math.min(-0.28, depthMeters));
  }
}
