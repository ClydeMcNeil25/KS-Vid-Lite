export type EditStyleId = "viral" | "cinematic" | "podcast" | "clean";

export type EditPacing = "fast" | "balanced" | "slow" | "steady";

export interface EditStylePreset {
  id: EditStyleId;
  name: string;
  pacing: EditPacing;
  minClipLength: number;
  maxClipLength: number;
}