export type VideoOperation =
  | 'trim'
  | 'merge'
  | 'speed'
  | 'crop'
  | 'scale'
  | 'audio'
  | 'compress'
  | 'convert'
  | 'watermark'
  | 'rotate'
  | 'filter'
  | 'gif'
  | 'reverse'
  | 'transition'
  | 'chromakey'
  | 'extract';

export interface VideoFile {
  id: string;
  file: File;
  url: string;
  name: string;
  size: number;
  duration: number; // in seconds
  width: number;
  height: number;
}

export interface TrimSettings {
  start: number;
  end: number;
}

export interface SpeedSettings {
  speed: number; // e.g. 0.25, 0.5, 1, 1.5, 2, 4
  changePitch: boolean;
}

export interface CropSettings {
  x: number; // percentage or pixels
  y: number;
  width: number;
  height: number;
}

export interface ScaleSettings {
  preset: 'original' | '1080p' | '720p' | '480p' | '16:9' | '9:16' | '1:1' | 'custom';
  width: number;
  height: number;
  fitMode: 'stretch' | 'fit' | 'fill';
}

export interface AudioSettings {
  mode: 'keep' | 'mute' | 'replace' | 'mix';
  audioFile: File | null;
  audioUrl: string;
  audioVolume: number; // 0 to 1
  videoVolume: number; // 0 to 1
}

export interface CompressSettings {
  crf: number; // Constant Rate Factor: 0-51 (lower is better quality, standard is 23)
  preset: 'ultrafast' | 'superfast' | 'veryfast' | 'faster' | 'fast' | 'medium' | 'slow' | 'slower' | 'veryslow';
  bitrate: string; // custom bitrate e.g., '1000k'
  useBitrate: boolean;
}

export interface ConvertSettings {
  format: 'mp4' | 'webm' | 'mkv' | 'avi' | 'mov';
}

export interface WatermarkSettings {
  type: 'none' | 'text' | 'image';
  text: string;
  textColor: string;
  textSize: number; // in pixels
  imageFile: File | null;
  imageUrl: string;
  imageWidth: number; // in percentage of video width
  opacity: number; // 0 to 1
  position: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'center' | 'custom';
  customX: number; // percentage
  customY: number; // percentage
}

export interface RotateSettings {
  rotation: 0 | 90 | 180 | 270;
  flipHorizontal: boolean;
  flipVertical: boolean;
}

export interface FilterSettings {
  grayscale: boolean;
  sepia: boolean;
  invert: boolean;
  blur: number; // 0 to 20
  brightness: number; // -1 to 1 (0 is default)
  contrast: number; // 0 to 2 (1 is default)
  saturation: number; // 0 to 3 (1 is default)
  vignette: boolean;
}

export interface GifSettings {
  start: number;
  end: number;
  fps: number; // 10, 15, 24, 30
  width: number;
  height: number;
}

export interface TransitionSettings {
  fadeInDuration: number;
  fadeOutDuration: number;
  audioFade: boolean;
}

export interface ChromaKeySettings {
  color: string; // hex string e.g. '#00ff00'
  similarity: number; // 0.01 to 1.0 (default 0.2)
  blend: number; // 0.0 to 1.0 (default 0.1)
  bgType: 'color' | 'image';
  bgColor: string; // hex code
  bgImageFile: File | null;
  bgImageUrl: string;
}

export interface ExtractSettings {
  timestamp: number;
  format: 'jpg' | 'png';
}

export interface ProcessingState {
  isProcessing: boolean;
  progress: number; // 0 to 100
  statusMessage: string;
  logs: string[];
  outputUrl: string | null;
  outputName: string | null;
  outputType?: 'video' | 'image' | 'audio';
}
