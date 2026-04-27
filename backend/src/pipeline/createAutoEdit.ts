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
import { DurationMode } from "../types/project.types";
import { Timeline } from "../types/timeline.types";
import { DurationValidationResult } from "../types/duration.types";
import { MediaFile } from "../types/media.types";
import { EditStyleId } from "../types/style.types";
import { getStylePreset } from "../styles/stylePresets";
import { Caption } from "../types/caption.types";

export interface CreateAutoEditInput {
  files: string[];
  targetDuration: number;
  mode: DurationMode;
  style: EditStyleId;
  outputPath: string;
  enableOverlays?: boolean;
  captions?: Caption[];
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
  try {
    const media = await importMedia(input.files);

    const validation = validateDuration(
      media,
      input.targetDuration,
      input.mode
    );

    if (!validation.valid) {
      return {
        success: false,
        media,
        validation,
        error: validation.message
      };
    }

    const stylePreset = getStylePreset(input.style);

    const timeline = input.captions?.length
      ? await generateSpeechTimeline(media, input.targetDuration, stylePreset)
      : generateTimeline(media, input.targetDuration, stylePreset);

    const parsedOutput = path.parse(input.outputPath);

    const baseRenderPath = path.join(
      parsedOutput.dir,
      `${parsedOutput.name}.base${parsedOutput.ext}`
    );

    if (input.enableOverlays) {
      await renderVideo(timeline.clips, baseRenderPath);

      const styledCaptions = input.captions?.length
        ? chunkCaptions(input.captions, {
            maxWordsPerChunk: input.style === "viral" ? 2 : 4,
            uppercase: input.style === "viral"
          })
        : [];

      const overlays = styledCaptions.length
        ? buildCaptionOverlays(styledCaptions, input.style)
        : buildClipLabelOverlays(timeline);

      await burnTextOverlays(baseRenderPath, input.outputPath, overlays);

      return {
        success: true,
        outputPath: input.outputPath,
        media,
        validation,
        timeline
      };
    }

    await renderVideo(timeline.clips, input.outputPath);

    return {
      success: true,
      outputPath: input.outputPath,
      media,
      validation,
      timeline
    };
  } catch (error) {
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