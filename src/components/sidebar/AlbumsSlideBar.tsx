import React, { useState, useEffect } from 'react';
import { X, Disc, Cloud, CheckCircle2, ChevronRight, Play, User, Heart } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { sanitizeTrack } from '../../utils/trackSanitizer';
import { formatTime } from '../../utils/formatTime';
import type { Playlist, Track } from '../../types';

interface AlbumsSlideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCloudVaultModal: () => void;
}

export const AlbumsSlideBar: React.FC<AlbumsSlideBarProps> = ({
  isOpen,
  onClose,
  onOpenCloudVaultModal
}) => {
  const {
    playlists,
    activePlaylistId,
    navigateTo,
    playTrack,
    isCloudSynced,
    cloudTrackCount,
    likedTrackIds,
    currentTrack
  } = usePlayerStore();

  const [activeCategory, setActiveCategory] = useState<'albums' | 'artists' | 'tracks' | 'favorites'>('albums');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Primary active album (or first available playlist)
  const primaryAlbum = playlists.find(p => p.id === activePlaylistId) || playlists[0];
  const albumCover = !primaryAlbum?.coverUrl || primaryAlbum.coverUrl.includes('photo-1470225620780') || primaryAlbum.coverUrl.includes('unsplash.com')
    ? '/artwork.png'
    : primaryAlbum.coverUrl;

  // Other albums in library
  const otherAlbums = playlists.filter(p => p.id !== primaryAlbum?.id);

  // Flat list of all unique tracks across library
  const allTracks: Track[] = Array.from(
    new Map(
      playlists.flatMap(p => p.tracks).map(t => [t.id, t])
    ).values()
  );

  // Group tracks by artist
  const artistMap = new Map<string, Track[]>();
  allTracks.forEach(t => {
    const sanitized = sanitizeTrack(t);
    const mainArtist = sanitized.artist.split(',')[0].trim();
    const current = artistMap.get(mainArtist) || [];
    current.push(t);
    artistMap.set(mainArtist, current);
  });
  const artistList = Array.from(artistMap.entries()).map(([artist, tracks]) => ({
    artist,
    tracks,
    count: tracks.length
  }));

  // Favorite tracks
  const favoriteTracks = allTracks.filter(t => likedTrackIds.includes(t.id));

  const handleSelectAlbum = (album: Playlist) => {
    navigateTo('home', album.id);
    if (album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks);
    }
    onClose();
  };

  const handleSelectTrack = (track: Track, contextList: Track[]) => {
    playTrack(track, contextList);
    onClose();
  };

  return (
    <>
      {/* 1. Backdrop Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 2. Slide-out Left Bar */}
      <aside
        className={`fixed inset-y-0 left-0 w-84 max-w-[88vw] bg-[#0c0d10]/98 border-r border-white/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Disc size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white uppercase">
                Library Explorer
              </h2>
              <p className="text-[11px] text-neutral-400">Vault Collections & Audio</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition"
            title="Close Slide Bar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Category Navigation Pills */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-white/5 border border-white/10 rounded-xl mx-4 sm:mx-5 mt-4 flex-shrink-0">
          <button
            onClick={() => setActiveCategory('albums')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
              activeCategory === 'albums'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Albums
          </button>
          <button
            onClick={() => setActiveCategory('artists')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
              activeCategory === 'artists'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Artists
          </button>
          <button
            onClick={() => setActiveCategory('tracks')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
              activeCategory === 'tracks'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Tracks
          </button>
          <button
            onClick={() => setActiveCategory('favorites')}
            className={`py-1.5 px-1 rounded-lg text-[11px] font-bold tracking-wide transition-all ${
              activeCategory === 'favorites'
                ? 'bg-white/15 text-white shadow-sm'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Favorites
          </button>
        </div>

        {/* Content: Selected Category View */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 custom-scrollbar">
          
          {/* 1. ALBUMS TAB */}
          {activeCategory === 'albums' && (
            <>
              {/* CURRENT ALBUM (Hero Card) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                    Current Album
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAA599]/15 text-[#EAA599] font-bold uppercase tracking-wider">
                    Now Playing
                  </span>
                </div>

                {primaryAlbum && (
                  <div
                    onClick={() => handleSelectAlbum(primaryAlbum)}
                    className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#EAA599]/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg"
                  >
                    <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-neutral-900 shadow-md">
                      <img
                        src={albumCover}
                        alt={primaryAlbum.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                      {/* Play Button Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                          <Play size={20} className="fill-black ml-0.5" />
                        </div>
                      </div>

                      <div className="absolute top-2.5 right-2.5">
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EAA599] text-black shadow-sm tracking-wider">
                          ACTIVE
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-[#EAA599] transition-colors">
                          {primaryAlbum.title}
                        </h3>
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {primaryAlbum.creator || 'VaultX Cloud'} • {primaryAlbum.tracks.length} Tracks
                        </p>
                      </div>
                      <ChevronRight size={18} className="text-neutral-500 group-hover:text-white group-hover:translate-x-1 transition-all flex-shrink-0" />
                    </div>
                  </div>
                )}
              </div>

              {/* LIBRARY (Scalable List of Other Albums) */}
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
                    Library Collections
                  </span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 font-semibold">
                    {otherAlbums.length} {otherAlbums.length === 1 ? 'Album' : 'Albums'}
                  </span>
                </div>

                {otherAlbums.length > 0 ? (
                  <div className="space-y-2">
                    {otherAlbums.map((album) => {
                      const cover = (!album.coverUrl || album.coverUrl.includes('photo-1470225620780') || album.coverUrl.includes('unsplash.com'))
                        ? '/artwork.png'
                        : album.coverUrl;
                      return (
                        <div
                          key={album.id}
                          onClick={() => handleSelectAlbum(album)}
                          className="group flex items-center justify-between p-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#EAA599]/30 transition-all cursor-pointer shadow-sm active:scale-98"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-900 shadow-md">
                              <img
                                src={cover}
                                alt={album.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/5 transition-colors" />
                            </div>
                            <div className="min-w-0 pr-2">
                              <h4 className="text-sm font-semibold text-white group-hover:text-[#EAA599] truncate transition-colors">
                                {album.title}
                              </h4>
                              <p className="text-xs text-neutral-400 truncate mt-0.5">
                                {album.tracks.length} tracks • {album.creator || 'Personal Vault'}
                              </p>
                            </div>
                          </div>

                          <div className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition flex-shrink-0">
                            <ChevronRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 text-xs text-neutral-400 leading-relaxed">
                    <p className="font-semibold text-neutral-300 mb-1">Multi-Folder Discovery Ready</p>
                    <p className="text-[11px]">
                      Upload sub-folders to your Cloudflare R2 bucket anytime. Each folder automatically organizes into a dedicated album here.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* 2. ARTISTS TAB */}
          {activeCategory === 'artists' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                Discovered Vault Artists ({artistList.length})
              </span>
              {artistList.map(({ artist, tracks, count }) => (
                <div
                  key={artist}
                  onClick={() => handleSelectTrack(tracks[0], tracks)}
                  className="group flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 hover:border-[#EAA599]/30 transition-all cursor-pointer shadow-sm"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-[#EAA599] flex-shrink-0">
                      <User size={18} />
                    </div>
                    <div className="min-w-0 pr-2">
                      <h4 className="text-sm font-semibold text-white group-hover:text-[#EAA599] truncate transition-colors">
                        {artist}
                      </h4>
                      <p className="text-xs text-neutral-400">
                        {count} {count === 1 ? 'track' : 'tracks'}
                      </p>
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 group-hover:text-white group-hover:bg-white/10 transition">
                    <Play size={14} className="fill-current ml-0.5" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* 3. TRACKS TAB */}
          {activeCategory === 'tracks' && (
            <div className="space-y-1">
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block mb-2">
                All Vault Tracks ({allTracks.length})
              </span>
              {allTracks.map((rawTrack) => {
                const track = sanitizeTrack(rawTrack);
                const isCurrent = currentTrack?.id === track.id;
                return (
                  <div
                    key={track.id}
                    onClick={() => handleSelectTrack(track, allTracks)}
                    className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                      isCurrent
                        ? 'bg-white/10 border border-[#EAA599]/40 text-[#EAA599]'
                        : 'hover:bg-white/5 text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={track.coverUrl || '/artwork.png'}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                      />
                      <div className="min-w-0 pr-2">
                        <span className={`text-sm font-medium truncate block ${isCurrent ? 'text-[#EAA599]' : 'text-white'}`}>
                          {track.title}
                        </span>
                        <span className="text-xs text-neutral-400 truncate block mt-0.5">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <span className="text-xs text-neutral-400 font-mono tabular-nums">
                      {formatTime(track.durationSec || 180)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 4. FAVORITES TAB */}
          {activeCategory === 'favorites' && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase block mb-1">
                Favorite Tracks ({favoriteTracks.length})
              </span>
              {favoriteTracks.length > 0 ? (
                favoriteTracks.map((rawTrack) => {
                  const track = sanitizeTrack(rawTrack);
                  const isCurrent = currentTrack?.id === track.id;
                  return (
                    <div
                      key={track.id}
                      onClick={() => handleSelectTrack(track, favoriteTracks)}
                      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all cursor-pointer ${
                        isCurrent
                          ? 'bg-white/10 border border-[#EAA599]/40'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={track.coverUrl || '/artwork.png'}
                          alt={track.title}
                          className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                        />
                        <div className="min-w-0 pr-2">
                          <span className={`text-sm font-medium truncate block ${isCurrent ? 'text-[#EAA599]' : 'text-white'}`}>
                            {track.title}
                          </span>
                          <span className="text-xs text-neutral-400 truncate block mt-0.5">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      <Heart size={14} className="fill-red-500 text-red-500 flex-shrink-0" />
                    </div>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-neutral-400 text-center">
                  <Heart size={28} className="text-neutral-600 mb-1" />
                  <p className="text-sm font-bold text-white">No Favorites Yet</p>
                  <p className="text-xs text-neutral-500 max-w-[200px]">
                    Tap the heart icon on any song to save it to your Favorites collection.
                  </p>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#08090b]">
          <button
            onClick={() => {
              onClose();
              onOpenCloudVaultModal();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition border border-white/5 group"
          >
            <div className="flex items-center gap-2">
              <Cloud size={15} className={isCloudSynced ? 'text-[#EAA599]' : 'text-neutral-400'} />
              <span>Cloudflare Vault Settings</span>
            </div>
            {isCloudSynced && (
              <span
                className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#EAA599]/15 text-[11px] font-semibold text-[#EAA599] border border-[#EAA599]/25 group-hover:bg-[#EAA599]/25 transition"
                title={`${cloudTrackCount || primaryAlbum?.tracks.length || 0} tracks synced from Cloudflare R2`}
              >
                <CheckCircle2 size={12} />
                <span>{cloudTrackCount || primaryAlbum?.tracks.length || 0} tracks synced</span>
              </span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
};
