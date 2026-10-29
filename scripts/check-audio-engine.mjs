import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
let hooks=[], cursor=0, pending=[];
const track = {id:'a',title:'A',audioUrl:'https://example.com/a.mp3',durationSec:100,coverUrl:'',artist:'',album:''};
const state = {currentTrack:track,isPlaying:false,currentTime:27,volume:.4,isMuted:false,retryToken:0,playbackStatus:'paused',playbackError:'',history:[],
setCurrentTime:t=>state.currentTime=t,setDuration:d=>state.duration=d,setTrackDuration:(url,d)=>{if(state.currentTrack.audioUrl===url){state.duration=d;state.currentTrack={...state.currentTrack,durationSec:d,durationKnown:true};}},setIsPlaying:v=>state.isPlaying=v,recordPlayed:t=>state.history.push(t.id),nextTrack:()=>{state.currentTrack={...track,id:'b',audioUrl:'https://example.com/b.mp3'};state.currentTime=0;},previousTrack:()=>{},togglePlay:()=>state.isPlaying=!state.isPlaying,toggleMute:()=>{},toggleDrawer:()=>{}};
const listeners = new Set();
const store = selector=>selector?selector(state):state;store.getState=()=>state;
store.setState=update=>{const previous={...state};Object.assign(state,update);listeners.forEach(fn=>fn(state,previous));};
store.subscribe=fn=>{listeners.add(fn);return()=>listeners.delete(fn);};
state.seekRevision=0;
state.seek=time=>store.setState({currentTime:Math.max(0,Math.min(time,state.duration)),seekRevision:state.seekRevision+1});
const useRef = value=>{let i=cursor++;return hooks[i]??(hooks[i]={current:value});};
const useEffect = (fn,deps)=>{let i=cursor++,old=hooks[i];if(!old||deps.some((d,j)=>d!==old.deps[j]))pending.push(()=>{old?.cleanup?.();hooks[i]={deps,cleanup:fn()};});};
class AudioMock extends EventTarget {
static instances=[]; currentTime=0;duration=100;readyState=1;paused=true;ended=false;error=null;volume=1;src='';reject=null;
constructor(){super();AudioMock.instances.push(this);}
load(){} removeAttribute(){}
play(){if(this.reject)return Promise.reject(this.reject);this.paused=false;return Promise.resolve();}
pause(){if(!this.paused){this.paused=true;this.dispatchEvent(new Event('pause'));}}
emit(name){this.dispatchEvent(new Event(name));}
}
globalThis.Audio=AudioMock;globalThis.navigator={};globalThis.window={addEventListener(){},removeEventListener(){}};
globalThis.requestAnimationFrame=()=>1;globalThis.cancelAnimationFrame=()=>{};
globalThis.audioCheck={useRef,useEffect,store};
let source=await readFile('src/services/AudioEngine.tsx','utf8');
source=source.replace(/import React[^;]+;/,"const {useRef,useEffect}=globalThis.audioCheck;").replace(/import \{ usePlayerStore \}[^;]+;/,"const usePlayerStore=globalThis.audioCheck.store;");
const code=(await transform(source,{loader:'tsx',format:'esm'})).code;
const {AudioEngine}=await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
const render=()=>{cursor=0;pending=[];AudioEngine();pending.forEach(fn=>fn());};
render();let a=AudioMock.instances.at(-1);a.emit('loadedmetadata');assert.equal(a.currentTime,27);assert.equal(a.paused,true);
assert.equal(state.currentTrack.durationKnown,true);
state.seek(27.5); assert.equal(a.currentTime,27.5,'sub-second seeks must reach the audio element');
state.seek(27.5); a.currentTime=12; state.seek(27.5); assert.equal(a.currentTime,27.5,'repeated requests are not lost');
const beforeProgress=a.currentTime; state.setCurrentTime(28); assert.equal(a.currentTime,beforeProgress,'progress is not a seek command');
a.readyState=0; state.seek(39); a.readyState=1; a.emit('loadedmetadata'); assert.equal(a.currentTime,39,'seek before metadata is retained');
state.seek(27);
state.isPlaying=true;render();a.emit('waiting');assert.equal(state.playbackStatus,'buffering');a.emit('playing');assert.equal(state.playbackStatus,'playing');assert.deepEqual(state.history,['a']);
a.error={code:2};a.emit('error');assert.equal(state.isPlaying,false);assert.match(state.playbackError,/Connection/);
state.retryToken++;state.isPlaying=true;render();let retry=AudioMock.instances.at(-1);assert.notEqual(a,retry);retry.emit('loadedmetadata');assert.equal(retry.currentTime,27);
a.emit('playing');assert.equal(state.playbackStatus,'loading');retry.emit('playing');assert.equal(state.playbackStatus,'playing');
state.nextTrack();render();let b=AudioMock.instances.at(-1);a.emit('error');assert.equal(state.isPlaying,true);assert.equal(state.playbackStatus,'loading');
b.reject={name:'NotAllowedError'};state.isPlaying=false;render();state.isPlaying=true;render();await Promise.resolve();assert.match(state.playbackError,/tap/);assert.equal(state.isPlaying,false);
console.log('PASS: paused metadata restore, precise/repeated/pending seeks, progress isolation, buffering/playing/error, history, retry, stale source events, blocked autoplay.');
