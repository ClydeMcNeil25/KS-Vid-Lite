import { extractMetadata } from "./extractMetadata";
import { MediaFile } from "../types/media.types";

export async function importMedia(
  filePaths: string[]
): Promise<MediaFile[]> {
  const results: MediaFile[] = [];

  for (const filePath of filePaths) {
    try {
      const metadata = await extractMetadata(filePath);
      results.push(metadata);
    } catch (error) {
      console.error(`Failed to process file: ${filePath}`);
      console.error(error);
    }
  }

  return results;
}