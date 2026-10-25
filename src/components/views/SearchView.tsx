import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { CATEGORIES, TRACKS, PLAYLISTS } from '../../data/mockData';
import { formatTime } from '../../utils/formatTime';

export const SearchView: React.FC = () => {
  const {
    searchQuery,
    currentTrack,
    isPlaying,
    likedTrackIds,
    playTrack,
    togglePlay,
    toggleLike,
    navigateTo
  } = usePlayerStore();

  const filteredTracks = searchQuery.trim()
    ? TRACKS.filter(t => 
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.album.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const topResult = filteredTracks[0];

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* 1. If Searching */}
      {searchQuery.trim() ? (
        <div className="flex flex-col gap-6">
          {topResult ? (
            <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6">
              {/* Top Result Card */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-white">Top result</h2>
                <div 
                  onClick={() => playTrack(topResult, filteredTracks)}
                  className="p-5 rounded-lg bg-spotify-card hover:bg-spotify-card-hover cursor-pointer group flex flex-col gap-4 relative transition duration-300"
                >
                  <img
                    src={topResult.coverUrl}
                    alt={topResult.title}
                    className="w-24 h-24 rounded-md shadow-xl object-cover"
                  />
                  <div>
                    <h3 className="text-2xl font-extrabold text-white truncate">
                      {topResult.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-spotify-subdued mt-1">
                      <span className="font-semibold text-white hover:underline">{topResult.artist}</span>
                      <span className="px-2 py-0.5 rounded-full text-xs bg-black/60 text-white font-bold uppercase tracking-wider">
                        Song
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlaying && currentTrack?.id === topResult.id) togglePlay();
                      else playTrack(topResult, filteredTracks);
                    }}
                    className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-xl absolute bottom-5 right-5 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 transition-all duration-300"
                    title="Play"
                  >
                    {isPlaying && currentTrack?.id === topResult.id ? (
                      <Pause size={22} className="fill-black" />
                    ) : (
                      <Play size={22} className="fill-black ml-0.5" />
                    )}
                  </button>
                </div>
              </div>

              {/* Matching Songs List */}
              <div className="flex flex-col gap-3">
                <h2 className="text-xl font-bold text-white">Songs</h2>
                <div className="flex flex-col">
                  {filteredTracks.slice(0, 4).map((t) => {
                    const isThisPlaying = isPlaying && currentTrack?.id === t.id;
                    const isLiked = likedTrackIds.includes(t.id);
                    return (
                      <div
                        key={t.id}
                        onClick={() => playTrack(t, filteredTracks)}
                        className="flex items-center justify-between p-2 rounded-md hover:bg-white/10 cursor-pointer group transition"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <img
                            src={t.coverUrl}
                            alt={t.title}
                            className="w-10 h-10 rounded object-cover flex-shrink-0"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className={`text-sm font-semibold truncate ${
                              isThisPlaying ? 'text-spotify-green' : 'text-white'
                            }`}>
                              {t.title}
                            </span>
                            <span className="text-xs text-spotify-subdued truncate">
                              {t.artist}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 pr-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLike(t.id);
                            }}
                            className={`transition ${
                              isLiked ? 'text-spotify-green' : 'opacity-0 group-hover:opacity-100 text-spotify-subdued hover:text-white'
                            }`}
                          >
                            <Heart size={16} className={isLiked ? 'fill-spotify-green' : ''} />
                          </button>
                          <span className="text-xs text-spotify-subdued tabular-nums">
                            {formatTime(t.durationSec)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="py-20 text-center flex flex-col items-center justify-center gap-2">
              <h3 className="text-xl font-bold text-white">No results found for "{searchQuery}"</h3>
              <p className="text-sm text-spotify-subdued">Please make sure your words are spelled correctly, or use fewer keywords.</p>
            </div>
          )}
        </div>
      ) : (
        /* 2. Default: Browse All Categories Grid */
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-bold text-white">Browse all</h1>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                onClick={() => navigateTo('playlist', PLAYLISTS[0].id)}
                className="aspect-square rounded-lg p-4 relative overflow-hidden cursor-pointer shadow-md hover:scale-[1.02] active:scale-[0.98] transition-transform duration-200"
                style={{ backgroundColor: cat.color }}
              >
                <h3 className="text-xl sm:text-2xl font-extrabold text-white leading-tight break-words max-w-[80%]">
                  {cat.title}
                </h3>
                <img
                  src={cat.cover}
                  alt={cat.title}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-md shadow-2xl object-cover absolute -bottom-2 -right-4 rotate-[25deg]"
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
