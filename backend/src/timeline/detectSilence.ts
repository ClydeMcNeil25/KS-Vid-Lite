import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

function getResourcesPath() {
  return (process as NodeJS.Process & { resourcesPath?: string }).resourcesPath;
}

function resolvePackedBinaryPath(
  binaryPath: string | null,
  binaryName: "ffmpeg.exe" | "ffprobe.exe",
  fallbackParts: string[]
) {
  const resourcesPath = getResourcesPath();

  if (resourcesPath) {
    const directPath = path.join(resourcesPath, "bin", binaryName);

    if (fs.existsSync(directPath)) {
      return directPath;
    }
  }

  if (!binaryPath) {
    return "";
  }

  const unpackedPath = binaryPath.replace(/app\.asar/g, "app.asar.unpacked");

  if (fs.existsSync(unpackedPath)) {
    return unpackedPath;
  }

  if (resourcesPath) {
    const manualPath = path.join(
      resourcesPath,
      "app.asar.unpacked",
      ...fallbackParts
    );

    if (fs.existsSync(manualPath)) {
      return manualPath;
    }
  }

  return binaryPath;
}

const resolvedFfmpegPath = resolvePackedBinaryPath(
  ffmpegPath,
  "ffmpeg.exe",
  ["node_modules", "ffmpeg-static", "ffmpeg.exe"]
);

const resolvedFfprobePath = resolvePackedBinaryPath(
  ffprobeStatic.path,
  "ffprobe.exe",
  ["node_modules", "ffprobe-static", "bin", "win32", "x64", "ffprobe.exe"]
);

ffmpeg.setFfmpegPath(resolvedFfmpegPath);
ffmpeg.setFfprobePath(resolvedFfprobePath);

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
