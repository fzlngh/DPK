'use client';

import { useState } from 'react';
import type { GameSettings, Difficulty, NoteSkin } from './BeatBangGame';

interface Props {
  settings: GameSettings;
  onSave: (s: GameSettings) => void;
  onClose: () => void;
}

export default function SettingsOverlay({ settings, onSave, onClose }: Props) {
  const [local, setLocal] = useState<GameSettings>({ ...settings });

  const set = <K extends keyof GameSettings>(k: K, v: GameSettings[K]) =>
    setLocal(s => ({ ...s, [k]: v }));

  const diffColor: Record<Difficulty, string> = {
    easy: '#00C853', medium: '#FF6B00', hard: '#FF2D2D',
  };
  const skinEmoji: Record<NoteSkin, string> = {
    circle: '●', star: '★', diamond: '◆', emoji: '🎵',
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 5000,
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#FFFDF0',
        border: '6px solid #1a1a1a',
        boxShadow: '12px 12px 0 #1a1a1a',
        width: '90%', maxWidth: 560,
        maxHeight: '90vh',
        overflowY: 'auto',
        position: 'relative',
        transform: 'rotate(-0.5deg)',
      }}>
        {/* Header */}
        <div style={{
          background: '#1a1a1a', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{
            fontFamily: 'Bangers, cursive', fontSize: 32,
            letterSpacing: 4, color: '#00bbff',
          }}>⚙️ SETTINGS</div>
          <button
            onClick={onClose}
            style={{
              fontFamily: 'Bangers, cursive', fontSize: 22, color: '#FF2D2D',
              background: 'none', border: '3px solid #FF2D2D',
              padding: '2px 12px', cursor: 'pointer', letterSpacing: 1,
            }}
          >✕ CLOSE</button>
        </div>

        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 0 }}>

          {/* PLAYER NAME */}
          <Row label="👤 PLAYER NAME">
            <input
              type="text"
              value={local.playerName}
              maxLength={12}
              onChange={e => set('playerName', e.target.value)}
              style={{
                fontFamily: 'Permanent Marker, cursive', fontSize: 18,
                padding: '6px 12px', border: '4px solid #1a1a1a',
                background: '#fff', outline: 'none', width: '100%',
                boxShadow: '3px 3px 0 #1a1a1a',
              }}
              placeholder="Enter name..."
            />
          </Row>

          {/* DIFFICULTY */}
          <Row label="🎮 DIFFICULTY">
            <div style={{ display: 'flex', gap: 8 }}>
              {(['easy', 'medium', 'hard'] as Difficulty[]).map(d => (
                <button
                  key={d}
                  onClick={() => set('difficulty', d)}
                  style={{
                    fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: 1,
                    padding: '6px 16px', border: '3px solid #1a1a1a',
                    background: local.difficulty === d ? diffColor[d] : '#fff',
                    color: local.difficulty === d ? '#fff' : '#1a1a1a',
                    boxShadow: local.difficulty === d ? '3px 3px 0 #1a1a1a' : 'none',
                    cursor: 'pointer', transition: 'all 0.1s',
                  }}
                >{d.toUpperCase()}</button>
              ))}
            </div>
          </Row>

          {/* LANES */}
          <Row label="🎵 LANES">
            <div style={{ display: 'flex', gap: 8 }}>
              {([2, 4] as const).map(n => (
                <button
                  key={n}
                  onClick={() => set('lanes', n)}
                  style={{
                    fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: 2,
                    padding: '6px 22px', border: '3px solid #1a1a1a',
                    background: local.lanes === n ? '#1E90FF' : '#fff',
                    color: local.lanes === n ? '#fff' : '#1a1a1a',
                    boxShadow: local.lanes === n ? '3px 3px 0 #1a1a1a' : 'none',
                    cursor: 'pointer',
                  }}
                >{n}</button>
              ))}
            </div>
          </Row>

          {/* NOTE SKIN */}
          <Row label="🎨 NOTE SKIN">
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(['circle', 'star', 'diamond', 'emoji'] as NoteSkin[]).map(skin => (
                <button
                  key={skin}
                  onClick={() => set('noteSkin', skin)}
                  style={{
                    fontFamily: 'Bangers, cursive', fontSize: 15, letterSpacing: 1,
                    padding: '6px 14px', border: '3px solid #1a1a1a',
                    background: local.noteSkin === skin ? '#9B59B6' : '#fff',
                    color: local.noteSkin === skin ? '#fff' : '#1a1a1a',
                    boxShadow: local.noteSkin === skin ? '3px 3px 0 #1a1a1a' : 'none',
                    cursor: 'pointer',
                  }}
                >{skinEmoji[skin]} {skin.toUpperCase()}</button>
              ))}
            </div>
          </Row>

          {/* VOLUME */}
          <Row label="🔊 VOLUME">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <input
                type="range" min={0} max={100} value={local.volume}
                onChange={e => set('volume', Number(e.target.value))}
                style={{ flex: 1, accentColor: '#1a1a1a', height: 8 }}
              />
              <span style={{ fontFamily: 'Bangers, cursive', fontSize: 18, minWidth: 44 }}>
                {local.volume}%
              </span>
            </div>
          </Row>

          {/* SPEED */}
          <Row label="⚡ SPEED">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1 }}>
              <input
                type="range" min={50} max={150} value={local.speed}
                onChange={e => set('speed', Number(e.target.value))}
                style={{ flex: 1, accentColor: '#1a1a1a', height: 8 }}
              />
              <span style={{ fontFamily: 'Bangers, cursive', fontSize: 18, minWidth: 44 }}>
                {(local.speed / 100).toFixed(1)}x
              </span>
            </div>
          </Row>

          {/* AUTO-PLAY */}
          <Row label="🤖 AUTO-PLAY">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                onClick={() => set('autoplay', !local.autoplay)}
                style={{
                  fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: 1,
                  padding: '6px 20px', border: '3px solid #1a1a1a',
                  background: local.autoplay ? '#FF6B00' : '#fff',
                  color: local.autoplay ? '#fff' : '#1a1a1a',
                  boxShadow: local.autoplay ? '3px 3px 0 #1a1a1a' : 'none',
                  cursor: 'pointer',
                }}
              >{local.autoplay ? '✓ ON (DEMO MODE)' : 'OFF'}</button>
              {local.autoplay && (
                <span style={{
                  fontFamily: 'Comic Neue, cursive', fontSize: 12, color: '#FF6B00',
                  fontWeight: 700, maxWidth: 180,
                }}>
                  ⚠️ Score tidak tersimpan di leaderboard saat auto-play aktif!
                </span>
              )}
            </div>
          </Row>

          {/* Keyboard reference */}
          <div style={{
            marginTop: 8, padding: '12px 16px',
            background: '#1a1a1a', border: '3px solid #1a1a1a',
          }}>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: 2, color: '#00bbff', marginBottom: 8 }}>
              ⌨️ KEYBOARD CONTROLS
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 16px' }}>
              {[
                ['D / F / J / K', 'Tap lanes'],
                ['SPACE / ENTER', 'Play / Pause'],
                ['ESC', 'Stop game'],
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{
                    fontFamily: 'Bangers, cursive', fontSize: 14, color: '#FFE000',
                    background: '#333', padding: '1px 8px', border: '2px solid #555',
                  }}>{k}</span>
                  <span style={{ fontFamily: 'Comic Neue, cursive', fontSize: 12, color: '#fff' }}>{v}</span>
                </div>
              ))}
            </div>
          </div>

          {/* SAVE BUTTON */}
          <button
            onClick={() => onSave(local)}
            style={{
              marginTop: 20, fontFamily: 'Bangers, cursive', fontSize: 24, letterSpacing: 3,
              padding: '12px 0', border: '4px solid #1a1a1a',
              background: '#00C853', color: '#fff',
              boxShadow: '5px 5px 0 #1a1a1a', cursor: 'pointer',
              width: '100%', transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = 'translate(-2px,-2px)';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '7px 7px 0 #1a1a1a';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = '';
              (e.currentTarget as HTMLButtonElement).style.boxShadow = '5px 5px 0 #1a1a1a';
            }}
          >
            ✓ SAVE SETTINGS
          </button>
        </div>
      </div>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 16,
      padding: '12px 0', borderBottom: '2px dashed #1a1a1a',
      flexWrap: 'wrap',
    }}>
      <span style={{
        fontFamily: 'Bangers, cursive', fontSize: 17, letterSpacing: 2,
        minWidth: 160, color: '#1a1a1a',
      }}>{label}</span>
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
