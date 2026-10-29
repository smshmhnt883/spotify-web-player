import assert from 'node:assert/strict';
import { build } from 'esbuild';
const load = async path => {
  const result = await build({entryPoints:[path],bundle:true,platform:'node',format:'esm',write:false});
  return import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
};
const { sanitizeTrackMetadata } = await load('src/utils/trackSanitizer.ts');
assert.deepEqual(sanitizeTrackMetadata('Brown Town Music', 'CALIFORNIA LOVE Cheema Y Gur Sidhu Punjabi Song 2023'), {title:'California Love',artist:'Cheema Y, Gur Sidhu'});
assert.deepEqual(sanitizeTrackMetadata('Rehaan Records', 'For A Reason Karan Aujla Tania Ikky Latest Punjabi Songs 2025'), {title:'For A Reason',artist:'Karan Aujla, Tania, Ikky'});
for (const label of ['Brown Town Music', 'Rehaan Records']) {
  const result = sanitizeTrackMetadata('Another Song',label);
  assert.equal(result.title,'Another Song', 'a record label alone cannot identify a song');
  assert.deepEqual(sanitizeTrackMetadata(result.title,result.artist),result,'cleanup stays stable');
}
class AudioMock extends EventTarget {
  static instances = [];
  duration = NaN; src = ''; plays = 0;
  constructor() { super(); AudioMock.instances.push(this); }
  load() {}
  removeAttribute(name) { if(name==='src') this.src=''; }
  play() { this.plays++; }
}
globalThis.Audio = AudioMock;
const { readAudioDuration } = await load('src/services/TrackMetadataLoader.tsx');
const controller = new AbortController();
let result = readAudioDuration('https://example.com/song.mp3',controller.signal);
let audio = AudioMock.instances.at(-1);
audio.duration=Infinity; audio.dispatchEvent(new Event('loadedmetadata'));
audio.duration=245.75; audio.dispatchEvent(new Event('durationchange'));
assert.equal(await result,245.75); assert.equal(audio.src,''); assert.equal(audio.plays,0);
result=readAudioDuration('https://example.com/bad.mp3',controller.signal);
audio=AudioMock.instances.at(-1); audio.dispatchEvent(new Event('error'));
assert.equal(await result,null); assert.equal(audio.src,'');
result=readAudioDuration('https://example.com/slow.mp3',controller.signal);
audio=AudioMock.instances.at(-1); controller.abort();
assert.equal(await result,null); assert.equal(audio.src,'');
const count=AudioMock.instances.length;
assert.equal(await readAudioDuration('unused',controller.signal),null);
assert.equal(AudioMock.instances.length,count);
console.log('PASS: song-specific cleanup, other label tracks preserved, actual metadata duration, durationchange, error/abort cleanup, no autoplay.');
