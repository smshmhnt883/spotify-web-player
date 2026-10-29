import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../store/usePlayerStore';

export const AudioEngine: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const animFrameRef = useRef<number | null>(null);

  const {
    currentTrack,
    isPlaying,
    volume,
    isMuted,
    currentTime,
    setCurrentTime,
    setIsPlaying,
    nextTrack,
    previousTrack,
    togglePlay,
    toggleMute,
    toggleDrawer
  } = usePlayerStore();

  const retryToken = usePlayerStore(s => s.retryToken);
  const resumeRef = useRef(currentTime);

  // Each source owns its audio element so late events cannot affect a newer track.
  useEffect(() => {
    if (!currentTrack) return;
    const audio = new Audio();
    audioRef.current = audio;
    let active = true;
    let recorded = false;
    const store = usePlayerStore.getState;
    const status = (playbackStatus: 'loading' | 'buffering' | 'playing' | 'paused' | 'error', playbackError = '') => {
      if (active) usePlayerStore.setState({ playbackStatus, playbackError });
    };
    resumeRef.current = store().currentTime;
    audio.volume = store().isMuted ? 0 : store().volume;
    audio.preload = 'metadata';
    audio.src = currentTrack.audioUrl;
    status(store().isPlaying ? 'loading' : 'paused');
    const fail = () => {
      if (!active) return;
      status('error', audio.error?.code === 2 ? 'Connection interrupted. Check your connection and retry.' : 'This song could not be played. Retry or choose another track.');
      store().setIsPlaying(false);
    };
    const loaded = () => {
      if (!active) return;
      if (Number.isFinite(audio.duration) && audio.duration > 0) {
        store().setTrackDuration(currentTrack.audioUrl, audio.duration);
        audio.currentTime = Math.min(Math.max(0, resumeRef.current), Math.max(0, audio.duration - .1));
        setCurrentTime(audio.currentTime);
      }
    };
    const durationChanged = () => {
      if (active) store().setTrackDuration(currentTrack.audioUrl, audio.duration);
    };
    const playing = () => {
      if (!active) return;
      status('playing');
      if (!recorded) { store().recordPlayed(store().currentTrack ?? currentTrack); recorded = true; }
    };
    const waiting = () => { if (store().isPlaying) status('buffering'); };
    const pause = () => { if (active && !audio.ended && !audio.error) { setCurrentTime(audio.currentTime); store().setIsPlaying(false); status('paused'); } };
    const ended = () => {
      if (!active) return;
      setCurrentTime(0);
      nextTrack();
      if (store().currentTrack?.id === currentTrack.id && store().isPlaying) {
        audio.currentTime = 0;
        audio.play().catch(fail);
      }
    };
    audio.addEventListener('loadedmetadata', loaded);
    audio.addEventListener('durationchange', durationChanged);
    audio.addEventListener('playing', playing);
    audio.addEventListener('waiting', waiting);
    audio.addEventListener('stalled', waiting);
    audio.addEventListener('error', fail);
    audio.addEventListener('pause', pause);
    audio.addEventListener('ended', ended);
    const unsubscribeSeek = usePlayerStore.subscribe((state, previous) => {
      if (!active || state.seekRevision === previous.seekRevision) return;
      resumeRef.current = state.currentTime;
      if (audio.readyState >= 1 && Number.isFinite(audio.duration)) {
        audio.currentTime = Math.min(Math.max(0, state.currentTime), audio.duration);
      }
    });
    audio.load();
    return () => {
      active = false;
      unsubscribeSeek();
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      if (audioRef.current === audio) audioRef.current = null;
    };
  }, [currentTrack?.id, currentTrack?.audioUrl, retryToken]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    let cancelled = false;
    if (isPlaying) {
      usePlayerStore.setState({ playbackStatus: 'loading', playbackError: '' });
      audio.play().catch((error: DOMException) => {
        if (cancelled || audioRef.current !== audio || error.name === 'AbortError') return;
        usePlayerStore.setState({ isPlaying: false, playbackStatus: 'error', playbackError: error.name === 'NotAllowedError'
          ? 'Your browser needs a tap to start audio. Press Retry to play.'
          : 'This song could not be played. Retry or choose another track.' });
      });
    } else {
      audio.pause();
      if (usePlayerStore.getState().playbackStatus !== 'error') usePlayerStore.setState({ playbackStatus: 'paused' });
    }
    return () => { cancelled = true; };
  }, [isPlaying, currentTrack?.id, currentTrack?.audioUrl, retryToken]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  useEffect(() => {
    const tick = () => {
      const audio = audioRef.current;
      if (audio && !audio.paused && !audio.seeking) setCurrentTime(audio.currentTime);
      animFrameRef.current = requestAnimationFrame(tick);
    };
    animFrameRef.current = requestAnimationFrame(tick);
    return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
  }, []);

  // Setup OS Native Media Session API
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentTrack) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: currentTrack.artist,
      album: currentTrack.album,
      artwork: [
        { src: currentTrack.coverUrl, sizes: '512x512', type: 'image/jpeg' }
      ]
    });

    navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
    navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
    navigator.mediaSession.setActionHandler('previoustrack', () => previousTrack());
    navigator.mediaSession.setActionHandler('nexttrack', () => nextTrack());
    navigator.mediaSession.setActionHandler('seekto', (details) => {
      if (details.seekTime !== undefined) {
        usePlayerStore.getState().seek(details.seekTime);
      }
    });
  }, [currentTrack]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Let native controls and dialogs handle their own keyboard interactions.
      if ((e.target as HTMLElement).closest('input, textarea, select, button, a, [contenteditable="true"], [role="dialog"], dialog') || document.querySelector('[aria-modal="true"]')) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        togglePlay();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'ArrowRight') {
        e.preventDefault();
        nextTrack();
      } else if ((e.ctrlKey || e.metaKey) && e.code === 'ArrowLeft') {
        e.preventDefault();
        previousTrack();
      } else if (e.key.toLowerCase() === 'm') {
        e.preventDefault();
        toggleMute();
      } else if (e.key.toLowerCase() === 'l') {
        e.preventDefault();
        toggleDrawer('lyrics');
      } else if (e.key.toLowerCase() === 'q') {
        e.preventDefault();
        toggleDrawer('queue');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return null;
};
