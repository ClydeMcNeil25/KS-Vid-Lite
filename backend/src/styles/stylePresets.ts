import { EditStyleId, EditStylePreset } from "../types/style.types";

export const stylePresets: Record<EditStyleId, EditStylePreset> = {
  viral: {
    id: "viral",
    name: "Viral",
    pacing: "fast",
    minClipLength: 0.5,
    maxClipLength: 2.5,
    padding: {
      pre: 0.1,
      post: 0.1
    }
  },

  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    pacing: "slow",
    minClipLength: 2,
    maxClipLength: 6,
    padding: {
      pre: 0.5,
      post: 0.6
    }
  },

  podcast: {
    id: "podcast",
    name: "Podcast",
    pacing: "steady",
    minClipLength: 2,
    maxClipLength: 8,
    padding: {
      pre: 0.3,
      post: 0.5
    }
  },

  clean: {
    id: "clean",
    name: "Clean",
    pacing: "balanced",
    minClipLength: 1,
    maxClipLength: 4,
    padding: {
      pre: 0.25,
      post: 0.25
    }
  }
};

export function getStylePreset(styleId: EditStyleId): EditStylePreset {
  return stylePresets[styleId];
}