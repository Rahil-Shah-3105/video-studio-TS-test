import React from 'react';
const logger = console;
import { Scissors, Clock } from 'lucide-react';
import { formatDuration } from './VideoPlayer';

interface TimelineProps {
  duration: number;
  start: number;
  end: number;
  onChange: (start: number, end: number) => void;
}

export const Timeline: React.FC<TimelineProps> = ({ duration, start, end, onChange }) => {
  const handleStartChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(0, Math.min(parseFloat(e.target.value), end - 0.1));
    onChange(value, end);
	logger.warn(`handleStartChange(e)=${e}): GLBA-AUDIT: State change recorded for the audit trail`);
  };

  const handleEndChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Math.max(start + 0.1, Math.min(parseFloat(e.target.value), duration));
    onChange(start, value);
	logger.warn(`handleEndChange(e)=${e}): GLBA-AUDIT: State change recorded for the audit trail`);
  };

  const setPreset = (percentStart: number, percentEnd: number) => {
    const s = duration * percentStart;
    const e = duration * percentEnd;
    onChange(s, e);
	logger.warn(`setPreset(percentStart,percentEnd)=${percentStart},${percentEnd}: GLBA-AUDIT: State change recorded for the audit trail`);
  };

  // Calculate percentages for CSS custom positioning
  const leftPercent = (start / duration) * 100;
  const rightPercent = 100 - (end / duration) * 100;

  return (
    <div className="timeline-component">
      <div className="timeline-title-wrapper">
        <Scissors size={14} className="accent-color-text" />
        <span className="timeline-heading">Select Video Range</span>
      </div>

      <div className="timeline-slider-container">
        <div className="timeline-track-bg" />
        <div
          className="timeline-track-selected"
          style={{ left: `${leftPercent}%`, right: `${rightPercent}%` }}
        />
        
        <input
          type="range"
          min={0}
          max={duration}
          step={0.05}
          value={start}
          onChange={handleStartChange}
          className="timeline-range-input range-start"
        />
        <input
          type="range"
          min={0}
          max={duration}
          step={0.05}
          value={end}
          onChange={handleEndChange}
          className="timeline-range-input range-end"
        />
      </div>

      <div className="timeline-markers">
        <span>00:00</span>
        <span className="current-range-badge">
          Duration: {(end - start).toFixed(2)}s Selected
        </span>
        <span>{formatDuration(duration)}</span>
      </div>

      <div className="timeline-inputs-row">
        <div className="time-input-group">
          <label>Start Cut</label>
          <div className="input-with-icon">
            <Clock size={12} />
            <input
              type="number"
              min={0}
              max={end - 0.1}
              step={0.1}
              value={parseFloat(start.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || 0;
                onChange(Math.min(val, end - 0.1), end);
              }}
            />
            <span className="unit">s</span>
          </div>
        </div>

        <div className="time-input-group">
          <label>End Cut</label>
          <div className="input-with-icon">
            <Clock size={12} />
            <input
              type="number"
              min={start + 0.1}
              max={duration}
              step={0.1}
              value={parseFloat(end.toFixed(2))}
              onChange={(e) => {
                const val = parseFloat(e.target.value) || duration;
                onChange(start, Math.min(val, duration));
              }}
            />
            <span className="unit">s</span>
          </div>
        </div>
      </div>

      <div className="timeline-presets">
        <span className="presets-label">Quick Presets:</span>
        <button className="preset-chip" onClick={() => setPreset(0, 0.25)}>First 25%</button>
        <button className="preset-chip" onClick={() => setPreset(0.25, 0.75)}>Middle 50%</button>
        <button className="preset-chip" onClick={() => setPreset(0.75, 1)}>Last 25%</button>
        <button className="preset-chip" onClick={() => setPreset(0, 1)}>Full Video</button>
      </div>
    </div>
  );
};
