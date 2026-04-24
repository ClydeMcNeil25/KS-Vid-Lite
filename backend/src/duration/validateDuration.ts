import { DurationValidationResult } from "../types/duration.types";
import { MediaFile } from "../types/media.types";
import { DurationMode } from "../types/project.types";

export function validateDuration(
  media: MediaFile[],
  target: number,
  mode: DurationMode
): DurationValidationResult {
  const total = media.reduce((sum, m) => sum + m.duration, 0);

  if (mode === "free") {
    return { valid: true, totalDuration: total };
  }

  if (mode === "strict") {
    if (total < target) {
      return {
        valid: false,
        error: "TOO_SHORT",
        message: `Not enough footage (${total}s / ${target}s)`,
        totalDuration: total
      };
    }

    if (total > target) {
      return {
        valid: false,
        error: "TOO_LONG",
        message: `Too much footage (${total}s / ${target}s)`,
        totalDuration: total
      };
    }
  }

  if (mode === "smart") {
    if (total < target * 0.7) {
      return {
        valid: false,
        error: "EXTREME_SHORT",
        message: "Way too little footage to generate edit",
        totalDuration: total
      };
    }

    if (total > target * 3) {
      return {
        valid: false,
        error: "EXTREME_LONG",
        message: "Too much footage for auto-edit to handle",
        totalDuration: total
      };
    }
  }

  return { valid: true, totalDuration: total };
}