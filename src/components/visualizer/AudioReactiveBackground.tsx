import React, { useEffect, useRef } from 'react';
import { usePlayerStore } from '../../store/usePlayerStore';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  speedX: number;
  opacity: number;
  baseOpacity: number;
  color: string;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  speed: number;
}

export const AudioReactiveBackground: React.FC = () => {
  const { isPlaying, currentTime, currentTrack } = usePlayerStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animFrameId = useRef<number | null>(null);
  const beatRef = useRef({ lastBeatTime: 0, beatStrength: 0 });

  const primaryColor = currentTrack?.dominantColor && currentTrack.dominantColor !== '#2dd4bf' 
    ? currentTrack.dominantColor 
    : '#EAA599';

  const currentCover = (!currentTrack?.coverUrl || currentTrack.coverUrl.includes('photo-1470225620780') || currentTrack.coverUrl.includes('unsplash.com'))
    ? '/artwork.png'
    : currentTrack.coverUrl;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize minimalist floating light particles
    const particleCount = 45;
    const particles: Particle[] = [];
    const colors = [primaryColor, '#f3cbc4', '#EAA599', '#ece3d6', '#b6bdac', '#fbcfe8'];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 2.5 + 1,
        speedY: -(Math.random() * 0.4 + 0.15),
        speedX: (Math.random() - 0.5) * 0.3,
        opacity: Math.random() * 0.5 + 0.2,
        baseOpacity: Math.random() * 0.5 + 0.2,
        color: colors[i % colors.length]
      });
    }

    // Expanding beat ripples from behind the window
    const ripples: Ripple[] = [];
    let lastRippleTime = 0;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const now = performance.now();

      // Derive dynamic beat energy synchronized with current track playback
      // 124 BPM -> 124 / 60 = 2.066 beats per second
      const beatPhase = isPlaying
        ? ((currentTime > 0 ? currentTime : now / 1000) * 2.066) % 1
        : 0;
      
      // Beat spike curve: sharp attack on beat, exponential decay
      const rawBeat = isPlaying ? Math.pow(Math.sin(beatPhase * Math.PI), 6) : 0.05;
      
      // Smooth interpolation for beat strength
      beatRef.current.beatStrength += (rawBeat - beatRef.current.beatStrength) * 0.15;
      const beatIntensity = beatRef.current.beatStrength;

      const centerX = width / 2;
      const centerY = height / 2;

      // 1. Spawning audio-reactive beat ripples on beat peaks
      if (isPlaying && rawBeat > 0.85 && now - lastRippleTime > 380) {
        lastRippleTime = now;
        ripples.push({
          x: centerX + (Math.random() - 0.5) * 120,
          y: centerY + (Math.random() - 0.5) * 80,
          radius: 120,
          maxRadius: Math.max(width, height) * 0.65,
          opacity: 0.35 + Math.random() * 0.2,
          speed: 2.2 + Math.random() * 1.5
        });
      }

      // Draw expanding soundwave ripples
      for (let i = ripples.length - 1; i >= 0; i--) {
        const r = ripples[i];
        r.radius += r.speed;
        r.opacity *= 0.985;

        if (r.opacity < 0.01 || r.radius >= r.maxRadius) {
          ripples.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.beginPath();
        ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
        ctx.strokeStyle = primaryColor;
        ctx.globalAlpha = r.opacity * 0.45;
        ctx.lineWidth = 1.5;
        ctx.shadowBlur = 18;
        ctx.shadowColor = primaryColor;
        ctx.stroke();
        ctx.restore();
      }

      // 2. Ambient Aura Backlighting Beams (Diffused behind the window)
      const auraGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        100,
        centerX,
        centerY,
        Math.max(width, height) * 0.55
      );

      const auraAlpha = isPlaying ? 0.22 + beatIntensity * 0.18 : 0.08;
      auraGradient.addColorStop(0, `${primaryColor}${Math.floor(auraAlpha * 255).toString(16).padStart(2, '0')}`);
      auraGradient.addColorStop(0.5, `#EAA599${Math.floor(auraAlpha * 0.5 * 255).toString(16).padStart(2, '0')}`);
      auraGradient.addColorStop(1, 'transparent');

      ctx.save();
      ctx.fillStyle = auraGradient;
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      // 3. Floating starlight dust motes that react to music
      for (const p of particles) {
        p.y += p.speedY * (isPlaying ? 1 + beatIntensity * 2 : 0.6);
        p.x += p.speedX;

        // Wrap around screen
        if (p.y < 0) {
          p.y = height + 10;
          p.x = Math.random() * width;
        }
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        // React opacity and glow to beat
        const currentOpacity = isPlaying
          ? p.baseOpacity * (1 + beatIntensity * 1.5)
          : p.baseOpacity * 0.5;

        ctx.save();
        ctx.beginPath();
        const currentRadius = isPlaying ? p.size * (1 + beatIntensity * 0.8) : p.size;
        ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.min(1, currentOpacity);
        ctx.shadowBlur = isPlaying ? 10 + beatIntensity * 14 : 4;
        ctx.shadowColor = p.color;
        ctx.fill();
        ctx.restore();
      }

      animFrameId.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (animFrameId.current) cancelAnimationFrame(animFrameId.current);
    };
  }, [isPlaying, primaryColor]);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. Dynamic Ambient Artwork Backdrop (Blurred per-track cover art) */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-1000 ease-out"
        style={{
          backgroundImage: `url('${currentCover}')`,
          filter: 'blur(80px) saturate(180%) brightness(0.38)',
          transform: 'scale(1.2)'
        }}
      />

      {/* 2. Soft Dark Vignette (allowing lighting to breathe through corners and edges) */}
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-black/40 to-black/85" />

      {/* 3. Audio-Reactive Ambient Glow Blobs (Blush Pink, Sage & Warm Ivory) */}
      <div
        className={`absolute -top-32 -left-32 w-96 h-96 rounded-full blur-[110px] transition-all duration-300 opacity-60 ${
          isPlaying ? 'scale-125' : 'scale-90 opacity-25'
        }`}
        style={{ backgroundColor: '#f3cbc4' }}
      />
      <div
        className={`absolute -bottom-32 -right-32 w-[480px] h-[480px] rounded-full blur-[130px] transition-all duration-300 opacity-55 ${
          isPlaying ? 'scale-120' : 'scale-85 opacity-20'
        }`}
        style={{ backgroundColor: '#EAA599' }}
      />
      <div
        className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full blur-[140px] transition-all duration-500 pointer-events-none ${
          isPlaying ? 'opacity-35 scale-110' : 'opacity-15 scale-95'
        }`}
        style={{ backgroundColor: '#ece3d6' }}
      />

      {/* 4. Canvas Audio Visualizer Layer */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
