import { create } from 'zustand';
import type { Track, Playlist, RepeatMode, DrawerMode, ViewMode } from '../types';
import { TRACKS, PLAYLISTS } from '../data/mockData';

interface PlayerStore {
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
  workerApiUrl: typeof window !== 'undefined' ? (localStorage.getItem('vaultx_worker_api_url') || '') : '',
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

  // Actions
  playTrack: (track, contextTracks) => {
    const list = contextTracks ?? get().contextTracks;
    const index = list.findIndex(t => t.id === track.id);
    set({
      currentTrack: track,
      isPlaying: true,
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
      localStorage.setItem('vaultx_worker_api_url', clean);
    }
    set({ workerApiUrl: clean });
  },

  syncCloudLibrary: async (urlOverride) => {
    const { workerApiUrl, cloudVaultUrl } = get();
    const candidateWorker = (urlOverride !== undefined ? urlOverride : workerApiUrl || '').trim();

    set({ cloudSyncStatus: 'syncing', cloudSyncMessage: 'Connecting to Cloudflare Vault...' });

    // 1. Prioritize Method 2: Cloudflare Worker Real-Time API
    if (candidateWorker) {
      try {
        const cleanWorkerUrl = candidateWorker.replace(/\/+$/, '');
        const res = await fetch(cleanWorkerUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && Array.isArray(data.playlists) && data.playlists.length > 0) {
            const total = data.totalTracks || data.playlists.reduce((acc: number, p: any) => acc + (p.tracks?.length || 0), 0);
            set({
              playlists: [...data.playlists, ...PLAYLISTS],
              isCloudSynced: true,
              cloudSyncStatus: 'success',
              cloudSyncMessage: `Real-Time Discovery: ${total} tracks loaded`,
              cloudTrackCount: total,
              workerApiUrl: cleanWorkerUrl
            });
            if (typeof window !== 'undefined') {
              localStorage.setItem('vaultx_worker_api_url', cleanWorkerUrl);
            }

            const firstCloudTrack = data.playlists[0]?.tracks[0];
            if (firstCloudTrack && !get().isPlaying) {
              set({
                currentTrack: firstCloudTrack,
                duration: firstCloudTrack.durationSec,
                contextTracks: data.playlists[0].tracks,
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
          const total = data.playlists.reduce((acc: number, p: any) => acc + (p.tracks?.length || 0), 0);
          set({
            playlists: [...data.playlists, ...PLAYLISTS],
            isCloudSynced: true,
            cloudSyncStatus: 'success',
            cloudSyncMessage: `Static R2 Manifest: ${total} tracks loaded`,
            cloudTrackCount: total
          });

          const firstCloudTrack = data.playlists[0]?.tracks[0];
          if (firstCloudTrack && !get().isPlaying) {
            set({
              currentTrack: firstCloudTrack,
              duration: firstCloudTrack.durationSec,
              contextTracks: data.playlists[0].tracks,
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
