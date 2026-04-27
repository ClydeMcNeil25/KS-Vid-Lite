export type EditStyleId = "viral" | "cinematic" | "podcast" | "clean";

export type EditPacing = "fast" | "balanced" | "slow" | "steady";

export interface EditStylePadding {
  pre: number;
  post: number;
}

export interface EditStylePreset {
  id: EditStyleId;
  name: string;
  pacing: EditPacing;
  minClipLength: number;
  maxClipLength: number;
  padding: EditStylePadding;
}