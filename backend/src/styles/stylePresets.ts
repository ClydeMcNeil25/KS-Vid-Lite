import { EditStyleId, EditStylePreset } from "../types/style.types";

export const STYLE_PRESETS: Record<EditStyleId, EditStylePreset> = {
  viral: {
    id: "viral",
    name: "Viral",
    pacing: "fast",
    minClipLength: 2,
    maxClipLength: 6
  },

  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    pacing: "slow",
    minClipLength: 6,
    maxClipLength: 12
  },

  podcast: {
    id: "podcast",
    name: "Podcast",
    pacing: "steady",
    minClipLength: 10,
    maxClipLength: 20
  },

  clean: {
    id: "clean",
    name: "Clean Business",
    pacing: "balanced",
    minClipLength: 5,
    maxClipLength: 10
  }
};

export function getStylePreset(styleId: EditStyleId): EditStylePreset {
  return STYLE_PRESETS[styleId];
}