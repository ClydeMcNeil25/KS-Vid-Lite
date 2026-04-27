export function highlightWords(text: string): string {
  const words = text.split(" ");

  if (words.length === 0) return text;

  // simple strategy: highlight longest word
  let longestIndex = 0;

  for (let i = 1; i < words.length; i++) {
    if (words[i].length > words[longestIndex].length) {
      longestIndex = i;
    }
  }

  return words
    .map((word, i) =>
      i === longestIndex ? `{H}${word}{/H}` : word
    )
    .join(" ");
}