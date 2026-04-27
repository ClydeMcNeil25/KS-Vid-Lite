import { importMedia } from "../media/importMedia";
import { validateDuration } from "../duration/validateDuration";

async function main() {
  const files = [
	"D:/Dropbox/02 Clients/Maly Files/Videos/Well Damn.mp4",
	"D:/Dropbox/02 Clients/Maly Files/Videos/Desert Perpetual Remix.mp4"
  ];

  const targetDuration = 60;
  const mode = "smart";

  const media = await importMedia(files);
  const validation = validateDuration(media, targetDuration, mode);

  console.log("Imported media:");
  console.log(media);

  console.log("Duration validation:");
  console.log(validation);
}

main();