import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowUpRight, Check, Cloud, Disc3, Heart, Music2, Play, Search, UserRound, X } from 'lucide-react';
import { usePlayerStore } from '../../store/usePlayerStore';
import { sanitizeTrack } from '../../utils/trackSanitizer';
import { formatTime } from '../../utils/formatTime';
import type { Playlist, Track } from '../../types';
import './library.css';
import { PersonalLibrary } from './PersonalLibrary';

interface AlbumsSlideBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCloudVaultModal: () => void;
}

type LibraryCategory = 'albums' | 'artists' | 'tracks' | 'favorites' | 'playlists' | 'recent';
const categories: { id: LibraryCategory; label: string }[] = [
  { id: 'playlists', label: 'Playlists' },
  { id: 'recent', label: 'Recent' },
  { id: 'albums', label: 'Albums' },
  { id: 'artists', label: 'Artists' },
  { id: 'tracks', label: 'Songs' },
  { id: 'favorites', label: 'Favorites' },
];

const artworkFor = (url?: string) => !url || url.includes('unsplash.com') ? './artwork.png' : url;

export const AlbumsSlideBar: React.FC<AlbumsSlideBarProps> = ({ isOpen, onClose, onOpenCloudVaultModal }) => {
  const personalPlaylists = usePlayerStore(s => s.personalPlaylists);
  const recentlyPlayed = usePlayerStore(s => s.recentlyPlayed);
  const playlists = usePlayerStore(state => state.playlists);
  const activePlaylistId = usePlayerStore(state => state.activePlaylistId);
  const currentTrack = usePlayerStore(state => state.currentTrack);
  const likedTrackIds = usePlayerStore(state => state.likedTrackIds);
  const isCloudSynced = usePlayerStore(state => state.isCloudSynced);
  const cloudTrackCount = usePlayerStore(state => state.cloudTrackCount);
  const playTrack = usePlayerStore(state => state.playTrack);
  const navigateTo = usePlayerStore(state => state.navigateTo);
  const [activeCategory, setActiveCategory] = useState<LibraryCategory>('albums');
  const [query, setQuery] = useState('');
  const panelRef = useRef<HTMLElement>(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const panel = panelRef.current;
    const focusable = () => Array.from(panel?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex="0"]'
    ) || []);
    focusable()[0]?.focus();

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeRef.current();
      }
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const keepFocusInside = (event: FocusEvent) => {
      if (event.target instanceof Node && !panel?.contains(event.target)) focusable()[0]?.focus();
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('focusin', keepFocusInside);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('focusin', keepFocusInside);
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus();
    };
  }, [isOpen]);

  const allTracks = useMemo(() => Array.from(new Map(
    [...playlists, ...personalPlaylists].flatMap(playlist => playlist.tracks).map(track => [track.id, sanitizeTrack(track)])
  ).values()), [playlists, personalPlaylists]);
  const artistList = useMemo(() => {
    const artists = new Map<string, Track[]>();
    allTracks.forEach(track => {
      const artist = track.artist.split(',')[0].trim();
      artists.set(artist, [...(artists.get(artist) || []), track]);
    });
    return Array.from(artists.entries()).map(([artist, tracks]) => ({ artist, tracks }));
  }, [allTracks]);
  const favoriteTracks = allTracks.filter(track => likedTrackIds.includes(track.id));
  const primaryAlbum = playlists.find(playlist => playlist.id === activePlaylistId)
    || playlists.find(playlist => playlist.tracks.some(track => track.id === currentTrack?.id))
    || playlists[0];
  const needle = query.toLocaleLowerCase().trim();
  const matches = (text: string) => text.toLocaleLowerCase().includes(needle);
  const filteredAlbums = playlists.filter(album => matches(`${album.title} ${album.creator}`));
  const filteredArtists = artistList.filter(({ artist }) => matches(artist));
  const trackContext = activeCategory === 'recent' ? recentlyPlayed : activeCategory === 'favorites' ? favoriteTracks : allTracks;
  const filteredTracks = trackContext.filter(track => matches(`${track.title} ${track.artist} ${track.album}`));

  const selectAlbum = (album: Playlist) => {
    navigateTo('home', album.id);
    if (album.tracks.length) playTrack(album.tracks[0], album.tracks);
    onClose();
  };
  const selectTrack = (track: Track, context: Track[]) => {
    const album = playlists.find(playlist => playlist.tracks.some(item => item.id === track.id));
    if (album) navigateTo('home', album.id);
    playTrack(track, context);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="vx-library-layer">
      <div className="vx-library-backdrop" onClick={onClose} aria-hidden="true" />
      <aside ref={panelRef} className="vx-library" role="dialog" aria-modal="true" aria-labelledby="vx-library-title">
        <header className="vx-library-header">
          <div>
            <span className="vx-library-eyebrow">CURATED BY YOU</span>
            <h2 id="vx-library-title">Your library<span>.</span></h2>
            <p>{allTracks.length} songs. A world of your own.</p>
          </div>
          <button className="vx-library-icon-button" onClick={onClose} aria-label="Close library"><X size={20} aria-hidden="true" /></button>
        </header>

        <div className="vx-library-search">
          <Search size={17} aria-hidden="true" />
          <input value={query} onChange={event => setQuery(event.target.value)} placeholder="Find something you love" aria-label="Search library" />
          {query && <button className="vx-library-clear" onClick={() => setQuery('')} aria-label="Clear library search"><X size={16} aria-hidden="true" /></button>}
        </div>

        <nav className="vx-library-tabs" aria-label="Library categories">
          {categories.map(category => (
            <button key={category.id} aria-pressed={activeCategory === category.id} onClick={() => setActiveCategory(category.id)}>
              {category.label}
            </button>
          ))}
        </nav>

        <div className="vx-library-content">
          {activeCategory === 'playlists' && <PersonalLibrary allTracks={allTracks} onPlay={selectAlbum} query={query} />}
          {activeCategory === 'albums' && (
            <>
              {!needle && primaryAlbum && (
                <section className="vx-library-feature">
                  <div className="vx-library-section-title"><span>On your turntable</span><Disc3 size={15} aria-hidden="true" /></div>
                  <button className="vx-library-feature-button" onClick={() => selectAlbum(primaryAlbum)} disabled={!primaryAlbum.tracks.length}>
                    <img src={artworkFor(primaryAlbum.coverUrl)} alt="" />
                    <span className="vx-library-feature-caption">
                      <span><strong>{primaryAlbum.title}</strong><small>{primaryAlbum.tracks.length} songs · {primaryAlbum.creator || 'Your collection'}</small></span>
                      <span className="vx-library-play"><Play size={18} fill="currentColor" aria-hidden="true" /></span>
                    </span>
                  </button>
                </section>
              )}
              <div className="vx-library-section-title"><span>{needle ? 'Matching collections' : 'All collections'}</span><span>{filteredAlbums.length}</span></div>
              <div className="vx-library-collections">
                {filteredAlbums.map(album => (
                  <button key={album.id} className="vx-library-album" onClick={() => selectAlbum(album)} disabled={!album.tracks.length}>
                    <span className="vx-library-album-art"><img src={artworkFor(album.coverUrl)} alt="" loading="lazy" />{primaryAlbum?.id === album.id && <span className="vx-library-album-active"><Check size={12} aria-hidden="true" /><span className="sr-only">Current collection</span></span>}</span>
                    <strong>{album.title}</strong>
                    <small>{album.tracks.length} songs</small>
                  </button>
                ))}
              </div>
              {filteredAlbums.length === 0 && <LibraryEmpty icon={<Disc3 size={25} />} title="No collections found" description="Try a different title or clear your search." />}
            </>
          )}

          {activeCategory === 'artists' && (
            <>
              <div className="vx-library-section-title"><span>The voices in your vault</span><span>{filteredArtists.length}</span></div>
              <div className="vx-library-rows">
                {filteredArtists.map(({ artist, tracks }, index) => (
                  <button key={artist} className="vx-library-row" onClick={() => selectTrack(tracks[0], tracks)}>
                    <span className="vx-library-artist-avatar" data-tone={index % 3}>{artist.charAt(0).toUpperCase()}</span>
                    <span className="vx-library-row-copy"><strong>{artist}</strong><small>{tracks.length} {tracks.length === 1 ? 'song' : 'songs'}</small></span>
                    <ArrowUpRight size={17} className="vx-library-row-end" aria-hidden="true" />
                  </button>
                ))}
              </div>
              {filteredArtists.length === 0 && <LibraryEmpty icon={<UserRound size={25} />} title="No artists found" description="Try another name or clear your search." />}
            </>
          )}

          {(activeCategory === 'tracks' || activeCategory === 'favorites' || activeCategory === 'recent') && (
            <>
              <div className="vx-library-section-title"><span>{activeCategory === 'recent' ? 'Recently played' : activeCategory === 'favorites' ? 'Worth another listen' : 'Every song, all in one place'}</span><span>{filteredTracks.length}</span></div>
              <div className="vx-library-rows">
                {filteredTracks.map(track => (
                  <button key={track.id} className={`vx-library-row ${currentTrack?.id === track.id ? 'is-current' : ''}`} onClick={() => selectTrack(track, trackContext)}>
                    <span className="vx-library-song-art"><img src={artworkFor(track.coverUrl)} alt="" loading="lazy" />{currentTrack?.id === track.id && <span className="vx-library-song-playing"><Music2 size={17} aria-hidden="true" /></span>}</span>
                    <span className="vx-library-row-copy"><strong>{track.title}</strong><small>{track.artist}</small></span>
                    <span className="vx-library-row-duration">{formatTime(track.durationSec)}</span>
                  </button>
                ))}
              </div>
              {filteredTracks.length === 0 && <LibraryEmpty icon={activeCategory === 'favorites' ? <Heart size={25} /> : <Music2 size={25} />} title={activeCategory === 'recent' && !needle ? 'Your listening story starts here' : needle ? 'Nothing here just yet' : activeCategory === 'favorites' ? 'Keep your favorites close' : 'Your next favorite is out there'} description={activeCategory === 'recent' && !needle ? 'Play a song and find it here next time.' : needle ? 'Try another song or artist.' : activeCategory === 'favorites' ? 'Tap the heart on a song to find it here.' : 'Connect your cloud vault to bring in your collection.'} />}
            </>
          )}
        </div>

        <footer className="vx-library-footer">
          <button onClick={() => { onClose(); onOpenCloudVaultModal(); }}>
            <span className="vx-library-cloud-icon"><Cloud size={20} aria-hidden="true" /></span>
            <span><strong>Your cloud vault</strong><small>{isCloudSynced ? `${cloudTrackCount} songs connected` : 'Connect your personal collection'}</small></span>
            {isCloudSynced ? <span className="vx-library-online" aria-label="Connected" /> : <ArrowUpRight size={18} aria-hidden="true" />}
          </button>
        </footer>
      </aside>
    </div>
  );
};

function LibraryEmpty({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return <div className="vx-library-empty"><span aria-hidden="true">{icon}</span><h3>{title}</h3><p>{description}</p></div>;
}
