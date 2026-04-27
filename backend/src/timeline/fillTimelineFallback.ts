import { MediaFile } from "../types/media.types";
import { Timeline, TimelineClip } from "../types/timeline.types";
import { EditStylePreset } from "../types/style.types";
import { generateTimeline } from "./generateTimeline";

export function fillTimelineFallback(
  currentTimeline: Timeline,
  media: MediaFile[],
  targetDuration: number,
  stylePreset: EditStylePreset
): Timeline {
  const remainingDuration = targetDuration - currentTimeline.totalDuration;

  if (remainingDuration <= 0) {
    return currentTimeline;
  }

  const fallbackTimeline = generateTimeline(
    media,
    remainingDuration,
    stylePreset
  );

  const mergedClips: TimelineClip[] = [
    ...currentTimeline.clips,
    ...fallbackTimeline.clips
  ];

  const totalDuration = mergedClips.reduce(
    (sum, clip) => sum + clip.duration,
    0
  );

  return {
    targetDuration,
    totalDuration,
    clips: mergedClips
  };
}