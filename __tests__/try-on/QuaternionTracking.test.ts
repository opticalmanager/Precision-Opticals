import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { SmoothingEngine } from "../../lib/try-on/tracking/SmoothingEngine";
import { applyCalibration } from "../../lib/try-on/calibration/FrameCalibration";
import { computeDynamicDepthZ, computeBaseScale } from "../../lib/try-on/calibration/ScaleCalibration";
import { FacePose } from "../../types/tryOn";

describe("QuaternionTracking and SLERP Smoothing", () => {
  it("should calculate dynamic depth proportional to inter-eye distance", () => {
    const normalEyeDist = 0.095;
    const closeEyeDist = 0.15;
    const farEyeDist = 0.06;

    const depthNormal = computeDynamicDepthZ(normalEyeDist);
    const depthClose = computeDynamicDepthZ(closeEyeDist);
    const depthFar = computeDynamicDepthZ(farEyeDist);

    assert.ok(depthNormal < 0);
    assert.ok(depthClose < 0);
    assert.ok(depthFar < 0);

    assert.ok(depthClose > depthNormal, "Closer face should have less negative depth");
    assert.ok(depthNormal > depthFar, "Farther face should have more negative depth");
  });

  it("should blend IPD and temple face width for robust scaling", () => {
    const ipd = 0.095;
    const faceWidth = 0.21;
    const blendedScale = computeBaseScale(ipd, faceWidth);

    assert.equal(Math.round(blendedScale * 100) / 100, 1.0);
  });

  it("should apply quaternion rotation smoothing via SLERP", () => {
    const engine = new SmoothingEngine();

    const pose1: FacePose = {
      position: { x: 0, y: 0, z: -0.55 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      eyeDistance: 0.095,
      scale: 1.0,
    };

    const r1 = engine.filter(pose1, 1000);
    assert.ok(r1.quaternion);
    assert.equal(r1.quaternion.w, 1);

    const targetEuler = new THREE.Euler(0, Math.PI / 4, 0, "YXZ");
    const targetQuat = new THREE.Quaternion().setFromEuler(targetEuler);

    const pose2: FacePose = {
      position: { x: 0, y: 0, z: -0.55 },
      rotation: { pitch: 0, yaw: Math.PI / 4, roll: 0 },
      quaternion: { x: targetQuat.x, y: targetQuat.y, z: targetQuat.z, w: targetQuat.w },
      eyeDistance: 0.095,
      scale: 1.0,
    };

    const r2 = engine.filter(pose2, 1033);
    assert.ok(r2.quaternion);

    const len = Math.sqrt(
      r2.quaternion.x ** 2 +
      r2.quaternion.y ** 2 +
      r2.quaternion.z ** 2 +
      r2.quaternion.w ** 2
    );
    assert.ok(Math.abs(len - 1.0) < 0.001, "Quaternion must remain unit length");
    assert.ok(r2.quaternion.y > 0, "Yaw component should move towards target");
  });

  it("should output calibrated quaternion from applyCalibration", () => {
    const mockPose: FacePose = {
      position: { x: 0, y: 0, z: -0.55 },
      rotation: { pitch: 0, yaw: 0, roll: 0 },
      quaternion: { x: 0, y: 0, z: 0, w: 1 },
      eyeDistance: 0.095,
      scale: 1.0,
    };

    const calibrated = applyCalibration(mockPose, {
      scaleMultiplier: 1.0,
      verticalOffset: 0,
      depthOffset: 0,
      pitchOffset: 0.1,
      yawOffset: 0.2,
      rollOffset: 0,
    });

    assert.ok(calibrated.quaternion);
    const len = Math.sqrt(
      calibrated.quaternion.x ** 2 +
      calibrated.quaternion.y ** 2 +
      calibrated.quaternion.z ** 2 +
      calibrated.quaternion.w ** 2
    );
    assert.ok(Math.abs(len - 1.0) < 0.001);
  });

  it("should accurately gate soft-tissue expression movements (blinking and smiling)", () => {
    const { FacePoseEstimator } = require("../../lib/try-on/vision/FacePoseEstimator");
    const estimator = new FacePoseEstimator();

    // Generate neutral 478 landmarks
    const neutralLandmarks = Array.from({ length: 478 }, (_, i) => ({
      x: 0.5,
      y: 0.5,
      z: 0.0,
    }));

    // Eye landmarks for EAR
    neutralLandmarks[33] = { x: 0.40, y: 0.40, z: 0 };
    neutralLandmarks[133] = { x: 0.45, y: 0.40, z: 0 };
    neutralLandmarks[159] = { x: 0.425, y: 0.385, z: 0 };
    neutralLandmarks[145] = { x: 0.425, y: 0.415, z: 0 };

    neutralLandmarks[362] = { x: 0.55, y: 0.40, z: 0 };
    neutralLandmarks[263] = { x: 0.60, y: 0.40, z: 0 };
    neutralLandmarks[386] = { x: 0.575, y: 0.385, z: 0 };
    neutralLandmarks[374] = { x: 0.575, y: 0.415, z: 0 };

    // Medial canthi & mouth corners
    neutralLandmarks[243] = { x: 0.46, y: 0.40, z: 0 };
    neutralLandmarks[463] = { x: 0.54, y: 0.40, z: 0 };
    neutralLandmarks[61] = { x: 0.45, y: 0.65, z: 0 };
    neutralLandmarks[291] = { x: 0.55, y: 0.65, z: 0 };

    const neutralActivity = estimator.computeExpressionActivity(neutralLandmarks);
    assert.ok(neutralActivity < 0.2, "Neutral face should have low expression activity");

    // Simulate wide smile: mouth corners stretch wider
    const smileLandmarks = neutralLandmarks.map((pt) => ({ ...pt }));
    smileLandmarks[61] = { x: 0.41, y: 0.64, z: 0 };
    smileLandmarks[291] = { x: 0.59, y: 0.64, z: 0 };

    const smileActivity = estimator.computeExpressionActivity(smileLandmarks);
    assert.ok(smileActivity > neutralActivity, "Smile should increase expression activity");
    assert.ok(smileActivity > 0.4, "Wide smile should register significant expression score");
  });

  it("should converge Bayesian IPD calibration towards measured user IPD across frames", () => {
    const { FacePoseEstimator } = require("../../lib/try-on/vision/FacePoseEstimator");
    const estimator = new FacePoseEstimator();

    const landmarks = Array.from({ length: 478 }, () => ({ x: 0.5, y: 0.5, z: 0.0 }));
    // Video dimension 1280x720
    // Iris limbus: 24 pixels diameter (horizontal)
    // For 58mm target IPD: ipdPx = (58 / 11.7) * 24 = 118.97px -> dx in normalized coords = 118.97 / 1280 = 0.0929
    const irisPx = 24.0;
    const dxNorm = irisPx / 1280.0;
    landmarks[469] = { x: 0.45 - dxNorm / 2, y: 0.4, z: 0 };
    landmarks[471] = { x: 0.45 + dxNorm / 2, y: 0.4, z: 0 };
    landmarks[474] = { x: 0.55 - dxNorm / 2, y: 0.4, z: 0 };
    landmarks[476] = { x: 0.55 + dxNorm / 2, y: 0.4, z: 0 };

    const targetIpdMm = 58.0;
    const targetIpdPx = (targetIpdMm / 11.7) * irisPx;
    const targetIpdNorm = targetIpdPx / 1280.0;
    landmarks[468] = { x: 0.50 - targetIpdNorm / 2, y: 0.4, z: 0 };
    landmarks[473] = { x: 0.50 + targetIpdNorm / 2, y: 0.4, z: 0 };

    // Initial prior should be 63.0 mm
    assert.equal(estimator.getCalibratedIpdMm(), 63.0);

    // Feed 35 frames
    for (let frame = 0; frame < 35; frame++) {
      estimator.updateIrisIpdCalibration(landmarks, 1280, 720, 0.05);
    }

    const calibratedIpd = estimator.getCalibratedIpdMm();
    assert.ok(estimator.getIpdSampleCount() >= 30, "Should have processed calibration frames");
    assert.ok(
      Math.abs(calibratedIpd - 58.0) < 1.0,
      `Bayesian estimator should converge to ~58.0mm, got ${calibratedIpd.toFixed(2)}mm`
    );
  });
});

