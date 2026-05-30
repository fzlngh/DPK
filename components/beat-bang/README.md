# 🎮 BEAT BANG! — Next.js Integration Guide

Rhythm tap game dikonversi dari HTML ke Next.js TSX.

---

## 📁 Struktur Folder

Salin dua folder ini ke project Next.js kamu:

```
your-nextjs-project/
├── app/
│   └── beat-bang/
│       └── page.tsx              ← Route halaman game
└── components/
    └── beat-bang/
        ├── BeatBangGame.tsx      ← Komponen utama (game engine)
        ├── SettingsOverlay.tsx   ← Overlay pengaturan
        ├── LeaderboardPanel.tsx  ← Papan skor per difficulty
        ├── ResultModal.tsx       ← Modal hasil permainan
        └── CountdownOverlay.tsx  ← Hitung mundur sebelum mulai
```

---

## 🚀 Cara Install

### 1. Salin folder
```bash
cp -r beat-bang/app/beat-bang  your-project/app/
cp -r beat-bang/components/beat-bang  your-project/components/
```

### 2. Pastikan Google Fonts tersedia
Di `app/layout.tsx` atau `pages/_document.tsx`:

```tsx
// Jika pakai next/font:
import { Bangers } from 'next/font/google';

// Atau tambahkan di <head>:
<link
  href="https://fonts.googleapis.com/css2?family=Bangers&family=Comic+Neue:wght@400;700&family=Permanent+Marker&display=swap"
  rel="stylesheet"
/>
```

### 3. Tidak perlu dependensi tambahan
Semua menggunakan React hooks + Web Audio API + Canvas API bawaan browser.

---

## ✨ Fitur Baru vs Versi HTML

| Fitur | HTML | Next.js TSX |
|---|---|---|
| Settings sebagai overlay | ❌ inline | ✅ Full overlay + backdrop blur |
| Fullscreen mode | ❌ | ✅ Fullscreen API |
| Hitung mundur (3-2-1) | ❌ | ✅ Animasi per angka |
| Leaderboard per difficulty | ❌ semua dicampur | ✅ Tab: ALL / EASY / MED / HARD |
| Auto-play tidak masuk leaderboard | ❌ | ✅ Cek & notice |
| Konfetti di grade S/A | ❌ | ✅ |
| TypeScript types | ❌ | ✅ Full typed |

---

## 🎮 Kontrol

| Key | Aksi |
|---|---|
| `D` `F` `J` `K` | Tap lane |
| `SPACE` / `ENTER` | Play / Pause |
| `ESC` | Stop |

---

## 🌐 Akses

Setelah deploy, game tersedia di:
```
https://yoursite.com/beat-bang
```

---

## ⚙️ Kustomisasi

### Tambah lagu baru
Edit `buildSongs()` di `BeatBangGame.tsx`:

```ts
{
  id: 'mytrack',
  name: 'My Track',
  artist: 'Me',
  emoji: '🎵',
  genre: 'POP',
  bpm: 130,
  difficulty: 'medium',
  color: '#FF69B4',
  pattern: generatePattern(130, 60, 'medium'),
}
```

### Ubah tampilan
- Warna lane: konstanta `LANE_COLORS` di `BeatBangGame.tsx`
- Tema: variabel CSS di `<style>` block dalam komponen

---

## 📝 Catatan

- Game menyimpan data di `localStorage` (nama, best score, leaderboard)
- Web Audio API memerlukan user gesture sebelum mulai (sudah ditangani)
- Kompatibel dengan Chrome, Firefox, Safari, Edge modern
