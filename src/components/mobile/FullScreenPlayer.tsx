import React, { useState } from 'react';
import {
  ChevronDown,
  MoreVertical,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Heart,
  Laptop2,
  Share2,
  Mic2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';

interface FullScreenPlayerProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDeviceModal: () => void;
}

export const FullScreenPlayer: React.FC<FullScreenPlayerProps> = ({
  isOpen,
  onClose,
  onOpenDeviceModal
}) => {
  const [showLyricsExpanded, setShowLyricsExpanded] = useState(false);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    isShuffle,
    repeatMode,
    likedTrackIds,
    togglePlay,
    seek,
    nextTrack,
    previousTrack,
    toggleShuffle,
    toggleRepeat,
    toggleLike
  } = usePlayerStore();

  if (!isOpen || !currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const percent = parseFloat(e.target.value);
    seek((percent / 100) * duration);
  };

  return (
    <div
      className="md:hidden fixed inset-0 z-50 flex flex-col justify-between p-6 select-none animate-in slide-in-from-bottom duration-300 overflow-y-auto"
      style={{
        background: `linear-gradient(to bottom, ${currentTrack.dominantColor || '#333'} 0%, #0a0a0a 100%)`
      }}
    >
      {/* 1. Header Row */}
      <div className="flex items-center justify-between text-white/90 pt-[env(safe-area-inset-top)]">
        <button
          onClick={onClose}
          className="p-2 -ml-2 text-white/80 hover:text-white"
          title="Collapse"
        >
          <ChevronDown size={28} />
        </button>

        <div className="flex flex-col items-center">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/70">
            Playing From Playlist
          </span>
          <span className="text-xs font-bold text-white truncate max-w-[200px]">
            {currentTrack.album}
          </span>
        </div>

        <button className="p-2 -mr-2 text-white/80 hover:text-white" title="More options">
          <MoreVertical size={22} />
        </button>
      </div>

      {/* 2. Artwork */}
      <div className="my-auto py-4 flex items-center justify-center">
        <div className="w-[78vw] max-w-[340px] aspect-square rounded-xl overflow-hidden shadow-2xl">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* 3. Title, Artist & Like */}
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col min-w-0 mr-4">
            <h2 className="text-2xl font-extrabold text-white truncate leading-tight">
              {currentTrack.title}
            </h2>
            <p className="text-base text-white/70 truncate mt-1">
              {currentTrack.artist}
            </p>
          </div>

          <button
            onClick={() => toggleLike(currentTrack.id)}
            className="p-2 text-white/80 hover:text-white active:scale-90 transition flex-shrink-0"
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart
              size={26}
              className={isLiked ? 'text-spotify-green fill-spotify-green' : ''}
            />
          </button>
        </div>

        {/* 4. Scrubber & Timestamps */}
        <div className="flex flex-col gap-1">
          <div className="relative flex items-center py-2">
            <div className="w-full h-1 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-150"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPercent || 0}
              onChange={handleSeek}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-semibold text-white/70 tabular-nums">
            <span>{formatTime(currentTime)}</span>
            <span>-{formatTime(Math.max(0, duration - currentTime))}</span>
          </div>
        </div>

        {/* 5. Transport Controls */}
        <div className="flex items-center justify-between px-2">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`relative p-2 transition ${
              isShuffle ? 'text-spotify-green' : 'text-white/70 hover:text-white'
            }`}
          >
            <Shuffle size={22} />
            {isShuffle && (
              <span className="w-1.5 h-1.5 rounded-full bg-spotify-green absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Previous */}
          <button
            onClick={previousTrack}
            className="text-white hover:scale-105 active:scale-95 p-2 transition"
          >
            <SkipBack size={30} className="fill-current" />
          </button>

          {/* Large Play/Pause */}
          <button
            onClick={togglePlay}
            className="w-16 h-16 rounded-full bg-white flex items-center justify-center text-black shadow-xl hover:scale-105 active:scale-95 transition"
          >
            {isPlaying ? (
              <Pause size={28} className="fill-black" />
            ) : (
              <Play size={28} className="fill-black ml-1" />
            )}
          </button>

          {/* Next */}
          <button
            onClick={nextTrack}
            className="text-white hover:scale-105 active:scale-95 p-2 transition"
          >
            <SkipForward size={30} className="fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`relative p-2 transition ${
              repeatMode !== 'off' ? 'text-spotify-green' : 'text-white/70 hover:text-white'
            }`}
          >
            {repeatMode === 'one' ? <Repeat1 size={22} /> : <Repeat size={22} />}
            {repeatMode !== 'off' && (
              <span className="w-1.5 h-1.5 rounded-full bg-spotify-green absolute bottom-0 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* 6. Footer Toolbar & Synced Lyrics Peek */}
        <div className="flex items-center justify-between text-white/70 pt-2 pb-[env(safe-area-inset-bottom)]">
          <button onClick={onOpenDeviceModal} className="hover:text-white p-2">
            <Laptop2 size={20} />
          </button>
          <button
            onClick={() => setShowLyricsExpanded(!showLyricsExpanded)}
            className="hover:text-white p-2 flex items-center gap-1.5 text-xs font-bold"
          >
            <Mic2 size={18} className={showLyricsExpanded ? 'text-spotify-green' : ''} />
            <span>Lyrics</span>
          </button>
          <button className="hover:text-white p-2">
            <Share2 size={20} />
          </button>
        </div>

        {/* 7. Expandable Lyrics Sheet (Mobile) */}
        {showLyricsExpanded && (
          <div className="bg-black/60 backdrop-blur-xl rounded-2xl p-5 border border-white/10 mt-2 max-h-60 overflow-y-auto flex flex-col gap-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="font-bold text-sm text-white">Lyrics</span>
              <button
                onClick={() => setShowLyricsExpanded(false)}
                className="text-xs text-white/70 hover:text-white font-semibold"
              >
                Close
              </button>
            </div>
            {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
              currentTrack.lyrics.map((line, idx) => {
                const currentMs = currentTime * 1000;
                const nextLine = currentTrack.lyrics![idx + 1];
                const isActive = currentMs >= line.timeMs && (!nextLine || currentMs < nextLine.timeMs);

                return (
                  <p
                    key={idx}
                    onClick={() => seek(line.timeMs / 1000)}
                    className={`text-lg font-bold leading-relaxed cursor-pointer transition ${
                      isActive ? 'text-white scale-[1.02] origin-left' : 'text-white/30'
                    }`}
                  >
                    {line.text}
                  </p>
                );
              })
            ) : (
              <p className="text-sm text-white/50">Lyrics not available for this track.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
