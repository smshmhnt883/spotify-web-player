import { useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Playlist, Track } from '../../types';

export function PersonalLibrary({ allTracks, onPlay, query }: { allTracks: Track[]; onPlay: (p: Playlist) => void; query: string }) {
  const playlists = usePlayerStore(s => s.personalPlaylists);
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [deleting, setDeleting] = useState(false);
  const p = playlists.find(p => p.id === id);
  const actions = usePlayerStore.getState();
  return <section className="vx-personal-editor">
    <form onSubmit={e => { e.preventDefault(); if (p) actions.renamePlaylist(p.id, name); else setId(actions.createPlaylist(name)); }}>
      <label htmlFor="library-playlist-name">{p ? 'Playlist name' : 'Create a playlist'}</label>
      <input id="library-playlist-name" value={name} maxLength={100} onChange={e => setName(e.target.value)} required />
      <button disabled={!name.trim()}>{p ? 'Save name' : 'Create playlist'}</button>
    </form>
    {p ? <>
      <button onClick={() => { setId(''); setName(''); setDeleting(false); }}>Back to playlists</button>
      <h3>{p.title}</h3>
      <div className="vx-personal-actions"><button disabled={!p.tracks.length} onClick={() => onPlay(p)}>Play playlist</button><button onClick={() => setDeleting(true)}>Delete playlist</button></div>
      {deleting && <div role="alert">Delete “{p.title}”?<div className="vx-personal-actions"><button onClick={() => { actions.deletePlaylist(p.id); setId(''); setName(''); setDeleting(false); }}>Confirm delete</button><button onClick={() => setDeleting(false)}>Cancel</button></div></div>}
      {!p.tracks.length && <p>No songs yet. Choose a song below or use Add to playlist beside a song.</p>}
      {p.tracks.map((t, index) => <div className="vx-personal-track" key={t.id}><span>{t.title}</span><div>
        <button aria-label={`Move ${t.title} up`} disabled={index === 0} onClick={() => actions.movePlaylistTrack(p.id, index, -1)}>↑</button>
        <button aria-label={`Move ${t.title} down`} disabled={index === p.tracks.length - 1} onClick={() => actions.movePlaylistTrack(p.id, index, 1)}>↓</button>
        <button aria-label={`Remove ${t.title} from playlist`} onClick={() => actions.removeFromPlaylist(p.id, t.id)}>Remove</button>
      </div></div>)}
      <label htmlFor="library-add-song">Add a song</label>
      <select id="library-add-song" value="" onChange={e => { const t = allTracks.find(t => t.id === e.target.value); if (t) actions.addToPlaylist(p.id, t); }}><option value="">Choose a song…</option>{allTracks.filter(t => !p.tracks.some(item => item.id === t.id)).map(t => <option key={t.id} value={t.id}>{t.title} — {t.artist}</option>)}</select>
    </> : <>{playlists.filter(p => p.title.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())).map(p => <button className="vx-playlist-choice" key={p.id} onClick={() => { setId(p.id); setName(p.title); setDeleting(false); }}>{p.title}<span>{p.tracks.length} songs · Edit</span></button>)}{!playlists.length && <p>Create your first playlist above.</p>}</>}
  </section>;
}
