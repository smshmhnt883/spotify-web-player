import type { Playlist, RepeatMode, Track } from '../types';

export interface SavedSession {
  currentTrack: Track | null;
  currentTime: number;
  contextTracks: Track[];
  contextIndex: number;
  userQueue: Track[];
  likedTrackIds: string[];
  personalPlaylists: Playlist[];
  recentlyPlayed: Track[];
  volume: number;
  previousVolume: number;
  isMuted: boolean;
  isShuffle: boolean;
  repeatMode: RepeatMode;
}

export const sessionKey = 'vaultx_session_v1';
const record = (value: unknown): value is Record<string, unknown> => !!value && typeof value === 'object';
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const safeUrl = (value: unknown) => typeof value === 'string' && (/^https?:\/\//i.test(value) || /^(\.?\.?\/)/.test(value));
export const savedTrack = (value: unknown): value is Track => record(value)
  && ['id', 'title', 'artist', 'album', 'coverUrl', 'dominantColor'].every(key => typeof value[key] === 'string')
  && safeUrl(value.audioUrl) && finite(value.durationSec) && value.durationSec >= 0
  && (value.lyrics === undefined || (Array.isArray(value.lyrics) && value.lyrics.every(line => record(line) && finite(line.timeMs) && typeof line.text === 'string')))
  && (value.releaseYear === undefined || finite(value.releaseYear));
const tracks = (value: unknown): Track[] => Array.isArray(value) ? value.filter(savedTrack) : [];

export function readSession(): Partial<SavedSession> {
  try {
    const data: unknown = JSON.parse(localStorage.getItem(sessionKey) || 'null');
    if (!record(data) || data.version !== 1 || !record(data.session)) return {};
    const s = data.session;
    const currentTrack = savedTrack(s.currentTrack) ? s.currentTrack : null;
    const contextTracks = tracks(s.contextTracks);
    return {
      currentTrack, contextTracks, contextIndex: finite(s.contextIndex) ? Math.max(0, Math.min(Math.floor(s.contextIndex), contextTracks.length - 1)) : 0,
      currentTime: currentTrack && finite(s.currentTime) ? Math.max(0, s.currentTime) : 0,
      userQueue: tracks(s.userQueue), recentlyPlayed: Array.from(new Map(tracks(s.recentlyPlayed).map(t => [t.id, t])).values()).slice(0, 30),
      personalPlaylists: Array.isArray(s.personalPlaylists) ? s.personalPlaylists.filter(p => record(p) && typeof p.id === 'string' && typeof p.title === 'string').map(p => ({
        id: p.id, title: p.title.slice(0, 100), description: '', creator: 'You', coverUrl: '/artwork.png', dominantColor: '#e8b49b',
        tracks: Array.from(new Map(tracks(p.tracks).map(t => [t.id, t])).values()),
      })) : [],
      likedTrackIds: Array.isArray(s.likedTrackIds) ? [...new Set(s.likedTrackIds.filter((id): id is string => typeof id === 'string'))] : [],
      volume: finite(s.volume) ? Math.min(1, Math.max(0, s.volume)) : .8,
      previousVolume: finite(s.previousVolume) ? Math.min(1, Math.max(0, s.previousVolume)) : .8,
      isMuted: s.isMuted === true, isShuffle: s.isShuffle === true,
      repeatMode: s.repeatMode === 'one' || s.repeatMode === 'all' ? s.repeatMode : 'off',
    };
  } catch { return {}; }
}

export function writeSession(s: SavedSession) {
  try {
    const currentTrack = savedTrack(s.currentTrack) ? s.currentTrack : null;
    localStorage.setItem(sessionKey, JSON.stringify({ version: 1, session: {
      ...s, currentTrack, currentTime: currentTrack ? s.currentTime : 0,
      contextTracks: tracks(s.contextTracks), userQueue: tracks(s.userQueue), recentlyPlayed: tracks(s.recentlyPlayed),
      personalPlaylists: s.personalPlaylists.map(p => ({ ...p, tracks: tracks(p.tracks) })),
    } }));
    return true;
  } catch { return false; }
}
