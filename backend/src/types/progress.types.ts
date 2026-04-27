export type PipelineStage =
  | "starting"
  | "importing_media"
  | "validating_duration"
  | "loading_style"
  | "generating_timeline"
  | "rendering_base_video"
  | "processing_captions"
  | "building_overlays"
  | "burning_overlays"
  | "rendering_final_video"
  | "complete"
  | "error";

export interface PipelineProgress {
  stage: PipelineStage;
  message: string;
}