import React, { useEffect } from 'react';
import { X, Disc, Cloud, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Playlist } from '../../types';

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
    cloudTrackCount
  } = usePlayerStore();

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

  // Other albums in library (excluding the active primary album)
  const otherAlbums = playlists.filter(p => p.id !== primaryAlbum?.id);

  const handleSelectAlbum = (album: Playlist) => {
    navigateTo('home', album.id);
    if (album.tracks.length > 0) {
      playTrack(album.tracks[0], album.tracks);
    }
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
        className={`fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-[#0c0d10]/98 border-r border-white/10 z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-out select-none ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
              <Disc size={18} />
            </div>
            <div>
              <h2 className="text-sm font-bold tracking-wider text-white uppercase">
                Albums
              </h2>
              <p className="text-[11px] text-neutral-400">Vault Collections</p>
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

        {/* Content: Album Selection */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar">
          {/* 1. CURRENT ALBUM (Hero Card) */}
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

          {/* 2. LIBRARY (Scalable List of Other Albums) */}
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
