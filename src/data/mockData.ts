import type { Track, Playlist } from '../types';

export const TRACKS: Track[] = [
  {
    id: 'track-1',
    title: 'Midnight City Lights',
    artist: 'Aether Wave',
    album: 'Neon Horizon',
    durationSec: 165,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/05/27/audio_1808fbf07a.mp3?filename=lofi-study-112191.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#4f1496',
    releaseYear: 2024,
    lyrics: [
      { timeMs: 0, text: '♪ (Instrumental Intro) ♪' },
      { timeMs: 8000, text: 'Neon signs reflecting on the wet pavement' },
      { timeMs: 16000, text: 'Cruising through the midnight boulevard' },
      { timeMs: 24000, text: 'Shadows dancing in the purple haze' },
      { timeMs: 32000, text: 'Drifting away into the endless night' },
      { timeMs: 44000, text: 'Can you feel the rhythm of the city pulse?' },
      { timeMs: 56000, text: 'Every heartbeat matching with the kick drum' },
      { timeMs: 68000, text: 'No destination, just the road ahead' },
      { timeMs: 80000, text: 'Lost in the frequency, wide awake' },
      { timeMs: 96000, text: '♪ (Synth Solo & Drop) ♪' },
      { timeMs: 120000, text: 'As the morning dawn begins to break' },
      { timeMs: 140000, text: 'The city sleeps, but the sound remains' },
      { timeMs: 155000, text: '♪ (Outro fade) ♪' }
    ]
  },
  {
    id: 'track-2',
    title: 'Solar Echoes',
    artist: 'Luna Solaris',
    album: 'Celestial Drift',
    durationSec: 142,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/03/15/audio_c8c8a73467.mp3?filename=electronic-future-beats-117997.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#d65b16',
    releaseYear: 2024,
    lyrics: [
      { timeMs: 0, text: '♪ (Cosmic ambient pads) ♪' },
      { timeMs: 10000, text: 'Particles in motion through the solar flare' },
      { timeMs: 22000, text: 'Orbiting the rings of a distant sun' },
      { timeMs: 34000, text: 'Gravity is letting go, weightless sound' },
      { timeMs: 48000, text: 'Echoes bouncing across the stratosphere' },
      { timeMs: 64000, text: '♪ (Harmonic breakdown) ♪' },
      { timeMs: 85000, text: 'Infinite expanse in golden light' },
      { timeMs: 105000, text: 'We are stardust dreaming in stereo' },
      { timeMs: 125000, text: '♪ (Outro fade) ♪' }
    ]
  },
  {
    id: 'track-3',
    title: 'Velvet Rain',
    artist: 'Komorebi Sound',
    album: 'Autumn Reverie',
    durationSec: 158,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/01/18/audio_d0a13f69d2.mp3?filename=chill-abstract-intention-12099.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#1a5980',
    releaseYear: 2023,
    lyrics: [
      { timeMs: 0, text: '♪ (Gentle piano & tape hiss) ♪' },
      { timeMs: 12000, text: 'Raindrops tap against the windowpane' },
      { timeMs: 24000, text: 'A warm cup of coffee in the quiet room' },
      { timeMs: 38000, text: 'Time stands still when the gray clouds roll in' },
      { timeMs: 52000, text: 'Soft nostalgia in every passing drop' },
      { timeMs: 70000, text: '♪ (Warm chords and Rhodes) ♪' },
      { timeMs: 95000, text: 'Remembering moments that slip through time' },
      { timeMs: 120000, text: 'Peaceful solace in the autumn dusk' },
      { timeMs: 145000, text: '♪ (Rain sound fade) ♪' }
    ]
  },
  {
    id: 'track-4',
    title: 'Cyberpunk Drive',
    artist: 'Vektor 99',
    album: 'Neo Tokyo 2088',
    durationSec: 180,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2022/10/14/audio_9939f77c30.mp3?filename=cyberpunk-2099-10701.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#e11d48',
    releaseYear: 2024,
    lyrics: [
      { timeMs: 0, text: '♪ (Distorted analog bassline) ♪' },
      { timeMs: 15000, text: 'High speed access on the neural net' },
      { timeMs: 30000, text: 'Chrome reflections blazing in the rear view' },
      { timeMs: 45000, text: 'Zero latency, pure adrenaline rush' },
      { timeMs: 65000, text: 'Overclock the engine past redline' },
      { timeMs: 90000, text: '♪ (Aggressive Synth Lead) ♪' },
      { timeMs: 120000, text: 'Breaking firewalls, no turning back' },
      { timeMs: 150000, text: 'Into the grid, forever free' }
    ]
  },
  {
    id: 'track-5',
    title: 'Deep Focus Flow',
    artist: 'MindState Collective',
    album: 'Alpha Waves Vol. 3',
    durationSec: 135,
    audioUrl: 'https://cdn.pixabay.com/download/audio/2021/09/06/audio_731336c1d7.mp3?filename=lofi-chill-medium-version-159456.mp3',
    coverUrl: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#059669',
    releaseYear: 2023,
    lyrics: [
      { timeMs: 0, text: '♪ (Lo-fi vinyl scratch & rhodes) ♪' },
      { timeMs: 14000, text: 'Clear your thoughts, let the code flow' },
      { timeMs: 28000, text: 'One line at a time, locked in the zone' },
      { timeMs: 45000, text: 'Subtle bass groove steady and calm' },
      { timeMs: 70000, text: 'Pure productivity, deep state of mind' },
      { timeMs: 100000, text: '♪ (Smooth saxophone sample) ♪' }
    ]
  }
];

export const PLAYLISTS: Playlist[] = [
  {
    id: 'playlist-today-top',
    title: "Today's Top Hits",
    description: 'The hottest tracks right now across synthwave, lofi, and electronic beats.',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#4338ca',
    creator: 'Spotify',
    followers: '34,892,105',
    tracks: [TRACKS[0], TRACKS[1], TRACKS[3], TRACKS[2]]
  },
  {
    id: 'playlist-lofi-beats',
    title: 'Lo-Fi Study Beats',
    description: 'Relaxing instrumental lofi hip hop beats to study, chill, or code to.',
    coverUrl: 'https://images.unsplash.com/photo-1507838153414-b4b713384a76?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#854d0e',
    creator: 'Spotify Editorial',
    followers: '6,412,890',
    tracks: [TRACKS[0], TRACKS[2], TRACKS[4]]
  },
  {
    id: 'playlist-cyber-synth',
    title: 'Cyberpunk & Synthwave',
    description: 'Neon fueled retro-futuristic basslines and high-octane 80s arpeggios.',
    coverUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#be123c',
    creator: 'Curator X',
    followers: '1,209,550',
    tracks: [TRACKS[3], TRACKS[1], TRACKS[0]]
  },
  {
    id: 'playlist-deep-focus',
    title: 'Deep Focus & Flow',
    description: 'Ambient atmospheres and steady beats designed to maximize your concentration.',
    coverUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=500&auto=format&fit=crop&q=80',
    dominantColor: '#047857',
    creator: 'Spotify Focus',
    followers: '4,108,300',
    tracks: [TRACKS[4], TRACKS[2], TRACKS[0]]
  }
];

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
