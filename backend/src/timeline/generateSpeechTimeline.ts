import { MediaFile } from "../types/media.types";
import { Timeline, TimelineClip } from "../types/timeline.types";
import { EditStylePreset } from "../types/style.types";
import { detectSilence } from "./detectSilence";
import { buildSpeechSegments } from "./buildSpeechSegments";

export async function generateSpeechTimeline(
  media: MediaFile[],
  targetDuration: number,
  stylePreset: EditStylePreset
): Promise<Timeline> {
  const clips: TimelineClip[] = [];
  let remainingDuration = targetDuration;

  for (const file of media) {
    if (remainingDuration <= 0) break;

    const silence = await detectSilence(file.path);
    const speechSegments = buildSpeechSegments(silence, file.duration);

    for (const segment of speechSegments) {
      if (remainingDuration <= 0) break;

      const segmentDuration = segment.end - segment.start;

      if (segmentDuration <= 0.2) continue;

      const clipDuration = Math.min(
        segmentDuration,
        remainingDuration,
        stylePreset.maxClipLength
      );

      clips.push({
        mediaId: file.id,
        path: file.path,
        start: segment.start,
        end: segment.start + clipDuration,
        duration: clipDuration
      });

      remainingDuration -= clipDuration;
    }
  }

  return {
    targetDuration,
    totalDuration: targetDuration - remainingDuration,
    clips
  };
}