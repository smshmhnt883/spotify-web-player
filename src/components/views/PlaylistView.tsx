import React from 'react';
import { Play, Pause, Heart, Clock, MoreHorizontal, Plus } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { PLAYLISTS } from '../../data/mockData';
import { formatTime } from '../../utils/formatTime';

interface PlaylistViewProps {
  playlistId: string | null;
}

export const PlaylistView: React.FC<PlaylistViewProps> = ({ playlistId }) => {
  const {
    currentTrack,
    isPlaying,
    likedTrackIds,
    playTrack,
    togglePlay,
    toggleLike,
    addToQueue
  } = usePlayerStore();

  const playlist = PLAYLISTS.find(p => p.id === playlistId) || PLAYLISTS[0];
  const isPlaylistActive = isPlaying && currentTrack && playlist.tracks.some(t => t.id === currentTrack.id);

  const handlePlaylistPlay = () => {
    if (isPlaylistActive) {
      togglePlay();
    } else if (playlist.tracks.length > 0) {
      playTrack(playlist.tracks[0], playlist.tracks);
    }
  };

  const totalDurationSec = playlist.tracks.reduce((acc, t) => acc + t.durationSec, 0);

  return (
    <div className="flex flex-col -m-6 pb-12">
      {/* 1. Dynamic Hero Header with Color Gradient */}
      <div 
        className="px-8 pt-16 pb-6 flex flex-col sm:flex-row items-end gap-6 transition-colors duration-500"
        style={{
          background: `linear-gradient(to bottom, ${playlist.dominantColor} 0%, rgba(18, 18, 18, 0.9) 100%)`
        }}
      >
        <img
          src={playlist.coverUrl}
          alt={playlist.title}
          className="w-44 h-44 sm:w-56 sm:h-56 rounded-md shadow-2xl object-cover flex-shrink-0"
        />

        <div className="flex flex-col gap-2">
          <span className="text-xs uppercase font-extrabold tracking-wider text-white">
            Public Playlist
          </span>
          <h1 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-white tracking-tight leading-none line-clamp-2">
            {playlist.title}
          </h1>
          <p className="text-sm text-white/80 line-clamp-2 mt-2 font-medium">
            {playlist.description}
          </p>

          <div className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-white/90 mt-2">
            <span className="hover:underline cursor-pointer">{playlist.creator}</span>
            <span>•</span>
            <span>{playlist.tracks.length} songs,</span>
            <span className="text-white/70">{formatTime(totalDurationSec)}</span>
          </div>
        </div>
      </div>

      {/* 2. Action Bar */}
      <div className="px-8 py-6 bg-spotify-base/40 backdrop-blur-md flex items-center gap-6 sticky top-16 z-20">
        <button
          onClick={handlePlaylistPlay}
          className="w-14 h-14 rounded-full bg-spotify-green hover:scale-105 active:scale-95 flex items-center justify-center text-black shadow-xl transition"
          title={isPlaylistActive ? 'Pause' : 'Play'}
        >
          {isPlaylistActive ? (
            <Pause size={26} className="fill-black" />
          ) : (
            <Play size={26} className="fill-black ml-1" />
          )}
        </button>

        <button className="text-spotify-subdued hover:text-white transition" title="Save to Your Library">
          <Heart size={32} />
        </button>

        <button className="text-spotify-subdued hover:text-white transition" title="More options">
          <MoreHorizontal size={28} />
        </button>
      </div>

      {/* 3. Track Table */}
      <div className="px-8 flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_120px] gap-4 px-4 py-2 border-b border-white/10 text-xs font-semibold text-spotify-subdued uppercase tracking-wider">
          <span>#</span>
          <span>Title</span>
          <span className="hidden sm:inline">Album</span>
          <div className="flex items-center justify-end pr-4">
            <Clock size={16} />
          </div>
        </div>

        {/* Track Rows */}
        <div className="flex flex-col mt-2">
          {playlist.tracks.map((track, idx) => {
            const isThisPlaying = isPlaying && currentTrack?.id === track.id;
            const isLiked = likedTrackIds.includes(track.id);

            return (
              <div
                key={track.id}
                onClick={() => playTrack(track, playlist.tracks)}
                className="grid grid-cols-[16px_1fr_120px] sm:grid-cols-[16px_1fr_1fr_120px] gap-4 items-center px-4 py-2.5 rounded-md hover:bg-white/10 cursor-pointer group transition"
              >
                {/* Index / Play Trigger / Equalizer */}
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

                {/* Title & Artist */}
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

                {/* Album */}
                <span className="text-xs text-spotify-subdued hover:text-white truncate hidden sm:inline">
                  {track.album}
                </span>

                {/* Actions & Duration */}
                <div className="flex items-center justify-end gap-3 pr-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      addToQueue(track);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-spotify-subdued hover:text-white transition p-1"
                    title="Add to queue"
                  >
                    <Plus size={16} />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleLike(track.id);
                    }}
                    className={`transition ${
                      isLiked ? 'opacity-100 text-spotify-green' : 'opacity-0 group-hover:opacity-100 text-spotify-subdued hover:text-white'
                    }`}
                    title={isLiked ? 'Liked' : 'Like'}
                  >
                    <Heart size={16} className={isLiked ? 'fill-spotify-green' : ''} />
                  </button>

                  <span className="text-xs text-spotify-subdued tabular-nums w-10 text-right">
                    {formatTime(track.durationSec)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
