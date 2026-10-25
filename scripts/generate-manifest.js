import fs from 'fs';
import path from 'path';

// Base Cloudflare R2 Public URL
const R2_BASE_URL = 'https://pub-4c18be52287241ab9bedbddc0e397a4c.r2.dev';

// Default directory to scan
const targetDir = process.argv[2] || 'C:\\Users\\somes\\Downloads\\Music';

console.log(`Scanning music library at: ${targetDir}`);

if (!fs.existsSync(targetDir)) {
  console.error(`Directory not found: ${targetDir}`);
  process.exit(1);
}

const AUDIO_EXTS = ['.mp3', '.m4a', '.flac', '.wav', '.ogg'];

// Helper to clean up titles from YouTube/Downloader patterns
function cleanTitle(rawName) {
  let name = rawName.replace(/\.[^/.]+$/, ''); // Remove extension
  // Remove (Official Music Video), (Visualizer), - (320 Kbps), etc.
  name = name.replace(/\s*[\(\[](official\s*music\s*video|official\s*video|music\s*video|visualizer|audio|lyrics?|320\s*kbps|\d+p)[\)\]]/gi, '');
  name = name.replace(/\s*-\s*\(320\s*Kbps\)/gi, '');
  name = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  return name;
}

// Helper to extract artist and title
function parseArtistAndTitle(fileName) {
  const cleaned = cleanTitle(fileName);
  let artist = 'Various Artists';
  let title = cleaned;

  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    artist = parts[0].trim();
    title = parts.slice(1).join(' - ').trim();
  } else if (cleaned.includes(' by ')) {
    const parts = cleaned.split(' by ');
    title = parts[0].trim();
    artist = parts[1].trim();
  }

  return { artist, title };
}

const colorPalette = [
  '#4338ca', '#854d0e', '#be123c', '#047857', '#6d28d9',
  '#b45309', '#0f766e', '#1d4ed8', '#be185d', '#374151'
];

function scanDirectory(dir, relPath = '') {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  const playlists = [];
  const directTracks = [];

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    const itemRel = relPath ? `${relPath}/${item.name}` : item.name;

    if (item.isDirectory()) {
      // Each subfolder becomes a playlist!
      const subItems = fs.readdirSync(fullPath, { withFileTypes: true });
      const tracks = [];

      for (const subItem of subItems) {
        const ext = path.extname(subItem.name).toLowerCase();
        if (AUDIO_EXTS.includes(ext)) {
          const { artist, title } = parseArtistAndTitle(subItem.name);
          const trackRel = `${itemRel}/${subItem.name}`;
          const audioUrl = `${R2_BASE_URL}/${encodeURI(trackRel.replace(/\\/g, '/'))}`;

          tracks.push({
            id: `r2-${tracks.length}-${Date.now()}`,
            title,
            artist,
            album: item.name,
            durationSec: 180, // Default duration, browser will update upon metadata load
            audioUrl,
            coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
            dominantColor: colorPalette[playlists.length % colorPalette.length],
            lyrics: [
              { timeMs: 0, text: `♪ ${title} ♪` },
              { timeMs: 5000, text: `Artist: ${artist}` }
            ]
          });
        }
      }

      if (tracks.length > 0) {
        playlists.push({
          id: `playlist-${playlists.length + 1}`,
          title: item.name,
          description: `Custom playlist with ${tracks.length} tracks.`,
          coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
          dominantColor: colorPalette[playlists.length % colorPalette.length],
          creator: 'My Cloud Vault',
          followers: '1',
          tracks
        });
      }
    } else {
      // Direct audio file in the root
      const ext = path.extname(item.name).toLowerCase();
      if (AUDIO_EXTS.includes(ext)) {
        const { artist, title } = parseArtistAndTitle(item.name);
        const audioUrl = `${R2_BASE_URL}/${encodeURI(item.name)}`;

        directTracks.push({
          id: `r2-root-${directTracks.length}`,
          title,
          artist,
          album: 'Cloud Vault Favorites',
          durationSec: 180,
          audioUrl,
          coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
          dominantColor: '#4338ca',
          lyrics: [
            { timeMs: 0, text: `♪ ${title} ♪` },
            { timeMs: 5000, text: `Artist: ${artist}` }
          ]
        });
      }
    }
  }

  // If there are direct tracks in root, make a playlist for them
  if (directTracks.length > 0) {
    playlists.unshift({
      id: 'playlist-cloud-vault',
      title: 'Cloud Vault Favorites',
      description: `Personal music collection streamed directly from Cloudflare R2.`,
      coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80',
      dominantColor: '#4338ca',
      creator: 'My Cloud Vault',
      followers: '1',
      tracks: directTracks
    });
  }

  return { playlists, allTracks: directTracks };
}

const result = scanDirectory(targetDir);

const outputPath = path.join(targetDir, 'library.json');
fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf-8');

console.log(`\nSuccessfully generated Cloudflare R2 Manifest!`);
console.log(`Total Playlists: ${result.playlists.length}`);
console.log(`Total Tracks: ${result.playlists.reduce((acc, p) => acc + p.tracks.length, 0)}`);
console.log(`Saved manifest to: ${outputPath}`);
console.log(`\nNext step: Upload your songs AND library.json into your Cloudflare R2 bucket!`);
