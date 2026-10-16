import * as THREE from "three";

/**
 * OcclusionManager
 * Renders an invisible 3D facial proxy mesh into the depth buffer (colorWrite: false, depthWrite: true).
 * Incorporates:
 * 1. Cranial-Temporal Ellipsoid: sculpted to prevent clipping brow/orbits while occluding temples behind ears.
 * 2. Anatomical Nasal Dorsum Wedge: occludes far-side nose pad and inner rim during head turns.
 * 3. Bilateral Pre-Auricular Ear Shields: occludes temple drop-tips behind the ears.
 * 4. Ambient Contact Shadow: soft nasal bridge & pad contact shadow visually grounding eyewear onto the skin.
 */
export class OcclusionManager {
  public readonly occluderGroup: THREE.Group;
  private readonly cranialCapMesh: THREE.Mesh;
  private readonly nasalDorsumMesh: THREE.Mesh;
  private readonly leftEarShieldMesh: THREE.Mesh;
  private readonly rightEarShieldMesh: THREE.Mesh;
  private readonly bridgeContactShadowMesh: THREE.Mesh;

  private readonly depthOnlyMaterial: THREE.MeshBasicMaterial;
  private readonly debugMaterial: THREE.MeshBasicMaterial;
  private readonly contactShadowMaterial: THREE.ShaderMaterial;
  private isDebug = false;

  constructor(scene?: THREE.Scene) {
    this.occluderGroup = new THREE.Group();
    this.occluderGroup.name = "AnatomicalOccluderGroup";
    this.occluderGroup.renderOrder = 0; // Rendered BEFORE glasses (renderOrder 1+)

    // Invisible depth-only material with polygonOffset pushed slightly back
    // to prevent premature brow/cheek clipping while occluding inner pads and far-side temples
    this.depthOnlyMaterial = new THREE.MeshBasicMaterial({
      colorWrite: false,
      depthWrite: true,
      depthTest: true,
      polygonOffset: true,
      polygonOffsetFactor: 1.8,
      polygonOffsetUnits: 4.0,
      side: THREE.FrontSide,
    });

    this.debugMaterial = new THREE.MeshBasicMaterial({
      color: 0x06b6d4,
      wireframe: true,
      transparent: true,
      opacity: 0.35,
    });

    // 1. Temporal-Parietal Cranium Ellipsoid (sculpted so it never touches brow/orbits)
    const craniumGeo = new THREE.SphereGeometry(1.0, 32, 24);
    const posAttr = craniumGeo.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0; i < posAttr.count; i++) {
      v.fromBufferAttribute(posAttr, i);
      // Flatten anterior face of the sphere (z > 0.32)
      if (v.z > 0.32) {
        v.z = 0.32 + 0.15 * (v.z - 0.32);
      }
      // Sculpt temporal fossa indentation at sides (|x| > 0.82)
      if (Math.abs(v.x) > 0.82 && v.z > -0.25 && v.z < 0.32) {
        v.x *= 0.94;
      }
      posAttr.setXYZ(i, v.x, v.y, v.z);
    }
    craniumGeo.computeVertexNormals();

    this.cranialCapMesh = new THREE.Mesh(craniumGeo, this.depthOnlyMaterial);
    this.cranialCapMesh.renderOrder = 0;
    this.cranialCapMesh.scale.set(0.068, 0.088, 0.086);
    this.cranialCapMesh.position.set(0.0, -0.008, -0.074);

    // 2. Anatomical Nasal Dorsum Wedge
    const noseGeo = new THREE.ConeGeometry(0.014, 0.044, 16, 1, true);
    noseGeo.rotateX(Math.PI * 0.42);
    noseGeo.scale(0.72, 1.0, 0.88);
    this.nasalDorsumMesh = new THREE.Mesh(noseGeo, this.depthOnlyMaterial);
    this.nasalDorsumMesh.renderOrder = 0;
    this.nasalDorsumMesh.position.set(0.0, -0.017, 0.004);

    // 3. Bilateral Pre-Auricular & Helix Ear Shields
    const earGeo = new THREE.SphereGeometry(1.0, 16, 16);
    earGeo.scale(0.0055, 0.024, 0.018);

    this.leftEarShieldMesh = new THREE.Mesh(earGeo, this.depthOnlyMaterial);
    this.leftEarShieldMesh.renderOrder = 0;
    this.leftEarShieldMesh.position.set(-0.071, -0.014, -0.096);

    this.rightEarShieldMesh = new THREE.Mesh(earGeo, this.depthOnlyMaterial);
    this.rightEarShieldMesh.renderOrder = 0;
    this.rightEarShieldMesh.position.set(0.071, -0.014, -0.096);

    // 4. Soft Nasal Bridge & Pad Ambient Contact Shadow
    const shadowGeo = new THREE.PlaneGeometry(0.036, 0.022, 8, 8);
    const sPos = shadowGeo.attributes.position;
    for (let i = 0; i < sPos.count; i++) {
      const sx = sPos.getX(i);
      const sy = sPos.getY(i);
      const sz = -18.0 * sx * sx - 6.0 * sy * sy;
      sPos.setZ(i, sz);
    }
    shadowGeo.computeVertexNormals();

    this.contactShadowMaterial = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      depthTest: true,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        void main() {
          vec2 p = vUv * 2.0 - 1.0;
          float leftPad = exp(-12.0 * dot(p - vec2(-0.38, -0.10), p - vec2(-0.38, -0.10)));
          float rightPad = exp(-12.0 * dot(p - vec2(0.38, -0.10), p - vec2(0.38, -0.10)));
          float saddle = exp(-7.0 * (p.x * p.x * 1.2 + (p.y - 0.15) * (p.y - 0.15) * 3.0));
          float shadowAlpha = 0.22 * clamp(0.65 * (leftPad + rightPad) + 0.55 * saddle, 0.0, 1.0);
          gl_FragColor = vec4(0.06, 0.04, 0.03, shadowAlpha);
        }
      `,
    });

    this.bridgeContactShadowMesh = new THREE.Mesh(shadowGeo, this.contactShadowMaterial);
    this.bridgeContactShadowMesh.renderOrder = 0;
    this.bridgeContactShadowMesh.position.set(0.0, -0.005, 0.0012);

    this.occluderGroup.add(
      this.cranialCapMesh,
      this.nasalDorsumMesh,
      this.leftEarShieldMesh,
      this.rightEarShieldMesh,
      this.bridgeContactShadowMesh
    );

    if (scene) {
      scene.add(this.occluderGroup);
    }
  }

  /**
   * Synchronizes anatomical occluder group with rigid skull pose.
   */
  public updateOccluder(
    sellionWorldPos: THREE.Vector3,
    headWorldQuat: THREE.Quaternion,
    cranialScaleFactor: number
  ): void {
    this.occluderGroup.position.copy(sellionWorldPos);
    this.occluderGroup.quaternion.copy(headWorldQuat);
    this.occluderGroup.scale.setScalar(cranialScaleFactor);
  }

  /**
   * Backward-compatible pose update using Quaternion.
   */
  public updatePoseQuaternion(
    position: { x: number; y: number; z: number },
    quaternion: { x: number; y: number; z: number; w: number },
    scale: number
  ): void {
    this.occluderGroup.position.set(position.x, position.y, position.z);
    this.occluderGroup.quaternion.set(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
    this.occluderGroup.scale.set(scale, scale, scale);
  }

  /**
   * Backward-compatible pose update using Euler angles.
   */
  public updatePose(
    position: { x: number; y: number; z: number },
    rotation: { pitch: number; yaw: number; roll: number },
    scale: number
  ): void {
    this.occluderGroup.position.set(position.x, position.y, position.z);
    this.occluderGroup.rotation.set(rotation.pitch, rotation.yaw, rotation.roll, "YXZ");
    this.occluderGroup.scale.set(scale, scale, scale);
  }

  public setDebug(debug: boolean): void {
    this.isDebug = debug;
    const mat = debug ? this.debugMaterial : this.depthOnlyMaterial;
    this.cranialCapMesh.material = mat;
    this.nasalDorsumMesh.material = mat;
    this.leftEarShieldMesh.material = mat;
    this.rightEarShieldMesh.material = mat;
  }

  public setVisible(visible: boolean): void {
    this.occluderGroup.visible = visible;
  }

  public dispose(scene?: THREE.Scene): void {
    if (scene) {
      scene.remove(this.occluderGroup);
    }
    this.cranialCapMesh.geometry.dispose();
    this.nasalDorsumMesh.geometry.dispose();
    this.leftEarShieldMesh.geometry.dispose();
    this.rightEarShieldMesh.geometry.dispose();
    this.bridgeContactShadowMesh.geometry.dispose();
    this.depthOnlyMaterial.dispose();
    this.debugMaterial.dispose();
    this.contactShadowMaterial.dispose();
  }
}
