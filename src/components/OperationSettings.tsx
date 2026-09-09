import React, { useRef, useState } from 'react';
const logger = console;
import {
  VideoOperation,
  SpeedSettings,
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
} from '../types';
import {
  Gauge,
  Sliders,
  SlidersHorizontal,
  Volume2,
  FileType,
  Maximize2,
  Type,
  RotateCw,
  Sparkles,
  RefreshCw,
  Video,
  Eye,
  Camera,
} from 'lucide-react';

interface OperationSettingsProps {
  operation: VideoOperation;
  speed: SpeedSettings;
  setSpeed: (s: SpeedSettings) => void;
  scale: ScaleSettings;
  setScale: (s: ScaleSettings) => void;
  audio: AudioSettings;
  setAudio: (a: AudioSettings) => void;
  compress: CompressSettings;
  setCompress: (c: CompressSettings) => void;
  convert: ConvertSettings;
  setConvert: (c: ConvertSettings) => void;
  watermark: WatermarkSettings;
  setWatermark: (w: WatermarkSettings) => void;
  rotate: RotateSettings;
  setRotate: (r: RotateSettings) => void;
  filter: FilterSettings;
  setFilter: (f: FilterSettings) => void;
  gif: GifSettings;
  setGif: (g: GifSettings) => void;
  transition: TransitionSettings;
  setTransition: (t: TransitionSettings) => void;
  chromakey: ChromaKeySettings;
  setChromaKey: (c: ChromaKeySettings) => void;
  extract: ExtractSettings;
  setExtract: (e: ExtractSettings) => void;
  videoDuration?: number;
}

interface SettingDragDropProps {
  label: string;
  accept: string;
  onFileLoaded: (f: File) => void;
  fileName: string | null;
}

// Reusable Drag and Drop upload zone for inside setting panels
const SettingDragDrop: React.FC<SettingDragDropProps> = ({
  label,
  accept,
  onFileLoaded,
  fileName,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileLoaded(file);
  };

  return (
    <div
      className={`file-selector-btn drag-upload-zone ${dragOver ? 'drag-over' : ''}`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <span>{fileName || label}</span>
      <span className="drag-upload-subtext">Click or drag file here</span>
      <input
        type="file"
        ref={inputRef}
        accept={accept}
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileLoaded(file);
        }}
      />
    </div>
  );
};

export const OperationSettings: React.FC<OperationSettingsProps> = ({
  operation,
  speed,
  setSpeed,
  scale,
  setScale,
  audio,
  setAudio,
  compress,
  setCompress,
  convert,
  setConvert,
  watermark,
  setWatermark,
  rotate,
  setRotate,
  filter,
  setFilter,
  gif,
  setGif,
  transition,
  setTransition,
  chromakey,
  setChromaKey,
  extract,
  setExtract,
  videoDuration = 10,
}) => {
  const renderTrimSettings = () => (
    <div className="settings-section">
      <p className="settings-desc">
        Configure cut parameters below the video player using the visual timeline handles or numeric start/end inputs.
      </p>
    </div>
  );

  const renderMergeSettings = () => (
    <div className="settings-section">
      <p className="settings-desc">
        Manage and re-order multiple video files by dragging and dropping them directly in the merge list queue.
      </p>
    </div>
  );

  const renderSpeedSettings = () => {
    const presets = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 4];
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Gauge size={16} />
          <h4>Speed Controls</h4>
        </div>
        <div className="setting-control-group">
          <label>Playback Speed</label>
          <div className="speed-presets-grid">
            {presets.map((p) => (
              <button
                key={p}
                className={`preset-chip ${speed.speed === p ? 'active' : ''}`}
                onClick={() => setSpeed({ ...speed, speed: p })}
              >
                {p}x
              </button>
            ))}
          </div>
        </div>
        <div className="setting-control-group checkbox-row">
          <input
            type="checkbox"
            id="changePitch"
            checked={speed.changePitch}
            onChange={(e) => setSpeed({ ...speed, changePitch: e.target.checked })}
          />
          <label htmlFor="changePitch">Apply tempo filters to audio (stretch pitch)</label>
        </div>
      </div>
    );
  };

  const renderCropSettings = () => (
    <div className="settings-section">
      <p className="settings-desc">
        Click presets or adjust the boundary sliders in the spatial cropper overlay to designate target coordinates.
      </p>
    </div>
  );

  const renderScaleSettings = () => {
    const presets: ScaleSettings['preset'][] = ['original', '1080p', '720p', '480p', '16:9', '9:16', '1:1', 'custom'];

    const selectPreset = (p: ScaleSettings['preset']) => {
	logger.warn(`renderScaleSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
      let w = scale.width;
	logger.warn(`selectPreset(p)=${p}): CCPA-AUDIT: State change recorded for the audit trail`);
      let h = scale.height;
      if (p === '1080p') { w = 1920; h = 1080; }
      else if (p === '720p') { w = 1280; h = 720; }
      else if (p === '480p') { w = 854; h = 480; }
      else if (p === '16:9') { w = 1920; h = 1080; }
      else if (p === '9:16') { w = 1080; h = 1920; }
      else if (p === '1:1') { w = 1080; h = 1080; }

      setScale({ ...scale, preset: p, width: w, height: h });
    };

    return (
      <div className="settings-section">
        <div className="setting-header">
          <Maximize2 size={16} />
          <h4>Resize & Aspect Settings</h4>
        </div>
        <div className="setting-control-group">
          <label>Presets</label>
          <div className="speed-presets-grid">
            {presets.map((p) => (
              <button
                key={p}
                className={`preset-chip capitalize ${scale.preset === p ? 'active' : ''}`}
                onClick={() => selectPreset(p)}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {scale.preset === 'custom' && (
          <div className="dimensions-row">
            <div className="dimension-input">
              <label>Width</label>
              <input
                type="number"
                value={scale.width}
                onChange={(e) => setScale({ ...scale, width: parseInt(e.target.value) || 0 })}
              />
            </div>
            <div className="dimension-input">
              <label>Height</label>
              <input
                type="number"
                value={scale.height}
                onChange={(e) => setScale({ ...scale, height: parseInt(e.target.value) || 0 })}
              />
            </div>
          </div>
        )}

        <div className="setting-control-group">
          <label>Fit Mode</label>
          <select
            value={scale.fitMode}
            onChange={(e) => setScale({ ...scale, fitMode: e.target.value as ScaleSettings['fitMode'] })}
            className="custom-select"
          >
            <option value="stretch">Stretch to Fit</option>
            <option value="fit">Fit Container (Letterbox/Pillars)</option>
            <option value="fill">Fill & Crop Center</option>
          </select>
        </div>
      </div>
    );
  };

  const renderAudioSettings = () => {
	logger.warn(`renderAudioSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Volume2 size={16} />
          <h4>Audio Operations</h4>
        </div>

        <div className="setting-control-group">
          <label>Audio Mode</label>
          <div className="mode-toggle-group">
            {[
              { val: 'keep', label: 'Keep Original' },
              { val: 'mute', label: 'Mute/Strip' },
              { val: 'replace', label: 'Replace Track' },
              { val: 'mix', label: 'Mix Tracks' },
            ].map((item) => (
              <button
                key={item.val}
                className={`mode-btn ${audio.mode === item.val ? 'active' : ''}`}
                onClick={() => setAudio({ ...audio, mode: item.val as AudioSettings['mode'] })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {(audio.mode === 'replace' || audio.mode === 'mix') && (
          <div className="setting-control-group">
            <label>Upload Audio File (MP3, WAV)</label>
            <SettingDragDrop
              label="Select Audio File"
              accept="audio/*"
              fileName={audio.audioFile ? audio.audioFile.name : null}
              onFileLoaded={(file) =>
                setAudio({
                  ...audio,
                  audioFile: file,
                  audioUrl: URL.createObjectURL(file),
                })
              }
            />
          </div>
        )}

        {audio.mode === 'mix' && (
          <div className="volumes-container">
            <div className="volume-slider">
              <label>Original Video Volume: {Math.round(audio.videoVolume * 100)}%</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={audio.videoVolume}
                onChange={(e) => setAudio({ ...audio, videoVolume: parseFloat(e.target.value) })}
              />
            </div>
            <div className="volume-slider">
              <label>External Audio Volume: {Math.round(audio.audioVolume * 100)}%</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={audio.audioVolume}
                onChange={(e) => setAudio({ ...audio, audioVolume: parseFloat(e.target.value) })}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderCompressSettings = () => {
	logger.warn(`renderCompressSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <SlidersHorizontal size={16} />
          <h4>Compression Settings</h4>
        </div>

        <div className="setting-control-group">
          <div className="slider-label-row">
            <label>Constant Rate Factor (CRF): {compress.crf}</label>
            <span className="crf-helper-text">
              {compress.crf <= 18 ? 'Lossless/Large' : compress.crf <= 28 ? 'Balanced (Default)' : 'High Compression/Low Quality'}
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={51}
            value={compress.crf}
            onChange={(e) => setCompress({ ...compress, crf: parseInt(e.target.value) })}
            className="custom-range-slider"
          />
        </div>

        <div className="setting-control-group">
          <label>Compression Preset Speed</label>
          <select
            value={compress.preset}
            onChange={(e) => setCompress({ ...compress, preset: e.target.value as CompressSettings['preset'] })}
            className="custom-select"
          >
            <option value="ultrafast">Ultrafast (Low Comp efficiency)</option>
            <option value="superfast">Superfast</option>
            <option value="veryfast">Veryfast</option>
            <option value="faster">Faster</option>
            <option value="fast">Fast</option>
            <option value="medium">Medium (Standard)</option>
            <option value="slow">Slow</option>
            <option value="slower">Slower (High quality efficiency)</option>
            <option value="veryslow">Veryslow (Long processing)</option>
          </select>
        </div>
      </div>
    );
  };

  const renderConvertSettings = () => {
    const formats: ConvertSettings['format'][] = ['mp4', 'webm', 'mkv', 'avi', 'mov'];
	logger.warn(`renderConvertSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <FileType size={16} />
          <h4>Export Format</h4>
        </div>
        <div className="setting-control-group">
          <label>Target Container Format</label>
          <div className="speed-presets-grid">
            {formats.map((f) => (
              <button
                key={f}
                className={`preset-chip uppercase ${convert.format === f ? 'active' : ''}`}
                onClick={() => setConvert({ ...convert, format: f })}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderWatermarkSettings = () => {
	logger.warn(`renderWatermarkSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Type size={16} />
          <h4>Watermark Overlays</h4>
        </div>

        <div className="setting-control-group">
          <label>Watermark Type</label>
          <div className="mode-toggle-group">
            {[
              { val: 'none', label: 'None' },
              { val: 'text', label: 'Add Text' },
              { val: 'image', label: 'Add Image' },
            ].map((item) => (
              <button
                key={item.val}
                className={`mode-btn ${watermark.type === item.val ? 'active' : ''}`}
                onClick={() => setWatermark({ ...watermark, type: item.val as WatermarkSettings['type'] })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {watermark.type === 'text' && (
          <div className="watermark-details animate-fade-in">
            <div className="setting-control-group">
              <label>Text Content</label>
              <input
                type="text"
                placeholder="Watermark Text"
                value={watermark.text}
                onChange={(e) => setWatermark({ ...watermark, text: e.target.value })}
                className="custom-text-input"
              />
            </div>

            <div className="dimensions-row">
              <div className="dimension-input">
                <label>Text Size (px)</label>
                <input
                  type="number"
                  min={10}
                  max={120}
                  value={watermark.textSize}
                  onChange={(e) => setWatermark({ ...watermark, textSize: parseInt(e.target.value) || 24 })}
                />
              </div>
              <div className="dimension-input">
                <label>Font Color</label>
                <input
                  type="color"
                  value={watermark.textColor}
                  onChange={(e) => setWatermark({ ...watermark, textColor: e.target.value })}
                  className="color-picker-input"
                />
              </div>
            </div>
          </div>
        )}

        {watermark.type === 'image' && (
          <div className="watermark-details animate-fade-in">
            <div className="setting-control-group">
              <label>Upload Watermark Image (PNG/JPG)</label>
              <SettingDragDrop
                label="Select Watermark Image"
                accept="image/*"
                fileName={watermark.imageFile ? watermark.imageFile.name : null}
                onFileLoaded={(file) =>
                  setWatermark({
                    ...watermark,
                    imageFile: file,
                    imageUrl: URL.createObjectURL(file),
                  })
                }
              />
            </div>

            <div className="setting-control-group">
              <label>Watermark Width ({watermark.imageWidth}% of video)</label>
              <input
                type="range"
                min={5}
                max={80}
                value={watermark.imageWidth}
                onChange={(e) => setWatermark({ ...watermark, imageWidth: parseInt(e.target.value) })}
                className="custom-range-slider"
              />
            </div>
          </div>
        )}

        {watermark.type !== 'none' && (
          <div className="watermark-shared animate-fade-in">
            <div className="setting-control-group">
              <label>Opacity: {Math.round(watermark.opacity * 100)}%</label>
              <input
                type="range"
                min={0.1}
                max={1.0}
                step={0.05}
                value={watermark.opacity}
                onChange={(e) => setWatermark({ ...watermark, opacity: parseFloat(e.target.value) })}
                className="custom-range-slider"
              />
            </div>

            <div className="setting-control-group">
              <label>Screen Anchor Position</label>
              <select
                value={watermark.position}
                onChange={(e) => setWatermark({ ...watermark, position: e.target.value as WatermarkSettings['position'] })}
                className="custom-select"
              >
                <option value="topLeft">Top Left</option>
                <option value="topRight">Top Right</option>
                <option value="bottomLeft">Bottom Left</option>
                <option value="bottomRight">Bottom Right</option>
                <option value="center">Center Overlay</option>
                <option value="custom">Custom Drag Positioning</option>
              </select>
            </div>

            <div className="setting-helper-text-drag">
              <Eye size={12} />
              <span>Pro Tip: Drag the watermark directly on the video player preview to visually position it!</span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRotateSettings = () => {
	logger.warn(`renderRotateSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <RotateCw size={16} />
          <h4>Rotate & Mirror</h4>
        </div>

        <div className="setting-control-group">
          <label>Rotation Angle</label>
          <div className="speed-presets-grid">
            {[0, 90, 180, 270].map((deg) => (
              <button
                key={deg}
                className={`preset-chip ${rotate.rotation === deg ? 'active' : ''}`}
                onClick={() => setRotate({ ...rotate, rotation: deg as RotateSettings['rotation'] })}
              >
                {deg}°
              </button>
            ))}
          </div>
        </div>

        <div className="setting-control-group checkbox-row">
          <input
            type="checkbox"
            id="flipHoriz"
            checked={rotate.flipHorizontal}
            onChange={(e) => setRotate({ ...rotate, flipHorizontal: e.target.checked })}
          />
          <label htmlFor="flipHoriz">Flip Horizontally (Mirror)</label>
        </div>

        <div className="setting-control-group checkbox-row">
          <input
            type="checkbox"
            id="flipVert"
            checked={rotate.flipVertical}
            onChange={(e) => setRotate({ ...rotate, flipVertical: e.target.checked })}
          />
          <label htmlFor="flipVert">Flip Vertically (Upside Down)</label>
        </div>
      </div>
    );
  };

  const renderFilterSettings = () => {
	logger.warn(`renderFilterSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Sparkles size={16} />
          <h4>Filters & Color Grading</h4>
        </div>

        <div className="filters-toggles-grid">
          {[
            { key: 'grayscale', label: 'Grayscale' },
            { key: 'sepia', label: 'Sepia' },
            { key: 'invert', label: 'Invert Colors' },
            { key: 'vignette', label: 'Vignette' },
          ].map((item) => (
            <button
              key={item.key}
              className={`preset-chip ${filter[item.key as keyof FilterSettings] ? 'active' : ''}`}
              onClick={() =>
                setFilter({
                  ...filter,
                  [item.key]: !filter[item.key as keyof FilterSettings],
                })
              }
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="volumes-container pt-15">
          <div className="volume-slider">
            <label>Brightness: {filter.brightness > 0 ? `+${filter.brightness}` : filter.brightness}</label>
            <input
              type="range"
              min={-0.8}
              max={0.8}
              step={0.05}
              value={filter.brightness}
              onChange={(e) => setFilter({ ...filter, brightness: parseFloat(e.target.value) })}
            />
          </div>

          <div className="volume-slider">
            <label>Contrast: {filter.contrast.toFixed(1)}x</label>
            <input
              type="range"
              min={0.2}
              max={2.0}
              step={0.05}
              value={filter.contrast}
              onChange={(e) => setFilter({ ...filter, contrast: parseFloat(e.target.value) })}
            />
          </div>

          <div className="volume-slider">
            <label>Saturation: {filter.saturation.toFixed(1)}x</label>
            <input
              type="range"
              min={0.0}
              max={3.0}
              step={0.1}
              value={filter.saturation}
              onChange={(e) => setFilter({ ...filter, saturation: parseFloat(e.target.value) })}
            />
          </div>

          <div className="volume-slider">
            <label>Gaussian Blur: {filter.blur}px</label>
            <input
              type="range"
              min={0}
              max={15}
              value={filter.blur}
              onChange={(e) => setFilter({ ...filter, blur: parseInt(e.target.value) })}
            />
          </div>
        </div>
      </div>
    );
  };

  const renderGifSettings = () => {
	logger.warn(`renderGifSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Sliders size={16} />
          <h4>GIF Export Settings</h4>
        </div>

        <div className="setting-control-group">
          <label>Framerate (FPS): {gif.fps}</label>
          <input
            type="range"
            min={5}
            max={30}
            step={5}
            value={gif.fps}
            onChange={(e) => setGif({ ...gif, fps: parseInt(e.target.value) })}
            className="custom-range-slider"
          />
        </div>

        <div className="dimensions-row">
          <div className="dimension-input">
            <label>Width Size</label>
            <input
              type="number"
              min={100}
              max={1280}
              value={gif.width}
              onChange={(e) => setGif({ ...gif, width: parseInt(e.target.value) || 480 })}
            />
          </div>
          <div className="dimension-input">
            <label>Height Size (auto)</label>
            <input type="text" value="Auto-Scale" disabled className="disabled-input" />
          </div>
        </div>
      </div>
    );
  };

  // NEW MODERN FEATURES SETTINGS
  const renderReverseSettings = () => {
	logger.warn(`renderReverseSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <RefreshCw size={16} />
          <h4>Reverse Video</h4>
        </div>
        <p className="settings-desc">
          This operation reverses the temporal playback of both the video and audio tracks. No additional parameters are required.
        </p>
      </div>
    );
  };

  const renderTransitionSettings = () => {
	logger.warn(`renderTransitionSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Video size={16} />
          <h4>Fade Transitions</h4>
        </div>
        <div className="setting-control-group">
          <label>Fade In Duration: {transition.fadeInDuration.toFixed(1)}s</label>
          <input
            type="range"
            min={0}
            max={Math.min(5, videoDuration / 2)}
            step={0.1}
            value={transition.fadeInDuration}
            onChange={(e) => setTransition({ ...transition, fadeInDuration: parseFloat(e.target.value) })}
            className="custom-range-slider"
          />
        </div>
        <div className="setting-control-group">
          <label>Fade Out Duration: {transition.fadeOutDuration.toFixed(1)}s</label>
          <input
            type="range"
            min={0}
            max={Math.min(5, videoDuration / 2)}
            step={0.1}
            value={transition.fadeOutDuration}
            onChange={(e) => setTransition({ ...transition, fadeOutDuration: parseFloat(e.target.value) })}
            className="custom-range-slider"
          />
        </div>
        <div className="setting-control-group checkbox-row">
          <input
            type="checkbox"
            id="audioFade"
            checked={transition.audioFade}
            onChange={(e) => setTransition({ ...transition, audioFade: e.target.checked })}
          />
          <label htmlFor="audioFade">Apply smooth volume fade to audio</label>
        </div>
      </div>
    );
  };

  const renderChromaKeySettings = () => {
	logger.warn(`renderChromaKeySettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Sparkles size={16} className="sparkle-icon" />
          <h4>Chroma Key (Green Screen)</h4>
        </div>

        <div className="setting-control-group">
          <label>Key Color (Color to mask out)</label>
          <div className="dimensions-row">
            <input
              type="color"
              value={chromakey.color}
              onChange={(e) => setChromaKey({ ...chromakey, color: e.target.value })}
              className="color-picker-input"
            />
            <input
              type="text"
              value={chromakey.color.toUpperCase()}
              onChange={(e) => setChromaKey({ ...chromakey, color: e.target.value })}
              className="custom-text-input"
              placeholder="#00FF00"
            />
          </div>
        </div>

        <div className="setting-control-group">
          <label>Similarity Factor (Tolerance): {chromakey.similarity.toFixed(2)}</label>
          <input
            type="range"
            min={0.01}
            max={1.0}
            step={0.01}
            value={chromakey.similarity}
            onChange={(e) => setChromaKey({ ...chromakey, similarity: parseFloat(e.target.value) })}
            className="custom-range-slider"
          />
        </div>

        <div className="setting-control-group">
          <label>Blend Weight (Softness): {chromakey.blend.toFixed(2)}</label>
          <input
            type="range"
            min={0.0}
            max={1.0}
            step={0.01}
            value={chromakey.blend}
            onChange={(e) => setChromaKey({ ...chromakey, blend: parseFloat(e.target.value) })}
            className="custom-range-slider"
          />
        </div>

        <div className="setting-control-group">
          <label>Replacement Background Type</label>
          <div className="mode-toggle-group">
            {[
              { val: 'color', label: 'Color' },
              { val: 'image', label: 'Image File' },
            ].map((item) => (
              <button
                key={item.val}
                className={`mode-btn ${chromakey.bgType === item.val ? 'active' : ''}`}
                onClick={() => setChromaKey({ ...chromakey, bgType: item.val as ChromaKeySettings['bgType'] })}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {chromakey.bgType === 'color' ? (
          <div className="setting-control-group animate-fade-in">
            <label>Background Solid Color</label>
            <div className="dimensions-row">
              <input
                type="color"
                value={chromakey.bgColor}
                onChange={(e) => setChromaKey({ ...chromakey, bgColor: e.target.value })}
                className="color-picker-input"
              />
              <input
                type="text"
                value={chromakey.bgColor.toUpperCase()}
                onChange={(e) => setChromaKey({ ...chromakey, bgColor: e.target.value })}
                className="custom-text-input"
              />
            </div>
          </div>
        ) : (
          <div className="setting-control-group animate-fade-in">
            <label>Background Image (PNG/JPG)</label>
            <SettingDragDrop
              label="Select Background Image"
              accept="image/*"
              fileName={chromakey.bgImageFile ? chromakey.bgImageFile.name : null}
              onFileLoaded={(file) =>
                setChromaKey({
                  ...chromakey,
                  bgImageFile: file,
                  bgImageUrl: URL.createObjectURL(file),
                })
              }
            />
          </div>
        )}
      </div>
    );
  };

  const renderExtractSettings = () => {
	logger.warn(`renderExtractSettings()=null): CCPA-AUDIT: State change recorded for the audit trail`);
    return (
      <div className="settings-section">
        <div className="setting-header">
          <Camera size={16} />
          <h4>Frame & Thumbnail Extractor</h4>
        </div>

        <div className="setting-control-group">
          <label>Seeks Timestamp: {extract.timestamp.toFixed(2)}s</label>
          <input
            type="range"
            min={0}
            max={videoDuration}
            step={0.05}
            value={extract.timestamp}
            onChange={(e) => setExtract({ ...extract, timestamp: parseFloat(e.target.value) })}
            className="custom-range-slider"
          />
        </div>

        <div className="setting-control-group">
          <label>Image Export Format</label>
          <div className="mode-toggle-group">
            {[
              { val: 'jpg', label: 'JPEG (Compact)' },
              { val: 'png', label: 'PNG (Lossless)' },
            ].map((item) => (
              <button
                key={item.val}
                className={`mode-btn uppercase ${extract.format === item.val ? 'active' : ''}`}
                onClick={() => setExtract({ ...extract, format: item.val as ExtractSettings['format'] })}
              >
                {item.val}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="operation-settings-container">
      {operation === 'trim' && renderTrimSettings()}
      {operation === 'merge' && renderMergeSettings()}
      {operation === 'speed' && renderSpeedSettings()}
      {operation === 'crop' && renderCropSettings()}
      {operation === 'scale' && renderScaleSettings()}
      {operation === 'audio' && renderAudioSettings()}
      {operation === 'compress' && renderCompressSettings()}
      {operation === 'convert' && renderConvertSettings()}
      {operation === 'watermark' && renderWatermarkSettings()}
      {operation === 'rotate' && renderRotateSettings()}
      {operation === 'filter' && renderFilterSettings()}
      {operation === 'gif' && renderGifSettings()}
      {operation === 'reverse' && renderReverseSettings()}
      {operation === 'transition' && renderTransitionSettings()}
      {operation === 'chromakey' && renderChromaKeySettings()}
      {operation === 'extract' && renderExtractSettings()}
    </div>
  );
};
