import { renderVideo } from "../render/renderVideo";

async function main() {
  const clips = [
    {
      path: "D:/Dropbox/02 Clients/Maly Files/Videos/D2 The Worst Player Ever.mp4",
      start: 10,
      end: 30
    },
    {
      path: "D:/Dropbox/02 Clients/Maly Files/Videos/Let's Play Arc Raiders.mp4",
      start: 5,
      end: 20
    }
  ];

  const outputPath =
    "D:/Dropbox/05 Development/KS-Vid-Lite/backend/test-assets/render-output.mp4";

  await renderVideo(clips, outputPath);

  console.log("Render finished!");
}

main();