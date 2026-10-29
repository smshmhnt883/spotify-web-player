import { useEffect } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export function readAudioDuration(url: string, signal: AbortSignal): Promise<number | null> {
  return new Promise(resolve => {
    if (signal.aborted) { resolve(null); return; }
    const audio = new Audio();
    const finish = (duration: number | null) => {
      clearTimeout(timeout);
      audio.removeEventListener('loadedmetadata', loaded);
      audio.removeEventListener('durationchange', loaded);
      audio.removeEventListener('error', failed);
      signal.removeEventListener('abort', failed);
      audio.removeAttribute('src');
      audio.load();
      resolve(duration);
    };
    const loaded = () => { if (Number.isFinite(audio.duration) && audio.duration > 0) finish(audio.duration); };
    const failed = () => finish(null);
    const timeout = setTimeout(failed, 20000);
    audio.addEventListener('loadedmetadata', loaded);
    audio.addEventListener('durationchange', loaded);
    audio.addEventListener('error', failed);
    signal.addEventListener('abort', failed, { once: true });
    audio.preload = 'metadata';
    audio.src = url;
    audio.load();
  });
}

export function TrackMetadataLoader() {
  const urls = usePlayerStore(s => JSON.stringify([...new Set([
    ...s.playlists.flatMap(p => p.tracks), ...s.personalPlaylists.flatMap(p => p.tracks),
    ...s.contextTracks, ...s.userQueue, ...s.recentlyPlayed, ...(s.currentTrack ? [s.currentTrack] : []),
  ].map(t => t.audioUrl))].sort()));
  useEffect(() => {
    const controller = new AbortController();
    const state = usePlayerStore.getState();
    const known = new Set([...state.playlists, ...state.personalPlaylists].flatMap(p => p.tracks)
      .concat(state.contextTracks, state.userQueue, state.recentlyPlayed, state.currentTrack ? [state.currentTrack] : [])
      .filter(t => t.durationKnown).map(t => t.audioUrl));
    const pending: string[] = JSON.parse(urls).filter((url: string) => !known.has(url));
    const work = async () => {
      while (pending.length && !controller.signal.aborted) {
        const url = pending.shift()!;
        const duration = await readAudioDuration(url, controller.signal);
        if (duration && !controller.signal.aborted) usePlayerStore.getState().setTrackDuration(url, duration);
      }
    };
    // Limit metadata requests so the playing song keeps network priority.
    void work();
    void work();
    return () => controller.abort();
  }, [urls]);
  return null;
}
