import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateInterEyeDistance,
  computeBaseScale,
  REFERENCE_EYE_DISTANCE_NORM,
} from "../../lib/try-on/calibration/ScaleCalibration";
import { applyCalibration } from "../../lib/try-on/calibration/FrameCalibration";
import { FacePose } from "../../types/tryOn";

describe("ScaleCalibration", () => {
  it("should calculate correct Euclidean inter-eye distance", () => {
    const rightEye = { x: 0.4, y: 0.5 };
    const leftEye = { x: 0.6, y: 0.5 };
    const dist = calculateInterEyeDistance(rightEye, leftEye);
    assert.equal(Math.round(dist * 100) / 100, 0.2);
  });

  it("should scale up when user moves closer to camera", () => {
    const normalEyeDist = REFERENCE_EYE_DISTANCE_NORM;
    const closeEyeDist = normalEyeDist * 1.5; // 50% closer

    const normalScale = computeBaseScale(normalEyeDist);
    const closeScale = computeBaseScale(closeEyeDist);

    assert.equal(Math.round(normalScale), 1);
    assert.ok(closeScale > normalScale * 1.4, "Scale should increase proportionally when closer");
  });

  it("should apply product-specific scaleMultiplier faithfully", () => {
    const mockPose: FacePose = {
      position: { x: 0, y: 0, z: -0.55 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      eyeDistance: 0.18,
      scale: 1.0,
    };

    const calibrated = applyCalibration(mockPose, {
      scaleMultiplier: 1.15,
      verticalOffset: -0.01,
      depthOffset: 0.02,
      pitchOffset: 0.03,
      yawOffset: 0,
      rollOffset: 0,
    });

    assert.equal(calibrated.scale, 1.15);
    assert.equal(calibrated.position.y, -0.01);
    assert.equal(calibrated.position.z, -0.55 + 0.02);
    assert.equal(calibrated.rotation.pitch, 0.03);
  });
});
