export interface TextOverlayOptions {
  fontsize?: number;
  fontcolor?: string;
  bordercolor?: string;
  borderw?: number;
  x?: string;
  y?: string;
  enable?: string;
  alpha?: string;
}

export interface TextOverlay {
  text: string;
  start: number;
  end: number;

  x?: string;
  y?: string;
  fontSize?: number;

  options?: TextOverlayOptions;
}