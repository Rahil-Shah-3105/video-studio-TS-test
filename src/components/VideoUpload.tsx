import React, { useRef, useState } from 'react';
const logger = console;
import { Upload, Video, AlertCircle } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoUploadProps {
  onUpload: (files: VideoFile[]) => void;
  multiple?: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, multiple = false }) => {
logger.debug(`>>> Entering VideoUpload(onUpload=${onUpload},multiple=${multiple})`);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
logger.debug(`VideoUpload(onUpload=${onUpload},multiple=${multiple}): fileInputRef → ${fileInputRef}`);
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = (file: File): Promise<{ duration: number; width: number; height: number }> => {
	logger.debug(`>>> Entering extractMetadata(file=${file})`);
	logger.debug(`<<< Exiting extractMetadata(file=${file})`);
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
	logger.debug(`>>> Entering processFiles(fileList=${fileList})`);
    if (!fileList) return;
    setError(null);

    const validFiles: VideoFile[] = [];
    const filesArray = Array.from(fileList);
	logger.debug(`processFiles(fileList=${fileList}): filesArray → ${filesArray}`);

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

	logger.debug(`processFiles(fileList=${fileList}): meta → ${meta}`);
      if (!multiple) break; // If single upload, stop at first video
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
	logger.debug(`<<< Exiting processFiles(fileList=${fileList})`);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
	logger.debug(`>>> Entering handleDragOver(e=${e})`);
    e.preventDefault();
    setIsDragOver(true);
	logger.debug(`<<< Exiting handleDragOver(e=${e})`);
  };

  const handleDragLeave = () => {
	logger.debug('>>> Entering handleDragLeave()');
    setIsDragOver(false);
	logger.debug('<<< Exiting handleDragLeave()');
  };

  const handleDrop = async (e: React.DragEvent) => {
	logger.debug(`>>> Entering handleDrop(e=${e})`);
    e.preventDefault();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
	logger.debug(`<<< Exiting handleDrop(e=${e})`);
  };

  const handleClick = () => {
	logger.debug('>>> Entering handleClick()');
    fileInputRef.current?.click();
	logger.debug('<<< Exiting handleClick()');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
	logger.debug(`>>> Entering handleFileChange(e=${e})`);
    await processFiles(e.target.files);
	logger.debug(`<<< Exiting handleFileChange(e=${e})`);
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
logger.debug(`<<< Exiting VideoUpload(onUpload=${onUpload},multiple=${multiple})`);
};
