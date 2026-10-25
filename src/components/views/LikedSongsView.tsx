import React from 'react';
import { Play, Pause, Heart, Clock } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { TRACKS } from '../../data/mockData';
import { formatTime } from '../../utils/formatTime';

export const LikedSongsView: React.FC = () => {
  const {
    likedTrackIds,
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    toggleLike
  } = usePlayerStore();

  const likedTracks = TRACKS.filter(t => likedTrackIds.includes(t.id));
  const isLikedActive = isPlaying && currentTrack && likedTracks.some(t => t.id === currentTrack.id);

  const handlePlayLiked = () => {
    if (isLikedActive) {
      togglePlay();
    } else if (likedTracks.length > 0) {
      playTrack(likedTracks[0], likedTracks);
    }
  };

  const totalDuration = likedTracks.reduce((acc, t) => acc + t.durationSec, 0);

  return (
    <div className="flex flex-col -m-6 pb-12">
      {/* 1. Purple Gradient Hero Header */}
      <div className="px-8 pt-16 pb-6 flex flex-col sm:flex-row items-end gap-6 bg-gradient-to-b from-[#450af5] to-spotify-base">
        <div className="w-44 h-44 sm:w-56 sm:h-56 rounded-md bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center flex-shrink-0 shadow-2xl">
          <Heart size={80} className="text-white fill-white" />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-white">
            Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-none">
            Liked Songs
          </h1>
          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 mt-2">
            <span>Guest User</span>
            <span>•</span>
            <span>{likedTracks.length} songs,</span>
            <span className="text-white/70">{formatTime(totalDuration)}</span>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="px-8 py-6 bg-spotify-base/40 backdrop-blur-md flex items-center gap-6 sticky top-16 z-20">
        <button
          onClick={handlePlayLiked}
          disabled={likedTracks.length === 0}
          className="w-14 h-14 rounded-full bg-spotify-green hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          title={isLikedActive ? 'Pause' : 'Play'}
        >
          {isLikedActive ? (
            <Pause size={26} className="fill-black" />
          ) : (
            <Play size={26} className="fill-black ml-1" />
          )}
        </button>
      </div>

      {/* 3. Track Table */}
      <div className="px-8 flex flex-col">
        {likedTracks.length > 0 ? (
          <>
            <div className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_120px] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-spotify-subdued uppercase tracking-wider">
              <span>#</span>
              <span>Title</span>
              <span className="hidden sm:inline">Album</span>
              <div className="flex items-center justify-end pr-4">
                <Clock size={16} />
              </div>
            </div>

            <div className="flex flex-col mt-2">
              {likedTracks.map((track, idx) => {
                const isThisPlaying = isPlaying && currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track, likedTracks)}
                    className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_120px] gap-4 items-center px-4 py-2.5 rounded-md hover:bg-white/10 cursor-pointer group transition"
                  >
                    <div className="flex items-center justify-center text-sm font-medium text-spotify-subdued">
                      {isThisPlaying ? (
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="w-1 bg-spotify-green animate-pulse h-full rounded-sm" />
                          <span className="w-1 bg-spotify-green animate-pulse h-2 rounded-sm" />
                          <span className="w-1 bg-spotify-green animate-pulse h-3 rounded-sm" />
                        </div>
                      ) : (
                        <>
                          <span className="group-hover:hidden">{idx + 1}</span>
                          <Play size={14} className="fill-white text-white hidden group-hover:inline ml-0.5" />
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-10 h-10 rounded object-cover flex-shrink-0"
                      />
                      <div className="flex flex-col min-w-0">
                        <span className={`text-sm font-medium truncate ${
                          isThisPlaying ? 'text-spotify-green font-bold' : 'text-white'
                        }`}>
                          {track.title}
                        </span>
                        <span className="text-xs text-spotify-subdued group-hover:text-white truncate">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-spotify-subdued hover:text-white truncate hidden sm:inline">
                      {track.album}
                    </span>

                    <div className="flex items-center justify-end gap-3 pr-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(track.id);
                        }}
                        className="text-spotify-green transition"
                        title="Remove from Liked Songs"
                      >
                        <Heart size={16} className="fill-spotify-green" />
                      </button>

                      <span className="text-xs text-spotify-subdued tabular-nums w-10 text-right">
                        {formatTime(track.durationSec)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-3">
            <Heart size={48} className="text-spotify-subdued" />
            <h3 className="text-2xl font-bold text-white">Songs you like will appear here</h3>
            <p className="text-sm text-spotify-subdued">Save songs by tapping the heart icon.</p>
          </div>
        )}
      </div>
    </div>
  );
};
