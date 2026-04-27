import { EditStyleId, EditStylePreset } from "../types/style.types";

export const stylePresets: Record<EditStyleId, EditStylePreset> = {
  viral: {
    id: "viral",
    name: "Viral",
    pacing: "fast",
    minClipLength: 0.75,
    maxClipLength: 2.5,
    padding: {
      pre: 0.3,
      post: 0.5
    }
  },

  cinematic: {
    id: "cinematic",
    name: "Cinematic",
    pacing: "slow",
    minClipLength: 3,
    maxClipLength: 6,
    padding: {
      pre: 0.5,
      post: 0.7
    }
  },

  podcast: {
    id: "podcast",
    name: "Podcast",
    pacing: "steady",
    minClipLength: 2,
    maxClipLength: 10,
    padding: {
      pre: 0.5,
      post: 1
    }
  },

  clean: {
    id: "clean",
    name: "Clean",
    pacing: "balanced",
    minClipLength: 1,
    maxClipLength: 5,
    padding: {
      pre: 0.2,
      post: 0.6
    }
  }
};

export function getStylePreset(styleId: EditStyleId): EditStylePreset {
  return stylePresets[styleId];
}
