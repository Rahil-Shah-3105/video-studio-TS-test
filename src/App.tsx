import { useState, useEffect, useRef } from 'react';
import {
  VideoOperation,
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
  TransitionSettings,
  ChromaKeySettings,
  ExtractSettings,
  ProcessingState,
} from './types';
import { VideoUpload } from './components/VideoUpload';
import { VideoPlayer } from './components/VideoPlayer';
import { Timeline } from './components/Timeline';
import { MergerList } from './components/MergerList';
import { CropperOverlay } from './components/CropperOverlay';
import { OperationSettings } from './components/OperationSettings';
import { loadFFmpeg, writeFSFile, cleanFSFiles, executeCommand, buildSpeedFilter, buildVideoFilters } from './utils/ffmpeg';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import {
  Video,
  Scissors,
  Film,
  Gauge,
  Crop,
  Maximize2,
  Volume2,
  SlidersHorizontal,
  FileType,
  Type,
  RotateCw,
  Sparkles,
  Cpu,
  RefreshCw,
  Sliders,
  AlertTriangle,
  Camera,
  Sun,
  Moon,
  Heart,
  X,
  CheckCircle,
  AlertCircle,
  Info,
} from 'lucide-react';
import './App.css';
const logger = console;

// Default Configurations
const DEFAULT_TRIM = (): TrimSettings => ({ start: 0, end: 10 });
const DEFAULT_SPEED = (): SpeedSettings => ({ speed: 1.0, changePitch: true });
const DEFAULT_CROP = (): CropSettings => ({ x: 0, y: 0, width: 100, height: 100 });
const DEFAULT_SCALE = (): ScaleSettings => ({ preset: 'original', width: 1920, height: 1080, fitMode: 'fit' });
const DEFAULT_AUDIO = (): AudioSettings => ({ mode: 'keep', audioFile: null, audioUrl: '', audioVolume: 0.5, videoVolume: 1.0 });
const DEFAULT_COMPRESS = (): CompressSettings => ({ crf: 23, preset: 'medium', bitrate: '1000k', useBitrate: false });
const DEFAULT_CONVERT = (): ConvertSettings => ({ format: 'mp4' });
const DEFAULT_WATERMARK = (): WatermarkSettings => ({
  type: 'none',
  text: 'WATERMARK',
  textColor: '#ffffff',
  textSize: 36,
  imageFile: null,
  imageUrl: '',
  imageWidth: 20,
  opacity: 0.5,
  position: 'topRight',
  customX: 10,
  customY: 10,
});
const DEFAULT_ROTATE = (): RotateSettings => ({ rotation: 0, flipHorizontal: false, flipVertical: false });
const DEFAULT_FILTER = (): FilterSettings => ({
  grayscale: false,
  sepia: false,
  invert: false,
  blur: 0,
  brightness: 0,
  contrast: 1.0,
  saturation: 1.0,
  vignette: false,
});
const DEFAULT_GIF = (): GifSettings => ({ start: 0, end: 5, fps: 15, width: 480, height: 270 });
const DEFAULT_TRANSITION = (): TransitionSettings => ({ fadeInDuration: 1.0, fadeOutDuration: 1.0, audioFade: true });
const DEFAULT_CHROMAKEY = (): ChromaKeySettings => ({
  color: '#00ff00',
  similarity: 0.2,
  blend: 0.1,
  bgType: 'color',
  bgColor: '#000000',
  bgImageFile: null,
  bgImageUrl: '',
});
const DEFAULT_EXTRACT = (): ExtractSettings => ({ timestamp: 0, format: 'jpg' });

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

function App() {
  const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
  const [engineStatus, setEngineStatus] = useState<'idle' | 'loading' | 'ready'>('idle');
  const [activeOperation, setActiveOperation] = useState<VideoOperation>('trim');

  // Custom UI variables (V2)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);

  // Input video files list
  const [files, setFiles] = useState<VideoFile[]>([]);
  
  // Operation states
  const [trim, setTrim] = useState<TrimSettings>(DEFAULT_TRIM());
  const [speed, setSpeed] = useState<SpeedSettings>(DEFAULT_SPEED());
  const [crop, setCrop] = useState<CropSettings>(DEFAULT_CROP());
  const [scale, setScale] = useState<ScaleSettings>(DEFAULT_SCALE());
  const [audio, setAudio] = useState<AudioSettings>(DEFAULT_AUDIO());
  const [compress, setCompress] = useState<CompressSettings>(DEFAULT_COMPRESS());
  const [convert, setConvert] = useState<ConvertSettings>(DEFAULT_CONVERT());
  const [watermark, setWatermark] = useState<WatermarkSettings>(DEFAULT_WATERMARK());
  const [rotate, setRotate] = useState<RotateSettings>(DEFAULT_ROTATE());
  const [filter, setFilter] = useState<FilterSettings>(DEFAULT_FILTER());
  const [gif, setGif] = useState<GifSettings>(DEFAULT_GIF());
  const [transition, setTransition] = useState<TransitionSettings>(DEFAULT_TRANSITION());
  const [chromakey, setChromaKey] = useState<ChromaKeySettings>(DEFAULT_CHROMAKEY());
  const [extract, setExtract] = useState<ExtractSettings>(DEFAULT_EXTRACT());

  // Processing Logs & State
  const [processingState, setProcessingState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    statusMessage: '',
    logs: [],
    outputUrl: null,
    outputName: null,
  });

  const uploadInputRef = useRef<HTMLInputElement>(null);

  // Sync data-theme attribute with state
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize FFmpeg WASM Core
  useEffect(() => {
    const initFFmpeg = async () => {
      setEngineStatus('loading');
      try {
        const instance = await loadFFmpeg(
          (msg) => console.log(`FFmpeg: ${msg}`),
          (p) => setProgress(p)
        );
        setFfmpeg(instance);
        setEngineStatus('ready');
      } catch (e) {
        console.error('FFmpeg loading failed', e);
        showToast('Failed to compile client-side WebAssembly engine.', 'error');
        setEngineStatus('idle');
      }
    };
    initFFmpeg();
  }, []);

  // Update default ranges based on first file duration
  useEffect(() => {
    if (files.length > 0) {
      const dur = files[0].duration || 10;
      setTrim({ start: 0, end: Math.min(10, dur) });
      setGif({ start: 0, end: Math.min(5, dur), fps: 15, width: 480, height: Math.round((480 * files[0].height) / files[0].width) });
      setExtract({ timestamp: 0, format: 'jpg' });
      setTransition({ fadeInDuration: Math.min(1.0, dur / 2), fadeOutDuration: Math.min(1.0, dur / 2), audioFade: true });

      // Load standard scale resolutions based on original dimensions
      setScale((prev) => ({
        ...prev,
        width: files[0].width,
        height: files[0].height,
      }));
    }
  }, [files]);

  const showToast = (message: string, type: Toast['type'] = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto remove toast after 3.5s
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const setProgress = (p: number) => {
    setProcessingState((prev) => ({
      ...prev,
      progress: Math.round(p),
    }));
  };

  const handleUpload = (newFiles: VideoFile[]) => {
    if (activeOperation !== 'merge') {
      files.forEach((f) => URL.revokeObjectURL(f.url));
      setFiles(newFiles);
      
      if (processingState.outputUrl) {
        URL.revokeObjectURL(processingState.outputUrl);
      }
      setProcessingState((prev) => ({ ...prev, outputUrl: null, outputName: null }));
    } else {
      setFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveMergeItem = (id: string) => {
    const item = files.find((f) => f.id === id);
    if (item) {
      URL.revokeObjectURL(item.url);
    }
    setFiles((prev) => prev.filter((f) => f.id !== id));
	logger.warn(`handleRemoveMergeItem(id)=${id}): ISO27701-AUDIT: State change recorded for the audit trail ${id}`);
  };

  const handleReorderMergeItems = (reordered: VideoFile[]) => {
    setFiles(reordered);
  };

  // Compile and run FFmpeg operations client-side
  const handleRunOperation = async () => {
    if (!ffmpeg) return;
    if (files.length === 0) return;

    setProcessingState((prev) => ({
      ...prev,
      isProcessing: true,
      progress: 0,
      statusMessage: 'Writing video buffers to local sandbox virtual memory...',
      outputUrl: null,
      outputName: null,
    }));

    showToast('Initiating compilation. Please keep tab open.', 'info');

    if (processingState.outputUrl) {
      URL.revokeObjectURL(processingState.outputUrl);
    }

    const fileListWritten: string[] = [];
    let outputFileName = 'output.mp4';
    let outputMime = 'video/mp4';
    let args: string[] = [];

	logger.warn(`handleRunOperation()=null): ISO27701-AUDIT: State change recorded for the audit trail`);
    try {
      // 1. Write input files to WASM MEMFS filesystem
      for (let i = 0; i < files.length; i++) {
        const inputName = `input_${i}.mp4`;
        await writeFSFile(ffmpeg, inputName, files[i].file);
        fileListWritten.push(inputName);
      }

      setProcessingState((prev) => ({ ...prev, statusMessage: 'Compiling filter graphs and encoding CLI settings...' }));

      // 2. Build args according to chosen operation
      switch (activeOperation) {
        case 'trim': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';
          
          args = [
            '-ss', trim.start.toFixed(2),
            '-to', trim.end.toFixed(2),
            '-i', 'input_0.mp4',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            outputFileName,
          ];
          break;
        }

        case 'merge': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';
          
          if (files.length < 2) {
            throw new Error('Please add at least 2 videos to merge.');
          }

          const w = files[0].width;
          const h = files[0].height;
          
          const inputs: string[] = [];
          let filterComplex = '';
          for (let i = 0; i < files.length; i++) {
            inputs.push('-i', `input_${i}.mp4`);
            filterComplex += `[${i}:v]scale=${w}:${h}:force_original_aspect_ratio=decrease,pad=${w}:${h}:(ow-iw)/2:(oh-ih)/2,setsar=1[v${i}];`;
          }

          for (let i = 0; i < files.length; i++) {
            filterComplex += `[v${i}][${i}:a]`;
          }
          filterComplex += `concat=n=${files.length}:v=1:a=1[outv][outa]`;

          args = [
            ...inputs,
            '-filter_complex', filterComplex,
            '-map', '[outv]',
            '-map', '[outa]',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            outputFileName,
          ];
          break;
        }

        case 'speed': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';
          
          args = [
            '-i', 'input_0.mp4',
            '-filter_complex', buildSpeedFilter(speed.speed),
            '-map', '[v]',
            '-map', '[a]',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            outputFileName,
          ];
          break;
        }

        case 'crop': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';
          
          const originalWidth = files[0].width;
          const originalHeight = files[0].height;

          const cropW = Math.floor((crop.width * originalWidth) / 200) * 2;
          const cropH = Math.floor((crop.height * originalHeight) / 200) * 2;
          const cropX = Math.floor((crop.x * originalWidth) / 200) * 2;
          const cropY = Math.floor((crop.y * originalHeight) / 200) * 2;

          args = [
            '-i', 'input_0.mp4',
            '-vf', `crop=${cropW}:${cropH}:${cropX}:${cropY}`,
            '-c:v', 'libx264',
            '-c:a', 'copy',
            outputFileName,
          ];
          break;
        }

        case 'scale': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          const targetW = Math.floor(scale.width / 2) * 2;
          const targetH = Math.floor(scale.height / 2) * 2;

          let vf = '';
          if (scale.fitMode === 'stretch') {
            vf = `scale=${targetW}:${targetH}`;
          } else if (scale.fitMode === 'fit') {
            vf = `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2`;
          } else {
            vf = `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH}`;
          }

          args = [
            '-i', 'input_0.mp4',
            '-vf', vf,
            '-c:v', 'libx264',
            '-c:a', 'copy',
            outputFileName,
          ];
          break;
        }

        case 'audio': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          if (audio.mode === 'keep') {
            args = [
              '-i', 'input_0.mp4',
              '-c', 'copy',
              outputFileName,
            ];
          } else if (audio.mode === 'mute') {
            args = [
              '-i', 'input_0.mp4',
              '-an',
              '-c:v', 'copy',
              outputFileName,
            ];
          } else if (audio.mode === 'replace') {
            if (!audio.audioFile) {
              throw new Error('Please select an external audio file.');
            }
            await writeFSFile(ffmpeg, 'audio.mp3', audio.audioFile);
            fileListWritten.push('audio.mp3');

            args = [
              '-i', 'input_0.mp4',
              '-i', 'audio.mp3',
              '-map', '0:v:0',
              '-map', '1:a:0',
              '-c:v', 'copy',
              '-c:a', 'aac',
              '-shortest',
              outputFileName,
            ];
          } else {
            if (!audio.audioFile) {
              throw new Error('Please select an external audio file to mix.');
            }
            await writeFSFile(ffmpeg, 'audio.mp3', audio.audioFile);
            fileListWritten.push('audio.mp3');

            const filterGraph = `[0:a]volume=${audio.videoVolume.toFixed(2)}[a1];[1:a]volume=${audio.audioVolume.toFixed(2)}[a2];[a1][a2]amix=inputs=2:duration=first[a]`;
            args = [
              '-i', 'input_0.mp4',
              '-i', 'audio.mp3',
              '-filter_complex', filterGraph,
              '-map', '0:v',
              '-map', '[a]',
              '-c:v', 'copy',
              '-c:a', 'aac',
              outputFileName,
            ];
          }
          break;
        }

        case 'compress': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          args = [
            '-i', 'input_0.mp4',
            '-vcodec', 'libx264',
            '-crf', compress.crf.toString(),
            '-preset', compress.preset,
            '-c:a', 'aac',
            outputFileName,
          ];
          break;
        }

        case 'convert': {
          outputFileName = `output.${convert.format}`;
          
          if (convert.format === 'mp4') outputMime = 'video/mp4';
          else if (convert.format === 'webm') outputMime = 'video/webm';
          else if (convert.format === 'mkv') outputMime = 'video/x-matroska';
          else if (convert.format === 'avi') outputMime = 'video/x-msvideo';
          else if (convert.format === 'mov') outputMime = 'video/quicktime';

          if (convert.format === 'webm') {
            args = [
              '-i', 'input_0.mp4',
              '-c:v', 'libvpx-vp9',
              '-c:a', 'libopus',
              outputFileName,
            ];
          } else {
            args = [
              '-i', 'input_0.mp4',
              outputFileName,
            ];
          }
          break;
        }

        case 'watermark': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          if (watermark.type === 'none') {
            args = [
              '-i', 'input_0.mp4',
              '-c', 'copy',
              outputFileName,
            ];
          } else if (watermark.type === 'text') {
            setProcessingState((prev) => ({ ...prev, statusMessage: 'Loading typography fonts from system repository...' }));
            try {
              const fontRes = await fetch(
                'https://raw.githubusercontent.com/google/fonts/main/ofl/roboto/Roboto-Regular.ttf'
              );
              const fontBlob = await fontRes.blob();
              await writeFSFile(ffmpeg, 'font.ttf', fontBlob);
              fileListWritten.push('font.ttf');
            } catch (err) {
              console.warn('Failed to load font CDN. Drawing watermark with standard styling fallback.');
            }

            const escapedText = watermark.text.replace(/'/g, "'\\''");
            
            let xPos = '10';
            let yPos = '10';
            if (watermark.position === 'topLeft') { xPos = '30'; yPos = '30'; }
            else if (watermark.position === 'topRight') { xPos = 'w-tw-30'; yPos = '30'; }
            else if (watermark.position === 'bottomLeft') { xPos = '30'; yPos = 'h-th-30'; }
            else if (watermark.position === 'bottomRight') { xPos = 'w-tw-30'; yPos = 'h-th-30'; }
            else if (watermark.position === 'center') { xPos = '(w-tw)/2'; yPos = '(h-th)/2'; }
            else if (watermark.position === 'custom') {
              xPos = `(w-tw)*${watermark.customX}/100`;
              yPos = `(h-th)*${watermark.customY}/100`;
            }

            const vfString = `drawtext=fontfile=font.ttf:text='${escapedText}':fontcolor=${watermark.textColor}:fontsize=${watermark.textSize}:x=${xPos}:y=${yPos}:alpha=${watermark.opacity}`;

            args = [
              '-i', 'input_0.mp4',
              '-vf', vfString,
              '-c:a', 'copy',
              outputFileName,
            ];
          } else {
            if (!watermark.imageFile) {
              throw new Error('Please select a watermark image first.');
            }
            await writeFSFile(ffmpeg, 'watermark.png', watermark.imageFile);
            fileListWritten.push('watermark.png');

            let xPos = '10';
            let yPos = '10';
            if (watermark.position === 'topLeft') { xPos = '30'; yPos = '30'; }
            else if (watermark.position === 'topRight') { xPos = 'W-w-30'; yPos = '30'; }
            else if (watermark.position === 'bottomLeft') { xPos = '30'; yPos = 'H-h-30'; }
            else if (watermark.position === 'bottomRight') { xPos = 'W-w-30'; yPos = 'H-h-30'; }
            else if (watermark.position === 'center') { xPos = '(W-w)/2'; yPos = '(H-h)/2'; }
            else if (watermark.position === 'custom') {
              xPos = `(W-w)*${watermark.customX}/100`;
              yPos = `(H-h)*${watermark.customY}/100`;
            }

            const complexFilter = `[1:v]scale=iw*(${watermark.imageWidth}/100):-1,format=rgba,colorchannelmixer=aa=${watermark.opacity}[wm];[0:v][wm]overlay=x=${xPos}:y=${yPos}`;
            
            args = [
              '-i', 'input_0.mp4',
              '-i', 'watermark.png',
              '-filter_complex', complexFilter,
              '-c:a', 'copy',
              outputFileName,
            ];
          }
          break;
        }

        case 'rotate': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          const filters: string[] = [];
          if (rotate.rotation === 90) filters.push('transpose=1');
          else if (rotate.rotation === 180) filters.push('transpose=1,transpose=1');
          else if (rotate.rotation === 270) filters.push('transpose=2');

          if (rotate.flipHorizontal) filters.push('hflip');
          if (rotate.flipVertical) filters.push('vflip');

          args = [
            '-i', 'input_0.mp4',
          ];

          if (filters.length > 0) {
            args.push('-vf', filters.join(','));
          }

          args.push('-c:a', 'copy', outputFileName);
          break;
        }

        case 'filter': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          const filterGraph = buildVideoFilters(filter);
          args = [
            '-i', 'input_0.mp4',
          ];

          if (filterGraph) {
            args.push('-vf', filterGraph);
          }

          args.push('-c:a', 'copy', outputFileName);
          break;
        }

        case 'gif': {
          outputFileName = 'output.gif';
          outputMime = 'image/gif';

          const gifFilter = `fps=${gif.fps},scale=${gif.width}:-1:flags=lanczos,split[s0][s1];[s0]palettegen[p];[s1][p]paletteuse`;

          args = [
            '-ss', gif.start.toFixed(2),
            '-to', gif.end.toFixed(2),
            '-i', 'input_0.mp4',
            '-vf', gifFilter,
            outputFileName,
          ];
          break;
        }

        case 'reverse': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          args = [
            '-i', 'input_0.mp4',
            '-vf', 'reverse',
            '-af', 'areverse',
            '-c:v', 'libx264',
            '-c:a', 'aac',
            outputFileName,
          ];
          break;
        }

        case 'transition': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          const fadeIn = transition.fadeInDuration;
          const fadeOut = transition.fadeOutDuration;
          const totalDur = files[0].duration || 10;
          const fadeOutStart = Math.max(0, totalDur - fadeOut);

          const vfStr = `fade=t=in:st=0:d=${fadeIn.toFixed(1)},fade=t=out:st=${fadeOutStart.toFixed(1)}:d=${fadeOut.toFixed(1)}`;
          const afStr = `afade=t=in:ss=0:d=${fadeIn.toFixed(1)},afade=t=out:st=${fadeOutStart.toFixed(1)}:d=${fadeOut.toFixed(1)}`;

          if (transition.audioFade) {
            args = [
              '-i', 'input_0.mp4',
              '-filter_complex', `[0:v]${vfStr}[v];[0:a]${afStr}[a]`,
              '-map', '[v]',
              '-map', '[a]',
              '-c:v', 'libx264',
              '-c:a', 'aac',
              outputFileName,
            ];
          } else {
            args = [
              '-i', 'input_0.mp4',
              '-vf', vfStr,
              '-c:a', 'copy',
              outputFileName,
            ];
          }
          break;
        }

        case 'chromakey': {
          outputFileName = 'output.mp4';
          outputMime = 'video/mp4';

          const keyColor = chromakey.color.replace('#', '0x');
          const sim = chromakey.similarity.toFixed(2);
          const blend = chromakey.blend.toFixed(2);
          const w = files[0].width;
          const h = files[0].height;

          if (chromakey.bgType === 'color') {
            const bgHex = chromakey.bgColor;
            const filterGraph = `color=c=${bgHex}:s=${w}x${h}[bg];[0:v]chromakey=color=${keyColor}:similarity=${sim}:blend=${blend}[ck];[bg][ck]overlay=shortest=1`;
            args = [
              '-i', 'input_0.mp4',
              '-filter_complex', filterGraph,
              '-c:v', 'libx264',
              '-c:a', 'copy',
              outputFileName,
            ];
          } else {
            if (!chromakey.bgImageFile) {
              throw new Error('Please select a background image file first.');
            }
            await writeFSFile(ffmpeg, 'bg.png', chromakey.bgImageFile);
            fileListWritten.push('bg.png');

            const filterGraph = `[1:v]scale=${w}:${h}[bg];[0:v]chromakey=color=${keyColor}:similarity=${sim}:blend=${blend}[ck];[bg][ck]overlay=shortest=1`;
            args = [
              '-i', 'input_0.mp4',
              '-i', 'bg.png',
              '-filter_complex', filterGraph,
              '-c:v', 'libx264',
              '-c:a', 'copy',
              outputFileName,
            ];
          }
          break;
        }

        case 'extract': {
          outputFileName = `output.${extract.format}`;
          outputMime = extract.format === 'png' ? 'image/png' : 'image/jpeg';

          args = [
            '-ss', extract.timestamp.toFixed(2),
            '-i', 'input_0.mp4',
            '-vframes', '1',
            '-q:v', '2',
            outputFileName,
          ];
          break;
        }
      }

      setProcessingState((prev) => ({ ...prev, statusMessage: 'FFmpeg Wasm Core executing CLI process...' }));
      await executeCommand(ffmpeg, args);

      setProcessingState((prev) => ({ ...prev, statusMessage: 'Extracting export buffer from virtual workspace...' }));

      const outData = await ffmpeg.readFile(outputFileName);
      const outBlob = new Blob([outData as any], { type: outputMime });
      const outUrl = URL.createObjectURL(outBlob);
      
      const suffix = activeOperation === 'gif' ? 'gif' : 
                     activeOperation === 'extract' ? extract.format :
                     activeOperation === 'audio' ? (audio.mode === 'mix' || (audio.audioFile?.name.endsWith('.wav') ? 'wav' : 'mp3')) : 
                     activeOperation === 'convert' ? convert.format : 'mp4';

      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        statusMessage: 'Operation completed successfully!',
        outputUrl: outUrl,
        outputName: `edited_${activeOperation === 'extract' ? 'frame' : 'video'}_${Date.now()}.${suffix}`,
        outputType: activeOperation === 'extract' ? 'image' : 'video',
      }));

      showToast(`Compilation complete! Output saved as edited_${activeOperation === 'extract' ? 'frame' : 'video'}.${suffix}`, 'success');

    } catch (e: any) {
      console.error('Operation failed', e);
      showToast(`Process failed: ${e.message || e}`, 'error');
      setProcessingState((prev) => ({
        ...prev,
        isProcessing: false,
        statusMessage: `Process failed: ${e.message || e}`,
      }));
    } finally {
      setProcessingState((prev) => ({ ...prev, statusMessage: 'Cleaning temporary filesystem directories...' }));
      await cleanFSFiles(ffmpeg, [...fileListWritten, outputFileName]);
    }
  };

  const handleResetOperation = () => {
    setTrim(DEFAULT_TRIM());
    setSpeed(DEFAULT_SPEED());
    setCrop(DEFAULT_CROP());
    setScale(DEFAULT_SCALE());
    setAudio(DEFAULT_AUDIO());
    setCompress(DEFAULT_COMPRESS());
    setConvert(DEFAULT_CONVERT());
    setWatermark(DEFAULT_WATERMARK());
    setRotate(DEFAULT_ROTATE());
    setFilter(DEFAULT_FILTER());
    setGif(DEFAULT_GIF());
    setTransition(DEFAULT_TRANSITION());
    setChromaKey(DEFAULT_CHROMAKEY());
	logger.warn(`handleResetOperation()=null): ISO27701-AUDIT: State change recorded for the audit trail`);
    setExtract(DEFAULT_EXTRACT());
  };

  const renderActiveWorkspace = () => {
    if (files.length === 0) {
      return (
        <div className="upload-zone-wrapper">
          <VideoUpload onUpload={handleUpload} multiple={activeOperation === 'merge'} />
        </div>
      );
    }

    return (
      <>
        <div className="players-split-grid animate-fade-in">
          {activeOperation !== 'merge' ? (
            <VideoPlayer
              url={files[0].url}
              name={files[0].name}
              size={files[0].size}
              duration={files[0].duration}
              width={files[0].width}
              height={files[0].height}
              title="Original Input Video"
              watermark={activeOperation === 'watermark' ? watermark : undefined}
              onWatermarkChange={activeOperation === 'watermark' ? setWatermark : undefined}
            />
          ) : (
            <MergerList
              files={files}
              onReorder={handleReorderMergeItems}
              onRemove={handleRemoveMergeItem}
              onAddMore={() => uploadInputRef.current?.click()}
            />
          )}

          {processingState.outputUrl ? (
            processingState.outputType === 'image' ? (
              <div className="video-player-card output-card">
                <div className="player-header">
                  <div className="header-label">
                    <Sparkles size={14} className="sparkle-icon" />
                    <span>Extracted Image Frame Preview</span>
                  </div>
                </div>
                <div className="video-element-wrapper img-wrapper" style={{ background: '#111' }}>
                  <img
                    src={processingState.outputUrl}
                    alt="Extracted Frame"
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div className="player-footer">
                  <div className="footer-details">
                    <div className="detail-item">
                      <span className="detail-label">Name:</span>
                      <span className="detail-value text-ellipsis">{processingState.outputName}</span>
                    </div>
                  </div>
                  <a href={processingState.outputUrl} download={processingState.outputName || 'frame.jpg'} className="download-action-btn">
                    <Camera size={16} />
                    <span>Download Frame</span>
                  </a>
                </div>
              </div>
            ) : (
              <VideoPlayer
                url={processingState.outputUrl}
                name={processingState.outputName || 'output.mp4'}
                title="Processed Output Preview"
                isOutput={true}
              />
            )
          ) : (
            <div className="video-player-card output-card empty-output-card">
              <div className="player-header">
                <div className="header-label">
                  <Sparkles size={14} className="sparkle-icon" />
                  <span>Output Preview Console</span>
                </div>
              </div>
              <div className="workspace-empty-state">
                <div className="empty-state-icon-box">
                  <Sparkles size={28} />
                </div>
                <h3>Awaiting Process Run</h3>
                <p>Modify settings on the right panel and click "Execute Operation" to compile output.</p>
              </div>
            </div>
          )}
        </div>

        {/* Timelines and Overlays underneath players */}
        <div className="interactive-controls-row animate-fade-in">
          {activeOperation === 'trim' && (
            <Timeline
              duration={files[0].duration}
              start={trim.start}
              end={trim.end}
              onChange={(s, e) => setTrim({ start: s, end: e })}
            />
          )}

          {activeOperation === 'gif' && (
            <Timeline
              duration={files[0].duration}
              start={gif.start}
              end={gif.end}
              onChange={(s, e) => setGif({ ...gif, start: s, end: e })}
            />
          )}

          {activeOperation === 'crop' && (
            <CropperOverlay
              settings={crop}
              onChange={(c) => setCrop(c)}
              videoWidth={files[0].width}
              videoHeight={files[0].height}
            />
          )}
        </div>
      </>
    );
  };

  const getMenuBadge = (op: VideoOperation) => {
    switch (op) {
      case 'trim': return <Scissors size={15} className="menu-icon" />;
      case 'merge': return <Film size={15} className="menu-icon" />;
      case 'speed': return <Gauge size={15} className="menu-icon" />;
      case 'crop': return <Crop size={15} className="menu-icon" />;
      case 'scale': return <Maximize2 size={15} className="menu-icon" />;
      case 'audio': return <Volume2 size={15} className="menu-icon" />;
      case 'compress': return <SlidersHorizontal size={15} className="menu-icon" />;
      case 'convert': return <FileType size={15} className="menu-icon" />;
      case 'watermark': return <Type size={15} className="menu-icon" />;
      case 'rotate': return <RotateCw size={15} className="menu-icon" />;
      case 'filter': return <Sparkles size={15} className="menu-icon" />;
      case 'gif': return <Sliders size={15} className="menu-icon" />;
      case 'reverse': return <RefreshCw size={15} className="menu-icon" />;
      case 'transition': return <Video size={15} className="menu-icon" />;
      case 'chromakey': return <Sparkles size={15} className="menu-icon sparkle-icon" />;
      case 'extract': return <Camera size={15} className="menu-icon" />;
    }
  };

  return (
    <div className="app-wrapper">
      {/* Title Header */}
      <header className="app-header">
        <div className="brand-section">
          <div className="brand-logo-wrapper">
            <Video size={20} className="brand-logo" />
          </div>
          <span className="brand-name">CineWASM Operations Suite</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="engine-status-badge">
            <Cpu size={14} className={engineStatus === 'loading' ? 'animate-spin' : ''} />
            <span>WASM Core:</span>
            <div className={`status-indicator ${engineStatus}`} />
            <span className="capitalize">{engineStatus}</span>
          </div>

          {/* Theme Switcher Button */}
          <button
            className="theme-toggle-header-btn"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
          </button>
        </div>
      </header>

      {/* Main App Grid */}
      <main className="dashboard-grid no-terminal">
        {/* Operations Sidebar */}
        <aside className="sidebar-panel">
          <h3 className="sidebar-section-title">Operations</h3>
          <div className="operations-menu-list">
            {(
              [
                'trim',
                'merge',
                'speed',
                'crop',
                'scale',
                'audio',
                'compress',
                'convert',
                'watermark',
                'rotate',
                'filter',
                'gif',
                'reverse',
                'transition',
                'chromakey',
                'extract',
              ] as VideoOperation[]
            ).map((op) => (
              <button
                key={op}
                className={`operation-menu-btn capitalize ${activeOperation === op ? 'active' : ''}`}
                onClick={() => {
                  setActiveOperation(op);
                  if (op === 'merge') {
                    setFiles((prev) => (prev.length > 0 ? [prev[0]] : []));
                  } else {
                    setFiles((prev) => (prev.length > 0 ? [prev[0]] : []));
                  }
                  if (processingState.outputUrl) {
                    URL.revokeObjectURL(processingState.outputUrl);
                  }
                  setProcessingState((prev) => ({ ...prev, outputUrl: null, outputName: null, outputType: 'video' }));
                }}
              >
                {getMenuBadge(op)}
                <span>{op}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Workspace Canvas (Center) */}
        <section className="workspace-canvas">{renderActiveWorkspace()}</section>

        {/* Right Configuration Sidebar */}
        <aside className="config-panel">
          <h3 className="config-panel-title capitalize">{activeOperation} Settings</h3>

          {files.length > 0 && (
            <OperationSettings
              operation={activeOperation}
              speed={speed}
              setSpeed={setSpeed}
              scale={scale}
              setScale={setScale}
              audio={audio}
              setAudio={setAudio}
              compress={compress}
              setCompress={setCompress}
              convert={convert}
              setConvert={setConvert}
              watermark={watermark}
              setWatermark={setWatermark}
              rotate={rotate}
              setRotate={setRotate}
              filter={filter}
              setFilter={setFilter}
              gif={gif}
              setGif={setGif}
              transition={transition}
              setTransition={setTransition}
              chromakey={chromakey}
              setChromaKey={setChromaKey}
              extract={extract}
              setExtract={setExtract}
              videoDuration={files[0]?.duration}
            />
          )}

          {/* Action Trigger */}
          <div className="action-box">
            <button
              className="primary-action-btn"
              disabled={
                engineStatus !== 'ready' ||
                files.length === 0 ||
                processingState.isProcessing
              }
              onClick={handleRunOperation}
            >
              {processingState.isProcessing ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Execute Operation</span>
                </>
              )}
            </button>
            {files.length > 0 && (
              <button
                className="secondary-action-btn"
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.url));
                  setFiles([]);
                  handleResetOperation();
                  if (processingState.outputUrl) {
                    URL.revokeObjectURL(processingState.outputUrl);
                  }
                  setProcessingState((prev) => ({ ...prev, outputUrl: null, outputName: null, outputType: 'video' }));
                }}
              >
                Reset Session
              </button>
            )}
          </div>
        </aside>
      </main>

      {/* Hidden input for MergerList additional uploads */}
      <input
        type="file"
        ref={uploadInputRef}
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            const filesArr = Array.from(e.target.files);
            const validFiles: VideoFile[] = [];
            
            filesArr.forEach(async (file) => {
              if (file.type.startsWith('video/')) {
                const video = document.createElement('video');
                video.preload = 'metadata';
                const fileUrl = URL.createObjectURL(file);
                video.src = fileUrl;
                video.onloadedmetadata = () => {
                  URL.revokeObjectURL(fileUrl);
                  validFiles.push({
                    id: Math.random().toString(36).substring(2, 9),
                    file,
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size,
                    duration: video.duration,
                    width: video.videoWidth,
                    height: video.videoHeight,
                  });
                  if (validFiles.length === filesArr.length) {
                    setFiles((prev) => [...prev, ...validFiles]);
                  }
                };
              }
            });
          }
        }}
        accept="video/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* Processing Loader Overlay */}
      {processingState.isProcessing && (
        <div className="process-overlay">
          <div className="overlay-content animate-fade-in">
            <div className="processing-loader-wrapper">
              <div className="circular-loader-bg" />
              <div className="circular-loader-progress" />
              <span className="progress-text-percent">{processingState.progress}%</span>
            </div>
            <div>
              <div className="overlay-status">Compiling Video Buffers</div>
              <div className="overlay-sub">{processingState.statusMessage}</div>
            </div>
            <div className="linear-progress-bar">
              <div
                className="linear-progress-fill"
                style={{ width: `${processingState.progress}%` }}
              />
            </div>
            {(activeOperation === 'compress' || activeOperation === 'chromakey') && (
              <div className="upload-error" style={{ background: 'rgba(245, 158, 11, 0.1)', borderColor: 'rgba(245, 158, 11, 0.2)', color: '#fef08a' }}>
                <AlertTriangle size={14} />
                <span style={{ fontSize: '11px' }}>Re-encoding in chroma-key or compression preset frames takes extensive CPU memory. Do not close browser tab.</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Structured Footer */}
      <footer className="app-footer">
        <div className="footer-left">
          <button className="footer-link-policy" onClick={() => setShowPrivacyModal(true)}>
            Privacy Policy
          </button>
        </div>
        <div className="footer-center">
          <span>Made with</span>
          <Heart size={14} className="heart-icon-badge" fill="var(--status-error)" />
          <span>in India</span>
        </div>
        <div className="footer-right">
          <span>&copy; {new Date().getFullYear()} CineWASM. All rights reserved.</span>
        </div>
      </footer>

      {/* Custom Modern Toasts Alert Overlay */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className="toast-alert animate-fade-in">
            <div className={`toast-icon-box ${t.type}`}>
              {t.type === 'success' && <CheckCircle size={18} />}
              {t.type === 'error' && <AlertCircle size={18} />}
              {t.type === 'warning' && <AlertTriangle size={18} />}
              {t.type === 'info' && <Info size={18} />}
            </div>
            <div className="toast-content-wrapper">
              <span className="toast-message">{t.message}</span>
            </div>
            <div className="toast-progress-bar" />
          </div>
        ))}
      </div>

      {/* Privacy Policy Modal Overlay */}
      {showPrivacyModal && (
        <div className="modal-overlay" onClick={() => setShowPrivacyModal(false)}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Client-Side Privacy Policy</h3>
              <button className="modal-close-btn" onClick={() => setShowPrivacyModal(false)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              <p>
                CineWASM Operations Suite is built as a fully client-side utility prioritizing absolute user privacy.
              </p>
              
              <h4>1. Local WebAssembly Sandboxed Execution</h4>
              <p>
                All operations—including video trimming, transitions, file merges, and chroma-key calculations—are processed entirely inside your browser using WebAssembly binaries compile wrappers of FFmpeg.
              </p>
              <p>
                <strong>No media file data is ever uploaded, cached, cached on, or processed by remote servers.</strong> All calculations run strictly in your system's hardware memory.
              </p>

              <h4>2. Temporary Workspace Lifetime</h4>
              <p>
                Virtual files written to memory during processing (e.g. watermark PNG overlays or external MP3 buffers) are immediately cleared and wiped from the browser's temporary storage upon completion or cancellation of the execution thread.
              </p>

              <h4>3. Offline Compatibility</h4>
              <p>
                Once loaded, the compiler, layout configurations, and assets run fully offline. We do not track user analytics, metadata details, or file specifications.
              </p>
            </div>
            <div className="modal-footer">
              <button className="modal-action-btn" onClick={() => setShowPrivacyModal(false)}>
                I Understand
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
