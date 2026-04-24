import { importMedia } from "../media/importMedia";

async function main() {
  const files = [
    "D:/Dropbox/02 Clients/Maly Files/Videos/Team Galaga Promo 01.mp4",
    "D:/Dropbox/02 Clients/Maly Files/Videos/TikTok D2 Worst Player Ever.mp4"
  ];

  const media = await importMedia(files);

  console.log("Imported media:");
  console.log(media);
}

main();