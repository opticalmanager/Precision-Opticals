import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { FaceQualityAssessor } from "../../lib/try-on/vision/FaceQualityAssessor";

describe("FaceQualityAssessor", () => {
  it("should return LOST state when landmarks array is null or empty", () => {
    const result = FaceQualityAssessor.assess(null);
    assert.equal(result.state, "LOST");
    assert.equal(result.overallConfidence, 0);
  });

  it("should detect extreme head yaw and lower confidence state", () => {
    // 478 mock landmarks centered around 0.5
    const mockLandmarks = Array.from({ length: 478 }, (_, i) => ({
      x: 0.35 + (i % 20) * 0.015,
      y: 0.35 + Math.floor(i / 20) * 0.015,
    }));

    // Head turned by 55 degrees (0.96 radians)
    const extremeYaw = (55 * Math.PI) / 180;
    const result = FaceQualityAssessor.assess(mockLandmarks, 0, extremeYaw, 0, 1.0);

    assert.equal(result.isWithinRotationBounds, false);
    assert.ok(result.overallConfidence < 0.75);
    const msg = (result.message || "").toLowerCase();
    assert.ok(msg.includes("face the camera") || msg.includes("turn"));
  });

  it("should score HIGH_CONFIDENCE for centered face looking straight ahead", () => {
    const mockLandmarks = Array.from({ length: 478 }, (_, i) => ({
      x: 0.35 + (i % 20) * 0.015,
      y: 0.35 + Math.floor(i / 20) * 0.015,
    }));

    const result = FaceQualityAssessor.assess(mockLandmarks, 0, 0, 0, 1.0);
    assert.equal(result.state, "HIGH_CONFIDENCE");
    assert.equal(result.isCentered, true);
    assert.equal(result.isWithinRotationBounds, true);
    assert.ok(result.overallConfidence >= 0.75);
  });
});
