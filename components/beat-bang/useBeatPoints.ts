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
  price: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
}

// ─────────────────────────────────────────────
// PACKAGES
// ─────────────────────────────────────────────
export const TOPUP_PACKAGES: TopupPackage[] = [
  { id: 'bp_50',   name: 'Starter Pack',  points: 50,   price: 5000,   bonus: 0,   emoji: '🎵' },
  { id: 'bp_120',  name: 'Beat Rider',    points: 100,  price: 10000,  bonus: 20,  emoji: '⭐', popular: true },
  { id: 'bp_250',  name: 'Rhythm Master', points: 200,  price: 20000,  bonus: 50,  emoji: '🔥' },
  { id: 'bp_600',  name: 'Sound Legend',  points: 500,  price: 50000,  bonus: 100, emoji: '👑' },
];

// ─────────────────────────────────────────────
// PREMIUM SONG IDs (lagu yang butuh BP)
// ─────────────────────────────────────────────
export const PREMIUM_SONGS: Record<string, { cost: number; emoji: string }> = {
  premium1: { cost: 20,  emoji: '💎' },
  premium2: { cost: 30,  emoji: '💎' },
  premium3: { cost: 50,  emoji: '👑' },
};

// ─────────────────────────────────────────────
// HOOK
// ─────────────────────────────────────────────
const BP_KEY       = 'bb_beatpoints';
const BP_OWNED_KEY = 'bb_owned_songs';
const BP_HIST_KEY  = 'bb_topup_history';

export function useBeatPoints() {
  const [points,   setPoints]   = useState(0);
  const [owned,    setOwned]    = useState<string[]>([]);
  const [history,  setHistory]  = useState<TopupHistory[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    setPoints(parseInt(localStorage.getItem(BP_KEY)   || '0'));
    setOwned(JSON.parse(localStorage.getItem(BP_OWNED_KEY) || '[]'));
    setHistory(JSON.parse(localStorage.getItem(BP_HIST_KEY) || '[]'));
  }, []);

  // Persist helpers
  const savePoints = useCallback((n: number) => {
    localStorage.setItem(BP_KEY, String(n));
    setPoints(n);
  }, []);

  const saveOwned = useCallback((list: string[]) => {
    localStorage.setItem(BP_OWNED_KEY, JSON.stringify(list));
    setOwned(list);
  }, []);

  const saveHistory = useCallback((h: TopupHistory[]) => {
    localStorage.setItem(BP_HIST_KEY, JSON.stringify(h));
    setHistory(h);
  }, []);

  // Called after Midtrans success
  const creditPoints = useCallback((pkg: TopupPackage, orderId: string) => {
    const total = pkg.points + pkg.bonus;
    const newPoints = parseInt(localStorage.getItem(BP_KEY) || '0') + total;
    savePoints(newPoints);

    const newEntry: TopupHistory = {
      orderId,
      packageId: pkg.id,
      points: total,
      price: pkg.price,
      date: new Date().toLocaleString('id-ID'),
      status: 'success',
    };
    const hist: TopupHistory[] = JSON.parse(localStorage.getItem(BP_HIST_KEY) || '[]');
    hist.unshift(newEntry);
    hist.splice(50, 999);
    saveHistory(hist);

    return newPoints;
  }, [savePoints, saveHistory]);

  // Purchase a premium song
  const purchaseSong = useCallback((songId: string): boolean => {
    const cost = PREMIUM_SONGS[songId]?.cost ?? 0;
    const cur  = parseInt(localStorage.getItem(BP_KEY) || '0');
    if (cur < cost) return false;
    savePoints(cur - cost);
    const list: string[] = JSON.parse(localStorage.getItem(BP_OWNED_KEY) || '[]');
    if (!list.includes(songId)) {
      list.push(songId);
      saveOwned(list);
    }
    return true;
  }, [savePoints, saveOwned]);

  const isSongOwned = useCallback((songId: string) => {
    const list: string[] = JSON.parse(localStorage.getItem(BP_OWNED_KEY) || '[]');
    return list.includes(songId);
  }, []);

  return { points, owned, history, creditPoints, purchaseSong, isSongOwned, savePoints };
}
