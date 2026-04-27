import ffprobeStatic from "ffprobe-static";
import { execFile } from "child_process";
import { randomUUID } from "crypto";
import fs from "fs";
import path from "path";
import { MediaFile } from "../types/media.types";

function resolveFfprobePath() {
  const staticPath = ffprobeStatic.path;
  const resourcesPath =
    (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;

  if (resourcesPath) {
    const directPath = path.join(resourcesPath, "bin", "ffprobe.exe");

    if (fs.existsSync(directPath)) {
      return directPath;
    }
  }

  const unpackedPath = staticPath.replace(
    /app\.asar/g,
    "app.asar.unpacked"
  );

  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }

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

interface FfprobeStream {
  codec_type?: string;
  width?: number;
  height?: number;
}

interface FfprobeFormat {
  duration?: number | string;
}

interface FfprobeResult {
  streams?: FfprobeStream[];
  format?: FfprobeFormat;
}

export function extractMetadata(filePath: string): Promise<MediaFile> {
  return new Promise((resolve, reject) => {
    execFile(
      ffprobePath,
      [
        "-v",
        "error",
        "-print_format",
        "json",
        "-show_format",
        "-show_streams",
        filePath
      ],
      (error, stdout, stderr) => {
        if (error) {
          const details = stderr?.trim();
          reject(
            new Error(
              `Failed to read metadata: ${
                details || error.message
              }`
            )
          );
          return;
        }

        let metadata: FfprobeResult;

        try {
          metadata = JSON.parse(stdout) as FfprobeResult;
        } catch (parseError) {
          reject(
            new Error(
              `Failed to parse metadata output: ${
                parseError instanceof Error
                  ? parseError.message
                  : "Unknown parse error"
              }`
            )
          );
          return;
        }

        const videoStream = metadata.streams?.find(
          (stream) => stream.codec_type === "video"
        );

        if (!videoStream) {
          reject(new Error(`No video stream found in file: ${filePath}`));
          return;
        }

        const durationValue = metadata.format?.duration;
        const duration =
          typeof durationValue === "number"
            ? durationValue
            : Number(durationValue ?? 0);

        resolve({
          id: randomUUID(),
          path: filePath,
          duration: Number.isFinite(duration) ? duration : 0,
          width: videoStream.width ?? 0,
          height: videoStream.height ?? 0
        });
      }
    );
  });
}
