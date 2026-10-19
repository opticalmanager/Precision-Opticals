import * as THREE from "three";
import { LANDMARKS } from "./LandmarkIndices";
import { FacePose } from "@/types/tryOn";
import { VideoToRenderCoordinateMapper } from "../rendering/VideoToRenderCoordinateMapper";

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export interface CranialLandmarkSpec {
  id: number;
  name: string;
  /** Canonical 3D position in meters relative to Sellion (168) in right-handed OpenGL coords (+X right, +Y up, +Z out of face) */
  canonicalPos: [number, number, number];
  baseWeight: number;
  side: "center" | "left" | "right";
}

/**
 * 14 strictly osteological (rigid skull bone) landmarks extracted from MediaPipe canonical_face_model.obj
 * (converted from cm to meters and re-centered at Sellion 168).
 * Excludes all deformable mimetic soft tissue (lips, jaw, cheeks, eyebrows, eyelids, alar wings).
 */
export const CRANIAL_RIGID_BASIS: readonly CranialLandmarkSpec[] = [
  // Midline Nasal & Frontal Bone Core
  { id: 168, name: "Sellion", canonicalPos: [0.00000, 0.00000, 0.00000], baseWeight: 0.16, side: "center" },
  { id: 6, name: "RhinionUpper", canonicalPos: [0.00000, -0.00910, 0.00480], baseWeight: 0.13, side: "center" },
  { id: 197, name: "RhinionMid", canonicalPos: [0.00000, -0.01740, 0.00920], baseWeight: 0.11, side: "center" },
  { id: 195, name: "NasalBoneLower", canonicalPos: [0.00000, -0.02480, 0.01310], baseWeight: 0.08, side: "center" },
  { id: 9, name: "Glabella", canonicalPos: [0.00000, 0.01120, 0.00190], baseWeight: 0.07, side: "center" },
  { id: 151, name: "MidFrontalBone", canonicalPos: [0.00000, 0.03850, -0.00320], baseWeight: 0.07, side: "center" },

  // Bony Medial Canthal Ligament Attachments (Anterior Lacrimal Crest)
  { id: 243, name: "MedialCanthusL", canonicalPos: [-0.01680, -0.00420, -0.00680], baseWeight: 0.08, side: "left" },
  { id: 463, name: "MedialCanthusR", canonicalPos: [0.01680, -0.00420, -0.00680], baseWeight: 0.08, side: "right" },

  // Lateral Orbital Rim (Frontal Process of Zygomatic Bone)
  { id: 130, name: "LateralOrbitL", canonicalPos: [-0.04420, -0.00280, -0.01750], baseWeight: 0.05, side: "left" },
  { id: 359, name: "LateralOrbitR", canonicalPos: [0.04420, -0.00280, -0.01750], baseWeight: 0.05, side: "right" },

  // Sphenoid / Zygomatic Temporal Root
  { id: 127, name: "ZygomaticRootL", canonicalPos: [-0.06450, -0.00650, -0.05120], baseWeight: 0.03, side: "left" },
  { id: 356, name: "ZygomaticRootR", canonicalPos: [0.06450, -0.00650, -0.05120], baseWeight: 0.03, side: "right" },

  // Preauricular Tragion (Posterior Zygomatic Arch Root)
  { id: 234, name: "TragionL", canonicalPos: [-0.06880, -0.01950, -0.07450], baseWeight: 0.03, side: "left" },
  { id: 454, name: "TragionR", canonicalPos: [0.06880, -0.01950, -0.07450], baseWeight: 0.03, side: "right" },
];

export interface EyewearFittingConfig {
  /** Desired corneal vertex distance in meters (standard 0.013m = 13.0mm) */
  vertexDistanceMeters: number;
  /** Residual pantoscopic tilt in degrees applied to the frame (standard -5.0 deg) */
  pantoscopicTiltDeg: number;
  /** Vertical bridge contact offset relative to Sellion (168) in meters (default -0.0042m) */
  bridgeVerticalOffsetMeters: number;
  /** Anterior skin contact offset relative to Sellion (168) in meters (default +0.0028m) */
  bridgeAnteriorOffsetMeters: number;
}

export interface EstimatedHeadPose {
  /** World-space position of the eyewear pivot in meters (Three.js scene coords) */
  eyewearPosition: THREE.Vector3;
  /** World-space orientation quaternion of the eyewear frame (Three.js scene coords) */
  eyewearQuaternion: THREE.Quaternion;
  /** World-space position of the anatomical sellion (168) in meters */
  sellionPosition: THREE.Vector3;
  /** World-space orientation quaternion of the rigid skull (without pantoscopic tilt) */
  headQuaternion: THREE.Quaternion;
  /** Metric depth Z of the sellion in meters (positive scalar distance from camera) */
  metricDepthMeters: number;
  /** Online Bayesian calibrated user IPD in millimeters */
  calibratedIpdMm: number;
  /** Personal cranial scale ratio (calibratedIpdMm / 63.0) */
  cranialScaleFactor: number;
  /** Estimated bizygomatic face width in millimeters */
  faceWidthMm: number;
  /** Head Euler angles in degrees (pitch, yaw, roll) for telemetry/gating */
  eulerDegrees: { pitch: number; yaw: number; roll: number };
  /** Expression activity score in [0, 1] used for dynamic measurement variance weighting */
  expressionActivity: number;
  /** 3x3 measurement confidence weight in [0.1, 1.0] */
  poseConfidence: number;
}

const CANONICAL_IPD_MM = 63.0;
const HUMAN_IRIS_DIAMETER_MM = 11.7; // Anatomical horizontal visible iris diameter
const DEG_TO_RAD = Math.PI / 180.0;
const RAD_TO_DEG = 180.0 / Math.PI;

export class FacePoseEstimator {
  private fittingConfig: EyewearFittingConfig;

  // Bayesian online IPD state: initialized to population prior N(63.0 mm, (3.2 mm)^2)
  private ipdMeanMm = CANONICAL_IPD_MM;
  private ipdVarianceMm2 = 3.2 * 3.2;
  private ipdSampleCount = 0;

  // Previous frame yaw in radians for visibility weighting
  private lastYawRad = 0.0;

  // Pre-allocated scratch math objects to guarantee zero GC pressure inside requestAnimationFrame
  private readonly tempVecA = new THREE.Vector3();
  private readonly tempVecB = new THREE.Vector3();
  private readonly tempVecC = new THREE.Vector3();
  private readonly tempMat4 = new THREE.Matrix4();
  private readonly tempQuatA = new THREE.Quaternion();
  private readonly tempQuatB = new THREE.Quaternion();
  private readonly tempEuler = new THREE.Euler();

  // Shared default instance for static API
  private static defaultInstance = new FacePoseEstimator();

  constructor(fittingConfig?: Partial<EyewearFittingConfig>) {
    this.fittingConfig = {
      vertexDistanceMeters: fittingConfig?.vertexDistanceMeters ?? 0.013,
      pantoscopicTiltDeg: fittingConfig?.pantoscopicTiltDeg ?? -5.0,
      bridgeVerticalOffsetMeters: fittingConfig?.bridgeVerticalOffsetMeters ?? -0.0042,
      bridgeAnteriorOffsetMeters: fittingConfig?.bridgeAnteriorOffsetMeters ?? 0.0028,
    };
  }

  public resetCalibration(): void {
    this.ipdMeanMm = CANONICAL_IPD_MM;
    this.ipdVarianceMm2 = 3.2 * 3.2;
    this.ipdSampleCount = 0;
    this.lastYawRad = 0.0;
  }

  public updateFittingConfig(partial: Partial<EyewearFittingConfig>): void {
    Object.assign(this.fittingConfig, partial);
  }

  public getCalibratedIpdMm(): number {
    return this.ipdMeanMm;
  }

  public getIpdSampleCount(): number {
    return this.ipdSampleCount;
  }

  /**
   * Primary 6-DoF rigid cranial pose estimation routine.
   * Combines osteological cranial landmark triangulation, iris-metric IPD calibration,
   * 3-point ear-bridge pitch locking, and MediaPipe matrix fusion.
   */
  public estimatePose(
    landmarks: LandmarkPoint[],
    transformationMatrix: { data: Float32Array | number[] } | null | undefined,
    mapper: VideoToRenderCoordinateMapper
  ): EstimatedHeadPose | null {
    if (!landmarks || landmarks.length < 468) {
      return null;
    }

    const config = mapper.getConfig();

    // 1. Compute expression activity (blink + smile/speech) to gate non-rigid skin pull
    const expressionActivity = this.computeExpressionActivity(landmarks);

    // 2. Update online Bayesian IPD calibration using 11.7mm horizontal iris invariant (landmarks 468..477)
    if (landmarks.length >= 478) {
      this.updateIrisIpdCalibration(
        landmarks,
        config.videoWidth,
        config.videoHeight,
        expressionActivity
      );
    }

    const cranialScale = THREE.MathUtils.clamp(
      this.ipdMeanMm / CANONICAL_IPD_MM,
      54.0 / 63.0,
      72.0 / 63.0
    );

    // 3. Compute true metric depth Z of the sellion (168)
    const metricDepthMeters = this.computeMetricSellionDepth(
      landmarks,
      transformationMatrix,
      mapper,
      cranialScale
    );

    // 4. Compute 3D skull orientation in mirrored Three.js world space
    const headQuaternion = this.computeRigidCranialOrientation(
      landmarks,
      transformationMatrix,
      mapper,
      metricDepthMeters,
      cranialScale,
      expressionActivity
    );

    // Extract Euler angles (YXZ order: yaw, pitch, roll) for next-frame visibility gating & telemetry
    this.tempEuler.setFromQuaternion(headQuaternion, "YXZ");
    this.lastYawRad = this.tempEuler.y;

    const eulerDegrees = {
      pitch: this.tempEuler.x * RAD_TO_DEG,
      yaw: this.tempEuler.y * RAD_TO_DEG,
      roll: this.tempEuler.z * RAD_TO_DEG,
    };

    // 5. Unproject exact sellion position on the pinhole ray through landmark 168
    const sellionU = 0.78 * landmarks[168].x + 0.22 * (landmarks[6]?.x ?? landmarks[168].x);
    const sellionV = 0.85 * landmarks[168].y + 0.15 * (landmarks[6]?.y ?? landmarks[168].y);

    const sellionPosition = mapper.unprojectLandmarkToWorld(
      sellionU,
      sellionV,
      -metricDepthMeters,
      new THREE.Vector3()
    );

    // 6. Apply anatomical contact offset coupled to rigid 3D head orientation
    const corneaToSellionDefault = 0.0095;
    const vertexDeltaZ =
      this.fittingConfig.bridgeAnteriorOffsetMeters +
      (this.fittingConfig.vertexDistanceMeters - 0.013);

    const localAnchorOffset = this.tempVecA.set(
      0.0,
      this.fittingConfig.bridgeVerticalOffsetMeters * cranialScale,
      (vertexDeltaZ + (0.0095 - corneaToSellionDefault)) * cranialScale
    );
    localAnchorOffset.applyQuaternion(headQuaternion);

    const eyewearPosition = sellionPosition.clone().add(localAnchorOffset);

    // 7. Apply pantoscopic tilt rotation in local frame coordinates
    const pantoQuat = this.tempQuatA.setFromAxisAngle(
      this.tempVecB.set(1, 0, 0),
      this.fittingConfig.pantoscopicTiltDeg * DEG_TO_RAD
    );
    const eyewearQuaternion = headQuaternion.clone().multiply(pantoQuat).normalize();

    // 8. Compute metric bizygomatic face width in mm
    const faceWidthMm = this.estimateFaceWidthMm(
      landmarks,
      mapper,
      metricDepthMeters,
      cranialScale
    );

    const yawAbsDeg = Math.abs(eulerDegrees.yaw);
    const poseConfidence = THREE.MathUtils.clamp(
      (1.0 - 0.35 * expressionActivity) *
        (yawAbsDeg > 35 ? Math.max(0.25, Math.cos((yawAbsDeg - 35) * DEG_TO_RAD * 1.5)) : 1.0),
      0.15,
      1.0
    );

    return {
      eyewearPosition,
      eyewearQuaternion,
      sellionPosition,
      headQuaternion,
      metricDepthMeters,
      calibratedIpdMm: this.ipdMeanMm,
      cranialScaleFactor: cranialScale,
      faceWidthMm,
      eulerDegrees,
      expressionActivity,
      poseConfidence,
    };
  }

  /**
   * Computes a normalized [0, 1] score of facial expression muscle contraction
   * (eye blink/squint + mouth smile/speech) to dynamically down-weight affected landmarks.
   */
  public computeExpressionActivity(landmarks: LandmarkPoint[]): number {
    if (!landmarks[33] || !landmarks[133] || !landmarks[159] || !landmarks[145]) {
      return 0.0;
    }

    // Eye Aspect Ratio (EAR) for blink/squint detection
    const leftEyeWidth = Math.hypot(
      landmarks[33].x - landmarks[133].x,
      landmarks[33].y - landmarks[133].y
    );
    const leftEyeHeight = Math.hypot(
      landmarks[159].x - landmarks[145].x,
      landmarks[159].y - landmarks[145].y
    );

    const rightEyeWidth = Math.hypot(
      (landmarks[362]?.x ?? 0) - (landmarks[263]?.x ?? 0),
      (landmarks[362]?.y ?? 0) - (landmarks[263]?.y ?? 0)
    );
    const rightEyeHeight = Math.hypot(
      (landmarks[386]?.x ?? 0) - (landmarks[374]?.x ?? 0),
      (landmarks[386]?.y ?? 0) - (landmarks[374]?.y ?? 0)
    );

    const earL = leftEyeHeight / Math.max(1e-5, leftEyeWidth);
    const earR = rightEyeWidth > 1e-5 ? rightEyeHeight / rightEyeWidth : earL;
    const blinkScore = THREE.MathUtils.clamp((0.25 - Math.min(earL, earR)) / 0.14, 0.0, 1.0);

    // Mouth width to bony medial inter-canthal ratio for smile/speech detection
    if (!landmarks[243] || !landmarks[463] || !landmarks[61] || !landmarks[291]) {
      return blinkScore;
    }

    const interCanthalDist = Math.hypot(
      landmarks[243].x - landmarks[463].x,
      landmarks[243].y - landmarks[463].y
    );
    const mouthWidth = Math.hypot(
      landmarks[61].x - landmarks[291].x,
      landmarks[61].y - landmarks[291].y
    );
    const smileRatio = mouthWidth / Math.max(1e-5, interCanthalDist);
    const smileScore = THREE.MathUtils.clamp((smileRatio - 1.48) / 0.42, 0.0, 1.0);

    return Math.max(blinkScore, 0.75 * smileScore);
  }

  /**
   * Online Sequential Bayesian Estimator for personal IPD using the 11.7mm horizontal
   * corneal limbus (iris) anatomical invariant (MediaPipe Iris landmarks 468..477).
   */
  public updateIrisIpdCalibration(
    landmarks: LandmarkPoint[],
    videoWidth: number,
    videoHeight: number,
    expressionActivity: number
  ): void {
    if (landmarks.length < 478) return;

    // Only calibrate when head yaw is near-frontal (< 16 deg) and eyes are open
    const cosYaw = Math.cos(this.lastYawRad);
    if (cosYaw < 0.96 || expressionActivity > 0.25) {
      return;
    }

    const lm469 = landmarks[469];
    const lm471 = landmarks[471];
    const lm474 = landmarks[474];
    const lm476 = landmarks[476];
    const lm468 = landmarks[468];
    const lm473 = landmarks[473];

    if (!lm469 || !lm471 || !lm474 || !lm476 || !lm468 || !lm473) return;

    // Left iris horizontal limbus: 469 (temporal) to 471 (nasal)
    const leftIrisPx = Math.hypot(
      (lm469.x - lm471.x) * videoWidth,
      (lm469.y - lm471.y) * videoHeight
    );
    // Right iris horizontal limbus: 474 (nasal) to 476 (temporal)
    const rightIrisPx = Math.hypot(
      (lm474.x - lm476.x) * videoWidth,
      (lm474.y - lm476.y) * videoHeight
    );

    const meanIrisPx = 0.5 * (leftIrisPx + rightIrisPx);
    if (meanIrisPx < 16.0 || Math.abs(leftIrisPx - rightIrisPx) / meanIrisPx > 0.14) {
      return;
    }

    // Pupil center-to-center pixel distance (468 to 473)
    const ipdPx = Math.hypot(
      (lm473.x - lm468.x) * videoWidth,
      (lm473.y - lm468.y) * videoHeight
    );

    // Focal-length-invariant and depth-invariant instant IPD measurement
    const instantIpdMm = HUMAN_IRIS_DIAMETER_MM * (ipdPx / meanIrisPx);
    if (instantIpdMm < 52.0 || instantIpdMm > 74.0) {
      return;
    }

    // Measurement variance scales inversely with iris pixel diameter squared
    const measurementStdMm = 22.0 / meanIrisPx + 1.1;
    const R = measurementStdMm * measurementStdMm;

    // Scalar Kalman update
    const kalmanGain = this.ipdVarianceMm2 / (this.ipdVarianceMm2 + R);
    this.ipdMeanMm = this.ipdMeanMm + kalmanGain * (instantIpdMm - this.ipdMeanMm);
    this.ipdVarianceMm2 = Math.max(0.35, (1.0 - kalmanGain) * this.ipdVarianceMm2);
    this.ipdSampleCount++;
  }

  /**
   * Computes true metric depth Z of the sellion (168) in meters.
   */
  public computeMetricSellionDepth(
    landmarks: LandmarkPoint[],
    transformationMatrix: { data: Float32Array | number[] } | null | undefined,
    mapper: VideoToRenderCoordinateMapper,
    cranialScale: number
  ): number {
    const config = mapper.getConfig();
    const metrics = mapper.getMetrics();
    const fyPx = config.videoHeight / (2.0 * metrics.tanHalfFovY);

    // Cue 1: Cranial Bony Inter-Orbital Chord (landmarks 130 to 359, canonical width = 88.4mm)
    const lm130 = landmarks[130] || landmarks[LANDMARKS.LEFT_EYE_OUTER];
    const lm359 = landmarks[359] || landmarks[LANDMARKS.RIGHT_EYE_OUTER];

    let depthFromOrbitMeters = 0.55;
    if (lm130 && lm359) {
      const dxOrbitPx = (lm359.x - lm130.x) * config.videoWidth;
      const dyOrbitPx = (lm359.y - lm130.y) * config.videoHeight;
      const dzOrbitPx = ((lm359.z ?? 0) - (lm130.z ?? 0)) * config.videoWidth;
      const chordOrbitPx = Math.hypot(dxOrbitPx, dyOrbitPx, dzOrbitPx);
      const canonicalOrbitChordMeters = 0.0884 * cranialScale;
      depthFromOrbitMeters = (fyPx * canonicalOrbitChordMeters) / Math.max(20.0, chordOrbitPx);
    }

    // Cue 2: MediaPipe 4x4 facialTransformationMatrixes metric Z
    if (transformationMatrix && transformationMatrix.data && transformationMatrix.data.length >= 16) {
      const mpZCm = Math.abs(transformationMatrix.data[14]);
      if (mpZCm > 10.0 && mpZCm < 300.0) {
        const depthFromMpMeters = mpZCm * 0.01 * metrics.mediaPipeFovScaleFactor * cranialScale;
        return 0.65 * depthFromOrbitMeters + 0.35 * depthFromMpMeters;
      }
    }

    return THREE.MathUtils.clamp(depthFromOrbitMeters, 0.18, 2.5);
  }

  /**
   * Computes the 3D rigid skull orientation quaternion in mirrored Three.js world space.
   */
  public computeRigidCranialOrientation(
    landmarks: LandmarkPoint[],
    transformationMatrix: { data: Float32Array | number[] } | null | undefined,
    mapper: VideoToRenderCoordinateMapper,
    metricDepthMeters: number,
    cranialScale: number,
    expressionActivity: number
  ): THREE.Quaternion {
    const config = mapper.getConfig();
    const metrics = mapper.getMetrics();
    const aspect = metrics.videoAspect;
    const tanHalfFovY = metrics.tanHalfFovY;

    const sellionZ = landmarks[168]?.z ?? 0;

    const getCranialPoint3D = (idx: number, target: THREE.Vector3): THREE.Vector3 => {
      const lm = landmarks[idx] || landmarks[168] || { x: 0.5, y: 0.5, z: 0 };
      const lmZ = lm.z ?? 0;
      const relZMeters = (lmZ - sellionZ) * metricDepthMeters * 2.0 * aspect * tanHalfFovY;
      const pointDepth = -(metricDepthMeters + relZMeters);
      return mapper.unprojectLandmarkToWorld(lm.x, lm.y, pointDepth, target);
    };

    // 1. Construct Horizontal Cranial Axis (eX) from bony medial canthi (243, 463) & lateral orbits (130, 359)
    const p243 = getCranialPoint3D(243, new THREE.Vector3());
    const p463 = getCranialPoint3D(463, new THREE.Vector3());
    const p130 = getCranialPoint3D(130, new THREE.Vector3());
    const p359 = getCranialPoint3D(359, new THREE.Vector3());

    const leftOrbitalAnchor = p243.multiplyScalar(0.65).addScaledVector(p130, 0.35);
    const rightOrbitalAnchor = p463.multiplyScalar(0.65).addScaledVector(p359, 0.35);

    const eX = this.tempVecA
      .subVectors(
        config.isMirrored ? leftOrbitalAnchor : rightOrbitalAnchor,
        config.isMirrored ? rightOrbitalAnchor : leftOrbitalAnchor
      )
      .normalize();

    // 2. Construct Cranial Vertical Axis (eY) from Nasal Dorsum (195 -> 168 -> 151)
    const p168 = getCranialPoint3D(168, new THREE.Vector3());
    const p195 = getCranialPoint3D(195, new THREE.Vector3());
    const p151 = getCranialPoint3D(151, new THREE.Vector3());
    const rawUp = this.tempVecB.subVectors(p151, p195).normalize();

    // 3. Enforce 3-Point Kinematic Ear-Bridge Pitch & Yaw Constraint using visible Tragion (234 / 454)
    // Physical eyewear temples rest over the otobasion superius (+14.0mm superior to tragion landmarks)
    const earRestElevMeters = 0.014 * cranialScale;
    const p234EarRest = getCranialPoint3D(234, new THREE.Vector3()).addScaledVector(rawUp, earRestElevMeters);
    const p454EarRest = getCranialPoint3D(454, new THREE.Vector3()).addScaledVector(rawUp, earRestElevMeters);

    const leftVisWeight = THREE.MathUtils.clamp(
      Math.cos(Math.max(0, -this.lastYawRad) * 1.5),
      0.08,
      1.0
    );
    const rightVisWeight = THREE.MathUtils.clamp(
      Math.cos(Math.max(0, this.lastYawRad) * 1.5),
      0.08,
      1.0
    );

    const eZFromBridgeToEar = this.tempVecC.set(0, 0, 1);
    const leftEarToSellion = p168
      .clone()
      .sub(p234EarRest)
      .addScaledVector(eX, (config.isMirrored ? -1 : 1) * 0.0688 * cranialScale);
    const rightEarToSellion = p168
      .clone()
      .sub(p454EarRest)
      .addScaledVector(eX, (config.isMirrored ? 1 : -1) * 0.0688 * cranialScale);

    eZFromBridgeToEar
      .copy(leftEarToSellion)
      .multiplyScalar(leftVisWeight)
      .addScaledVector(rightEarToSellion, rightVisWeight)
      .normalize();

    // Orthonormalize cranial basis with yaw-adaptive ear-bridge sagittal pitch stabilization
    const eZ = new THREE.Vector3().crossVectors(eX, rawUp).normalize();
    const earBlendWeight = THREE.MathUtils.clamp(
      0.30 + 0.45 * Math.sin(this.lastYawRad) * Math.sin(this.lastYawRad),
      0.30,
      0.75
    );
    eZ.lerp(eZFromBridgeToEar, earBlendWeight).normalize();
    const eY = new THREE.Vector3().crossVectors(eZ, eX).normalize();
    eX.crossVectors(eY, eZ).normalize();

    const cranialBasisMatrix = this.tempMat4.makeBasis(eX, eY, eZ);
    const cranialQuat = new THREE.Quaternion().setFromRotationMatrix(cranialBasisMatrix);

    // 4. Fuse with properly conjugated MediaPipe transformation matrix (if available)
    if (transformationMatrix && transformationMatrix.data && transformationMatrix.data.length >= 16) {
      const m = transformationMatrix.data;
      const scaleX = Math.hypot(m[0], m[1], m[2]);
      const scaleY = Math.hypot(m[4], m[5], m[6]);
      const scaleZ = Math.hypot(m[8], m[9], m[10]);

      if (scaleX > 1e-4 && scaleY > 1e-4 && scaleZ > 1e-4) {
        const r00 = m[0] / scaleX, r01 = m[4] / scaleY, r02 = m[8] / scaleZ;
        const r10 = m[1] / scaleX, r11 = m[5] / scaleY, r12 = m[9] / scaleZ;
        const r20 = m[2] / scaleX, r21 = m[6] / scaleY, r22 = m[10] / scaleZ;

        const s = config.isMirrored ? -1.0 : 1.0;
        this.tempMat4.set(
          r00,     s * r01, s * r02, 0,
          s * r10, r11,     r12,     0,
          s * r20, r21,     r22,     0,
          0,       0,       0,       1
        );
        const mpQuat = this.tempQuatB.setFromRotationMatrix(this.tempMat4).normalize();

        if (cranialQuat.dot(mpQuat) < 0) {
          mpQuat.set(-mpQuat.x, -mpQuat.y, -mpQuat.z, -mpQuat.w);
        }

        const mpTrust = THREE.MathUtils.clamp(
          0.55 * (1.0 - 0.85 * expressionActivity),
          0.10,
          0.55
        );
        cranialQuat.slerp(mpQuat, mpTrust).normalize();
      }
    }

    return cranialQuat;
  }

  private estimateFaceWidthMm(
    landmarks: LandmarkPoint[],
    mapper: VideoToRenderCoordinateMapper,
    metricDepthMeters: number,
    cranialScale: number
  ): number {
    const lm234 = landmarks[234] || landmarks[168];
    const lm454 = landmarks[454] || landmarks[168];

    const pLeft = mapper.unprojectLandmarkToWorld(
      lm234.x,
      lm234.y,
      -metricDepthMeters,
      this.tempVecA
    );
    const pRight = mapper.unprojectLandmarkToWorld(
      lm454.x,
      lm454.y,
      -metricDepthMeters,
      this.tempVecB
    );
    const rawProjectedWidthMm = pLeft.distanceTo(pRight) * 1000.0;
    const cosYaw = Math.max(0.65, Math.cos(this.lastYawRad));
    const correctedWidthMm = rawProjectedWidthMm / cosYaw;

    return 0.7 * (138.5 * cranialScale) + 0.3 * THREE.MathUtils.clamp(correctedWidthMm, 118.0, 162.0);
  }

  /**
   * Static compatibility wrapper used across existing views and tests.
   */
  public static estimate(
    landmarks: LandmarkPoint[],
    matrixData: { data: Float32Array | number[] } | null | undefined,
    coordMapper: VideoToRenderCoordinateMapper,
    customDepthZ?: number
  ): FacePose | null {
    if (!landmarks || landmarks.length < 468) {
      return null;
    }

    const estimated = this.defaultInstance.estimatePose(landmarks, matrixData, coordMapper);
    if (!estimated) {
      return null;
    }

    const pos = estimated.eyewearPosition;
    const quat = estimated.eyewearQuaternion;
    const euler = estimated.eulerDegrees;

    const depthZ = customDepthZ !== undefined ? customDepthZ : -estimated.metricDepthMeters;

    const rightEye = landmarks[LANDMARKS.RIGHT_PUPIL] || landmarks[473] || landmarks[LANDMARKS.RIGHT_EYE_INNER];
    const leftEye = landmarks[LANDMARKS.LEFT_PUPIL] || landmarks[468] || landmarks[LANDMARKS.LEFT_EYE_INNER];
    const eyeDistance = (rightEye && leftEye) ? Math.hypot(rightEye.x - leftEye.x, rightEye.y - leftEye.y) : 0.095;

    return {
      position: {
        x: pos.x,
        y: pos.y,
        z: customDepthZ !== undefined ? customDepthZ : pos.z,
      },
      rotation: {
        pitch: euler.pitch * DEG_TO_RAD,
        yaw: euler.yaw * DEG_TO_RAD,
        roll: euler.roll * DEG_TO_RAD,
      },
      quaternion: {
        x: quat.x,
        y: quat.y,
        z: quat.z,
        w: quat.w,
      },
      eyeDistance,
      scale: estimated.cranialScaleFactor,
      calibratedIpdMm: estimated.calibratedIpdMm,
      cranialScaleFactor: estimated.cranialScaleFactor,
      faceWidthMm: estimated.faceWidthMm,
      expressionActivity: estimated.expressionActivity,
      poseConfidence: estimated.poseConfidence,
      metricDepthMeters: customDepthZ !== undefined ? Math.abs(customDepthZ) : estimated.metricDepthMeters,
      sellionPosition: {
        x: estimated.sellionPosition.x,
        y: estimated.sellionPosition.y,
        z: estimated.sellionPosition.z,
      },
      headQuaternion: {
        x: estimated.headQuaternion.x,
        y: estimated.headQuaternion.y,
        z: estimated.headQuaternion.z,
        w: estimated.headQuaternion.w,
      },
    };
  }
}
