import React, { useState, useRef } from 'react';
import { X, Upload, Music, CheckCircle2 } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Track } from '../../types';

interface UploadMusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UploadMusicModal: React.FC<UploadMusicModalProps> = ({ isOpen, onClose }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<{ name: string; status: 'pending' | 'success' }[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const folderInputRef = useRef<HTMLInputElement | null>(null);

  const { addToQueue, playTrack } = usePlayerStore();

  if (!isOpen) return null;

  const processAudioFiles = (files: FileList | File[]) => {
    const audioFiles = Array.from(files).filter(f => f.type.startsWith('audio/') || f.name.match(/\.(mp3|m4a|wav|flac|ogg)$/i));

    if (audioFiles.length === 0) return;

    setUploadingFiles(audioFiles.map(f => ({ name: f.name, status: 'pending' })));

    audioFiles.forEach((file, index) => {
      // 1. Create local playable stream URL
      const audioUrl = URL.createObjectURL(file);

      // 2. Derive Artist & Title from filename
      let title = file.name.replace(/\.[^/.]+$/, '');
      let artist = 'Local Artist';

      if (title.includes(' - ')) {
        const parts = title.split(' - ');
        artist = parts[0].trim();
        title = parts.slice(1).join(' - ').trim();
      }

      // Default gradients
      const colors = ['#450af5', '#be123c', '#047857', '#d97706', '#0284c7'];
      const dominantColor = colors[index % colors.length];

      const newTrack: Track = {
        id: `upload-${Date.now()}-${index}`,
        title,
        artist,
        album: 'My Uploads',
        durationSec: 180,
        audioUrl,
        coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
        dominantColor,
        lyrics: [
          { timeMs: 0, text: `♪ Playing ${title} ♪` }
        ]
      };

      // Add to state store
      addToQueue(newTrack);

      // Update upload status
      setTimeout(() => {
        setUploadingFiles(prev => prev.map(p => p.name === file.name ? { ...p, status: 'success' } : p));
      }, 300);

      if (index === 0) {
        playTrack(newTrack);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processAudioFiles(e.dataTransfer.files);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-spotify-card border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl flex flex-col gap-5 select-none animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Upload size={22} className="text-spotify-green" />
            <h2 className="text-xl font-bold text-white">Upload Music to Your Player</h2>
          </div>
          <button
            onClick={onClose}
            className="text-spotify-subdued hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          >
            <X size={20} />
          </button>
        </div>

        <p className="text-xs text-spotify-subdued leading-relaxed">
          Select or drag-and-drop downloaded audio files (<code className="text-white">.mp3</code>, <code className="text-white">.m4a</code>, <code className="text-white">.flac</code>, <code className="text-white">.wav</code>) or entire folders from your computer to stream on all devices.
        </p>

        {/* Drag & Drop Target Box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition ${
            isDragging
              ? 'border-spotify-green bg-spotify-green/10'
              : 'border-white/20 hover:border-white/40 bg-spotify-elevated/40'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-spotify-elevated flex items-center justify-center text-spotify-subdued">
            <Music size={28} className={isDragging ? 'text-spotify-green' : ''} />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-white">
              Drop songs here, or <span className="text-spotify-green hover:underline">browse files</span>
            </p>
            <p className="text-xs text-spotify-subdued mt-1">Supports MP3, M4A, WAV, FLAC</p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="audio/*,.mp3,.m4a,.flac,.wav,.ogg"
            onChange={(e) => e.target.files && processAudioFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Folder Upload Alternative */}
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-spotify-subdued">Have a music folder?</span>
          <button
            onClick={() => folderInputRef.current?.click()}
            className="text-xs font-bold text-spotify-green hover:underline flex items-center gap-1"
          >
            Upload entire folder
          </button>
          <input
            ref={folderInputRef}
            type="file"
            // @ts-ignore
            webkitdirectory="true"
            directory="true"
            multiple
            onChange={(e) => e.target.files && processAudioFiles(e.target.files)}
            className="hidden"
          />
        </div>

        {/* Processed Status List */}
        {uploadingFiles.length > 0 && (
          <div className="max-h-40 overflow-y-auto flex flex-col gap-2 pt-2 border-t border-white/10">
            {uploadingFiles.map((file, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs px-2 py-1.5 rounded bg-white/5">
                <span className="text-white truncate max-w-[280px]">{file.name}</span>
                {file.status === 'success' ? (
                  <span className="text-spotify-green flex items-center gap-1 font-semibold">
                    <CheckCircle2 size={14} /> Ready
                  </span>
                ) : (
                  <span className="text-spotify-subdued animate-pulse">Loading...</span>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-bold bg-white text-black hover:scale-105 active:scale-95 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
