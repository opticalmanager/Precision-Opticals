/**
 * Precision Optics - Virtual Try-On TypeScript Definitions
 * Strict types for face tracking, 3D coordinate mapping, calibration, and product configs.
 */

export interface FrameCalibration {
  /** Multiplier applied to calculated IPD-based scale (default: 1.0) */
  scaleMultiplier: number;
  /** Vertical translation offset relative to sellion / nose bridge in meters (Three.js units) */
  verticalOffset: number;
  /** Depth translation offset along Z-axis in meters */
  depthOffset: number;
  /** Horizontal translation offset along X-axis in meters */
  horizontalOffset?: number;
  /** Pantoscopic tilt rotation offset (radians) */
  pitchOffset: number;
  /** Face-form wrap rotation offset (radians) */
  yawOffset: number;
  /** Frame roll rotation offset (radians) */
  rollOffset: number;
}

export interface TryOnConfiguration extends FrameCalibration {
  enabled: boolean;
  modelUrl: string;
  modelVersion: number | string;
  calibrationVersion: number | string;
  /** Physical frame measurements in millimeters */
  frameWidth?: number;
  lensWidth?: number;
  bridgeWidth?: number;
  templeLength?: number;
  /** Optional custom material overrides */
  materials?: {
    frameColor?: string;
    frameMetalness?: number;
    frameRoughness?: number;
    lensColor?: string;
    lensTransmission?: number;
    lensRoughness?: number;
  };
}

export interface FacePose {
  /** 3D position in Three.js world space coordinates */
  position: {
    x: number;
    y: number;
    z: number;
  };
  /** Rotation Euler angles in radians (kept for diagnostics & fallback) */
  rotation: {
    pitch: number; // Head nodding up / down (X-axis)
    yaw: number;   // Head turning left / right (Y-axis)
    roll: number;  // Head tilting side to side (Z-axis)
  };
  /** Quaternion rotation — primary rotation representation (avoids gimbal lock) */
  quaternion?: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  /** Normalized inter-pupillary distance in image coordinates */
  eyeDistance: number;
  /** Calculated base scale for 3D model */
  scale: number;
  /** Online Bayesian calibrated user IPD in millimeters */
  calibratedIpdMm?: number;
  /** Personal cranial scale factor (calibratedIpdMm / 63.0) */
  cranialScaleFactor?: number;
  /** Estimated bizygomatic face width in millimeters */
  faceWidthMm?: number;
  /** Expression activity score [0, 1] for dynamic measurement weighting */
  expressionActivity?: number;
  /** Measurement confidence weight [0.1, 1.0] */
  poseConfidence?: number;
  /** Metric depth Z in meters */
  metricDepthMeters?: number;
  /** Normalized dynamic activity factor from EKF */
  activityFactor?: number;
  /** Anatomical sellion (168) position in world space */
  sellionPosition?: {
    x: number;
    y: number;
    z: number;
  };
  /** Head orientation quaternion prior to pantoscopic tilt */
  headQuaternion?: {
    x: number;
    y: number;
    z: number;
    w: number;
  };
}

export type TrackingConfidenceState =
  | 'HIGH_CONFIDENCE'
  | 'MEDIUM_CONFIDENCE'
  | 'LOW_CONFIDENCE'
  | 'LOST';

export interface FaceQualityScore {
  overallConfidence: number; // 0.0 to 1.0
  state: TrackingConfidenceState;
  isCentered: boolean;
  isAdequatelyLit: boolean;
  isWithinRotationBounds: boolean;
  message?: string;
}

export interface DiagnosticMetrics {
  renderFps: number;
  trackingFps: number;
  trackingLatencyMs: number;
  confidence: number;
  facePitchDeg: number;
  faceYawDeg: number;
  faceRollDeg: number;
  appliedScale: number;
  videoWidth: number;
  videoHeight: number;
  canvasWidth: number;
  canvasHeight: number;
  metricDepthM?: number;
  rawWidthMm?: number;
  normalizedWidthMm?: number;
  autoScaleFactor?: number;
  calibratedIpdMm?: number;
  faceWidthMm?: number;
  activityFactor?: number;
}

export type CameraErrorType =
  | 'PERMISSION_DENIED'
  | 'DEVICE_NOT_FOUND'
  | 'CAMERA_IN_USE'
  | 'UNSUPPORTED_BROWSER'
  | 'UNKNOWN_ERROR';

export interface CameraErrorInfo {
  type: CameraErrorType;
  message: string;
  instructions: string[];
}
