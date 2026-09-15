import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { ModelCache } from "./ModelCache";

export class ModelLoader {
  private static gltfLoader: GLTFLoader | null = null;
  private static dracoLoader: DRACOLoader | null = null;

  private static getLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
      this.gltfLoader.setDRACOLoader(this.dracoLoader);
    }
    return this.gltfLoader;
  }

  /**
   * Loads a GLB/GLTF model from URL with LRU caching and geometric normalization
   */
  public static async load(url: string): Promise<THREE.Group> {
    const cache = ModelCache.getInstance();
    const cached = cache.get(url);
    if (cached) {
      return cached.clone(true);
    }

    // Auto-proxy remote URLs (R2 or HTTP/HTTPS) to bypass CORS and ensure 100% reliable streaming
    let finalUrl = url;
    if (url.startsWith("http://") || url.startsWith("https://")) {
      finalUrl = `/api/upload?url=${encodeURIComponent(url)}`;
    }

    const loader = this.getLoader();

    return new Promise<THREE.Group>((resolve, reject) => {
      loader.load(
        finalUrl,
        (gltf) => {
          const rawScene = gltf.scene;
          const normalized = this.normalizeModel(rawScene);
          cache.set(url, normalized);
          resolve(normalized.clone(true));
        },
        undefined,
        (err) => {
          console.error(`Failed to load 3D eyewear model from ${finalUrl}:`, err);
          reject(err);
        }
      );
    });
  }

  /**
   * Centers the model pivot precisely at the nasal bridge, auto-orients, and enhances physical materials
   */
  public static normalizeModel(rawObject: THREE.Object3D): THREE.Group {
    const root = new THREE.Group();
    root.name = "EyewearRoot";

    // 1. Calculate unscaled bounds
    const initialBox = new THREE.Box3().setFromObject(rawObject);
    const initialSize = initialBox.getSize(new THREE.Vector3());

    // 2. Uniformly scale to target standard eyewear width (0.14m / 140mm)
    const targetWidth = 0.14;
    if (initialSize.x > 0.0001) {
      const autoScale = targetWidth / initialSize.x;
      rawObject.scale.set(autoScale, autoScale, autoScale);
    }
    rawObject.updateMatrixWorld(true);

    // 3. Intelligent Orientation Detection:
    // Determine whether the frame is facing forward (+Z) or backward (-Z)
    // The nasal bridge connects the two eye rims across x = 0 at the FRONT of the frame.
    const scaledBox = new THREE.Box3().setFromObject(rawObject);
    const center = scaledBox.getCenter(new THREE.Vector3());
    const size = scaledBox.getSize(new THREE.Vector3());
    const centerXThreshold = size.x * 0.15;

    let frontBridgeVerts = 0;
    let backBridgeVerts = 0;

    rawObject.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const pos = child.geometry.attributes.position;
        if (pos) {
          const v = new THREE.Vector3();
          for (let i = 0; i < pos.count; i++) {
            v.fromBufferAttribute(pos, i);
            child.localToWorld(v);
            if (Math.abs(v.x - center.x) < centerXThreshold) {
              if (v.z > center.z) frontBridgeVerts++;
              else backBridgeVerts++;
            }
          }
        }
      }
    });

    if (backBridgeVerts > frontBridgeVerts * 1.5) {
      rawObject.rotation.y += Math.PI;
      rawObject.updateMatrixWorld(true);
    }

    // 4. Align frame so bridge rests naturally at z = 0, with temples extending backwards into -Z
    const finalBox = new THREE.Box3().setFromObject(rawObject);
    const finalCenter = finalBox.getCenter(new THREE.Vector3());
    const finalSize = finalBox.getSize(new THREE.Vector3());
    const frontZ = finalBox.max.z;

    // Anatomical optical anchor:
    // The nasal bridge sits at ~65% of frame height (upper third of lenses).
    // Anchoring here ensures pupils look directly through the optical centers of the lenses.
    const bridgeY = finalBox.min.y + finalSize.y * 0.65;

    rawObject.position.set(-finalCenter.x, -bridgeY, -frontZ);

    // 5. Enhance materials for realism, safety, and double-sided visibility
    rawObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = false;
        child.receiveShadow = false;

        const name = (child.name || "").toLowerCase();
        // Strict lens detection: only match meshes explicitly named lens or lenses, never general "glasses" or "glass"
        const isLens =
          name === "lens" ||
          name === "lenses" ||
          name.startsWith("lens_") ||
          name.endsWith("_lens") ||
          name.includes("lens_left") ||
          name.includes("lens_right") ||
          name.includes("lens-left") ||
          name.includes("lens-right") ||
          name.includes("optics_lens");

        if (isLens && !name.includes("frame") && !name.includes("temple") && !name.includes("side") && !name.includes("bridge")) {
          // Realistic optical glass lens with subtle tint
          child.material = new THREE.MeshPhysicalMaterial({
            color: new THREE.Color(0xffffff),
            transmission: 0.92,
            opacity: 1.0,
            transparent: true,
            roughness: 0.05,
            metalness: 0.0,
            ior: 1.52, // CR-39 / Crown glass index of refraction
            reflectivity: 0.5,
            clearcoat: 1.0,
            clearcoatRoughness: 0.05,
            depthWrite: false, // Prevents z-fighting with eyes
            side: THREE.DoubleSide,
          });
        } else if (child.material) {
          const applyMatProps = (mat: THREE.Material) => {
            mat.side = THREE.DoubleSide;
            if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
              if (mat.transparent && mat.opacity < 0.2) {
                mat.opacity = 0.98;
              }
            }
            mat.needsUpdate = true;
          };

          if (Array.isArray(child.material)) {
            child.material.forEach(applyMatProps);
          } else {
            applyMatProps(child.material);
          }
        }
      }
    });

    root.add(rawObject);
    return root;
  }
}
