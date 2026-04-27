import { importMedia } from "../media/importMedia";
import { validateDuration } from "../duration/validateDuration";
import { generateTimeline } from "../timeline/generateTimeline";

async function main() {
  const files = [
    "D:/Dropbox/02 Clients/Maly Files/Videos/D2 Heavy Metal Time!.mp4",
    "D:/Dropbox/02 Clients/Maly Files/Videos/Comic Book VLOG 002.mp4"
  ];

  const targetDuration = 60;
  const mode = "free";

  const media = await importMedia(files);
  const validation = validateDuration(media, targetDuration, mode);

  console.log("Validation:");
  console.log(validation);

  if (!validation.valid) {
    console.log("Timeline generation blocked.");
    return;
  }

  const timeline = generateTimeline(media, targetDuration);

  console.log("Generated timeline:");
  console.log(JSON.stringify(timeline, null, 2));
}

main().catch(console.error);