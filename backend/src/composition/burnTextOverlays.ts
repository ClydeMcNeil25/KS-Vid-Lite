import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import ffprobeStatic from "ffprobe-static";
import { TextOverlay } from "../types/overlay.types";

ffmpeg.setFfmpegPath(ffmpegPath as string);
ffmpeg.setFfprobePath(ffprobeStatic.path);

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
      .on("error", reject)
      .run();
  });
}