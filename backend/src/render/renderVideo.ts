import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import { AspectRatio, OutputFps } from "../types/project.types";

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

console.log("FFMPEG STATIC PATH:", ffmpegPath);
console.log("FFMPEG RESOLVED PATH:", resolvedFfmpegPath);
console.log("FFPROBE STATIC PATH:", ffprobeStatic.path);
console.log("FFPROBE RESOLVED PATH:", resolvedFfprobePath);

ffmpeg.setFfmpegPath(resolvedFfmpegPath);
ffmpeg.setFfprobePath(resolvedFfprobePath);

export interface ClipInput {
  path: string;
  start?: number;
  end?: number;
}

interface RenderFormatOptions {
  aspectRatio?: AspectRatio;
  fps?: OutputFps;
}

function getDimensionsForAspectRatio(
  aspectRatio: AspectRatio = "16:9"
): { width: number; height: number } {
  switch (aspectRatio) {
    case "9:16":
      return { width: 1080, height: 1920 };
    case "1:1":
      return { width: 1080, height: 1080 };
    case "16:9":
    default:
      return { width: 1920, height: 1080 };
  }
}

function trimClip(
  input: ClipInput,
  outputPath: string,
  format: Required<RenderFormatOptions>
): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(input.path);
    const { width, height } = getDimensionsForAspectRatio(format.aspectRatio);

    if (input.start !== undefined) {
      command = command.setStartTime(input.start);
    }

    if (input.start !== undefined && input.end !== undefined) {
      command = command.setDuration(input.end - input.start);
    }

    command
      .videoFilters(
        [
          `scale=${width}:${height}:force_original_aspect_ratio=decrease`,
          `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black`,
          "setsar=1",
          `setdar=${width}/${height}`,
          `fps=${format.fps}`
        ].join(",")
      )
      .videoCodec("libx264")
      .audioCodec("aac")
      .outputOptions(["-pix_fmt yuv420p", "-movflags +faststart"])
      .output(outputPath)
      .on("start", (cmd) => console.log("Trim started:", cmd))
      .on("end", () => resolve())
      .on("error", (error, _stdout, stderr) => {
        const details = stderr?.trim();
        reject(
          new Error(details ? `${error.message}\n${details}` : error.message)
        );
      })
      .run();
  });
}

async function cleanupTempClips(tempClips: string[]) {
  await Promise.all(
    tempClips.map(async (clipPath) => {
      try {
        await fs.promises.unlink(clipPath);
      } catch {
        // Best-effort cleanup only.
      }
    })
  );
}

export async function renderVideo(
  clips: ClipInput[],
  outputPath: string,
  format: RenderFormatOptions = {}
): Promise<void> {
  if (!clips.length) {
    throw new Error("No clips provided.");
  }

  const normalizedFormat: Required<RenderFormatOptions> = {
    aspectRatio: format.aspectRatio ?? "16:9",
    fps: format.fps ?? 30
  };

  const dataDir = process.env.KS_VID_LITE_DATA_DIR
    ? path.resolve(process.env.KS_VID_LITE_DATA_DIR)
    : process.cwd();
  const tempDir = path.join(dataDir, "temp");
  fs.mkdirSync(tempDir, { recursive: true });

  const tempClips: string[] = [];

  for (let i = 0; i < clips.length; i++) {
    const tempPath = path.join(tempDir, `trimmed-${i}.mp4`);
    await trimClip(clips[i], tempPath, normalizedFormat);
    tempClips.push(tempPath);
  }

  try {
    await new Promise<void>((resolve, reject) => {
      const command = ffmpeg();

      for (const clipPath of tempClips) {
        command.input(clipPath);
      }

      command
        .on("start", (cmd) => console.log("FFmpeg started:", cmd))
        .on("end", () => resolve())
        .on("error", (error, _stdout, stderr) => {
          const details = stderr?.trim();
          reject(
            new Error(details ? `${error.message}\n${details}` : error.message)
          );
        })
        .mergeToFile(outputPath, tempDir);
    });

    console.log("Render complete:", outputPath);
  } finally {
    await cleanupTempClips(tempClips);
  }
}
