import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { PLAYLISTS, TRACKS } from '../../data/mockData';
import type { Playlist } from '../../types';

export const HomeView: React.FC = () => {
  const {
    currentTrack,
    isPlaying,
    playTrack,
    togglePlay,
    navigateTo
  } = usePlayerStore();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleQuickPlay = (playlist: Playlist, e: React.MouseEvent) => {
    e.stopPropagation();
    if (playlist.tracks.length > 0) {
      if (currentTrack?.id === playlist.tracks[0].id) {
        togglePlay();
      } else {
        playTrack(playlist.tracks[0], playlist.tracks);
      }
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      {/* 1. Header Greeting & Quick Grid */}
      <section className="flex flex-col gap-4">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          {getGreeting()}
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {/* Liked Songs Quick Card */}
          <div
            onClick={() => navigateTo('liked')}
            className="flex items-center gap-4 bg-spotify-elevated/70 hover:bg-spotify-highlight/80 rounded-md overflow-hidden cursor-pointer group transition duration-200"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#450af5] to-[#8e8ee5] flex items-center justify-center flex-shrink-0 shadow-md">
              <Heart size={28} className="text-white fill-white" />
            </div>
            <span className="font-bold text-sm sm:text-base text-white flex-1 truncate pr-2">
              Liked Songs
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (TRACKS.length > 0) playTrack(TRACKS[0]);
              }}
              className="w-11 h-11 rounded-full bg-spotify-green flex items-center justify-center text-black mr-4 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0"
              title="Play Liked Songs"
            >
              <Play size={20} className="fill-black ml-0.5" />
            </button>
          </div>

          {/* Quick Playlists */}
          {PLAYLISTS.slice(0, 5).map((pl) => {
            const isThisPlaying = isPlaying && currentTrack && pl.tracks.some(t => t.id === currentTrack.id);
            return (
              <div
                key={pl.id}
                onClick={() => navigateTo('playlist', pl.id)}
                className="flex items-center gap-4 bg-spotify-elevated/70 hover:bg-spotify-highlight/80 rounded-md overflow-hidden cursor-pointer group transition duration-200"
              >
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-16 h-16 sm:w-20 sm:h-20 object-cover flex-shrink-0 shadow-md"
                />
                <span className="font-bold text-sm sm:text-base text-white flex-1 truncate pr-2">
                  {pl.title}
                </span>
                <button
                  onClick={(e) => handleQuickPlay(pl, e)}
                  className={`w-11 h-11 rounded-full bg-spotify-green flex items-center justify-center text-black mr-4 shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 flex-shrink-0 ${
                    isThisPlaying ? 'opacity-100' : 'opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0'
                  }`}
                  title={`Play ${pl.title}`}
                >
                  {isThisPlaying ? (
                    <Pause size={20} className="fill-black" />
                  ) : (
                    <Play size={20} className="fill-black ml-0.5" />
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2. Shelf: Made For You */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
            Made For You
          </h2>
          <span className="text-xs font-bold text-spotify-subdued hover:underline cursor-pointer">
            Show all
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {PLAYLISTS.map((pl) => (
            <div
              key={pl.id}
              onClick={() => navigateTo('playlist', pl.id)}
              className="p-3.5 bg-spotify-card hover:bg-spotify-card-hover rounded-lg flex flex-col gap-3 cursor-pointer group transition duration-300"
            >
              <div className="relative aspect-square rounded-md overflow-hidden shadow-lg">
                <img
                  src={pl.coverUrl}
                  alt={pl.title}
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={(e) => handleQuickPlay(pl, e)}
                  className="w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-xl absolute bottom-2 right-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 hover:scale-105 active:scale-95 transition-all duration-300"
                  title="Play"
                >
                  <Play size={22} className="fill-black ml-0.5" />
                </button>
              </div>

              <div>
                <h3 className="font-bold text-sm text-white truncate">{pl.title}</h3>
                <p className="text-xs text-spotify-subdued line-clamp-2 mt-1">{pl.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Shelf: Popular Tracks */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white hover:underline cursor-pointer">
            Trending Electronic & Lofi
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {TRACKS.map((t) => {
            const isPlayingThis = isPlaying && currentTrack?.id === t.id;
            return (
              <div
                key={t.id}
                onClick={() => playTrack(t, TRACKS)}
                className="p-3.5 bg-spotify-card hover:bg-spotify-card-hover rounded-lg flex flex-col gap-3 cursor-pointer group transition duration-300"
              >
                <div className="relative aspect-square rounded-md overflow-hidden shadow-lg">
                  <img
                    src={t.coverUrl}
                    alt={t.title}
                    className="w-full h-full object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (isPlayingThis) togglePlay();
                      else playTrack(t, TRACKS);
                    }}
                    className={`w-12 h-12 rounded-full bg-spotify-green flex items-center justify-center text-black shadow-xl absolute bottom-2 right-2 hover:scale-105 active:scale-95 transition-all duration-300 ${
                      isPlayingThis ? 'opacity-100' : 'opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0'
                    }`}
                    title="Play"
                  >
                    {isPlayingThis ? (
                      <Pause size={22} className="fill-black" />
                    ) : (
                      <Play size={22} className="fill-black ml-0.5" />
                    )}
                  </button>
                </div>

                <div>
                  <h3 className={`font-bold text-sm truncate ${isPlayingThis ? 'text-spotify-green' : 'text-white'}`}>
                    {t.title}
                  </h3>
                  <p className="text-xs text-spotify-subdued truncate mt-1">
                    {t.artist}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
