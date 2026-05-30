'use client';

import type { LeaderboardEntry, Difficulty } from './BeatBangGame';

interface Props {
  leaderboard: LeaderboardEntry[];
  tab: Difficulty | 'all';
  onTabChange: (t: Difficulty | 'all') => void;
  autoplay: boolean;
}

const RANK_EMOJI = ['🥇', '🥈', '🥉'];
const GRADE_COLORS: Record<string, string> = {
  S: '#FFE000', A: '#00C853', B: '#1E90FF', C: '#FF6B00', D: '#FF2D2D',
};
const DIFF_COLOR: Record<string, string> = {
  easy: '#00C853', medium: '#FF6B00', hard: '#FF2D2D', all: '#1a1a1a',
};

export default function LeaderboardPanel({ leaderboard, tab, onTabChange, autoplay }: Props) {
  const tabs: (Difficulty | 'all')[] = ['all', 'easy', 'medium', 'hard'];

  const filtered = tab === 'all'
    ? leaderboard
    : leaderboard.filter(e => e.difficulty === tab);

  const top = filtered.slice(0, 8);

  return (
    <div className="bb-panel" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="bb-panel-label">SCORES</div>
      <div style={{
        fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: 3,
        marginTop: 20, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8,
      }}>
        🏆 LEADERBOARD
        <div style={{ flex: 1, height: 4, background: '#1a1a1a', borderRadius: 2 }} />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>
        {tabs.map(t => (
          <button
            key={t}
            onClick={() => onTabChange(t)}
            style={{
              fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 1,
              padding: '4px 10px', border: '3px solid #1a1a1a',
              background: tab === t ? DIFF_COLOR[t] : '#fff',
              color: tab === t ? (t === 'all' ? '#fff' : '#fff') : '#1a1a1a',
              cursor: 'pointer', flex: 1,
              boxShadow: tab === t ? '3px 3px 0 #1a1a1a' : 'none',
              transition: 'all 0.1s',
            }}
          >
            {t === 'all' ? 'ALL' : t.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Auto-play notice */}
      {autoplay && (
        <div style={{
          background: '#FF6B00', color: '#fff',
          fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 1,
          padding: '6px 12px', marginBottom: 8, border: '2px solid #1a1a1a',
          textAlign: 'center',
        }}>
          🤖 AUTO-PLAY: TIDAK DISIMPAN
        </div>
      )}

      {/* Entries */}
      <div style={{ flex: 1, overflowY: 'auto', maxHeight: 340 }}>
        {top.length === 0 ? (
          <div style={{
            fontFamily: 'Comic Neue, cursive', color: '#888',
            padding: 16, textAlign: 'center', fontSize: 14,
          }}>
            No scores yet!<br />Start playing! 🎮
          </div>
        ) : (
          top.map((entry, i) => (
            <div
              key={i}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '7px 10px', borderBottom: '2px solid #1a1a1a',
                background: i === 0 ? 'rgba(255,215,0,0.08)' : 'transparent',
                transition: 'background 0.1s',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#00bbff22')}
              onMouseLeave={e => (e.currentTarget.style.background = i === 0 ? 'rgba(255,215,0,0.08)' : 'transparent')}
            >
              {/* Rank */}
              <span style={{
                fontFamily: 'Bangers, cursive', fontSize: 20, minWidth: 28,
                color: i < 3 ? ['#FFD700', '#C0C0C0', '#CD7F32'][i] : '#1a1a1a',
                WebkitTextStroke: i < 3 ? '1px #1a1a1a' : 'none',
              }}>
                {i < 3 ? RANK_EMOJI[i] : `#${i + 1}`}
              </span>

              {/* Name + song */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: 'Permanent Marker, cursive', fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {entry.name}
                </div>
                <div style={{ fontSize: 11, color: '#777', display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span>{entry.song}</span>
                  <span style={{
                    fontFamily: 'Bangers, cursive', fontSize: 10, padding: '0 5px',
                    background: DIFF_COLOR[entry.difficulty] || '#888',
                    color: '#fff', borderRadius: 2,
                  }}>{entry.difficulty?.toUpperCase()}</span>
                </div>
              </div>

              {/* Score */}
              <span style={{ fontFamily: 'Bangers, cursive', fontSize: 18, color: '#FF2D2D' }}>
                {entry.score.toLocaleString()}
              </span>

              {/* Grade */}
              <span style={{
                fontFamily: 'Bangers, cursive', fontSize: 18,
                width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '3px solid #1a1a1a',
                background: GRADE_COLORS[entry.grade] || '#888',
                color: entry.grade === 'S' ? '#1a1a1a' : '#fff',
                flexShrink: 0,
              }}>
                {entry.grade}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Footer: acc summary for tab */}
      {top.length > 0 && (
        <div style={{
          marginTop: 10, padding: '8px 12px',
          background: '#1a1a1a', display: 'flex', justifyContent: 'space-between',
          fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 1,
        }}>
          <span style={{ color: '#00bbff' }}>TOP SCORE</span>
          <span style={{ color: '#FFE000' }}>{top[0]?.score.toLocaleString()}</span>
          <span style={{ color: '#00C853' }}>ACC {top[0]?.acc}%</span>
        </div>
      )}
    </div>
  );
}
