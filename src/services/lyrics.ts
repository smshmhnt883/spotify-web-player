import type { LyricLine } from '../types';

export interface LyricsResult {
  mode: 'synced' | 'plain' | 'unavailable' | 'instrumental';
  lines: LyricLine[];
  text: string;
}
const normalize = (text: string) => text.normalize('NFKC').toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
const cache = new Map<string, LyricsResult>();
export const lyricsKey = (title: string, artist: string, duration: number) => JSON.stringify([title, artist, Math.round(duration)]);

export function parseLrc(text: string): LyricLine[] {
  let offset = 0;
  const offsetMatch = text.match(/\[offset:([+-]?\d+)\]/i);
  if (offsetMatch) offset = Number(offsetMatch[1]);
  return text.split(/\r?\n/).flatMap(line => {
    const stamps = [...line.matchAll(/\[(\d+):([0-5]\d)(?:\.(\d{1,3}))?\]/g)];
    const content = line.replace(/\[[^\]]*\]/g, '').trim();
    return stamps.map(m => ({ timeMs: Math.max(0, Number(m[1]) * 60000 + Number(m[2]) * 1000 + Number((m[3] || '').padEnd(3, '0')) + offset), text: content }));
  }).sort((a, b) => a.timeMs - b.timeMs);
}

export function selectLyrics(data: unknown, title: string, artist: string, duration: number): LyricsResult {
  const empty: LyricsResult = { mode: 'unavailable', lines: [], text: '' };
  if (!Array.isArray(data)) throw new Error('Invalid lyrics response');
  const candidates = data.filter(r => r && typeof r.trackName === 'string' && typeof r.artistName === 'string'
    && normalize(r.trackName) === normalize(title) && normalize(r.artistName).includes(normalize(artist))
    && typeof r.duration === 'number' && Number.isFinite(r.duration) && r.duration > 0)
    .sort((a, b) => Math.abs(a.duration - duration) - Math.abs(b.duration - duration));
  let plain = '';
  let instrumental = false;
  for (const r of candidates) {
    const lines = typeof r.syncedLyrics === 'string' ? parseLrc(r.syncedLyrics) : [];
    const words = lines.filter(line => line.text);
    if (Math.abs(r.duration - duration) <= 2 && words.length > 1 && words.every(line => line.timeMs <= (duration + 1) * 1000)) {
      return { mode: 'synced', lines, text: '' };
    }
    if (!plain) plain = (typeof r.plainLyrics === 'string' ? r.plainLyrics.trim() : '') || words.map(line => line.text).join('\n');
    if (r.instrumental === true && Math.abs(r.duration - duration) <= 2) instrumental = true;
  }
  return plain ? { mode: 'plain', lines: [], text: plain } : instrumental ? { ...empty, mode: 'instrumental' } : empty;
}

export async function fetchLyrics(title: string, artist: string, duration: number, signal: AbortSignal): Promise<LyricsResult> {
  const key = lyricsKey(title, artist, duration);
  const saved = cache.get(key);
  if (saved) return saved;
  const response = await fetch(`https://lrclib.net/api/search?${new URLSearchParams({ track_name: title, artist_name: artist })}`, { signal });
  if (!response.ok) throw new Error(response.status === 429 ? 'Lyrics service is busy. Please try again shortly.' : 'Could not load lyrics. Please try again.');
  const result = selectLyrics(await response.json(), title, artist, duration);
  if (signal.aborted) throw new DOMException('Aborted', 'AbortError');
  if (cache.size >= 50) cache.delete(cache.keys().next().value!);
  cache.set(key, result);
  return result;
}
