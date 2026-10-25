import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Volume1,
  Heart,
  Mic2,
  ListMusic,
  Laptop2,
  Maximize2,
  Minimize2,
  PictureInPicture2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';

interface NowPlayingBarProps {
  onOpenDeviceModal: () => void;
}

export const NowPlayingBar: React.FC<NowPlayingBarProps> = ({ onOpenDeviceModal }) => {
  const [isHoveringTimeline, setIsHoveringTimeline] = useState(false);
  const [isHoveringVolume, setIsHoveringVolume] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isShuffle,
    repeatMode,
    likedTrackIds,
    activeDrawer,
    togglePlay,
    seek,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    toggleDrawer
  } = usePlayerStore();

  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPercent = parseFloat(e.target.value);
    const newTime = (newPercent / 100) * duration;
    seek(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value) / 100;
    setVolume(newVol);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  if (!currentTrack) return null;

  return (
    <footer className="h-[76px] lg:h-[84px] bg-spotify-black border-t border-[#282828] px-4 flex items-center justify-between select-none fixed bottom-0 left-0 right-0 z-50">
      {/* 1. LEFT SECTOR: Track Information (width 30%, min-width 180px) */}
      <div className="w-[30%] min-w-[180px] flex items-center gap-3.5">
        <div className="relative group flex-shrink-0">
          <img
            src={currentTrack.coverUrl}
            alt={currentTrack.title}
            className="w-14 h-14 rounded-md object-cover shadow-md"
          />
          <button 
            onClick={() => toggleDrawer('nowPlaying')}
            className="absolute inset-0 bg-black/40 rounded-md opacity-0 group-hover:opacity-100 flex items-center justify-center transition text-white"
            title="Expand artwork"
          >
            <PictureInPicture2 size={18} />
          </button>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-white hover:underline cursor-pointer truncate">
            {currentTrack.title}
          </span>
          <span className="text-xs text-spotify-subdued hover:underline hover:text-white cursor-pointer truncate">
            {currentTrack.artist}
          </span>
        </div>

        <button
          onClick={() => toggleLike(currentTrack.id)}
          className="text-spotify-subdued hover:scale-110 active:scale-95 transition ml-1"
          title={isLiked ? 'Remove from Liked Songs' : 'Save to Liked Songs'}
        >
          <Heart
            size={18}
            className={isLiked ? 'text-spotify-green fill-spotify-green' : 'hover:text-white'}
          />
        </button>
      </div>

      {/* 2. CENTER SECTOR: Transport Controls & Scrubber (width 40%, max 722px) */}
      <div className="w-[40%] max-w-[722px] flex flex-col items-center gap-1.5">
        {/* Buttons Row */}
        <div className="flex items-center gap-5">
          {/* Shuffle */}
          <button
            onClick={toggleShuffle}
            className={`relative p-1 transition ${
              isShuffle ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'
            }`}
            title={isShuffle ? 'Disable shuffle' : 'Enable shuffle'}
          >
            <Shuffle size={18} />
            {isShuffle && (
              <span className="w-1 h-1 rounded-full bg-spotify-green absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </button>

          {/* Previous Track */}
          <button
            onClick={previousTrack}
            className="text-spotify-subdued hover:text-white transition active:scale-95"
            title="Previous (Ctrl+Left)"
          >
            <SkipBack size={20} className="fill-current" />
          </button>

          {/* Play/Pause Button */}
          <button
            onClick={togglePlay}
            className="w-8 h-8 rounded-full bg-white hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-md transition"
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <Pause size={18} className="fill-black" />
            ) : (
              <Play size={18} className="fill-black ml-0.5" />
            )}
          </button>

          {/* Next Track */}
          <button
            onClick={nextTrack}
            className="text-spotify-subdued hover:text-white transition active:scale-95"
            title="Next (Ctrl+Right)"
          >
            <SkipForward size={20} className="fill-current" />
          </button>

          {/* Repeat */}
          <button
            onClick={toggleRepeat}
            className={`relative p-1 transition ${
              repeatMode !== 'off' ? 'text-spotify-green' : 'text-spotify-subdued hover:text-white'
            }`}
            title={`Repeat mode: ${repeatMode}`}
          >
            {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
            {repeatMode !== 'off' && (
              <span className="w-1 h-1 rounded-full bg-spotify-green absolute -bottom-1 left-1/2 -translate-x-1/2" />
            )}
          </button>
        </div>

        {/* Timeline Scrubber Row */}
        <div className="w-full flex items-center gap-2">
          <span className="text-[11px] text-spotify-subdued tabular-nums w-10 text-right">
            {formatTime(currentTime)}
          </span>

          <div
            className="relative flex-1 flex items-center cursor-pointer group py-1"
            onMouseEnter={() => setIsHoveringTimeline(true)}
            onMouseLeave={() => setIsHoveringTimeline(false)}
          >
            {/* Background Track */}
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              {/* Active Fill Track */}
              <div
                className={`h-full rounded-full transition-colors ${
                  isHoveringTimeline ? 'bg-spotify-green' : 'bg-white'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Range Input Overlay for scrubbing */}
            <input
              type="range"
              min={0}
              max={100}
              step={0.1}
              value={progressPercent || 0}
              onChange={handleSeekChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />

            {/* Slider Thumb Circle on Hover */}
            {isHoveringTimeline && (
              <div
                className="w-3 h-3 bg-white rounded-full absolute pointer-events-none shadow-md -translate-x-1/2"
                style={{ left: `${progressPercent}%` }}
              />
            )}
          </div>

          <span className="text-[11px] text-spotify-subdued tabular-nums w-10 text-left">
            {formatTime(duration)}
          </span>
        </div>
      </div>

      {/* 3. RIGHT SECTOR: Quick Actions & Volume (width 30%, min-width 180px) */}
      <div className="w-[30%] min-w-[180px] flex items-center justify-end gap-3.5 text-spotify-subdued">
        {/* Synced Lyrics Toggle */}
        <button
          onClick={() => toggleDrawer('lyrics')}
          className={`relative p-1 hover:text-white transition ${
            activeDrawer === 'lyrics' ? 'text-spotify-green' : ''
          }`}
          title="Lyrics (L)"
        >
          <Mic2 size={18} />
          {activeDrawer === 'lyrics' && (
            <span className="w-1 h-1 rounded-full bg-spotify-green absolute -bottom-1 left-1/2 -translate-x-1/2" />
          )}
        </button>

        {/* Queue Toggle */}
        <button
          onClick={() => toggleDrawer('queue')}
          className={`relative p-1 hover:text-white transition ${
            activeDrawer === 'queue' ? 'text-spotify-green' : ''
          }`}
          title="Queue (Q)"
        >
          <ListMusic size={18} />
          {activeDrawer === 'queue' && (
            <span className="w-1 h-1 rounded-full bg-spotify-green absolute -bottom-1 left-1/2 -translate-x-1/2" />
          )}
        </button>

        {/* Connect to a Device */}
        <button
          onClick={onOpenDeviceModal}
          className="hover:text-white transition"
          title="Connect to a device"
        >
          <Laptop2 size={18} />
        </button>

        {/* Volume Slider with Mute Toggle */}
        <div 
          className="flex items-center gap-2 w-28 group"
          onMouseEnter={() => setIsHoveringVolume(true)}
          onMouseLeave={() => setIsHoveringVolume(false)}
        >
          <button onClick={toggleMute} className="hover:text-white transition">
            {isMuted || volume === 0 ? (
              <VolumeX size={18} />
            ) : volume < 0.5 ? (
              <Volume1 size={18} />
            ) : (
              <Volume2 size={18} />
            )}
          </button>

          <div className="relative flex-1 flex items-center py-1">
            <div className="w-full h-1 bg-[#4d4d4d] rounded-full overflow-hidden relative">
              <div
                className={`h-full rounded-full transition-colors ${
                  isHoveringVolume ? 'bg-spotify-green' : 'bg-white'
                }`}
                style={{ width: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={(isMuted ? 0 : volume) * 100}
              onChange={handleVolumeChange}
              className="absolute inset-0 opacity-0 cursor-pointer w-full"
            />
            {isHoveringVolume && (
              <div
                className="w-3 h-3 bg-white rounded-full absolute pointer-events-none shadow -translate-x-1/2"
                style={{ left: `${(isMuted ? 0 : volume) * 100}%` }}
              />
            )}
          </div>
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={toggleFullscreen}
          className="hover:text-white transition ml-1"
          title="Fullscreen"
        >
          {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
        </button>
      </div>
    </footer>
  );
};
