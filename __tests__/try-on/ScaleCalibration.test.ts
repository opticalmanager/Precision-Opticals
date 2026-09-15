import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  calculateInterEyeDistance,
  computeBaseScale,
  computeDynamicDepthZ,
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

  it("should scale depth closer when user moves closer to camera while keeping base scale stable", () => {
    const normalEyeDist = 0.095;
    const closeEyeDist = normalEyeDist * 1.5; // 50% closer

    const normalDepth = computeDynamicDepthZ(normalEyeDist);
    const closeDepth = computeDynamicDepthZ(closeEyeDist);

    // Distance scaling: Closer face brings metric depth closer to camera (less negative Z)
    assert.ok(closeDepth > normalDepth, "Metric depth should be closer to camera when user is closer");

    // Physical proportion stability: Base scale remains distance-invariant to prevent double-scaling
    const normalScale = computeBaseScale(normalEyeDist);
    const closeScale = computeBaseScale(closeEyeDist);
    assert.equal(normalScale, 1.0);
    assert.equal(closeScale, 1.0);
  });

  it("should apply product-specific scaleMultiplier and translation offsets faithfully", () => {
    const mockPose: FacePose = {
      position: { x: 0, y: 0, z: -0.55 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      eyeDistance: 0.18,
      scale: 1.0,
    };

    // 1. Direct translation without rotation
    const calibDirect = applyCalibration(mockPose, {
      scaleMultiplier: 1.15,
      verticalOffset: -0.01,
      depthOffset: 0.02,
      pitchOffset: 0,
      yawOffset: 0,
      rollOffset: 0,
    });

    assert.equal(calibDirect.scale, 1.15);
    assert.equal(Math.round(calibDirect.position.y * 1000) / 1000, -0.01);
    assert.equal(Math.round(calibDirect.position.z * 1000) / 1000, -0.53);

    // 2. Translation coupled with pantoscopic pitch rotation
    const calibRotated = applyCalibration(mockPose, {
      scaleMultiplier: 1.15,
      verticalOffset: -0.01,
      depthOffset: 0.02,
      pitchOffset: 0.03,
      yawOffset: 0,
      rollOffset: 0,
    });

    assert.equal(calibRotated.scale, 1.15);
    assert.ok(Math.abs(calibRotated.position.y - (-0.0106)) < 0.001);
    assert.ok(Math.abs(calibRotated.position.z - (-0.55 + 0.0203)) < 0.001);
    assert.ok(Math.abs(calibRotated.rotation.pitch - 0.03) < 0.001);
  });
});
