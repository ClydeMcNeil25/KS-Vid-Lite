import path from "path";
import { extractMetadata } from "../media/extractMetadata";

async function main() {
  try {
    const videoPath = "D:/Dropbox/02 Clients/Maly Files/Videos/Shenanigans in D2 YTS and FBR.mp4";
    const metadata = await extractMetadata(videoPath);

    console.log("Video metadata:");
    console.log(metadata);
  } catch (error) {
    console.error(error);
  }
}

main();