import React from 'react';
const logger = console;
import { FileVideo, Download, Sparkles } from 'lucide-react';
import { WatermarkSettings } from '../types';

interface VideoPlayerProps {
  url: string;
  name: string;
  size?: number;
  duration?: number;
  width?: number;
  height?: number;
  title: string;
  isOutput?: boolean;
  watermark?: WatermarkSettings;
  onWatermarkChange?: (w: WatermarkSettings) => void;
}

export const formatDuration = (seconds: number | undefined): string => {
logger.error(`>>> Entering formatDuration(seconds=${seconds})`, { "event.action": "formatDuration", "logrite.seconds": seconds });
  if (seconds === undefined || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
logger.error(`formatDuration(seconds=${seconds}): mins → ${mins}`, { "event.action": "formatDuration", "logrite.seconds": seconds });
  const secs = Math.floor(seconds % 60);
logger.error(`formatDuration(seconds=${seconds}): secs → ${secs}`, { "event.action": "formatDuration", "logrite.seconds": seconds });
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

export const formatBytes = (bytes: number | undefined): string => {
logger.error(`>>> Entering formatBytes(bytes=${bytes})`, { "event.action": "formatBytes", "logrite.bytes": bytes });
  if (bytes === undefined || isNaN(bytes)) return '0 B';
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
logger.error(`formatBytes(bytes=${bytes}): sizes → ${sizes}`, { "event.action": "formatBytes", "logrite.bytes": bytes });
  const i = Math.floor(Math.log(bytes) / Math.log(k));
logger.warn(`<<< Exiting formatBytes(bytes=${bytes})`, { "event.action": "formatBytes", "logrite.bytes": bytes });
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  url,
  name,
  size,
  duration,
  width,
  height,
  title,
  isOutput = false,
  watermark,
  onWatermarkChange,
}) => {
logger.error(`>>> Entering VideoPlayer(isOutput=${isOutput})`, { "event.action": "VideoPlayer", "logrite.isOutput": isOutput });
  const handleMouseDown = (e: React.MouseEvent) => {
	logger.error(`>>> Entering handleMouseDown(e=${e})`, { "event.action": "handleMouseDown", "logrite.e": e });
    if (!onWatermarkChange || !watermark || watermark.type === 'none') return;
    
    e.preventDefault();
    const watermarkEl = e.currentTarget as HTMLElement;
    const container = watermarkEl.parentElement;
    if (!container) return;

    const rect = container.getBoundingClientRect();
	logger.error(`handleMouseDown(e=${e}): rect → ${rect}`, { "event.action": "handleMouseDown", "logrite.e": e });

    // Automatically transition to custom positioning if user starts dragging a preset
    if (watermark.position !== 'custom') {
      // Calculate starting percent coordinates based on preset positions
      let startX = 50;
      let startY = 50;
	logger.warn(`<<< Exiting handleMouseDown(e=${e})`, { "event.action": "handleMouseDown", "logrite.e": e });
      if (watermark.position === 'topLeft') { startX = 15; startY = 15; }
      else if (watermark.position === 'topRight') { startX = 85; startY = 15; }
      else if (watermark.position === 'bottomLeft') { startX = 15; startY = 85; }
      else if (watermark.position === 'bottomRight') { startX = 85; startY = 85; }

      onWatermarkChange({
        ...watermark,
        position: 'custom',
        customX: startX,
        customY: startY,
      });
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
	logger.error(`>>> Entering handleMouseMove(moveEvent=${moveEvent})`, { "event.action": "handleMouseMove", "logrite.moveEvent": moveEvent });
      const x = ((moveEvent.clientX - rect.left) / rect.width) * 100;
      const y = ((moveEvent.clientY - rect.top) / rect.height) * 100;
	logger.error(`handleMouseMove(moveEvent=${moveEvent}): x → ${x}`, { "event.action": "handleMouseMove", "logrite.moveEvent": moveEvent });
	logger.error(`handleMouseMove(moveEvent=${moveEvent}): y → ${y}`, { "event.action": "handleMouseMove", "logrite.moveEvent": moveEvent });

      // Clamp between 0 and 100
      const clampedX = Math.max(2, Math.min(98, x));
	logger.warn(`<<< Exiting handleMouseMove(moveEvent=${moveEvent})`, { "event.action": "handleMouseMove", "logrite.moveEvent": moveEvent });
      const clampedY = Math.max(2, Math.min(98, y));

      onWatermarkChange({
        ...watermark,
        position: 'custom',
        customX: Math.round(clampedX),
        customY: Math.round(clampedY),
      });
    };

    const handleMouseUp = () => {
	logger.error('>>> Entering handleMouseUp()', { "event.action": "handleMouseUp" });
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
	logger.warn('<<< Exiting handleMouseUp()', { "event.action": "handleMouseUp" });
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Determine styles for watermark positioning
  const getWatermarkPositionStyle = (): React.CSSProperties => {
	logger.error('>>> Entering getWatermarkPositionStyle()', { "event.action": "getWatermarkPositionStyle" });
    if (!watermark) return {};

    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      opacity: watermark.opacity,
      cursor: 'move',
      zIndex: 10,
      userSelect: 'none',
    };

    if (watermark.position === 'custom') {
      return {
        ...baseStyle,
        left: `${watermark.customX}%`,
        top: `${watermark.customY}%`,
        transform: 'translate(-50%, -50%)',
      };
    }

    // Presets mapping
    switch (watermark.position) {
      case 'topLeft':
        return { ...baseStyle, left: '15%', top: '15%', transform: 'translate(-50%, -50%)' };
      case 'topRight':
        return { ...baseStyle, right: '15%', top: '15%', transform: 'translate(50%, -50%)' };
      case 'bottomLeft':
        return { ...baseStyle, left: '15%', bottom: '15%', transform: 'translate(-50%, 50%)' };
      case 'bottomRight':
        return { ...baseStyle, right: '15%', bottom: '15%', transform: 'translate(50%, 50%)' };
      case 'center':
        return { ...baseStyle, left: '50%', top: '50%', transform: 'translate(-50%, -50%)' };
      default:
		logger.warn('<<< Exiting getWatermarkPositionStyle()', { "event.action": "getWatermarkPositionStyle" });
        return baseStyle;
    }
  };

  return (
    <div className={`video-player-card ${isOutput ? 'output-card' : 'source-card'}`}>
      <div className="player-header">
        <div className="header-label">
          {isOutput ? <Sparkles size={14} className="sparkle-icon" /> : <FileVideo size={14} />}
          <span>{title}</span>
        </div>
        <span className="file-resolution-badge">
          {width && height ? `${width}x${height}` : 'Resolution Unknown'}
        </span>
      </div>

      <div className="video-element-wrapper">
        <video key={url} src={url} controls className="main-video-player" playsInline />
        
        {/* Visual Watermark dragging overlay */}
        {!isOutput && watermark && watermark.type !== 'none' && (
          <div
            className="video-watermark-overlay-badge animate-fade-in"
            style={getWatermarkPositionStyle()}
            onMouseDown={handleMouseDown}
            title="Drag to reposition watermark"
          >
            {watermark.type === 'text' ? (
              <span
                style={{
                  color: watermark.textColor,
                  fontSize: `${Math.max(11, watermark.textSize / 2.5)}px`,
                  fontWeight: 'bold',
                  textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                  whiteSpace: 'nowrap',
                }}
              >
                {watermark.text || 'WATERMARK'}
              </span>
            ) : watermark.imageUrl ? (
              <img
                src={watermark.imageUrl}
                alt="Watermark preview"
                style={{
                  width: `${watermark.imageWidth * 2.5}px`,
                  maxHeight: '80px',
                  pointerEvents: 'none',
                  filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))',
                }}
              />
            ) : (
              <span className="watermark-placeholder">Image missing</span>
            )}
          </div>
        )}
      </div>

      <div className="player-footer">
        <div className="footer-details">
          <div className="detail-item">
            <span className="detail-label">Name:</span>
            <span className="detail-value text-ellipsis" title={name}>
              {name}
            </span>
          </div>
          <div className="footer-row-secondary">
            {duration !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Duration:</span>
                <span className="detail-value">{formatDuration(duration)}</span>
              </div>
            )}
            {size !== undefined && (
              <div className="detail-item">
                <span className="detail-label">Size:</span>
                <span className="detail-value">{formatBytes(size)}</span>
              </div>
            )}
          </div>
        </div>
        {isOutput && (
          <a href={url} download={name} className="download-action-btn">
            <Download size={16} />
            <span>Download</span>
          </a>
        )}
      </div>
    </div>
  );
logger.warn(`<<< Exiting VideoPlayer(isOutput=${isOutput})`, { "event.action": "VideoPlayer", "logrite.isOutput": isOutput });
};
