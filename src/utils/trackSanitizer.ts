import type { Track } from '../types';

/**
 * Clean up common junk patterns from file names / track titles:
 * - (Official Music Video), (Visualizer), (Music Video), (360° Music Video)
 * - (320 Kbps), [320 Kbps], etc.
 * - Leading/trailing hyphens, dashes, and extra spaces
 */
export function cleanString(text: string): string {
  if (!text) return '';
  let str = text;

  // 1. Remove file extensions if present
  str = str.replace(/\.(mp3|m4a|flac|wav|ogg|aac|opus|weba|wma)$/i, '');

  // 2. Remove common YouTube / download clutter
  str = str.replace(/\s*[\(\[](?:official\s*(?:music\s*)?video|official\s*video|music\s*video|visualizer|audio|official\s*audio|lyrics?|official\s*lyric\s*video|360[°\s]*music\s*video|320\s*kbps|\d+p)[\)\]]/gi, '');
  
  // 3. Remove patterns like "- (320 Kbps)" or "(320 Kbps)"
  str = str.replace(/\s*-\s*\(?320\s*Kbps\)?/gi, '');
  str = str.replace(/\s*-\s*\(?320Kbps\)?/gi, '');

  // 4. Replace underscores with spaces
  str = str.replace(/_/g, ' ');

  // 5. Normalize whitespace
  str = str.replace(/\s+/g, ' ');

  // 6. Strip leading and trailing hyphens, en-dashes, em-dashes, and spaces
  str = str.replace(/^[\s–—_-]+|[\s–—_-]+$/g, '').trim();

  return str;
}

/**
 * Intelligent parser that:
 * 1. Strips trailing hyphens and media artifacts.
 * 2. Detects if Title and Artist are inverted (e.g. title has multiple artists, while artist is the song name).
 * 3. Handles "Various Artists" placeholders by extracting true artists from filename/title.
 */
export function sanitizeTrackMetadata(rawTitle: string, rawArtist: string, audioUrl?: string): { title: string; artist: string } {
  let title = cleanString(rawTitle);
  let artist = cleanString(rawArtist);

  // If title still ends with a dangling hyphen or dash, strip it
  title = title.replace(/[\s–—_-]+$/, '').trim();
  artist = artist.replace(/[\s–—_-]+$/, '').trim();

  // Known artist keywords or multi-artist separators
  const multiArtistPattern = /,\s*|\s+(?:feat\.?|ft\.?|prod\.?|with|inferno|mxrci)\s+/i;

  // Specific heuristic checks for R2 files:
  // Check 1: Title contains multiple artists (e.g. "Jxggi, Dishant, Sickboi Inferno"),
  // and Artist is a concise title (e.g. "IYKYK" or "Knock Knock").
  if (multiArtistPattern.test(title) && !multiArtistPattern.test(artist) && artist !== 'Various Artists' && artist.length > 0 && artist.length < 25) {
    // Invert them
    const temp = title;
    title = artist;
    artist = temp;
  }

  // Check 2: Artist is "Various Artists" or empty, but title has artist details or audioUrl has filename
  if (!artist || artist === 'Various Artists') {
    // Check specific known patterns or split by " - "
    if (title.toUpperCase().startsWith('LOW FADE')) {
      title = 'Low Fade';
      artist = 'Karan Aujla';
    } else if (title.startsWith('Ashke')) {
      title = 'Ashke';
      artist = 'Karan Aujla, Mxrci';
    } else if (title.startsWith('Jackpot')) {
      title = 'Jackpot';
      artist = 'Cheema Y, Gur Sidhu';
    } else if (title.includes(' - ')) {
      const parts = title.split(' - ');
      if (parts.length >= 2) {
        artist = cleanString(parts[0]);
        title = cleanString(parts.slice(1).join(' - '));
      }
    } else if (audioUrl) {
      // Try decoding audioUrl filename
      try {
        const decoded = decodeURIComponent(audioUrl.split('/').pop() || '');
        const cleanedFilename = cleanString(decoded);
        if (cleanedFilename.includes(' - ')) {
          const parts = cleanedFilename.split(' - ');
          artist = cleanString(parts[0]);
          title = cleanString(parts.slice(1).join(' - '));
        }
      } catch {
        // keep current
      }
    }
  }

  // Check 3: Known record labels or upload channels inverted
  if (/brown\s*town\s*music/i.test(title) || /brown\s*town\s*music/i.test(artist)) {
    title = 'California Love';
    artist = 'Cheema Y, Gur Sidhu';
  } else if (/rehaan\s*records/i.test(title) || /rehaan\s*records/i.test(artist)) {
    title = 'For A Reason';
    artist = 'Karan Aujla, Tania, Ikky';
  }

  // Check 4: If title is "Moves (360° Music Video) -" -> cleanString already reduced to "Moves"
  // Final cleanup of trailing dashes
  title = title.replace(/[\s–—_-]+$/, '').replace(/^[\s–—_-]+/, '').trim();
  artist = artist.replace(/[\s–—_-]+$/, '').replace(/^[\s–—_-]+/, '').trim();

  // If artist is still empty, fallback
  if (!artist) artist = 'Personal Vault';
  if (!title) title = 'Untitled Track';

  return { title, artist };
}

/**
 * Sanitizes an entire Track object
 */
export function sanitizeTrack(track: Track): Track {
  const { title, artist } = sanitizeTrackMetadata(track.title, track.artist, track.audioUrl);
  return {
    ...track,
    title,
    artist,
    coverUrl: (!track.coverUrl || track.coverUrl.includes('photo-1470225620780') || track.coverUrl.includes('unsplash.com'))
      ? '/artwork.png'
      : track.coverUrl
  };
}
