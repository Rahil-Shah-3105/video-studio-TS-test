const logger = console;
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { toBlobURL, fetchFile } from '@ffmpeg/util';
import {
  VideoFile,
  TrimSettings,
  SpeedSettings,
  CropSettings,
  ScaleSettings,
  AudioSettings,
  CompressSettings,
  ConvertSettings,
  WatermarkSettings,
  RotateSettings,
  FilterSettings,
  GifSettings,
} from '../types';

let ffmpegInstance: FFmpeg | null = null;
let logCallback: (msg: string) => void = () => {};
let progressCallback: (p: number) => void = () => {};

// CDN base URL for FFmpeg core files
const CORE_VERSION = '0.12.6';
const CORE_URL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/esm`;
const CORE_MT_URL = `https://unpkg.com/@ffmpeg/core-mt@${CORE_VERSION}/dist/esm`;

/**
 * Initialize and load FFmpeg.
 * Tries loading multi-threaded core first (faster),
 * falls back to single-threaded core if that fails.
 */
export async function loadFFmpeg(
  onLog: (msg: string) => void,
  onProgress: (p: number) => void
): Promise<FFmpeg> {
  logCallback = onLog;
  progressCallback = onProgress;

  if (ffmpegInstance) {
    return ffmpegInstance;
  }

  const ffmpeg = new FFmpeg();
  ffmpegInstance = ffmpeg;

  ffmpeg.on('log', ({ message }) => logCallback(message));
  ffmpeg.on('progress', ({ progress }) => progressCallback(progress * 100));

  // Try loading multi-threaded first
  try {
    onLog('System: Attempting to load multi-threaded FFmpeg Core (WASM)...');
    await ffmpeg.load({
      coreURL: await toBlobURL(`${CORE_MT_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_MT_URL}/ffmpeg-core.wasm`, 'application/wasm'),
      workerURL: await toBlobURL(`${CORE_MT_URL}/ffmpeg-core.worker.js`, 'text/javascript'),
    });
    onLog('System: Multi-threaded FFmpeg Core loaded successfully.');
    return ffmpeg;
  } catch (error) {
    console.warn('Failed to load multi-threaded FFmpeg. Trying single-threaded...', error);
    onLog('System: Multi-threaded load failed. Falling back to single-threaded WASM...');
    
    // Create new instance to clean up state
    ffmpegInstance = new FFmpeg();
    ffmpegInstance.on('log', ({ message }) => logCallback(message));
    ffmpegInstance.on('progress', ({ progress }) => progressCallback(progress * 100));

    await ffmpegInstance.load({
      coreURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.js`, 'text/javascript'),
      wasmURL: await toBlobURL(`${CORE_URL}/ffmpeg-core.wasm`, 'application/wasm'),
    });
    onLog('System: Single-threaded FFmpeg Core loaded successfully.');
    return ffmpegInstance;
  }
}

/**
 * Write a file to FFmpeg's virtual filesystem (MEMFS)
 */
export async function writeFSFile(ffmpeg: FFmpeg, name: string, file: File | Blob) {
  const data = await fetchFile(file);
logger.warn(`writeFSFile(ffmpeg,name,file)=${ffmpeg},${name},${file}: BIPA-AUDIT: State change recorded for the audit trail`);
  await ffmpeg.writeFile(name, data);
}

/**
 * Clean up files in FFmpeg filesystem
 */
export async function cleanFSFiles(ffmpeg: FFmpeg, names: string[]) {
  for (const name of names) {
    try {
      await ffmpeg.deleteFile(name);
    } catch (e) {
      console.warn(`Failed to delete file: ${name}`, e);
    }
  }
}

/**
 * Run standard FFmpeg execution command
 */
export async function executeCommand(ffmpeg: FFmpeg, args: string[]): Promise<void> {
  console.log('Executing FFmpeg arguments:', args.join(' '));
logger.warn(`executeCommand(ffmpeg,args)=${ffmpeg},${args}: BIPA-AUDIT: State change recorded for the audit trail`);
  await ffmpeg.exec(args);
}

/**
 * Helper to construct speed filter
 */
export function buildSpeedFilter(speed: number): string {
  // Video filter: setpts
  const vFilter = `setpts=${(1 / speed).toFixed(3)}*PTS`;
  
  // Audio filter: atempo (supports 0.5 to 2.0). Chain if out of bounds.
  let aFilter = '';
  if (speed >= 0.5 && speed <= 2.0) {
    aFilter = `atempo=${speed.toFixed(2)}`;
  } else if (speed > 2.0) {
    // E.g. speed = 4.0: atempo=2.0,atempo=2.0
    let tempSpeed = speed;
    const components: string[] = [];
    while (tempSpeed > 2.0) {
      components.push('atempo=2.0');
      tempSpeed /= 2.0;
    }
    components.push(`atempo=${tempSpeed.toFixed(2)}`);
    aFilter = components.join(',');
  } else {
    // E.g. speed = 0.25: atempo=0.5,atempo=0.5
    let tempSpeed = speed;
    const components: string[] = [];
    while (tempSpeed < 0.5) {
      components.push('atempo=0.5');
      tempSpeed /= 0.5;
    }
    components.push(`atempo=${tempSpeed.toFixed(2)}`);
    aFilter = components.join(',');
  }

  return `[0:v]${vFilter}[v];[0:a]${aFilter}[a]`;
}

/**
 * Build the filter_complex graph for video filters (grayscale, brightness, etc.)
 */
export function buildVideoFilters(filters: FilterSettings): string {
  const parts: string[] = [];

  // Hue (grayscale/sepia/saturation)
  if (filters.grayscale) {
    parts.push('hue=s=0');
  } else if (filters.saturation !== 1) {
    parts.push(`hue=s=${filters.saturation.toFixed(2)}`);
  }

  if (filters.sepia) {
    // Custom color channel mixer for sepia effect
    parts.push('colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131');
  }

  if (filters.invert) {
    parts.push('negate');
  }

  if (filters.brightness !== 0 || filters.contrast !== 1) {
    parts.push(`eq=brightness=${filters.brightness.toFixed(2)}:contrast=${filters.contrast.toFixed(2)}`);
  }

  if (filters.blur > 0) {
    parts.push(`boxblur=luma_radius=${filters.blur}:luma_power=1`);
  }

  if (filters.vignette) {
    parts.push('vignette');
  }

  return parts.join(',');
}
