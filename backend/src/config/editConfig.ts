import { EditStyleId } from "../types/style.types";

export interface CaptionConfig {
  maxWordsPerChunk: number;
  uppercase: boolean;
  highlightEnabled: boolean;
}

export interface SilenceConfig {
  noiseThresholdDb: number;
  minSilenceDuration: number;
}

export interface EditConfig {
  style: EditStyleId;
  captions: CaptionConfig;
  silence: SilenceConfig;
}

export const DEFAULT_EDIT_CONFIG: Record<EditStyleId, EditConfig> = {
  viral: {
    style: "viral",
    captions: {
      maxWordsPerChunk: 2,
      uppercase: true,
      highlightEnabled: true
    },
    silence: {
      noiseThresholdDb: -30,
      minSilenceDuration: 0.25
    }
  },

  cinematic: {
    style: "cinematic",
    captions: {
      maxWordsPerChunk: 4,
      uppercase: false,
      highlightEnabled: false
    },
    silence: {
      noiseThresholdDb: -35,
      minSilenceDuration: 0.4
    }
  },

  podcast: {
    style: "podcast",
    captions: {
      maxWordsPerChunk: 5,
      uppercase: false,
      highlightEnabled: false
    },
    silence: {
      noiseThresholdDb: -32,
      minSilenceDuration: 0.5
    }
  },

  clean: {
    style: "clean",
    captions: {
      maxWordsPerChunk: 4,
      uppercase: false,
      highlightEnabled: true
    },
    silence: {
      noiseThresholdDb: -30,
      minSilenceDuration: 0.3
    }
  }
};

export function getEditConfig(style: EditStyleId): EditConfig {
  return DEFAULT_EDIT_CONFIG[style] ?? DEFAULT_EDIT_CONFIG.clean;
}