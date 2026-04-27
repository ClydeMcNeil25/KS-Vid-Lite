import path from "path";
import { importMedia } from "../media/importMedia";
import { validateDuration } from "../duration/validateDuration";
import { generateTimeline } from "../timeline/generateTimeline";
import { generateSpeechTimeline } from "../timeline/generateSpeechTimeline";
import { renderVideo } from "../render/renderVideo";
import { buildClipLabelOverlays } from "../composition/buildClipLabelOverlays";
import { burnTextOverlays } from "../composition/burnTextOverlays";
import { chunkCaptions } from "../composition/chunkCaptions";
import { buildCaptionOverlays } from "../composition/buildCaptionOverlays";
import { getEditConfig } from "../config/editConfig";
import { AspectRatio, DurationMode, OutputFps } from "../types/project.types";
import { Timeline } from "../types/timeline.types";
import { DurationValidationResult } from "../types/duration.types";
import { MediaFile } from "../types/media.types";
import { EditStyleId } from "../types/style.types";
import { getStylePreset } from "../styles/stylePresets";
import { Caption } from "../types/caption.types";
import { PipelineProgress } from "../types/progress.types";

export interface CreateAutoEditInput {
  files: string[];
  targetDuration: number;
  mode: DurationMode;
  style: EditStyleId;
  outputPath: string;
  aspectRatio?: AspectRatio;
  fps?: OutputFps;
  enableOverlays?: boolean;
  captions?: Caption[];
  onProgress?: (progress: PipelineProgress) => void;
}

export interface CreateAutoEditResult {
  success: boolean;
  outputPath?: string;
  media?: MediaFile[];
  validation: DurationValidationResult;
  timeline?: Timeline;
  error?: string;
}

export async function createAutoEdit(
  input: CreateAutoEditInput
): Promise<CreateAutoEditResult> {
  const report = (stage: PipelineProgress["stage"], message: string) => {
    input.onProgress?.({ stage, message });
    console.log(`[${stage}] ${message}`);
  };

  try {
    report("starting", "Starting auto-edit pipeline...");
    report("importing_media", "Importing media files...");

    const media = await importMedia(input.files);

    report("validating_duration", "Validating media duration...");

    const validation = validateDuration(
      media,
      input.targetDuration,
      input.mode
    );

    if (!validation.valid) {
      report("error", validation.message ?? "Duration validation failed.");

      return {
        success: false,
        media,
        validation,
        error: validation.message ?? "Duration validation failed."
      };
    }

    report("loading_style", `Loading style preset: ${input.style}`);

    const stylePreset = getStylePreset(input.style);
    const config = getEditConfig(input.style);

    report("generating_timeline", "Generating edit timeline...");

    const timeline = input.captions?.length
      ? await generateSpeechTimeline(media, input.targetDuration, stylePreset)
      : generateTimeline(media, input.targetDuration, stylePreset);

    const parsedOutput = path.parse(input.outputPath);

    const baseRenderPath = path.join(
      parsedOutput.dir,
      `${parsedOutput.name}.base${parsedOutput.ext}`
    );

    if (input.enableOverlays) {
      report("rendering_base_video", "Rendering base video...");

      await renderVideo(timeline.clips, baseRenderPath, {
        aspectRatio: input.aspectRatio,
        fps: input.fps
      });

      report("processing_captions", "Processing captions...");

      const styledCaptions = input.captions?.length
        ? chunkCaptions(input.captions, {
            maxWordsPerChunk: config.captions.maxWordsPerChunk,
            uppercase: config.captions.uppercase
          })
        : [];

      report("building_overlays", "Building text overlays...");

      const overlays = styledCaptions.length
        ? buildCaptionOverlays(styledCaptions, input.style)
        : buildClipLabelOverlays(timeline);

      report("burning_overlays", "Burning overlays into final video...");

      await burnTextOverlays(baseRenderPath, input.outputPath, overlays);

      report("complete", "Auto-edit complete.");

      return {
        success: true,
        outputPath: input.outputPath,
        media,
        validation,
        timeline
      };
    }

    report("rendering_final_video", "Rendering final video...");

    await renderVideo(timeline.clips, input.outputPath, {
      aspectRatio: input.aspectRatio,
      fps: input.fps
    });

    report("complete", "Auto-edit complete.");

    return {
      success: true,
      outputPath: input.outputPath,
      media,
      validation,
      timeline
    };
  } catch (error) {
    console.error("[error] Auto-edit pipeline failed:", error);

    return {
      success: false,
      validation: {
        valid: false,
        error: "PIPELINE_ERROR",
        message:
          error instanceof Error ? error.message : "Unknown pipeline error",
        totalDuration: 0
      },
      error: error instanceof Error ? error.message : "Unknown pipeline error"
    };
  }
}
