import React, { useState, useRef } from 'react';
import {
  Menu,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  MoreHorizontal,
  X,
  ChevronDown,
  Cloud,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';
import { AudioReactiveBackground } from '../visualizer/AudioReactiveBackground';
import type { Track } from '../../types';

interface MinimalistPlayerProps {
  onToggleAlbumsSlideBar: () => void;
  onOpenCloudVaultModal: () => void;
}

export const MinimalistPlayer: React.FC<MinimalistPlayerProps> = ({
  onToggleAlbumsSlideBar,
  onOpenCloudVaultModal
}) => {
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
    contextTracks,
    contextIndex,
    playlists,
    activePlaylistId,
    isCloudSynced,
    togglePlay,
    playTrack,
    seek,
    nextTrack,
    previousTrack,
    setVolume,
    toggleMute,
    toggleShuffle,
    toggleRepeat,
    toggleLike,
    removeFromQueue
  } = usePlayerStore();

  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const scrubberRef = useRef<HTMLDivElement | null>(null);

  // Active playlist / album info
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];
  const albumTitle = currentTrack?.album || activePlaylist?.title || 'CLOUD VAULT FAVORITES';
  const artistName = currentTrack?.artist || 'VAULTX ARTIST';
  
  const getTrackCover = (cover?: string) => {
    if (!cover || cover.includes('photo-1470225620780') || cover.includes('unsplash.com')) {
      return '/artwork.png';
    }
    return cover;
  };

  const displayCover = getTrackCover(currentTrack?.coverUrl);
  const isLiked = currentTrack ? likedTrackIds.includes(currentTrack.id) : false;

  // Next up tracks: tracks following current track in context
  const nextUpTracks: Track[] = contextTracks.length > 0
    ? contextTracks.filter((_, idx) => idx !== contextIndex)
    : [];

  // Scrubber progress %
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubberRef.current || duration <= 0) return;
    const rect = scrubberRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-screen bg-[#07090b] flex items-center justify-center p-2 sm:p-3 md:p-4 lg:p-6 select-none overflow-hidden">
      {/* 1. Audio-Reactive Background Lighting & Dynamic Particle Visualizer */}
      <AudioReactiveBackground />

      {/* 2. Floating Minimalist Player Window */}
      <div 
        className="relative z-10 w-full max-w-6xl xl:max-w-7xl h-full max-h-[880px] lg:max-h-[900px] bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-shadow duration-500"
        style={{
          boxShadow: isPlaying 
            ? `0 25px 80px -15px ${currentTrack?.dominantColor ? currentTrack.dominantColor + '40' : 'rgba(45,212,191,0.25)'}`
            : '0 25px 60px -15px rgba(0,0,0,0.85)'
        }}
      >
        
        {/* TOP BAR / WINDOW CHROME */}
        <header className="h-13 px-4 sm:px-6 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-[#090a0d]/85">
          {/* Left: Enhanced Albums Slide Bar Trigger (Clean Minimalist Design, No 3 Dots) */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleAlbumsSlideBar}
              className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white transition group border border-white/5 shadow-sm active:scale-95"
              title="Open Albums Slide Bar"
            >
              <Menu size={16} className="text-white group-hover:text-[#EAA599] group-hover:scale-110 transition-all" />
              <span className="text-xs font-bold tracking-wider uppercase text-white">
                Albums
              </span>
            </button>

            {/* Audio-Reactive Beat Indicator (Harmonized Pastel Rose Accent) */}
            {isPlaying && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAA599]/10 border border-[#EAA599]/25 text-[#EAA599] text-[10px] font-semibold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAA599] animate-ping inline-block" />
                <span>BEAT REACTIVE</span>
              </div>
            )}
          </div>

          {/* Right: Cloud Vault & Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Cloud Vault Connection Button (Frosted Minimalist Styling) */}
            <button
              onClick={onOpenCloudVaultModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border transition ${
                isCloudSynced
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
              title="Cloudflare R2 Vault Settings"
            >
              <Cloud size={13} className={isCloudSynced ? 'text-[#EAA599]' : ''} />
              <span className="hidden md:inline">
                {isCloudSynced ? 'Vault Online' : 'Connect Vault'}
              </span>
            </button>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </header>

        {/* MAIN BODY: 2-COLUMN VIEW (ARTWORK ON LEFT, MUSICS ON RIGHT) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* COLUMN 1: LARGE HERO ALBUM ARTWORK DISPLAY (LEFT - ENLARGED TO FILL SPACE) */}
          <section className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-hidden bg-[#090a0d]/40">
            <div className="relative aspect-square w-full max-w-[620px] lg:max-w-[680px] xl:max-w-[720px] max-h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#ece3d6] group flex flex-col justify-between p-6 sm:p-8 select-none transition-all duration-300">
              
              {/* Actual Album Artwork Image Background */}
              <img
                src={displayCover}
                alt={currentTrack?.title || 'Album Artwork'}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Subtle Ambient Vignette Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

              {/* Artwork Top Header: Geometric Logo & Album Title */}
              <div className="relative z-10 flex items-center justify-between w-full">
                {/* Geometric Logo (Tidal/VaultX Motif with pastel blush & warm white accents) */}
                <div
                  onClick={onToggleAlbumsSlideBar}
                  className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition text-white border border-white/20 shadow-lg"
                  title="Click to view Albums"
                >
                  <div className="grid grid-cols-2 gap-0.5">
                    <span className="w-1.5 h-1.5 bg-[#f3cbc4] rounded-full" />
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="w-1.5 h-1.5 bg-white rounded-full" />
                    <span className="w-1.5 h-1.5 bg-[#f3cbc4] rounded-full" />
                  </div>
                </div>

                {/* Album Title (Matches Top-Right of Reference Artwork) */}
                <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow-md bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
                  {albumTitle}
                </span>
              </div>

              {/* Center Play/Pause Trigger Hover Overlay */}
              <div
                onClick={togglePlay}
                className="absolute inset-0 flex items-center justify-center cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10"
              >
                <div className="w-16 h-16 rounded-full bg-[#f3cbc4] hover:bg-white text-black flex items-center justify-center shadow-2xl transform scale-90 group-hover:scale-100 transition-transform">
                  {isPlaying ? (
                    <Pause size={28} className="fill-black" />
                  ) : (
                    <Play size={28} className="fill-black ml-1" />
                  )}
                </div>
              </div>

              {/* Artwork Bottom Header: Artist Name (Matches Bottom-Left of Reference Artwork) */}
              <div className="relative z-10 flex items-end justify-between w-full">
                <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow-md bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
                  {artistName}
                </span>

                {/* Pulsing Audio Wave Indicator (Pink & Ivory accents) */}
                {isPlaying && (
                  <div className="flex items-end gap-0.5 h-5 px-2 py-1 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                    <span className="w-0.5 h-3 bg-[#f3cbc4] rounded-full animate-pulse" />
                    <span className="w-0.5 h-4 bg-white/90 rounded-full animate-bounce delay-75" />
                    <span className="w-0.5 h-2 bg-[#f3cbc4] rounded-full animate-pulse delay-150" />
                    <span className="w-0.5 h-4 bg-white/90 rounded-full animate-bounce delay-100" />
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* COLUMN 2: MUSICS / QUEUE (RIGHT SIDE) */}
          <section className="w-full md:w-[340px] lg:w-[360px] xl:w-[380px] flex flex-col p-4 sm:p-5 lg:p-6 border-t md:border-t-0 md:border-l border-white/5 overflow-hidden bg-[#0c0d10]/95 flex-shrink-0">
            
            {/* 1. Header: PLAYING FROM */}
            <div className="mb-3">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Playing From: {albumTitle}
              </span>
            </div>

            {/* 2. Currently Playing Track Card (Matches Highlighted Item in Reference) */}
            {currentTrack && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/10 shadow-sm mb-5 transition">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getTrackCover(currentTrack.coverUrl)}
                    alt={currentTrack.title}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0 pr-2">
                    <h4 className="text-sm font-bold text-[#EAA599] truncate">
                      {currentTrack.title}
                    </h4>
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {currentTrack.artist}
                    </p>
                  </div>
                </div>

                <div
                  onClick={togglePlay}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-[#EAA599] text-white hover:text-black flex items-center justify-center flex-shrink-0 cursor-pointer transition"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <Pause size={14} className="fill-current" />
                  ) : (
                    <Play size={14} className="fill-current ml-0.5" />
                  )}
                </div>
              </div>
            )}

            {/* 3. Header: NEXT UP FROM */}
            <div className="mb-2.5 flex items-center justify-between">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Next Up From: {albumTitle}
              </span>
              <span className="text-[11px] text-neutral-500 font-medium">
                {nextUpTracks.length} tracks
              </span>
            </div>

            {/* 4. Scrollable List of Tracks (Matches Right Column in Reference) */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {nextUpTracks.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-500">
                  No other tracks in this album
                </div>
              ) : (
                nextUpTracks.map((track) => (
                  <div
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className="group flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-all duration-150 cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getTrackCover(track.coverUrl)}
                        alt={track.title}
                        className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                      />
                      <div className="min-w-0 pr-2">
                        <span className="text-sm font-medium text-white group-hover:text-neutral-200 truncate block">
                          {track.title}
                        </span>
                        <span className="text-xs text-neutral-400 truncate block mt-0.5">
                          {track.artist}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromQueue(track.id);
                      }}
                      className="w-7 h-7 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition"
                      title="Remove from queue"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* BOTTOM PLAYBACK BAR (MATCHES REFERENCE BOTTOM DECK) */}
        <footer className="h-20 sm:h-22 px-4 sm:px-6 border-t border-white/5 bg-[#090a0d]/95 flex items-center justify-between gap-3 select-none flex-shrink-0">
          
          {/* LEFT: Current Track Details, Like & Options */}
          <div className="w-[28%] min-w-[140px] flex items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[220px]">
                  {currentTrack?.title || 'No track selected'}
                </span>

                {/* Heart / Like Button */}
                {currentTrack && (
                  <button
                    onClick={() => toggleLike(currentTrack.id)}
                    className={`transition hover:scale-110 active:scale-95 ${
                      isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-400 hover:text-white'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={15} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                )}

                {/* More Options */}
                <button
                  onClick={onOpenCloudVaultModal}
                  className="text-neutral-400 hover:text-white transition"
                  title="More Options"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>

              <div className="flex flex-col text-[11px] text-neutral-400 truncate mt-0.5">
                <span className="truncate">{artistName}</span>
                <span className="truncate text-[10px] text-neutral-500 uppercase tracking-wider">
                  {albumTitle}
                </span>
              </div>
            </div>
          </div>

          {/* CENTER: Playback Controls & Scrubber Timeline */}
          <div className="flex-1 max-w-xl flex flex-col items-center justify-center gap-1.5 px-2">
            
            {/* Control Buttons */}
            <div className="flex items-center gap-4 sm:gap-6">
              {/* Shuffle */}
              <button
                onClick={toggleShuffle}
                className={`transition hover:scale-110 ${
                  isShuffle ? 'text-[#EAA599]' : 'text-neutral-400 hover:text-white'
                }`}
                title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle size={15} />
              </button>

              {/* Previous */}
              <button
                onClick={previousTrack}
                className="text-neutral-300 hover:text-white transition hover:scale-110 active:scale-95"
                title="Previous (Ctrl+Left)"
              >
                <SkipBack size={18} />
              </button>

              {/* Play / Pause (Solid White Triangle/Bars like Reference) */}
              <button
                onClick={togglePlay}
                className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition"
                title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
              >
                {isPlaying ? (
                  <Pause size={18} className="fill-black text-black" />
                ) : (
                  <Play size={18} className="fill-black text-black ml-0.5" />
                )}
              </button>

              {/* Next */}
              <button
                onClick={nextTrack}
                className="text-neutral-300 hover:text-white transition hover:scale-110 active:scale-95"
                title="Next (Ctrl+Right)"
              >
                <SkipForward size={18} />
              </button>

              {/* Repeat */}
              <button
                onClick={toggleRepeat}
                className={`transition hover:scale-110 ${
                  repeatMode !== 'off' ? 'text-[#EAA599]' : 'text-neutral-400 hover:text-white'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 size={15} /> : <Repeat size={15} />}
              </button>
            </div>

            {/* Timeline Scrubber */}
            <div className="w-full flex items-center gap-2.5 text-[11px] text-neutral-400 tabular-nums">
              <span className="w-8 text-right">{formatTime(currentTime)}</span>
              
              <div
                ref={scrubberRef}
                onClick={handleScrubberClick}
                className="flex-1 h-1.5 bg-white/20 rounded-full relative cursor-pointer group flex items-center"
              >
                <div
                  className="h-full bg-white group-hover:bg-[#EAA599] rounded-full relative transition-all"
                  style={{ width: `${progressPercent}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>

              <span className="w-8 text-left">{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT: Volume & Dropdown Chevron */}
          <div className="w-[28%] min-w-[120px] flex items-center justify-end gap-2.5 sm:gap-3">
            {/* Volume Control */}
            <div
              className="relative flex items-center gap-2"
              onMouseEnter={() => setShowVolumeSlider(true)}
              onMouseLeave={() => setShowVolumeSlider(false)}
            >
              <button
                onClick={toggleMute}
                className="text-neutral-400 hover:text-white transition"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? <VolumeX size={17} /> : <Volume2 size={17} />}
              </button>

              <div className={`transition-all duration-200 ${showVolumeSlider ? 'w-20 opacity-100' : 'w-16 opacity-75'}`}>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : Math.round(volume * 100)}
                  onChange={(e) => setVolume(parseFloat(e.target.value) / 100)}
                  className="w-full h-1 bg-white/20 accent-[#EAA599] rounded-lg cursor-pointer"
                />
              </div>
            </div>

            {/* Dropdown Chevron */}
            <button
              onClick={onToggleAlbumsSlideBar}
              className="text-neutral-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition"
              title="Toggle Albums Menu"
            >
              <ChevronDown size={17} />
            </button>
          </div>
        </footer>

      </div>
    </div>
  );
};
