'use client';

import { useState, useEffect, useRef } from 'react';
import type { TopupPackage, TopupHistory } from './useBeatPoints';
import { TOPUP_PACKAGES } from './useBeatPoints';

// ─────────────────────────────────────────────
// MIDTRANS CONFIG (Sandbox)
// ─────────────────────────────────────────────
const MIDTRANS_CLIENT_KEY = 'Mid-client-99bbm-ul_TD7ThtG'; // ← ganti
const MIDTRANS_SNAP_URL   = 'https://app.sandbox.midtrans.com/snap/snap.js';
const CREATE_TXN_URL      = '/api/midtrans';

// ─────────────────────────────────────────────
// PROMO CODES — definisi di sini (sinkron dgn server)
// ─────────────────────────────────────────────
export interface PromoCode {
  code: string;
  label: string;
  type: 'percent' | 'fixed';   // diskon persen atau nominal
  value: number;               // % atau Rp
  bonusBP?: number;            // bonus BeatPoints extra
  minPrice?: number;           // minimum harga paket
  maxDiscount?: number;        // cap diskon (untuk persen)
  validUntil?: string;         // YYYY-MM-DD
}

export const PROMO_CODES: PromoCode[] = [
  {
    code: 'BEATBANG10',
    label: 'Diskon 10% semua paket',
    type: 'percent', value: 10, maxDiscount: 5000,
    validUntil: '2026-12-31',
  },
  {
    code: 'NEWPLAYER',
    label: 'Diskon Rp5.000 untuk pemain baru',
    type: 'fixed', value: 5000, minPrice: 10000,
    validUntil: '2026-12-31',
  },
  {
    code: 'BONOSBP50',
    label: '+50 Bonus BeatPoints',
    type: 'fixed', value: 0, bonusBP: 50,
    validUntil: '2026-12-31',
  },
  {
    code: 'LEGEND25',
    label: 'Diskon 25% paket Rhythm Master ke atas',
    type: 'percent', value: 25, maxDiscount: 10000, minPrice: 20000,
    validUntil: '2026-12-31',
  },
];

function validatePromo(code: string, pkgPrice: number): { valid: boolean; promo?: PromoCode; error?: string } {
  const found = PROMO_CODES.find(p => p.code === code.toUpperCase().trim());
  if (!found) return { valid: false, error: 'Kode promo tidak ditemukan.' };
  if (found.validUntil && new Date() > new Date(found.validUntil + 'T23:59:59'))
    return { valid: false, error: 'Kode promo sudah kadaluarsa.' };
  if (found.minPrice && pkgPrice < found.minPrice)
    return { valid: false, error: `Minimal harga paket Rp ${found.minPrice.toLocaleString('id-ID')}.` };
  return { valid: true, promo: found };
}

function calcDiscount(promo: PromoCode, basePrice: number): number {
  if (promo.type === 'fixed') return Math.min(promo.value, basePrice);
  const disc = Math.floor(basePrice * promo.value / 100);
  return promo.maxDiscount ? Math.min(disc, promo.maxDiscount) : disc;
}

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Props {
  currentPoints: number;
  history: TopupHistory[];
  onClose: () => void;
  onSuccess: (pkg: TopupPackage, orderId: string, bonusBP?: number) => void;
}

declare global {
  interface Window {
    snap?: {
      pay: (token: string, options: {
        onSuccess: (result: any) => void;
        onPending: (result: any) => void;
        onError:   (result: any) => void;
        onClose:   () => void;
      }) => void;
    };
  }
}

// ─────────────────────────────────────────────
// COMPONENT
// ─────────────────────────────────────────────
export default function TopupModal({ currentPoints, history, onClose, onSuccess }: Props) {
  const [selected,     setSelected]     = useState<TopupPackage | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [tab,          setTab]          = useState<'topup' | 'history'>('topup');
  const [statusMsg,    setStatusMsg]    = useState('');
  const [statusType,   setStatusType]   = useState<'success'|'error'|'info'|''>('');
  const [snapLoaded,   setSnapLoaded]   = useState(false);

  // Promo state
  const [promoInput,   setPromoInput]   = useState('');
  const [promoResult,  setPromoResult]  = useState<PromoCode | null>(null);
  const [promoError,   setPromoError]   = useState('');
  const [promoChecking,setPromoChecking]= useState(false);
  const promoRef = useRef<HTMLInputElement>(null);

  // Load Midtrans Snap.js
  useEffect(() => {
    if (document.getElementById('midtrans-snap')) { setSnapLoaded(true); return; }
    const s = document.createElement('script');
    s.id = 'midtrans-snap';
    s.src = MIDTRANS_SNAP_URL;
    s.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    s.onload  = () => setSnapLoaded(true);
    s.onerror = () => showStatus('⚠️ Gagal memuat payment gateway.', 'error');
    document.head.appendChild(s);
  }, []);

  // Reset promo when package changes
  useEffect(() => {
    setPromoResult(null);
    setPromoError('');
    setPromoInput('');
  }, [selected]);

  // ── helpers ──
  function showStatus(msg: string, type: 'success'|'error'|'info') {
    setStatusMsg(msg); setStatusType(type);
    if (type === 'success') setTimeout(() => setStatusMsg(''), 4000);
  }

  function handleCheckPromo() {
    if (!promoInput.trim()) return;
    if (!selected) { setPromoError('Pilih paket dulu sebelum memasukkan promo.'); return; }
    setPromoChecking(true); setPromoError(''); setPromoResult(null);

    setTimeout(() => {  // slight delay untuk feel "validating"
      const { valid, promo, error } = validatePromo(promoInput, selected.price);
      setPromoChecking(false);
      if (valid && promo) {
        setPromoResult(promo);
        setPromoError('');
      } else {
        setPromoError(error || 'Kode tidak valid.');
      }
    }, 600);
  }

  function handleRemovePromo() {
    setPromoResult(null); setPromoError(''); setPromoInput('');
  }

  // ── derived prices ──
  const discount    = promoResult && selected ? calcDiscount(promoResult, selected.price) : 0;
  const finalPrice  = selected ? Math.max(0, selected.price - discount) : 0;
  const bonusBP     = promoResult?.bonusBP ?? 0;
  const totalBP     = selected ? selected.points + selected.bonus + bonusBP : 0;

  // ── payment ──
  async function handleTopup() {
    if (!selected) return;
    if (!snapLoaded || !window.snap) {
      showStatus('⚠️ Payment gateway belum siap. Coba lagi.', 'error'); return;
    }
    setLoading(true);
    showStatus('⏳ Memproses pembayaran...', 'info');

    try {
      const orderId = `BB-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

      const res = await fetch(CREATE_TXN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount:      finalPrice,
          originalAmount: selected.price,
          discount,
          packageId:   selected.id,
          packageName: `${selected.name} (${totalBP} BeatPoints)`,
          promoCode:   promoResult?.code ?? null,
          promoLabel:  promoResult?.label ?? null,
          bonusBP,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { token } = await res.json();

      window.snap.pay(token, {
        onSuccess: (result) => {
          setLoading(false);
          showStatus(`✅ Pembayaran berhasil! +${totalBP} BeatPoints`, 'success');
          onSuccess(selected, result.order_id || orderId, bonusBP);
          setSelected(null); setPromoResult(null); setPromoInput('');
        },
        onPending: () => {
          setLoading(false);
          showStatus('⏳ Pembayaran pending. BeatPoints ditambah setelah konfirmasi.', 'info');
        },
        onError: () => {
          setLoading(false);
          showStatus('❌ Pembayaran gagal. Silakan coba lagi.', 'error');
        },
        onClose: () => { setLoading(false); showStatus('', ''); },
      });

    } catch (err: any) {
      setLoading(false);
      // Demo mode
      if (err.message?.includes('Failed to fetch') || err.message?.includes('404')) {
        showStatus('🧪 DEMO MODE: Simulasi topup berhasil!', 'success');
        setTimeout(() => {
          onSuccess(selected!, `DEMO-${Date.now()}`, bonusBP);
          setSelected(null); setPromoResult(null); setPromoInput('');
        }, 1000);
      } else {
        showStatus(`❌ Error: ${err.message}`, 'error');
      }
    }
  }

  const statusColors: Record<string, string> = {
    success: '#00C853', error: '#FF2D2D', info: '#00bbff', '': 'transparent',
  };

  // ─────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 7000,
        background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#FFFDF0', border: '6px solid #1a1a1a',
        boxShadow: '12px 12px 0 #1a1a1a',
        width: 'min(540px, 96vw)', maxHeight: '92vh',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
      }}>

        {/* ── Header ── */}
        <div style={{
          background: '#1a1a1a', padding: '14px 20px', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 28, letterSpacing: 4, color: '#FFE000' }}>
              💎 BEATPOINTS
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#00bbff', letterSpacing: 1 }}>
              Saldo: <strong style={{ color: '#FFE000', fontSize: 16 }}>{currentPoints.toLocaleString()}</strong> BP
            </div>
          </div>
          <button onClick={onClose} style={{
            fontFamily: 'Bangers, cursive', fontSize: 20, color: '#FF2D2D',
            background: 'none', border: '3px solid #FF2D2D',
            padding: '2px 12px', cursor: 'pointer', letterSpacing: 1,
          }}>✕</button>
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '4px solid #1a1a1a', flexShrink: 0 }}>
          {(['topup', 'history'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              flex: 1, padding: '10px', cursor: 'pointer',
              fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: 2,
              border: 'none', borderRight: t === 'topup' ? '3px solid #1a1a1a' : 'none',
              background: tab === t ? '#00bbff' : '#fff',
              color: tab === t ? '#1a1a1a' : '#555',
              transition: 'background 0.15s',
            }}>
              {t === 'topup' ? '💳 TOP UP' : '📋 RIWAYAT'}
            </button>
          ))}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* Status */}
          {statusMsg && (
            <div style={{
              background: statusColors[statusType] + '22',
              border: `3px solid ${statusColors[statusType]}`,
              padding: '10px 16px', marginBottom: 16,
              fontFamily: 'Comic Neue, cursive', fontSize: 14, fontWeight: 700,
              color: statusColors[statusType],
            }}>{statusMsg}</div>
          )}

          {/* ════════════ TOPUP TAB ════════════ */}
          {tab === 'topup' && (
            <>
              {/* Package grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
                {TOPUP_PACKAGES.map(pkg => (
                  <div key={pkg.id} onClick={() => setSelected(pkg)} style={{
                    background: selected?.id === pkg.id ? '#1a1a1a' : '#fff',
                    border:     `4px solid ${selected?.id === pkg.id ? '#FFE000' : '#1a1a1a'}`,
                    boxShadow:  selected?.id === pkg.id ? '4px 4px 0 #FFE000' : '4px 4px 0 #1a1a1a',
                    padding: '14px 12px', cursor: 'pointer', position: 'relative',
                    transition: 'all 0.1s',
                    transform: selected?.id === pkg.id ? 'translate(-2px,-2px)' : 'none',
                  }}>
                    {pkg.popular && (
                      <div style={{
                        position: 'absolute', top: -2, right: -2,
                        background: '#FF2D2D', color: '#fff',
                        fontFamily: 'Bangers, cursive', fontSize: 11, letterSpacing: 1,
                        padding: '1px 8px', border: '2px solid #1a1a1a',
                      }}>🔥 POPULER</div>
                    )}
                    <div style={{ fontSize: 28, marginBottom: 4 }}>{pkg.emoji}</div>
                    <div style={{
                      fontFamily: 'Bangers, cursive', fontSize: 15, letterSpacing: 1, marginBottom: 4,
                      color: selected?.id === pkg.id ? '#FFE000' : '#1a1a1a',
                    }}>{pkg.name}</div>
                    <div style={{ fontFamily: 'Bangers, cursive', fontSize: 26, lineHeight: 1, color: selected?.id === pkg.id ? '#fff' : '#1E90FF' }}>
                      {pkg.points.toLocaleString()} <span style={{ fontSize: 14, color: '#00bbff' }}>BP</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div style={{ fontFamily: 'Bangers, cursive', fontSize: 12, color: '#00C853', letterSpacing: 1 }}>
                        + BONUS {pkg.bonus} BP
                      </div>
                    )}
                    <div style={{
                      marginTop: 8, padding: '3px 0', textAlign: 'center',
                      border: '2px solid #1a1a1a', fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: 1,
                      background: selected?.id === pkg.id ? '#FFE000' : '#1a1a1a',
                      color:      selected?.id === pkg.id ? '#1a1a1a' : '#fff',
                    }}>
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              {/* ── PROMO CODE FIELD ── */}
              <div style={{
                border: '3px solid #1a1a1a',
                background: promoResult ? '#00C85314' : '#fff',
                marginBottom: 16, overflow: 'hidden',
                boxShadow: promoResult ? '3px 3px 0 #00C853' : '3px 3px 0 #1a1a1a',
                transition: 'all 0.2s',
              }}>
                {/* Label bar */}
                <div style={{
                  background: '#1a1a1a', padding: '6px 14px',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: 2, color: '#FFE000' }}>
                    🏷️ KODE PROMO
                  </span>
                  {promoResult && (
                    <span style={{
                      fontFamily: 'Comic Neue, cursive', fontSize: 11, fontWeight: 700,
                      color: '#00C853', background: '#00C85322', padding: '1px 8px',
                      border: '1px solid #00C853', borderRadius: 2,
                    }}>✓ AKTIF</span>
                  )}
                </div>

                <div style={{ padding: '12px 14px' }}>
                  {!promoResult ? (
                    /* Input row */
                    <div style={{ display: 'flex', gap: 8 }}>
                      <input
                        ref={promoRef}
                        type="text"
                        value={promoInput}
                        onChange={e => { setPromoInput(e.target.value.toUpperCase()); setPromoError(''); }}
                        onKeyDown={e => e.key === 'Enter' && handleCheckPromo()}
                        placeholder="Masukkan kode promo..."
                        maxLength={20}
                        style={{
                          flex: 1, fontFamily: 'Bangers, cursive', fontSize: 18,
                          letterSpacing: 3, padding: '8px 12px',
                          border: `3px solid ${promoError ? '#FF2D2D' : '#1a1a1a'}`,
                          background: promoError ? '#FF2D2D11' : '#fff',
                          outline: 'none', textTransform: 'uppercase',
                          boxShadow: promoError ? 'inset 0 0 0 1px #FF2D2D' : 'none',
                        }}
                      />
                      <button
                        onClick={handleCheckPromo}
                        disabled={!promoInput.trim() || promoChecking}
                        style={{
                          fontFamily: 'Bangers, cursive', fontSize: 15, letterSpacing: 1,
                          padding: '8px 16px', border: '3px solid #1a1a1a',
                          background: promoChecking ? '#999' : '#1E90FF',
                          color: '#fff', cursor: promoChecking ? 'wait' : 'pointer',
                          boxShadow: '3px 3px 0 #1a1a1a', whiteSpace: 'nowrap',
                          transition: 'all 0.1s',
                        }}
                      >
                        {promoChecking ? '⏳' : '✓ PAKAI'}
                      </button>
                    </div>
                  ) : (
                    /* Applied promo display */
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        flex: 1, background: '#1a1a1a', padding: '8px 12px',
                        border: '2px solid #00C853',
                      }}>
                        <div style={{
                          fontFamily: 'Bangers, cursive', fontSize: 18, letterSpacing: 3,
                          color: '#00C853',
                        }}>{promoResult.code}</div>
                        <div style={{ fontFamily: 'Comic Neue, cursive', fontSize: 12, color: '#aaa' }}>
                          {promoResult.label}
                        </div>
                      </div>
                      <button
                        onClick={handleRemovePromo}
                        style={{
                          fontFamily: 'Bangers, cursive', fontSize: 13,
                          padding: '6px 12px', border: '2px solid #FF2D2D',
                          background: 'none', color: '#FF2D2D', cursor: 'pointer',
                          letterSpacing: 1,
                        }}
                      >✕ HAPUS</button>
                    </div>
                  )}

                  {/* Error */}
                  {promoError && (
                    <div style={{
                      marginTop: 8, fontFamily: 'Comic Neue, cursive', fontSize: 12,
                      color: '#FF2D2D', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      ❌ {promoError}
                    </div>
                  )}

                  {/* Hint: show available promos */}
                  {!promoResult && !promoError && (
                    <details style={{ marginTop: 8 }}>
                      <summary style={{
                        fontFamily: 'monospace', fontSize: 11, color: '#999',
                        cursor: 'pointer', letterSpacing: 1,
                      }}>💡 Lihat kode promo tersedia</summary>
                      <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        {PROMO_CODES.map(p => (
                          <div key={p.code}
                            onClick={() => { setPromoInput(p.code); setPromoError(''); setTimeout(()=>promoRef.current?.focus(),0); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                              padding: '5px 8px', background: '#f5f5f5', border: '1px solid #ddd',
                              transition: 'background 0.1s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.background='#e8f4ff')}
                            onMouseLeave={e => (e.currentTarget.style.background='#f5f5f5')}
                          >
                            <span style={{
                              fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 2,
                              color: '#1E90FF', minWidth: 110,
                            }}>{p.code}</span>
                            <span style={{ fontFamily: 'Comic Neue, cursive', fontSize: 11, color: '#555', flex: 1 }}>
                              {p.label}
                            </span>
                            <span style={{
                              fontFamily: 'monospace', fontSize: 10, color: '#999',
                              borderLeft: '1px solid #ddd', paddingLeft: 8,
                            }}>s/d {p.validUntil}</span>
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </div>
              </div>

              {/* ── Selected summary ── */}
              {selected && (
                <div style={{
                  background: '#1a1a1a', padding: '14px 16px', marginBottom: 16,
                  border: `3px solid ${promoResult ? '#00C853' : '#FFE000'}`,
                  boxShadow: `4px 4px 0 ${promoResult ? '#00C853' : '#FFE000'}`,
                }}>
                  <div style={{
                    fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 2,
                    color: '#00bbff', marginBottom: 10,
                  }}>📋 RINGKASAN PEMBELIAN</div>

                  {/* Base */}
                  <Row label={selected.name} value={`${selected.points} BP${selected.bonus ? ` + ${selected.bonus}` : ''}`} color="#fff" />
                  <Row label="Harga normal" value={`Rp ${selected.price.toLocaleString('id-ID')}`} color="#fff" />

                  {/* Promo rows */}
                  {promoResult && (
                    <>
                      {discount > 0 && (
                        <Row
                          label={`Diskon (${promoResult.code})`}
                          value={`- Rp ${discount.toLocaleString('id-ID')}`}
                          color="#00C853"
                        />
                      )}
                      {bonusBP > 0 && (
                        <Row label="Bonus BP promo" value={`+ ${bonusBP} BP`} color="#00C853" />
                      )}
                    </>
                  )}

                  <div style={{ borderTop: '1px solid #333', marginTop: 8, paddingTop: 8 }}>
                    {/* Final price — with strikethrough if discounted */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'Bangers, cursive', fontSize: 18, letterSpacing: 2, color: '#FFE000' }}>
                        TOTAL BAYAR
                      </span>
                      <div style={{ textAlign: 'right' }}>
                        {discount > 0 && (
                          <div style={{
                            fontFamily: 'monospace', fontSize: 12,
                            color: '#666', textDecoration: 'line-through',
                          }}>Rp {selected.price.toLocaleString('id-ID')}</div>
                        )}
                        <div style={{ fontFamily: 'Bangers, cursive', fontSize: 26, color: '#FFE000' }}>
                          Rp {finalPrice.toLocaleString('id-ID')}
                        </div>
                      </div>
                    </div>
                    {/* Total BP */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontFamily: 'monospace', fontSize: 11, color: '#777' }}>Dapat BeatPoints</span>
                      <span style={{ fontFamily: 'Bangers, cursive', fontSize: 20, color: '#00bbff' }}>
                        💎 {totalBP} BP
                      </span>
                    </div>
                    <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', marginTop: 4 }}>
                      Setelah topup: {(currentPoints + totalBP).toLocaleString()} BP
                    </div>
                  </div>
                </div>
              )}

              {/* ── Pay button ── */}
              <button
                onClick={handleTopup}
                disabled={!selected || loading}
                style={{
                  width: '100%', padding: '14px 0',
                  fontFamily: 'Bangers, cursive', fontSize: 22, letterSpacing: 3,
                  border: '4px solid #1a1a1a',
                  background: !selected || loading ? '#999' : '#00C853',
                  color: '#fff', cursor: !selected || loading ? 'not-allowed' : 'pointer',
                  boxShadow: !selected || loading ? 'none' : '5px 5px 0 #1a1a1a',
                  opacity: !selected || loading ? 0.6 : 1,
                  transition: 'all 0.1s',
                }}
              >
                {loading ? '⏳ MEMPROSES...'
                  : !selected ? 'PILIH PAKET DULU'
                  : finalPrice === 0 ? '💎 KLAIM GRATIS!'
                  : `💳 BAYAR Rp ${finalPrice.toLocaleString('id-ID')}`}
              </button>

              {/* Midtrans badge */}
              <div style={{ marginTop: 12, textAlign: 'center', fontFamily: 'monospace', fontSize: 10, color: '#999' }}>
                🔒 Pembayaran aman via <strong style={{ color: '#00bbff' }}>Midtrans</strong> (Sandbox)
                <br />Dana • GoPay • OVO • QRIS • Transfer Bank • Kartu Kredit
              </div>

              {/* Dev guide */}
              <details style={{ marginTop: 14 }}>
                <summary style={{
                  fontFamily: 'Bangers, cursive', fontSize: 12, letterSpacing: 1,
                  cursor: 'pointer', color: '#aaa', borderTop: '2px dashed #ddd', paddingTop: 8,
                }}>⚙️ Setup Guide (Developer)</summary>
                <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#666', padding: '8px 0', lineHeight: 1.8 }}>
                  <strong>1. Ganti CLIENT_KEY</strong> di TopupModal.tsx baris 12<br />
                  <strong>2. Set env:</strong> MIDTRANS_SERVER_KEY di .env.local<br />
                  <strong>3. Kode promo</strong> didefinisikan di konstanta PROMO_CODES (baris 30)<br />
                  <strong>4. custom_field1</strong> = kode promo, dikirim ke Midtrans & disimpan di log transaksi
                </div>
              </details>
            </>
          )}

          {/* ════════════ HISTORY TAB ════════════ */}
          {tab === 'history' && (
            <>
              <div style={{ fontFamily: 'Bangers, cursive', fontSize: 18, letterSpacing: 2, marginBottom: 12 }}>
                📋 RIWAYAT TOP UP
              </div>
              {history.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '30px 0', color: '#888', fontFamily: 'Comic Neue, cursive' }}>
                  Belum ada transaksi.<br />Lakukan top up pertamamu! 💎
                </div>
              ) : (
                history.map((h, i) => (
                  <div key={i} style={{
                    background: '#fff', border: '3px solid #1a1a1a',
                    boxShadow: '3px 3px 0 #1a1a1a', padding: '10px 14px',
                    marginBottom: 8, display: 'flex', alignItems: 'center', gap: 12,
                  }}>
                    <span style={{ fontSize: 26 }}>
                      {h.status === 'success' ? '✅' : h.status === 'pending' ? '⏳' : '❌'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: 1 }}>
                        +{h.points.toLocaleString()} BeatPoints
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
                        {h.date}
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#aaa' }}>
                        {h.orderId}
                      </div>
                      {(h as any).promoCode && (
                        <div style={{
                          display: 'inline-block', marginTop: 3,
                          fontFamily: 'Bangers, cursive', fontSize: 11, letterSpacing: 1,
                          color: '#00C853', border: '1px solid #00C853', padding: '0 6px',
                        }}>🏷️ {(h as any).promoCode}</div>
                      )}
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {(h as any).originalPrice && (h as any).originalPrice !== h.price && (
                        <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#aaa', textDecoration: 'line-through' }}>
                          Rp {((h as any).originalPrice as number).toLocaleString('id-ID')}
                        </div>
                      )}
                      <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, color: '#FF2D2D' }}>
                        Rp {h.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── helper component ──
function Row({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      marginBottom: 5, fontFamily: 'Comic Neue, cursive', fontSize: 13,
    }}>
      <span style={{ color: '#888' }}>{label}</span>
      <span style={{ color, fontWeight: 700 }}>{value}</span>
    </div>
  );
}