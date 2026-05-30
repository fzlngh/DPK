'use client';

import { useEffect, useRef, useState } from 'react';

interface Props {
  onDone: () => void;
}

// Total boot phase: ~2.6s → logo: ~1.4s → total ≈ 4s
const BOOT_LINES = [
  { text: 'BEAT BANG! OS v2.0 — RHYTHM ENGINE INIT', delay: 0,    color: '#00bbff' },
  { text: '> Loading audio subsystem.............. OK', delay: 180,  color: '#00C853' },
  { text: '> Calibrating lane sensors............. OK', delay: 340,  color: '#00C853' },
  { text: '> Syncing BPM clock.................... OK', delay: 500,  color: '#00C853' },
  { text: '> Generating note patterns............. OK', delay: 660,  color: '#00C853' },
  { text: '> Mounting leaderboard database........ OK', delay: 820,  color: '#00C853' },
  { text: '> Warming up visual renderer........... OK', delay: 980,  color: '#00C853' },
  { text: '> Checking audio buffers............... OK', delay: 1120, color: '#00C853' },
  { text: '> Injecting rhythm algorithms.......... OK', delay: 1260, color: '#00C853' },
  { text: '', delay: 1380, color: '#fff' },
  { text: '!! WARNING: HIGH SCORE DEPENDENCY DETECTED', delay: 1440, color: '#FFE000' },
  { text: '!! ADDICTION RISK: EXTREME',                delay: 1620, color: '#FF6B00' },
  { text: '', delay: 1740, color: '#fff' },
  { text: '▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ ALL SYSTEMS GO',    delay: 1900, color: '#00C853' },
  { text: 'PRESS ANY KEY OR WAIT...',                  delay: 2100, color: '#FFE000' },
];

// Timing constants (ms)
const LOGO_PHASE_AT  = 2600;   // switch to logo
const AUTO_DONE_AT   = 50000;   // auto-dismiss (4s total)
const LOGO_HOLD_MS   = AUTO_DONE_AT - LOGO_PHASE_AT; // 1400ms for logo

export default function BootScreen({ onDone }: Props) {
  const [phase, setPhase]               = useState<'boot'|'logo'|'out'>('boot');
  const [visibleLines, setVisibleLines] = useState<typeof BOOT_LINES>([]);
  const [loadPct, setLoadPct]           = useState(0);
  const [glitch, setGlitch]             = useState(false);
  const [tagline, setTagline]           = useState('');
  const [cursorOn, setCursorOn]         = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef   = useRef<number>(0);
  const doneRef   = useRef(false);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
    setPhase('out');
    setTimeout(onDone, 500);
  };

  // Cursor blink
  useEffect(() => {
    const iv = setInterval(() => setCursorOn(c => !c), 530);
    return () => clearInterval(iv);
  }, []);

  // Skip on any keypress or click
  useEffect(() => {
    const skip = () => finish();
    window.addEventListener('keydown', skip);
    window.addEventListener('pointerdown', skip);
    return () => {
      window.removeEventListener('keydown', skip);
      window.removeEventListener('pointerdown', skip);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Boot sequencing
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Reveal log lines
    BOOT_LINES.forEach(line => {
      timers.push(setTimeout(() => {
        setVisibleLines(prev => [...prev, line]);
      }, line.delay));
    });

    // Progress bar — finishes just before logo phase
    let pct = 0;
    const totalMs = LOGO_PHASE_AT;
    const stepMs  = 50;
    const steps   = totalMs / stepMs;
    const barIv = setInterval(() => {
      pct = Math.min(100, pct + 100 / steps + Math.random() * 2 - 1);
      setLoadPct(Math.floor(Math.min(100, pct)));
      if (pct >= 100) clearInterval(barIv);
    }, stepMs);

    // Glitch flashes
    [[300, 100], [900, 70], [1700, 130]].forEach(([at, dur]) => {
      timers.push(setTimeout(() => { setGlitch(true); setTimeout(() => setGlitch(false), dur); }, at));
    });

    // Switch to logo phase
    timers.push(setTimeout(() => {
      setPhase('logo');
      typeTagline('TAP TO THE BEAT • FEEL THE RHYTHM 🎵');
    }, LOGO_PHASE_AT));

    // Auto-dismiss at exactly 4 seconds
    timers.push(setTimeout(finish, AUTO_DONE_AT));

    return () => { timers.forEach(clearTimeout); clearInterval(barIv); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function typeTagline(full: string) {
    let i = 0;
    // Type fast enough to finish in ~800ms
    const msPerChar = Math.floor(800 / full.length);
    const iv = setInterval(() => {
      i++;
      setTagline(full.slice(0, i));
      if (i >= full.length) clearInterval(iv);
    }, msPerChar);
  }

  // Canvas: scanlines + particles
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;
    let t = 0;

    const draw = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      const W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      // Scanlines
      for (let y = 0; y < H; y += 4) {
        ctx.fillStyle = 'rgba(0,0,0,0.18)';
        ctx.fillRect(0, y, W, 2);
      }

      // Floating particles
      for (let i = 0; i < 30; i++) {
        const seed = i * 137.508;
        const x = ((seed * 0.61803 + t * 0.0003 * (i % 3 === 0 ? 1 : -0.5)) % 1) * W;
        const y = ((seed * 0.38197 + t * 0.0002) % 1) * H;
        const r = (Math.sin(t * 0.005 + i) * 0.5 + 0.5) * 3 + 1;
        const alpha = (Math.sin(t * 0.008 + seed) * 0.5 + 0.5) * 0.6;
        ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = i % 3 === 0 ? `rgba(0,187,255,${alpha})`
                      : i % 3 === 1 ? `rgba(255,107,107,${alpha})`
                      : `rgba(255,224,0,${alpha})`;
        ctx.fill();
      }

      // Occasional glitch line
      if (Math.random() < 0.02) {
        ctx.fillStyle = 'rgba(0,187,255,0.15)';
        ctx.fillRect(0, Math.random() * H, W, Math.random() * 3 + 1);
      }

      t++;
      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, []);

  const barColor = loadPct < 50 ? '#00bbff' : loadPct < 80 ? '#00C853' : loadPct < 92 ? '#FF6B00' : '#FF2D2D';

  return (
    <div
      onClick={finish}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
        background: '#080808',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.5s ease' : 'none',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      {/* ── BOOT PHASE ── */}
      {phase === 'boot' && (
        <div style={{
          position: 'relative', zIndex: 1,
          width: 'min(680px, 95vw)',
          filter: glitch ? 'hue-rotate(90deg) brightness(1.4)' : 'none',
          transition: 'filter 0.04s',
        }}>
          {/* BIOS bar */}
          <div style={{
            background: '#00bbff', color: '#080808',
            fontFamily: 'monospace', fontSize: 13, fontWeight: 700,
            padding: '5px 14px', letterSpacing: 2,
            display: 'flex', justifyContent: 'space-between',
          }}>
            <span>BEAT BANG! SYSTEM BIOS v2.0</span>
            <span>{new Date().toLocaleDateString()}</span>
          </div>

          {/* Terminal log */}
          <div style={{
            background: '#080808', border: '2px solid #1a1a1a', borderTop: 'none',
            padding: '16px 20px', minHeight: 300,
            fontFamily: '"Courier New", Courier, monospace',
            fontSize: 'clamp(11px,1.6vw,14px)', lineHeight: 1.9,
          }}>
            {visibleLines.map((line, i) => (
              <div key={i} style={{ color: line.color, whiteSpace: 'pre' }}>
                {line.text}
                {i === visibleLines.length - 1 && cursorOn && (
                  <span style={{ background: '#00bbff', color: '#080808', marginLeft: 2, padding: '0 3px' }}>_</span>
                )}
              </div>
            ))}
          </div>

          {/* Load bar */}
          <div style={{
            background: '#0d0d0d', border: '2px solid #1a1a1a', borderTop: 'none',
            padding: '10px 20px 14px', display: 'flex', alignItems: 'center', gap: 12,
          }}>
            <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#555', whiteSpace: 'nowrap' }}>
              LOADING RHYTHM ENGINE
            </span>
            <div style={{
              flex: 1, height: 14, background: '#1a1a1a',
              border: '1px solid #333', position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                height: '100%', width: loadPct + '%',
                background: barColor,
                transition: 'width 0.08s linear, background 0.3s',
                boxShadow: `0 0 10px ${barColor}`,
              }} />
              <div style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'monospace', fontSize: 10, color: '#fff', mixBlendMode: 'difference',
              }}>{loadPct}%</div>
            </div>
            <span style={{ fontFamily: 'monospace', fontSize: 12, minWidth: 42,
              color: loadPct < 100 ? '#00C853' : '#FFE000' }}>
              {loadPct < 100 ? 'WAIT' : 'DONE!'}
            </span>
          </div>

          <div style={{
            textAlign: 'center', marginTop: 10,
            fontFamily: 'monospace', fontSize: 11, color: '#333', letterSpacing: 2,
          }}>
            PRESS ANY KEY OR CLICK TO SKIP
          </div>
        </div>
      )}

      {/* ── LOGO PHASE ── */}
      {phase === 'logo' && (
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          textAlign: 'center',
          animation: 'bootLogoIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards',
        }}>
          {/* Glow ring */}
          <div style={{
            position: 'absolute', width: 320, height: 320, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,187,255,0.14) 0%, transparent 70%)',
            animation: 'bootPulse 1.4s ease-in-out infinite',
            top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
            pointerEvents: 'none',
          }} />

          <div style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(72px,14vw,130px)', letterSpacing: 6,
            color: '#FFE000', textShadow: '6px 6px 0 #FF2D2D, 12px 12px 0 #1a1a1a',
            lineHeight: 0.95, animation: 'bootGlitch 0.1s steps(1) 0.2s 3',
          }}>BEAT</div>
          <div style={{
            fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(72px,14vw,130px)', letterSpacing: 6,
            color: '#FF2D2D', textShadow: '6px 6px 0 #FFE000, 12px 12px 0 #1a1a1a',
            lineHeight: 0.95, marginBottom: 18,
          }}>BANG!</div>

          <div style={{ display: 'flex', gap: 12, marginBottom: 20, animation: 'bootNotesIn 0.4s 0.2s both' }}>
            {['🎵','🥁','🎶','⭐','🎵'].map((e, i) => (
              <span key={i} style={{
                fontSize: 28,
                animation: `bootBeat 0.7s ${i*0.1}s ease-in-out infinite alternate`,
                display: 'inline-block', filter: 'drop-shadow(2px 2px 0 #1a1a1a)',
              }}>{e}</span>
            ))}
          </div>

          <div style={{
            fontFamily: 'Permanent Marker, cursive',
            fontSize: 'clamp(14px,2.5vw,20px)',
            color: '#fff', background: '#1a1a1a',
            padding: '8px 24px', border: '3px solid #FFE000',
            boxShadow: '4px 4px 0 #FFE000',
            minWidth: 340, minHeight: 42, letterSpacing: 1,
          }}>
            {tagline}{cursorOn && <span style={{ opacity: 0.8 }}>|</span>}
          </div>

          <div style={{
            marginTop: 32, fontFamily: 'Bangers, cursive',
            fontSize: 'clamp(18px,3vw,26px)', letterSpacing: 4, color: '#00bbff',
            animation: 'bootBlink 0.8s step-end infinite',
          }}>▶ PRESS ANY KEY TO START ◀</div>
        </div>
      )}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Permanent+Marker&display=swap');
        @keyframes bootLogoIn {
          0%   { opacity:0; transform:scale(0.65) rotate(-4deg); }
          100% { opacity:1; transform:scale(1)    rotate(0deg);  }
        }
        @keyframes bootPulse {
          0%,100% { transform:translate(-50%,-50%) scale(0.9);  opacity:0.6; }
          50%     { transform:translate(-50%,-50%) scale(1.15); opacity:1;   }
        }
        @keyframes bootBeat {
          0%   { transform:translateY(0)    scale(1);   }
          100% { transform:translateY(-10px) scale(1.2); }
        }
        @keyframes bootNotesIn {
          0%   { opacity:0; transform:translateY(18px); }
          100% { opacity:1; transform:translateY(0);    }
        }
        @keyframes bootBlink {
          0%,100% { opacity:1; }
          50%     { opacity:0; }
        }
        @keyframes bootGlitch {
          0%   { text-shadow:6px 6px 0 #FF2D2D,12px 12px 0 #1a1a1a; transform:translate(0,0);     }
          25%  { text-shadow:-4px 4px 0 #00bbff,12px 12px 0 #FF2D2D; transform:translate(4px,-2px); }
          50%  { text-shadow:4px -4px 0 #FF2D2D,-4px 4px 0 #00C853;  transform:translate(-3px,2px); }
          75%  { text-shadow:-6px 2px 0 #FFE000,8px -6px 0 #1a1a1a;  transform:translate(2px,3px);  }
          100% { text-shadow:6px 6px 0 #FF2D2D,12px 12px 0 #1a1a1a;  transform:translate(0,0);     }
        }
      `}</style>
    </div>
  );
}