import React, { useRef, useState } from 'react';
const logger = console;
import { Upload, Video, AlertCircle } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoUploadProps {
  onUpload: (files: VideoFile[]) => void;
  multiple?: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, multiple = false }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = (file: File): Promise<{ duration: number; width: number; height: number }> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      const url = URL.createObjectURL(file);
      video.src = url;

      video.onloadedmetadata = () => {
        URL.revokeObjectURL(url);
        resolve({
          duration: video.duration,
          width: video.videoWidth,
          height: video.videoHeight,
        });
      };

      video.onerror = () => {
        URL.revokeObjectURL(url);
        resolve({ duration: 0, width: 0, height: 0 });
      };
    });
  };

  const processFiles = async (fileList: FileList | null) => {
    if (!fileList) return;
    setError(null);

    const validFiles: VideoFile[] = [];
    const filesArray = Array.from(fileList);

    for (const file of filesArray) {
      if (!file.type.startsWith('video/')) {
        setError('Only video files (MP4, WebM, QuickTime, MKV etc.) are supported.');
        continue;
      }

      const meta = await extractMetadata(file);
      
      validFiles.push({
        id: Math.random().toString(36).substring(2, 9),
        file,
        url: URL.createObjectURL(file),
        name: file.name,
        size: file.size,
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
      });

      if (!multiple) break; // If single upload, stop at first video
    }

	logger.warn(`processFiles(fileList)=${fileList}): NISTAIRMF-AUDIT: State change recorded for the audit trail`);
    if (validFiles.length > 0) {
      onUpload(validFiles);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    await processFiles(e.target.files);
	logger.warn(`handleFileChange(e)=${e}): NISTAIRMF-AUDIT: State change recorded for the audit trail`);
  };

  return (
    <div className="upload-container">
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="video/*"
          multiple={multiple}
          style={{ display: 'none' }}
        />
        <div className="upload-content">
          <div className="upload-icon-wrapper">
            <Upload size={32} className="upload-icon" />
          </div>
          <h3>Drag & Drop Video File</h3>
          <p className="upload-subtitle">
            {multiple ? 'Support multiple MP4, WebM, MOV, or MKV files' : 'Supports MP4, WebM, MOV, MKV, and AVI'}
          </p>
          <div className="upload-browse-badge">
            <Video size={14} />
            <span>Browse Files</span>
          </div>
        </div>
      </div>
      {error && (
        <div className="upload-error animate-fade-in">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};
