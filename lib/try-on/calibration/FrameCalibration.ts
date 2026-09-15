import * as THREE from "three";
import { FrameCalibration, FacePose } from "@/types/tryOn";

export const DEFAULT_CALIBRATION: FrameCalibration = {
  scaleMultiplier: 1.0,
  verticalOffset: 0.0,
  depthOffset: 0.0,
  horizontalOffset: 0.0,
  pitchOffset: 0.0,
  yawOffset: 0.0,
  rollOffset: 0.0,
};

/**
 * Applies per-product optical calibration offsets to the smoothed face pose.
 * Uses rotation vectors to orient offsets naturally with the user's head orientation.
 */
export function applyCalibration(
  pose: FacePose,
  calibration: FrameCalibration = DEFAULT_CALIBRATION
): {
  position: { x: number; y: number; z: number };
  rotation: { pitch: number; yaw: number; roll: number };
  quaternion: { x: number; y: number; z: number; w: number };
  scale: number;
} {
  const finalScale = pose.scale * (calibration.scaleMultiplier || 1.0);

  // Rotation Euler angles with calibration offsets
  const pitch = pose.rotation.pitch + (calibration.pitchOffset || 0.0);
  const yaw = pose.rotation.yaw + (calibration.yawOffset || 0.0);
  const roll = pose.rotation.roll + (calibration.rollOffset || 0.0);

  // Derive calibrated quaternion
  const euler = new THREE.Euler(pitch, yaw, roll, "YXZ");
  const quat = new THREE.Quaternion().setFromEuler(euler);

  // Transform local frame offsets (horizontal, vertical, depth) along head orientation
  const vOffset = calibration.verticalOffset || 0.0;
  const dOffset = calibration.depthOffset || 0.0;
  const hOffset = calibration.horizontalOffset || 0.0;

  // Approximate rotation of offsets by head angles for realistic adherence
  // Pitch rotates Y and Z:
  const cosP = Math.cos(pose.rotation.pitch);
  const sinP = Math.sin(pose.rotation.pitch);
  const cosY = Math.cos(pose.rotation.yaw);
  const sinY = Math.sin(pose.rotation.yaw);

  const localY = vOffset * cosP - dOffset * sinP;
  const localZ = vOffset * sinP + dOffset * cosP;
  const localX = hOffset * cosY - dOffset * sinY;

  return {
    position: {
      x: pose.position.x + localX,
      y: pose.position.y + localY,
      z: pose.position.z + localZ,
    },
    rotation: {
      pitch,
      yaw,
      roll,
    },
    quaternion: {
      x: quat.x,
      y: quat.y,
      z: quat.z,
      w: quat.w,
    },
    scale: finalScale,
  };
}
