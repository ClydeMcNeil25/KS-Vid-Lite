import { Caption } from "../types/caption.types";
import { TextOverlay } from "../types/overlay.types";
import { EditStyleId } from "../types/style.types";
import { CaptionStyles } from "./captionStyles";
import { getYPosition } from "./positionUtils";

export function buildCaptionOverlays(
  captions: Caption[],
  styleType: EditStyleId
): TextOverlay[] {
  const style = CaptionStyles[styleType] ?? CaptionStyles.clean;
  const overlays: TextOverlay[] = [];

  for (const caption of captions) {
    const words = caption.text.trim().split(/\s+/);

    let longestIndex = 0;

    for (let i = 1; i < words.length; i++) {
      if (words[i].length > words[longestIndex].length) {
        longestIndex = i;
      }
    }

    const y = getYPosition(style.position);

    words.forEach((word, index) => {
      overlays.push({
        text: word,
        start: caption.start,
        end: caption.end,
        options: {
          fontsize: style.fontSize,
          fontcolor: index === longestIndex ? "yellow" : style.fontColor,
          bordercolor: style.fontBorderColor,
          borderw: style.fontBorderWidth,
          x: "(w-text_w)/2",
          y: `${y}+${index * 60}`,
          enable: `between(t,${caption.start},${caption.end})`,
          alpha:
            style.animation === "fade"
              ? `if(lt(t-${caption.start},0.3),(t-${caption.start})/0.3,1)`
              : undefined
        }
      });
    });
  }

  return overlays;
}