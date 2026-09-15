import * as THREE from "three";
import { LANDMARKS } from "./LandmarkIndices";
import { FacePose } from "@/types/tryOn";
import {
  calculateInterEyeDistance,
  calculateFaceWidth,
  computeBaseScale,
  computeDynamicDepthZ,
} from "../calibration/ScaleCalibration";
import { VideoToRenderCoordinateMapper } from "../rendering/VideoToRenderCoordinateMapper";

export interface LandmarkPoint {
  x: number;
  y: number;
  z?: number;
}

export class FacePoseEstimator {
  private static tempMatrix = new THREE.Matrix4();
  private static tempEuler = new THREE.Euler();
  private static tempQuat = new THREE.Quaternion();

  /**
   * Estimates FacePose with Quaternion orientation using 4x4 facial transformation matrix
   * or anatomical landmark trigonometry as a robust fallback.
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

    const rightEye = landmarks[LANDMARKS.RIGHT_PUPIL] || landmarks[LANDMARKS.RIGHT_EYE_INNER];
    const leftEye = landmarks[LANDMARKS.LEFT_PUPIL] || landmarks[LANDMARKS.LEFT_EYE_INNER];
    const noseSellion = landmarks[LANDMARKS.NOSE_BRIDGE_SELLION] || landmarks[LANDMARKS.NOSE_BRIDGE_MID];
    const rightTemple = landmarks[LANDMARKS.RIGHT_TEMPLE];
    const leftTemple = landmarks[LANDMARKS.LEFT_TEMPLE];

    // Calculate eye distance and face width
    const interEyeDist = calculateInterEyeDistance(rightEye, leftEye);
    const faceWidth = rightTemple && leftTemple ? calculateFaceWidth(rightTemple, leftTemple) : undefined;
    const baseScale = computeBaseScale(interEyeDist, faceWidth);

    // Compute dynamic perspective depth based on face size in viewport
    const depthZ = customDepthZ ?? computeDynamicDepthZ(interEyeDist, 45);

    // Map 3D position of the nose bridge (where eyewear bridge rests)
    const position = coordMapper.mapNormalizedTo3D(noseSellion.x, noseSellion.y, depthZ);

    let pitch = 0.0;
    let yaw = 0.0;
    let roll = 0.0;
    let matrixSuccess = false;

    // 1. Try extracting rigid rotation from MediaPipe transformation matrix
    if (matrixData && matrixData.data && matrixData.data.length >= 16) {
      try {
        this.tempMatrix.fromArray(matrixData.data);
        // Extract Euler angles (YXZ order is natural for head orientation: yaw, pitch, roll)
        this.tempEuler.setFromRotationMatrix(this.tempMatrix, "YXZ");

        // Validate values are finite numbers
        if (
          Number.isFinite(this.tempEuler.x) &&
          Number.isFinite(this.tempEuler.y) &&
          Number.isFinite(this.tempEuler.z)
        ) {
          // MediaPipe coordinate space: X right, Y up, Z forward (towards viewer)
          pitch = -this.tempEuler.x;
          // Invert yaw and roll when mirrored so turning right rotates right in the mirror view
          yaw = coordMapper.isMirrored() ? -this.tempEuler.y : this.tempEuler.y;
          roll = coordMapper.isMirrored() ? this.tempEuler.z : -this.tempEuler.z;
          matrixSuccess = true;
        }
      } catch {
        matrixSuccess = false;
      }
    }

    // 2. Anatomical Landmark Trigonometry (used if matrix is missing or failed)
    if (!matrixSuccess) {
      // Roll: Angle of the eye line relative to horizontal
      const dx = leftEye.x - rightEye.x;
      const dy = leftEye.y - rightEye.y;
      const rawRoll = Math.atan2(dy, dx);
      roll = coordMapper.isMirrored() ? -rawRoll : rawRoll;

      // Yaw: Asymmetry of nose relative to eye centers
      const eyeMidX = (rightEye.x + leftEye.x) / 2.0;
      const noseOffset = noseSellion.x - eyeMidX;
      const rawYaw = (noseOffset / (interEyeDist || 0.1)) * 1.6;
      yaw = coordMapper.isMirrored() ? -rawYaw : rawYaw;

      // Pitch: Vertical position of nose sellion relative to eye center and mouth/chin
      const eyeMidY = (rightEye.y + leftEye.y) / 2.0;
      const chin = landmarks[LANDMARKS.CHIN];
      if (chin) {
        const faceHeight = Math.abs(chin.y - eyeMidY);
        const noseRelative = (noseSellion.y - eyeMidY) / (faceHeight || 0.2);
        // Standard neutral nose position is ~0.35 of eye-to-chin distance
        pitch = (noseRelative - 0.35) * 2.2;
      }
    }

    // 3. Construct unified, normalized Quaternion representation
    this.tempEuler.set(pitch, yaw, roll, "YXZ");
    this.tempQuat.setFromEuler(this.tempEuler);

    return {
      position,
      rotation: {
        pitch,
        yaw,
        roll,
      },
      quaternion: {
        x: this.tempQuat.x,
        y: this.tempQuat.y,
        z: this.tempQuat.z,
        w: this.tempQuat.w,
      },
      eyeDistance: interEyeDist,
      scale: baseScale,
    };
  }
}
