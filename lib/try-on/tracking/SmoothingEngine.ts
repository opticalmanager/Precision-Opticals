import * as THREE from "three";
import { FacePose, TrackingConfidenceState } from "@/types/tryOn";

export interface SmoothingEngineConfig {
  /** Base positional measurement noise variance in m^2 for X and Y (default (0.00045m)^2) */
  posMeasVarianceXY: number;
  /** Base positional measurement noise variance in m^2 for Z depth (default (0.0018m)^2) */
  posMeasVarianceZ: number;
  /** Quiescent jerk spectral density in m^2/s^5 (stationary lock) */
  jerkSpectralQuiescent: number;
  /** Dynamic jerk spectral density in m^2/s^5 (active head movement) */
  jerkSpectralDynamic: number;
  /** Lower Mahalanobis squared gate for stationary deadband (default 1.8) */
  mahalanobisGateLow: number;
  /** Upper Mahalanobis squared gate for full dynamic tracking (default 6.5) */
  mahalanobisGateHigh: number;
  /** Rotational deadband threshold in radians (default 0.22 deg = 0.00384 rad) */
  rotDeadbandRad: number;
  /** Rotational saturation threshold in radians (default 2.8 deg = 0.04887 rad) */
  rotSaturationRad: number;
  /** Minimum rotational gain in quiescent regime (default 0.035 -> ~0.35 Hz cutoff) */
  rotGainMin: number;
  /** Maximum rotational gain in dynamic regime (default 0.88) */
  rotGainMax: number;
  /** Maximum predictive lead horizon in seconds (default 0.028s = 28ms) */
  maxPredictiveLeadSec: number;
}

/**
 * 1D Constant-Acceleration Kalman Filter state [p, v, a] with analytical 3x3 covariance P.
 */
class AxisConstantAccelKalman {
  public p = 0.0;
  public v = 0.0;
  public a = 0.0;

  // Symmetric 3x3 covariance matrix stored as 6 upper-triangular scalars
  private p00 = 1e-4;
  private p01 = 0.0;
  private p02 = 0.0;
  private p11 = 1e-2;
  private p12 = 0.0;
  private p22 = 1e-1;

  public reset(initialPos: number): void {
    this.p = initialPos;
    this.v = 0.0;
    this.a = 0.0;
    this.p00 = 1e-4;
    this.p01 = 0.0;
    this.p02 = 0.0;
    this.p11 = 1e-2;
    this.p12 = 0.0;
    this.p22 = 1e-1;
  }

  public predict(dt: number, accelDecay: number, qJerk: number): void {
    const dt2 = 0.5 * dt * dt;

    // State transition x_{k|k-1} = F * x_{k-1|k-1}
    this.p = this.p + this.v * dt + this.a * dt2;
    this.v = this.v + this.a * dt;
    this.a = this.a * accelDecay;

    // Covariance prediction P_{k|k-1} = F * P * F^T + Q
    const f00 = this.p00 + dt * this.p01 + dt2 * this.p02;
    const f01 = this.p01 + dt * this.p11 + dt2 * this.p12;
    const f02 = this.p02 + dt * this.p12 + dt2 * this.p22;

    const f11 = this.p11 + dt * this.p12;
    const f12 = this.p12 + dt * this.p22;

    const dt3 = (dt * dt * dt) / 3.0;
    const dt4 = (dt * dt * dt * dt) / 8.0;
    const dt5 = (dt * dt * dt * dt * dt) / 20.0;

    this.p00 = f00 + dt * f01 + dt2 * f02 + qJerk * dt5;
    this.p01 = f01 + dt * f02 + qJerk * dt4;
    this.p02 = accelDecay * f02 + qJerk * (dt3 * 0.5);
    this.p11 = f11 + dt * f12 + qJerk * dt3;
    this.p12 = accelDecay * f12 + qJerk * dt2;
    this.p22 = accelDecay * accelDecay * this.p22 + qJerk * dt;
  }

  public computeInnovationNormalizedSq(measPos: number, measVarR: number): number {
    const innovation = measPos - this.p;
    const S = this.p00 + measVarR;
    return (innovation * innovation) / Math.max(1e-12, S);
  }

  public update(measPos: number, measVarR: number, activityFactor: number): void {
    const innovation = measPos - this.p;
    const S = this.p00 + measVarR;
    const invS = 1.0 / Math.max(1e-12, S);

    // Kalman gain K = P * H^T * S^-1
    const k0 = this.p00 * invS;
    const k1 = this.p01 * invS;
    const k2 = this.p02 * invS;

    this.p += k0 * innovation;
    this.v += k1 * innovation;
    this.a += k2 * innovation;

    // Quiescent velocity & acceleration bleed to freeze drift when stationary
    const quiescentDamping = 0.35 + 0.65 * activityFactor;
    this.v *= quiescentDamping;
    this.a *= quiescentDamping * quiescentDamping;

    // Covariance update P_{k|k} = (I - K * H) * P_{k|k-1}
    const p00Old = this.p00;
    const p01Old = this.p01;
    const p02Old = this.p02;

    this.p00 -= k0 * p00Old;
    this.p01 -= k0 * p01Old;
    this.p02 -= k0 * p02Old;
    this.p11 -= k1 * p01Old;
    this.p12 -= k1 * p02Old;
    this.p22 -= k2 * p02Old;
  }

  public extrapolate(leadSec: number): number {
    return this.p + this.v * leadSec + 0.25 * this.a * leadSec * leadSec;
  }
}

export class SmoothingEngine {
  private readonly cfg: SmoothingEngineConfig;
  private readonly kfX = new AxisConstantAccelKalman();
  private readonly kfY = new AxisConstantAccelKalman();
  private readonly kfZ = new AxisConstantAccelKalman();

  private readonly stateQuat = new THREE.Quaternion();
  private readonly angularVel = new THREE.Vector3(); // rad/s in body frame

  private initialized = false;
  private lastTimestampMs = 0.0;
  private activityFactor = 0.0;

  // Pre-allocated scratch objects
  private readonly tempQuatDiff = new THREE.Quaternion();
  private readonly tempQuatStep = new THREE.Quaternion();
  private readonly tempAxis = new THREE.Vector3();
  private readonly tempRotVec = new THREE.Vector3();
  private readonly tempRawPos = new THREE.Vector3();
  private readonly tempRawQuat = new THREE.Quaternion();
  private readonly tempEuler = new THREE.Euler();

  constructor(config?: Partial<SmoothingEngineConfig>) {
    this.cfg = {
      posMeasVarianceXY: config?.posMeasVarianceXY ?? 0.00045 * 0.00045,
      posMeasVarianceZ: config?.posMeasVarianceZ ?? 0.0018 * 0.0018,
      jerkSpectralQuiescent: config?.jerkSpectralQuiescent ?? 0.002,
      jerkSpectralDynamic: config?.jerkSpectralDynamic ?? 12.0,
      mahalanobisGateLow: config?.mahalanobisGateLow ?? 1.8,
      mahalanobisGateHigh: config?.mahalanobisGateHigh ?? 6.5,
      rotDeadbandRad: config?.rotDeadbandRad ?? (0.22 * Math.PI) / 180.0,
      rotSaturationRad: config?.rotSaturationRad ?? (2.8 * Math.PI) / 180.0,
      rotGainMin: config?.rotGainMin ?? 0.035,
      rotGainMax: config?.rotGainMax ?? 0.88,
      maxPredictiveLeadSec: config?.maxPredictiveLeadSec ?? 0.028,
    };
  }

  public reset(): void {
    this.initialized = false;
    this.lastTimestampMs = 0.0;
    this.activityFactor = 0.0;
    this.angularVel.set(0, 0, 0);
  }

  public getActivityFactor(): number {
    return this.activityFactor;
  }

  /**
   * Updates the 6-DoF Constant-Acceleration Kalman state and returns the
   * forward-extrapolated position and quaternion to eliminate motion-to-photon lag.
   */
  public filterPose(
    rawPos: THREE.Vector3,
    rawQuat: THREE.Quaternion,
    timestampMs: number,
    trackingLatencyMs = 16.0,
    poseConfidence = 1.0,
    expressionActivity = 0.0
  ): { position: THREE.Vector3; quaternion: THREE.Quaternion; activityFactor: number } {
    if (!this.initialized) {
      this.kfX.reset(rawPos.x);
      this.kfY.reset(rawPos.y);
      this.kfZ.reset(rawPos.z);
      this.stateQuat.copy(rawQuat).normalize();
      this.angularVel.set(0, 0, 0);
      this.lastTimestampMs = timestampMs;
      this.initialized = true;
      return {
        position: rawPos.clone(),
        quaternion: rawQuat.clone(),
        activityFactor: 0.0,
      };
    }

    const dtSec = THREE.MathUtils.clamp(
      (timestampMs - this.lastTimestampMs) * 0.001,
      0.004,
      0.100
    );
    this.lastTimestampMs = timestampMs;

    const accelDecay = Math.exp(-dtSec / 0.08);
    const qJerkPrev =
      this.cfg.jerkSpectralQuiescent +
      this.activityFactor *
        this.activityFactor *
        (this.cfg.jerkSpectralDynamic - this.cfg.jerkSpectralQuiescent);

    // 1. Predict translational states forward by dtSec
    this.kfX.predict(dtSec, accelDecay, qJerkPrev);
    this.kfY.predict(dtSec, accelDecay, qJerkPrev);
    this.kfZ.predict(dtSec, accelDecay, qJerkPrev * 2.5);

    // Scale base measurement noise inversely with pose confidence and up during expressions
    const confidenceScale =
      (1.0 + 2.5 * expressionActivity) / Math.max(0.15, poseConfidence);
    const rXY = this.cfg.posMeasVarianceXY * confidenceScale;
    const rZ = this.cfg.posMeasVarianceZ * confidenceScale;

    // 2. Compute 3D Mahalanobis innovation squared to detect stationary vs active motion
    const dM2 =
      this.kfX.computeInnovationNormalizedSq(rawPos.x, rXY) +
      this.kfY.computeInnovationNormalizedSq(rawPos.y, rXY) +
      0.5 * this.kfZ.computeInnovationNormalizedSq(rawPos.z, rZ);

    const instantActivity = THREE.MathUtils.clamp(
      (dM2 - this.cfg.mahalanobisGateLow) /
        (this.cfg.mahalanobisGateHigh - this.cfg.mahalanobisGateLow),
      0.0,
      1.0
    );

    // Fast attack (instantaneous opening on intentional movement), smooth 8-frame decay
    this.activityFactor = Math.max(instantActivity, 0.84 * this.activityFactor);

    // Modulate effective measurement noise R_eff by quiescent deadband
    const quiescentDivisor = 0.08 + 0.92 * this.activityFactor;
    const rXYEff = rXY / quiescentDivisor;
    const rZEff = rZ / quiescentDivisor;

    // 3. Kalman Measurement Update
    this.kfX.update(rawPos.x, rXYEff, this.activityFactor);
    this.kfY.update(rawPos.y, rXYEff, this.activityFactor);
    this.kfZ.update(rawPos.z, rZEff, this.activityFactor);

    // 4. SO(3) Rotational State Update with Quiescent Deadband
    const targetQuat = this.tempQuatStep.copy(rawQuat).normalize();
    if (this.stateQuat.dot(targetQuat) < 0.0) {
      targetQuat.set(-targetQuat.x, -targetQuat.y, -targetQuat.z, -targetQuat.w);
    }

    // Propagate stateQuat by current angular velocity over dtSec
    const omegaMag = this.angularVel.length();
    if (omegaMag > 1e-4 && this.activityFactor > 0.05) {
      const halfAngle = 0.5 * omegaMag * dtSec * this.activityFactor;
      const sinHalf = Math.sin(halfAngle) / omegaMag;
      this.tempQuatDiff.set(
        this.angularVel.x * sinHalf,
        this.angularVel.y * sinHalf,
        this.angularVel.z * sinHalf,
        Math.cos(halfAngle)
      );
      this.stateQuat.multiply(this.tempQuatDiff).normalize();
    }

    // Compute geodesic residual delta_q = stateQuat^-1 * targetQuat
    this.tempQuatDiff.copy(this.stateQuat).invert().multiply(targetQuat);
    if (this.tempQuatDiff.w < 0.0) {
      this.tempQuatDiff.set(
        -this.tempQuatDiff.x,
        -this.tempQuatDiff.y,
        -this.tempQuatDiff.z,
        -this.tempQuatDiff.w
      );
    }

    const sinHalfErr = Math.hypot(
      this.tempQuatDiff.x,
      this.tempQuatDiff.y,
      this.tempQuatDiff.z
    );
    const thetaErrRad = 2.0 * Math.atan2(sinHalfErr, this.tempQuatDiff.w);

    const rotActivity = THREE.MathUtils.clamp(
      (thetaErrRad - this.cfg.rotDeadbandRad) /
        (this.cfg.rotSaturationRad - this.cfg.rotDeadbandRad),
      0.0,
      1.0
    );

    const combinedRotActivity = Math.max(rotActivity, 0.7 * this.activityFactor);
    const alphaRot =
      (this.cfg.rotGainMin +
        combinedRotActivity *
          combinedRotActivity *
          (this.cfg.rotGainMax - this.cfg.rotGainMin)) /
      Math.sqrt(confidenceScale);

    if (sinHalfErr > 1e-6) {
      this.tempAxis
        .set(this.tempQuatDiff.x, this.tempQuatDiff.y, this.tempQuatDiff.z)
        .divideScalar(sinHalfErr);

      const stepAngle = alphaRot * thetaErrRad;
      this.tempQuatStep.setFromAxisAngle(this.tempAxis, stepAngle);
      this.stateQuat.multiply(this.tempQuatStep).normalize();

      // Update body-frame angular velocity estimate
      const betaRot = 0.28 * combinedRotActivity;
      this.tempRotVec.copy(this.tempAxis).multiplyScalar(thetaErrRad / dtSec);
      this.angularVel
        .multiplyScalar(0.75 * combinedRotActivity)
        .addScaledVector(this.tempRotVec, betaRot);
    } else {
      this.angularVel.multiplyScalar(0.5);
    }

    // 5. Horizon-Clamped Predictive Forward Extrapolation to eliminate motion-to-photon lag
    const leadSec =
      combinedRotActivity *
      THREE.MathUtils.clamp(
        0.85 * (trackingLatencyMs * 0.001) + 0.006,
        0.0,
        this.cfg.maxPredictiveLeadSec
      );

    const predPos = new THREE.Vector3(
      this.kfX.extrapolate(leadSec),
      this.kfY.extrapolate(leadSec),
      this.kfZ.extrapolate(leadSec)
    );

    const predQuat = this.stateQuat.clone();
    const currentOmegaMag = this.angularVel.length();
    if (currentOmegaMag > 1e-3 && leadSec > 1e-4) {
      this.tempAxis.copy(this.angularVel).divideScalar(currentOmegaMag);
      const predAngle = Math.min(0.12, currentOmegaMag * leadSec);
      this.tempQuatStep.setFromAxisAngle(this.tempAxis, predAngle);
      predQuat.multiply(this.tempQuatStep).normalize();
    }

    return {
      position: predPos,
      quaternion: predQuat,
      activityFactor: Math.max(this.activityFactor, combinedRotActivity),
    };
  }

  /**
   * Adapts raw FacePose with the dual-regime CA-EKF filter.
   */
  public filter(
    rawPose: FacePose,
    timestampMs: number,
    confidenceState: TrackingConfidenceState = "HIGH_CONFIDENCE"
  ): FacePose {
    if (!rawPose) return rawPose;
    if (confidenceState === "LOST") {
      this.reset();
      return rawPose;
    }

    this.tempRawPos.set(rawPose.position.x, rawPose.position.y, rawPose.position.z);
    if (rawPose.quaternion) {
      this.tempRawQuat.set(
        rawPose.quaternion.x,
        rawPose.quaternion.y,
        rawPose.quaternion.z,
        rawPose.quaternion.w
      );
    } else {
      this.tempEuler.set(rawPose.rotation.pitch, rawPose.rotation.yaw, rawPose.rotation.roll, "YXZ");
      this.tempRawQuat.setFromEuler(this.tempEuler);
    }

    const confMultiplier =
      confidenceState === "LOW_CONFIDENCE"
        ? 0.4
        : confidenceState === "MEDIUM_CONFIDENCE"
        ? 0.75
        : 1.0;
    const poseConfidence = (rawPose.poseConfidence ?? 1.0) * confMultiplier;
    const exprActivity = rawPose.expressionActivity ?? 0.0;

    const filtered = this.filterPose(
      this.tempRawPos,
      this.tempRawQuat,
      timestampMs,
      16.0,
      poseConfidence,
      exprActivity
    );

    this.tempEuler.setFromQuaternion(filtered.quaternion, "YXZ");

    return {
      ...rawPose,
      position: {
        x: filtered.position.x,
        y: filtered.position.y,
        z: filtered.position.z,
      },
      rotation: {
        pitch: this.tempEuler.x,
        yaw: this.tempEuler.y,
        roll: this.tempEuler.z,
      },
      quaternion: {
        x: filtered.quaternion.x,
        y: filtered.quaternion.y,
        z: filtered.quaternion.z,
        w: filtered.quaternion.w,
      },
      activityFactor: filtered.activityFactor,
    };
  }
}
