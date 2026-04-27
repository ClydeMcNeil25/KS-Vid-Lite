import { SilenceSegment } from "./detectSilence";

export interface SpeechSegment {
  start: number;
  end: number;
}

export function buildSpeechSegments(
  silence: SilenceSegment[],
  totalDuration: number
): SpeechSegment[] {
  const speech: SpeechSegment[] = [];

  let currentStart = 0;

  for (const segment of silence) {
    if (segment.start > currentStart) {
      speech.push({
        start: currentStart,
        end: segment.start
      });
    }

    currentStart = segment.end;
  }

  // Handle final segment after last silence
  if (currentStart < totalDuration) {
    speech.push({
      start: currentStart,
      end: totalDuration
    });
  }

  return speech;
}