import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { OneEuroFilter, Vector3Filter } from "../../lib/try-on/tracking/OneEuroFilter";

describe("OneEuroFilter", () => {
  it("should significantly reduce high-frequency micro-jitter on stationary signal", () => {
    const filter = new OneEuroFilter(1.0, 0.007, 1.0);
    const nominal = 10.0;
    const noisySamples: number[] = [];
    const filteredSamples: number[] = [];

    let time = 1000;
    for (let i = 0; i < 50; i++) {
      time += 33; // ~30 FPS
      const noise = (Math.sin(i * 1.5) + Math.cos(i * 3.7)) * 0.5; // Simulated sensor noise
      const sample = nominal + noise;
      noisySamples.push(sample);
      filteredSamples.push(filter.filter(sample, time));
    }

    // Variance calculation on last 30 samples (after initial filter settle)
    const steadyFiltered = filteredSamples.slice(20);
    const mean = steadyFiltered.reduce((a, b) => a + b, 0) / steadyFiltered.length;
    const variance = steadyFiltered.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / steadyFiltered.length;

    // Noisy variance
    const steadyNoisy = noisySamples.slice(20);
    const noisyMean = steadyNoisy.reduce((a, b) => a + b, 0) / steadyNoisy.length;
    const noisyVariance = steadyNoisy.reduce((sum, v) => sum + Math.pow(v - noisyMean, 2), 0) / steadyNoisy.length;

    assert.ok(
      variance < noisyVariance * 0.35,
      `Filter should reduce variance by at least 65%. Raw: ${noisyVariance.toFixed(4)}, Filtered: ${variance.toFixed(4)}`
    );
  });

  it("should adaptively open cutoff and track rapid step movements quickly", () => {
    const filter = new OneEuroFilter(1.0, 0.01, 1.0);
    let time = 1000;

    // Settle at 0
    for (let i = 0; i < 10; i++) {
      time += 33;
      filter.filter(0, time);
    }

    // Sudden step change from 0 to 100 (fast head turn)
    time += 33;
    const step1 = filter.filter(100, time);
    time += 33;
    const step2 = filter.filter(100, time);
    time += 33;
    const step3 = filter.filter(100, time);

    assert.ok(step3 > 75, `Filter should reach >75% of step within 3 frames. Reached: ${step3}`);
  });

  it("should filter 3D vectors accurately across X, Y, Z", () => {
    const vFilter = new Vector3Filter();
    const res = vFilter.filter({ x: 1, y: 2, z: 3 }, 1000);
    assert.equal(res.x, 1);
    assert.equal(res.y, 2);
    assert.equal(res.z, 3);
  });

  it("should freeze stationary sensor noise via CA-EKF quiescent deadband", () => {
    const { SmoothingEngine } = require("../../lib/try-on/tracking/SmoothingEngine");
    const THREE = require("three");
    const engine = new SmoothingEngine();

    const nominalPos = new THREE.Vector3(0.0, 0.0, -0.55);
    const nominalQuat = new THREE.Quaternion(0, 0, 0, 1);

    let time = 1000;
    // Initialize
    engine.filterPose(nominalPos, nominalQuat, time, 16);

    const filteredSamples: number[] = [];
    const noisySamples: number[] = [];

    // Feed small stationary Gaussian-like micro-tremor (sensor noise ~ 0.5mm)
    for (let i = 0; i < 40; i++) {
      time += 33;
      const noise = (Math.sin(i * 1.9) + Math.cos(i * 4.3)) * 0.0006;
      const sample = new THREE.Vector3(noise, 0.0, -0.55);
      noisySamples.push(noise);

      const out = engine.filterPose(sample, nominalQuat, time, 16);
      filteredSamples.push(out.position.x);
    }

    const steadyFiltered = filteredSamples.slice(15);
    const steadyNoisy = noisySamples.slice(15);

    const varFiltered = steadyFiltered.reduce((sum, v) => sum + v * v, 0) / steadyFiltered.length;
    const varNoisy = steadyNoisy.reduce((sum, v) => sum + v * v, 0) / steadyNoisy.length;

    assert.ok(
      varFiltered < varNoisy * 0.25,
      `EKF quiescent deadband should damp stationary noise variance by >75%. Filtered var: ${varFiltered.toExponential(3)}, Noisy var: ${varNoisy.toExponential(3)}`
    );
    assert.ok(engine.getActivityFactor() < 0.2, "Activity factor should remain low during stationary state");
  });

  it("should forward-extrapolate during head motion to cancel tracking latency", () => {
    const { SmoothingEngine } = require("../../lib/try-on/tracking/SmoothingEngine");
    const THREE = require("three");
    const engine = new SmoothingEngine();

    let time = 1000;
    const quat = new THREE.Quaternion(0, 0, 0, 1);

    // Initial settle
    for (let i = 0; i < 10; i++) {
      time += 33;
      engine.filterPose(new THREE.Vector3(0, 0, -0.55), quat, time, 20);
    }

    // Move along +X at constant velocity (0.2 m/s -> 0.0066m per 33ms)
    let currentX = 0;
    let lastOut: any = null;
    for (let i = 0; i < 15; i++) {
      time += 33;
      currentX += 0.0066;
      lastOut = engine.filterPose(new THREE.Vector3(currentX, 0, -0.55), quat, time, 24);
    }

    assert.ok(lastOut, "Output must be defined");
    assert.ok(
      engine.getActivityFactor() > 0.3,
      `Activity factor should detect active motion, got ${engine.getActivityFactor()}`
    );
    // Predictive lead should place extrapolated position ahead of or equal to current measured X
    assert.ok(
      lastOut.position.x >= currentX - 0.002,
      `Predicted X (${lastOut.position.x.toFixed(4)}) should compensate lag relative to measured X (${currentX.toFixed(4)})`
    );
  });
});

