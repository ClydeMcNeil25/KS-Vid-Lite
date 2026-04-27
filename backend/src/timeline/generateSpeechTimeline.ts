import { MediaFile } from "../types/media.types";
import { Timeline, TimelineClip } from "../types/timeline.types";
import { EditStylePreset } from "../types/style.types";
import { detectSilence } from "./detectSilence";
import { buildSpeechSegments } from "./buildSpeechSegments";
import { fillTimelineFallback } from "./fillTimelineFallback";

export async function generateSpeechTimeline(
  media: MediaFile[],
  targetDuration: number,
  stylePreset: EditStylePreset
): Promise<Timeline> {
  const clips: TimelineClip[] = [];
  let remainingDuration = targetDuration;

	const preRoll = stylePreset.padding?.pre ?? 0.3;
	const postRoll = stylePreset.padding?.post ?? 0.3;

  for (const file of media) {
    if (remainingDuration <= 0) break;

    const silence = await detectSilence(file.path);
    const speechSegments = buildSpeechSegments(silence, file.duration);

    for (const segment of speechSegments) {
      if (remainingDuration <= 0) break;

      // 🎯 Apply padding
      const paddedStart = Math.max(0, segment.start - preRoll);
      const paddedEnd = Math.min(file.duration, segment.end + postRoll);

      const paddedDuration = paddedEnd - paddedStart;

      if (paddedDuration < stylePreset.minClipLength) continue;

      const clipDuration = Math.min(
        paddedDuration,
        remainingDuration,
        stylePreset.maxClipLength
      );

      clips.push({
        mediaId: file.id, // ⚠️ if error → change to file.mediaId
        path: file.path,
        start: paddedStart,
        end: paddedStart + clipDuration,
        duration: clipDuration
      });

      remainingDuration -= clipDuration;
    }
  }

  const speechTimeline: Timeline = {
    targetDuration,
    totalDuration: targetDuration - remainingDuration,
    clips
  };

  // 🔒 Fallback safety
  const minimumUsableDuration = targetDuration * 0.7;

  if (
    speechTimeline.clips.length === 0 ||
    speechTimeline.totalDuration < minimumUsableDuration
  ) {
    return fillTimelineFallback(
      speechTimeline,
      media,
      targetDuration,
      stylePreset
    );
  }

  return speechTimeline;
}