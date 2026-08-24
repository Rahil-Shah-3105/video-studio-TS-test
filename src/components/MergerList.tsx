import React, { useState } from 'react';
const logger = console;
import { Trash2, Plus, Film, GripVertical } from 'lucide-react';
import { VideoFile } from '../types';
import { formatDuration, formatBytes } from './VideoPlayer';

interface MergerListProps {
  files: VideoFile[];
  onReorder: (files: VideoFile[]) => void;
  onRemove: (id: string) => void;
  onAddMore: () => void;
}

export const MergerList: React.FC<MergerListProps> = ({
  files,
  onReorder,
  onRemove,
  onAddMore,
}) => {
logger.debug(`>>> Entering MergerList(files=${files},onReorder=${onReorder},onRemove=${onRemove},onAddMore=${onAddMore})`);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
	logger.debug(`>>> Entering handleDragStart(e=${e},index=${index})`);
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
    
    // Create ghost image or class effect
    const target = e.currentTarget as HTMLElement;
    target.classList.add('is-dragging');
	logger.debug(`<<< Exiting handleDragStart(e=${e},index=${index})`);
  };

  const handleDragEnd = (e: React.DragEvent) => {
	logger.debug(`>>> Entering handleDragEnd(e=${e})`);
    const target = e.currentTarget as HTMLElement;
    target.classList.remove('is-dragging');
    setDraggedIdx(null);
	logger.debug(`<<< Exiting handleDragEnd(e=${e})`);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
	logger.debug(`>>> Entering handleDragOver(e=${e},index=${index})`);
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
	logger.debug(`<<< Exiting handleDragOver(e=${e},index=${index})`);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
	logger.debug(`>>> Entering handleDrop(e=${e},index=${index})`);
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;

    const nextFiles = [...files];
    const itemToMove = nextFiles[draggedIdx];
    
    // Remove from original place and insert at target
    nextFiles.splice(draggedIdx, 1);
    nextFiles.splice(index, 0, itemToMove);

    onReorder(nextFiles);
	logger.debug(`<<< Exiting handleDrop(e=${e},index=${index})`);
  };

  const totalDuration = files.reduce((acc, f) => acc + (f.duration || 0), 0);
logger.debug(`MergerList(files=${files},onReorder=${onReorder},onRemove=${onRemove},onAddMore=${onAddMore}): totalDuration → ${totalDuration}`);
  const totalSize = files.reduce((acc, f) => acc + (f.size || 0), 0);
logger.debug(`MergerList(files=${files},onReorder=${onReorder},onRemove=${onRemove},onAddMore=${onAddMore}): totalSize → ${totalSize}`);

  return (
    <div className="merger-list-component">
      <div className="merger-header-row">
        <div className="timeline-title-wrapper">
          <Film size={14} className="accent-color-text" />
          <span className="timeline-heading">Video Merge Queue ({files.length})</span>
        </div>
        <button className="add-more-btn" onClick={onAddMore}>
          <Plus size={14} />
          <span>Add Video</span>
        </button>
      </div>

      <div className="merger-files-queue">
        {files.length === 0 ? (
          <div className="queue-empty-text">Queue is empty. Click "Add Video" to upload files to merge.</div>
        ) : (
          files.map((file, idx) => (
            <div
              key={file.id}
              className={`queue-item-card draggable-card ${draggedIdx === idx ? 'ghost-card' : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
            >
              <div className="drag-handle-wrapper">
                <GripVertical size={16} className="drag-grip-icon" />
              </div>
              <span className="queue-badge-idx">{idx + 1}</span>
              <div className="queue-item-meta">
                <span className="queue-item-name text-ellipsis" title={file.name}>
                  {file.name}
                </span>
                <div className="queue-item-submeta">
                  <span>{file.width}x{file.height}</span>
                  <span>•</span>
                  <span>{formatDuration(file.duration)}</span>
                  <span>•</span>
                  <span>{formatBytes(file.size)}</span>
                </div>
              </div>
              <div className="queue-item-actions">
                <button
                  className="action-icon-btn delete-btn"
                  onClick={() => onRemove(file.id)}
                  title="Remove Video"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="merger-summary-box">
        <div className="summary-col">
          <span className="summary-label">Final Estimated Duration</span>
          <span className="summary-value">{formatDuration(totalDuration)}</span>
        </div>
        <div className="summary-col">
          <span className="summary-label">Total Input Size</span>
          <span className="summary-value">{formatBytes(totalSize)}</span>
        </div>
      </div>
    </div>
  );
logger.debug(`<<< Exiting MergerList(files=${files},onReorder=${onReorder},onRemove=${onRemove},onAddMore=${onAddMore})`);
};
