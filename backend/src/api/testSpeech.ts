import path from "path";
import { detectSilence } from "../timeline/detectSilence";
import { buildSpeechSegments } from "../timeline/buildSpeechSegments";

async function main() {
  const inputPath = "D:/Videos/my-test-video.mp4";

  const silence = await detectSilence(inputPath);

  const totalDuration = 60; // TEMP: replace later with real metadata
  const speech = buildSpeechSegments(silence, totalDuration);

  console.log("Speech segments:");
  console.table(speech);
}

main();