import React, { useRef, useState } from 'react';
const logger = console;
import { Upload, Video, AlertCircle } from 'lucide-react';
import { VideoFile } from '../types';

interface VideoUploadProps {
  onUpload: (files: VideoFile[]) => void;
  multiple?: boolean;
}

export const VideoUpload: React.FC<VideoUploadProps> = ({ onUpload, multiple = false }) => {
logger.error(`>>> Entering VideoUpload(multiple=${multiple})`, { "event.action": "VideoUpload", "logrite.multiple": multiple });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);
logger.error(`VideoUpload(multiple=${multiple}): fileInputRef → ${fileInputRef}`, { "event.action": "VideoUpload", "logrite.multiple": multiple });
logger.debug(`VideoUpload: isDragOver → ${isDragOver}`, { "event.action": "VideoUpload", "logrite.multiple": multiple });
  const [error, setError] = useState<string | null>(null);

  const extractMetadata = (file: File): Promise<{ duration: number; width: number; height: number }> => {
	logger.error(`>>> Entering extractMetadata(file=${file})`, { "event.action": "extractMetadata", "logrite.file": file });
	logger.warn(`<<< Exiting extractMetadata(file=${file})`, { "event.action": "extractMetadata", "logrite.file": file });
    return new Promise((resolve) => {
      const video = document.createElement('video');
	logger.debug(`extractMetadata(file=${file}): video.src → ${video.src}`, { "event.action": "extractMetadata", "logrite.file": file });
      video.preload = 'metadata';
	logger.debug(`extractMetadata(file=${file}): video.preload → ${video.preload}`, { "event.action": "extractMetadata", "logrite.file": file });
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
	logger.error(`>>> Entering processFiles(fileList=${fileList})`, { "event.action": "processFiles", "logrite.fileList": fileList });
    if (!fileList) return;
    setError(null);

    const validFiles: VideoFile[] = [];
    const filesArray = Array.from(fileList);
	logger.error(`processFiles(fileList=${fileList}): filesArray → ${filesArray}`, { "event.action": "processFiles", "logrite.fileList": fileList });

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

	logger.error(`processFiles(fileList=${fileList}): meta → ${meta}`, { "event.action": "processFiles", "logrite.fileList": fileList });
      if (!multiple) break; // If single upload, stop at first video
    }

    if (validFiles.length > 0) {
      onUpload(validFiles);
	logger.warn(`<<< Exiting processFiles(fileList=${fileList})`, { "event.action": "processFiles", "logrite.fileList": fileList });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
	logger.error(`>>> Entering handleDragOver(e=${e})`, { "event.action": "handleDragOver", "logrite.e": e });
    e.preventDefault();
    setIsDragOver(true);
	logger.warn(`<<< Exiting handleDragOver(e=${e})`, { "event.action": "handleDragOver", "logrite.e": e });
  };

  const handleDragLeave = () => {
	logger.error('>>> Entering handleDragLeave()', { "event.action": "handleDragLeave" });
    setIsDragOver(false);
	logger.warn('<<< Exiting handleDragLeave()', { "event.action": "handleDragLeave" });
  };

  const handleDrop = async (e: React.DragEvent) => {
	logger.error(`>>> Entering handleDrop(e=${e})`, { "event.action": "handleDrop", "logrite.e": e });
    e.preventDefault();
    setIsDragOver(false);
    await processFiles(e.dataTransfer.files);
	logger.warn(`<<< Exiting handleDrop(e=${e})`, { "event.action": "handleDrop", "logrite.e": e });
  };

  const handleClick = () => {
	logger.error('>>> Entering handleClick()', { "event.action": "handleClick" });
    fileInputRef.current?.click();
	logger.warn('<<< Exiting handleClick()', { "event.action": "handleClick" });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
	logger.error(`>>> Entering handleFileChange(e=${e})`, { "event.action": "handleFileChange", "logrite.e": e });
    await processFiles(e.target.files);
	logger.warn(`<<< Exiting handleFileChange(e=${e})`, { "event.action": "handleFileChange", "logrite.e": e });
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
logger.warn(`<<< Exiting VideoUpload(multiple=${multiple})`, { "event.action": "VideoUpload", "logrite.multiple": multiple });
};
