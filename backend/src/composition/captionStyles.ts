import { EditStyleId } from "../types/style.types";

export interface CaptionStyleConfig {
  fontSize: number;
  fontColor: string;
  fontBorderColor?: string;
  fontBorderWidth?: number;
  position: "top" | "center" | "bottom";
  animation?: "none" | "fade";
}

export const CaptionStyles: Record<EditStyleId, CaptionStyleConfig> = {
  viral: {
    fontSize: 48,
    fontColor: "white",
    fontBorderColor: "black",
    fontBorderWidth: 3,
    position: "center",
    animation: "none"
  },

  cinematic: {
    fontSize: 36,
    fontColor: "white",
    fontBorderColor: "black",
    fontBorderWidth: 2,
    position: "bottom",
    animation: "fade"
  },

  podcast: {
    fontSize: 30,
    fontColor: "yellow",
    fontBorderColor: "black",
    fontBorderWidth: 2,
    position: "bottom",
    animation: "none"
  },

  clean: {
    fontSize: 26,
    fontColor: "white",
    fontBorderColor: "black",
    fontBorderWidth: 1,
    position: "bottom",
    animation: "none"
  }
};