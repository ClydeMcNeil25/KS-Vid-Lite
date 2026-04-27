export type OverlayPosition = "top" | "center" | "bottom";

export function getYPosition(position: OverlayPosition): string {
  switch (position) {
    case "top":
      return "h*0.2";

    case "center":
      return "(h-text_h)/2";

    case "bottom":
      return "h*0.8";

    default:
      return "h*0.8";
  }
}