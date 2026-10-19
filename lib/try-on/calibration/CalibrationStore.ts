import { FrameCalibration } from "@/types/tryOn";
import { DEFAULT_CALIBRATION } from "./FrameCalibration";

const LOCAL_STORAGE_KEY_PREFIX = "precision_vto_calib_";

export class CalibrationStore {
  public static getCalibration(productId: string, fallback?: Partial<FrameCalibration>): FrameCalibration {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          // Cleanse legacy offsets from earlier manual calibration hacks
          if (
            parsed &&
            (parsed.depthOffset === 0.015 ||
              parsed.depthOffset === 0.018 ||
              parsed.verticalOffset === -0.008 ||
              parsed.verticalOffset === -0.012)
          ) {
            parsed.depthOffset = 0.0;
            parsed.verticalOffset = 0.0;
            parsed.pitchOffset = 0.0;
          }
          return { ...DEFAULT_CALIBRATION, ...fallback, ...parsed };
        }
      } catch (err) {
        console.warn("Error reading calibration from localStorage:", err);
      }
    }

    return {
      ...DEFAULT_CALIBRATION,
      ...fallback,
    };
  }

  public static saveCalibration(productId: string, calibration: FrameCalibration): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`, JSON.stringify(calibration));
      } catch (err) {
        console.warn("Error saving calibration to localStorage:", err);
      }
    }
  }

  public static resetCalibration(productId: string): void {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(`${LOCAL_STORAGE_KEY_PREFIX}${productId}`);
      } catch (err) {
        console.warn("Error clearing calibration from localStorage:", err);
      }
    }
  }
}
