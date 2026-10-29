import type { Track, Playlist } from '../types';

export const TRACKS: Track[] = [];
export const PLAYLISTS: Playlist[] = [];

export const CATEGORIES = [
  { id: 'cat-pop', title: 'Pop', color: '#8d67ab', cover: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300' },
  { id: 'cat-hiphop', title: 'Hip-Hop', color: '#ba5d07', cover: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=300' },
  { id: 'cat-dance', title: 'Dance / Electronic', color: '#d84000', cover: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=300' },
  { id: 'cat-chill', title: 'Chill & Lofi', color: '#477d95', cover: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=300' },
  { id: 'cat-rock', title: 'Rock & Metal', color: '#e91429', cover: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=300' },
  { id: 'cat-gaming', title: 'Gaming', color: '#e8115b', cover: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=300' },
  { id: 'cat-focus', title: 'Focus', color: '#503750', cover: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=300' },
  { id: 'cat-mood', title: 'Mood Booster', color: '#8c1932', cover: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=300' }
];
