import { describe, it } from "node:test";
import assert from "node:assert/strict";
import * as THREE from "three";
import { ModelLoader } from "../../lib/try-on/assets/ModelLoader";

describe("ModelLoader and Optical Shader Normalization", () => {
  it("should uniformly scale raw CAD eyewear to standard adult width (140mm)", () => {
    const rawGroup = new THREE.Group();
    // Create a mock frame mesh: width 2.5m (giant CAD export)
    const frameGeom = new THREE.BoxGeometry(2.5, 0.8, 1.2);
    const frameMesh = new THREE.Mesh(frameGeom, new THREE.MeshStandardMaterial({ name: "frame_acetate" }));
    rawGroup.add(frameMesh);

    const normalized = ModelLoader.normalizeModel(rawGroup, 140.0);
    const box = new THREE.Box3().setFromObject(normalized);
    const size = box.getSize(new THREE.Vector3());

    assert.ok(
      Math.abs(size.x - 0.14) < 0.001,
      `Normalized frame width should equal 0.140m (140mm). Got ${size.x.toFixed(4)}m`
    );
  });

  it("should detect and auto-reorient backward-facing (-Z) CAD eyewear", () => {
    const rawGroup = new THREE.Group();
    // Simulate backward-facing eyewear: front rims at -Z (-0.5), temples at +Z (+0.5)
    const frontRimGeom = new THREE.BoxGeometry(1.0, 0.4, 0.1);
    const frontRim = new THREE.Mesh(frontRimGeom, new THREE.MeshStandardMaterial({ name: "front_rim" }));
    frontRim.position.set(0, 0, -0.45);

    const templeGeom = new THREE.BoxGeometry(0.05, 0.05, 0.8);
    const temple = new THREE.Mesh(templeGeom, new THREE.MeshStandardMaterial({ name: "temple_arm" }));
    temple.position.set(0.45, 0, 0.1);

    rawGroup.add(frontRim, temple);

    const normalized = ModelLoader.normalizeModel(rawGroup, 140.0);
    assert.equal(normalized.userData.wasFlippedZ, true, "Model should be flagged and flipped across Y axis");
  });

  it("should inject dielectric physical material with Schlick Fresnel & AR coating on lenses", () => {
    const rawGroup = new THREE.Group();
    const lensGeom = new THREE.PlaneGeometry(0.05, 0.04);
    const lensMesh = new THREE.Mesh(lensGeom, new THREE.MeshStandardMaterial({ name: "glass_lens" }));
    lensMesh.name = "left_lens_mesh";
    rawGroup.add(lensMesh);

    ModelLoader.upgradeEyewearMaterials(rawGroup, {
      isSunglass: false,
      arCoatingType: "emerald",
    });

    assert.ok(lensMesh.material instanceof THREE.MeshPhysicalMaterial);
    const mat = lensMesh.material as THREE.MeshPhysicalMaterial;
    assert.equal(mat.transparent, true);
    assert.ok(mat.opacity <= 0.25, "Prescription optical lenses must have high transparency");
    assert.equal(mat.depthWrite, false, "Lenses must not write to depth buffer in WebAR");
    assert.ok(mat.onBeforeCompile !== undefined, "Lenses must have onBeforeCompile shader hook");

    // Test onBeforeCompile shader injection
    const mockShader = {
      uniforms: {} as any,
      fragmentShader: "#include <dithering_fragment>",
    };
    mat.onBeforeCompile(mockShader as any, null as any);

    assert.ok(mockShader.uniforms.uArColorPrimary, "Must register primary AR coating uniform");
    assert.ok(mockShader.uniforms.uArColorSecondary, "Must register secondary AR coating uniform");
    assert.ok(mockShader.fragmentShader.includes("fresnelTerm"), "Fragment shader must compute Fresnel term");
  });
});
