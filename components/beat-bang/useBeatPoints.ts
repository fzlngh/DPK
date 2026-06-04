'use client';

import { useState, useEffect, useCallback } from 'react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
export interface TopupPackage {
  id: string;
  name: string;
  points: number;
  price: number;       // IDR
  bonus: number;       // bonus points
  popular?: boolean;
  emoji: string;
}

export interface TopupHistory {
  orderId: string;
  packageId: string;
  points: number;
  price: number;           // harga final setelah diskon
  originalPrice?: number;  // harga sebelum diskon
  promoCode?: string;      // kode promo yang dipakai
  bonusBP?: number;        // bonus BP dari promo
  date: string;
  status: 'success' | 'pending' | 'failed';
}

// ─────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────
export const TOPUP_PACKAGES: TopupPackage[] = [
  { id: 'bp_50',  name: 'Starter Pack',  points: 50,  price: 5000,  bonus: 0,   emoji: '🎵' },
  { id: 'bp_120', name: 'Beat Rider',    points: 100, price: 10000, bonus: 20,  emoji: '⭐', popular: true },
  { id: 'bp_250', name: 'Rhythm Master', points: 200, price: 20000, bonus: 50,  emoji: '🔥' },
  { id: 'bp_600', name: 'Sound Legend',  points: 500, price: 50000, bonus: 100, emoji: '👑' },
];

// ─────────────────────────────────────────────
// PREMIUM SONG IDs (lagu yang butuh BP)
// ─────────────────────────────────────────────
export const PREMIUM_SONGS: Record<string, { cost: number; emoji: string }> = {
  premium1: { cost: 20, emoji: '💎' },
  premium2: { cost: 30, emoji: '💎' },
  premium3: { cost: 50, emoji: '👑' },
};

// ─────────────────────────────────────────────
// SSR-SAFE localStorage helpers
// ─────────────────────────────────────────────
const isBrowser = () => typeof window !== 'undefined';

const ls = {
  get: (key: string, fallback = ''): string => {
    if (!isBrowser()) return fallback;
    return localStorage.getItem(key) ?? fallback;
  },
  set: (key: string, value: string): void => {
    if (!isBrowser()) return;
    localStorage.setItem(key, value);
  },
  getJSON: <T>(key: string, fallback: T): T => {
    if (!isBrowser()) return fallback;
    try { return JSON.parse(localStorage.getItem(key) ?? 'null') ?? fallback; }
    catch { return fallback; }
  },
  setJSON: <T>(key: string, value: T): void => {
    if (!isBrowser()) return;
    localStorage.setItem(key, JSON.stringify(value));
  },
};

// ─────────────────────────────────────────────
// KEYS
// ─────────────────────────────────────────────
const BP_KEY       = 'bb_beatpoints';
const BP_OWNED_KEY = 'bb_owned_songs';
const BP_HIST_KEY  = 'bb_topup_history';

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────
export function useBeatPoints() {
  // Start with 0 / [] — hydrated client-side in useEffect
  const [points,  setPoints]  = useState(0);
  const [owned,   setOwned]   = useState<string[]>([]);
  const [history, setHistory] = useState<TopupHistory[]>([]);

  // Hydrate from localStorage only on the client
  useEffect(() => {
    setPoints(parseInt(ls.get(BP_KEY, '0')));
    setOwned(ls.getJSON<string[]>(BP_OWNED_KEY, []));
    setHistory(ls.getJSON<TopupHistory[]>(BP_HIST_KEY, []));
  }, []);

  // ── persist helpers ──
  const savePoints = useCallback((n: number) => {
    ls.set(BP_KEY, String(n));
    setPoints(n);
  }, []);

  const saveOwned = useCallback((list: string[]) => {
    ls.setJSON(BP_OWNED_KEY, list);
    setOwned(list);
  }, []);

  const saveHistory = useCallback((h: TopupHistory[]) => {
    ls.setJSON(BP_HIST_KEY, h);
    setHistory(h);
  }, []);

  // ── called after Midtrans success ──
  const creditPoints = useCallback((
    pkg: TopupPackage,
    orderId: string,
    bonusBP = 0,
    promoCode?: string,
    finalPrice?: number,
  ) => {
    const total     = pkg.points + pkg.bonus + bonusBP;
    const newPoints = parseInt(ls.get(BP_KEY, '0')) + total;
    savePoints(newPoints);

    const newEntry: TopupHistory = {
      orderId,
      packageId:     pkg.id,
      points:        total,
      price:         finalPrice ?? pkg.price,
      originalPrice: finalPrice !== undefined && finalPrice !== pkg.price ? pkg.price : undefined,
      promoCode:     promoCode || undefined,
      bonusBP:       bonusBP || undefined,
      date:          new Date().toLocaleString('id-ID'),
      status:        'success',
    };
    const hist = ls.getJSON<TopupHistory[]>(BP_HIST_KEY, []);
    hist.unshift(newEntry);
    hist.splice(50, 999);
    saveHistory(hist);

    return newPoints;
  }, [savePoints, saveHistory]);

  // ── purchase a premium song ──
  const purchaseSong = useCallback((songId: string): boolean => {
    const cost = PREMIUM_SONGS[songId]?.cost ?? 0;
    const cur  = parseInt(ls.get(BP_KEY, '0'));
    if (cur < cost) return false;
    savePoints(cur - cost);
    const list = ls.getJSON<string[]>(BP_OWNED_KEY, []);
    if (!list.includes(songId)) {
      list.push(songId);
      saveOwned(list);
    }
    return true;
  }, [savePoints, saveOwned]);

  // SSR-safe: returns false on server (no localStorage)
  const isSongOwned = useCallback((songId: string): boolean => {
    if (!isBrowser()) return false;
    return ls.getJSON<string[]>(BP_OWNED_KEY, []).includes(songId);
  }, []);

  return { points, owned, history, creditPoints, purchaseSong, isSongOwned, savePoints };
}