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
  Minimize2,
  Mic2
} from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';
import { sanitizeTrack } from '../../utils/trackSanitizer';
import { AudioReactiveBackground } from '../visualizer/AudioReactiveBackground';
import { NowPlayingDetailModal } from '../modals/NowPlayingDetailModal';
import type { Track } from '../../types';

interface MinimalistPlayerProps {
  onToggleAlbumsSlideBar: () => void;
  onOpenCloudVaultModal: () => void;
  isSlideBarOpen?: boolean;
}

export const MinimalistPlayer: React.FC<MinimalistPlayerProps> = ({
  onToggleAlbumsSlideBar,
  onOpenCloudVaultModal,
  isSlideBarOpen = false
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
  const [mobileTab, setMobileTab] = useState<'player' | 'queue'>('player');
  const [isNowPlayingModalOpen, setIsNowPlayingModalOpen] = useState(false);

  const scrubberRef = useRef<HTMLDivElement | null>(null);
  const mobileScrubberRef = useRef<HTMLDivElement | null>(null);

  // Active playlist / album info
  const activePlaylist = playlists.find(p => p.id === activePlaylistId) || playlists[0];
  const albumTitle = currentTrack?.album || activePlaylist?.title || 'CLOUD VAULT FAVORITES';
  
  // Sanitized current track
  const cleanCurrentTrack = currentTrack ? sanitizeTrack(currentTrack) : null;
  const artistName = cleanCurrentTrack?.artist || 'VAULTX ARTIST';
  
  const getTrackCover = (cover?: string) => {
    if (!cover || cover.includes('photo-1470225620780') || cover.includes('unsplash.com')) {
      return '/artwork.png';
    }
    return cover;
  };

  const displayCover = getTrackCover(cleanCurrentTrack?.coverUrl);
  const isLiked = cleanCurrentTrack ? likedTrackIds.includes(cleanCurrentTrack.id) : false;

  // Next up tracks: tracks following current track in context
  const nextUpTracks: Track[] = contextTracks.length > 0
    ? contextTracks.filter((_, idx) => idx !== contextIndex)
    : [];

  // Scrubber progress %
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleSeekFromClientX = (targetRef: React.RefObject<HTMLDivElement | null>, clientX: number) => {
    if (!targetRef.current || duration <= 0) return;
    const rect = targetRef.current.getBoundingClientRect();
    const clickX = clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    seek(ratio * duration);
  };

  const handleScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSeekFromClientX(scrubberRef, e.clientX);
  };

  const handleMobileScrubberClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleSeekFromClientX(mobileScrubberRef, e.clientX);
  };

  const handleMobileScrubberTouch = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches && e.touches[0]) {
      handleSeekFromClientX(mobileScrubberRef, e.touches[0].clientX);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  return (
    <div className="relative w-full h-[100dvh] md:h-screen bg-[#07090b] flex items-center justify-center p-0 md:p-3 lg:p-6 select-none overflow-hidden">
      {/* 1. Audio-Reactive Background Lighting & Dynamic Particle Visualizer */}
      <AudioReactiveBackground />

      {/* 2. Floating Minimalist Player Window */}
      <div 
        className="relative z-10 w-full max-w-6xl xl:max-w-7xl h-full md:max-h-[880px] lg:max-h-[900px] bg-[#0c0d10]/95 backdrop-blur-2xl border-0 md:border border-white/10 rounded-none md:rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.85)] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-300 transition-shadow duration-500"
        style={{
          boxShadow: isPlaying 
            ? `0 25px 80px -15px ${cleanCurrentTrack?.dominantColor ? cleanCurrentTrack.dominantColor + '40' : 'rgba(234,165,153,0.25)'}`
            : '0 25px 60px -15px rgba(0,0,0,0.85)'
        }}
      >
        
        {/* TOP BAR / WINDOW CHROME */}
        <header className="h-14 px-3 sm:px-6 border-b border-white/5 flex items-center justify-between flex-shrink-0 bg-[#090a0d]/90">
          {/* Left: Enhanced Library & Albums Explorer Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={onToggleAlbumsSlideBar}
              className={`flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white transition-opacity duration-200 group border border-white/5 shadow-sm active:scale-95 ${
                isSlideBarOpen ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
              }`}
              title="Open Library Explorer (Albums, Artists, Tracks, Favorites)"
            >
              <Menu size={16} className="text-white group-hover:text-[#EAA599] group-hover:scale-110 transition-all" />
              <span className="text-xs font-bold tracking-wider uppercase text-white">
                Library
              </span>
            </button>

            {/* Audio-Reactive Beat Indicator */}
            {isPlaying && (
              <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#EAA599]/10 border border-[#EAA599]/25 text-[#EAA599] text-[10px] font-semibold tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-[#EAA599] animate-ping inline-block" />
                <span>BEAT REACTIVE</span>
              </div>
            )}
          </div>

          {/* Center on Mobile: Segmented Tab Switcher [Now Playing | Musics] */}
          <div className="flex md:hidden items-center p-0.5 bg-black/40 border border-white/10 rounded-full shadow-inner">
            <button
              onClick={() => setMobileTab('player')}
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all ${
                mobileTab === 'player'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Player
            </button>
            <button
              onClick={() => setMobileTab('queue')}
              className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide transition-all flex items-center gap-1.5 ${
                mobileTab === 'queue'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <span>Musics</span>
              {nextUpTracks.length > 0 && (
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-[#EAA599]/20 text-[#EAA599] font-bold">
                  {nextUpTracks.length}
                </span>
              )}
            </button>
          </div>

          {/* Right: Cloud Vault & Fullscreen */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Cloud Vault Connection Button */}
            <button
              onClick={onOpenCloudVaultModal}
              className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-xs font-medium border transition ${
                isCloudSynced
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/15'
                  : 'bg-white/5 border-white/10 text-neutral-400 hover:text-white'
              }`}
              title="Cloudflare R2 Vault Settings"
            >
              <Cloud size={14} className={isCloudSynced ? 'text-[#EAA599]' : ''} />
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

        {/* ============================================================== */}
        {/* DESKTOP BODY: 2-COLUMN VIEW (ARTWORK ON LEFT, MUSICS ON RIGHT) */}
        {/* ============================================================== */}
        <div className="hidden md:flex flex-1 flex-row overflow-hidden">
          
          {/* COLUMN 1: ALIVE HERO ALBUM ARTWORK DISPLAY (LEFT - WITH ORBITAL ELEMENTS) */}
          <section className="flex-1 flex items-center justify-center p-3 sm:p-4 lg:p-6 overflow-hidden bg-[#090a0d]/40">
            <div className="relative flex items-center justify-center max-w-[620px] lg:max-w-[680px] xl:max-w-[720px] w-full aspect-square">
              
              {/* 1. Subtle Orbital Ring with Traveling Cosmic Starlet */}
              <div
                className={`absolute -inset-4 sm:-inset-6 rounded-full border border-[#EAA599]/20 pointer-events-none transition-opacity duration-1000 ${
                  isPlaying ? 'opacity-80 animate-orbital-spin' : 'opacity-20'
                }`}
              >
                <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-[#f3cbc4] shadow-[0_0_12px_#f3cbc4]" />
                <div className="absolute -bottom-1 left-1/3 w-2 h-2 rounded-full bg-white/70 shadow-[0_0_8px_white]" />
              </div>

              {/* 2. Counter-Orbiting Faint Stardust Ring */}
              <div
                className={`absolute -inset-8 sm:-inset-11 rounded-full border border-dashed border-white/10 pointer-events-none transition-opacity duration-1000 ${
                  isPlaying ? 'opacity-60 animate-orbital-counter' : 'opacity-0'
                }`}
              >
                <div className="absolute top-1/4 -right-1 w-2 h-2 rounded-full bg-[#EAA599] shadow-[0_0_8px_#EAA599]" />
              </div>

              {/* 3. Hero Artwork Card (Alive Floating & Breathing Animation) */}
              <div
                className={`relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#ece3d6] group flex flex-col justify-between p-6 sm:p-8 select-none transition-all duration-700 ${
                  isPlaying ? 'animate-artwork-float shadow-[0_25px_70px_-15px_rgba(234,165,153,0.3)]' : 'shadow-2xl'
                }`}
              >
                {/* Actual Album Artwork Image Background */}
                <img
                  src={displayCover}
                  alt={cleanCurrentTrack?.title || 'Album Artwork'}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Subtle Ambient Vignette Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

                {/* Artwork Top Header: Geometric Logo & Album Title */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  {/* Geometric Logo */}
                  <div
                    onClick={onToggleAlbumsSlideBar}
                    className="w-9 h-9 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition text-white border border-white/20 shadow-lg"
                    title="Click to view Library"
                  >
                    <div className="grid grid-cols-2 gap-0.5">
                      <span className="w-1.5 h-1.5 bg-[#f3cbc4] rounded-full" />
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span className="w-1.5 h-1.5 bg-[#f3cbc4] rounded-full" />
                    </div>
                  </div>

                  {/* Album Title */}
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

                {/* Artwork Bottom Header: Artist Name & Lyrics/Info Trigger */}
                <div className="relative z-10 flex items-end justify-between w-full">
                  <span className="text-xs sm:text-sm font-black tracking-widest text-white uppercase drop-shadow-md bg-black/40 backdrop-blur-md px-3.5 py-1 rounded-full border border-white/10">
                    {artistName}
                  </span>

                  {/* Right Button: Pulsing Audio Wave + Details Trigger */}
                  <button
                    onClick={() => setIsNowPlayingModalOpen(true)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/50 hover:bg-black/75 backdrop-blur-md border border-white/15 text-white hover:text-[#EAA599] transition active:scale-95 shadow-md group/btn"
                    title="View Lyrics, Credits & Visualizer"
                  >
                    {isPlaying ? (
                      <div className="flex items-end gap-0.5 h-3.5">
                        <span className="w-0.5 h-2.5 bg-[#f3cbc4] rounded-full animate-pulse" />
                        <span className="w-0.5 h-3.5 bg-white/90 rounded-full animate-bounce delay-75" />
                        <span className="w-0.5 h-1.5 bg-[#f3cbc4] rounded-full animate-pulse delay-150" />
                      </div>
                    ) : (
                      <Mic2 size={13} className="text-neutral-300 group-hover/btn:text-[#EAA599]" />
                    )}
                    <span className="text-[11px] font-bold tracking-wider uppercase">Info</span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* COLUMN 2: MUSICS / QUEUE (RIGHT SIDE - ENHANCED INTERACTIVITY) */}
          <section className="w-full md:w-[340px] lg:w-[360px] xl:w-[380px] flex flex-col p-4 sm:p-5 lg:p-6 border-l border-white/5 overflow-hidden bg-[#0c0d10]/95 flex-shrink-0">
            
            {/* 1. Header: PLAYING FROM */}
            <div className="mb-3">
              <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                Playing From: {albumTitle}
              </span>
            </div>

            {/* 2. Currently Playing Track Card (Active Track Indicator with Equalizer / Glowing Border) */}
            {cleanCurrentTrack && (
              <div 
                onClick={() => setIsNowPlayingModalOpen(true)}
                className={`flex items-center justify-between p-2.5 rounded-xl transition-all duration-300 mb-5 cursor-pointer ${
                  isPlaying
                    ? 'bg-white/[0.08] border border-[#EAA599]/40 shadow-[0_0_20px_-5px_rgba(234,165,153,0.3)]'
                    : 'bg-white/5 border border-white/10 shadow-sm'
                }`}
                title="Click to view lyrics & details"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={getTrackCover(cleanCurrentTrack.coverUrl)}
                    alt={cleanCurrentTrack.title}
                    className="w-11 h-11 rounded-lg object-cover flex-shrink-0 shadow-md"
                  />
                  <div className="min-w-0 pr-2">
                    {/* Track Title: Bold White (Primary Slot) */}
                    <h4 className="text-sm font-bold text-white truncate">
                      {cleanCurrentTrack.title}
                    </h4>
                    {/* Artist Name: Muted Grey (Subtitle Slot) */}
                    <p className="text-xs text-neutral-400 truncate mt-0.5">
                      {cleanCurrentTrack.artist}
                    </p>
                  </div>
                </div>

                {/* Active Indicator Button: Equalizer when playing / Pause on hover / Play when paused */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="group/btn relative w-8 h-8 rounded-full bg-white/10 hover:bg-[#EAA599] text-white hover:text-black flex items-center justify-center flex-shrink-0 cursor-pointer transition shadow-sm"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? (
                    <>
                      {/* Animated Equalizer Icon (Visible by default while playing) */}
                      <div className="flex items-end gap-0.5 h-3.5 group-hover/btn:hidden">
                        <span className="w-0.5 h-3 bg-[#EAA599] rounded-full animate-pulse" />
                        <span className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-75" />
                        <span className="w-0.5 h-3.5 bg-[#EAA599] rounded-full animate-pulse delay-150" />
                      </div>
                      {/* Pause Icon (Revealed on hover) */}
                      <Pause size={14} className="hidden group-hover/btn:block fill-current" />
                    </>
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

            {/* 4. Scrollable List of Tracks (Enhanced Hover Background, Selected State & Durations) */}
            <div className="flex-1 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
              {nextUpTracks.length === 0 ? (
                <div className="text-center py-10 text-xs text-neutral-500">
                  No other tracks in this album
                </div>
              ) : (
                nextUpTracks.map((rawTrack) => {
                  const track = sanitizeTrack(rawTrack);
                  const isSelected = currentTrack?.id === track.id;
                  const isThisPlaying = isSelected && isPlaying;

                  return (
                    <div
                      key={track.id}
                      onClick={() => playTrack(track)}
                      className={`group relative flex items-center justify-between p-2.5 rounded-xl border transition-all duration-200 cursor-pointer active:scale-[0.99] ${
                        isSelected
                          ? 'bg-white/[0.09] border-[#EAA599]/35 shadow-sm'
                          : 'border-transparent hover:border-white/10 hover:bg-white/[0.07] hover:shadow-md'
                      }`}
                    >
                      {/* Left Active Accent Pill */}
                      {isSelected && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-7 rounded-r-full bg-[#EAA599]" />
                      )}

                      <div className="flex items-center gap-3 min-w-0 pl-1">
                        {/* Cover with Hover Play Overlay */}
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-neutral-800 shadow-sm">
                          <img
                            src={getTrackCover(track.coverUrl)}
                            alt={track.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                            <Play size={14} className="fill-white text-white ml-0.5" />
                          </div>
                        </div>

                        <div className="min-w-0 pr-2">
                          {/* Title: Bold White (Primary) */}
                          <span className={`text-sm font-semibold truncate block transition-colors ${
                            isSelected ? 'text-[#EAA599]' : 'text-white group-hover:text-white'
                          }`}>
                            {track.title}
                          </span>
                          {/* Artist: Muted Grey */}
                          <span className="text-xs text-neutral-400 group-hover:text-neutral-300 truncate block mt-0.5">
                            {track.artist}
                          </span>
                        </div>
                      </div>

                      {/* Right-aligned Duration or Equalizer + Hover Remove */}
                      <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                        {isThisPlaying ? (
                          <div className="flex items-end gap-0.5 h-3 px-1">
                            <span className="w-0.5 h-3 bg-[#EAA599] rounded-full animate-pulse" />
                            <span className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-75" />
                            <span className="w-0.5 h-3 bg-[#EAA599] rounded-full animate-pulse delay-150" />
                          </div>
                        ) : (
                          <span className="text-xs text-neutral-400 group-hover:text-neutral-300 tabular-nums font-mono">
                            {formatTime(track.durationSec || 180)}
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFromQueue(track.id);
                          }}
                          className="w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition"
                          title="Remove from queue"
                        >
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        </div>

        {/* ============================================================== */}
        {/* MOBILE BODY: BESPOKE RESPONSIVE LAYOUT (VISIBLE ON < md)       */}
        {/* ============================================================== */}
        <div className="flex md:hidden flex-1 flex-col overflow-hidden">
          {mobileTab === 'player' ? (
            /* MOBILE TAB 1: PLAYER VIEW */
            <div className="flex-1 flex flex-col justify-between p-4 overflow-y-auto">
              
              {/* Centered Artwork Display with Alive Orbital Ring */}
              <div className="flex-1 flex items-center justify-center py-2 min-h-0">
                <div className="relative flex items-center justify-center w-full max-w-[290px] xs:max-w-[320px] aspect-square">
                  
                  {/* Subtle Orbital Ring */}
                  <div
                    className={`absolute -inset-3 rounded-full border border-[#EAA599]/20 pointer-events-none transition-opacity duration-1000 ${
                      isPlaying ? 'opacity-80 animate-orbital-spin' : 'opacity-20'
                    }`}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[#f3cbc4] shadow-[0_0_8px_#f3cbc4]" />
                  </div>

                  {/* Artwork Card with Alive Floating Motion */}
                  <div
                    className={`relative aspect-square w-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 bg-[#ece3d6] flex flex-col justify-between p-4 select-none transition-all duration-700 ${
                      isPlaying ? 'animate-artwork-float shadow-[0_20px_50px_-10px_rgba(234,165,153,0.3)]' : 'shadow-2xl'
                    }`}
                  >
                    {/* Artwork Image */}
                    <img
                      src={displayCover}
                      alt={cleanCurrentTrack?.title || 'Album Artwork'}
                      className="absolute inset-0 w-full h-full object-cover"
                    />

                    {/* Subtle Ambient Vignette */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40 pointer-events-none" />

                    {/* Artwork Top Header */}
                    <div className="relative z-10 flex items-center justify-between w-full">
                      <div
                        onClick={onToggleAlbumsSlideBar}
                        className="w-8 h-8 rounded-full bg-black/60 backdrop-blur-md flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition text-white border border-white/20 shadow-lg"
                        title="Click to view Library"
                      >
                        <div className="grid grid-cols-2 gap-0.5">
                          <span className="w-1.5 h-1.5 bg-[#f3cbc4] rounded-full" />
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          <span className="w-1.5 h-1.5 bg-white rounded-full" />
                          <span className="w-1.5 h-1.5 bg-[#f3cbc4] rounded-full" />
                        </div>
                      </div>

                      <span className="text-[10px] font-black tracking-widest text-white uppercase drop-shadow-md bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 max-w-[150px] truncate">
                        {albumTitle}
                      </span>
                    </div>

                    {/* Center Play/Pause Touch Overlay */}
                    <div
                      onClick={togglePlay}
                      className="absolute inset-0 flex items-center justify-center cursor-pointer z-10"
                    >
                      <div className="w-14 h-14 rounded-full bg-[#f3cbc4]/90 hover:bg-white text-black flex items-center justify-center shadow-2xl transform active:scale-90 transition-transform">
                        {isPlaying ? (
                          <Pause size={24} className="fill-black" />
                        ) : (
                          <Play size={24} className="fill-black ml-1" />
                        )}
                      </div>
                    </div>

                    {/* Artwork Bottom Header */}
                    <div className="relative z-10 flex items-end justify-between w-full">
                      <span className="text-[10px] font-black tracking-widest text-white uppercase drop-shadow-md bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10 max-w-[150px] truncate">
                        {artistName}
                      </span>

                      {isPlaying && (
                        <div className="flex items-end gap-0.5 h-4 px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
                          <span className="w-0.5 h-2.5 bg-[#f3cbc4] rounded-full animate-pulse" />
                          <span className="w-0.5 h-3.5 bg-white/90 rounded-full animate-bounce delay-75" />
                          <span className="w-0.5 h-1.5 bg-[#f3cbc4] rounded-full animate-pulse delay-150" />
                          <span className="w-0.5 h-3.5 bg-white/90 rounded-full animate-bounce delay-100" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Track Title, Artist & Like Info */}
              <div className="w-full max-w-[340px] mx-auto flex items-center justify-between px-2 pt-2">
                <div 
                  onClick={() => setIsNowPlayingModalOpen(true)}
                  className="min-w-0 pr-3 cursor-pointer"
                >
                  <h3 className="text-base font-bold text-white truncate drop-shadow-sm">
                    {cleanCurrentTrack?.title || 'No track selected'}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {artistName} • <span className="text-neutral-500 uppercase tracking-wider">{albumTitle}</span>
                  </p>
                </div>

                <button
                  onClick={() => cleanCurrentTrack && toggleLike(cleanCurrentTrack.id)}
                  className={`p-2 rounded-full hover:bg-white/10 active:scale-90 transition ${
                    isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-400 hover:text-white'
                  }`}
                  title={isLiked ? 'Unlike' : 'Like'}
                >
                  <Heart size={20} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                </button>
              </div>

              {/* Mobile Lyrics & Credits Button Chip */}
              <div className="w-full max-w-[340px] mx-auto flex items-center justify-between px-2 pt-1 pb-1">
                <button
                  onClick={() => setIsNowPlayingModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 border border-white/10 text-xs font-semibold active:scale-95"
                >
                  <Mic2 size={12} className="text-[#EAA599]" />
                  <span>Lyrics & Credits</span>
                </button>
                <span className="text-[10px] text-neutral-500 font-mono">
                  320 KBPS • MP3
                </span>
              </div>

              {/* Scrubber Timeline & Playback Controls on Mobile */}
              <div className="w-full max-w-[340px] mx-auto flex flex-col gap-2.5 pb-2">
                {/* Timeline Scrubber */}
                <div className="flex flex-col gap-1">
                  <div
                    ref={mobileScrubberRef}
                    onClick={handleMobileScrubberClick}
                    onTouchStart={handleMobileScrubberTouch}
                    onTouchMove={handleMobileScrubberTouch}
                    className="w-full h-4 flex items-center cursor-pointer group"
                  >
                    <div className="w-full h-1.5 bg-white/20 rounded-full relative overflow-hidden">
                      <div
                        className="h-full bg-white group-hover:bg-[#EAA599] rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-neutral-400 tabular-nums px-0.5">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                </div>

                {/* Main Playback Buttons */}
                <div className="flex items-center justify-between px-2 pt-1">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2 transition active:scale-95 ${
                      isShuffle ? 'text-[#EAA599]' : 'text-neutral-400 hover:text-white'
                    }`}
                    title="Shuffle"
                  >
                    <Shuffle size={18} />
                  </button>

                  <button
                    onClick={previousTrack}
                    className="p-2 text-neutral-200 hover:text-white transition active:scale-95"
                    title="Previous"
                  >
                    <SkipBack size={22} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-13 h-13 rounded-full bg-white text-black flex items-center justify-center shadow-xl active:scale-90 transition transform"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? (
                      <Pause size={22} className="fill-black text-black" />
                    ) : (
                      <Play size={22} className="fill-black text-black ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-2 text-neutral-200 hover:text-white transition active:scale-95"
                    title="Next"
                  >
                    <SkipForward size={22} />
                  </button>

                  <button
                    onClick={toggleRepeat}
                    className={`p-2 transition active:scale-95 ${
                      repeatMode !== 'off' ? 'text-[#EAA599]' : 'text-neutral-400 hover:text-white'
                    }`}
                    title={`Repeat: ${repeatMode}`}
                  >
                    {repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}
                  </button>
                </div>

                {/* Mobile Volume Slider */}
                <div className="flex items-center gap-2.5 px-3 pt-1">
                  <button
                    onClick={toggleMute}
                    className="text-neutral-400 hover:text-white transition flex-shrink-0"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
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

            </div>
          ) : (
            /* MOBILE TAB 2: MUSICS / QUEUE VIEW */
            <div className="flex-1 flex flex-col overflow-hidden bg-[#0c0d10]/95">
              
              <div className="p-4 flex-1 overflow-y-auto custom-scrollbar">
                {/* Header: PLAYING FROM */}
                <div className="mb-2">
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Playing From: {albumTitle}
                  </span>
                </div>

                {/* Active Track Card on Mobile */}
                {cleanCurrentTrack && (
                  <div 
                    onClick={() => setMobileTab('player')}
                    className={`flex items-center justify-between p-3 rounded-xl shadow-sm mb-4 cursor-pointer active:scale-98 transition-all ${
                      isPlaying
                        ? 'bg-white/[0.09] border border-[#EAA599]/40 shadow-[0_0_20px_-5px_rgba(234,165,153,0.3)]'
                        : 'bg-white/10 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={getTrackCover(cleanCurrentTrack.coverUrl)}
                        alt={cleanCurrentTrack.title}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-md"
                      />
                      <div className="min-w-0 pr-2">
                        {/* Title: Bold White */}
                        <h4 className="text-sm font-bold text-white truncate">
                          {cleanCurrentTrack.title}
                        </h4>
                        {/* Artist: Muted Grey */}
                        <p className="text-xs text-neutral-400 truncate mt-0.5">
                          {cleanCurrentTrack.artist}
                        </p>
                      </div>
                    </div>

                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePlay();
                      }}
                      className="w-9 h-9 rounded-full bg-white/15 text-white hover:bg-[#EAA599] hover:text-black flex items-center justify-center flex-shrink-0 cursor-pointer active:scale-90 transition"
                      title={isPlaying ? 'Pause' : 'Play'}
                    >
                      {isPlaying ? (
                        <div className="flex items-end gap-0.5 h-3.5">
                          <span className="w-0.5 h-3 bg-[#EAA599] rounded-full animate-pulse" />
                          <span className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-75" />
                          <span className="w-0.5 h-3.5 bg-[#EAA599] rounded-full animate-pulse delay-150" />
                        </div>
                      ) : (
                        <Play size={16} className="fill-current ml-0.5" />
                      )}
                    </div>
                  </div>
                )}

                {/* Header: NEXT UP */}
                <div className="mb-2.5 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-widest text-neutral-400 uppercase">
                    Next Up From: {albumTitle}
                  </span>
                  <span className="text-[11px] text-neutral-500 font-medium">
                    {nextUpTracks.length} tracks
                  </span>
                </div>

                {/* Track List with Interactive States */}
                <div className="space-y-1 pb-16">
                  {nextUpTracks.length === 0 ? (
                    <div className="text-center py-12 text-xs text-neutral-500">
                      No other tracks in this album
                    </div>
                  ) : (
                    nextUpTracks.map((rawTrack) => {
                      const track = sanitizeTrack(rawTrack);
                      const isSelected = currentTrack?.id === track.id;
                      const isThisPlaying = isSelected && isPlaying;

                      return (
                        <div
                          key={track.id}
                          onClick={() => playTrack(track)}
                          className={`flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-white/10 border-[#EAA599]/35'
                              : 'border-transparent hover:bg-white/5 active:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={getTrackCover(track.coverUrl)}
                              alt={track.title}
                              className="w-10 h-10 rounded-lg object-cover flex-shrink-0 bg-neutral-800"
                            />
                            <div className="min-w-0 pr-2">
                              <span className={`text-sm font-semibold truncate block ${isSelected ? 'text-[#EAA599]' : 'text-white'}`}>
                                {track.title}
                              </span>
                              <span className="text-xs text-neutral-400 truncate block mt-0.5">
                                {track.artist}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0 pl-2">
                            {isThisPlaying ? (
                              <div className="flex items-end gap-0.5 h-3 px-1">
                                <span className="w-0.5 h-3 bg-[#EAA599] rounded-full animate-pulse" />
                                <span className="w-0.5 h-2 bg-white rounded-full animate-bounce delay-75" />
                                <span className="w-0.5 h-3 bg-[#EAA599] rounded-full animate-pulse delay-150" />
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400 tabular-nums font-mono">
                                {formatTime(track.durationSec || 180)}
                              </span>
                            )}

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFromQueue(track.id);
                              }}
                              className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white transition"
                              title="Remove from queue"
                            >
                              <X size={15} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Mobile Sticky Mini-Player Bar at bottom of Queue view */}
              <div className="relative h-16 px-4 border-t border-white/10 bg-[#090a0d] flex items-center justify-between gap-3 select-none flex-shrink-0">
                {/* Thin progress line at top of mini bar */}
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-white/10">
                  <div
                    className="h-full bg-[#EAA599] transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>

                <div
                  onClick={() => setMobileTab('player')}
                  className="flex items-center gap-2.5 min-w-0 flex-1 cursor-pointer"
                >
                  <img
                    src={displayCover}
                    alt={cleanCurrentTrack?.title || 'Mini Player'}
                    className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                  />
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-bold text-white truncate">
                      {cleanCurrentTrack?.title || 'No track selected'}
                    </p>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {artistName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={previousTrack}
                    className="p-1.5 text-neutral-300 hover:text-white transition active:scale-95"
                  >
                    <SkipBack size={18} />
                  </button>

                  <button
                    onClick={togglePlay}
                    className="w-9 h-9 rounded-full bg-white text-black flex items-center justify-center shadow-md active:scale-90 transition"
                  >
                    {isPlaying ? (
                      <Pause size={16} className="fill-black text-black" />
                    ) : (
                      <Play size={16} className="fill-black text-black ml-0.5" />
                    )}
                  </button>

                  <button
                    onClick={nextTrack}
                    className="p-1.5 text-neutral-300 hover:text-white transition active:scale-95"
                  >
                    <SkipForward size={18} />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* DESKTOP BOTTOM PLAYBACK BAR (MATCHES REFERENCE BOTTOM DECK)    */}
        {/* ============================================================== */}
        <footer className="hidden md:flex h-20 sm:h-22 px-4 sm:px-6 border-t border-white/5 bg-[#090a0d]/95 items-center justify-between gap-3 select-none flex-shrink-0">
          
          {/* LEFT: Current Track Details, Like & Options */}
          <div className="w-[30%] min-w-[160px] flex items-center gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {/* Title: Bold White - Clickable to open lyrics & credits */}
                <span 
                  onClick={() => setIsNowPlayingModalOpen(true)}
                  className="text-sm font-bold text-white truncate max-w-[180px] sm:max-w-[210px] cursor-pointer hover:text-[#EAA599] transition"
                  title="Click to view Lyrics & Credits"
                >
                  {cleanCurrentTrack?.title || 'No track selected'}
                </span>

                {/* Heart / Like Button */}
                {cleanCurrentTrack && (
                  <button
                    onClick={() => toggleLike(cleanCurrentTrack.id)}
                    className={`transition hover:scale-110 active:scale-95 ${
                      isLiked ? 'text-red-500 fill-red-500' : 'text-neutral-400 hover:text-white'
                    }`}
                    title={isLiked ? 'Unlike' : 'Like'}
                  >
                    <Heart size={15} className={isLiked ? 'fill-red-500 text-red-500' : ''} />
                  </button>
                )}

                {/* Lyrics & Credits Pill */}
                <button
                  onClick={() => setIsNowPlayingModalOpen(true)}
                  className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 text-neutral-300 hover:text-white border border-white/5 text-[11px] font-medium transition active:scale-95"
                  title="Lyrics, Credits & Visualizer"
                >
                  <Mic2 size={12} className="text-[#EAA599]" />
                  <span className="hidden xl:inline">Lyrics</span>
                </button>

                {/* More Options */}
                <button
                  onClick={onOpenCloudVaultModal}
                  className="text-neutral-400 hover:text-white transition"
                  title="More Options"
                >
                  <MoreHorizontal size={15} />
                </button>
              </div>

              {/* Artist Name: Muted Grey */}
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

              {/* Play / Pause */}
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
              title="Toggle Library Explorer"
            >
              <ChevronDown size={17} />
            </button>
          </div>
        </footer>

      </div>

      {/* 3. Now Playing Detail Modal (Lyrics, Credits & Visualizer) */}
      <NowPlayingDetailModal
        isOpen={isNowPlayingModalOpen}
        onClose={() => setIsNowPlayingModalOpen(false)}
      />
    </div>
  );
};
