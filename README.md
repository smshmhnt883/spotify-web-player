# Spotify Web Player – Reverse Engineered Cloud Music Player

A high-performance, responsive music streaming web application reverse-engineered from the Spotify Web Player architecture. Built with **React 18/19**, **TypeScript**, **Tailwind CSS**, **Zustand**, and the **Web Audio API**.

---

## Features

### 🎧 Spotify Web Player Architecture
- **3-Sector Playback Deck**: Exact 30% / 40% / 30% width ratio with sub-second `requestAnimationFrame` timeline scrubbing and `tabular-nums` formatting.
- **Dynamic Theming**: Color extraction gradients matching album artwork.
- **Left Sidebar ("Your Library")**: Collapsible view (icon mode vs expanded mode), filter chips, and custom playlists.
- **Synced Lyrics Drawer**: Karaoke-style real-time synchronized lyrics with millisecond precision, auto-scroll, and click-to-seek.
- **Interactive Queue**: Now Playing, Priority User Queue, and Context Next Up.
- **Spotify Connect Device Modal**: Switch between web browser, smart speakers, and mobile devices.

### 📱 Mobile PWA & Cloud Ready
- **Mobile Responsive UI**:
  - Native bottom navigation tabs (`Home`, `Search`, `Your Library`).
  - Floating bottom mini-player.
  - Full-screen Now Playing sheet with large artwork, touch scrubber, and lyrics peek.
- **Progressive Web App (PWA)**: Installable directly to iOS & Android home screens with no browser URL bar.
- **OS Media Session**: Integrates with Windows, macOS, iOS, and Android lock screens and hardware media keys (`navigator.mediaSession`).
- **Upload Music Engine**: Drag-and-drop downloaded `.mp3`, `.m4a`, `.flac`, `.wav` files or entire folders for instant local and cloud playback.

---

## Tech Stack
- **Framework**: Vite + React + TypeScript
- **Styling**: Tailwind CSS + Spotify Design System color tokens
- **Icons**: Lucide React
- **State Management**: Zustand
- **Audio Pipeline**: Native Web Audio API + HTML5 Audio + MediaSession API

---

## Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```
