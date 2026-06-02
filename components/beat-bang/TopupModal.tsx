'use client';

import { useState, useEffect } from 'react';
import type { TopupPackage, TopupHistory } from './useBeatPoints';
import { TOPUP_PACKAGES } from './useBeatPoints';

// ─────────────────────────────────────────────
// MIDTRANS CONFIG (Sandbox)
// ─────────────────────────────────────────────
// Ganti CLIENT_KEY dengan Midtrans Sandbox Client Key kamu
// Dapatkan di: https://dashboard.sandbox.midtrans.com → Settings → Access Keys
const MIDTRANS_CLIENT_KEY = 'SB-Mid-client-XXXXXXXXXXXXXXXX'; // ← ganti ini
const MIDTRANS_SNAP_URL   = 'https://app.sandbox.midtrans.com/snap/snap.js';

// API endpoint untuk create transaction (buat di Next.js route handler)
// Contoh: app/api/midtrans/route.ts
const CREATE_TXN_URL = '/api/midtrans';

interface Props {
  currentPoints: number;
  history: TopupHistory[];
  onClose: () => void;
  onSuccess: (pkg: TopupPackage, orderId: string) => void;
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
  const [selected,   setSelected]   = useState<TopupPackage | null>(null);
  const [loading,    setLoading]    = useState(false);
  const [tab,        setTab]        = useState<'topup' | 'history'>('topup');
  const [statusMsg,  setStatusMsg]  = useState('');
  const [statusType, setStatusType] = useState<'success'|'error'|'info'|''>('');
  const [snapLoaded, setSnapLoaded] = useState(false);

  // Load Midtrans Snap.js
  useEffect(() => {
    if (document.getElementById('midtrans-snap')) { setSnapLoaded(true); return; }
    const script = document.createElement('script');
    script.id  = 'midtrans-snap';
    script.src = MIDTRANS_SNAP_URL;
    script.setAttribute('data-client-key', MIDTRANS_CLIENT_KEY);
    script.onload  = () => setSnapLoaded(true);
    script.onerror = () => setStatusMsg('⚠️ Gagal memuat payment gateway.');
    document.head.appendChild(script);
  }, []);

  function showStatus(msg: string, type: 'success'|'error'|'info') {
    setStatusMsg(msg); setStatusType(type);
    if (type === 'success') setTimeout(() => setStatusMsg(''), 4000);
  }

  async function handleTopup() {
    if (!selected) return;
    if (!snapLoaded || !window.snap) {
      showStatus('⚠️ Payment gateway belum siap. Coba lagi.', 'error'); return;
    }
    setLoading(true);
    showStatus('⏳ Memproses pembayaran...', 'info');

    try {
      // Generate unique order ID
      const orderId = `BB-${Date.now()}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

      // Call our Next.js API route to create Midtrans transaction
      const res = await fetch(CREATE_TXN_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId,
          amount:      selected.price,
          packageId:   selected.id,
          packageName: `${selected.name} (${selected.points + selected.bonus} BeatPoints)`,
        }),
      });

      if (!res.ok) throw new Error(await res.text());
      const { token } = await res.json();

      // Open Midtrans Snap popup
      window.snap.pay(token, {
        onSuccess: (result) => {
          setLoading(false);
          showStatus(`✅ Pembayaran berhasil! +${selected.points + selected.bonus} BeatPoints`, 'success');
          onSuccess(selected, result.order_id || orderId);
          setSelected(null);
        },
        onPending: () => {
          setLoading(false);
          showStatus('⏳ Pembayaran pending. BeatPoints akan ditambah setelah konfirmasi.', 'info');
        },
        onError: () => {
          setLoading(false);
          showStatus('❌ Pembayaran gagal. Silakan coba lagi.', 'error');
        },
        onClose: () => {
          setLoading(false);
          showStatus('', 'info');
        },
      });

    } catch (err: any) {
      setLoading(false);
      // Demo mode: simulasi success jika API belum di-setup
      if (err.message?.includes('Failed to fetch') || err.message?.includes('404')) {
        showStatus('🧪 DEMO MODE: Simulasi topup berhasil!', 'success');
        const fakeOrderId = `DEMO-${Date.now()}`;
        setTimeout(() => {
          onSuccess(selected, fakeOrderId);
          setSelected(null);
        }, 1000);
      } else {
        showStatus(`❌ Error: ${err.message}`, 'error');
      }
    }
  }

  const statusColors = { success: '#00C853', error: '#FF2D2D', info: '#00bbff', '': 'transparent' };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 7000,
      background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        background: '#FFFDF0', border: '6px solid #1a1a1a',
        boxShadow: '12px 12px 0 #1a1a1a',
        width: 'min(520px, 95vw)', maxHeight: '90vh',
        display: 'flex', flexDirection: 'column',
        overflow: 'hidden',
      }}>

        {/* Header */}
        <div style={{
          background: '#1a1a1a', padding: '14px 20px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontFamily: 'Bangers, cursive', fontSize: 28, letterSpacing: 4, color: '#FFE000' }}>
              💎 BEATPOINTS
            </div>
            <div style={{ fontFamily: 'monospace', fontSize: 12, color: '#00bbff', letterSpacing: 1 }}>
              Saldo kamu: <strong style={{ color: '#FFE000', fontSize: 16 }}>{currentPoints.toLocaleString()}</strong> BP
            </div>
          </div>
          <button onClick={onClose} style={{
            fontFamily: 'Bangers, cursive', fontSize: 20, color: '#FF2D2D',
            background: 'none', border: '3px solid #FF2D2D',
            padding: '2px 12px', cursor: 'pointer', letterSpacing: 1,
          }}>✕</button>
        </div>

        {/* Tabs */}
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

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>

          {/* Status message */}
          {statusMsg && (
            <div style={{
              background: statusColors[statusType] + '22',
              border: `3px solid ${statusColors[statusType]}`,
              padding: '10px 16px', marginBottom: 16,
              fontFamily: 'Comic Neue, cursive', fontSize: 14, fontWeight: 700,
              color: statusColors[statusType],
            }}>{statusMsg}</div>
          )}

          {tab === 'topup' && (
            <>
              {/* Package grid */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr',
                gap: 10, marginBottom: 20,
              }}>
                {TOPUP_PACKAGES.map(pkg => (
                  <div key={pkg.id}
                    onClick={() => setSelected(pkg)}
                    style={{
                      background: selected?.id === pkg.id ? '#1a1a1a' : '#fff',
                      border: `4px solid ${selected?.id === pkg.id ? '#FFE000' : '#1a1a1a'}`,
                      boxShadow: selected?.id === pkg.id ? '4px 4px 0 #FFE000' : '4px 4px 0 #1a1a1a',
                      padding: '14px 12px', cursor: 'pointer',
                      position: 'relative', transition: 'all 0.1s',
                      transform: selected?.id === pkg.id ? 'translate(-2px,-2px)' : 'none',
                    }}
                  >
                    {/* Popular badge */}
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
                      fontFamily: 'Bangers, cursive', fontSize: 15, letterSpacing: 1,
                      color: selected?.id === pkg.id ? '#FFE000' : '#1a1a1a', marginBottom: 4,
                    }}>{pkg.name}</div>

                    {/* Points display */}
                    <div style={{
                      fontFamily: 'Bangers, cursive', fontSize: 26, lineHeight: 1,
                      color: selected?.id === pkg.id ? '#fff' : '#1E90FF',
                    }}>
                      {pkg.points.toLocaleString()} <span style={{ fontSize: 14, color: '#00bbff' }}>BP</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div style={{
                        fontFamily: 'Bangers, cursive', fontSize: 12,
                        color: '#00C853', letterSpacing: 1,
                      }}>+ BONUS {pkg.bonus} BP</div>
                    )}

                    {/* Price */}
                    <div style={{
                      marginTop: 8, background: selected?.id === pkg.id ? '#FFE000' : '#1a1a1a',
                      color: selected?.id === pkg.id ? '#1a1a1a' : '#fff',
                      fontFamily: 'Bangers, cursive', fontSize: 14, letterSpacing: 1,
                      padding: '3px 0', textAlign: 'center',
                      border: '2px solid #1a1a1a',
                    }}>
                      Rp {pkg.price.toLocaleString('id-ID')}
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected summary */}
              {selected && (
                <div style={{
                  background: '#1a1a1a', padding: '12px 16px',
                  border: '3px solid #FFE000', boxShadow: '4px 4px 0 #FFE000',
                  marginBottom: 16,
                }}>
                  <div style={{
                    fontFamily: 'Bangers, cursive', fontSize: 13, color: '#00bbff',
                    letterSpacing: 2, marginBottom: 8,
                  }}>RINGKASAN PEMBELIAN</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Comic Neue, cursive', fontSize: 14, color: '#fff', marginBottom: 4 }}>
                    <span>{selected.name}</span>
                    <span>{selected.points} BP{selected.bonus > 0 ? ` + ${selected.bonus} bonus` : ''}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'Bangers, cursive', fontSize: 20, color: '#FFE000' }}>
                    <span>TOTAL</span>
                    <span>Rp {selected.price.toLocaleString('id-ID')}</span>
                  </div>
                  <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#555', marginTop: 4 }}>
                    Setelah topup: {(currentPoints + selected.points + selected.bonus).toLocaleString()} BP
                  </div>
                </div>
              )}

              {/* Pay button */}
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
                  transition: 'all 0.1s',
                  opacity: !selected || loading ? 0.6 : 1,
                }}
              >
                {loading ? '⏳ MEMPROSES...' : selected ? `💳 BAYAR Rp ${selected.price.toLocaleString('id-ID')}` : 'PILIH PAKET DULU'}
              </button>

              {/* Midtrans badge */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 8, marginTop: 12,
              }}>
                <div style={{ fontFamily: 'monospace', fontSize: 10, color: '#999', textAlign: 'center' }}>
                  🔒 Pembayaran aman melalui{' '}
                  <strong style={{ color: '#00bbff' }}>Midtrans</strong>
                  {' '}(Sandbox Mode)
                  <br />Dana • GoPay • OVO • QRIS • Transfer Bank • Kartu Kredit
                </div>
              </div>

              {/* Setup guide */}
              <details style={{ marginTop: 16 }}>
                <summary style={{
                  fontFamily: 'Bangers, cursive', fontSize: 13, letterSpacing: 1,
                  cursor: 'pointer', color: '#555', padding: '6px 0',
                  borderTop: '2px dashed #ccc',
                }}>⚙️ Setup Guide (Developer)</summary>
                <div style={{
                  fontFamily: 'monospace', fontSize: 11, color: '#666',
                  padding: '10px 0', lineHeight: 1.8,
                }}>
                  <strong>1. Ganti CLIENT_KEY</strong> di TopupModal.tsx<br/>
                  <strong>2. Buat API route:</strong> app/api/midtrans/route.ts<br/>
                  <strong>3. Install:</strong> npm install midtrans-client<br/>
                  <strong>4.</strong> Lihat README untuk contoh kode lengkap
                </div>
              </details>
            </>
          )}

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
                    <span style={{ fontSize: 28 }}>
                      {h.status === 'success' ? '✅' : h.status === 'pending' ? '⏳' : '❌'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: 'Bangers, cursive', fontSize: 16, letterSpacing: 1 }}>
                        +{h.points.toLocaleString()} BeatPoints
                      </div>
                      <div style={{ fontFamily: 'monospace', fontSize: 11, color: '#666' }}>
                        {h.date} • {h.orderId}
                      </div>
                    </div>
                    <div style={{
                      fontFamily: 'Bangers, cursive', fontSize: 14,
                      color: '#FF2D2D', textAlign: 'right',
                    }}>
                      Rp {h.price.toLocaleString('id-ID')}
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
