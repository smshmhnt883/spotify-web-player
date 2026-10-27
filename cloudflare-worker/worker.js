/**
 * VaultX Music - Cloudflare Worker R2 Real-Time Music Discovery API
 * 
 * Instructions:
 * 1. In Cloudflare Dashboard -> Workers & Pages -> Create Worker named "vaultx-music-api"
 * 2. In Settings -> Bindings (Variables & Secrets) -> R2 Bucket Bindings:
 *    - Variable name: MY_BUCKET
 *    - R2 Bucket: my-music-vault
 * 3. Quick Edit / Deploy this script.
 * 
 * Any MP3/M4A/FLAC/WAV file dropped into your R2 bucket will immediately be discovered!
 */

const AUDIO_EXTENSIONS = new Set([
  '.mp3', '.m4a', '.flac', '.wav', '.ogg', '.aac', '.opus', '.weba', '.wma'
]);

const COVER_IMAGES = [
  '/artwork.png'
];

const COLOR_PALETTE = [
  '#f3cbc4', '#2dd4bf', '#ece3d6', '#b6bdac', '#fbcfe8'
];
  '#b45309', '#0f766e', '#1d4ed8', '#be185d', '#374151'
];

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function cleanTrackTitle(fileName) {
  let name = fileName.replace(/\.[^/.]+$/, '');
  name = name.replace(/\s*[\(\[](?:official\s*(?:music\s*)?video|official\s*video|music\s*video|visualizer|audio|lyrics?|360[°\s]*music\s*video|320\s*kbps|\d+p)[\)\]]/gi, '');
  name = name.replace(/\s*-\s*\(?320\s*Kbps\)?/gi, '');
  name = name.replace(/_/g, ' ').replace(/\s+/g, ' ').trim();
  name = name.replace(/^[\s–—_-]+|[\s–—_-]+$/g, '').trim();
  return name;
}

function parseMetadata(fileName) {
  const baseName = fileName.split('/').pop() || fileName;
  const cleaned = cleanTrackTitle(baseName);
  let artist = 'Various Artists';
  let title = cleaned;

  if (cleaned.includes(' - ')) {
    const parts = cleaned.split(' - ');
    artist = parts[0].trim().replace(/^[\s–—_-]+|[\s–—_-]+$/g, '');
    title = parts.slice(1).join(' - ').trim().replace(/^[\s–—_-]+|[\s–—_-]+$/g, '');
  } else if (cleaned.includes(' by ')) {
    const parts = cleaned.split(' by ');
    title = parts[0].trim().replace(/^[\s–—_-]+|[\s–—_-]+$/g, '');
    artist = parts[1].trim().replace(/^[\s–—_-]+|[\s–—_-]+$/g, '');
  }

  // Detect and swap if Title contains multi-artist list while Artist is short song title
  const multiArtistPattern = /,\s*|\s+(?:feat\.?|ft\.?|prod\.?|with|inferno|mxrci)\s+/i;
  if (multiArtistPattern.test(title) && !multiArtistPattern.test(artist) && artist !== 'Various Artists' && artist.length > 0 && artist.length < 25) {
    const temp = title;
    title = artist;
    artist = temp;
  }

  // Handle Various Artists with specific songs
  if (artist === 'Various Artists') {
    if (title.toUpperCase().startsWith('LOW FADE')) {
      title = 'Low Fade';
      artist = 'Karan Aujla';
    } else if (title.startsWith('Ashke')) {
      title = 'Ashke';
      artist = 'Karan Aujla, Mxrci';
    } else if (title.startsWith('Jackpot')) {
      title = 'Jackpot';
      artist = 'Cheema Y, Gur Sidhu';
    }
  }

  title = title.replace(/^[\s–—_-]+|[\s–—_-]+$/g, '').trim();
  artist = artist.replace(/^[\s–—_-]+|[\s–—_-]+$/g, '').trim();

  return { artist, title };
}

export default {
  async fetch(request, env, ctx) {
    // 1. CORS Preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
          'Access-Control-Allow-Headers': '*',
          'Access-Control-Max-Age': '86400',
        },
      });
    }

    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': '*',
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    };

    // 2. Validate R2 Bucket Binding
    if (!env.MY_BUCKET) {
      return new Response(
        JSON.stringify({
          error: 'R2 Bucket not bound',
          message: 'Please bind your R2 bucket "my-music-vault" to variable name "MY_BUCKET" in Cloudflare Worker settings -> Variables and Secrets -> R2 Bucket Bindings.',
        }, null, 2),
        { status: 500, headers: corsHeaders }
      );
    }

    const url = new URL(request.url);

    // Healthcheck
    if (url.pathname === '/health' || url.pathname === '/ping') {
      return new Response(
        JSON.stringify({ status: 'ok', worker: 'vaultx-music-api', time: new Date().toISOString() }),
        { status: 200, headers: corsHeaders }
      );
    }

    try {
      // 3. List all objects in bucket
      let objects = [];
      let truncated = true;
      let cursor = undefined;

      while (truncated) {
        const listResponse = await env.MY_BUCKET.list({ limit: 1000, cursor });
        objects.push(...listResponse.objects);
        truncated = listResponse.truncated;
        cursor = listResponse.cursor;
      }

      const r2BaseUrl = env.R2_PUBLIC_BASE || 'https://pub-4c18be52287241ab9bedbddc0e397a4c.r2.dev';

      // 4. Group into Playlists by Folder
      const playlistsMap = new Map();
      const allTracks = [];

      for (const obj of objects) {
        const extMatch = obj.key.match(/\.[0-9a-z]+$/i);
        if (!extMatch) continue;
        const ext = extMatch[0].toLowerCase();

        // Skip non-audio files
        if (!AUDIO_EXTENSIONS.has(ext)) continue;

        const { artist, title } = parseMetadata(obj.key);
        const audioUrl = `${r2BaseUrl.replace(/\/+$/, '')}/${encodeURI(obj.key).replace(/%2F/gi, '/')}`;
        const keyHash = hashString(obj.key);
        const coverUrl = COVER_IMAGES[keyHash % COVER_IMAGES.length];
        const dominantColor = COLOR_PALETTE[keyHash % COLOR_PALETTE.length];

        const pathSegments = obj.key.split('/');
        const folderName = pathSegments.length > 1 ? pathSegments[0] : 'Cloud Vault Favorites';

        const track = {
          id: `r2-${hashString(obj.key)}`,
          title,
          artist,
          album: folderName,
          durationSec: 180, // AudioEngine updates upon metadata load
          audioUrl,
          coverUrl,
          dominantColor,
          lyrics: [
            { timeMs: 0, text: `♪ ${title} ♪` },
            { timeMs: 4000, text: `Artist: ${artist}` },
            { timeMs: 8000, text: `Streamed live from Cloudflare R2 Vault` }
          ]
        };

        allTracks.push(track);

        if (!playlistsMap.has(folderName)) {
          playlistsMap.set(folderName, []);
        }
        playlistsMap.get(folderName).push(track);
      }

      // 5. Build Playlist Objects
      const playlists = [];
      for (const [folderName, tracks] of playlistsMap.entries()) {
        const folderHash = hashString(folderName);
        playlists.push({
          id: folderName === 'Cloud Vault Favorites' ? 'playlist-cloud-vault' : `playlist-${folderHash}`,
          title: folderName,
          description: `Dynamically discovered from Cloudflare R2 Vault (${tracks.length} tracks).`,
          coverUrl: COVER_IMAGES[folderHash % COVER_IMAGES.length],
          dominantColor: COLOR_PALETTE[folderHash % COLOR_PALETTE.length],
          creator: 'VaultX Cloud Engine',
          followers: '1',
          tracks
        });
      }

      // Ensure "Cloud Vault Favorites" is at the top
      playlists.sort((a, b) => {
        if (a.id === 'playlist-cloud-vault') return -1;
        if (b.id === 'playlist-cloud-vault') return 1;
        return a.title.localeCompare(b.title);
      });

      return new Response(
        JSON.stringify({
          status: 'success',
          totalTracks: allTracks.length,
          totalPlaylists: playlists.length,
          timestamp: new Date().toISOString(),
          playlists,
          allTracks
        }, null, 2),
        { status: 200, headers: corsHeaders }
      );
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: 'Failed to process R2 bucket',
          details: err?.message || String(err)
        }, null, 2),
        { status: 500, headers: corsHeaders }
      );
    }
  }
};
