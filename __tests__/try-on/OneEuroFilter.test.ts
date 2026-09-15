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
});
