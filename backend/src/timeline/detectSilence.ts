import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export interface SilenceSegment {
  start: number;
  end: number;
}

export function detectSilence(inputPath: string): Promise<SilenceSegment[]> {
  return new Promise((resolve, reject) => {
    const silenceSegments: SilenceSegment[] = [];

    ffmpeg(inputPath)
      .audioFilters("silencedetect=noise=-30dB:d=0.3")
      .format("null")
      .output("-")
      .on("stderr", (line) => {
        const startMatch = line.match(/silence_start: (\d+(\.\d+)?)/);
        const endMatch = line.match(/silence_end: (\d+(\.\d+)?)/);

        if (startMatch) {
          silenceSegments.push({
            start: parseFloat(startMatch[1]),
            end: 0
          });
        }

        if (endMatch && silenceSegments.length > 0) {
          silenceSegments[silenceSegments.length - 1].end = parseFloat(
            endMatch[1]
          );
        }
      })
      .on("end", () => {
        resolve(silenceSegments.filter((segment) => segment.end > segment.start));
      })
      .on("error", reject)
      .run();
  });
}