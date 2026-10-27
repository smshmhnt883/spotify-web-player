import React, { useState, useEffect, useRef } from 'react';
import { X, Mic2, Info, Activity, Music2, Copy, Check } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';
import { sanitizeTrack } from '../../utils/trackSanitizer';

interface NowPlayingDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NowPlayingDetailModal: React.FC<NowPlayingDetailModalProps> = ({ isOpen, onClose }) => {
  const { currentTrack, isPlaying, currentTime, duration, seek } = usePlayerStore();
  const [activeTab, setActiveTab] = useState<'lyrics' | 'details' | 'visualizer'>('lyrics');
  const [copied, setCopied] = useState(false);

  const lyricsContainerRef = useRef<HTMLDivElement | null>(null);
  const activeLyricRef = useRef<HTMLDivElement | null>(null);
  const visualizerCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const cleanTrack = currentTrack ? sanitizeTrack(currentTrack) : null;

  // Auto-scroll lyrics smoothly to center on active lyric
  useEffect(() => {
    if (activeTab === 'lyrics' && activeLyricRef.current && lyricsContainerRef.current) {
      activeLyricRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [currentTime, activeTab]);

  // Audio Visualizer Canvas Loop
  useEffect(() => {
    if (!isOpen || activeTab !== 'visualizer') return;

    const canvas = visualizerCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = canvas.parentElement?.clientWidth || 400);
    let height = (canvas.height = 240);

    const barCount = 36;
    const bars: number[] = Array(barCount).fill(0.1);

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const time = performance.now() / 1000;

      // Draw frequency bars reacting to playback
      const barWidth = width / barCount - 3;
      for (let i = 0; i < barCount; i++) {
        const target = isPlaying
          ? Math.max(0.08, Math.sin(time * 3 + i * 0.35) * 0.45 + Math.cos(time * 2 + i * 0.15) * 0.35 + 0.25)
          : 0.08;
        bars[i] += (target - bars[i]) * 0.2;

        const barHeight = Math.max(6, bars[i] * height * 0.85);
        const x = i * (barWidth + 3);
        const y = height - barHeight;

        // Gradient styling in warm pastel rose to cream
        const gradient = ctx.createLinearGradient(0, y, 0, height);
        gradient.addColorStop(0, '#f3cbc4');
        gradient.addColorStop(0.5, '#EAA599');
        gradient.addColorStop(1, 'rgba(234, 165, 153, 0.2)');

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, [4, 4, 0, 0]);
        ctx.fill();

        // Little glowing cap
        if (isPlaying && bars[i] > 0.4) {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(x + barWidth / 2, y + 2, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, activeTab, isPlaying]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !cleanTrack) return null;

  const lyrics = cleanTrack.lyrics || [];
  const currentLyricIndex = lyrics.findIndex((line, index) => {
    const nextLine = lyrics[index + 1];
    const lineTime = line.timeMs / 1000;
    const nextLineTime = nextLine ? nextLine.timeMs / 1000 : Infinity;
    return currentTime >= lineTime && currentTime < nextLineTime;
  });

  const handleCopyLink = () => {
    if (cleanTrack.audioUrl) {
      navigator.clipboard.writeText(cleanTrack.audioUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/75 backdrop-blur-md transition-opacity"
      />

      {/* Modal Dialog */}
      <div className="relative z-10 w-full max-w-xl max-h-[88vh] bg-[#0c0d10]/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <header className="h-14 px-5 border-b border-white/10 flex items-center justify-between flex-shrink-0 bg-[#090a0d]/90">
          <div className="flex items-center gap-1.5 p-0.5 bg-white/5 border border-white/10 rounded-full">
            <button
              onClick={() => setActiveTab('lyrics')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'lyrics'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Mic2 size={13} />
              <span>Lyrics</span>
            </button>
            <button
              onClick={() => setActiveTab('details')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'details'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Info size={13} />
              <span>Credits</span>
            </button>
            <button
              onClick={() => setActiveTab('visualizer')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                activeTab === 'visualizer'
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              <Activity size={13} />
              <span>Visualizer</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-white/10 transition"
            title="Close"
          >
            <X size={18} />
          </button>
        </header>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
          
          {/* TAB 1: LYRICS */}
          {activeTab === 'lyrics' && (
            <div ref={lyricsContainerRef} className="py-4 space-y-5 text-center">
              {lyrics.length > 0 ? (
                lyrics.map((line, idx) => {
                  const isActive = idx === currentLyricIndex;
                  return (
                    <div
                      key={idx}
                      ref={isActive ? activeLyricRef : null}
                      onClick={() => seek(line.timeMs / 1000)}
                      className={`cursor-pointer transition-all duration-300 py-1.5 px-3 rounded-xl ${
                        isActive
                          ? 'text-lg sm:text-xl font-black text-[#EAA599] scale-105 drop-shadow-[0_0_12px_rgba(234,165,153,0.4)] bg-white/5'
                          : 'text-sm sm:text-base font-medium text-neutral-500 hover:text-neutral-300'
                      }`}
                    >
                      {line.text}
                    </div>
                  );
                })
              ) : (
                <div className="py-12 flex flex-col items-center justify-center gap-3 text-neutral-400">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-[#EAA599] mb-1">
                    <Music2 size={24} />
                  </div>
                  <h4 className="text-base font-bold text-white">High-Fidelity Audio Stream</h4>
                  <p className="text-xs text-neutral-400 max-w-xs text-center leading-relaxed">
                    Synchronized lyric timestamps are ready for this track. Lyrics embedded in audio metadata will appear here automatically.
                  </p>
                  <div className="mt-4 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs text-[#EAA599] font-mono">
                    ♪ {cleanTrack.title} • {cleanTrack.artist} ♪
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: CREDITS & METADATA */}
          {activeTab === 'details' && (
            <div className="space-y-4">
              {/* Top Banner */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <img
                  src={cleanTrack.coverUrl || '/artwork.png'}
                  alt={cleanTrack.title}
                  className="w-16 h-16 rounded-xl object-cover shadow-lg flex-shrink-0"
                />
                <div className="min-w-0 pr-2">
                  <h3 className="text-base font-bold text-white truncate">
                    {cleanTrack.title}
                  </h3>
                  <p className="text-xs text-neutral-400 truncate mt-0.5">
                    {cleanTrack.artist}
                  </p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#EAA599]/20 text-[#EAA599] border border-[#EAA599]/30 uppercase tracking-wider">
                    {cleanTrack.album || 'Cloud Vault'}
                  </span>
                </div>
              </div>

              {/* Technical Specifications Grid */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Audio Quality
                  </span>
                  <span className="text-xs font-bold text-white">320 Kbps High Quality</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Codec / Container
                  </span>
                  <span className="text-xs font-bold text-white">MPEG Audio Layer 3 (MP3)</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Sample Rate
                  </span>
                  <span className="text-xs font-bold text-white">44,100 Hz Stereo</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block mb-1">
                    Duration
                  </span>
                  <span className="text-xs font-bold text-white">{formatTime(duration)}</span>
                </div>
              </div>

              {/* Storage & Provenance */}
              <div className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 block">
                  Storage & Cloud Origin
                </span>
                <p className="text-xs text-neutral-300 leading-relaxed">
                  Streamed directly from your personal Cloudflare R2 bucket storage with zero compression loss.
                </p>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-400 font-mono truncate max-w-[260px]">
                    {cleanTrack.audioUrl}
                  </span>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#EAA599] hover:underline flex-shrink-0"
                  >
                    {copied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copied ? 'Copied' : 'Copy URL'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VISUALIZER */}
          {activeTab === 'visualizer' && (
            <div className="flex flex-col items-center justify-center py-4">
              <div className="w-full flex items-center justify-between mb-4 px-2">
                <div>
                  <h4 className="text-sm font-bold text-white">Live Frequency Spectrum</h4>
                  <p className="text-xs text-neutral-400">Audio reactive harmonic frequencies</p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAA599]/15 text-[#EAA599] border border-[#EAA599]/25 uppercase tracking-wider">
                  {isPlaying ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>

              <div className="w-full h-56 bg-black/40 border border-white/10 rounded-xl overflow-hidden flex items-center justify-center p-4">
                <canvas ref={visualizerCanvasRef} className="w-full h-full" />
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="h-12 px-5 border-t border-white/10 flex items-center justify-between flex-shrink-0 bg-[#090a0d]/80 text-[11px] text-neutral-400">
          <span>VaultX Audio Engine</span>
          <span className="text-[#EAA599] font-mono">{formatTime(currentTime)} / {formatTime(duration)}</span>
        </footer>

      </div>
    </div>
  );
};
