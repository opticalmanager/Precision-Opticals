/**
 * ScaleCalibration
 * Derives real-world millimeter scale from 2D/3D normalized facial landmarks.
 */

// Average adult interpupillary distance (IPD) is ~63mm (range: 58mm - 70mm)
export const HUMAN_AVERAGE_IPD_MM = 63.0;

// Average adult temple-to-temple face width is ~140mm
export const HUMAN_AVERAGE_FACE_WIDTH_MM = 140.0;

// Standard reference eye distance in normalized camera coordinates for adult sitting ~55cm from webcam
export const REFERENCE_EYE_DISTANCE_NORM = 0.095;

// Standard reference temple-to-temple width in normalized coordinates
export const REFERENCE_FACE_WIDTH_NORM = 0.21;

/**
 * Calculates Euclidean distance between left and right pupils or eye centers
 */
export function calculateInterEyeDistance(
  rightPupil: { x: number; y: number },
  leftPupil: { x: number; y: number }
): number {
  const dx = rightPupil.x - leftPupil.x;
  const dy = rightPupil.y - leftPupil.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Calculates Euclidean distance between right and left temples (landmarks 127 and 356)
 */
export function calculateFaceWidth(
  rightTemple: { x: number; y: number },
  leftTemple: { x: number; y: number }
): number {
  const dx = rightTemple.x - leftTemple.x;
  const dy = rightTemple.y - leftTemple.y;
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Computes base 3D model scale given inter-eye distance and optional face width
 * Uses 70/30 blending between IPD and temple width for robust sizing across different facial shapes
 */
export function computeBaseScale(interEyeDistNorm: number, faceWidthNorm?: number): number {
  if (interEyeDistNorm <= 0.001) return 1.0;

  const ipdRatio = interEyeDistNorm / REFERENCE_EYE_DISTANCE_NORM;

  let ratio = ipdRatio;
  if (faceWidthNorm && faceWidthNorm > 0.01) {
    const faceWidthRatio = faceWidthNorm / REFERENCE_FACE_WIDTH_NORM;
    // Blend 70% IPD and 30% Temple Width
    ratio = ipdRatio * 0.7 + faceWidthRatio * 0.3;
  }

  // Clamp to realistic range (0.55x to 2.4x) to prevent extreme scaling during momentary edge detections
  return Math.max(0.55, Math.min(2.4, ratio));
}

/**
 * Computes dynamic world-space Z depth based on detected face size and camera FOV
 * Produces accurate perspective scaling as user moves towards/away from camera
 */
export function computeDynamicDepthZ(interEyeDistNorm: number, cameraFovDeg = 45): number {
  if (interEyeDistNorm <= 0.001) return -0.55;

  const tanHalfFov = Math.tan((cameraFovDeg * Math.PI) / 360.0);
  // IPD in meters (0.063m) / (interEyeDistNorm * 2 * tan(fov/2))
  const estimatedDepth = -(0.063 / (interEyeDistNorm * 2.0 * tanHalfFov));

  // Clamp depth to standard webcam distance range (-0.35m to -0.85m)
  return Math.max(-0.85, Math.min(-0.35, estimatedDepth));
}
