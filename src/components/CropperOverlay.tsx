import React from 'react';
import { Crop, Maximize } from 'lucide-react';
import { CropSettings } from '../types';

interface CropperOverlayProps {
  settings: CropSettings;
  onChange: (settings: CropSettings) => void;
  videoWidth: number;
  videoHeight: number;
}

export const CropperOverlay: React.FC<CropperOverlayProps> = ({
  settings,
  onChange,
  videoWidth,
  videoHeight,
}) => {
  // Preset ratios: [label, width_ratio, height_ratio]
  const presets: [string, number, number | null][] = [
    ['Square (1:1)', 1, 1],
    ['Story/Reel (9:16)', 9, 16],
    ['Landscape (16:9)', 16, 9],
    ['Standard (4:3)', 4, 3],
    ['Free Form', 0, null],
  ];

  const applyPresetRatio = (rw: number, rh: number | null) => {
    if (!rh || rw === 0) {
      onChange({ x: 0, y: 0, width: 100, height: 100 });
      return;
    }

    const currentAspect = videoWidth / videoHeight;
    const targetAspect = rw / rh;

    let w = 100;
    let h = 100;
    let x = 0;
    let y = 0;

    if (currentAspect > targetAspect) {
      // Current video is wider than target aspect ratio.
      // Height should be full, width is narrower.
      w = (targetAspect / currentAspect) * 100;
      x = (100 - w) / 2;
    } else {
      // Current video is taller than target aspect ratio.
      // Width should be full, height is shorter.
      h = (currentAspect / targetAspect) * 100;
      y = (100 - h) / 2;
    }

    onChange({
      x: parseFloat(x.toFixed(1)),
      y: parseFloat(y.toFixed(1)),
      width: parseFloat(w.toFixed(1)),
      height: parseFloat(h.toFixed(1)),
    });
  };

  const handleSliderChange = (key: keyof CropSettings, val: number) => {
    const nextSettings = { ...settings, [key]: val };
    
    // Bounds check
    if (key === 'x') {
      if (nextSettings.x + nextSettings.width > 100) {
        nextSettings.width = 100 - nextSettings.x;
      }
    }
    if (key === 'y') {
      if (nextSettings.y + nextSettings.height > 100) {
        nextSettings.height = 100 - nextSettings.y;
      }
    }
    if (key === 'width') {
      if (nextSettings.x + nextSettings.width > 100) {
        nextSettings.x = 100 - nextSettings.width;
      }
    }
    if (key === 'height') {
      if (nextSettings.y + nextSettings.height > 100) {
        nextSettings.y = 100 - nextSettings.height;
      }
    }

    onChange(nextSettings);
  };

  return (
    <div className="cropper-overlay-component">
      <div className="timeline-title-wrapper">
        <Crop size={14} className="accent-color-text" />
        <span className="timeline-heading">Visual Crop Settings</span>
      </div>

      <div className="crop-presets-grid">
        {presets.map(([label, rw, rh]) => (
          <button
            key={label}
            className="preset-chip text-ellipsis"
            onClick={() => applyPresetRatio(rw, rh)}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Mock Visual Cropper Box */}
      <div className="cropper-canvas-wrapper">
        <div className="cropper-canvas-ratio-container">
          <div className="cropper-video-dummy">
            <span className="dummy-tag">Video Canvas Preview</span>
            {/* The crop overlay boundary */}
            <div
              className="crop-selection-outline"
              style={{
                left: `${settings.x}%`,
                top: `${settings.y}%`,
                width: `${settings.width}%`,
                height: `${settings.height}%`,
              }}
            >
              <div className="crop-grid-line h-1" />
              <div className="crop-grid-line h-2" />
              <div className="crop-grid-line v-1" />
              <div className="crop-grid-line v-2" />
              <span className="crop-selection-badge">
                {Math.round((settings.width * videoWidth) / 100)} x{' '}
                {Math.round((settings.height * videoHeight) / 100)} px
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Numerical Sliders */}
      <div className="crop-sliders-container">
        <div className="crop-slider-row">
          <div className="crop-slider-label">X Offset: {settings.x}%</div>
          <input
            type="range"
            min={0}
            max={99}
            value={settings.x}
            onChange={(e) => handleSliderChange('x', parseInt(e.target.value))}
            className="custom-range-slider"
          />
        </div>

        <div className="crop-slider-row">
          <div className="crop-slider-label">Y Offset: {settings.y}%</div>
          <input
            type="range"
            min={0}
            max={99}
            value={settings.y}
            onChange={(e) => handleSliderChange('y', parseInt(e.target.value))}
            className="custom-range-slider"
          />
        </div>

        <div className="crop-slider-row">
          <div className="crop-slider-label">Width: {settings.width}%</div>
          <input
            type="range"
            min={1}
            max={100}
            value={settings.width}
            onChange={(e) => handleSliderChange('width', parseInt(e.target.value))}
            className="custom-range-slider"
          />
        </div>

        <div className="crop-slider-row">
          <div className="crop-slider-label">Height: {settings.height}%</div>
          <input
            type="range"
            min={1}
            max={100}
            value={settings.height}
            onChange={(e) => handleSliderChange('height', parseInt(e.target.value))}
            className="custom-range-slider"
          />
        </div>
      </div>
    </div>
  );
};
