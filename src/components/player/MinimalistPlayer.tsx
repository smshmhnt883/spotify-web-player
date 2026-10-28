import { memo, useEffect, useMemo, useRef, useState, type CSSProperties, type SyntheticEvent } from 'react';
import { useShallow } from 'zustand/react/shallow';
import { ArrowUpRight, Check, Cloud, Disc3, Heart, Library, ListMusic, Maximize2, Minimize2, Music2, Pause, Play, Plus, Repeat, Repeat1, Search, Shuffle, SkipBack, SkipForward, Volume2, VolumeX, X } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { formatTime } from '../../utils/formatTime';
import { sanitizeTrack } from '../../utils/trackSanitizer';
import { NowPlayingDetailModal } from '../modals/NowPlayingDetailModal';
import type { Track } from '../../types';
import './player.css';

interface MinimalistPlayerProps {
  onToggleAlbumsSlideBar: () => void;
  onOpenCloudVaultModal: () => void;
  isSlideBarOpen?: boolean;
}

const fallbackCover = `${import.meta.env.BASE_URL}artwork.png`;
const coverFor = (track: Track | null) => {
  const cover = track?.coverUrl;
  return !cover || cover === '/artwork.png' || cover.includes('unsplash.com') ? fallbackCover : cover;
};
const imageFallback = (event: SyntheticEvent<HTMLImageElement>) => {
  if (!event.currentTarget.src.endsWith('/artwork.png')) event.currentTarget.src = fallbackCover;
};

function Equalizer({ playing }: { playing: boolean }) {
  return <span className={`vx-equalizer ${playing ? 'is-playing' : ''}`} aria-hidden="true"><i /><i /><i /><i /></span>;
}

const Timeline = memo(function Timeline() {
  const currentTime = usePlayerStore(s => s.currentTime);
  const duration = usePlayerStore(s => s.duration);
  const seek = usePlayerStore(s => s.seek);
  const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
  const value = Math.min(Math.max(currentTime, 0), safeDuration);
  return <div className="vx-timeline">
    <span>{formatTime(value)}</span>
    <input type="range" min="0" max={safeDuration || 1} step="2" value={value} disabled={!safeDuration}
      aria-label="Playback position" aria-valuetext={`${formatTime(value)} of ${formatTime(safeDuration)}`}
      style={{ '--progress': `${safeDuration ? value / safeDuration * 100 : 0}%` } as CSSProperties}
      onChange={event => seek(Number(event.target.value))} />
    <span>{formatTime(safeDuration)}</span>
  </div>;
});

export function MinimalistPlayer({ onToggleAlbumsSlideBar, onOpenCloudVaultModal, isSlideBarOpen = false }: MinimalistPlayerProps) {
  const state = usePlayerStore(useShallow(s => ({
    currentTrack: s.currentTrack, isPlaying: s.isPlaying, volume: s.volume, isMuted: s.isMuted,
    isShuffle: s.isShuffle, repeatMode: s.repeatMode, likedTrackIds: s.likedTrackIds,
    contextTracks: s.contextTracks, contextIndex: s.contextIndex, playlists: s.playlists,
    userQueue: s.userQueue, cloudSyncStatus: s.cloudSyncStatus, isCloudSynced: s.isCloudSynced,
    playTrack: s.playTrack, togglePlay: s.togglePlay, nextTrack: s.nextTrack,
    previousTrack: s.previousTrack, setVolume: s.setVolume, toggleMute: s.toggleMute,
    toggleShuffle: s.toggleShuffle, toggleRepeat: s.toggleRepeat, toggleLike: s.toggleLike,
    addToQueue: s.addToQueue, removeFromQueue: s.removeFromQueue,
  })));
  const { currentTrack, isPlaying, contextTracks, contextIndex, playlists, userQueue, likedTrackIds } = state;
  const [filter, setFilter] = useState<'album' | 'favorites' | 'queue'>('album');
  const [query, setQuery] = useState('');
  const [detailOpen, setDetailOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [notice, setNotice] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const trackListRef = useRef<HTMLElement>(null);
  const allTracks = useMemo(() => Array.from(new Map(playlists.flatMap(p => p.tracks).map(t => [t.id, sanitizeTrack(t)])).values()), [playlists]);
  const track = useMemo(() => currentTrack ? sanitizeTrack(currentTrack) : null, [currentTrack]);
  const liked = !!track && likedTrackIds.includes(track.id);
  const searching = query.trim().length > 0;
  const displayedTracks = useMemo(() => {
    const tracks = searching ? allTracks : filter === 'favorites' ? allTracks.filter(t => likedTrackIds.includes(t.id)) : filter === 'queue' ? userQueue : contextTracks;
    const term = query.trim().toLocaleLowerCase();
    return tracks.map(sanitizeTrack).filter(t => !term || `${t.title} ${t.artist} ${t.album}`.toLocaleLowerCase().includes(term));
  }, [searching, allTracks, filter, likedTrackIds, userQueue, contextTracks, query]);

  useEffect(() => {
    const handler = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);
  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(''), 2600);
    return () => window.clearTimeout(timer);
  }, [notice]);
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.closest('input, textarea, select, [contenteditable="true"], [role="dialog"]') || document.querySelector('[aria-modal="true"]')) return;
      if (event.key === '/' && !event.ctrlKey && !event.metaKey) { event.preventDefault(); searchRef.current?.focus(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else setNotice('Fullscreen is not available in this browser.');
    } catch { setNotice('Fullscreen is not available right now.'); }
  };
  const selectTrack = (selected: Track) => {
    if (currentTrack?.id === selected.id) state.togglePlay();
    else {
      state.playTrack(selected, filter === 'queue' && !searching ? contextTracks : displayedTracks);
      if (filter === 'queue' && !searching) state.removeFromQueue(selected.id);
    }
  };
  const showQueue = () => { setQuery(''); setFilter('queue'); trackListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); };

  return <div className="vx-app">
    <a className="vx-skip-link" href="#listening-room">Skip to player</a>
    <header className="vx-header">
      <a className="vx-brand" href="#listening-room" aria-label="VaultX home"><span className="vx-brand-mark" aria-hidden="true"><i /><i /><i /></span>vault<span>x</span><small>MUSIC</small></a>
      <nav className="vx-nav" aria-label="Main navigation">
        <a href="#listening-room" className="is-active" aria-current="page">Listen</a>
        <button onClick={onToggleAlbumsSlideBar} aria-expanded={isSlideBarOpen}><Library size={16} aria-hidden="true" /> Your library</button>
      </nav>
      <div className="vx-search"><Search size={17} aria-hidden="true" />
        <input ref={searchRef} aria-label="Search your music" placeholder="Find something good" value={query} onChange={event => setQuery(event.target.value)} onKeyDown={event => { if (event.key === 'Escape') { setQuery(''); searchRef.current?.blur(); } }} />
        {query ? <button aria-label="Clear search" onClick={() => setQuery('')}><X size={16} /></button> : <kbd>/</kbd>}
      </div>
      <button className={`vx-cloud-button ${state.cloudSyncStatus === 'error' ? 'has-error' : ''}`} onClick={onOpenCloudVaultModal} aria-label="Cloud vault settings">
        <Cloud size={17} aria-hidden="true" /><span>{state.cloudSyncStatus === 'syncing' ? 'Connecting…' : state.cloudSyncStatus === 'error' ? 'Connect vault' : state.isCloudSynced ? 'Vault connected' : 'Connect vault'}</span>
        <span className={`vx-status-dot ${state.isCloudSynced && state.cloudSyncStatus !== 'error' ? 'is-online' : ''}`} aria-hidden="true" />
      </button>
    </header>

    <main className="vx-main" id="listening-room" tabIndex={-1}>
      <div className="vx-intro"><div><p className="vx-eyebrow">A LITTLE SPACE. A LOT OF SOUND.</p><h1>The listening <em>room.</em></h1></div>
        <button className="vx-collection-link" onClick={onToggleAlbumsSlideBar}><span>Your personal collection<strong>{allTracks.length} tracks, always within reach</strong></span><ArrowUpRight size={21} aria-hidden="true" /></button>
      </div>
      <div className="vx-listening-grid">
        <section className="vx-turntable" aria-label="Now playing">
          <div className="vx-section-caption"><span><span className={`vx-live-dot ${isPlaying ? 'is-playing' : ''}`} /> {isPlaying ? 'NOW PLAYING' : 'ON THE TURNTABLE'}</span><span>SIDE A · {String(contextIndex + 1).padStart(2, '0')}</span></div>
          <div className="vx-artwork-stage"><div className="vx-orbit-line" aria-hidden="true" />
            <div className={`vx-vinyl ${isPlaying ? 'is-playing' : ''}`} aria-hidden="true"><div className="vx-vinyl-label"><Disc3 size={25} /><span>VAULTX<br />PERSONAL PRESSING</span></div></div>
            <button className={`vx-artwork ${isPlaying ? 'is-playing' : ''}`} onClick={() => setDetailOpen(true)} aria-label={`Open details for ${track?.title || 'current track'}`} disabled={!track}>
              <img src={coverFor(track)} alt={`${track?.album || 'VaultX'} cover artwork`} onError={imageFallback} />
              <span className="vx-artwork-stamp"><span>VX</span><span>THE PERSONAL<br />COLLECTION</span></span><span className="vx-artwork-action">Lyrics & track details <ArrowUpRight size={17} aria-hidden="true" /></span>
            </button>
          </div>
          <div className="vx-track-heading"><div className="vx-track-copy"><p>{track?.album || 'Your music collection'}</p><h2 title={track?.title}>{track?.title || 'Make yourself at home'}</h2><span>{track?.artist || 'Choose a track from your library'}</span></div>
            <button className={`vx-icon-button vx-like-button ${liked ? 'is-active' : ''}`} disabled={!track} aria-label={liked ? 'Remove current track from favorites' : 'Add current track to favorites'} aria-pressed={liked} onClick={() => track && state.toggleLike(track.id)}><Heart size={22} fill={liked ? 'currentColor' : 'none'} /></button>
          </div>
          <div className="vx-turntable-foot"><span><Equalizer playing={isPlaying} /> {isPlaying ? 'A good place to get lost.' : 'Settle in. Press play.'}</span><button onClick={() => setDetailOpen(true)} disabled={!track}>Behind the track <ArrowUpRight size={14} aria-hidden="true" /></button></div>
        </section>

        <section className="vx-rotation" ref={trackListRef} aria-labelledby="rotation-heading">
          <div className="vx-rotation-heading"><div><p className="vx-eyebrow">KEEP THE GOOD THINGS GOING</p><h2 id="rotation-heading">{searching ? 'Found in your vault' : 'In rotation'}<span>.</span></h2></div><button className="vx-icon-button" aria-label="Browse your library" onClick={onToggleAlbumsSlideBar}><ListMusic size={22} /></button></div>
          <div className="vx-list-tabs" aria-label="Track filters">{(['album', 'favorites', 'queue'] as const).map(value => <button key={value} className={!searching && filter === value ? 'is-active' : ''} aria-pressed={!searching && filter === value} onClick={() => { setFilter(value); setQuery(''); }}>{value === 'album' ? 'This collection' : value === 'favorites' ? 'Favorites' : 'Queue'}{value === 'queue' && userQueue.length > 0 && <span>{userQueue.length}</span>}</button>)}</div>
          <div className="vx-list-caption"><span>{searching ? `Results for “${query.trim()}”` : filter === 'favorites' ? 'Your saved favorites' : filter === 'queue' ? 'Plays next, in this order' : track?.album || 'Selected collection'}</span><span>{displayedTracks.length} tracks</span></div>
          <div className="vx-track-list">
            {displayedTracks.length === 0 ? <div className="vx-empty-state"><Music2 size={30} strokeWidth={1.3} aria-hidden="true" /><h3>{searching ? 'Nothing here just yet.' : filter === 'favorites' ? 'Keep the ones you love.' : 'Make room for your next favorite.'}</h3><p>{searching ? 'Try another track, album, or artist.' : filter === 'favorites' ? 'Tap the heart on a track to find it here.' : 'Use the plus beside a track to add it to your queue.'}</p><button onClick={() => { setQuery(''); setFilter('album'); }}>Back to collection <ArrowUpRight size={15} /></button></div> : displayedTracks.map((item, index) => {
              const selected = currentTrack?.id === item.id;
              const isFavorite = likedTrackIds.includes(item.id);
              const queued = userQueue.some(t => t.id === item.id);
              return <div className={`vx-track-row ${selected ? 'is-current' : ''}`} key={`${item.id}-${index}`}>
                <button className="vx-track-select" onClick={() => selectTrack(item)} aria-label={`${selected && isPlaying ? 'Pause' : 'Play'} ${item.title} by ${item.artist}`} aria-current={selected ? 'true' : undefined}>
                  <span className="vx-track-number">{selected ? <Equalizer playing={isPlaying} /> : String(index + 1).padStart(2, '0')}</span>
                  <span className="vx-row-cover"><img src={coverFor(item)} alt="" loading="lazy" onError={imageFallback} /><span>{selected && isPlaying ? <Pause size={15} fill="currentColor" /> : <Play size={15} fill="currentColor" />}</span></span>
                  <span className="vx-row-copy"><strong title={item.title}>{item.title}</strong><span>{item.artist}</span></span><span className="vx-track-duration">{formatTime(item.durationSec)}</span>
                </button>
                <button className={`vx-row-action ${isFavorite ? 'is-active' : ''}`} aria-label={`${isFavorite ? 'Unfavorite' : 'Favorite'} ${item.title}`} aria-pressed={isFavorite} onClick={() => state.toggleLike(item.id)}><Heart size={16} fill={isFavorite ? 'currentColor' : 'none'} /></button>
                <button className="vx-row-action" aria-label={`${filter === 'queue' && !searching ? 'Remove' : queued ? 'Already queued:' : 'Queue'} ${item.title}`} disabled={queued && (filter !== 'queue' || searching)} onClick={() => {
                  if (filter === 'queue' && !searching) state.removeFromQueue(item.id);
                  else { state.addToQueue(item); setNotice(`Added to queue: ${item.title}`); }
                }}>{filter === 'queue' && !searching ? <X size={16} /> : queued ? <Check size={16} /> : <Plus size={16} />}</button>
              </div>;
            })}
          </div>
          <div className="vx-library-note"><Disc3 size={27} strokeWidth={1.2} aria-hidden="true" /><span>A collection that's entirely you.<small>Find an old favorite. Stay for one more.</small></span><button className="vx-icon-button" onClick={onToggleAlbumsSlideBar} aria-label="Explore all collections"><ArrowUpRight size={20} /></button></div>
        </section>
      </div>
      <div className="vx-room-footer"><span>YOUR MUSIC. YOUR OWN LITTLE UNIVERSE.</span><span>Made for listening <span aria-hidden="true">↗</span></span></div>
    </main>

    <footer className="vx-playback" aria-label="Playback controls">
      <button className="vx-playing-summary" onClick={() => setDetailOpen(true)} disabled={!track} aria-label="Open current track details"><img src={coverFor(track)} alt="" onError={imageFallback} /><span><strong>{track?.title || 'Nothing playing yet'}</strong><span>{track?.artist || 'Choose your soundtrack'}</span></span><Equalizer playing={isPlaying} /></button>
      <div className="vx-transport"><div className="vx-transport-buttons">
        <button className={`vx-icon-button ${state.isShuffle ? 'is-active' : ''}`} onClick={state.toggleShuffle} aria-label="Shuffle" aria-pressed={state.isShuffle} title="Shuffle"><Shuffle size={18} /></button>
        <button className="vx-icon-button" onClick={state.previousTrack} aria-label="Previous track" title="Previous track"><SkipBack size={21} fill="currentColor" /></button>
        <button className="vx-play-button" onClick={state.togglePlay} aria-label={isPlaying ? 'Pause' : 'Play'} disabled={!track}>{isPlaying ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}</button>
        <button className="vx-icon-button" onClick={state.nextTrack} aria-label="Next track" title="Next track"><SkipForward size={21} fill="currentColor" /></button>
        <button className={`vx-icon-button ${state.repeatMode !== 'off' ? 'is-active' : ''}`} onClick={state.toggleRepeat} aria-label={`Repeat: ${state.repeatMode}`} aria-pressed={state.repeatMode !== 'off'} title={`Repeat: ${state.repeatMode}`}>{state.repeatMode === 'one' ? <Repeat1 size={18} /> : <Repeat size={18} />}</button>
      </div><Timeline /></div>
      <div className="vx-player-tools">
        <button className="vx-icon-button" onClick={state.toggleMute} aria-label={state.isMuted ? 'Unmute' : 'Mute'}>{state.isMuted || state.volume === 0 ? <VolumeX size={19} /> : <Volume2 size={19} />}</button>
        <input className="vx-volume" type="range" aria-label="Volume" min="0" max="1" step="0.01" value={state.isMuted ? 0 : state.volume} onChange={e => state.setVolume(Number(e.target.value))} style={{ '--progress': `${state.volume * 100}%` } as CSSProperties} />
        <span className="vx-tool-divider" /><button className={`vx-icon-button ${filter === 'queue' ? 'is-active' : ''}`} onClick={showQueue} aria-label="Show queue" title="Show queue"><ListMusic size={19} /></button>
        <button className="vx-icon-button vx-fullscreen" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen' : 'Fullscreen'} title="Fullscreen">{fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}</button>
      </div>
    </footer>
    <div className={`vx-toast ${notice ? 'is-visible' : ''}`} role="status">{notice && <><Check size={17} aria-hidden="true" />{notice}</>}</div>
    <NowPlayingDetailModal isOpen={detailOpen} onClose={() => setDetailOpen(false)} />
  </div>;
}
