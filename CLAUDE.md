# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Celestl

Aplikasi pelacak skor dan kalkulator rating untuk rhythm game. **Fokus sekarang hanya Arcaea.** Rotaeno ditunda (di-hold) sampai Arcaea stabil, dan deteksi game otomatis ikut ditunda bersamanya. Skema database tetap dibuat multi-game supaya Rotaeno bisa menyusul tanpa migrasi besar.

Pemilik proyek: backend engineer (Laravel 5+ tahun, Node.js), baru belajar Python dan machine learning. Proyek ini juga sarana belajar, jadi untuk kode di `vision/` dan rating engine, tulis komentar yang menjelaskan *kenapa*, bukan hanya *apa*. Proyek ini rencananya open source.

## Status repo

Jadi git repo sejak Task 1.1 (`main`, root-commit berisi dokumen + mockup `design/`, commit berikutnya
scaffold Laravel). `web/` sudah ada dan jalan lokal (lihat § Perintah). `vision/` belum ada — menunggu Fase 3.

## Struktur repo

```
celestl/
├── CLAUDE.md
├── TASKS.md           # tahapan kerja, dikerjakan berurutan
├── design/            # mockup HTML/JS statis (admin dashboard, account/Top 50) — dibuat sebelum web/ ada
├── web/               # Laravel + Inertia (React) — backend, admin, UI (Task 1.1 selesai)
└── vision/            # Python FastAPI — pembaca gambar Best 50 (belum ada, Fase 3)
```

## Pembagian tanggung jawab (penting)

- `vision/` (Python) hanya **membaca gambar** dan mengembalikan data mentah (nickname, dan per kartu: rank, judul/jacket, skor, lamp, potential tercetak, level) plus confidence. Tidak tahu apa pun soal chart constant atau rumus rating.
- `web/` (Laravel) memegang **semua data dan kalkulasi**: database lagu & chart constant, rumus rating, Top 50, riwayat, akun.
- Jangan pindahkan logika rating ke Python.

## Stack

- Laravel versi stabil terbaru, PHP 8.3+, Inertia + React, Tailwind
- Database: **MySQL**
- Test: **Pest**
- Tampilan harus responsif dan nyaman di browser HP (web-first, bukan app native)
- Bahasa UI: **Inggris** sebagai bahasa utama. Siapkan struktur i18n sejak awal (semua teks lewat file terjemahan Laravel, jangan hardcode), target menyusul: Jepang, Korea, Mandarin — mengikuti bahasa in-game. Jangan tulis terjemahannya sekarang, cukup siapkan wadahnya.

## Perintah

Semua perintah dijalankan dari `web/` (aplikasi Laravel). Database lokal: MySQL, nama `celestl`, user `root`
tanpa password (lihat `web/.env`). Dibuat lewat Laravel installer resmi: `laravel new web --react
--database=mysql --no-authentication --pest --npm --no-boost` (React starter kit = Inertia + React + Tailwind
sudah termasuk; `--no-authentication` karena login custom/tanpa password dibuat di Fase 4, bukan scaffolding
bawaan starter kit).

```bash
cd web

# Dev server (Laravel + Vite + queue listener, sekaligus, lewat `artisan dev` bawaan Laravel 12)
composer run dev

# Build aset frontend (perlu sekali sebelum test fitur yang merender halaman Inertia, karena test
# membaca public/build/manifest.json, bukan dev server Vite)
npm run build

# Seluruh test (Pest)
php artisan test

# Satu test (filter nama method/deskripsi)
php artisan test --filter=nama_test
```

Migration: `php artisan migrate` (database `celestl` harus sudah dibuat lebih dulu — `CREATE DATABASE celestl
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`). Test pakai SQLite in-memory sendiri (diatur di
`phpunit.xml`), jadi tidak tersentuh oleh data MySQL lokal.

i18n: `lang/en/` sudah dipublikasikan lewat `php artisan lang:publish` sebagai wadah (cuma isi bawaan
framework — auth/validation/pagination/passwords — belum ada teks Celestl sendiri). JA/KO/ZH menyusul nanti,
belum ditulis.

## Aturan rating Arcaea

Sejak update terakhir ada **bonus clear** dan **Top 50** (bukan Best 30 lagi).

Play rating per chart = `chart_constant + modifier(score) + bonus_clear`.

| Skor | Modifier |
|---|---|
| ≥ 10.000.000 | 2.0 |
| 9.800.000 – 9.999.999 | 1.0 + (score − 9.800.000) / 200.000 |
| < 9.800.000 | (score − 9.500.000) / 300.000 |

- `bonus_clear` = **+0.2 untuk semua lamp clear** (Easy/Normal/Hard Clear, Full Recall, Pure Memory). Lost = 0. Kata pemilik: dihitung per play dulu.
- Minimum play rating 0 **dikenakan sebelum bonus**: `max(0, constant + modifier) + bonus_clear`. Jadi chart yang di-clamp ke 0 tetap dapat +0.2 kalau clear.
- Bukti dari game: Extradimensional Cosmic Phenomenon (constant 11.3), skor 9.900.167, lamp clear → tercetak 13.001 (hitungan penuh 13.000835; tanpa bonus 12.800835).

### Difficulty

Enum: `PST` (Past), `PRS` (Present), `FTR` (Future), `BYD` (Beyond), `ETR` (Eternal), `INS` (Inscribed) — 6 nilai. Desain Figma lama hanya menggambar PST/PRS/FTR, jadi UI difficulty perlu menampung 6.

### Grade dan lamp (dua hal terpisah)

Grade dari skor: D 0–8.799.999 · C 8.800.000–8.999.999 · B 9.000.000–9.199.999 · A 9.200.000–9.499.999 · AA 9.500.000–9.799.999 · EX 9.800.000–9.899.999 · EX+ ≥ 9.900.000. Skor ≥ 10.000.000 tetap bergrade EX+ di gambar resmi; "PM" adalah lamp, bukan grade. Grade diturunkan dari skor, tidak disimpan.

Lamp: `lost` (L), `easy_clear`, `normal_clear`, `hard_clear` (C hijau/biru/merah), `full_recall` (F/FR), `pure_memory` (P/PM).

### Potential total (PTT): BELUM ADA RUMUS TERVERIFIKASI

Rumus lama `(Best 30 + Recent 10) / 40` tidak berlaku lagi. Pada gambar contoh, rata-rata 50 potential = 12.6398, tetapi tercetak 12.668, jadi ada komponen lain yang belum diketahui (mungkin Recent 10). **Jangan menampilkan PTT total** sampai rumusnya terverifikasi di Arcaea Wiki; tampilkan play rating dan daftar Top 50 saja. Top 50 = 50 chart unik dengan play rating tertinggi. Fitur "skor minimal agar PTT naik" menunggu rumus ini.

### Nilai uji wajib

Base formula (uji dengan bonus = 0), chart constant 10.4 kecuali disebut lain:

| Skor | Play rating |
|---|---|
| 10.000.000 | 12.4 |
| 9.912.345 | 11.961725 |
| 9.800.000 | 11.4 |
| 9.700.000 | 11.066667 (±1e-6) |
| 9.500.000 | 10.4 |
| 9.200.000 | 9.4 |
| 9.000.000 dengan CC 1.5 | 0 (dibatasi minimum) |

Dengan bonus: CC 11.3, skor 9.900.167, lamp clear → 13.000835 (±1e-6). Nilai uji bonus lain ditambahkan setelah constant hasil import dicocokkan dengan gambar Best 50.

Simpan chart constant sebagai `decimal(4,1)`. Hitung rating dengan presisi penuh; pembulatan/truncate hanya di tampilan (game menampilkan 3 desimal di kartu Top 50).

## Akun

Keputusan pemilik: **tanpa password** (proyek open source). User mendaftar sendiri dengan nickname in-game dan ID pemain, lalu login memakai salah satunya. Harus ada juga **mode tanpa login** (guest): kalkulator bisa dipakai tanpa menyimpan riwayat di server.

Format identitas in-game (dari halaman akun Arcaea):

- **Player ID**: 9 digit, ditampilkan berkelompok 3 (`160 500 737`). Simpan ternormalisasi tanpa spasi (`160500737`), tampilkan berkelompok. Ini **identitas stabil** dan jadi kunci utama akun.
- **Username/nickname**: bisa diubah kapan saja oleh user di game (ada tombol "Change username"). Jadi nickname **display-only**, bukan kunci. Login by nickname harus diselesaikan ke player ID, dan tangani kasus nickname bentrok/berubah.

**Skala proyek (menjawab pertanyaan lama yang sempat terbuka):** Celestl adalah proyek personal, tidak
dipublikasikan luas — paling untuk segelintir orang. Jadi tidak perlu alur register publik yang berat; cukup
identitas game (Player ID/UUID Arcaea, nanti game lain) sebagai cara masuk, tanpa password dan tanpa proses
pendaftaran formal. Ini juga berarti rate limiting, moderasi, dan skala admin tidak perlu dirancang untuk
banyak pengguna asing — fokuskan effort ke content management (data lagu/chart) dan rating engine + OCR dulu,
bukan ke sistem akun yang rumit.

Risiko yang perlu diingat: player ID dan nickname bukan rahasia — keduanya tercetak di gambar Best 50 yang biasa dibagikan publik. Siapa pun yang tahu keduanya bisa masuk ke akun orang lain. Perlakukan endpoint yang mengubah data (upload, hapus riwayat) dengan hati-hati. Belum diputuskan apakah ada kunci rahasia opsional; jangan menambahkannya tanpa persetujuan.

## Upload Best 50 (khusus Arcaea)

- User mengunggah gambar Best 50 dari web resmi Arcaea (dibuat lowiro, layout tetap grid 5×10, sekitar 1800×3208). Posisi area bisa ditentukan tetap, tidak perlu YOLO.
- **Pencocokan lagu:** hash jacket dulu, judul hasil OCR sebagai cadangan dan konfirmasi. Yang disimpan hanya *perceptual hash* (deretan angka sidik jari gambar) di `songs.jacket_hash`, **bukan gambar jacket-nya** — jadi tidak melanggar aturan hak cipta di bawah. Judul di kartu sering terpotong (`Misdeed -la bonté de Die`), jadi cocokkan dengan awalan/fuzzy, bukan sama persis.
- Nickname di header gambar harus cocok dengan nickname akun. Karena nickname bisa berubah di game, sediakan cara menyegarkan nickname tersimpan (atau cocokkan juga dengan nickname lama) supaya user tidak terkunci dari upload-nya sendiri. Ini hanya pencegah salah upload/upload iseng, **bukan bukti kepemilikan** (nickname publik, gambar bisa diedit). Jangan menyebutnya keamanan.
- Potential yang tercetak per kartu dipakai sebagai cross-check terhadap hasil hitung rating engine.
- Hasil impor disimpan sebagai snapshot (tanggal generate, nickname, daftar 50 entri) dan bisa dilihat di menu riwayat Best 50.
- Format skor di gambar: `09'900'167`. Lamp: C / F / P.

## Data resmi ditemukan di `data/` (Oktober 2026) — BELUM dipakai, catat dulu

Pemilik menaruh `data/packlist.json` (62 pack) dan `data/songlist.json` (554 lagu) — ini **data asli hasil
ekstraksi dari client game Arcaea**, bukan wiki, dan jauh lebih lengkap dari rencana Task 1.3 semula. Formatnya
sama dengan yang dipakai proyek parser komunitas (`vscode-arcaea-file-format`, `ArcaeaChartRender`).

**Sudah dikonfirmasi dan bisa dipakai:**
- Per lagu: `id`, `title_localized` (multi-bahasa), `artist`, `search_title`/`search_artist` (alias pencarian),
  `bpm`/`bpm_base`, `set` (= id pack, join ke `packlist.json`), `date` (unix epoch → `released_at`), `version`
  (versi game saat lagu/difficulty itu ditambahkan).
- Per difficulty (`difficulties[]`): `ratingClass` (lihat di bawah), `chartDesigner`, `jacketDesigner`
  (mengisi langsung kolom `jacket_designer` yang tadinya placeholder "—" di mockup admin!), `rating` (level
  tampilan, integer), `ratingPlus` (bool, suffix "+").
- **`rating`/`ratingPlus` BUKAN chart constant.** Itu cuma level tampilan integer (mis. 11, ratingPlus=true →
  "11+"). Constant desimal (mis. 11.3) masih harus dari estimasi komunitas (wiki), seperti sudah dicatat di
  atas — dikonfirmasi lewat lagu uji Extradimensional Cosmic Phenomenon: data resmi cuma bilang "rating: 11",
  padahal constant yang kita verifikasi dari bonus clear di gambar Best 50 adalah **11.3**.
- **Kualitas data:** ada entri rusak (`{"idx":127,"id":"particlearts","deleted":true}`, tanpa field
  `difficulties`) — filter saat import. Field aneh lain yang muncul: `ratingClassAlias`, `legacy11`,
  `hidden_until`, `world_unlock`, `plusFingers`, dll — belum semuanya dipahami, jangan diasumsikan artinya.

**Pemetaan `ratingClass` — dikonfirmasi pemilik & tervalidasi silang:**
`0=Past, 1=Present, 2=Future, 3=Beyond, 4=Eternal, 5=Inscribed`. Posisi index ini juga dipakai di
`data/chartconstant.json`/`data/notecount.json` (array per lagu, index = ratingClass, `null` kalau difficulty
itu tidak ada).

**Kasus khusus — chart Inscribed lama disimpan di slot Beyond:** beberapa chart (ditemukan 4: DREAD AREA,
Riven Pilgrimage, Cataclysm Cry, DEINOS PHAINEIN, semua dari pack Divine Oblivion) punya `ratingClass=3`
(slot Beyond) **tapi juga punya `ratingClassAlias=1`**. Menurut pemilik, `ratingClassAlias=1` berarti chart itu
sebenarnya **Inscribed**, bukan Beyond — kemungkinan sisa representasi lama (`legacy11:true` juga menyertai
keempatnya) dari sebelum Inscribed jadi ratingClass tersendiri. `admin-data.js` sudah menerapkan aturan ini:
kalau `ratingClassAlias===1`, kode difficulty dipaksa jadi `INS` berapa pun `ratingClass` mentahnya. Setelah
koreksi ini, jumlah chart per difficulty di data kita: PST 553, PRS 553, FTR 553, BYD 64, ETR 110, INS 4 — jadi
Inscribed memang ada, hanya representasinya tidak langsung lewat `ratingClass=5`. **Terapkan aturan yang sama
di Task 1.3**, jangan cuma baca `ratingClass` mentah.

### Field `side` (dikonfirmasi & dikoreksi pemilik)

`0=Light, 1=Conflict, 2=Colorless, 3=Lephon, 4=Catastrophe` (index 4 cuma muncul di pack Divine Oblivion, 5
lagu). **Catatan beda sumber yang masih berlaku:** infobox Fandom (`arcaea.fandom.com`, field terstruktur
`Side = Conflict`) bilang index 1 = "Conflict"; pemilik awalnya bilang "Dark". `admin-data.js` memakai
"Conflict" (sumber terstruktur) — kemungkinan cuma beda istilah santai vs resmi, belum perlu ditindaklanjuti
kecuali muncul lagi.

CSS komunitas `arcaea.miraheze.org/MediaWiki:Common.css` (lihat § Warna BYD/ETR/INS di bawah) punya kelas
`.light-solid/.conflict-solid/.achromic-solid/.lephon-solid/.darklephon-solid` — "achromic" cocok dengan
"Colorless" (sama-sama berarti "tanpa warna"), tapi wiki menyebut index ke-5 "darklephon" bukan "Catastrophe".
Nama dari pemilik (Catastrophe) yang dipakai karena lebih otoritatif (pemain langsung), nama CSS class di wiki
cuma penamaan internal mereka.

## `data/songlistothers.json` — lagu April Fools & lagu yang dihapus

Dua kategori lagu yang **sengaja tidak masuk** `data/songlist.json` utama:

- **`deleted`**: lagu yang sudah dihapus dari game (contoh: `particlearts`, dihapus versi 5.10.4), tapi tetap
  menyimpan data historisnya termasuk constant lama. Tidak masuk katalog utama karena tidak bisa dimainkan lagi
  — tidak masuk akal untuk fitur pelacak skor. Simpan datanya kalau nanti ingin fitur arsip, tapi jangan
  ditampilkan sebagai lagu yang bisa di-log.
- **`special`** (10 entri total, tapi **cuma 9 beneran `"set": "aprilfools"`** — koreksi dari catatan lama di
  sini yang bilang "10 lagu aprilfools"): **lagu lelucon April Fools resmi dari lowiro** (contoh: "overdead.",
  "UNUSED LEVELS", "Live Faster Die Younger" remix). Ini jawaban atas pertanyaan pemilik soal "diff-nya '?'" —
  **`"rating": "?"` itu memang disengaja oleh lowiro**, bukan data rusak/kosong. Chart designer-nya juga
  sengaja lucu-lucuan (mis. `"《WARNING》 LIMITER:underflow_error%"`) — **jangan dibersihkan atau dianggap perlu
  diperbaiki**, sama seperti kasus mojibake chartDesigner sebelumnya: tampilkan apa adanya. Field `rating`
  untuk lagu-lagu ini **harus ditangani sebagai string "?"**, jangan pernah di-parse sebagai angka atau diberi
  constant karangan.
  Entri ke-10 adalah **`tutorial`** (`"set": "tutorial"`, judul "Word Problems") — rating-nya normal ("1","4"),
  BUKAN lelucon April Fools, cuma kebetulan disimpan di array `special` yang sama karena sama-sama tidak punya
  pack asli.

**Yang masih perlu dicek bareng pemilik:** semua entri `special` di file ini punya `"ratingClass": 2` (artinya
Future, menurut pemetaan yang sudah dikonfirmasi), tapi pemilik bilang "masuk kategori Beyond" secara tampilan
di game. Kemungkinan cuma soal di mana tombolnya muncul di layar pemilihan difficulty (karena lagu ini tidak
punya Future asli untuk digantikan posisinya), bukan berarti pemetaan `ratingClass` kita salah — **tapi ini
baru dugaan, jangan diasumsikan benar sebelum dicek langsung di game.**

**Diterapkan di Task 1.3** (`app/Console/Commands/ImportArcaeaContent.php`): kesepuluh lagu `special` MASUK
katalog Songs & charts (bukan dipisah), dikelompokkan ke pack sintetis "April Fools" (section "Other") yang
dibuat importer sendiri — bukan pack asli `packlist.json`. Mengelompokkan `tutorial` ke situ juga (sama-sama
tanpa pack asli) adalah **dugaan/keputusan sepihak importer, bukan hal yang sudah dikonfirmasi pemilik** —
tandai kalau perlu dipindah nanti.

## Sumber chart constant ditemukan: `data/chartconstant.json`

Dari `arcaea.miraheze.org/wiki/Data:ChartConstant.json` (raw JSON lewat `?action=raw`, bukan ringkasan AI —
diambil langsung supaya tidak ada risiko salah baca angka). **Komunitas, bukan resmi lowiro** — tapi ini wiki
yang sama yang memelihara proyek parser (`vscode-arcaea-file-format` dll.), jadi formatnya konsisten dengan
`songlist.json` resmi.

- Struktur: `{ "<song_id>": [{"constant": 11.3, "old": false}, null, ...] }`, array berindeks `ratingClass`
  (lihat di atas).
- **Tervalidasi silang dan cocok persis**: Extradimensional Cosmic Phenomenon ETR → `11.3`, sama persis dengan
  hitungan independen kita dari gambar Best 50 pemilik (bonus clear 0.2 + modifier). Ini bukti kuat bahwa
  sumber ini bisa dipercaya untuk constant Arcaea.
- Cakupan: 553 lagu, 1.834 dari 1.837 chart (99,8%) punya nilai constant. Sisanya `null` — wiki belum mengisi,
  **jangan ditebak**.
- Field `old: true/false` belum dipahami maknanya (kemungkinan menandai nilai dari sebelum rebalance versi
  tertentu) — jangan diasumsikan, cek dulu kalau relevan.
- **Sumber tambahan di wiki yang sama (format serupa, sudah diambil pemilik):** `data/notecount.json`
  (`{"notes": {"<song_id>": [array berindeks ratingClass]}}`, 1.834 chart punya nilai) dan
  `data/songlength.json` (`{"<song_id>": "m:ss"}`, 543/553 lagu). `data/versiondate.json` juga ada (peta
  versi→tanggal rilis per sub-versi) tapi belum diintegrasikan ke `admin-data.js`.
- **Tetap perlu izin pemilik sebelum dipakai di import sungguhan** (Task 1.3) — sesuai aturan umum di atas,
  tapi ini kandidat sumber utama yang sudah konkret, bukan lagi "cari di wiki" yang samar.
### Warna BYD/ETR/INS — final, dikonfirmasi pemilik

| Diff | Hex | Sumber |
|---|---|---|
| BYD | `#BA1130` | dikonfirmasi pemilik |
| ETR | `#8975A8` | dot ke-4 di Figma (Song Detail, ALTER EGO), sampling piksel presisi |
| INS | `#0000CD` (MediumBlue) | `.ins-txt` di `arcaea.miraheze.org/MediaWiki:Common.css`, dipakai sesuai permintaan pemilik |

PST/PRS/FTR tetap dari Figma (`#03A8E6`/`#ACFF82`/`#F768DD`) — tidak diganti dengan palet wiki, karena beda
jauh dari desain Celestl sendiri (mis. PST versi wiki `#379dd4`).

### Kontras warna difficulty terhadap background (`#0C0C22`)

Pemilik menanyakan kenapa BYD terasa "mencolok, tidak se-smooth" warna lain. Dihitung kontras WCAG tiap warna
teks terhadap `--bg`:

| Diff | Hex | Lightness | Kontras |
|---|---|---|---|
| PRS | `#ACFF82` | 75.5% | 15.93 |
| FTR | `#F768DD` | 68.8% | 7.31 |
| PST | `#03A8E6` | 45.7% | 7.10 |
| ETR | `#8975A8` | 55.9% | 4.74 |
| BYD (lama) | `#BA1130` | 39.8% | **2.94** |
| INS | `#0000CD` | 40.2% | **1.72** |

Pola yang terlihat: warna yang "terasa smooth" (PST/PRS/FTR/ETR) semua py lightness ≥45% dengan kontras ≥4.7.
BYD lama dan INS jauh di bawah itu — bukan soal hue, tapi warna merah/biru murni (channel hijau rendah) butuh
lightness HSL jauh lebih tinggi untuk kontras setara, karena rumus luminance WCAG memberi bobot jauh lebih
besar ke channel hijau (0.7152) dibanding merah (0.2126) atau biru (0.0722).

**Sudah diperbaiki:** BYD dinaikkan ke `#E14763` (hue sama, 349°, lightness 40%→58%, kontras jadi 4.84) —
dikonfirmasi oleh pemilik secara tidak langsung (menanyakan "kenapa mencolok" = minta diperbaiki).

**Belum diperbaiki, perlu keputusan pemilik:** INS (`#0000CD`, kontras 1.72) punya masalah yang sama bahkan
lebih parah — hampir tidak terlihat di atas background gelap. Supaya kontrasnya sepadan (~4.9), lightness-nya
perlu naik ke titik warnanya jadi periwinkle terang (`#7171F4`), yang sudah tidak terasa seperti "MediumBlue"
lagi. Ini trade-off yang perlu pemilik pilih: pertahankan kemiripan dengan referensi wiki (kontras rendah) atau
prioritaskan keterbacaan (warna jadi lebih terang/beda karakter). Jangan diubah sepihak sebelum dijawab.

- **`chartDesigner` yang terlihat seperti mojibake itu genuine, dikonfirmasi pemilik** — contoh:
  Extradimensional Cosmic Phenomenon → `"#0000遒ｧ"` memang begitu juga tampilannya di game. Wiki Fandom-nya
  sendiri membungkus nilai ini dengan `<nowiki>` di infobox (`Note Design = <nowiki>#0000遒ｧ</nowiki>`), tanda
  mereka pun sengaja menampilkan apa adanya. **Jangan "diperbaiki"/dinormalisasi** — tampilkan persis seperti
  di sumber data.

### Field tambahan ditemukan dari infobox Fandom (`arcaea.fandom.com`)

Dicek lewat API `action=parse&prop=wikitext` (bukan render HTML — infobox `{{Song}}` berisi field terstruktur).
Field yang **sudah** bisa diisi dari `songlist.json` tapi belum ditampilkan sebelumnya: `side` (Light/Conflict)
dan `version` (string versi game) — sudah ditambahkan ke `admin-data.js`. Field yang **tidak ada** di sumber
massal manapun yang kita punya (hanya ada per-lagu di infobox Fandom, tidak ada file JSON massal yang
ditemukan): **Length** (durasi lagu, mis. "2:39") dan **Note Combo** (jumlah note per difficulty — ini yang
tadinya direncanakan sebagai `note_count` di Task 1.3). Kalau dua field ini penting, perlu dicek dulu apakah
Fandom punya file data massal serupa `Data:ChartConstant.json`, atau terima bahwa isiannya manual per-lagu.

**Hak cipta:** ini data resmi hasil ekstraksi, bukan data kita. **Jangan commit ke git** — sudah masuk
`.gitignore` (`/data/`). Boleh dipakai sebagai referensi/sumber import lokal, tapi jangan didistribusikan ulang
dari repo Celestl.

## Data dan hak cipta

- **Jacket art — 563/563 lagu (semua) sudah ada gambarnya di `data/jackets/<id>.jpg`** (lokal, gitignored,
  TIDAK dipublikasikan). Sumber akhirnya BUKAN lagi Fandom (`data/wiki-song.html`, fuzzy-match judul — cara
  lama, masih disimpan sebagai referensi tapi sudah digantikan): ditemukan konvensi nama file resmi di
  `Module:SongData` milik `arcaea.miraheze.org` — `File:Songs <id>.jpg`, dikunci ke `id` lagu internal, bukan
  judul tampilan, jadi tidak ada lagi ambiguitas fuzzy-match. Di-resolve lewat MediaWiki API
  (`/w/api.php?action=query&prop=imageinfo`) sama seperti pack art di bawah. Ini juga menyelesaikan 2 kasus
  yang dulu belum pasti: `chateaudecartes`/`temptationgc` (dulu tidak ketemu sama sekali di Fandom) dan ambiguitas
  "Mirror" — ternyata `hallofmirrors` dan `mirrorrmx` memang dua lagu terpisah dengan jacket masing-masing,
  bukan satu lagu yang perlu dipilih salah satu.
  `admin-dashboard.html` memakainya otomatis saat dibuka lokal (CSS multi-background, path relatif
  `../data/jackets/<id>.jpg` dari `design/` — **path ini sempat salah**, dulu `jackets/<id>.jpg`, mengira folder
  gambar ada di `design/jackets/` padahal di `data/jackets/`, jadi tidak pernah ketemu saat pemilik coba).
  Publikasi artifact tetap pakai placeholder gradien karena folder `data/` tidak ikut terpublikasi.

- **Pack art — 62/62 pack asli (semua) sudah ada gambarnya di `data/packs/<pack_id>.png`** (lokal, gitignored).
  Sumbernya BUKAN scraping halaman wiki (Fandom pack-list memblokir akses otomatis, dan halaman Miraheze-nya
  cuma transclude tiap pack sendiri-sendiri) — tapi lewat `Module:SongData` di `arcaea.miraheze.org`, yang
  mengungkap pola nama file resmi: `File:Pack <id>.png`, atau `File:Pack small_<id>.png` kalau pack itu punya
  flag `small_pack_image` di `packlist.json`. Nama file itu di-resolve ke URL CDN asli lewat MediaWiki API
  (`/w/api.php?action=query&prop=imageinfo`, endpoint-nya di `/w/api.php` bukan `/api.php`) — proses ini bisa
  diulang untuk wiki MediaWiki mana pun yang punya pola nama file serupa.
  Pack dengan `pack_parent` (mis. `eden_append_1`, "chapter tambahan" dari pack `eden`) tidak punya gambar
  sendiri — disalin dari gambar pack induknya, sesuai cara game menampilkannya (chapter tambahan muncul di
  bawah banner pack utamanya). Di mockup, chapter ini (`.chaptertag`) awalnya cuma teks polos walau filenya
  sudah ada — diperbaiki supaya ikut menampilkan gambar (background-image + overlay gelap), karena datanya
  memang sudah lengkap, cuma belum disambungkan ke UI.
  `extend_2`/`extend_3`/`extend_4` (arsip "World Extend" lama) sempat tidak ketemu lewat konvensi
  `Pack [small_]<id>.png` biasa — ternyata nama filenya pakai **spasi**, bukan underscore
  (`Pack small extend 2.png`, `Pack extend 4.png`), ditemukan dengan membaca wikitext mentah halaman
  "World Extend" (`action=raw`). Setelah itu ketiganya juga ketemu — jadi 62/62 pack asli lengkap.

### Bug nyata ditemukan & diperbaiki: `jacket()` bisa menghasilkan `undefined` dan merusak SELURUH background

Ditemukan dari laporan pemilik: puluhan pack/lagu yang filenya sudah ada di disk tetap tidak menampilkan
gambar. `jacket(t)` membuat gradien fallback dari hash judul: indeks warna kedua dihitung lewat `(h>>4)`
(signed right-shift). Untuk hash besar (h ≥ 2^31 — wajar untuk judul panjang), `>>` menghasilkan angka
**negatif**, dan `%` di JavaScript (beda dari Python) tidak membungkus negatif ke rentang positif — jadi
indeks array bisa negatif dan `PAL[b]` jadi `undefined`. Karena `jacketLayers()`/`packLayers()` menggabungkan
`url(gambar-asli)` dan gradien fallback dalam SATU deklarasi `background` (shorthand multi-layer), satu token
`undefined` di layer kedua membuat **seluruh** deklarasi ditolak browser — termasuk layer `url()` yang valid,
jadi gambar asli yang sudah ada di disk pun ikut tidak tampil. Diverifikasi: 28 dari 40 judul lagu yang
dilaporkan pemilik memang menghasilkan indeks negatif dengan algoritma hash ini. Diperbaiki dengan `(h>>>4)`
(unsigned right-shift) supaya hasilnya selalu non-negatif. Pelajaran: jangan pernah menggabungkan nilai
hasil komputasi ke dalam CSS shorthand tanpa memastikan setiap bagiannya valid — satu bagian salah merusak
semua layer lain dalam deklarasi yang sama.

### Keputusan UI: tinggi kartu Pack menyesuaikan bentuk KONTEN ASLI png, lebar tetap

Awalnya kartu Pack dipaksa ke kotak tetap (168×150, `background-size:cover`) — gambar pack yang potret vs
lanskap sama-sama di-crop paksa ke rasio itu, jadi bagian pentingnya kadang terpotong. Sempat dicoba membuat
LEBAR kartu (`.packcard`) ikut menyesuaikan juga (bukan cuma tinggi), tapi **dibatalkan atas permintaan
pemilik** — kembali ke lebar kartu tetap 168px, cuma tinggi (`.pack`) yang menyesuaikan lewat `aspect-ratio`,
seperti rancangan pertama.

Yang berubah dari rancangan pertama: rasio tinggi sekarang diambil dari **bounding box piksel non-transparan**
tiap PNG (dihitung offline dengan Python/PIL, `im.split()[-1].getbbox()` pada versi RGBA — lihat
`REAL_PACK_TRIM` di `admin-data.js`), BUKAN ukuran kanvas penuh file (`naturalWidth`/`naturalHeight` dari
`<img>`, yang dipakai di percobaan pertama). Alasannya: beberapa PNG py kanvas lebih besar dari isi gambar
sesungguhnya — sisa area transparan dari proses render vector→PNG yang tidak terpakai (ditemukan pada
`extend_2.png`/`extend_3.png`: kanvas 442×525 tapi konten asli cuma 394×459 — ~48px kosong di tiap pinggir).
Kalau dipakai ukuran kanvas penuh, kartu untuk pack itu jadi terlihat punya spasi kosong di bawah/sampingnya
dibanding pack lain yang py konten memenuhi kanvasnya. Semua 62 pack asli sudah diukur sekali dan hasilnya
ditempel statis ke `REAL_PACK_TRIM` (object `{id:[trimmedWidth,trimmedHeight]}`) — jadi tidak perlu JS
`<img>`-probing saat runtime lagi, cukup `btn.style.aspectRatio = trimmed[0]+'/'+trimmed[1]`.

### Bug nyata ditemukan & diperbaiki: animasi transisi view bisa macet di `opacity:0`

Ditemukan saat preview pakai gambar asli (render headless untuk pemilik). `goto()` memakai double-`requestAnimationFrame`
untuk menghapus kelas `.pre-enter` (fade-in). Di beberapa kondisi (headless, tab background, dll.) rAF
berantai itu tidak pernah terpanggil, jadi kelas `.pre-enter` (yang men-set `opacity:0`) **tidak pernah
terhapus** — halaman jadi kosong permanen walau HTML-nya sebenarnya terisi penuh. **Ini bukan cuma masalah
screenshot** — bisa kejadian ke pengguna asli juga kalau rAF browser mereka tertunda. Diperbaiki jadi rAF
tunggal + fallback `setTimeout(clear, 120)` supaya kelas itu dijamin terhapus. Kalau menulis animasi
serupa di implementasi Laravel nanti, **selalu pasang fallback timer**, jangan andalkan rAF/transisi sendirian
untuk sesuatu yang mempengaruhi visibilitas konten.
- **Kenapa mockup tidak menampilkan jacket asli, meski pemilik sudah tiga kali menanyakan:** masalahnya BUKAN
  "tahap data collection vs produksi", tapi **publikasi**. File `design/admin-dashboard.html` dipublikasikan
  lewat Artifact tool ke server Anthropic (claude.ai) — begitu file itu berisi gambar jacket resmi, itu jadi
  penyebaran ulang aset berhak cipta lowiro, terlepas dari niat pemakaiannya. Menyimpan gambar jacket **secara
  lokal** di `data/` (gitignored, tidak pernah dipublikasikan) sah-sah saja untuk referensi pribadi pemilik.
  Mockup sudah disiapkan mendukung ini: `jacket(id,...)` di `admin-data.js`/`admin-dashboard.html` mencoba
  memuat `jackets/<song_id>.jpg` dulu via CSS multi-background, baru jatuh ke gradien placeholder kalau file
  itu tidak ada (404) — murni kapabilitas kode, Claude tidak mengambil/menyimpan gambar apa pun ke folder itu.
  Kalau pemilik menaruh file jacket miliknya sendiri di situ dan membuka file HTML-nya **secara lokal** (bukan
  lewat link yang dipublikasikan), gambar asli akan tampil. Begitu Celestl jadi aplikasi Laravel yang di-hosting
  sendiri untuk pemakaian pribadi, itu keputusan dan risiko pemilik sendiri — bukan sesuatu yang diputuskan
  Claude sepihak sekarang.

- Chart constant diambil dari wiki komunitas. Simpan sumber dan versi game di data (`source`, `game_version`).
- **Sumber CSV belum dicari.** Saat Task 1.3, cari dan susun sendiri dari wiki komunitas, lalu minta pemilik memverifikasi angkanya sebelum dipakai. Jangan anggap hasil pencarian otomatis benar.
- **Jangan commit file jacket art atau aset game**, termasuk gambar Best 50 contoh (berisi jacket art). Folder aset lokal masuk `.gitignore`.
- Jangan pakai logo resmi game atau branding lowiro di UI.
- Untuk sekarang **simpan data hasil parsing saja, bukan gambarnya**. Menyimpan jacket art boleh dipertimbangkan nanti, tapi jangan sekarang dan jangan pernah di-commit ke repo.

### Skema `songs`/`charts`/`packs` (Task 1.2 — selesai, lihat `web/database/migrations/`)

Tabel admin Songs & Charts sengaja disederhanakan jadi level-lagu saja (detail per-difficulty pindah ke halaman
detail). Kolom final yang sebenarnya dipakai (beberapa berbeda dari rencana awal Task 1.2 di TASKS.md — lihat
alasannya di masing-masing):

- `packs` adalah **tabel sendiri**, bukan kolom string `pack` di `songs` seperti rencana awal — dibutuhkan
  untuk pengelompokan per kategori (`section`) dan relasi chapter/append (`parent_id`, dari field
  `pack_parent` di `packlist.json`) yang admin mockup sudah pakai. `songs.pack_id` adalah FK nullable ke sini.
- `songs.composer` (string nullable) — berbeda dari `artist`; satu lagu bisa punya artist (kolaborasi
  vokal/alias) dan composer berbeda. **Masih belum ada sumber data massal**, selalu null untuk sekarang.
- `songs.jacket_designer` — **dipindah ke `charts.jacket_designer`** (per-chart, bukan per-lagu), karena
  `songlist.json` memang menyimpannya per `difficulties[]`, bukan per lagu — lihat § Data resmi ditemukan.
  `songs.jacket_designer` tetap ada sebagai kolom (untuk kasus lain di masa depan) tapi tidak diisi importer.
- `songs.released_at` — **ada sumbernya** sekarang (field `date`, unix epoch, di `songlist.json`), jadi tidak
  lagi placeholder "—" seperti catatan lama di sini. Diisi oleh importer Task 1.3.
- `songs.side`, `bpm`, `length`, `version` — ditambah di luar rencana awal Task 1.2 (tidak disebut di
  TASKS.md), tapi dibutuhkan panel detail Songs & charts yang sudah dibangun di mockup. Semua string (bukan
  numerik) karena sumbernya memang string (`bpm` bisa rentang `"180-300"`, `length` format `"m:ss"`).
- `charts.difficulty` — string + PHP backed enum `App\Difficulty` (method `fromRatingClass()` menerapkan
  aturan `ratingClassAlias===1` → paksa INS yang sudah dikonfirmasi di § Data resmi ditemukan), bukan kolom
  `enum` native MySQL, supaya gampang diubah nanti tanpa migration ALTER TABLE.
- `charts.level` — string, bukan integer, karena bisa `"?"` untuk lagu April Fools (`rating` di
  `songlistothers.json`), jangan pernah coba di-parse sebagai angka.

## Rencana jauh: tooling untuk charter unofficial

Pemilik berencana menambah fitur yang membantu charter unofficial (pembuat chart fan-made) mendapatkan info chart
resmi — biasanya disimpan sebagai file `.aff` (plaintext, satu file per difficulty). **Belum ada spesifikasi resmi
dari lowiro**; yang ada hanya hasil reverse-engineering komunitas (contoh: ekstensi VSCode
`vscode-arcaea-file-format`, parser Python `pycade`, `ArcaeaChartRender`). Celestl sendiri **belum punya data
`.aff` apa pun**. Jangan mengarang sintaks `.aff`; gali ulang dari proyek-proyek itu saat fitur ini benar-benar
dikerjakan, dan verifikasi dengan pemilik. Testing Tools di admin baru berupa mockup antarmuka, belum fungsional.

**Desain upload/download chart file** (mockup di panel detail Songs & charts): **diputuskan satu file per
lagu** (bukan per-difficulty) — satu `.zip` berisi semua `.aff` difficulty lagu itu. Awalnya sempat dibuat
per-difficulty (tombol di tiap baris tabel), tapi dipindah karena dua alasan: (1) kolom tambahan bikin tabel
butuh scroll horizontal untuk ditemukan — gampang terlewat; (2) satu zip per lagu lebih sederhana. Section
"Chart files" ada **di luar tabel**, di bawahnya, dan **cuma muncul saat mode edit** (lihat § mode lihat vs
edit di atas) — di mode lihat tidak ada sama sekali. Upload memakai `<input type=file accept=".zip">` asli
(nama file tersimpan di state sesi), tapi **download sengaja permanen nonaktif** — sandbox artifact publish
tidak mengizinkan unduhan file sama sekali, dan tidak ada gunanya tombol terlihat aktif tapi tidak melakukan
apa-apa saat diklik. Saat diimplementasikan sungguhan (bukan mockup), file `.zip`/`.aff` perlu disimpan di
object storage (S3-like), bukan kolom database — catat ini saat task penyimpanan file dibuat nanti.

## Rencana jauh: multi-game identity (dampak ke skema `users`)

Saat Rotaeno (atau game lain) menyusul, identitas in-game per game bisa berbeda bentuk (Arcaea: Player ID 9 digit
+ nickname; game lain mungkin UUID atau format lain). Rekomendasi arsitektur — **belum diimplementasikan**,
didiskusikan dulu sebelum Task 1.2/2.1 karena mengubahnya belakangan berarti migrasi data akun:

- `users`: akun Celestl itu sendiri (id, timestamps). Tidak menyimpan identitas game apa pun langsung.
- `game_identities`: `user_id`, `game_id`, `identifier_type` (mis. `player_id`, `uuid`), `identifier_value`,
  `display_name` (nickname, mutable), `verified_at` nullable. Satu user bisa punya banyak baris — satu per game.
- Login tetap tanpa password: cari `game_identities` berdasar `(game_id, identifier_value atau display_name)`,
  lalu masuk ke `users` pemiliknya.
- `games` dapat kolom konfigurasi (mis. JSON `identity_schema`: label field, format/regex, contoh) supaya
  menambah game baru tidak perlu mengubah kode form register — cukup data. Ini **bukan EAV penuh** (kolom
  database dinamis sungguhan terlalu rapuh untuk Laravel); hanya identitas yang dikonfigurasi, bukan semua
  struktur tabel `games`.

Untuk sekarang (Arcaea saja), ini bisa diterapkan sejak awal dengan hanya satu baris `game_identities` per user
tanpa menambah kerja berarti, atau ditunda sampai Rotaeno mulai — pemilik yang memutuskan kapan mulai.

### UX multi-game untuk konten lagu (bukan cuma identitas user)

Field di panel detail Songs & charts sekarang **spesifik Arcaea**: `side` (Light/Conflict/dst — konsep ini
mungkin tidak ada di Rotaeno), notasi difficulty (PST/PRS/FTR/BYD/ETR/INS — game lain pasti beda nama/jumlah),
dan rumus constant. Memaksakan kolom Arcaea ini ke game lain nanti akan rapuh. Mockup sudah dikasih stub kecil
(dropdown "Arcaea" di header Songs & charts, saat ini cuma satu pilihan) sebagai penanda visual bahwa halaman
ini terikat ke satu game — belum ada logikanya.

Rekomendasi arsitektur (samakan pola dengan § multi-game identity di atas — konfigurasi per game, bukan kolom
kode terpisah per game): `games` dapat kolom skema konten (field apa saja yang relevan untuk game itu, nama
difficulty-nya apa) sehingga panel detail bisa dirender dinamis dari konfigurasi, bukan di-hardcode per game di
kode. Charts/songs tetap satu tabel (sudah multi-game dari Task 1.2), tapi kolom yang sifatnya spesifik-game
(seperti `side`) sebaiknya disimpan sebagai data fleksibel (mis. JSON `metadata` per chart/song) bukan kolom
tetap di skema, supaya menambah game baru tidak perlu migration baru untuk tiap field unik yang dimilikinya.
**Ini rekomendasi, belum keputusan** — didiskusikan lagi saat Rotaeno benar-benar mulai dikerjakan.

## Cara kerja

- Kerjakan task di `TASKS.md` satu per satu, berurutan.
- Setiap task: rencanakan dulu, tulis test, implementasi, jalankan test, lalu ringkas perubahan.
- Satu task = satu commit dengan pesan jelas. (Direktori ini belum menjadi git repo.)
- Rating engine wajib lolos semua nilai uji di atas sebelum dipakai fitur lain.
- Jangan mengarang aturan game yang tidak tertulis di sini; tanyakan dulu.

## Desain

Figma: https://www.figma.com/design/d8ocCh1gZxowu3CgBK9vOd/Celestl (halaman "Page 1"; frame utama `Mobile App` 277:29, `Home Page` desktop 277:31, `Rating Calculator` 34:8). Baca desainnya lewat Figma MCP sebelum membangun halaman UI.

Yang sudah ada di desain: splash/sapaan karakter, pilih game, daftar lagu (pencarian, grid jacket, pengelompokan pack), state "tidak ditemukan", detail lagu (BPM, panjang, tabel level/constant/notes per difficulty), halaman kalkulator + hasil (rentang skor dan potential), dan satu layar riwayat. Tema gelap navy di mobile; desktop punya sidebar Songs / Packs / Calculator dan breadcrumb.

Yang **belum** ada di desain: register/login/profile, Top 50, upload dan riwayat Best 50, admin. Desain untuk itu perlu dibuat atau diputuskan dulu sebelum dibangun.

Catatan: desain memakai logo resmi Arcaea/Rotaeno dan jacket art sebagai placeholder. Itu bertentangan dengan aturan di atas, jadi jangan ikut dibawa ke kode/repo; pakai teks atau placeholder netral. Desain juga memuat Rotaeno dan hanya difficulty Past/Present/Future; Rotaeno ditunda dan Beyond/Eternal belum tergambar.

### Palette (disampel dari render per-layar Figma)

Ambil warna dengan me-render **frame layar satu per satu** (`get_screenshot` + `contentsOnly`), jangan dari
tangkapan layar board — warna kanvas Figma (`#1E1E1E`) ikut tersampel dan hasilnya salah.

| Token | Hex | Asal di Figma |
|---|---|---|
| bg | `#0C0C22` | latar semua layar |
| card | `#1A1D32` | kartu besar di Song Detail |
| card-alt | `#1E203A` | kartu daftar di History Page |
| violet | `#16133E` | sel data tabel difficulty |
| lav | `#3F3C68` | sel label tabel difficulty |
| badge | `#7B5D85` | badge bulat di History Page |
| text | `#FFFAFA` | teks utama |

Warna difficulty (dipakai sebagai **warna teks**, bukan chip terisi): Past `#03A8E6`, Present `#ACFF82`,
Future `#F768DD`. Titik warna di Song Detail: `#4CAED1`, `#ACFF82`, `#F768DD`.
**BYD, ETR, dan INS belum punya warna** — desain hanya menggambar tiga difficulty. Jangan mengarang; tanyakan dulu.

### Bahasa visual Figma (ikuti ini)

- Kartu dipisahkan lewat **isian warna, bukan garis tepi**. Hindari `border: 1px` di mana-mana.
- **Radius besar dan lembut**: ~24px untuk kartu utama, ~16px untuk kartu daftar. Tidak ada sudut terpotong (chamfer).
- Tombol sekunder memakai gaya **garis putus-putus** seperti "Drop Image". Tidak ada tombol gradien.
- **Font (dikonfirmasi dari Figma lewat `get_design_context`, bukan tebakan):** Poppins Medium untuk nama aplikasi/wordmark, Exo 2 (Regular/SemiBold) untuk semua teks lain — label, body, data. Keduanya ada di Google Fonts, tidak perlu unduh file .ttf.
- Format skor pakai tanda petik **lengkung** (`’` / U+2019), bukan lurus: `09’998’593`.
- **Desktop berbeda dari mobile:** frame desktop memakai panel utama **terang** (`#F8F8F6`) di atas latar navy `#0D112A`, sidebar abu hangat `#686766`, menu aktif `#3C3837` dengan teks `#FFFFD1`, kolom pencarian teal `#4CAED1`, dan kartu `#615F71`. Halaman admin mengikuti frame desktop ini, bukan gaya mobile.
- Angka skor ditulis gaya Arcaea: `09'998'593`. Baris data memakai pola `key : value`.

### Referensi UI: ArcaeaNap (bukan sumber data/aset)

https://github.com/doldamul/ArcaeaNap — aplikasi desktop personal (PyQt6) yang mengambil data lewat automasi
login ke akun Arcaea Online resmi, **bukan OCR, bukan rekreasi layar PTT resmi**. Fiturnya murni viewer riwayat
main (playtime, most played), tidak menghitung rating — jadi tidak tumpang tindih dengan inti Celestl.

Yang **dipakai** sebagai referensi dari UI-nya (pola layout, bukan warna/aset):
- Satu angka besar sebagai hero stat (mis. Potential), bukan dipecah jadi banyak tile kecil.
- Breakdown per-difficulty sebagai daftar label:value berwarna teks — sudah sejalan dengan pola Figma kita.
- Leaderboard dengan badge rank diamond untuk 3 teratas.
- Kartu besar dan lapang untuk halaman ringkasan (Home), berbeda dari halaman kelola data yang boleh padat.

Yang **tidak** dipakai, dan jangan ditiru sesi mendatang: panel kiri ArcaeaNap menanam langsung screenshot
resmi Best 50 (jacket art + UI lowiro) di dalam kartunya. Itu melanggar aturan "jangan commit aset game" di
atas. Celestl tetap pakai placeholder gradien, bukan gambar asli, di mana pun.

### Mockup buatan sendiri

- `design/admin-dashboard.html` + `design/admin-data.js` — dashboard admin. **Packs** sekarang dikelompokkan
  per kategori (Arcaea/Main Story Act I & II/Side Story/Collaboration/Variety/Other, dari field `section` di
  `packlist.json`) dengan pita label vertikal per baris, dan pack yang punya chapter tambahan (`pack_parent`)
  menampilkan strip di bawah kartunya — meniru **struktur** (bukan tema warna) dari
  `arcaea.miraheze.org/wiki/Pack_list`. Struktur menu: Home, Packs,
  Songs & charts, Users, Game management, Activity log, CSV import, Testing tools. Packs & Songs & charts
  memakai **data asli 553 lagu/62 pack** dari `admin-data.js` (hasil gabung `data/songlist.json` +
  `data/packlist.json` + `data/chartconstant.json`), bukan contoh karangan. Songs & charts berupa
  **master-detail**: list bisa dicari di kiri (tanpa filter difficulty — sempat ada, dihapus atas permintaan
  pemilik), panel detail permanen di kanan punya **mode lihat (default) vs mode edit** — field tidak langsung
  bisa diketik, perlu klik tombol pensil "Edit" dulu baru berubah jadi input/select; "Save"/"Cancel" kembali
  ke mode lihat (prototipe saja — belum tersambung backend, tidak ada yang benar-benar tersimpan). Klik pack → Songs & charts
  terfilter ke pack itu (chip bisa dihapus); klik lagu di leaderboard Home → Songs & charts dengan lagu itu
  dicari. "Needs review" = antrean item yang butuh keputusan admin (nickname Best 50 tidak cocok, baris CSV
  gagal, lagu tak dikenali OCR) — difilter dari Activity log, bukan kotak terpisah. Unggahan Best 50 adalah
  salah satu tipe entri di Activity log (bukan menu sendiri). Tombol "+ Add song" (Songs & charts) dan
  "+ Add pack" (Packs) membuka **modal** (bukan inline-edit seperti panel detail) berisi form kosong, karena
  ini membuat entri baru, bukan mengubah yang sudah ada — juga prototipe, "Save" cuma menutup modal. Modal
  "Add song" sengaja diminimalkan ke **4 field saja**: Song name, Artist, **Pack** (dropdown wajib pilih,
  dikelompokkan per kategori dengan `<optgroup>`, termasuk pack chapter/append seperti "Lasting Eden Chapter 2"
  karena lagu memang bisa masuk langsung ke situ — lihat admin-data.js), dan **Jacket art** (upload gambar,
  preview kecil 40×40 lewat `URL.createObjectURL`) — field lain (BPM, side, length, difficulty, level,
  constant, dll.) sengaja TIDAK ada di form ini, diisi belakangan dari panel detail sesudah lagunya dibuat.
  Modal "Add pack": Pack name, **Category** (dropdown ke 7 pita label yang sama dengan halaman Packs),
  **Parent pack** (opsional, untuk chapter/append — gambar ikut pack induk), checkbox "small pack image"
  (menandai pack yang nama filenya pakai awalan `small_` di wiki, lihat § Pack art).
  **Bug kecil yang sempat kejadian:** `.modal` py `overflow-y:auto` tapi tidak ikut disebut di selector
  scrollbar custom (`html, body, .songlist, .detailpanel, .lb, .side, .scroll`), jadi kalau isinya meluap dia
  jatuh ke scrollbar bawaan browser — tidak konsisten dengan halaman lain. Ditambahkan ke daftar selector;
  karena latar modal (`--card`) beda dari elemen lain di daftar itu (`--bg`), track/thumb-nya dikasih aturan
  terpisah (`.modal::-webkit-scrollbar-track{background:var(--card)}` dst.) supaya tetap menyatu dengan latar
  modal, bukan ikut warna `--bg` yang lebih gelap.
  **Lightbox jacket art:** preview upload di modal "Add song" diperbesar (40px → 120px) dan jacket di panel
  detail (`.djk`, mode lihat maupun edit) sama-sama bisa diklik untuk diperbesar penuh — class `.zoomable`
  dipasang lewat **delegasi klik** di `document` (bukan listener per-elemen), supaya otomatis kepasang lagi
  tiap kali `renderDetail()`/modal-nya dirender ulang tanpa perlu re-wire manual. Lightbox menampilkan jacket
  dalam rasio 1:1 (ukuran asli file jacket, 768×768 — beda dari `.djk` di panel detail yang sengaja dipotong
  ke 16:9 supaya pas sebagai banner), dan background CSS-nya dibaca langsung dari `style.background` inline
  elemen yang diklik (sudah berisi `jacketLayers()`/gradient fallback atau `url()` hasil upload lokal) — jadi
  lightbox selalu menampilkan persis apa yang terlihat di thumbnail, bukan sumber terpisah yang bisa beda.
- `design/account-top50.html` — alur Sign in / Register / Profile dan halaman Top 50.

Keduanya dibuat karena desain Figma belum mencakup halaman itu. Teks UI di mockup memakai bahasa Inggris; keterangan di luar bingkai ponsel berbahasa Indonesia dan bukan bagian dari produk.
