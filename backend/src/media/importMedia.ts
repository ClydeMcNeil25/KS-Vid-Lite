import { extractMetadata } from "./extractMetadata";
import { MediaFile } from "../types/media.types";

export async function importMedia(filePaths: string[]): Promise<MediaFile[]> {
  const results: MediaFile[] = [];
  const failures: string[] = [];

  console.log("IMPORT MEDIA INPUTS:", filePaths);

  for (const filePath of filePaths) {
    try {
      console.log("Reading media metadata:", filePath);

      const metadata = await extractMetadata(filePath);

      console.log("Metadata success:", {
        path: metadata.path,
        duration: metadata.duration,
        width: metadata.width,
        height: metadata.height
      });

      results.push(metadata);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);

      console.error(`Failed to process file: ${filePath}`);
      console.error(message);

      failures.push(`${filePath}: ${message}`);
    }
  }

  if (results.length === 0 && failures.length > 0) {
    throw new Error(
      `All media files failed metadata extraction:\n${failures.join("\n")}`
    );
  }

  return results;
}