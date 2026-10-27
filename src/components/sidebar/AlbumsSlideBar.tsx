import React, { useEffect } from 'react';
import { X, Disc, Cloud, Upload, CheckCircle2, ChevronRight, Play } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Playlist } from '../../types';

interface AlbumsSlideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenUploadModal: () => void;
  onOpenCloudVaultModal: () => void;
}

export const AlbumsSlideBar: React.FC<AlbumsSlideBarProps> = ({
  isOpen,
  onClose,
  onOpenUploadModal,
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
            <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-[#2dd4bf]">
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
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="text-[11px] font-bold tracking-widest text-neutral-400 uppercase">
            Current Album
          </div>

          {primaryAlbum && (
            <div
              onClick={() => handleSelectAlbum(primaryAlbum)}
              className="group relative bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#2dd4bf]/40 rounded-2xl p-4 transition-all duration-200 cursor-pointer shadow-lg"
            >
              <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-neutral-900 shadow-md">
                <img
                  src={primaryAlbum.coverUrl}
                  alt={primaryAlbum.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />

                {/* Play Button Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-12 h-12 rounded-full bg-[#2dd4bf] text-black flex items-center justify-center shadow-xl transform scale-90 group-hover:scale-100 transition-transform">
                    <Play size={20} className="fill-black ml-0.5" />
                  </div>
                </div>

                <div className="absolute top-2.5 right-2.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#2dd4bf]/90 text-black shadow-sm">
                    ACTIVE
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="min-w-0 pr-2">
                  <h3 className="text-sm font-bold text-white truncate group-hover:text-[#2dd4bf] transition-colors">
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

          <div className="bg-white/5 rounded-xl p-3.5 border border-white/5 text-xs text-neutral-400 leading-relaxed">
            <p className="font-semibold text-neutral-300 mb-1">Single Album Mode</p>
            <p className="text-[11px]">
              Currently configured for your personal collection. Upload new folders to Cloudflare R2 anytime to segregate into multiple albums automatically.
            </p>
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-white/10 space-y-2 bg-[#08090b]">
          <button
            onClick={() => {
              onClose();
              onOpenCloudVaultModal();
            }}
            className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-white transition border border-white/5"
          >
            <div className="flex items-center gap-2">
              <Cloud size={15} className={isCloudSynced ? 'text-[#2dd4bf]' : 'text-neutral-400'} />
              <span>Cloudflare Vault Settings</span>
            </div>
            {isCloudSynced && (
              <span className="flex items-center gap-1 text-[11px] text-[#2dd4bf]">
                <CheckCircle2 size={12} />
                <span>{cloudTrackCount || primaryAlbum?.tracks.length || 0}</span>
              </span>
            )}
          </button>

          <button
            onClick={() => {
              onClose();
              onOpenUploadModal();
            }}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-[#2dd4bf] hover:bg-[#2dd4bf]/90 text-black text-xs font-bold transition shadow-md"
          >
            <Upload size={14} className="stroke-[2.5]" />
            <span>Upload Music</span>
          </button>
        </div>
      </aside>
    </>
  );
};
