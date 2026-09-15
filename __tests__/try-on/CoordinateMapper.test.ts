import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { VideoToRenderCoordinateMapper } from "../../lib/try-on/rendering/VideoToRenderCoordinateMapper";

describe("VideoToRenderCoordinateMapper", () => {
  it("should map center normalized landmark (0.5, 0.5) to center of screen", () => {
    const mapper = new VideoToRenderCoordinateMapper({
      containerWidth: 1000,
      containerHeight: 1000,
      videoWidth: 1000,
      videoHeight: 1000,
      mirrored: false,
    });

    const screen = mapper.mapNormalizedToScreen(0.5, 0.5);
    assert.equal(Math.round(screen.x), 500);
    assert.equal(Math.round(screen.y), 500);

    const ndc = mapper.mapNormalizedToNDC(0.5, 0.5);
    assert.equal(Math.round(ndc.x), 0);
    assert.equal(Math.round(ndc.y), 0);
  });

  it("should invert X position when mirrored is true (front-facing webcam)", () => {
    const mapper = new VideoToRenderCoordinateMapper({
      containerWidth: 1000,
      containerHeight: 1000,
      videoWidth: 1000,
      videoHeight: 1000,
      mirrored: true,
    });

    // 0.2 from left on camera should be mapped to 0.8 on screen when mirrored
    const screen = mapper.mapNormalizedToScreen(0.2, 0.5);
    assert.equal(Math.round(screen.x), 800);
  });

  it("should correctly handle object-fit: cover cropping for tall mobile viewports", () => {
    // Container: 400x800 (ratio 0.5). Video: 1280x720 (ratio 1.77)
    // Video will scale to height 800 and width ~1422, cropped on left & right
    const mapper = new VideoToRenderCoordinateMapper({
      containerWidth: 400,
      containerHeight: 800,
      videoWidth: 1280,
      videoHeight: 720,
      mirrored: false,
    });

    const offsets = mapper.getCropOffsets();
    assert.ok(offsets.offsetX > 0, "Horizontal crop offset should be positive");
    assert.equal(Math.round(offsets.offsetY), 0, "Vertical crop should be 0 when constrained by height");

    // Center landmark should still map to center of container (x=200, y=400)
    const screen = mapper.mapNormalizedToScreen(0.5, 0.5);
    assert.equal(Math.round(screen.x), 200);
    assert.equal(Math.round(screen.y), 400);
  });
});
