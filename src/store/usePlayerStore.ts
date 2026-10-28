import { create } from 'zustand';
import { readSession, writeSession } from './playerSession';
import type { Track, Playlist, RepeatMode, DrawerMode, ViewMode } from '../types';
import { TRACKS, PLAYLISTS } from '../data/mockData';
import { sanitizeTrack, cleanString } from '../utils/trackSanitizer';

interface PlayerStore {
  personalPlaylists: Playlist[];
  recentlyPlayed: Track[];
  playbackStatus: 'loading' | 'buffering' | 'playing' | 'paused' | 'error';
  playbackError: string;
  retryToken: number;
  retryPlayback: () => void;
  recordPlayed: (track: Track) => void;
  createPlaylist: (title: string) => string;
  renamePlaylist: (id: string, title: string) => void;
  deletePlaylist: (id: string) => void;
  addToPlaylist: (id: string, track: Track) => void;
  removeFromPlaylist: (id: string, trackId: string) => void;
  movePlaylistTrack: (id: string, index: number, direction: -1 | 1) => void;
  // Navigation
  currentView: ViewMode;
  activePlaylistId: string | null;
  searchQuery: string;
  categoryFilter: 'all' | 'music' | 'podcasts';
  navigateTo: (view: ViewMode, playlistId?: string) => void;
  setSearchQuery: (q: string) => void;
  setCategoryFilter: (filter: 'all' | 'music' | 'podcasts') => void;

  // Drawers
  activeDrawer: DrawerMode;
  toggleDrawer: (drawer: DrawerMode) => void;

  // Playback state
  currentTrack: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  previousVolume: number;
  isShuffle: boolean;
  repeatMode: RepeatMode;
  
  // Queuing
  userQueue: Track[];
  contextTracks: Track[];
  contextIndex: number;
  
  // Library
  likedTrackIds: string[];
  playlists: Playlist[];
  cloudVaultUrl: string;
  workerApiUrl: string;
  isCloudSynced: boolean;
  cloudSyncStatus: 'idle' | 'syncing' | 'success' | 'error';
  cloudSyncMessage: string;
  cloudTrackCount: number;
  
  // Actions
  playTrack: (track: Track, contextTracks?: Track[]) => void;
  togglePlay: () => void;
  setIsPlaying: (isPlaying: boolean) => void;
  seek: (time: number) => void;
  setCurrentTime: (time: number) => void;
  setDuration: (duration: number) => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  addToQueue: (track: Track) => void;
  removeFromQueue: (trackId: string) => void;
  toggleLike: (trackId: string) => void;
  setWorkerApiUrl: (url: string) => void;
  syncCloudLibrary: (url?: string) => Promise<boolean>;
}

export const usePlayerStore = create<PlayerStore>((set, get) => ({
  // Navigation
  currentView: 'home',
  activePlaylistId: null,
  searchQuery: '',
  categoryFilter: 'all',
  cloudVaultUrl: 'https://pub-4c18be52287241ab9bedbddc0e397a4c.r2.dev',
  workerApiUrl: (() => { try { return localStorage.getItem('vaultx_worker_api_url') || ''; } catch { return ''; } })(),
  isCloudSynced: false,
  cloudSyncStatus: 'idle',
  cloudSyncMessage: '',
  cloudTrackCount: 0,
  navigateTo: (view, playlistId) => set({ 
    currentView: view, 
    activePlaylistId: playlistId ?? null 
  }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setCategoryFilter: (filter) => set({ categoryFilter: filter }),

  // Drawers
  activeDrawer: 'none',
  toggleDrawer: (drawer) => set((state) => ({
    activeDrawer: state.activeDrawer === drawer ? 'none' : drawer
  })),

  // Playback
  currentTrack: TRACKS[0],
  isPlaying: false,
  currentTime: 0,
  duration: TRACKS[0].durationSec,
  volume: 0.8,
  isMuted: false,
  previousVolume: 0.8,
  isShuffle: false,
  repeatMode: 'off',
  
  // Queuing
  userQueue: [],
  contextTracks: TRACKS,
  contextIndex: 0,
  
  // Library
  likedTrackIds: [TRACKS[0].id, TRACKS[2].id],
  playlists: PLAYLISTS,

  personalPlaylists: [], recentlyPlayed: [], playbackStatus: 'paused', playbackError: '', retryToken: 0,
  retryPlayback: () => set(s => ({ retryToken: s.retryToken + 1, isPlaying: true, playbackError: '', playbackStatus: 'loading' })),
  recordPlayed: (track) => set(s => ({ recentlyPlayed: [track, ...s.recentlyPlayed.filter(t => t.id !== track.id)].slice(0, 30) })),
  createPlaylist: (title) => {
    const id = `personal-${crypto.randomUUID()}`;
    if (!title.trim()) return '';
    set(s => ({ personalPlaylists: [...s.personalPlaylists, { id, title: title.trim().slice(0, 100), description: '', creator: 'You', coverUrl: '/artwork.png', dominantColor: '#e8b49b', tracks: [] }] }));
    return id;
  },
  renamePlaylist: (id, title) => { if (title.trim()) set(s => ({ personalPlaylists: s.personalPlaylists.map(p => p.id === id ? { ...p, title: title.trim().slice(0, 100) } : p) })); },
  deletePlaylist: (id) => set(s => ({ personalPlaylists: s.personalPlaylists.filter(p => p.id !== id) })),
  addToPlaylist: (id, track) => set(s => ({ personalPlaylists: s.personalPlaylists.map(p => p.id === id && !p.tracks.some(t => t.id === track.id) ? { ...p, tracks: [...p.tracks, track] } : p) })),
  removeFromPlaylist: (id, trackId) => set(s => ({ personalPlaylists: s.personalPlaylists.map(p => p.id === id ? { ...p, tracks: p.tracks.filter(t => t.id !== trackId) } : p) })),
  movePlaylistTrack: (id, index, direction) => set(s => ({ personalPlaylists: s.personalPlaylists.map(p => {
    const target = index + direction;
    if (p.id !== id || index < 0 || index >= p.tracks.length || target < 0 || target >= p.tracks.length) return p;
    const tracks = [...p.tracks];
    [tracks[index], tracks[target]] = [tracks[target], tracks[index]];
    return { ...p, tracks };
  }) })),
  // Actions
  playTrack: (track, contextTracks) => {
    const list = contextTracks ?? get().contextTracks;
    const index = list.findIndex(t => t.id === track.id);
    set({
      currentTrack: track,
      isPlaying: true,
      playbackError: '',
      currentTime: 0,
      duration: track.durationSec,
      contextTracks: list,
      contextIndex: index !== -1 ? index : 0
    });
  },

  togglePlay: () => {
    const { isPlaying, currentTrack } = get();
    if (!currentTrack) {
      if (TRACKS.length > 0) {
        get().playTrack(TRACKS[0]);
      }
      return;
    }
    set({ isPlaying: !isPlaying });
  },

  setIsPlaying: (isPlaying) => set({ isPlaying }),

  seek: (time) => set({ currentTime: time }),
  setCurrentTime: (time) => set({ currentTime: time }),
  setDuration: (duration) => set({ duration }),

  nextTrack: () => {
    const { userQueue, contextTracks, contextIndex, isShuffle, repeatMode } = get();

    // 1. Check user queue first (explicit priority)
    if (userQueue.length > 0) {
      const next = userQueue[0];
      set({
        userQueue: userQueue.slice(1),
        currentTrack: next,
        isPlaying: true,
        currentTime: 0,
        duration: next.durationSec
      });
      return;
    }

    if (contextTracks.length === 0) return;

    // 2. Repeat single track
    if (repeatMode === 'one') {
      set({ currentTime: 0, isPlaying: true });
      return;
    }

    // 3. Shuffle or sequential context
    let nextIndex = contextIndex + 1;
    if (isShuffle) {
      nextIndex = Math.floor(Math.random() * contextTracks.length);
    } else if (nextIndex >= contextTracks.length) {
      if (repeatMode === 'all') {
        nextIndex = 0;
      } else {
        set({ isPlaying: false, currentTime: 0 });
        return;
      }
    }

    const nextTrack = contextTracks[nextIndex];
    if (nextTrack) {
      set({
        currentTrack: nextTrack,
        contextIndex: nextIndex,
        isPlaying: true,
        currentTime: 0,
        duration: nextTrack.durationSec
      });
    }
  },

  previousTrack: () => {
    const { currentTime, contextTracks, contextIndex } = get();
    // If playing past 3 seconds, restart track
    if (currentTime > 3) {
      set({ currentTime: 0 });
      return;
    }

    // Otherwise go to previous
    const prevIndex = contextIndex - 1;
    if (prevIndex >= 0 && contextTracks[prevIndex]) {
      const prevTrack = contextTracks[prevIndex];
      set({
        currentTrack: prevTrack,
        contextIndex: prevIndex,
        isPlaying: true,
        currentTime: 0,
        duration: prevTrack.durationSec
      });
    } else {
      set({ currentTime: 0 });
    }
  },

  setVolume: (volume) => {
    set({
      volume,
      isMuted: volume === 0,
      previousVolume: volume > 0 ? volume : get().previousVolume
    });
  },

  toggleMute: () => {
    const { isMuted, volume, previousVolume } = get();
    if (isMuted) {
      set({ isMuted: false, volume: previousVolume > 0 ? previousVolume : 0.8 });
    } else {
      set({ isMuted: true, previousVolume: volume, volume: 0 });
    }
  },

  toggleShuffle: () => set(state => ({ isShuffle: !state.isShuffle })),

  toggleRepeat: () => set(state => {
    const modes: RepeatMode[] = ['off', 'all', 'one'];
    const nextMode = modes[(modes.indexOf(state.repeatMode) + 1) % modes.length];
    return { repeatMode: nextMode };
  }),

  addToQueue: (track) => set(state => ({
    userQueue: [...state.userQueue, track]
  })),

  removeFromQueue: (trackId) => set(state => ({
    userQueue: state.userQueue.filter(t => t.id !== trackId)
  })),

  toggleLike: (trackId) => set(state => {
    const isLiked = state.likedTrackIds.includes(trackId);
    return {
      likedTrackIds: isLiked 
        ? state.likedTrackIds.filter(id => id !== trackId)
        : [...state.likedTrackIds, trackId]
    };
  }),

  setWorkerApiUrl: (url: string) => {
    const clean = url.trim();
    if (typeof window !== 'undefined') {
      try { localStorage.setItem('vaultx_worker_api_url', clean); } catch { /* Storage may be disabled. */ }
    }
    set({ workerApiUrl: clean });
  },

  syncCloudLibrary: async (urlOverride) => {
    const { workerApiUrl, cloudVaultUrl } = get();
    const candidateWorker = (urlOverride !== undefined ? urlOverride : workerApiUrl || '').trim();

    // Helper to replace generic stock/DJ covers with user's artwork
    const sanitizeCoverUrl = (url?: string) => {
      if (!url || url.includes('photo-1470225620780') || url.includes('unsplash.com')) {
        return '/artwork.png';
      }
      return url;
    };

    const processPlaylists = (rawPlaylists: any[]): Playlist[] => {
      return rawPlaylists.map(p => ({
        ...p,
        title: cleanString(p.title) || 'Cloud Vault Album',
        coverUrl: sanitizeCoverUrl(p.coverUrl),
        dominantColor: p.dominantColor || '#EAA599',
        tracks: (p.tracks || []).map((t: any) => sanitizeTrack(t))
      }));
    };

    set({ cloudSyncStatus: 'syncing', cloudSyncMessage: 'Connecting to Cloudflare Vault...' });

    // 1. Prioritize Method 2: Cloudflare Worker Real-Time API
    if (candidateWorker) {
      try {
        const cleanWorkerUrl = candidateWorker.replace(/\/+$/, '');
        const res = await fetch(cleanWorkerUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.playlists) && data.playlists.length > 0) {
            const cleanPlaylists = processPlaylists(data.playlists);
            const total = data.totalTracks || cleanPlaylists.reduce((acc: number, p: any) => acc + (p.tracks?.length || 0), 0);
            set({
              playlists: [...cleanPlaylists, ...PLAYLISTS],
              isCloudSynced: true,
              cloudSyncStatus: 'success',
              cloudSyncMessage: `Real-Time Discovery: ${total} tracks loaded`,
              cloudTrackCount: total,
              workerApiUrl: cleanWorkerUrl
            });
            if (typeof window !== 'undefined') {
              try { localStorage.setItem('vaultx_worker_api_url', cleanWorkerUrl); } catch { /* Storage may be disabled. */ }
            }

            const firstCloudTrack = cleanPlaylists[0]?.tracks[0];
            if (firstCloudTrack && !get().isPlaying && !hasSessionSelection) {
              set({
                currentTrack: firstCloudTrack,
                duration: firstCloudTrack.durationSec,
                contextTracks: cleanPlaylists[0].tracks,
                contextIndex: 0
              });
            }
            return true;
          }
        }
      } catch (err) {
        console.warn('Worker sync failed, falling back to static manifest:', err);
      }
    }

    // 2. Fallback to direct Cloudflare R2 library.json manifest
    try {
      const manifestUrl = `${cloudVaultUrl.replace(/\/+$/, '')}/library.json`;
      const res = await fetch(manifestUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.playlists) && data.playlists.length > 0) {
          const cleanPlaylists = processPlaylists(data.playlists);
          const total = data.playlists.reduce((acc: number, p: any) => acc + (p.tracks?.length || 0), 0);
          set({
            playlists: [...cleanPlaylists, ...PLAYLISTS],
            isCloudSynced: true,
            cloudSyncStatus: 'success',
            cloudSyncMessage: `Static R2 Manifest: ${total} tracks loaded`,
            cloudTrackCount: total
          });

          const firstCloudTrack = cleanPlaylists[0]?.tracks[0];
          if (firstCloudTrack && !get().isPlaying && !hasSessionSelection) {
            set({
              currentTrack: firstCloudTrack,
              duration: firstCloudTrack.durationSec,
              contextTracks: cleanPlaylists[0].tracks,
              contextIndex: 0
            });
          }
          return true;
        }
      }
    } catch (err) {
      console.warn('Static R2 manifest error:', err);
    }

    set({
      cloudSyncStatus: 'error',
      cloudSyncMessage: 'Unable to connect to Cloudflare Vault. Check your Worker URL or R2 bucket.'
    });
    return false;
  }
}));

// Hydrate before the app and its cloud sync mount; playback is always restored paused.
const restored = readSession();
let hasSessionSelection = !!restored.currentTrack;
usePlayerStore.setState({ ...restored, isPlaying: false, ...(restored.currentTrack ? { duration: restored.currentTrack.durationSec } : {}) });
let lastPositionSave = 0;
function saveSession() {
  const s = usePlayerStore.getState();
  const { currentTrack, currentTime, contextTracks, contextIndex, userQueue, likedTrackIds, personalPlaylists, recentlyPlayed, volume, previousVolume, isMuted, isShuffle, repeatMode } = s;
  writeSession({ currentTrack, currentTime, contextTracks, contextIndex, userQueue, likedTrackIds, personalPlaylists, recentlyPlayed, volume, previousVolume, isMuted, isShuffle, repeatMode });
  lastPositionSave = Date.now();
}
usePlayerStore.subscribe((s, previous) => {
  if (s.isPlaying || s.currentTime > 0) hasSessionSelection = true;
  if (s.playlists !== previous.playlists) {
    const fresh = new Map(s.playlists.flatMap(p => p.tracks).map(t => [t.id, t]));
    const reconcile = (t: Track) => fresh.get(t.id) || t;
    usePlayerStore.setState({ currentTrack: s.currentTrack ? reconcile(s.currentTrack) : null,
      contextTracks: s.contextTracks.map(reconcile), userQueue: s.userQueue.map(reconcile),
      recentlyPlayed: s.recentlyPlayed.map(reconcile), personalPlaylists: s.personalPlaylists.map(p => ({ ...p, tracks: p.tracks.map(reconcile) })) });
    return;
  }
  const immediate = ['currentTrack', 'contextTracks', 'userQueue', 'likedTrackIds', 'personalPlaylists', 'recentlyPlayed', 'volume', 'previousVolume', 'isMuted', 'isShuffle', 'repeatMode'] as const;
  if (immediate.some(key => s[key] !== previous[key]) || (previous.isPlaying && !s.isPlaying) || (s.currentTime !== previous.currentTime && Date.now() - lastPositionSave >= 5000)) saveSession();
});
if (typeof document !== 'undefined') {
  document.addEventListener('visibilitychange', () => { if (document.hidden) saveSession(); });
  window.addEventListener('pagehide', saveSession);
}
