import { MediaFile } from "../types/media.types";
import { Timeline } from "../types/timeline.types";
import { EditStylePreset } from "../types/style.types";

function getRandomStart(maxStart: number): number {
  if (maxStart <= 0) return 0;
  return Math.floor(Math.random() * maxStart);
}

function getRandomClipLength(
  min: number,
  max: number,
  remainingDuration: number,
  mediaDuration: number
): number {
  const safeMax = Math.min(max, remainingDuration, mediaDuration);
  const safeMin = Math.min(min, safeMax);

  if (safeMax <= 0) return 0;

  return safeMin + Math.random() * (safeMax - safeMin);
}

export function generateTimeline(
  media: MediaFile[],
  targetDuration: number,
  style: EditStylePreset
): Timeline {
  if (!media.length) {
    throw new Error("No media provided for timeline generation.");
  }

  if (targetDuration <= 0) {
    throw new Error("Target duration must be greater than 0.");
  }

  const clips = [];
  let remainingDuration = targetDuration;
  let mediaIndex = 0;

  while (remainingDuration > 0.25) {
    const item = media[mediaIndex % media.length];

    const clipDuration = getRandomClipLength(
      style.minClipLength,
      style.maxClipLength,
      remainingDuration,
      item.duration
    );

    if (clipDuration <= 0) break;

    const maxStart = Math.max(0, item.duration - clipDuration);
    const start = getRandomStart(maxStart);
    const end = start + clipDuration;

    clips.push({
      mediaId: item.id,
      path: item.path,
      start,
      end,
      duration: clipDuration
    });

    remainingDuration -= clipDuration;
    mediaIndex++;
  }

  const totalDuration = clips.reduce((sum, clip) => sum + clip.duration, 0);

  return {
    targetDuration,
    totalDuration,
    clips
  };
}