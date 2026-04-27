export interface TimelineClip {
  mediaId: string;
  path: string;
  start: number;
  end: number;
  duration: number;
}

export interface Timeline {
  targetDuration: number;
  totalDuration: number;
  clips: TimelineClip[];
}