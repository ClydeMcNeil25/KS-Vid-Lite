import { importMedia } from "../media/importMedia";
import { validateDuration } from "../duration/validateDuration";
import { generateTimeline } from "../timeline/generateTimeline";
import { renderVideo } from "../render/renderVideo";

async function main() {
  const files = [
    "D:/Dropbox/02 Clients/Maly Files/Videos/Well Damn.mp4",
    "D:/Dropbox/02 Clients/Maly Files/Videos/Desert Perpetual Remix.mp4"
  ];

  const targetDuration = 60;
  const mode = "free";

  const outputPath =
    "D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/full-pipeline-output.mp4";

  console.log("Importing media...");
  const media = await importMedia(files);

  console.log("Validating duration...");
  const validation = validateDuration(media, targetDuration, mode);
  console.log(validation);

  if (!validation.valid) {
    console.log("Pipeline blocked.");
    return;
  }

  console.log("Generating timeline...");
  const timeline = generateTimeline(media, targetDuration);
  console.log(JSON.stringify(timeline, null, 2));

  console.log("Rendering video...");
  await renderVideo(timeline.clips, outputPath);

  console.log("Full pipeline complete:");
  console.log(outputPath);
}

main().catch((error) => {
  console.error("Pipeline failed:");
  console.error(error);
});