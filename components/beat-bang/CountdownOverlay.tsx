'use client';

interface Props {
  count: number | null;
}

export default function CountdownOverlay({ count }: Props) {
  if (count === null) return null;

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(0,0,0,0.65)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 200,
    }}>
      <div
        key={count}
        style={{
          fontFamily: 'Bangers, cursive',
          fontSize: 140,
          color: count === 1 ? '#FF2D2D' : count === 2 ? '#FF6B00' : '#FFE000',
          WebkitTextStroke: '5px #1a1a1a',
          textShadow: '10px 10px 0 #1a1a1a',
          animation: 'countPop 0.85s cubic-bezier(0.34,1.56,0.64,1) forwards',
          lineHeight: 1,
          userSelect: 'none',
        }}
      >
        {count}
      </div>
    </div>
  );
}
