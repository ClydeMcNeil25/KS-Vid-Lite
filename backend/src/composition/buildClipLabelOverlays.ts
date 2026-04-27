import { Timeline } from "../types/timeline.types";
import { TextOverlay } from "../types/overlay.types";

export function buildClipLabelOverlays(timeline: Timeline): TextOverlay[] {
  let currentTime = 0;

  return timeline.clips.map((clip, index) => {
    const overlay: TextOverlay = {
      text: `Clip ${index + 1}`,
      start: currentTime,
      end: currentTime + clip.duration,
      x: "(w-text_w)/2",
      y: "h-160",
      fontSize: 48
    };

    currentTime += clip.duration;

    return overlay;
  });
}