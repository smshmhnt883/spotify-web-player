import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface MobileMiniPlayerProps {
  onOpenFullScreen: () => void;
}

export const MobileMiniPlayer: React.FC<MobileMiniPlayerProps> = ({ onOpenFullScreen }) => {
  const {
    currentTrack,
    isPlaying,
    currentTime,
    duration,
    likedTrackIds,
    togglePlay,
    toggleLike
  } = usePlayerStore();

  if (!currentTrack) return null;

  const isLiked = likedTrackIds.includes(currentTrack.id);
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      onClick={onOpenFullScreen}
      className="md:hidden fixed bottom-[68px] left-2 right-2 h-14 bg-spotify-elevated/95 backdrop-blur-md border border-white/10 rounded-lg flex items-center justify-between px-3 z-40 shadow-xl cursor-pointer select-none active:scale-[0.99] transition-transform"
      style={{
        backgroundColor: currentTrack.dominantColor ? `${currentTrack.dominantColor}33` : undefined
      }}
    >
      {/* Mini Progress Bar at bottom of card */}
      <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-white/20 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full transition-all duration-200"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Left: Thumbnail & Song Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1 mr-2">
        <img
          src={currentTrack.coverUrl}
          alt={currentTrack.title}
          className="w-10 h-10 rounded-md object-cover flex-shrink-0 shadow-md"
        />
        <div className="flex flex-col min-w-0">
          <span className="text-xs font-bold text-white truncate">
            {currentTrack.title}
          </span>
          <span className="text-[11px] text-white/70 truncate">
            {currentTrack.artist}
          </span>
        </div>
      </div>

      {/* Right: Like & Play/Pause */}
      <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => toggleLike(currentTrack.id)}
          className="text-white/80 hover:text-white p-1 transition"
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart
            size={18}
            className={isLiked ? 'text-spotify-green fill-spotify-green' : ''}
          />
        </button>

        <button
          onClick={togglePlay}
          className="text-white hover:scale-105 active:scale-95 p-1 transition"
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <Pause size={22} className="fill-white" />
          ) : (
            <Play size={22} className="fill-white ml-0.5" />
          )}
        </button>
      </div>
    </div>
  );
};
