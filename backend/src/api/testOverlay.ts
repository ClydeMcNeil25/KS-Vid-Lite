import { burnTextOverlays } from "../composition/burnTextOverlays";

async function main() {
  const inputPath =
    "D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/auto-edit-output.mp4";

  const outputPath =
    "D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/overlay-output.mp4";

  await burnTextOverlays(inputPath, outputPath, [
    {
      text: "KS-Vid-Lite Alpha",
      start: 0,
      end: 5,
      x: "(w-text_w)/2",
      y: "h-180",
      fontSize: 52
    },
    {
      text: "Auto Edited",
      start: 5,
      end: 10,
      x: "(w-text_w)/2",
      y: "h-180",
      fontSize: 52
    }
  ]);

  console.log("Overlay test complete:");
  console.log(outputPath);
}

main().catch(console.error);