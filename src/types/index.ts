export interface LyricLine {
  timeMs: number;
  text: string;
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  durationSec: number;
  audioUrl: string;
  coverUrl: string;
  dominantColor: string; // e.g. "#450af5" or "#2e77d0"
  lyrics?: LyricLine[];
  releaseYear?: number;
}

export interface Playlist {
  id: string;
  title: string;
  description: string;
  coverUrl: string;
  dominantColor: string;
  tracks: Track[];
  creator: string;
  followers?: string;
}

export type RepeatMode = 'off' | 'all' | 'one';
export type DrawerMode = 'none' | 'queue' | 'lyrics' | 'nowPlaying';
export type ViewMode = 'home' | 'search' | 'playlist' | 'liked';
