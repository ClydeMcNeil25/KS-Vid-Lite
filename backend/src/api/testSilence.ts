import path from "path";
import { detectSilence } from "../timeline/detectSilence";

async function main() {
  const inputPath = path.resolve("D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/render-output.mp4");

  const silence = await detectSilence(inputPath);

  console.log("Detected silence segments:");
  console.table(silence);
}

main().catch((error) => {
  console.error("Silence test failed:");
  console.error(error);
});