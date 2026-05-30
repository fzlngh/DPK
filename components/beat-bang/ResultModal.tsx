'use client';

interface ResultData {
  score: number;
  acc: number;
  maxCombo: number;
  perfectHits: number;
  grade: string;
  song: string;
}

interface Props {
  result: ResultData;
  autoplay: boolean;
  onPlayAgain: () => void;
  onClose: () => void;
}

const GRADE_COLORS: Record<string, string> = {
  S: '#FFE000', A: '#00C853', B: '#1E90FF', C: '#FF6B00', D: '#FF2D2D',
};
const GRADE_TITLES: Record<string, string> = {
  S: 'SUPERB!!! 🔥', A: 'AWESOME! ⭐', B: 'GREAT JOB! 👊', C: 'KEEP GOING! 💪', D: 'PRACTICE MORE! 🥁',
};

export default function ResultModal({ result, autoplay, onPlayAgain, onClose }: Props) {
  const { score, acc, maxCombo, perfectHits, grade, song } = result;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 6000,
    }}>
      <div style={{
        background: '#FFFDF0',
        border: '6px solid #1a1a1a',
        boxShadow: '12px 12px 0 #1a1a1a',
        padding: 32, maxWidth: 500, width: '90%',
        textAlign: 'center',
        transform: 'rotate(-1deg)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* BG glow */}
        <div style={{
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 80% 20%, ${GRADE_COLORS[grade]}44 0%, transparent 60%)`,
          pointerEvents: 'none',
        }} />

        {/* Song name */}
        <div style={{
          fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 2,
          color: '#fff', background: '#1a1a1a', display: 'inline-block',
          padding: '2px 14px', marginBottom: 8,
        }}>♪ {song}</div>

        {/* Grade */}
        <div style={{
          fontFamily: 'Bangers, cursive', fontSize: 120, lineHeight: 1,
          color: GRADE_COLORS[grade],
          WebkitTextStroke: '4px #1a1a1a',
          textShadow: '8px 8px 0 #1a1a1a',
          display: 'block',
          animation: 'gradeAppear 0.5s cubic-bezier(0.34,1.56,0.64,1)',
        }}>{grade}</div>

        {/* Title */}
        <div style={{
          fontFamily: 'Bangers, cursive', fontSize: 36, letterSpacing: 4,
          color: '#1a1a1a', marginBottom: 16,
        }}>{GRADE_TITLES[grade]}</div>

        {/* Auto-play notice */}
        {autoplay && (
          <div style={{
            background: '#FF6B00', color: '#fff',
            fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: 1,
            padding: '6px 16px', marginBottom: 12, border: '3px solid #1a1a1a',
            boxShadow: '3px 3px 0 #1a1a1a',
          }}>
            🤖 AUTO-PLAY MODE — SCORE TIDAK DISIMPAN
          </div>
        )}

        {/* Stats grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, margin: '16px 0' }}>
          {[
            { label: 'SCORE', value: score.toLocaleString() },
            { label: 'MAX COMBO', value: maxCombo + 'x' },
            { label: 'ACCURACY', value: acc + '%' },
            { label: 'PERFECT HITS', value: perfectHits.toLocaleString() },
          ].map(stat => (
            <div key={stat.label} style={{
              background: '#1a1a1a', color: '#fff',
              padding: 12, border: '3px solid #1a1a1a',
              boxShadow: '3px 3px 0 #555',
            }}>
              <div style={{
                fontFamily: 'Bangers, cursive', fontSize: 11, letterSpacing: 2,
                color: '#00bbff', marginBottom: 4,
              }}>{stat.label}</div>
              <div style={{
                fontFamily: 'Bangers, cursive', fontSize: 30, color: '#fff',
              }}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Rank message */}
        <div style={{
          fontFamily: 'Comic Neue, cursive', fontSize: 13, color: '#555',
          marginBottom: 16, fontWeight: 700,
        }}>
          {acc >= 95 ? '🌟 PERFECT SCORE! LEGEND!' :
            acc >= 85 ? '⭐ Amazing! You\'re on fire!' :
              acc >= 70 ? '👊 Solid performance!' :
                acc >= 50 ? '💪 Keep practicing!' :
                  '🥁 You can do better!'}
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={onPlayAgain}
            style={{
              fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: 2,
              padding: '10px 24px', border: '4px solid #1a1a1a',
              background: '#1E90FF', color: '#fff',
              boxShadow: '4px 4px 0 #1a1a1a', cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #1a1a1a'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 #1a1a1a'; }}
          >↺ PLAY AGAIN</button>
          <button
            onClick={onClose}
            style={{
              fontFamily: 'Bangers, cursive', fontSize: 20, letterSpacing: 2,
              padding: '10px 24px', border: '4px solid #1a1a1a',
              background: '#00C853', color: '#fff',
              boxShadow: '4px 4px 0 #1a1a1a', cursor: 'pointer',
              transition: 'transform 0.1s, box-shadow 0.1s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translate(-2px,-2px)'; e.currentTarget.style.boxShadow = '6px 6px 0 #1a1a1a'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '4px 4px 0 #1a1a1a'; }}
          >✓ BACK</button>
        </div>
      </div>

      {/* Confetti */}
      <style>{`
        @keyframes confettiFall {
          0% { transform: translateY(-20px) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
        }
      `}</style>
      {grade === 'S' || grade === 'A' ? (
        <div style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 5999 }}>
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: Math.random() * 100 + 'vw',
              top: -20,
              fontSize: 20,
              animation: `confettiFall ${1.5 + Math.random() * 2}s ${Math.random() * 1}s linear forwards`,
            }}>
              {['🎉', '⭐', '🎊', '✨', '🌟', '💫'][Math.floor(Math.random() * 6)]}
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
