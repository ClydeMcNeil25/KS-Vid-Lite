import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";
import { randomUUID } from "crypto";
import { MediaFile } from "../types/media.types";

/**
 * Fix for Electron packaged apps:
 * Convert app.asar → app.asar.unpacked so binaries can run
 */
function resolveAsarPath(binaryPath: string) {
  if (!binaryPath) return binaryPath;
  return binaryPath.replace("app.asar", "app.asar.unpacked");
}

const ffprobePath = resolveAsarPath(ffprobeStatic.path);

console.log("Using ffprobe path:", ffprobePath);

ffmpeg.setFfprobePath(ffprobePath);

export function extractMetadata(filePath: string): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(
      filePath,
      (error: Error | null, metadata: ffmpeg.FfprobeData) => {
        if (error) {
          reject(new Error(`Failed to read metadata: ${error.message}`));
          return;
        }

        const videoStream = metadata.streams.find(
          (stream: ffmpeg.FfprobeStream) =>
            stream.codec_type === "video"
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
      }
    );
  });
}