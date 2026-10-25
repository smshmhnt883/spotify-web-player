import React, { useEffect, useRef } from 'react';
import { X, Trash2, Mic2, ListMusic, Info } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';

export const RightDrawer: React.FC = () => {
  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);

  const {
    activeDrawer,
    toggleDrawer,
    currentTrack,
    currentTime,
    seek,
    userQueue,
    removeFromQueue,
    contextTracks,
    contextIndex,
    playTrack
  } = usePlayerStore();

  // Auto-scroll lyrics smoothly to center
  useEffect(() => {
    if (activeDrawer === 'lyrics' && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, activeDrawer]);

  if (activeDrawer === 'none' || !currentTrack) return null;

  return (
    <aside className="w-[300px] lg:w-[360px] bg-spotify-base rounded-lg m-2 ml-0 p-4 flex flex-col overflow-hidden border border-white/5 select-none transition-all duration-300">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          {activeDrawer === 'queue' && (
            <>
              <ListMusic size={20} className="text-spotify-green" />
              <h2 className="font-bold text-base text-white">Queue</h2>
            </>
          )}
          {activeDrawer === 'lyrics' && (
            <>
              <Mic2 size={20} className="text-spotify-green" />
              <h2 className="font-bold text-base text-white">Lyrics</h2>
            </>
          )}
          {activeDrawer === 'nowPlaying' && (
            <>
              <Info size={20} className="text-spotify-green" />
              <h2 className="font-bold text-base text-white">{currentTrack.artist}</h2>
            </>
          )}
        </div>

        <button
          onClick={() => toggleDrawer('none')}
          className="text-spotify-subdued hover:text-white p-1 rounded-full hover:bg-white/10 transition"
          title="Close drawer"
        >
          <X size={18} />
        </button>
      </div>

      {/* 1. NOW PLAYING TAB */}
      {activeDrawer === 'nowPlaying' && (
        <div className="flex-1 overflow-y-auto pt-4 flex flex-col gap-6 pr-1">
          <div className="rounded-lg overflow-hidden shadow-2xl aspect-square">
            <img
              src={currentTrack.coverUrl}
              alt={currentTrack.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div>
            <h3 className="text-2xl font-bold text-white leading-tight">{currentTrack.title}</h3>
            <p className="text-base text-spotify-subdued mt-1">{currentTrack.artist}</p>
          </div>

          {/* About the Artist Card */}
          <div className="p-4 rounded-xl bg-spotify-elevated flex flex-col gap-3">
            <span className="text-xs font-bold uppercase tracking-wider text-spotify-subdued">
              About the artist
            </span>
            <div className="flex items-center gap-3">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.artist}
                className="w-14 h-14 rounded-full object-cover"
              />
              <div>
                <h4 className="font-bold text-white hover:underline cursor-pointer">
                  {currentTrack.artist}
                </h4>
                <p className="text-xs text-spotify-subdued">1,824,905 monthly listeners</p>
              </div>
            </div>
            <p className="text-xs text-spotify-subdued leading-relaxed line-clamp-4">
              Pioneering futuristic soundscapes and chill electronic harmonies. Certified artist producing ambient retro-synth textures and modern lo-fi beats.
            </p>
          </div>

          {/* Credits */}
          <div className="p-4 rounded-xl bg-spotify-elevated flex flex-col gap-2 text-xs">
            <span className="font-bold uppercase tracking-wider text-spotify-subdued">Credits</span>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-white font-medium">{currentTrack.artist}</span>
              <span className="text-spotify-subdued">Main Artist, Producer</span>
            </div>
            <div className="flex justify-between py-1 border-b border-white/5">
              <span className="text-white font-medium">VaultX Labs</span>
              <span className="text-spotify-subdued">Mastering Engineer</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-white font-medium">Release Year</span>
              <span className="text-spotify-subdued">{currentTrack.releaseYear || 2024}</span>
            </div>
          </div>
        </div>
      )}

      {/* 2. QUEUE TAB */}
      {activeDrawer === 'queue' && (
        <div className="flex-1 overflow-y-auto pt-4 flex flex-col gap-6 pr-1">
          {/* Now Playing */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-spotify-subdued">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2 rounded-md bg-white/10">
              <img
                src={currentTrack.coverUrl}
                alt={currentTrack.title}
                className="w-10 h-10 rounded object-cover"
              />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-spotify-green truncate">{currentTrack.title}</p>
                <p className="text-xs text-spotify-subdued truncate">{currentTrack.artist}</p>
              </div>
            </div>
          </div>

          {/* Next In Queue (User Queued) */}
          {userQueue.length > 0 && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-spotify-subdued">
                Next In Queue
              </span>
              <div className="flex flex-col gap-1">
                {userQueue.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 group transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.coverUrl}
                        alt={track.title}
                        className="w-9 h-9 rounded object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                        <p className="text-xs text-spotify-subdued truncate">{track.artist}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromQueue(track.id)}
                      className="opacity-0 group-hover:opacity-100 text-spotify-subdued hover:text-white p-1 transition"
                      title="Remove from queue"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Next From Context */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-spotify-subdued">
              Next Up
            </span>
            <div className="flex flex-col gap-1">
              {contextTracks.slice(contextIndex + 1).map((track) => (
                <div
                  key={track.id}
                  onClick={() => playTrack(track, contextTracks)}
                  className="flex items-center justify-between p-2 rounded-md hover:bg-white/5 cursor-pointer group transition"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={track.coverUrl}
                      alt={track.title}
                      className="w-9 h-9 rounded object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{track.title}</p>
                      <p className="text-xs text-spotify-subdued truncate">{track.artist}</p>
                    </div>
                  </div>
                  <span className="text-xs text-spotify-subdued tabular-nums">
                    {formatTime(track.durationSec)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 3. SYNCED LYRICS TAB */}
      {activeDrawer === 'lyrics' && (
        <div 
          ref={lyricsContainerRef}
          className="flex-1 overflow-y-auto pt-6 flex flex-col gap-6 pr-2 scroll-smooth"
        >
          {currentTrack.lyrics && currentTrack.lyrics.length > 0 ? (
            currentTrack.lyrics.map((line, idx) => {
              const currentMs = currentTime * 1000;
              const nextLine = currentTrack.lyrics![idx + 1];
              const isActive = currentMs >= line.timeMs && (!nextLine || currentMs < nextLine.timeMs);
              const isPast = nextLine && currentMs >= nextLine.timeMs;

              return (
                <div
                  key={idx}
                  ref={isActive ? activeLyricRef : null}
                  onClick={() => seek(line.timeMs / 1000)}
                  className={`text-xl sm:text-2xl font-extrabold leading-snug cursor-pointer transition-all duration-300 ${
                    isActive 
                      ? 'text-white scale-[1.03] origin-left' 
                      : isPast 
                      ? 'text-white/40 hover:text-white/70' 
                      : 'text-white/20 hover:text-white/60'
                  }`}
                  title="Click to seek"
                >
                  {line.text}
                </div>
              );
            })
          ) : (
            <div className="py-20 text-center text-spotify-subdued">
              <p>Looks like we don't have the lyrics for this song yet.</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
};
