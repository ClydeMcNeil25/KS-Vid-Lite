import ffmpeg from "fluent-ffmpeg";
import ffprobeStatic from "ffprobe-static";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { MediaFile } from "../types/media.types";

function resolveFfprobePath() {
  const staticPath = ffprobeStatic.path;

  const unpackedPath = staticPath.replace(
    /app\.asar/g,
    "app.asar.unpacked"
  );

  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }

  const resourcesPath = process.resourcesPath;

  if (resourcesPath) {
    const manualPath = path.join(
      resourcesPath,
      "app.asar.unpacked",
      "node_modules",
      "ffprobe-static",
      "bin",
      "win32",
      "x64",
      "ffprobe.exe"
    );

    if (fs.existsSync(manualPath)) {
      return manualPath;
    }
  }

  return staticPath;
}

const ffprobePath = resolveFfprobePath();

console.log("FFPROBE STATIC PATH:", ffprobeStatic.path);
console.log("FFPROBE RESOLVED PATH:", ffprobePath);

ffmpeg.setFfprobePath(ffprobePath);

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