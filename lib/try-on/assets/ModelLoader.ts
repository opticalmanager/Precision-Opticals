import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { ModelCache } from "./ModelCache";

export interface ModelInspectionData {
  rawWidthMm: number;
  rawHeightMm: number;
  rawDepthMm: number;
  normalizedWidthMm: number;
  normalizedHeightMm: number;
  normalizedDepthMm: number;
  autoScaleFactor: number;
  bridgeContactOffsetZ: number;
  meshCount: number;
  vertexCount: number;
  cadTemplePitchDeg?: number;
}

export interface NormalizedEyewearAsset {
  rootGroup: THREE.Group;
  catalogFrameWidthMm: number;
  bridgePivotLocal: THREE.Vector3;
  wasFlippedZ: boolean;
  cadTemplePitchDeg?: number;
}

export interface LensOpticalStyle {
  isSunglass?: boolean;
  tintColorHex?: number;
  baseOpacity?: number;
  arCoatingType?: "emerald" | "sapphire" | "gold";
}

const DEFAULT_ADULT_FRAME_WIDTH_METERS = 0.140; // 140.0 mm

/**
 * GLTFMaterialsPbrSpecularGlossinessExtension
 * Restores full PBR support for legacy / Khronos SpecularGlossiness glTF models.
 */
class GLTFMaterialsPbrSpecularGlossinessExtension {
  public name = "KHR_materials_pbrSpecularGlossiness";
  public parser: any;

  constructor(parser: any) {
    this.parser = parser;
  }

  public extendMaterialParams(materialIndex: number, materialParams: any) {
    const parser = this.parser;
    const materialDef = parser.json.materials?.[materialIndex];
    if (!materialDef || !materialDef.extensions || !materialDef.extensions[this.name]) {
      return Promise.resolve();
    }

    const ext = materialDef.extensions[this.name];
    const pending: Promise<any>[] = [];

    if (Array.isArray(ext.diffuseFactor)) {
      materialParams.color = new THREE.Color().setRGB(
        ext.diffuseFactor[0],
        ext.diffuseFactor[1],
        ext.diffuseFactor[2],
        THREE.LinearSRGBColorSpace
      );
      materialParams.opacity = ext.diffuseFactor[3] !== undefined ? ext.diffuseFactor[3] : 1.0;
      if (materialParams.opacity < 0.99) {
        materialParams.transparent = true;
      }
    }

    if (ext.diffuseTexture !== undefined) {
      pending.push(
        parser.assignTexture(materialParams, "map", ext.diffuseTexture, THREE.SRGBColorSpace)
      );
    }

    const gloss = ext.glossinessFactor !== undefined ? ext.glossinessFactor : 0.8;
    materialParams.roughness = Math.max(0.04, Math.min(1.0, 1.0 - gloss));

    const matName = (materialDef.name || "").toLowerCase();
    const isGlassMaterial =
      matName.includes("glass") ||
      matName.includes("lens") ||
      matName.includes("optic") ||
      matName.includes("cristal") ||
      matName.includes("verre");

    if (isGlassMaterial) {
      materialParams.metalness = 0.0;
    } else if (Array.isArray(ext.specularFactor)) {
      const maxSpec = Math.max(ext.specularFactor[0], ext.specularFactor[1], ext.specularFactor[2]);
      const maxDiff = Array.isArray(ext.diffuseFactor)
        ? Math.max(ext.diffuseFactor[0], ext.diffuseFactor[1], ext.diffuseFactor[2])
        : 0.5;

      if (maxSpec > 0.6 && maxDiff < 0.25) {
        materialParams.metalness = 0.85;
      } else if (maxSpec > 0.4) {
        materialParams.metalness = 0.35;
      } else {
        materialParams.metalness = 0.05;
      }
    } else {
      materialParams.metalness = 0.1;
    }

    return Promise.all(pending);
  }
}

export class ModelLoader {
  private static gltfLoader: GLTFLoader | null = null;
  private static dracoLoader: DRACOLoader | null = null;

  public static getLoader(): GLTFLoader {
    if (!this.gltfLoader) {
      this.gltfLoader = new GLTFLoader();
      this.dracoLoader = new DRACOLoader();
      this.dracoLoader.setDecoderPath("https://www.gstatic.com/draco/versioned/decoders/1.5.7/");
      this.gltfLoader.setDRACOLoader(this.dracoLoader);
      this.gltfLoader.register((parser) => new GLTFMaterialsPbrSpecularGlossinessExtension(parser));
    }
    return this.gltfLoader;
  }

  /**
   * Loads a GLB/GLTF model from URL with LRU caching and geometric normalization.
   */
  public static async load(url: string, lensStyle?: LensOpticalStyle): Promise<THREE.Group> {
    const cache = ModelCache.getInstance();
    const cached = cache.get(url);
    if (cached) {
      return cached.clone(true);
    }

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
          const normalized = this.normalizeModel(rawScene, 140.0, lensStyle);
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
   * Instance loader method returning NormalizedEyewearAsset with fine metadata.
   */
  public async loadAndNormalizeEyewear(
    url: string,
    catalogFrameWidthMm = 140.0,
    lensStyle?: LensOpticalStyle
  ): Promise<NormalizedEyewearAsset> {
    const rootGroup = await ModelLoader.load(url, lensStyle);
    const bridgePivotLocal = (rootGroup.userData.bridgePivot as THREE.Vector3) || new THREE.Vector3();
    const wasFlippedZ = (rootGroup.userData.wasFlippedZ as boolean) ?? false;
    const cadTemplePitchDeg = (rootGroup.userData.cadTemplePitchDeg as number) ?? 0.0;

    return {
      rootGroup,
      catalogFrameWidthMm,
      bridgePivotLocal,
      wasFlippedZ,
      cadTemplePitchDeg,
    };
  }

  /**
   * Normalizes the raw GLB model:
   * 1. Uniform metric scaling to catalog frame width (default 140mm = 0.14m).
   * 2. Automatic orientation check (+Z forward, -Z temples into skull).
   * 3. Precise anatomical bridge contact surface calculation.
   * 4. Injects physical dielectric lens shader with Schlick Fresnel and AR coating sheen.
   */
  public static normalizeModel(
    rawObject: THREE.Object3D,
    catalogFrameWidthMm = 140.0,
    lensStyle?: LensOpticalStyle
  ): THREE.Group {
    const root = new THREE.Group();
    root.name = "EyewearRoot";

    // 1. Calculate unscaled bounds & inspect geometry
    rawObject.updateMatrixWorld(true);
    const initialBox = new THREE.Box3().setFromObject(rawObject);
    const initialSize = initialBox.getSize(new THREE.Vector3());
    const initialCenter = initialBox.getCenter(new THREE.Vector3());

    let meshCount = 0;
    let vertexCount = 0;
    rawObject.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        meshCount++;
        if (child.geometry && child.geometry.attributes.position) {
          vertexCount += child.geometry.attributes.position.count;
        }
      }
    });

    // 2. Uniformly scale to target metric catalog width (e.g. 140mm = 0.140m)
    const targetWidthMeters =
      catalogFrameWidthMm > 100 && catalogFrameWidthMm < 175
        ? catalogFrameWidthMm * 0.001
        : DEFAULT_ADULT_FRAME_WIDTH_METERS;

    let autoScale = 1.0;
    if (initialSize.x > 0.0001) {
      autoScale = targetWidthMeters / initialSize.x;
      rawObject.scale.set(autoScale, autoScale, autoScale);
    }
    rawObject.updateMatrixWorld(true);

    // 3. Detect and fix inverted CAD orientation (+Z vs -Z)
    const scaledBox = new THREE.Box3().setFromObject(rawObject);
    const scaledCenter = scaledBox.getCenter(new THREE.Vector3());
    const wasFlippedZ = this.detectAndFixInvertedOrientation(rawObject, scaledBox, scaledCenter);
    if (wasFlippedZ) {
      rawObject.rotation.y += Math.PI;
      rawObject.updateMatrixWorld(true);
    }

    // 4. Compute exact anatomical nasal bridge contact pivot
    const orientedBox = new THREE.Box3().setFromObject(rawObject);
    const bridgePivot = this.computeAnatomicalBridgePivot(rawObject, orientedBox);

    // Recess model so bridge skin-contact pivot sits exactly at (0, 0, 0)
    rawObject.position.sub(bridgePivot);
    rawObject.updateMatrixWorld(true);

    // 5. Automatically level pre-baked CAD temple arm pitch slope to standard 0.0 deg baseline
    const cadTemplePitchRad = this.levelTempleArms(
      rawObject,
      new THREE.Vector3(0, 0, 0),
      new THREE.Box3().setFromObject(rawObject)
    );

    const finalBox = new THREE.Box3().setFromObject(rawObject);
    const finalSize = finalBox.getSize(new THREE.Vector3());

    // 6. Upgrade materials for authentic optics & double-sided visibility
    this.upgradeEyewearMaterials(rawObject, lensStyle);

    // Attach developer inspection data
    const inspection: ModelInspectionData = {
      rawWidthMm: initialSize.x * 1000,
      rawHeightMm: initialSize.y * 1000,
      rawDepthMm: initialSize.z * 1000,
      normalizedWidthMm: finalSize.x * 1000,
      normalizedHeightMm: finalSize.y * 1000,
      normalizedDepthMm: finalSize.z * 1000,
      autoScaleFactor: autoScale,
      bridgeContactOffsetZ: Math.abs(bridgePivot.z - orientedBox.max.z) * 1000,
      meshCount,
      vertexCount,
      cadTemplePitchDeg: (cadTemplePitchRad * 180) / Math.PI,
    };
    root.userData.inspection = inspection;
    root.userData.bridgePivot = bridgePivot;
    root.userData.wasFlippedZ = wasFlippedZ;
    root.userData.cadTemplePitchDeg = (cadTemplePitchRad * 180) / Math.PI;

    root.add(rawObject);
    return root;
  }

  /**
   * Samples vertex density in anterior vs posterior 15% Z-slabs.
   */
  private static detectAndFixInvertedOrientation(
    model: THREE.Object3D,
    box: THREE.Box3,
    center: THREE.Vector3
  ): boolean {
    let frontZCount = 0;
    let backZCount = 0;
    const zThresholdFront = center.z + 0.15 * (box.max.z - box.min.z);
    const zThresholdBack = center.z - 0.15 * (box.max.z - box.min.z);
    const tempV = new THREE.Vector3();

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const posAttr = child.geometry.attributes.position;
        if (!posAttr) return;
        const step = Math.max(1, Math.floor(posAttr.count / 500));
        for (let i = 0; i < posAttr.count; i += step) {
          tempV.fromBufferAttribute(posAttr, i).applyMatrix4(child.matrixWorld);
          if (tempV.z >= zThresholdFront) frontZCount++;
          else if (tempV.z <= zThresholdBack) backZCount++;
        }
      }
    });

    return backZCount > frontZCount * 1.25;
  }

  /**
   * Automatically levels pre-baked CAD temple arm pitch slope to standard 0.0 deg relative to bridge.
   * Eliminates variations across 3D models where temples were modeled slanting downwards or upwards by 8-12 deg.
   */
  private static levelTempleArms(
    model: THREE.Object3D,
    bridgePivot: THREE.Vector3,
    orientedBox: THREE.Box3
  ): number {
    const size = orientedBox.getSize(new THREE.Vector3());
    const center = orientedBox.getCenter(new THREE.Vector3());

    // Sample posterior temple tips (rear 12% of Z depth, laterally offset > 35% of width)
    const rearSlabMaxZ = orientedBox.min.z + 0.12 * size.z;
    let templeSumY = 0;
    let templeSumZ = 0;
    let templeCount = 0;
    const tempV = new THREE.Vector3();

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const posAttr = child.geometry.attributes.position;
        if (!posAttr) return;
        const step = Math.max(1, Math.floor(posAttr.count / 300));
        for (let i = 0; i < posAttr.count; i += step) {
          tempV.fromBufferAttribute(posAttr, i).applyMatrix4(child.matrixWorld);
          if (tempV.z <= rearSlabMaxZ && Math.abs(tempV.x - center.x) > 0.35 * size.x) {
            templeSumY += tempV.y;
            templeSumZ += tempV.z;
            templeCount++;
          }
        }
      }
    });

    if (templeCount > 8) {
      const avgTempleY = templeSumY / templeCount;
      const avgTempleZ = templeSumZ / templeCount;
      const deltaY = avgTempleY - bridgePivot.y;
      const deltaZ = bridgePivot.z - avgTempleZ; // distance backwards (positive)
      const templePitchRad = Math.atan2(deltaY, Math.max(0.04, deltaZ));

      // Level rotation if pitch is between -25 deg and +25 deg
      const maxCorrRad = (25.0 * Math.PI) / 180.0;
      if (Math.abs(templePitchRad) > 0.008 && Math.abs(templePitchRad) < maxCorrRad) {
        model.rotation.x -= templePitchRad;
        model.updateMatrixWorld(true);
        return templePitchRad;
      }
    }

    return 0.0;
  }

  /**
   * Locates the exact 3D nasal sellion/pad skin-contact pivot inside the central bridge zone.
   */
  private static computeAnatomicalBridgePivot(
    model: THREE.Object3D,
    scaledBox: THREE.Box3
  ): THREE.Vector3 {
    const center = scaledBox.getCenter(new THREE.Vector3());
    const size = scaledBox.getSize(new THREE.Vector3());

    // Front rim slab lies in the anterior 28% of total Z depth
    const frontSlabMinZ = scaledBox.max.z - Math.min(0.028, 0.28 * size.z);
    const bridgeHalfWidth = 0.0095; // 9.5mm around X midline
    const bridgeMinY = center.y - 0.05 * size.y;
    const bridgeMaxY = scaledBox.max.y - 0.08 * size.y;

    let sumY = 0.0;
    let sumZ = 0.0;
    let minPosteriorBridgeZ = scaledBox.max.z;
    let count = 0;
    const tempV = new THREE.Vector3();

    model.traverse((child) => {
      if (child instanceof THREE.Mesh && child.geometry) {
        const posAttr = child.geometry.attributes.position;
        if (!posAttr) return;
        for (let i = 0; i < posAttr.count; i++) {
          tempV.fromBufferAttribute(posAttr, i).applyMatrix4(child.matrixWorld);
          if (
            Math.abs(tempV.x - center.x) <= bridgeHalfWidth &&
            tempV.y >= bridgeMinY &&
            tempV.y <= bridgeMaxY &&
            tempV.z >= frontSlabMinZ
          ) {
            sumY += tempV.y;
            sumZ += tempV.z;
            if (tempV.z < minPosteriorBridgeZ) {
              minPosteriorBridgeZ = tempV.z;
            }
            count++;
          }
        }
      }
    });

    if (count > 8) {
      const bridgeY = sumY / count;
      const bridgeZ = 0.70 * minPosteriorBridgeZ + 0.30 * (sumZ / count);
      return new THREE.Vector3(center.x, bridgeY, bridgeZ);
    }

    // Anatomical fallback: bridge sits at 65% frame height, recessed 6mm behind front rim apex
    const bridgeY = scaledBox.min.y + size.y * 0.65;
    const bridgeContactOffsetZ = Math.min(0.009, size.z * 0.06);
    return new THREE.Vector3(center.x, bridgeY, scaledBox.max.z - bridgeContactOffsetZ);
  }

  /**
   * Upgrades materials:
   * - Lenses get dielectric Physical material with Schlick Fresnel & dichromatic AR sheen.
   * - Frames get opaque standard materials with depthWrite = true.
   */
  public static upgradeEyewearMaterials(
    model: THREE.Object3D,
    lensStyle?: LensOpticalStyle
  ): void {
    const isSunglass = lensStyle?.isSunglass ?? false;
    const baseOpacity = lensStyle?.baseOpacity ?? (isSunglass ? 0.35 : 0.15);
    const tintColor = new THREE.Color(
      lensStyle?.tintColorHex ?? (isSunglass ? 0x1a1e24 : 0xffffff)
    );

    const arColorPrimary =
      lensStyle?.arCoatingType === "sapphire"
        ? new THREE.Color(0x2e7bff)
        : lensStyle?.arCoatingType === "gold"
        ? new THREE.Color(0xffc857)
        : new THREE.Color(0x1ee69e); // Classic emerald-green AR coating
    const arColorSecondary = new THREE.Color(0x3a7afe); // Grazing-angle sapphire shift

    model.traverse((child) => {
      if (!(child instanceof THREE.Mesh)) return;
      const mesh = child;
      mesh.castShadow = false;
      mesh.receiveShadow = false;

      const origMat = Array.isArray(mesh.material) ? mesh.material[0] : mesh.material;
      const matName = (origMat?.name || "").toLowerCase();
      const meshName = (mesh.name || "").toLowerCase();

      // Exclusions: frame structural elements
      const isExcludedFromLens =
        meshName.includes("frame") ||
        meshName.includes("temple") ||
        meshName.includes("arm") ||
        meshName.includes("bridge") ||
        meshName.includes("pad") ||
        meshName.includes("nose") ||
        meshName.includes("hinge") ||
        meshName.includes("rim") ||
        meshName.includes("screw") ||
        meshName.includes("base") ||
        meshName.includes("steel") ||
        meshName.includes("metal") ||
        meshName.includes("ear") ||
        meshName.includes("tip") ||
        meshName.includes("logo") ||
        matName.includes("frame") ||
        matName.includes("temple") ||
        matName.includes("arm") ||
        matName.includes("bridge") ||
        matName.includes("pad") ||
        matName.includes("nose") ||
        matName.includes("hinge") ||
        matName.includes("rim") ||
        matName.includes("screw") ||
        matName.includes("base") ||
        matName.includes("steel") ||
        matName.includes("metal") ||
        matName.includes("ear") ||
        matName.includes("tip") ||
        matName.includes("logo");

      const hasLensKeyword =
        meshName.includes("lens") ||
        matName.includes("lens") ||
        meshName.includes("glass") ||
        matName.includes("glass") ||
        meshName.includes("optic") ||
        matName.includes("optic") ||
        meshName.includes("cristal") ||
        matName.includes("cristal") ||
        meshName.includes("verre") ||
        matName.includes("verre");

      const origTransmission =
        origMat && "transmission" in origMat && typeof (origMat as any).transmission === "number"
          ? (origMat as any).transmission
          : 0;

      const hasGlassProps =
        origTransmission > 0.05 ||
        (origMat?.opacity !== undefined && origMat.opacity < 0.7 && !isExcludedFromLens);

      const isLens = !isExcludedFromLens && (hasLensKeyword || hasGlassProps);

      if (isLens) {
        mesh.renderOrder = 2; // Render after frame and occluder

        // Extract tint color if model had one
        let effectiveTintColor = tintColor;
        if (origMat && (origMat as any).color instanceof THREE.Color && !lensStyle?.tintColorHex) {
          const c = (origMat as any).color as THREE.Color;
          if (c.r < 0.95 || c.g < 0.95 || c.b < 0.95) {
            effectiveTintColor = c.clone();
          }
        }

        const opticalMat = new THREE.MeshPhysicalMaterial({
          name: "PrecisionOpticalLensMaterial",
          color: effectiveTintColor,
          transparent: true,
          opacity: baseOpacity,
          roughness: 0.04,
          metalness: 0.0,
          reflectivity: 0.8,
          ior: 1.58, // Polycarbonate / High-Index optical resin
          clearcoat: 1.0,
          clearcoatRoughness: 0.04,
          transmission: 0.0, // Zero transmission in WebAR transparent canvas so video shows cleanly
          depthWrite: false,
          depthTest: true,
          side: THREE.DoubleSide,
        });

        opticalMat.onBeforeCompile = (shader) => {
          shader.uniforms.uArColorPrimary = { value: arColorPrimary };
          shader.uniforms.uArColorSecondary = { value: arColorSecondary };
          shader.uniforms.uBaseLensOpacity = { value: baseOpacity };

          shader.fragmentShader =
            `
            uniform vec3 uArColorPrimary;
            uniform vec3 uArColorSecondary;
            uniform float uBaseLensOpacity;
            ` + shader.fragmentShader;

          shader.fragmentShader = shader.fragmentShader.replace(
            "#include <dithering_fragment>",
            `
            #include <dithering_fragment>
            vec3 viewDirFrag = normalize(vViewPosition);
            float ndotv = clamp(dot(normal, viewDirFrag), 0.0, 1.0);
            float fresnelTerm = pow(1.0 - ndotv, 4.0);

            vec3 arSheenColor = mix(uArColorPrimary, uArColorSecondary, fresnelTerm);
            float specularLuminance = dot(gl_FragColor.rgb, vec3(0.2126, 0.7152, 0.0722));

            gl_FragColor.rgb += arSheenColor * (0.14 * fresnelTerm + 0.35 * smoothstep(0.18, 0.85, specularLuminance));

            float dynamicAlpha = clamp(
              uBaseLensOpacity + 0.28 * fresnelTerm + 0.75 * smoothstep(0.12, 0.90, specularLuminance),
              uBaseLensOpacity,
              0.92
            );
            gl_FragColor.a = dynamicAlpha;
            `
          );
        };

        mesh.material = opticalMat;
      } else {
        mesh.renderOrder = 1;
        const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
        for (const mat of materials) {
          if (!mat) continue;
          mat.side = THREE.DoubleSide;

          if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
            const isExplicitFrame =
              meshName.includes("frame") ||
              meshName.includes("temple") ||
              meshName.includes("steel") ||
              meshName.includes("base") ||
              meshName.includes("arm") ||
              meshName.includes("rim") ||
              meshName.includes("hinge");

            if (mat.opacity >= 0.7 || isExplicitFrame) {
              mat.transparent = false;
              mat.opacity = 1.0;
              mat.depthWrite = true;
            } else {
              mat.transparent = true;
              mat.depthWrite = false;
            }

            if (mat.roughness !== undefined && mat.roughness < 0.12) {
              mat.roughness = 0.22;
            }
          }
          mat.needsUpdate = true;
        }
      }
    });
  }
}
