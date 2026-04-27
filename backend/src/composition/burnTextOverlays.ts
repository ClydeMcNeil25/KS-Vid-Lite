import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import path from "path";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import { TextOverlay } from "../types/overlay.types";

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

function escapeText(text: string): string {
  return text
    .replace(/\\/g, "\\\\")
    .replace(/:/g, "\\:")
    .replace(/'/g, "\\'")
    .replace(/,/g, "\\,");
}

function buildDrawTextFilter(overlay: TextOverlay): string {
  const text = escapeText(overlay.text);

  const options = overlay.options ?? {};

  const x = options.x ?? overlay.x ?? "(w-text_w)/2";
  const y = options.y ?? overlay.y ?? "h-160";

  const fontSize = options.fontsize ?? overlay.fontSize ?? 42;
  const fontColor = options.fontcolor ?? "white";

  const borderColor = options.bordercolor ?? "black";
  const borderWidth = options.borderw ?? 0;

  const enable =
    options.enable ?? `between(t,${overlay.start},${overlay.end})`;

  const filterParts = [
    `drawtext=text='${text}'`,
    `fontsize=${fontSize}`,
    `fontcolor=${fontColor}`,
    `x=${x}`,
    `y=${y}`,
    `enable='${enable}'`
  ];

  if (borderWidth > 0) {
    filterParts.push(`bordercolor=${borderColor}`);
    filterParts.push(`borderw=${borderWidth}`);
  }

  if (options.alpha) {
    filterParts.push(`alpha='${options.alpha}'`);
  }

  return filterParts.join(":");
}

export function burnTextOverlays(
  inputPath: string,
  outputPath: string,
  overlays: TextOverlay[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!overlays.length) {
      reject(new Error("No overlays provided."));
      return;
    }

    const videoFilter = overlays.map(buildDrawTextFilter).join(",");

    ffmpeg(inputPath)
      .videoFilters(videoFilter)
      .outputOptions(["-c:a copy"])
      .output(outputPath)
      .on("start", (cmd) => {
        console.log("Overlay render started:");
        console.log(cmd);
      })
      .on("end", () => {
        console.log("Overlay render complete.");
        resolve();
      })
      .on("error", (error, _stdout, stderr) => {
        const details = stderr?.trim();
        reject(
          new Error(
            details ? `${error.message}\n${details}` : error.message
          )
        );
      })
      .run();
  });
}
