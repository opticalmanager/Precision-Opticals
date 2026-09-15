import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import fs from "fs";
import path from "path";

if (typeof global.FileReader === "undefined") {
  global.FileReader = class FileReader {
    readAsArrayBuffer(blob) {
      blob.arrayBuffer().then((buf) => {
        this.result = buf;
        if (this.onload) this.onload({ target: this });
        if (this.onloadend) this.onloadend({ target: this });
      });
    }
  };
}

const outputDir = path.join(process.cwd(), "public", "models", "eyewear");
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

function createEyewearModel({
  frameColor = 0xd4af37,
  lensColor = 0x88c0d0,
  metalness = 0.9,
  roughness = 0.2,
  isRound = false,
  isWayfarer = false,
  isRimless = false,
}) {
  const root = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({
    color: frameColor,
    metalness,
    roughness,
  });

  const lensMat = new THREE.MeshPhysicalMaterial({
    color: lensColor,
    opacity: 0.18,
    transparent: true,
    roughness: 0.06,
    metalness: 0.0,
    ior: 1.52,
    reflectivity: 0.5,
    clearcoat: 1.0,
    clearcoatRoughness: 0.05,
    transmission: 0,
    depthWrite: false,
    depthTest: true,
    side: THREE.DoubleSide,
  });

  const eyeSpacing = 0.033; // ~66mm total eye spacing
  const lensRadius = isRound ? 0.022 : 0.024;

  // 1. Rims & Lenses (Left and Right)
  [-eyeSpacing, eyeSpacing].forEach((xPos, idx) => {
    // Lens
    let lensGeom;
    if (isRound) {
      lensGeom = new THREE.CylinderGeometry(lensRadius, lensRadius, 0.001, 32);
      lensGeom.rotateX(Math.PI / 2);
    } else {
      // Rectangular / Wayfarer
      lensGeom = new THREE.BoxGeometry(0.048, 0.034, 0.001);
    }

    const lensMesh = new THREE.Mesh(lensGeom, lensMat);
    lensMesh.name = idx === 0 ? "rightLens" : "leftLens";
    lensMesh.position.set(xPos, 0, 0);
    root.add(lensMesh);

    // Rim
    if (!isRimless) {
      let rimMesh;
      if (isRound) {
        const torusGeom = new THREE.TorusGeometry(lensRadius, 0.0015, 12, 32);
        rimMesh = new THREE.Mesh(torusGeom, frameMat);
      } else {
        // Wireframe box/torus
        const rimGeom = isWayfarer
          ? new THREE.TorusGeometry(lensRadius * 1.1, 0.003, 12, 4) // thick acetate
          : new THREE.TorusGeometry(lensRadius * 1.05, 0.0015, 12, 4);
        rimGeom.rotateZ(Math.PI / 4);
        rimMesh = new THREE.Mesh(rimGeom, frameMat);
      }
      rimMesh.name = idx === 0 ? "rightRim" : "leftRim";
      rimMesh.position.set(xPos, 0, 0);
      root.add(rimMesh);
    }

    // Temples (sides going back along -Z)
    const templeGeom = new THREE.CylinderGeometry(0.0012, 0.0015, 0.12, 8);
    templeGeom.rotateX(Math.PI / 2);
    const templeMesh = new THREE.Mesh(templeGeom, frameMat);
    templeMesh.name = idx === 0 ? "rightTemple" : "leftTemple";
    const templeX = idx === 0 ? xPos - 0.025 : xPos + 0.025;
    templeMesh.position.set(templeX, 0.008, -0.06);
    root.add(templeMesh);
  });

  // 2. Nose Bridge
  const bridgeGeom = new THREE.CylinderGeometry(0.0012, 0.0012, eyeSpacing, 8);
  bridgeGeom.rotateZ(Math.PI / 2);
  const bridgeMesh = new THREE.Mesh(bridgeGeom, frameMat);
  bridgeMesh.name = "noseBridge";
  bridgeMesh.position.set(0, 0.006, 0);
  root.add(bridgeMesh);

  // 3. Nose Pads
  [-0.008, 0.008].forEach((padX, idx) => {
    const padGeom = new THREE.BoxGeometry(0.002, 0.008, 0.003);
    const padMesh = new THREE.Mesh(padGeom, frameMat);
    padMesh.name = `nosePad_${idx}`;
    padMesh.position.set(padX, -0.004, -0.005);
    root.add(padMesh);
  });

  return root;
}

async function exportToGLB(scene, filename) {
  const exporter = new GLTFExporter();
  try {
    const gltf = await exporter.parseAsync(scene, { binary: true });
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, Buffer.from(gltf));
    console.log(`Generated: ${filename} (${gltf.byteLength} bytes)`);
    return filePath;
  } catch (error) {
    console.error(`Export error on ${filename}:`, error);
    throw error;
  }
}

async function main() {
  console.log("Generating canonical eyewear GLB models...");

  // 1. Cartier Rimless Round (Gold / Blue)
  const cartier = createEyewearModel({
    frameColor: 0xd4af37,
    lensColor: 0x93c5fd,
    metalness: 0.95,
    roughness: 0.15,
    isRound: true,
    isRimless: true,
  });
  await exportToGLB(cartier, "cartier_rimless_round.glb");

  // 2. Fastrack Wayfarer Black (Polished Black Acetate / Dark Lens)
  const wayfarer = createEyewearModel({
    frameColor: 0x18181b,
    lensColor: 0x334155,
    metalness: 0.1,
    roughness: 0.3,
    isWayfarer: true,
  });
  await exportToGLB(wayfarer, "fastrack_wayfarer_black.glb");

  // 3. Classic Aviator Gold
  const aviator = createEyewearModel({
    frameColor: 0xca8a04,
    lensColor: 0x15803d,
    metalness: 0.92,
    roughness: 0.18,
    isRound: false,
  });
  await exportToGLB(aviator, "classic_aviator_gold.glb");

  // 4. Titanium Rectangle Gold
  const rectangle = createEyewearModel({
    frameColor: 0xd4af37,
    lensColor: 0x94a3b8,
    metalness: 0.9,
    roughness: 0.2,
    isRound: false,
  });
  await exportToGLB(rectangle, "rectangle_titanium_gold.glb");

  // 5. Cat-Eye Luxury Havana (Tortoiseshell Brown)
  const cateye = createEyewearModel({
    frameColor: 0x78350f,
    lensColor: 0xb45309,
    metalness: 0.15,
    roughness: 0.35,
    isWayfarer: true,
  });
  await exportToGLB(cateye, "cateye_luxury_havana.glb");

  console.log("All canonical models successfully generated!");
}

main().catch(console.error);
