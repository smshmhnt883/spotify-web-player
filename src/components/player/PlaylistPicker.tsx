import { useEffect, useRef, useState } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';
import type { Track } from '../../types';

export function PlaylistPicker({ track, onClose }: { track: Track | null; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [name, setName] = useState('');
  const playlists = usePlayerStore(s => s.personalPlaylists);
  const add = usePlayerStore(s => s.addToPlaylist);
  const create = usePlayerStore(s => s.createPlaylist);
  useEffect(() => {
    if (track) { setName(''); dialog.current?.showModal(); }
    else dialog.current?.close();
  }, [track]);
  return <dialog ref={dialog} className="vx-playlist-picker" aria-labelledby="playlist-picker-title" onCancel={e => { e.preventDefault(); onClose(); }}>
    <header><h2 id="playlist-picker-title">Add to playlist</h2><button onClick={onClose} aria-label="Close playlist picker">Close</button></header>
    <p>{track?.title}</p>
    {playlists.map(p => <button className="vx-playlist-choice" key={p.id} disabled={p.tracks.some(t => t.id === track?.id)} onClick={() => { if (track) add(p.id, track); onClose(); }}>{p.title}<span>{p.tracks.some(t => t.id === track?.id) ? 'Already added' : `${p.tracks.length} songs`}</span></button>)}
    <form onSubmit={e => { e.preventDefault(); const id = create(name); if (id && track) { add(id, track); onClose(); } }}>
      <label htmlFor="new-playlist-name">New playlist name</label><input id="new-playlist-name" value={name} maxLength={100} onChange={e => setName(e.target.value)} required />
      <button disabled={!name.trim()}>Create & add song</button>
    </form>
  </dialog>;
}
