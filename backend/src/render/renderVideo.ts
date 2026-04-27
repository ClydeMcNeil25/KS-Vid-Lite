import fs from "fs";
import path from "path";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobeStatic.path);

export interface ClipInput {
  path: string;
  start?: number;
  end?: number;
}

function trimClip(input: ClipInput, outputPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    let command = ffmpeg(input.path);

    if (input.start !== undefined) {
      command = command.setStartTime(input.start);
    }

    if (input.start !== undefined && input.end !== undefined) {
      command = command.setDuration(input.end - input.start);
    }

    command
      .output(outputPath)
      .on("end", () => resolve())
      .on("error", reject)
      .run();
  });
}

export async function renderVideo(
  clips: ClipInput[],
  outputPath: string
): Promise<void> {
  if (!clips.length) {
    throw new Error("No clips provided.");
  }

  const tempDir = path.resolve(process.cwd(), "temp");
  fs.mkdirSync(tempDir, { recursive: true });

  const tempClips: string[] = [];

  for (let i = 0; i < clips.length; i++) {
    const tempPath = path.join(tempDir, `trimmed-${i}.mp4`);
    await trimClip(clips[i], tempPath);
    tempClips.push(tempPath);
  }

  await new Promise<void>((resolve, reject) => {
    const command = ffmpeg();

    for (const clipPath of tempClips) {
      command.input(clipPath);
    }

    command
      .on("start", (cmd) => console.log("FFmpeg started:", cmd))
      .on("end", () => resolve())
      .on("error", reject)
      .mergeToFile(outputPath, tempDir);
  });

  console.log("Render complete:", outputPath);
}