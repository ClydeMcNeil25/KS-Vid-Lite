import { Caption } from "../types/caption.types";

export interface ChunkCaptionOptions {
  maxWordsPerChunk?: number;
  uppercase?: boolean;
}

export function chunkCaptions(
  captions: Caption[],
  options: ChunkCaptionOptions = {}
): Caption[] {
  const maxWordsPerChunk = options.maxWordsPerChunk ?? 3;
  const uppercase = options.uppercase ?? true;

  const chunkedCaptions: Caption[] = [];

  for (const caption of captions) {
    const words = caption.text.trim().split(/\s+/);

    if (words.length <= maxWordsPerChunk) {
      chunkedCaptions.push({
        ...caption,
        text: uppercase ? caption.text.toUpperCase() : caption.text
      });
      continue;
    }

    const totalDuration = caption.end - caption.start;
    const chunkCount = Math.ceil(words.length / maxWordsPerChunk);
    const chunkDuration = totalDuration / chunkCount;

    for (let i = 0; i < chunkCount; i++) {
      const chunkWords = words.slice(
        i * maxWordsPerChunk,
        i * maxWordsPerChunk + maxWordsPerChunk
      );

      const start = caption.start + i * chunkDuration;
      const end = Math.min(start + chunkDuration, caption.end);

      chunkedCaptions.push({
        text: uppercase ? chunkWords.join(" ").toUpperCase() : chunkWords.join(" "),
        start,
        end
      });
    }
  }

  return chunkedCaptions;
}