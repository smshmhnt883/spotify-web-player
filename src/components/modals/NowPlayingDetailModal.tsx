import React, { useEffect, useRef, useState } from 'react';
import { X, Music2, Copy, Check, Pause, Play } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';
import { sanitizeTrack } from '../../utils/trackSanitizer';
import './vault-modals.css';

interface NowPlayingDetailModalProps { isOpen: boolean; onClose: () => void; }

export const NowPlayingDetailModal: React.FC<NowPlayingDetailModalProps> = ({ isOpen, onClose }) => {
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const isPlaying = usePlayerStore(state => state.isPlaying);
  const currentTime = usePlayerStore(state => state.currentTime);
  const duration = usePlayerStore(state => state.duration);
  const seek = usePlayerStore(state => state.seek);
  const togglePlay = usePlayerStore(state => state.togglePlay);
  const [activeTab, setActiveTab] = useState<'lyrics' | 'details' | 'visualizer'>('lyrics');
  const [copyStatus, setCopyStatus] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const activeLyricRef = useRef<HTMLButtonElement>(null);
  const lyricsContainerRef = useRef<HTMLDivElement>(null);
  const cleanTrack = currentTrack ? sanitizeTrack(currentTrack) : null;
  const lyrics = cleanTrack?.lyrics || [];
  const activeLyricIndex = lyrics.findIndex((line, index) => currentTime >= line.timeMs / 1000 && currentTime < (lyrics[index + 1]?.timeMs ?? Infinity) / 1000);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (isOpen && currentTrack) {
      if (!dialog?.open) dialog?.showModal();
    } else if (dialog?.open) dialog.close();
  }, [isOpen, currentTrack]);

  useEffect(() => { setCopyStatus(''); }, [currentTrack?.id]);

  useEffect(() => {
    if (!isOpen || activeTab !== 'lyrics' || !activeLyricRef.current || !lyricsContainerRef.current) return;
    const line = activeLyricRef.current;
    const container = lyricsContainerRef.current;
    container.scrollTo({ top: line.offsetTop - container.clientHeight / 2 + line.clientHeight / 2, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  }, [activeLyricIndex, activeTab, isOpen]);

  const copyLink = async () => {
    if (!cleanTrack) return;
    try {
      await navigator.clipboard.writeText(cleanTrack.audioUrl);
      setCopyStatus('Link copied');
    } catch { setCopyStatus('Copy unavailable. Select the link to copy it.'); }
  };

  let source = 'Local audio';
  let format = 'Audio stream';
  if (cleanTrack) {
    try {
      const url = new URL(cleanTrack.audioUrl, window.location.href);
      source = url.protocol === 'blob:' ? 'Local audio file' : url.hostname;
      const extension = url.pathname.match(/\.([a-z0-9]+)$/i)?.[1];
      if (extension) format = extension.toUpperCase();
    } catch { /* Keep generic labels when metadata is unavailable. */ }
  }

  return (
    <dialog ref={dialogRef} className="vx-dialog vx-track-dialog" aria-labelledby="track-dialog-title" onKeyDown={event => event.stopPropagation()} onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <section className="vx-dialog-surface">
        <header className="vx-dialog-header"><span className="vx-modal-eyebrow">A CLOSER LISTEN</span><button className="vx-modal-icon-button" onClick={onClose} aria-label="Close track details" autoFocus><X size={20} /></button></header>
        {cleanTrack && <>
          <div className="vx-modal-track-heading"><img src={cleanTrack.coverUrl || './artwork.png'} alt={`${cleanTrack.album} artwork`} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = './artwork.png'; }} /><div><h2 id="track-dialog-title">{cleanTrack.title}</h2><p>{cleanTrack.artist}</p></div></div>
          <nav className="vx-modal-tabs" aria-label="Track information">
            {(['lyrics', 'details', 'visualizer'] as const).map(tab => <button key={tab} className={activeTab === tab ? 'is-active' : ''} onClick={() => setActiveTab(tab)} aria-pressed={activeTab === tab}>{tab === 'visualizer' ? 'Ambience' : tab === 'details' ? 'Track details' : 'Lyrics'}</button>)}
          </nav>
          <div className="vx-track-content">
            {activeTab === 'lyrics' && <div ref={lyricsContainerRef} className="vx-lyrics">
              {lyrics.length ? lyrics.map((line, index) => <button key={`${line.timeMs}-${index}`} ref={activeLyricIndex === index ? activeLyricRef : null} className={activeLyricIndex === index ? 'is-active' : ''} aria-current={activeLyricIndex === index ? 'true' : undefined} onClick={() => seek(line.timeMs / 1000)} title={`Seek to ${formatTime(line.timeMs / 1000)}`}>{line.text}</button>) : <div className="vx-modal-empty-state"><Music2 size={28} strokeWidth={1.3} /><h3>Just the music, for now.</h3><p>Lyrics haven’t been added to this track.</p></div>}
            </div>}
            {activeTab === 'details' && <div className="vx-track-details">
              <dl><div><dt>Artist</dt><dd>{cleanTrack.artist}</dd></div><div><dt>Collection</dt><dd>{cleanTrack.album || 'Personal library'}</dd></div><div><dt>Duration</dt><dd>{formatTime(duration)}</dd></div><div><dt>File format</dt><dd>{format}</dd></div>{cleanTrack.releaseYear && <div><dt>Released</dt><dd>{cleanTrack.releaseYear}</dd></div>}</dl>
              <div className="vx-audio-source"><span className="vx-modal-eyebrow">AUDIO SOURCE</span><p>{source}</p><input readOnly value={cleanTrack.audioUrl} aria-label="Audio source URL" onFocus={event => event.currentTarget.select()} /><button className="vx-text-button" onClick={copyLink}>{copyStatus === 'Link copied' ? <Check size={15} /> : <Copy size={15} />}Copy audio link</button>{copyStatus && <p className="vx-helper" role="status">{copyStatus}</p>}</div>
            </div>}
            {activeTab === 'visualizer' && <div className="vx-ambience"><div className={`vx-ambient-bars ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true">{Array.from({ length: 27 }, (_, index) => <i key={index} style={{ '--bar-height': `${20 + Math.sin(index * 0.8) ** 2 * 70}%`, '--bar-delay': `${index * -0.13}s` } as React.CSSProperties} />)}</div><h3>Settle into the sound.</h3><p>A little motion to accompany your music.</p><span className="vx-helper">Ambient animation · {isPlaying ? 'Playing' : 'Paused'}</span></div>}
          </div>
          <footer className="vx-dialog-footer"><span className="vx-playback-time">{formatTime(currentTime)} <span>/ {formatTime(duration)}</span></span><button className="vx-text-button" onClick={togglePlay}>{isPlaying ? <Pause size={16} /> : <Play size={16} />}{isPlaying ? 'Pause' : 'Play'}</button></footer>
        </>}
      </section>
    </dialog>
  );
};
