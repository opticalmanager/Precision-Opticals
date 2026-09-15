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
});
