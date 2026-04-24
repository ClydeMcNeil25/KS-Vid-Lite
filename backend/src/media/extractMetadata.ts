import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";
import { randomUUID } from "crypto";
import { MediaFile } from "../types/media.types";

ffmpeg.setFfprobePath(ffprobeStatic.path);

export function extractMetadata(filePath: string): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(filePath, (error: Error | null, metadata: ffmpeg.FfprobeData) => {
      if (error) {
        reject(new Error(`Failed to read metadata: ${error.message}`));
        return;
      }

      const videoStream = metadata.streams.find(
        (stream: ffmpeg.FfprobeStream) => stream.codec_type === "video"
      );

      if (!videoStream) {
        reject(new Error(`No video stream found in file: ${filePath}`));
        return;
      }

      resolve({
        id: randomUUID(),
        path: filePath,
        duration: metadata.format.duration ?? 0,
        width: videoStream.width ?? 0,
        height: videoStream.height ?? 0
      });
    });
  });
}