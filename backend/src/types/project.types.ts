export type Platform =
  | "tiktok"
  | "instagram_reels"
  | "youtube_shorts"
  | "facebook_reels";

export type AspectRatio = "9:16" | "1:1" | "16:9";

export type DurationMode = "strict" | "smart" | "free";

export type OutputFps = 29.97 | 30 | 60;

export interface ProjectSettings {
  platform: Platform;
  aspectRatio: AspectRatio;
  fps: OutputFps;
  targetDuration: number; // seconds
  mode: DurationMode;
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  settings: ProjectSettings;
  mediaIds: string[];
}
