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

  it("should calculate exact unprojection-reprojection identity across mobile and desktop viewports", () => {
    const THREE = require("three");
    const mapper = new VideoToRenderCoordinateMapper({
      containerWidth: 390,
      containerHeight: 844,
      videoWidth: 1280,
      videoHeight: 720,
      verticalFovDeg: 63.0,
      isMirrored: true,
    });

    const camera = new THREE.PerspectiveCamera(45, 390 / 844, 0.01, 10.0);
    mapper.applyToThreeCamera(camera);

    // Unproject landmark at (0.48, 0.45) at depth Z = -0.55m
    const worldPos = mapper.unprojectLandmarkToWorld(0.48, 0.45, -0.55);
    assert.ok(worldPos.z < 0, "Depth Z must be negative in Three.js world space");
    assert.equal(Math.round(worldPos.z * 100) / 100, -0.55);

    // Reproject via videoNormalizedToNDC
    const ndc = mapper.videoNormalizedToNDC(0.48, 0.45);
    assert.ok(ndc.xNdc >= -1.0 && ndc.xNdc <= 1.0, "NDC X must be within [-1, 1]");
    assert.ok(ndc.yNdc >= -1.0 && ndc.yNdc <= 1.0, "NDC Y must be within [-1, 1]");

    // Exact identity: WorldPos projected through camera projection matrix must equal ndc
    const projected = worldPos.clone().applyMatrix4(camera.projectionMatrix);
    assert.ok(Math.abs(projected.x - ndc.xNdc) < 1e-4, "Projected X must match NDC X");
    assert.ok(Math.abs(projected.y - ndc.yNdc) < 1e-4, "Projected Y must match NDC Y");
  });

  it("should accurately synchronize Three.js camera projection matrix with cover crop factors", () => {
    const THREE = require("three");
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10.0);

    const mapper = new VideoToRenderCoordinateMapper({
      containerWidth: 800,
      containerHeight: 500,
      videoWidth: 1280,
      videoHeight: 720,
      verticalFovDeg: 63.0,
      isMirrored: true,
    });

    mapper.applyToThreeCamera(camera);

    assert.ok(camera.fov > 50 && camera.fov < 70, `Effective FOV should be reasonable, got ${camera.fov}`);
    assert.equal(camera.aspect, 800 / 500);

    // Projection matrix should have valid non-zero elements
    assert.ok(camera.projectionMatrix.elements[0] > 0);
    assert.ok(camera.projectionMatrix.elements[5] > 0);
    assert.ok(camera.projectionMatrix.elements[11] === -1);
  });

  it("should infer sensor FOV accurately based on track label and orientation", () => {
    const macbookTrack = {
      label: "FaceTime HD Camera",
    };
    const mockMacStream = {
      getVideoTracks: () => [macbookTrack],
    } as any;

    const fovLandscape = VideoToRenderCoordinateMapper.inferCameraVerticalFovDeg(mockMacStream, 1280, 720);
    assert.equal(fovLandscape, 54.0);

    const fovPortrait = VideoToRenderCoordinateMapper.inferCameraVerticalFovDeg(mockMacStream, 720, 1280);
    assert.equal(fovPortrait, 63.0);
  });
});

