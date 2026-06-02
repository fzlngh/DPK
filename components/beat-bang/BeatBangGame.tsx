'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import SettingsOverlay from './SettingsOverlay';
import LeaderboardPanel from './LeaderboardPanel';
import ResultModal from './ResultModal';
import CountdownOverlay from './CountdownOverlay';
import BootScreen from './BootScreen';
import TopupModal from './TopupModal';
import { useBeatPoints, PREMIUM_SONGS } from './useBeatPoints';
import type { TopupPackage } from './useBeatPoints';


// ── SSR-safe localStorage helper ──
const ls = {
  get: (k: string, fb = ''): string =>
    typeof window === 'undefined' ? fb : (localStorage.getItem(k) ?? fb),
  set: (k: string, v: string): void => {
    if (typeof window !== 'undefined') localStorage.setItem(k, v);
  },
  getJSON: <T>(k: string, fb: T): T => {
    if (typeof window === 'undefined') return fb;
    try { return JSON.parse(localStorage.getItem(k) ?? 'null') ?? fb; }
    catch { return fb; }
  },
  setJSON: <T>(k: string, v: T): void => {
    if (typeof window !== 'undefined') localStorage.setItem(k, JSON.stringify(v));
  },
};

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export type Difficulty = 'easy' | 'medium' | 'hard';
export type NoteSkin   = 'circle' | 'star' | 'diamond' | 'emoji';

export interface Song {
  id: string; name: string; artist: string; emoji: string; genre: string;
  bpm: number; difficulty: Difficulty; color: string; pattern: NoteEvent[];
  audioBuffer?: AudioBuffer | null; duration?: number;
  isCustomSlot?: boolean; locked?: boolean;
  premium?: boolean; price?: number;
}
export interface NoteEvent { time: number; lane: number; hit?: boolean; missed?: boolean; }
export interface LeaderboardEntry {
  name: string; score: number; acc: number; song: string;
  date: string; grade: string; difficulty: Difficulty; autoplay?: boolean;
}
export interface GameSettings {
  difficulty: Difficulty; lanes: 2 | 4; noteSkin: NoteSkin;
  playerName: string; autoplay: boolean; volume: number; speed: number;
}

// ─────────────────────────────────────────────
// UTILS
// ─────────────────────────────────────────────
function generatePattern(bpm: number, duration: number, difficulty: Difficulty): NoteEvent[] {
  const beatInterval = 60 / bpm;
  const notes: NoteEvent[] = [];
  const densities: Record<Difficulty, number> = { easy: 0.4, medium: 0.65, hard: 0.9 };
  const density = densities[difficulty];
  let t = 1;
  while (t < duration) {
    for (let lane = 0; lane < 4; lane++) {
      if (Math.random() < density / 4) notes.push({ time: t + Math.random() * 0.05, lane });
    }
    if (difficulty === 'hard' && Math.random() < 0.3)
      notes.push({ time: t + beatInterval / 2 + Math.random() * 0.03, lane: Math.floor(Math.random() * 4) });
    t += beatInterval;
  }
  return notes.sort((a, b) => a.time - b.time);
}

function getGrade(acc: number) {
  if (acc >= 95) return 'S';
  if (acc >= 85) return 'A';
  if (acc >= 70) return 'B';
  if (acc >= 50) return 'C';
  return 'D';
}

const LANE_COLORS = ['#FF6B6B', '#4FC3F7', '#81C784', '#FFD54F'];
const HIT_LINE_Y_RATIO = 0.82;

function buildSongs(): Song[] {
  return [
    // ── FREE SONGS ──
    { id: 'demo1', name: 'Cosmic Groove',   artist: 'Beat Bang!',  emoji: '🚀', genre: 'EDM',    bpm: 128, difficulty: 'medium', color: '#4FC3F7', pattern: generatePattern(128, 60, 'medium') },
    { id: 'demo2', name: 'Neon Rush',        artist: 'SynthWave',   emoji: '⚡', genre: 'EDM',    bpm: 160, difficulty: 'hard',   color: '#FF6B6B', pattern: generatePattern(160, 60, 'hard')   },
    { id: 'demo3', name: 'Chill Vibes',      artist: 'Lo-Fi Crew',  emoji: '🌊', genre: 'POP',    bpm: 120, difficulty: 'easy',   color: '#81C784', pattern: generatePattern(90,  60, 'easy')   },
    { id: 'demo4', name: 'Jazz Hands',       artist: 'Swing Kings', emoji: '🎷', genre: 'JAZZ',   bpm: 140, difficulty: 'medium', color: '#CE93D8', pattern: generatePattern(110, 60, 'medium') },
    { id: 'demo5', name: 'Rock Solid',       artist: 'The Riffs',   emoji: '🎸', genre: 'ROCK',   bpm: 160, difficulty: 'hard',   color: '#FFCC02', pattern: generatePattern(140, 60, 'hard')   },
    // ── PREMIUM SONGS (butuh BeatPoints) ──
    { id: 'premium1', name: 'Galaxy Overdrive', artist: 'StarForce',   emoji: '🌌', genre: 'EDM',   bpm: 175, difficulty: 'hard',   color: '#AA00FF', pattern: generatePattern(175, 75, 'hard'),   premium: true, price: 20  },
    { id: 'premium2', name: 'Sakura Storm',     artist: 'J-Rhythm',    emoji: '🌸', genre: 'J-POP', bpm: 148, difficulty: 'medium', color: '#FF69B4', pattern: generatePattern(148, 75, 'medium'), premium: true, price: 30  },
    { id: 'premium3', name: 'Inferno King',     artist: 'HellBeats',   emoji: '👑', genre: 'METAL', bpm: 200, difficulty: 'hard',   color: '#FF4500', pattern: generatePattern(200, 75, 'hard'),   premium: true, price: 50  },
    // ── CUSTOM SLOTS ──
    { id: 'custom1', name: 'Your Music Here', artist: 'Upload MP3/WAV', emoji: '📁', genre: 'CUSTOM', bpm: 120, difficulty: 'medium', color: '#A5D6A7', pattern: [], isCustomSlot: true },
    { id: 'custom2', name: 'Your Music Here', artist: 'Upload MP3/WAV', emoji: '📁', genre: 'CUSTOM', bpm: 120, difficulty: 'medium', color: '#80CBC4', pattern: [], isCustomSlot: true },
  ];
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function BeatBangGame() {
  // refs
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const waveRef      = useRef<HTMLCanvasElement>(null);
  const hitLayerRef  = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const songsRef     = useRef<Song[]>(buildSongs());

  // audio refs
  const audioCtxRef   = useRef<AudioContext | null>(null);
  const analyserRef   = useRef<AnalyserNode | null>(null);
  const gainRef       = useRef<GainNode | null>(null);
  const sourceRef     = useRef<AudioBufferSourceNode | null>(null);
  const audioStartRef = useRef(0);
  const animFrameRef  = useRef<number>(0);

  // mutable game state (not React state — updated every frame)
  const gs = useRef({
    score: 0, combo: 0, maxCombo: 0, life: 5, maxLife: 5,
    totalNotes: 0, hitNotes: 0, perfectHits: 0, greatHits: 0, goodHits: 0, missHits: 0,
    isPlaying: false, isPaused: false, pauseStart: 0,
    spawnedNotes: 0, activeNotes: [] as NoteEvent[],
    activeSong: songsRef.current[0],
    lanes: 4 as 2 | 4, noteSkin: 'circle' as NoteSkin,
    autoplay: false, volume: 0.7, speed: 1.0, difficulty: 'medium' as Difficulty,
    playerName: 'Anonymous', currentTime: 0,
  });

  // React UI state
  // BeatPoints
  const { points: beatPoints, history: bpHistory, creditPoints, purchaseSong, isSongOwned } = useBeatPoints();
  const [topupOpen,    setTopupOpen]    = useState(false);

  const [songs,        setSongs]        = useState<Song[]>(songsRef.current);
  const [activeSongId, setActiveSongId] = useState('demo1');
  const [booting,      setBooting]      = useState(true);
  const [purchaseModal,setPurchaseModal]= useState<Song|null>(null);
  const [isPlaying,    setIsPlaying]    = useState(false);
  const [isPaused,     setIsPaused]     = useState(false);
  const [score,        setScore]        = useState(0);
  const [combo,        setCombo]        = useState(0);
  const [acc,          setAcc]          = useState(100);
  const [life,         setLife]         = useState(5);
  const [progressPct,  setProgressPct]  = useState(0);
  const [progressLabel,setProgressLabel]= useState('0:00 / 0:00');
  const [notif,        setNotif]        = useState('');
  const [notifOn,      setNotifOn]      = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen,  setSidebarOpen]  = useState(false);
  const [lbOpen,       setLbOpen]       = useState(false);
  const [countdown,    setCountdown]    = useState<number | null>(null);
  const [result,       setResult]       = useState<null|{score:number;acc:number;maxCombo:number;perfectHits:number;grade:string;song:string}>(null);
  const [lbTab,        setLbTab]        = useState<Difficulty|'all'>('all');
  const [bestScore,    setBestScore]    = useState(0);
  const [leaderboard,  setLeaderboard]  = useState<LeaderboardEntry[]>([]);
  const [laneFlash,    setLaneFlash]    = useState<Record<number,string>>({});
  const [settings,     setSettings]     = useState<GameSettings>({
    difficulty: 'medium', lanes: 4, noteSkin: 'circle',
    playerName: 'Anonymous', autoplay: false, volume: 70, speed: 100,
  });

  // ── init ──
  useEffect(() => {
    const name = ls.get('bb_name', 'Anonymous');
    const best = parseInt(ls.get('bb_best', '0'));
    const lb: LeaderboardEntry[] = ls.getJSON<LeaderboardEntry[]>('bb_lb', []);
    setSettings(s => ({ ...s, playerName: name }));
    gs.current.playerName = name;
    setBestScore(best);
    setLeaderboard(lb);

    resizeCanvas();
    renderIdle();
    renderWaveIdle();

    window.addEventListener('resize', resizeCanvas);

    const handleKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const keyMap: Record<string, number> = { d: 0, f: 1, j: 2, k: 3 };
      const key = e.key.toLowerCase();
      if (key in keyMap) tapLane(keyMap[key]);
      if (key === ' ' || key === 'enter') { e.preventDefault(); handlePlayPause(); }
      if (key === 'escape') { setSettingsOpen(false); setSidebarOpen(false); setLbOpen(false); }
    };
    window.addEventListener('keydown', handleKey);

    showNotif('🎵 USE D F J K KEYS TO PLAY!');

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('keydown', handleKey);
      cancelAnimationFrame(animFrameRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // sync settings → gs
  useEffect(() => {
    gs.current.difficulty  = settings.difficulty;
    gs.current.lanes       = settings.lanes;
    gs.current.noteSkin    = settings.noteSkin;
    gs.current.autoplay    = settings.autoplay;
    gs.current.volume      = settings.volume / 100;
    gs.current.speed       = settings.speed / 100;
    gs.current.playerName  = settings.playerName;
    if (gainRef.current && audioCtxRef.current)
      gainRef.current.gain.setValueAtTime(settings.volume / 100, audioCtxRef.current.currentTime);
    if (sourceRef.current)
      sourceRef.current.playbackRate.value = settings.speed / 100;
  }, [settings]);

  // ── canvas ──
  function resizeCanvas() {
    const c = canvasRef.current;
    const w = waveRef.current;
    if (c) { c.width = c.parentElement?.clientWidth || window.innerWidth; c.height = c.parentElement?.clientHeight || window.innerHeight; }
    if (w) { w.width = w.parentElement?.clientWidth || window.innerWidth; w.height = 56; }
  }

  function renderIdle() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const { lanes } = gs.current;
    const W = canvas.width, H = canvas.height;

    ctx.fillStyle = '#0d0d0d'; ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 25) for (let y = 0; y < H; y += 25) {
      ctx.beginPath(); ctx.arc(x, y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255,255,255,0.04)'; ctx.fill();
    }

    const hitY = H * HIT_LINE_Y_RATIO;
    for (let i = 1; i < lanes; i++) {
      ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo((W/lanes)*i,0); ctx.lineTo((W/lanes)*i,H); ctx.stroke();
    }
    ctx.strokeStyle = '#FFE000'; ctx.lineWidth = 3; ctx.setLineDash([10,5]);
    ctx.beginPath(); ctx.moveTo(0,hitY); ctx.lineTo(W,hitY); ctx.stroke();
    ctx.setLineDash([]);
    for (let i = 0; i < lanes; i++) {
      const x = (W/lanes)*i + (W/lanes)/2;
      ctx.beginPath(); ctx.arc(x,hitY,26,0,Math.PI*2);
      ctx.strokeStyle = LANE_COLORS[i]+'50'; ctx.lineWidth = 8; ctx.stroke();
      ctx.fillStyle = LANE_COLORS[i]+'20'; ctx.fill();
    }

    const song = gs.current.activeSong;
    ctx.fillStyle = 'rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,H);
    ctx.textAlign = 'center';
    ctx.fillStyle = '#FFE000';
    ctx.font = `bold ${Math.min(64, W*0.08)}px Bangers,cursive`;
    ctx.fillText(song.name, W/2, H*0.38);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = `${Math.min(26,W*0.032)}px 'Permanent Marker',cursive`;
    ctx.fillText(song.artist, W/2, H*0.48);
    ctx.fillStyle = '#FFE000';
    ctx.font = `${Math.min(20,W*0.025)}px Bangers,cursive`;
    ctx.fillText('▶  PRESS PLAY TO START!', W/2, H*0.62);
  }

  function renderWaveIdle() {
    const w = waveRef.current; if (!w) return;
    const ctx = w.getContext('2d'); if (!ctx) return;
    ctx.clearRect(0,0,w.width,w.height);
    ctx.strokeStyle = 'rgba(255,255,255,0.12)'; ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w.width; x++) {
      const y = w.height/2 + Math.sin(x*0.05)*10;
      x===0 ? ctx.moveTo(x,y) : ctx.lineTo(x,y);
    }
    ctx.stroke();
  }

  // ── audio ──
  function initAudio() {
    if (audioCtxRef.current) return;
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = ctx.createAnalyser(); analyser.fftSize = 256;
    const gain = ctx.createGain(); gain.gain.value = gs.current.volume;
    analyser.connect(gain); gain.connect(ctx.destination);
    audioCtxRef.current = ctx; analyserRef.current = analyser; gainRef.current = gain;
  }

  function createDemoAudio(bpm: number, duration: number): AudioBuffer {
    const ctx = audioCtxRef.current!;
    const sr = ctx.sampleRate;
    const buf = ctx.createBuffer(2, sr*duration, sr);
    const bi = (60/bpm)*sr;
    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      for (let i = 0; i < sr*duration; i++) {
        const t = i/sr, ph = (i%bi)/bi, bt = Math.floor(i/bi);
        let s = 0;
        if (ph < 0.05) s += 0.6*Math.sin(2*Math.PI*150*Math.exp(-ph*40)*ph)*Math.exp(-ph*25);
        if (bt%2===1 && ph<0.04) s += 0.4*(Math.random()*2-1)*Math.exp(-ph*30);
        const hp=(i%(bi/2))/(bi/2); if (hp<0.02) s += 0.2*(Math.random()*2-1)*Math.exp(-hp*60);
        const bn=60+(bt%4)*7, bf=440*Math.pow(2,(bn-69)/12);
        s += 0.15*Math.sin(2*Math.PI*bf*t)*(1-ph*0.5);
        const mn=72+[0,4,7,12,7,4,2,0][bt%8], mf=440*Math.pow(2,(mn-69)/12);
        if (bt%2===0 && ph<0.3) s += 0.12*Math.sin(2*Math.PI*mf*t)*Math.exp(-ph*3);
        d[i] = Math.tanh(s*1.5);
      }
    }
    return buf;
  }

  function playAudio(offset=0) {
    if (!audioCtxRef.current) return;
    if (sourceRef.current) { try { sourceRef.current.stop(); } catch(_){} }
    const song = gs.current.activeSong;
    const buf  = song.audioBuffer || createDemoAudio(song.bpm, 65);
    const src  = audioCtxRef.current.createBufferSource();
    src.buffer = buf; src.playbackRate.value = gs.current.speed;
    src.connect(analyserRef.current!);
    src.start(0, offset);
    audioStartRef.current = audioCtxRef.current.currentTime - offset;
    sourceRef.current = src;
    src.onended = () => { if (gs.current.isPlaying && !gs.current.isPaused) endGame(); };
  }

  function getAudioTime() {
    if (!audioCtxRef.current || !sourceRef.current) return 0;
    return audioCtxRef.current.currentTime - audioStartRef.current;
  }

  // ── hit text / particles ──
  const showNotif = useCallback((msg: string) => {
    setNotif(msg); setNotifOn(true);
    setTimeout(() => setNotifOn(false), 2500);
  }, []);

  function spawnHitText(text: string, lane: number, type: string) {
    const layer = hitLayerRef.current, canvas = canvasRef.current;
    if (!layer || !canvas) return;
    const el = document.createElement('div');
    const col = type==='perfect'?'#FFE000':type==='great'?'#00C853':type==='good'?'#1E90FF':'#FF2D2D';
    el.style.cssText = `position:absolute;font-family:'Bangers',cursive;font-size:clamp(28px,4vw,42px);
      letter-spacing:3px;pointer-events:none;z-index:100;text-shadow:3px 3px 0 #1a1a1a;
      animation:hitPop 0.65s ease-out forwards;color:${col};`;
    const lW = canvas.clientWidth / gs.current.lanes;
    el.style.left = (lW*lane + lW/2) + 'px';
    el.style.top  = (canvas.clientHeight * HIT_LINE_Y_RATIO) + 'px';
    el.style.transform = 'translateX(-50%)';
    el.textContent = text;
    layer.appendChild(el);
    setTimeout(() => el.remove(), 700);
  }

  function spawnParticles(lane: number) {
    const canvas = canvasRef.current; if (!canvas) return;
    const lW = canvas.clientWidth / gs.current.lanes;
    const rect = canvas.getBoundingClientRect();
    const x = rect.left + lW*lane + lW/2;
    const y = rect.top  + canvas.clientHeight * HIT_LINE_Y_RATIO;
    const emojis = ['✨','⭐','💫','🌟','✦'];
    for (let i = 0; i < 6; i++) {
      const el = document.createElement('div');
      el.style.cssText = `position:fixed;pointer-events:none;z-index:9999;font-size:22px;
        left:${x}px;top:${y}px;
        --tx:${Math.random()*120-60}px;--ty:${-60-Math.random()*80}px;
        animation:particleFly 0.9s ease-out ${i*0.05}s forwards;`;
      el.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 1000);
    }
  }

  function flashLane(lane: number, type: string) {
    setLaneFlash(f => ({ ...f, [lane]: type }));
    setTimeout(() => setLaneFlash(f => { const n={...f}; delete n[lane]; return n; }), 150);
  }

  function updateHUD() {
    const s = gs.current;
    setScore(s.score); setCombo(s.combo); setLife(s.life);
    const a = s.hitNotes+s.missHits > 0
      ? Math.round((s.hitNotes/(s.hitNotes+s.missHits))*100) : 100;
    setAcc(Math.min(100,Math.max(0,a)));
  }

  // ── canvas draw ──
  function drawNote(ctx: CanvasRenderingContext2D, x: number, y: number, lane: number, skin: NoteSkin) {
    const r = 22;
    ctx.save(); ctx.shadowColor = LANE_COLORS[lane]; ctx.shadowBlur = 12;
    if (skin==='circle') {
      ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2);
      ctx.fillStyle = LANE_COLORS[lane]; ctx.fill();
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.stroke();
      ctx.beginPath(); ctx.arc(x-r*0.3, y-r*0.3, r*0.3, 0, Math.PI*2);
      ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.fill();
    } else if (skin==='star') {
      drawStar(ctx,x,y,5,r,r*0.4,LANE_COLORS[lane]);
    } else if (skin==='diamond') {
      ctx.beginPath(); ctx.moveTo(x,y-r); ctx.lineTo(x+r*0.7,y);
      ctx.lineTo(x,y+r); ctx.lineTo(x-r*0.7,y); ctx.closePath();
      ctx.fillStyle = LANE_COLORS[lane]; ctx.fill();
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = 3; ctx.stroke();
    } else {
      ctx.font = `${r*1.7}px serif`; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText(['🎵','🎶','⭐','💫'][lane], x, y);
    }
    ctx.restore();
  }

  function drawStar(ctx: CanvasRenderingContext2D,cx:number,cy:number,sp:number,oR:number,iR:number,col:string) {
    let rot=(Math.PI/2)*3; const step=Math.PI/sp;
    ctx.beginPath();
    for(let i=0;i<sp;i++){
      ctx.lineTo(cx+Math.cos(rot)*oR, cy+Math.sin(rot)*oR); rot+=step;
      ctx.lineTo(cx+Math.cos(rot)*iR, cy+Math.sin(rot)*iR); rot+=step;
    }
    ctx.closePath(); ctx.fillStyle=col; ctx.fill();
    ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=3; ctx.stroke();
  }

  function renderFrame() {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    const s = gs.current, W=canvas.width, H=canvas.height, lanes=s.lanes;

    ctx.fillStyle='#0d0d0d'; ctx.fillRect(0,0,W,H);
    for(let x=0;x<W;x+=25) for(let y=0;y<H;y+=25){
      ctx.beginPath(); ctx.arc(x,y,1.5,0,Math.PI*2);
      ctx.fillStyle='rgba(255,255,255,0.03)'; ctx.fill();
    }

    for(let i=1;i<lanes;i++){
      ctx.strokeStyle='rgba(255,255,255,0.07)'; ctx.lineWidth=1;
      ctx.beginPath(); ctx.moveTo((W/lanes)*i,0); ctx.lineTo((W/lanes)*i,H); ctx.stroke();
    }
    for(let i=0;i<lanes;i++){
      const lx=(W/lanes)*i, lw=W/lanes;
      const g=ctx.createLinearGradient(lx,0,lx+lw,0);
      g.addColorStop(0,'transparent'); g.addColorStop(0.5,LANE_COLORS[i]+'0A'); g.addColorStop(1,'transparent');
      ctx.fillStyle=g; ctx.fillRect(lx,0,lw,H);
    }

    const hitY = H*HIT_LINE_Y_RATIO;
    ctx.strokeStyle='#FFE000'; ctx.lineWidth=3; ctx.setLineDash([10,5]);
    ctx.beginPath(); ctx.moveTo(0,hitY); ctx.lineTo(W,hitY); ctx.stroke();
    ctx.setLineDash([]);

    for(let i=0;i<lanes;i++){
      const x=(W/lanes)*i+(W/lanes)/2;
      ctx.beginPath(); ctx.arc(x,hitY,26,0,Math.PI*2);
      ctx.strokeStyle=LANE_COLORS[i]+'55'; ctx.lineWidth=8; ctx.stroke();
      ctx.beginPath(); ctx.arc(x,hitY,22,0,Math.PI*2);
      ctx.fillStyle=LANE_COLORS[i]+'25'; ctx.fill();
      ctx.strokeStyle='#1a1a1a'; ctx.lineWidth=2; ctx.stroke();
    }

    const now=getAudioTime(), look=2.0;
    for(const note of s.activeNotes){
      if(note.hit||note.missed) continue;
      const tu=note.time-now; if(tu>look||tu<-0.5) continue;
      const prog=1-tu/look, ny=prog*hitY, nx=(W/lanes)*(note.lane%lanes)+(W/lanes)/2;
      if(tu<0.3&&tu>-0.15){
        const int=1-Math.abs(tu)/0.3;
        ctx.beginPath(); ctx.arc(nx,ny,30*int+22,0,Math.PI*2);
        ctx.fillStyle=LANE_COLORS[note.lane%lanes]+Math.floor(int*80).toString(16).padStart(2,'0'); ctx.fill();
      }
      drawNote(ctx,nx,ny,note.lane%lanes,s.noteSkin);
    }

    // beat pulse
    const bph=(now%(60/s.activeSong.bpm))/(60/s.activeSong.bpm);
    const bp=Math.max(0,1-bph*3);
    if(bp>0){ ctx.fillStyle=`rgba(255,224,0,${bp*0.12})`; ctx.fillRect(0,0,W,H); }

    if(s.autoplay){
      ctx.fillStyle='rgba(255,200,0,0.75)'; ctx.font='bold 16px Bangers,cursive';
      ctx.textAlign='center'; ctx.fillText('🤖 AUTO-PLAY (DEMO)',W/2,28);
    }
  }

  function renderWaveform() {
    const w = waveRef.current; if (!w) return;
    const ctx = w.getContext('2d'); if (!ctx) return;
    const W=w.width, H=w.height; ctx.clearRect(0,0,W,H);
    if (!analyserRef.current || !gs.current.isPlaying) { renderWaveIdle(); return; }
    const bufLen=analyserRef.current.frequencyBinCount;
    const data=new Uint8Array(bufLen); analyserRef.current.getByteTimeDomainData(data);
    ctx.lineWidth=2; ctx.strokeStyle='rgba(255,255,255,0.4)'; ctx.beginPath();
    const sw=W/bufLen; let x=0;
    for(let i=0;i<bufLen;i++){
      const v=data[i]/128, y=(v*H)/2;
      i===0?ctx.moveTo(x,y):ctx.lineTo(x,y); x+=sw;
    }
    ctx.stroke();
    const fd=new Uint8Array(bufLen); analyserRef.current.getByteFrequencyData(fd);
    const bw=W/(bufLen/2);
    for(let i=0;i<bufLen/2;i++){
      const bh=(fd[i]/255)*H*0.85;
      ctx.fillStyle=`hsla(${(i/(bufLen/2))*120+200},80%,55%,0.45)`;
      ctx.fillRect(i*bw, H-bh, bw-1, bh);
    }
  }

  // ── game loop ──
  function gameLoop() {
    if (!gs.current.isPlaying || gs.current.isPaused) return;
    const s = gs.current, now = getAudioTime();
    s.currentTime = now;

    const pat = s.activeSong.pattern;
    while(s.spawnedNotes<pat.length && pat[s.spawnedNotes].time<=now+2.5){
      s.activeNotes.push({...pat[s.spawnedNotes], hit:false, missed:false});
      s.spawnedNotes++;
    }

    for(const n of s.activeNotes)
      if(!n.hit&&!n.missed&&now>n.time+0.2){ n.missed=true; onMiss(); }

    if(s.autoplay)
      for(const n of s.activeNotes)
        if(!n.hit&&!n.missed&&Math.abs(now-n.time)<0.06){ n.hit=true; onHit('perfect',n.lane%s.lanes); }

    if(s.activeNotes.length>200) s.activeNotes=s.activeNotes.filter(n=>n.time>now-1);

    const dur = s.activeSong.audioBuffer ? s.activeSong.audioBuffer.duration : 65;
    setProgressPct(Math.min(100,(now/dur)*100));
    const ms=Math.floor(now/60), ss=Math.floor(now%60).toString().padStart(2,'0');
    const tm=Math.floor(dur/60), ts=Math.floor(dur%60).toString().padStart(2,'0');
    setProgressLabel(`${ms}:${ss} / ${tm}:${ts}`);

    renderFrame(); renderWaveform();
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }

  // ── game events ──
  function onHit(type: string, lane: number) {
    const s=gs.current, pts:Record<string,number>={perfect:300,great:150,good:80};
    s.score += Math.round(pts[type]*(1+Math.floor(s.combo/10)*0.5));
    s.combo++; s.maxCombo=Math.max(s.maxCombo,s.combo); s.hitNotes++;
    if(type==='perfect') s.perfectHits++; else if(type==='great') s.greatHits++; else s.goodHits++;
    flashLane(lane,type); updateHUD();
  }

  function onMiss() {
    const s=gs.current; s.combo=0; s.missHits++; s.life=Math.max(0,s.life-1);
    updateHUD(); if(s.life<=0){ endGame(); return; }
    const el=document.querySelector('.bb-canvas-wrap') as HTMLElement;
    if(el){ el.classList.add('bb-shake'); setTimeout(()=>el.classList.remove('bb-shake'),300); }
  }

  function tapLane(lane: number) {
    const s=gs.current; if(!s.isPlaying||s.isPaused||lane>=s.lanes) return;
    const now=getAudioTime();
    let best:NoteEvent|null=null, bd=Infinity;
    for(const n of s.activeNotes){
      if(n.hit||n.missed||n.lane%s.lanes!==lane) continue;
      const d=Math.abs(now-n.time); if(d<bd){ bd=d; best=n; }
    }
    if(!best||bd>0.25){ spawnHitText('MISS!',lane,'miss'); return; }
    best.hit=true;
    const ht = bd<0.06?'perfect':bd<0.12?'great':'good';
    onHit(ht,lane); spawnHitText(ht.toUpperCase()+'!',lane,ht); spawnParticles(lane);
  }

  function startCountdown(cb: ()=>void) {
    let c=3; setCountdown(c);
    const iv=setInterval(()=>{ c--; if(c<=0){ clearInterval(iv); setCountdown(null); cb(); } else setCountdown(c); },1000);
  }

  function doStartGame() {
    initAudio(); audioCtxRef.current?.resume();
    const s=gs.current;
    s.score=0;s.combo=0;s.maxCombo=0;s.life=s.maxLife;
    s.totalNotes=s.activeSong.pattern.length;
    s.hitNotes=0;s.perfectHits=0;s.greatHits=0;s.goodHits=0;s.missHits=0;
    s.isPlaying=true;s.isPaused=false;s.spawnedNotes=0;s.activeNotes=[];
    updateHUD(); setIsPlaying(true); setIsPaused(false); setProgressPct(0);
    playAudio(0);
    animFrameRef.current=requestAnimationFrame(gameLoop);
  }

  function handlePlay() { if(!gs.current.isPlaying) startCountdown(doStartGame); }

  function handlePlayPause() {
    if(!gs.current.isPlaying){ handlePlay(); return; }
    const s=gs.current;
    if(s.isPaused){
      s.isPaused=false;
      audioStartRef.current+=(audioCtxRef.current!.currentTime-s.pauseStart);
      playAudio(getAudioTime()); setIsPaused(false);
      animFrameRef.current=requestAnimationFrame(gameLoop);
    } else {
      s.isPaused=true; s.pauseStart=audioCtxRef.current!.currentTime;
      if(sourceRef.current){try{sourceRef.current.stop();}catch(_){} sourceRef.current=null;}
      cancelAnimationFrame(animFrameRef.current); setIsPaused(true);
    }
  }

  function handleStop() {
    gs.current.isPlaying=false; gs.current.isPaused=false;
    if(sourceRef.current){try{sourceRef.current.stop();}catch(_){} sourceRef.current=null;}
    cancelAnimationFrame(animFrameRef.current);
    setIsPlaying(false); setIsPaused(false); setProgressPct(0);
    renderIdle(); renderWaveIdle();
  }

  function handleRestart() { handleStop(); setTimeout(handlePlay,100); }

  function endGame() {
    const s=gs.current; if(!s.isPlaying) return;
    s.isPlaying=false; cancelAnimationFrame(animFrameRef.current); setIsPlaying(false);
    const finalScore=s.score;
    const best=parseInt(ls.get('bb_best','0'));
    if(finalScore>best){ ls.set('bb_best',String(finalScore)); setBestScore(finalScore); }
    const totalHits=s.perfectHits+s.greatHits+s.goodHits;
    const accV=s.totalNotes>0?Math.round((totalHits/s.totalNotes)*100):0;
    const grade=getGrade(accV);
    if(!s.autoplay){
      const lb:LeaderboardEntry[]=ls.getJSON<LeaderboardEntry[]>('bb_lb',[]);
      lb.push({name:s.playerName,score:finalScore,acc:accV,song:s.activeSong.name,date:new Date().toLocaleDateString(),grade,difficulty:s.difficulty});
      lb.sort((a,b)=>b.score-a.score); lb.splice(20,999);
      ls.setJSON('bb_lb',lb); setLeaderboard(lb);
    }
    setResult({score:finalScore,acc:accV,maxCombo:s.maxCombo,perfectHits:s.perfectHits,grade,song:s.activeSong.name});
    renderIdle();
  }

  function handleSelectSong(song: Song) {
    if(song.isCustomSlot){ fileInputRef.current?.click(); return; }
    // Check premium — show purchase modal if not owned
    if(song.premium && !isSongOwned(song.id)){
      setPurchaseModal(song);
      return;
    }
    gs.current.activeSong=song; setActiveSongId(song.id); handleStop();
    showNotif(`🎵 ${song.name.toUpperCase()}`);
  }

  function handlePurchaseSong(song: Song) {
    const ok = purchaseSong(song.id);
    if(ok){
      showNotif(`💎 ${song.name.toUpperCase()} UNLOCKED!`);
      setPurchaseModal(null);
      gs.current.activeSong=song; setActiveSongId(song.id); handleStop();
    } else {
      showNotif('❌ BEATPOINTS TIDAK CUKUP!');
      setPurchaseModal(null);
      setTopupOpen(true);
    }
  }

  function handleTopupSuccess(pkg: TopupPackage, orderId: string) {
    creditPoints(pkg, orderId);
    showNotif(`✅ +${pkg.points + pkg.bonus} BEATPOINTS DITAMBAHKAN!`);
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file=e.target.files?.[0]; if(!file) return;
    initAudio();
    try {
      const decoded=await audioCtxRef.current!.decodeAudioData(await file.arrayBuffer());
      const slot=songsRef.current.find(s=>s.isCustomSlot&&!s.audioBuffer);
      if(slot){
        slot.audioBuffer=decoded; slot.name=file.name.replace(/\.[^.]+$/,'');
        slot.artist='Your Upload'; slot.emoji='🎵'; slot.isCustomSlot=false;
        slot.duration=decoded.duration;
        slot.pattern=generatePattern(120,decoded.duration,gs.current.difficulty);
        setSongs([...songsRef.current]); showNotif('🎵 MUSIC LOADED!');
      } else showNotif('⚠️ NO MORE SLOTS!');
    } catch { showNotif('⚠️ COULD NOT LOAD'); }
    e.target.value='';
  }

  function handleSaveSettings(ns: GameSettings) {
    setSettings(ns); ls.set('bb_name',ns.playerName);
    setSettingsOpen(false); showNotif('⚙️ SETTINGS SAVED!');
    songsRef.current.forEach(s=>{ if(!s.audioBuffer) s.pattern=generatePattern(s.bpm,65,ns.difficulty); });
    setSongs([...songsRef.current]);
  }

  // ── derived ──
  const diffColor:Record<Difficulty,string>={easy:'#00C853',medium:'#FF6B00',hard:'#FF2D2D'};
  const activeSong = songsRef.current.find(s=>s.id===activeSongId) || songsRef.current[0];

  // ─────────────────────────────────────────────
  // RENDER — fullscreen-first layout
  // ─────────────────────────────────────────────
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Permanent+Marker&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .bb-wrap {
          position: fixed; inset: 0;
          background: #0d0d0d;
          display: flex; flex-direction: column;
          font-family: 'Comic Neue', cursive;
          overflow: hidden;
        }

        /* ── TOP HUD ── */
        .bb-hud {
          position: relative; z-index: 10;
          background: rgba(13,13,13,0.92);
          border-bottom: 3px solid #1a1a1a;
          padding: 6px 12px;
          display: flex; align-items: center; gap: 10px;
          flex-shrink: 0;
          backdrop-filter: blur(4px);
        }
        .bb-logo {
          font-family: 'Bangers', cursive;
          font-size: clamp(22px,3vw,34px);
          color: #FFE000;
          letter-spacing: 3px;
          text-shadow: 2px 2px 0 #FF2D2D, 4px 4px 0 #1a1a1a;
          white-space: nowrap;
          flex-shrink: 0;
        }
        .bb-hud-stats {
          display: flex; gap: 6px; flex: 1;
        }
        .bb-stat {
          background: #1a1a1a; border: 3px solid #333;
          padding: 4px 10px; text-align: center; min-width: 70px;
          box-shadow: 2px 2px 0 #000;
          flex: 1;
        }
        .bb-stat-label {
          font-family: 'Bangers', cursive; font-size: 10px;
          letter-spacing: 1px; color: #00bbff;
        }
        .bb-stat-val {
          font-family: 'Bangers', cursive; font-size: clamp(18px,2.5vw,26px);
          line-height: 1;
        }
        .bb-hud-controls {
          display: flex; gap: 6px; align-items: center; flex-shrink: 0;
        }
        .bb-ctrl-btn {
          font-family: 'Bangers', cursive; font-size: clamp(13px,1.8vw,18px);
          letter-spacing: 1px; padding: 6px 14px;
          border: 3px solid #444; cursor: pointer;
          transition: transform 0.1s, box-shadow 0.1s, background 0.1s;
          display: inline-flex; align-items: center; gap: 5px;
          white-space: nowrap;
        }
        .bb-ctrl-btn:hover { transform: translate(-1px,-1px); border-color: #fff; }
        .bb-ctrl-btn:active { transform: translate(1px,1px); }

        /* ── CANVAS AREA ── */
        .bb-canvas-area {
          position: relative; flex: 1; min-height: 0;
        }
        .bb-canvas-wrap {
          position: relative; width: 100%; height: 100%;
        }
        .bb-canvas-wrap canvas {
          display: block; width: 100%; height: 100%;
        }

        /* ── BOTTOM: WAVE + LIFE + PROGRESS + LANES ── */
        .bb-bottom {
          position: relative; z-index: 10;
          background: rgba(13,13,13,0.95);
          border-top: 3px solid #222;
          flex-shrink: 0;
        }
        .bb-wave-bar {
          width: 100%; height: 48px; display: block;
          border-bottom: 2px solid #1a1a1a;
        }
        .bb-bottom-hud {
          padding: 4px 12px;
          display: flex; align-items: center; gap: 10px;
        }
        .bb-hearts { display: flex; gap: 3px; }
        .bb-heart { font-size: 20px; transition: all 0.2s; filter: drop-shadow(1px 1px 0 #000); }
        .bb-heart.lost { opacity: 0.18; transform: scale(0.75); filter: grayscale(1); }
        .bb-progress-wrap {
          flex: 1; height: 16px; background: #1a1a1a;
          border: 2px solid #333; position: relative; overflow: hidden;
        }
        .bb-progress-bar {
          height: 100%; transition: width 0.3s;
          background: repeating-linear-gradient(45deg,#00bbff,#00bbff 8px,#FF6B00 8px,#FF6B00 16px);
          border-right: 2px solid #fff;
        }
        .bb-progress-label {
          position: absolute; right: 6px; top: 50%; transform: translateY(-50%);
          font-family: 'Bangers', cursive; font-size: 11px; letter-spacing: 1px; color: #fff;
        }
        .bb-lanes {
          display: flex; gap: 6px; padding: 6px 12px 8px;
        }
        .bb-lane {
          flex: 1; height: clamp(56px, 8vh, 76px);
          border: 3px solid #1a1a1a; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Bangers', cursive; font-size: clamp(22px,3vw,32px);
          letter-spacing: 2px; user-select: none; position: relative;
          transition: transform 0.05s, box-shadow 0.05s, filter 0.1s;
          box-shadow: 3px 3px 0 #000;
        }
        .bb-lane:active { transform: translateY(3px); box-shadow: 0 0 0 #000; }
        .bb-lane-key {
          position: absolute; top: 3px; left: 6px;
          font-size: 11px; opacity: 0.55;
          font-family: 'Bangers', cursive;
        }

        /* ── SIDEBAR PANEL (song list + leaderboard) ── */
        .bb-sidebar {
          position: fixed; top: 0; right: 0; bottom: 0;
          width: min(380px, 92vw);
          background: #FFFDF0;
          border-left: 4px solid #1a1a1a;
          box-shadow: -6px 0 0 #000;
          z-index: 200;
          transform: translateX(100%);
          transition: transform 0.3s cubic-bezier(0.34,1.2,0.64,1);
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .bb-sidebar.open { transform: translateX(0); }
        .bb-sidebar-backdrop {
          position: fixed; inset: 0; background: rgba(0,0,0,0.5);
          backdrop-filter: blur(2px); z-index: 199;
          opacity: 0; pointer-events: none; transition: opacity 0.3s;
        }
        .bb-sidebar-backdrop.open { opacity: 1; pointer-events: all; }
        .bb-sidebar-header {
          background: #1a1a1a; padding: 12px 16px;
          display: flex; align-items: center; justify-content: space-between;
          flex-shrink: 0;
        }
        .bb-sidebar-tabs {
          display: flex; border-bottom: 3px solid #1a1a1a; flex-shrink: 0;
        }
        .bb-sidebar-tab {
          flex: 1; padding: 8px; cursor: pointer;
          font-family: 'Bangers', cursive; font-size: 15px; letter-spacing: 1px;
          text-align: center; border: none; border-right: 2px solid #1a1a1a;
          background: #fff; transition: background 0.1s;
        }
        .bb-sidebar-tab:last-child { border-right: none; }
        .bb-sidebar-tab.active { background: #00bbff; color: #1a1a1a; }
        .bb-sidebar-body { flex: 1; overflow-y: auto; padding: 12px; }

        .bb-song-card {
          background: #fff; border: 3px solid #1a1a1a;
          box-shadow: 3px 3px 0 #1a1a1a; padding: 10px;
          cursor: pointer; transition: transform 0.1s, box-shadow 0.1s;
          margin-bottom: 8px; display: flex; align-items: center; gap: 10px;
        }
        .bb-song-card:hover { transform: translate(-1px,-1px); box-shadow: 4px 4px 0 #1a1a1a; }
        .bb-song-card.active { background: #00bbff; }
        .bb-drop-zone {
          border: 3px dashed #1a1a1a; padding: 14px; text-align: center;
          cursor: pointer; border-radius: 4px; margin-top: 8px;
          background: repeating-linear-gradient(45deg,#e8f4ff,#e8f4ff 8px,rgba(255,255,255,0.6) 8px,rgba(255,255,255,0.6) 16px);
          transition: background 0.2s;
        }
        .bb-drop-zone:hover { background: #00bbff44; }

        /* ── ANIMATIONS ── */
        @keyframes hitPop {
          0%   { transform: translateX(-50%) scale(0.5) rotate(-5deg); opacity: 1; }
          40%  { transform: translateX(-50%) scale(1.35) rotate(3deg); opacity: 1; }
          100% { transform: translateX(-50%) scale(1) translateY(-70px) rotate(-2deg); opacity: 0; }
        }
        @keyframes particleFly {
          0%   { opacity:1; transform: scale(1) translate(0,0); }
          100% { opacity:0; transform: scale(0.4) translate(var(--tx),var(--ty)); }
        }
        @keyframes bb-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px) rotate(-1deg); }
          40% { transform: translateX(8px)  rotate(1deg); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes countPop {
          0%   { transform: scale(0.1); opacity:1; }
          60%  { transform: scale(1.25); opacity:1; }
          100% { transform: scale(1);   opacity:0; }
        }
        .bb-shake { animation: bb-shake 0.3s ease; }

        /* ── MOBILE ── */
        @media (max-width: 600px) {
          .bb-hud-stats .bb-stat:nth-child(n+3) { display: none; }
          .bb-logo { font-size: 20px; }
          .bb-ctrl-btn { padding: 5px 9px; font-size: 13px; }
        }
      `}</style>

      {/* ── FULLSCREEN GAME WRAP ── */}
      <div className="bb-wrap">

        {/* TOP HUD */}
        <div className="bb-hud">
          <div className="bb-logo">BEAT<span style={{color:'#FF2D2D'}}>BANG!</span></div>

          <div className="bb-hud-stats">
            {[
              {label:'★ SCORE', val:score.toLocaleString(), color:'#00bbff'},
              {label:'⚡ COMBO', val:combo+'x',             color:'#FF6B00'},
              {label:'🎯 ACC',   val:acc+'%',               color:'#00C853'},
              {label:'🔥 BEST',  val:bestScore.toLocaleString(), color:'#FFE000'},
            ].map(s=>(
              <div key={s.label} className="bb-stat">
                <div className="bb-stat-label">{s.label}</div>
                <div className="bb-stat-val" style={{color:s.color}}>{s.val}</div>
              </div>
            ))}
          </div>

          <div className="bb-hud-controls">
            {/* Play / Pause / Stop */}
            {!isPlaying ? (
              <button className="bb-ctrl-btn" style={{background:'#00C853',color:'#fff',borderColor:'#00C853'}} onClick={handlePlay}>▶ PLAY</button>
            ) : (
              <>
                <button className="bb-ctrl-btn" style={{background:'#FF6B00',color:'#fff',borderColor:'#FF6B00'}} onClick={handlePlayPause}>
                  {isPaused?'▶':'⏸'}
                </button>
                <button className="bb-ctrl-btn" style={{background:'#FF2D2D',color:'#fff',borderColor:'#FF2D2D'}} onClick={handleStop}>⏹</button>
              </>
            )}
            <button className="bb-ctrl-btn" style={{background:'#1E90FF',color:'#fff',borderColor:'#1E90FF'}} onClick={handleRestart}>↺</button>

            {/* Song / LB toggle */}
            <button className="bb-ctrl-btn" style={{background:'#9B59B6',color:'#fff',borderColor:'#9B59B6'}} onClick={()=>setSidebarOpen(v=>!v)}>
              🎵 SONGS
            </button>

            {/* BeatPoints + Topup */}
            <button className="bb-ctrl-btn" style={{background:'#FFE000',color:'#1a1a1a',borderColor:'#1a1a1a',fontWeight:700}} onClick={()=>setTopupOpen(true)}>
              💎 {beatPoints.toLocaleString()} BP
            </button>

            {/* Settings */}
            <button className="bb-ctrl-btn" style={{background:'#1a1a1a',color:'#FFE000',borderColor:'#444'}} onClick={()=>setSettingsOpen(true)}>
              ⚙️
            </button>
          </div>
        </div>

        {/* CANVAS — fills remaining height */}
        <div className="bb-canvas-area">
          <div className="bb-canvas-wrap">
            <canvas ref={canvasRef} />
            <div ref={hitLayerRef} style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'hidden'}} />
            <CountdownOverlay count={countdown} />
          </div>
        </div>

        {/* BOTTOM */}
        <div className="bb-bottom">
          {/* Waveform */}
          <canvas ref={waveRef} className="bb-wave-bar" />

          {/* Life + Progress */}
          <div className="bb-bottom-hud">
            <div style={{fontFamily:'Bangers,cursive',fontSize:14,letterSpacing:2,color:'#fff',whiteSpace:'nowrap'}}>LIFE</div>
            <div className="bb-hearts">
              {Array.from({length:5}).map((_,i)=>(
                <span key={i} className={`bb-heart${i>=life?' lost':''}`}>❤️</span>
              ))}
            </div>
            <div className="bb-progress-wrap">
              <div className="bb-progress-bar" style={{width:progressPct+'%'}} />
              <div className="bb-progress-label">{progressLabel}</div>
            </div>
            {/* active song info */}
            <div style={{
              fontFamily:'Permanent Marker,cursive', fontSize:13, color:'#fff',
              whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:160,
            }}>
              {activeSong.emoji} {activeSong.name}
            </div>
          </div>

          {/* Lane buttons */}
          <div className="bb-lanes">
            {(['D','F','J','K'] as const).map((key,i)=>{
              const cols=['#FF6B6B','#4FC3F7','#81C784','#FFD54F'];
              const tc=['#fff','#fff','#fff','#1a1a1a'];
              const fCol:Record<string,string>={perfect:'#FFE000',great:'#00C853',good:'#1E90FF'};
              if(i>=settings.lanes) return null;
              return (
                <button key={key} className="bb-lane"
                  style={{
                    background: laneFlash[i] ? fCol[laneFlash[i]] : cols[i],
                    color: tc[i],
                  }}
                  onPointerDown={()=>tapLane(i)}
                >
                  <span className="bb-lane-key">{key}</span>
                  {key}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── SIDEBAR — song list + leaderboard ── */}
      <div className={`bb-sidebar-backdrop${sidebarOpen?' open':''}`} onClick={()=>setSidebarOpen(false)} />
      <div className={`bb-sidebar${sidebarOpen?' open':''}`}>
        <div className="bb-sidebar-header">
          <div style={{fontFamily:'Bangers,cursive',fontSize:22,letterSpacing:3,color:'#00bbff'}}>🎵 SELECT MUSIC</div>
          <button onClick={()=>setSidebarOpen(false)} style={{
            fontFamily:'Bangers,cursive',fontSize:18,color:'#FF2D2D',
            background:'none',border:'2px solid #FF2D2D',padding:'2px 10px',cursor:'pointer',
          }}>✕</button>
        </div>

        <div className="bb-sidebar-tabs">
          <button className={`bb-sidebar-tab${!lbOpen?' active':''}`} onClick={()=>setLbOpen(false)}>🎵 SONGS</button>
          <button className={`bb-sidebar-tab${lbOpen?' active':''}`}  onClick={()=>setLbOpen(true)}>🏆 SCORES</button>
        </div>

        <div className="bb-sidebar-body">
          {!lbOpen ? (
            <>
              {/* Song list */}
              {/* Free songs */}
              <div style={{fontFamily:'Bangers,cursive',fontSize:12,letterSpacing:2,color:'#888',padding:'6px 0 4px',borderBottom:'2px dashed #ddd',marginBottom:8}}>
                🎵 FREE SONGS
              </div>
              {songs.filter(s=>!s.premium&&!s.isCustomSlot).map(song=>(
                <div key={song.id}
                  className={`bb-song-card${activeSongId===song.id?' active':''}`}
                  onClick={()=>{ handleSelectSong(song); setSidebarOpen(false); }}
                >
                  <span style={{fontSize:28,flexShrink:0}}>{song.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'Permanent Marker,cursive',fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{song.name}</div>
                    <div style={{fontSize:11,color:'#666',marginBottom:4}}>{song.artist}</div>
                    <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                      <span style={{fontFamily:'Bangers,cursive',fontSize:10,padding:'1px 6px',border:'2px solid #1a1a1a',background:'#FF6B00',color:'#1a1a1a',borderRadius:2}}>{song.bpm} BPM</span>
                      <span style={{fontFamily:'Bangers,cursive',fontSize:10,padding:'1px 6px',border:'2px solid #1a1a1a',background:diffColor[song.difficulty],color:'#fff',borderRadius:2}}>{song.difficulty.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}

              {/* Premium songs */}
              <div style={{fontFamily:'Bangers,cursive',fontSize:12,letterSpacing:2,color:'#888',padding:'12px 0 4px',borderBottom:'2px dashed #ddd',marginBottom:8,display:'flex',alignItems:'center',gap:8}}>
                💎 PREMIUM SONGS
                <span style={{fontSize:10,fontFamily:'Comic Neue,cursive',fontWeight:700,color:'#FFE000',background:'#1a1a1a',padding:'1px 7px',borderRadius:2}}>butuh BeatPoints</span>
              </div>
              {songs.filter(s=>s.premium).map(song=>{
                const owned = isSongOwned(song.id);
                const canAfford = beatPoints >= (song.price||0);
                return (
                  <div key={song.id}
                    className={`bb-song-card${activeSongId===song.id&&owned?' active':''}`}
                    onClick={()=>{ handleSelectSong(song); if(owned) setSidebarOpen(false); }}
                    style={{
                      background: owned
                        ? (activeSongId===song.id ? '#00bbff' : '#fff')
                        : 'linear-gradient(135deg,#1a1a1a 0%,#2a2a2a 100%)',
                      border: owned ? '3px solid #1a1a1a' : '3px solid #FFE000',
                      boxShadow: owned ? '3px 3px 0 #1a1a1a' : '3px 3px 0 #FFE000',
                      position:'relative', overflow:'hidden',
                    }}
                  >
                    {/* Lock overlay */}
                    {!owned && (
                      <div style={{
                        position:'absolute',inset:0,
                        background:'rgba(0,0,0,0.55)',
                        display:'flex',alignItems:'center',justifyContent:'flex-end',
                        paddingRight:12, pointerEvents:'none',
                      }}>
                        <div style={{
                          fontFamily:'Bangers,cursive',fontSize:22,color:'#FFE000',
                          textShadow:'2px 2px 0 #1a1a1a',
                        }}>🔒</div>
                      </div>
                    )}
                    <span style={{fontSize:28,flexShrink:0,filter:owned?'none':'grayscale(0.5)'}}>{song.emoji}</span>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontFamily:'Permanent Marker,cursive',fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',color:owned?'inherit':'#ccc'}}>{song.name}</div>
                      <div style={{fontSize:11,color:owned?'#666':'#777',marginBottom:4}}>{song.artist}</div>
                      <div style={{display:'flex',gap:4,flexWrap:'wrap',alignItems:'center'}}>
                        <span style={{fontFamily:'Bangers,cursive',fontSize:10,padding:'1px 6px',border:'2px solid #1a1a1a',background:'#FF6B00',color:'#1a1a1a',borderRadius:2}}>{song.bpm} BPM</span>
                        <span style={{fontFamily:'Bangers,cursive',fontSize:10,padding:'1px 6px',border:'2px solid #1a1a1a',background:diffColor[song.difficulty],color:'#fff',borderRadius:2}}>{song.difficulty.toUpperCase()}</span>
                        {owned
                          ? <span style={{fontFamily:'Bangers,cursive',fontSize:10,padding:'1px 6px',border:'2px solid #00C853',background:'#00C853',color:'#fff',borderRadius:2}}>✓ OWNED</span>
                          : <span style={{
                              fontFamily:'Bangers,cursive',fontSize:11,padding:'2px 8px',
                              border:'2px solid #FFE000',
                              background: canAfford ? '#FFE000' : '#555',
                              color: canAfford ? '#1a1a1a' : '#aaa',
                              borderRadius:2,
                            }}>💎 {song.price} BP</span>
                        }
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Custom upload slots */}
              <div style={{fontFamily:'Bangers,cursive',fontSize:12,letterSpacing:2,color:'#888',padding:'12px 0 4px',borderBottom:'2px dashed #ddd',marginBottom:8}}>
                📁 YOUR MUSIC
              </div>
              {songs.filter(s=>s.isCustomSlot).map(song=>(
                <div key={song.id}
                  className={`bb-song-card${activeSongId===song.id?' active':''}`}
                  onClick={()=>{ handleSelectSong(song); setSidebarOpen(false); }}
                >
                  <span style={{fontSize:28,flexShrink:0}}>{song.emoji}</span>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontFamily:'Permanent Marker,cursive',fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>{song.name}</div>
                    <div style={{fontSize:11,color:'#666',marginBottom:4}}>{song.artist}</div>
                    {song.audioBuffer&&<span style={{fontFamily:'Bangers,cursive',fontSize:10,padding:'1px 6px',border:'2px solid #1a1a1a',background:'#00C853',color:'#fff',borderRadius:2}}>LOADED</span>}
                  </div>
                </div>
              ))}

              {/* Upload */}
              <div className="bb-drop-zone"
                onClick={()=>fileInputRef.current?.click()}
                onDragOver={e=>e.preventDefault()}
                onDrop={e=>{
                  e.preventDefault();
                  const f=e.dataTransfer.files[0];
                  if(f){const fi=fileInputRef.current;if(fi){const dt=new DataTransfer();dt.items.add(f);fi.files=dt.files;handleAudioUpload({target:fi} as any);}}
                }}
              >
                <div style={{fontSize:32,marginBottom:4}}>🎵</div>
                <div style={{fontFamily:'Bangers,cursive',fontSize:16,letterSpacing:2}}>+ ADD YOUR MUSIC</div>
                <div style={{fontSize:11,color:'#666',marginTop:2}}>Click or drag & drop MP3/WAV/OGG</div>
              </div>
              <input ref={fileInputRef} type="file" accept="audio/*" style={{display:'none'}} onChange={handleAudioUpload}/>
            </>
          ) : (
            <LeaderboardPanel
              leaderboard={leaderboard}
              tab={lbTab}
              onTabChange={setLbTab}
              autoplay={settings.autoplay}
            />
          )}
        </div>
      </div>

      {/* ── SETTINGS OVERLAY ── */}
      {settingsOpen && (
        <SettingsOverlay
          settings={settings}
          onSave={handleSaveSettings}
          onClose={()=>setSettingsOpen(false)}
        />
      )}

      {/* ── RESULT MODAL ── */}
      {result && (
        <ResultModal
          result={result}
          autoplay={settings.autoplay}
          onPlayAgain={()=>{ setResult(null); handlePlay(); }}
          onClose={()=>{ setResult(null); handleStop(); }}
        />
      )}

      {/* ── NOTIFICATION ── */}
      <div style={{
        position:'fixed', top:70, right:16,
        background:'#1a1a1a', color:'#00bbff',
        fontFamily:'Bangers,cursive', fontSize:16, letterSpacing:2,
        padding:'8px 18px', border:'3px solid #00bbff',
        boxShadow:'4px 4px 0 #000', zIndex:9999,
        transform: notifOn ? 'translateX(0)' : 'translateX(130%)',
        transition:'transform 0.3s', pointerEvents:'none',
      }}>{notif}</div>

      {/* ── BOOT SCREEN ── */}
      {booting && <BootScreen onDone={() => setBooting(false)} />}

      {/* ── TOPUP MODAL ── */}
      {topupOpen && (
        <TopupModal
          currentPoints={beatPoints}
          history={bpHistory}
          onClose={() => setTopupOpen(false)}
          onSuccess={handleTopupSuccess}
        />
      )}

      {/* ── PURCHASE SONG MODAL ── */}
      {purchaseModal && (
        <div style={{
          position:'fixed',inset:0,zIndex:7500,
          background:'rgba(0,0,0,0.82)',backdropFilter:'blur(6px)',
          display:'flex',alignItems:'center',justifyContent:'center',
        }} onClick={e=>{ if(e.target===e.currentTarget) setPurchaseModal(null); }}>
          <div style={{
            background:'#FFFDF0',border:'6px solid #1a1a1a',
            boxShadow:'12px 12px 0 #1a1a1a',
            width:'min(420px,92vw)',overflow:'hidden',
          }}>
            {/* Header */}
            <div style={{background:'#1a1a1a',padding:'14px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <div style={{fontFamily:'Bangers,cursive',fontSize:24,letterSpacing:3,color:'#FFE000'}}>🔓 BUKA LAGU</div>
              <button onClick={()=>setPurchaseModal(null)} style={{
                fontFamily:'Bangers,cursive',fontSize:18,color:'#FF2D2D',
                background:'none',border:'2px solid #FF2D2D',padding:'2px 10px',cursor:'pointer',
              }}>✕</button>
            </div>
            <div style={{padding:24}}>
              {/* Song info */}
              <div style={{
                display:'flex',alignItems:'center',gap:14,
                background:'#1a1a1a',padding:'14px 16px',marginBottom:20,
                border:'3px solid #FFE000',boxShadow:'4px 4px 0 #FFE000',
              }}>
                <span style={{fontSize:40}}>{purchaseModal.emoji}</span>
                <div>
                  <div style={{fontFamily:'Permanent Marker,cursive',fontSize:17,color:'#fff'}}>{purchaseModal.name}</div>
                  <div style={{fontFamily:'Comic Neue,cursive',fontSize:12,color:'#aaa'}}>{purchaseModal.artist} • {purchaseModal.bpm} BPM</div>
                  <div style={{
                    fontFamily:'Bangers,cursive',fontSize:13,letterSpacing:1,
                    color: diffColor[purchaseModal.difficulty],
                  }}>{purchaseModal.difficulty.toUpperCase()}</div>
                </div>
              </div>

              {/* Price info */}
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                <span style={{fontFamily:'Bangers,cursive',fontSize:16,letterSpacing:2}}>HARGA</span>
                <span style={{fontFamily:'Bangers,cursive',fontSize:28,color:'#1E90FF'}}>💎 {purchaseModal.price} BP</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
                <span style={{fontFamily:'Bangers,cursive',fontSize:14,letterSpacing:1,color:'#555'}}>SALDO KAMU</span>
                <span style={{
                  fontFamily:'Bangers,cursive',fontSize:22,
                  color: beatPoints >= (purchaseModal.price||0) ? '#00C853' : '#FF2D2D',
                }}>💎 {beatPoints} BP</span>
              </div>

              {/* Insufficient notice */}
              {beatPoints < (purchaseModal.price||0) && (
                <div style={{
                  background:'#FF2D2D22',border:'2px solid #FF2D2D',
                  padding:'8px 12px',marginBottom:16,
                  fontFamily:'Comic Neue,cursive',fontSize:13,color:'#FF2D2D',fontWeight:700,
                }}>
                  ❌ BeatPoints tidak cukup! Kurang {(purchaseModal.price||0) - beatPoints} BP.
                </div>
              )}

              {/* Buttons */}
              <div style={{display:'flex',gap:10}}>
                {beatPoints >= (purchaseModal.price||0) ? (
                  <button
                    onClick={()=>handlePurchaseSong(purchaseModal)}
                    style={{
                      flex:1,fontFamily:'Bangers,cursive',fontSize:20,letterSpacing:2,
                      padding:'12px 0',border:'4px solid #1a1a1a',
                      background:'#00C853',color:'#fff',
                      boxShadow:'4px 4px 0 #1a1a1a',cursor:'pointer',
                    }}
                  >✓ BELI SEKARANG</button>
                ) : (
                  <button
                    onClick={()=>{ setPurchaseModal(null); setTopupOpen(true); }}
                    style={{
                      flex:1,fontFamily:'Bangers,cursive',fontSize:20,letterSpacing:2,
                      padding:'12px 0',border:'4px solid #1a1a1a',
                      background:'#FFE000',color:'#1a1a1a',
                      boxShadow:'4px 4px 0 #1a1a1a',cursor:'pointer',
                    }}
                  >💳 TOP UP BP</button>
                )}
                <button
                  onClick={()=>setPurchaseModal(null)}
                  style={{
                    fontFamily:'Bangers,cursive',fontSize:18,letterSpacing:1,
                    padding:'12px 18px',border:'4px solid #1a1a1a',
                    background:'#fff',color:'#1a1a1a',
                    boxShadow:'4px 4px 0 #1a1a1a',cursor:'pointer',
                  }}
                >BATAL</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}