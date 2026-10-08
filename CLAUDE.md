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
| INS | `#7474DC` | diturunkan dari `.ins-txt` wiki (`#0000CD` MediumBlue) — hue 240 dipertahankan, lightness/saturasi disesuaikan agar kontrasnya sepadan dengan warna difficulty Celestl lainnya |

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

**Sudah diperbaiki (keputusan pemilik: "samakan dengan Celestl").** INS lama `#0000CD` kontrasnya 1.72 —
praktis tidak terbaca, dan terbukti jelek begitu tabel detail lagu benar-benar dibangun. Sekarang
**`#7474DC`**: hue tetap 240 (identitas biru MediumBlue-nya dipertahankan), tapi lightness 66% dan saturasi
diturunkan ke 0.60 sehingga kontrasnya **4.83 terhadap `--bg`** dan **4.41 terhadap `--violet`** — persis
sepadan dengan BYD (4.84/4.41) dan sedikit di atas ETR (4.74/4.32).

**Kenapa harus turun saturasi, bukan cuma dinaikkan lightness-nya:** biru murni (hue 240, S=1.0) tidak pernah
mencapai kontras 4.7 walau lightness dinaikkan sampai 68% (cuma 4.06), karena rumus luminance WCAG memberi
bobot 0.0722 ke channel biru dan 0.7152 ke hijau. Satu-satunya cara menaikkan luminance biru adalah
mencampurkan channel lain, yaitu menurunkan saturasi. Pola ini berlaku juga untuk warna merah murni — lihat
kasus BYD di atas.

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
  **Terverifikasi dengan angka (Oktober 2026, atas pertanyaan pemilik):** 17 lagu benar-benar punya
  `jacketDesigner` berbeda antar-difficulty, hampir semuanya di slot Beyond (mis. GOODTEK → PST/PRS/FTR
  "Koyama Mai", BYD "出前"; qualia → BYD "khronetic -synesthesia-"). Jadi per-chart itu memang perlu, bukan
  over-engineering. Sudah ditampilkan di tabel detail lagu publik sebagai kolom "Jacket design".
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

**Beda dengan § Unofficial di bawah:** section ini soal charter unofficial men-download `.aff` **resmi**
sebagai referensi (masih mockup, belum dikerjakan). § Unofficial di bawah soal meng-upload `.aff` **buatan
sendiri** ke private server — sudah mulai dikerjakan, fitur yang beda meski sama-sama soal `.aff`.

## Unofficial: segmen private server (katalog custom chart)

Arah baru yang dikonfirmasi pemilik: Celestl bukan cuma OCR Best 50 — ada segmen kedua, **"Unofficial"**,
yang dikelola pemilik sendiri lewat **private server Arcaea** (server pihak ketiga, bukan punya lowiro) buat
chart buatan sendiri/komunitas. Istilah yang dipakai pemilik: **"OCR"** = app web/mobile Celestl yang sudah
direncanakan dari awal (data resmi + upload Best 50), **"Private Server"** = server game terpisah yang
dijalankan sendiri. Keduanya terhubung, tapi datanya **sengaja dipisah total** — tidak pernah campur
query/ranking dengan katalog resmi (`songs`/`charts`, Task 1.2/1.3).

**Clone referensi** (lokal, gitignored, lihat `.gitignore`): `Arcaea-server/` (`Lost-MSth/Arcaea-server`,
basisnya) dan `ArcaeaServerFork/` (`IoIiro/ArcaeaServerFork`, patch komunitas di atasnya — dukungan versi
client lebih baru). Keduanya Python/Flask + **SQLite murni** (`sqlite3` stdlib dipakai langsung di 28+ file,
bukan lewat ORM) — lihat `data/server-arcaea.md` buat link asalnya, dan percakapan sesi ini buat riset skema
yang sudah dilakukan (lihat § Skema private server yang sudah dipetakan di bawah kalau perlu diringkas ulang).

**Kenapa server ini tidak bisa "baca database yang sama" secara harfiah dengan Celestl:** sqlite3 dipakai
langsung di puluhan file, bukan lewat abstraction layer — ganti ke MySQL berarti fork + rewrite besar ke kode
orang lain, bukan sekadar ganti connection string. **Keputusan: Celestl buka koneksi DB kedua (read-only)**
langsung ke file SQLite-nya buat baca `best_score`/`user` nanti (skor pemain) — belum dikerjakan, masih di
tahap langkah berikutnya setelah fitur upload ini.

**Prinsip penting:** jangan percaya kolom `rating`/grade bawaan private server buat perhitungan — sudah
dicek, ambang grade-nya beda dari yang sudah tervalidasi Celestl dari gambar resmi (mis. grade C mulai
8.600.000 di sana, 8.800.000 di Celestl). Private server diperlakukan murni sebagai **sumber skor mentah**
(score, clear_type, song_id, difficulty); Celestl yang hitung ulang rating pakai rumus sendiri (Task 2.1,
rating engine — **belum dibangun**, jadi perlu duluan karena dipakai 2 jalur: OCR & Unofficial).

### Fitur pertama yang dikerjakan: upload custom chart (`/admin/unofficial`)

Katalog lagu di private server itu **benar-benar custom** (chart buatan sendiri/komunitas), bukan subset data
resmi — makanya tabelnya (`unofficial_songs`, `unofficial_charts`) terpisah total dari `songs`/`charts`,
bukan nambah kolom "is_custom" atau semacamnya ke tabel resmi.

- `unofficial_songs`: `slug` (dipakai juga sebagai `song_id` di private server nanti, bebas pilih asal unik),
  `title`, `artist` nullable.
- `unofficial_charts`: per `unofficial_song_id` + `difficulty` (string, unique bareng). **Cuma 5 nilai
  diizinkan: PST/PRS/FTR/BYD/ETR** — bukan `App\Difficulty` penuh (yang punya INS) — karena skema `chart`
  bawaan private server dasar (`Lost-MSth/Arcaea-server`) cuma punya 5 kolom (`rating_pst/prs/ftr/byn/etr`),
  tidak ada slot INS. Kolom lain: `constant` decimal(4,1) nullable, `aff_original_filename`,
  `aff_storage_path`, `pushed_at` nullable (disiapkan buat nanti, belum dipakai).
- File `.aff` disimpan di disk `local` Laravel (`storage/app/private/unofficial-charts/<slug>/<difficulty>.aff`).
  **Ini AMAN disimpan di Celestl** — beda dari larangan simpan jacket/aset resmi di § Data dan hak cipta,
  karena ini chart buatan sendiri/komunitas, bukan aset asli lowiro.
- Halaman admin: `web/resources/js/pages/admin/unofficial.tsx`, menu sidebar sendiri ("Unofficial" group,
  bukan digabung ke "Content") — lihat `AdminLayout`. Form per-difficulty: constant + upload `.aff`, upsert
  (upload ulang di difficulty yang sama meng-update, bukan duplikat).
- **Belum terhubung ke server beneran** — baru tersimpan di Celestl. Langkah berikutnya (belum dikerjakan):
  push ke private server, lewat **API admin bawaan mereka** yang sudah ditemukan saat riset —
  `POST /songs` / `PUT /songs/<id>` dengan body `{song_id, name?, charts:[{difficulty, chart_const}]}` buat
  constant (butuh token admin dari server itu, **tidak perlu tulis SQLite langsung**) — dan menaruh file
  `.aff` langsung ke `database/songs/<song_id>/<difficulty>.aff` di filesystem server (tidak ada endpoint API
  buat ini di kode dasarnya, jadi untuk sekarang selama masih satu mesin, ditulis langsung ke path itu).

### Keputusan presisi constant: tetap 1 digit

Pemilik sempat menanyakan constant 2 digit desimal buat custom chart. Hasil cek: batas 1 digit di private
server itu **pilihan desain kodenya** (constant disimpan `×10` sebagai integer di `core/song.py`; rumus
`calculate_rating` sendiri tidak mengasumsikan presisi apa pun, dan PTT keseluruhan malah sudah disimpan `×100`),
jadi bisa dipatch — tapi **diputuskan tetap 1 digit**, sama dengan data resmi game dan skema `charts` Celestl,
karena constant dipakai buat perhitungan rating/potential. Konsekuensi: `unofficial_charts.constant` tetap
`decimal(4,1)` dan validasi upload **menolak** lebih dari 1 desimal (`decimal:0,1`) alih-alih diam-diam
membulatkan.

### Menjalankan private server (6.2, sudah diverifikasi boot)

- Pakai **`ArcaeaServerFork`** (branch `main`, struktur datar: `main.py` di root) — yang `Arcaea-server` (`master`
  v2.12.1) bilang cocok sampai Arcaea 6.7.1, fork-nya mengklaim dukungan 7.0. **Versi client yang dipakai
  menentukan pilihan ini** — belum dikonfirmasi pemilik.
- Dependensi cuma 3 (`flask`, `cryptography`, `limits`). Venv sengaja **di luar repo**:
  `~/.venvs/arcaea-server` (`pip install -r ArcaeaServerFork/requirements.txt`).
- Config: buat `ArcaeaServerFork/config.py` berisi `class Config:` (override saja yang perlu). Default asli
  `PORT=80` dan `HOST=0.0.0.0` — di-override jadi `127.0.0.1:8765` (jangan 8080, di mesin pemilik sudah dipakai
  Adminer). Jalankan: `cd ArcaeaServerFork && ~/.venvs/arcaea-server/bin/python -B main.py`.
- Booting pertama otomatis bikin 4 file SQLite di `database/` (`arcaea_database.db`, `arcaea_log.db`,
  `arcaea_database_deleted.db`, `song_cache.db`) dan akun admin bawaan (`user_id` 2000000, nama `admin`) —
  **password default-nya wajib diganti** sebelum server bisa diakses teman (ada di wiki upstream).
- API admin: `POST /api/v1/token` body `{"auth": base64("<user_id>:<password>")}` → `{token, user_id}`; token
  itu dipakai buat `POST /api/v1/songs` (Task 6.3).
- `GET /` → `Hello World!` (cek hidup).

### Push ke private server (6.3, sudah diverifikasi ke server asli)

`PrivateServerPusher` (`web/app/Services/`), dipicu tombol "Push to server". Config di `config/celestl.php`
`private_server.*` ← env `ARCAEA_PRIVATE_SERVER_URL`, `_API_TOKEN`, `_SONGS_PATH` (default
`../ArcaeaServerFork/database/songs`). Fakta dari kode + uji ke server asli yang perlu diingat:

- **Auth:** header `Token`. Server punya `API_TOKEN` statis di `config.py` (kosong = nonaktif) yang berlaku
  sebagai role *system* — dipakai ini supaya Celestl tidak menyimpan password admin. Token itu setara akses
  penuh ke API admin server, jadi `.env`/`config.py`-nya jangan pernah di-commit (dua-duanya gitignored).
- **Respons API** selalu `{"code":0,"data":...,"msg":""}`; `code != 0` = error (mis. `-2` no data, `-4` data
  exist), HTTP status tetap 200 untuk error aplikasi, jadi **cek `code`, bukan status HTTP**.
- **`POST /system/operations/<nama>` wajib body JSON object `{}`** (server memanggil `request.get_json()` lalu
  `set_params(**...)`): tanpa body → 415, `[]` → gagal. Ini baru ketahuan setelah uji ke server asli — tes
  dengan server palsu (`Http::fake`) tidak bisa menangkapnya, makanya uji integrasi ke server asli penting.
- `PUT /songs/<id>` hanya mengubah difficulty yang dikirim; `POST` mengisi difficulty yang tidak dikirim
  dengan `-10` (unrank). Jadi chart tanpa constant tidak dikirim ke API (file `.aff`-nya tetap disalin).
- File `.aff` ditulis langsung ke disk server (tidak ada endpoint upload) → **hanya jalan kalau Celestl dan
  server satu mesin**. Kalau nanti beda mesin, perlu mekanisme lain (belum dirancang).

### Skema private server yang sudah dipetakan (dari riset `Lost-MSth/Arcaea-server`)

- `best_score(user_id, song_id, difficulty, score, shiny_perfect_count, perfect_count, near_count, miss_count,
  clear_type, best_clear_type, rating, score_v2, ...)` — `song_id`+`difficulty` (0=PST..4=ETR) pakai
  konvensi **sama persis** dengan `songlist.json` resmi/`ratingClass` Celestl, jadi join langsung cocok tanpa
  mapping manual kalau nanti baca tabel ini.
- `clear_type` (int) → lamp Celestl: `0=lost, 1=normal_clear, 2=full_recall (FC/Full Combo), 3=pure_memory
  (PM), 4=easy_clear, 5=hard_clear` — dari `core/score.py`.
- `chart(song_id, name, rating_pst, rating_prs, rating_ftr, rating_byn, rating_etr)` — tiap kolom rating
  adalah **`constant * 10`** (integer), bukan level tampilan. Diisi lewat tool bawaan `tools/update_song.py`
  (baca file `arcsong.db` terpisah) atau API `POST/PUT /songs` di atas.
- Song/chart data buat melayani client (`database/songs/songlist` + folder per-lagu berisi `.aff`) itu
  **terpisah** dari tabel `chart` (yang khusus constant) — private server sudah butuh salinan datanya sendiri
  dari awal buat jalan sebagai server, lepas dari Celestl.
- "Aku + beberapa teman" (bukan cuma lokal) → README resminya eksplisit minta **jangan taruh di internet
  terbuka** (belum ada uji keamanan). Saran: lewat VPN/jaringan privat (Tailscale dsb.), bukan port publik.

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
- **Frame desktop di Figma BUKAN acuan — dikonfirmasi pemilik, belum final.** Frame `Home Page` (277:31,
  1980×1080) memakai panel utama terang (`#F8F8F6`) di atas latar navy, sidebar abu hangat `#686766`, search
  teal `#4CAED1`, kartu `#615F71`. **Jangan dipakai.** Catatan lama di sini pernah menulis "halaman admin
  mengikuti frame desktop ini" — itu salah dan memang tidak pernah terjadi: admin yang dibangun gelap semua.
  **Keputusan pemilik: tema gelap di SEMUA ukuran layar**, satu palet (§ Palette di atas), konsisten dengan
  admin. Acuan desain cuma frame **mobile**; tata letak layar lebar diturunkan sendiri dari frame mobile +
  pola yang sudah ada di admin, bukan dari frame desktop itu.
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

### Port admin mockup ke Laravel/Inertia/React sungguhan (Task 5.1, sebagian ditarik maju)

`design/admin-dashboard.html` sedang diporting jadi halaman Inertia + React asli di `web/`, bukan lagi mockup
statis. Routing: route Inertia asli per halaman (`routes/admin.php`, prefix `/admin`) berbagi satu
`AdminLayout` (`web/resources/js/layouts/admin-layout.tsx`) — BUKAN port 1:1 dari pola `goto()` satu-halaman
mockup-nya (toggle `hidden` antar section), karena itu bukan pola Inertia yang lazim. Packs & Songs & charts
akan **DB-backed sungguhan** (dari skema + importer Task 1.2/1.3), bukan data statis seperti mockup — ini
permintaan eksplisit pemilik, bukan keputusan sepihak. Users/Game management/Activity log/CSV import/Testing
tools tetap statis/contoh (sistem aslinya — akun, importer CSV, `vision/` — belum ada), diporting belakangan.

Warna & font diekspos lewat Tailwind v4 `@theme` di `resources/css/app.css` sebagai token `--color-*`
(`bg-bg`, `text-pst`, dst) dan `--font-sans`/`--font-brand` (Exo 2 / Poppins, lewat mekanisme Bunny Fonts
starter kit yang sudah ada — gantiin Instrument Sans bawaan, bukan ditambah di sampingnya, karena
`body.font-sans` berlaku ke seluruh app).

**Bug nyata ditemukan & diperbaiki: `text-text` jadi no-op karena `--color-text` tidak pernah didefinisikan**
— semua teks yang warnanya diwariskan dari `text-text` (termasuk wordmark "CELESTL" dan nama user di topbar)
tampil HITAM, bukan putih, karena Tailwind v4 cuma generate utility class untuk token yang benar-benar ada di
`@theme`; token yang hilang bikin class itu senyap tidak digenerate sama sekali (bukan error build). Ketahuan
dari screenshot headless yang di-zoom pixel-per-pixel — pada ukuran penuh kelihatannya putih (ilusi optik dari
font tebal+kecil), baru jelas hitam setelah di-crop 3-4x. **Pelajaran: kalau warna custom Tailwind v4 terasa
"kadang tidak kena", curigai token `@theme` yang belum didefinisikan dulu**, bukan cuma masalah spesifisitas
CSS — dan jangan percaya screenshot ukuran penuh untuk soal warna teks kecil, selalu crop & zoom dulu.

**Gotcha lain:** komentar CSS multi-baris (`/* ... */` dengan baris lanjutan berawalan `*`, atau yang
mengandung apostrof `'`) bikin parser CSS pipeline proyek ini (Tailwind v4 lewat lightningcss) gagal/salah
parse di dalam blok `@theme` — satu kali error fatal ("Unterminated string"), satu kali lolos build tapi
dengan warning aneh. Sekarang dibiasakan: komentar CSS di `app.css` single-line saja, tanpa apostrof.

**Home, Packs, Songs & charts sudah DB-backed sungguhan** (`AdminHomeController`/`AdminPackController`/
`AdminSongController`), diverifikasi lewat database MySQL lokal hasil `celestl:import-arcaea-content` —
termasuk verifikasi end-to-end bahwa 4 chart legacy-INS Divine Oblivion (lihat § Data resmi ditemukan) tampil
biru (INS) yang benar, bukan merah (BYD), di tabel per-difficulty Songs & charts asli. Pack-filter dari Packs
→ Songs & charts (`?pack=<nama>`) juga sudah diverifikasi (klik "Divine Oblivion" → 8 lagu terfilter benar).

**Keputusan sengaja: mode edit TIDAK diporting dari mockup.** Mockup punya toggle mode lihat/edit (field jadi
`<input>`/`<select>` setelah klik pensil) sebagai cara menunjukkan niat desain, karena saat itu belum ada versi
"real" untuk dibandingkan. Sekarang yang "real" sudah ada tapi belum punya endpoint update — menampilkan UI
edit yang Save-nya tidak benar-benar menyimpan dianggap lebih menyesatkan (useless) daripada tidak
menampilkannya sama sekali, beda dari modal "Add song"/"Add pack" yang statusnya "prototipe" memang sudah
jelas dari labelnya sendiri. Edit mode menyusul begitu endpoint update sungguhan dibuat.

**Responsif: sudah dikerjakan** (permintaan pemilik, 3 kelas ukuran — laptop / tablet / smartphone).
Breakpoint yang dipakai: `lg` (1024px) memisahkan laptop dari tablet, `sm` (640px) memisahkan tablet dari HP.

- **Sidebar jadi drawer di bawah `lg`.** Di laptop tetap kolom tetap 224px dalam grid; di bawah itu jadi panel
  `fixed` yang digeser keluar layar (`-translate-x-full`) dengan tombol hamburger di header dan backdrop yang
  bisa diklik. **Wajib menutup dirinya sendiri saat navigasi** (`useEffect` pada `url`) — kalau tidak, drawer
  tetap menutupi halaman yang baru saja dibuka.
- Header: breadcrumb dipendekkan ("Admin ›" hilang di bawah `sm`), kolom pencarian pindah ke baris sendiri di
  HP (kalau dipaksa sebaris dengan breadcrumb, lebarnya tidak cukup untuk mengetik), nama user disembunyikan
  di bawah `md` dan hanya avatar yang tersisa.
- Songs & charts: master-detail `grid-cols-[1.5fr_400px]` jadi satu kolom di bawah `lg`.
- Home: dua panel atas jadi satu kolom di bawah `xl` (bukan `lg` — di 1024px masih terlalu sempit untuk dua).
- Packs: pita label vertikal (30px + gap) **diganti judul horizontal di bawah `sm`**. Itu bukan soal estetika:
  30px itu persis yang membuat baris turun dari 2 kartu jadi 1, dan 63 kartu potret dalam satu kolom adalah
  scroll yang sangat panjang. Kartunya sendiri jadi `w-[calc(50%-7px)]` di HP, bukan lebar tetap.
- Grid key/value 2 kolom (panel detail & modal) jadi 1 kolom di bawah `sm`.
- Tabel lebar (Users, CSV import, tabel difficulty di Songs & charts) sudah dibungkus `overflow-x-auto`
  sebelumnya, jadi tidak perlu diubah.

Diverifikasi lewat screenshot di 360 / 390 / 820 / 1440 px, termasuk kondisi drawer terbuka.

**Jacket/pack art di halaman asli: SUDAH jalan** (lihat § Gambar di aplikasi sungguhan di bawah). Catatan
lama di sini yang bilang "belum ada mekanisme untuk mengisi folder itu" sudah tidak berlaku sejak Task 1.3b —
sekarang ada `celestl:import-arcaea-images`, dan halaman tidak lagi menebak path melainkan menerima URL-nya
dari server.

### Halaman publik (Task 1.4) — `AppLayout`, bukan `AdminLayout`

Halaman pemain punya shell sendiri (`web/resources/js/layouts/app-layout.tsx`): header tipis + nav
Songs/Packs, konten `max-w-5xl`, footer "ver 1.xx". **Tema gelap di semua ukuran layar** (keputusan pemilik),
jadi `html` sendiri diberi `background: var(--color-bg)` + `color-scheme: dark` di `app.css` — supaya
overscroll dan sisa ruang di bawah halaman pendek ikut gelap, bukan putih bawaan browser.

Rute: `/` (daftar lagu, sekaligus landing page — `welcome.tsx` bawaan starter kit dihapus),
`/songs/{slug}`, `/packs`, `/packs/{slug}`. Controller publik (`SongController`, `PackController`) terpisah
dari `Admin\*` dan hanya mengirim field yang dibutuhkan pemain.

- **Seluruh katalog (563 lagu) dikirim sekali** ke browser lalu disaring di client, supaya pencarian instan
  tanpa round-trip per ketikan. Yang mahal bukan datanya tapi jumlah DOM node, jadi `SongGrid` cuma merender
  48 kartu dan menambah lagi lewat `IntersectionObserver` saat di-scroll.
- `Pack::SECTION_ORDER` sekarang satu-satunya sumber urutan section (dulu di-copy-paste di
  `AdminPackController` dan `AdminSongController`). Pack chapter/append tidak punya `section` sendiri — selalu
  ikut `parent->section`, di halaman publik maupun admin.
- **Tabel difficulty di detail lagu sengaja beda sumbu dari Figma.** Figma menggambar difficulty sebagai
  *kolom*, tapi cuma menggambar tiga; enam (PST..INS) tidak muat di layar HP seperti itu, jadi difficulty jadi
  *baris*. Warna sel tetap ikut desain: label `--lav`, data `--violet`. Kolom "Chart design" disembunyikan di
  bawah `sm` dan ikut menumpang di sel difficulty.

**Jangan dipakai sebagai acuan: frame desktop Figma (277:31) belum final** — kata pemilik sendiri. Satu-satunya
acuan desain adalah frame mobile; tata letak layar lebar diturunkan dari situ. Catatan lama di file ini yang
bilang "halaman admin mengikuti frame desktop ini" sudah tidak berlaku.

### Gotcha verifikasi: screenshot headless Chrome tidak bisa lebih sempit dari ~500px

`--window-size=390,...` **tidak** membuat viewport 390px — Chrome headless di Linux menjepit lebar viewport di
sekitar 500 CSS px dan screenshot-nya cuma dipotong ke 390. Akibatnya halaman terlihat seolah meluap
horizontal (kolom kanan grid terpotong, nav kepotong) padahal tidak ada masalah sama sekali. Ini sempat bikin
"memperbaiki" bug yang tidak ada. Cara cek sebenarnya: `document.documentElement.clientWidth` dari dalam
halaman. Cara screenshot yang benar untuk lebar HP: render halamannya **di dalam `<iframe>` selebar 390px**
dari sebuah file kecil yang di-serve dari origin yang sama (`public/_frame.html` sementara) — iframe punya
viewport sendiri, jadi media query dan layout-nya betul-betul jalan di 390px.


## Gambar di aplikasi sungguhan (Task 1.3b)

Pemilik bertanya kenapa gambar belum terpakai padahal file-nya sudah ada. Jawabannya: memang belum ada yang
memindahkannya. Sekarang ada.

**Keputusan pemilik: yang masuk database cuma PATH, bukan isi gambarnya.** Ditawari dua opsi (file di disk +
path di DB, vs BLOB 190MB di MySQL) dan memilih yang pertama. Alasannya dicatat di migration-nya: backup DB
tidak ikut berat, gambar dilayani web server (bisa di-cache browser) alih-alih lewat PHP tiap request.

- `celestl:import-arcaea-images` — **command terpisah** dari `celestl:import-arcaea-content`, sengaja: yang
  satu memindahkan ~190MB file, yang satu mengisi baris database. Tidak perlu ikut jalan tiap refresh data.
  Idempoten (lewati file yang sudah ada), `--force` untuk membangun ulang.
- Tujuan: `storage/app/public/{jackets,packs}/` + `thumbs/` di masing-masing. Butuh `php artisan storage:link`
  sekali (command-nya memperingatkan kalau belum).
- **Thumbnail 384px wajib, bukan optimasi belakangan.** Jacket asli 768×768 @300-600KB; satu layar grid lagu
  memuat puluhan sekaligus = ~20MB kalau pakai aslinya. Thumb jadi ~49KB. Aturan: **grid pakai thumb, halaman
  detail/lightbox pakai ukuran penuh.** Ini sempat salah di admin Songs & charts — daftar 563 barisnya
  memuat jacket ukuran penuh semua (~225MB) sebelum diperbaiki jadi thumb + `jacket_full` terpisah.
- Pack art tetap **PNG dengan alpha** (bukan dikonversi ke JPEG): transparansinya dipakai untuk mengukur
  bounding box konten. Di GD, alpha `127` = transparan penuh (7-bit), bukan 255 — dan `imagecreatetruecolor`
  harus diberi `imagealphablending(false)` + `imagesavealpha(true)` atau alpha-nya hilang diam-diam.
- Pack chapter/append (`parent_id`) tidak punya file sendiri di beberapa kasus → otomatis memakai file pack
  induknya, sama seperti cara game menampilkannya.
- `packs.image_trim_width/height` menyimpan ukuran konten non-transparan tiap pack art, dipakai sebagai
  `aspect-ratio` kartu pack — menerapkan keputusan lama pemilik (§ tinggi kartu Pack) ke aplikasi sungguhan,
  karena 57 dari 62 pack art itu potret 1:2 dan ter-crop parah kalau dipaksa ke kotak 168/150. Wadahnya perlu
  `items-start` (grid maupun flex), kalau tidak kartu yang pendek ikut meregang setinggi barisnya.

**Jangan tebak path gambar di React.** Dulu `url(/storage/jackets/<slug>.jpg)` ditulis langsung di komponen,
jadi tiap lagu tanpa file memicu 404. Sekarang controller mengirim URL-nya (atau `null`) lewat
`Song::jacketUrl()` / `Pack::imageUrl()`, dan `artworkBackground(url, seed)` di `lib/jacket.ts` yang memutuskan
mau pakai gambar atau cuma gradien.

**URL-nya relatif (`/storage/...`), bukan absolut.** `Storage::url()` menghasilkan URL absolut dari `APP_URL`;
kalau itu dikirim apa adanya, membuka app dari HP lewat IP LAN akan menunjuk ke `localhost` dan semua gambar
mati. Accessor-nya mengambil komponen path saja lewat `parse_url(..., PHP_URL_PATH)`.

**Hak cipta tetap sama:** `storage/app/public/` dan `public/storage` dua-duanya sudah gitignored, jadi gambar
tidak pernah masuk repo. Test importer membuat gambarnya sendiri lewat GD, tidak memakai aset asli. Clone
baru tanpa folder `data/` tetap jalan — semua kolom path-nya `null` dan UI jatuh ke gradien.

### Gotcha: jangan jalankan `npx prettier` di repo ini

Proyek ini **tidak punya konfigurasi prettier** dan prettier bukan dependensi-nya. `npx prettier --write`
mengunduh prettier baru dan memformat ulang dengan default-nya (kutip ganda), padahal seluruh kode TS/TSX di
sini pakai kutip tunggal — satu perintah mengubah file yang tidak ada hubungannya dengan pekerjaan yang sedang
dikerjakan. Sudah kejadian sekali dan harus di-`git checkout` ulang. Formatter yang dipakai proyek ini cuma
Pint (PHP). Untuk TS/TSX, ikuti gaya file di sekitarnya dan andalkan `npx tsc --noEmit` untuk pengecekan.


### `jacketOverride` — 57 chart punya jacket art sendiri

Selain `jacketDesigner`, tiap entri `difficulties[]` di `songlist.json` bisa punya `jacketOverride: true` —
artinya difficulty itu memakai **gambar jacket yang berbeda**, bukan cuma kreditnya yang beda. **57 chart di
50 lagu**, dalam tiga pola:

| Pola `ratingClass` | Jumlah lagu | Contoh |
|---|---|---|
| `[3]` (Beyond saja) | 42 | GOODTEK, qualia, Axium Crisis |
| `[0, 1]` (Past + Present) | 7 | Prism, To the Furthest Dream, stager, avril, stasis, ii, protoflicker |
| `[2]` (Future saja) | 1 | lucidtraveler |

Perhatikan pola kedua: yang di-override justru difficulty **rendah**, dan Future memakai jacket utama lagunya.
Jadi jangan berasumsi "override = selalu Beyond".

**Konvensi nama file di wiki (dari `Module:SongData`, baris ~711-718):** jacket utama `File:Songs <id>.jpg`,
override `File:Songs <id> <diffStr>.jpg` dengan `diffStr` ∈ `pst/prs/ftr/byd/etr/ins` (huruf kecil, dari
`diffStrs` di baris 92). Sudah diverifikasi lewat MediaWiki API: `Songs prism pst.jpg`, `Songs prism prs.jpg`,
`Songs goodtek byd.jpg` semuanya ada, 768×768.

**Modul wiki itu juga sudah punya perilaku yang kita tiru** (baris 1244-1258): dia membangun **tab** kalau
jacket-nya lebih dari satu, dan menggabungkan difficulty berurutan yang jacket-nya sama jadi satu tab.

**Sudah diimplementasikan di Celestl:**
- Kolom `charts.jacket_path`/`jacket_thumb_path` (nullable; null = pakai jacket lagunya).
- `celestl:import-arcaea-images` mencari `data/jackets/<slug>_<diff>.jpg` per chart.
- **Dedupe berdasarkan isi file (md5), bukan nama file.** Penting untuk pola `[0, 1]`: wiki menyimpannya
  sebagai dua file terpisah (`prism pst` dan `prism prs`) yang bisa jadi gambarnya sama persis. Kalau sama
  dengan jacket lagunya → chart dibiarkan null; kalau sama dengan override lain di lagu yang sama → pakai file
  yang sudah terbit, tidak menerbitkan salinan kedua. Tanpa ini, UI akan menampilkan tombol switch antara dua
  gambar yang identik.
- Chart diproses **urut difficulty terendah dulu** supaya nama file yang terbit deterministik antar-run.
- Halaman detail lagu menampilkan **tombol switch** (urut ratingClass naik) hanya kalau benar-benar ada lebih
  dari satu gambar — permintaan pemilik. Chart yang file override-nya tidak ada otomatis jatuh ke jacket lagu
  dan ikut tergabung, jadi switch tidak pernah muncul untuk gambar yang sama.

**Status file gambar (dijalankan pemilik sendiri — unduhan dari Claude diblokir sandbox):** 54 dari 57 file
sudah ada dan terpakai, jadi **47 dari 50 lagu** sudah menampilkan switch. Sisa 3 (`heavensdoor_byd`,
`libertas_byd`, `vexaria_byd`) unduhannya gagal; jalankan ulang `python3 -I data/fetch-jacket-overrides.py`
lalu import lagi. Skrip unduhnya ada di `data/fetch-jacket-overrides.py` (gitignored).

**Hasil nyata yang mengoreksi dugaan:** dedupe-isi-file ternyata jarang kena — dari 7 lagu pola `[0, 1]`,
cuma **`protoflicker`** yang PST/PRS-nya identik. Prism dan To the Furthest Dream justru punya **3 jacket
berbeda** (PST, PRS, dan FTR masing-masing sendiri). Jadi dugaan awal "PST+PRS pasti gambar yang sama" salah,
dan dedupe-nya tetap perlu untuk kasus protoflicker.

### Bug nyata: satu file 0-byte menghentikan seluruh import

Unduhan pemilik menghasilkan 3 file `.jpg` berukuran 0 byte (gagal diam-diam). Akibatnya:

- `imagecreatefromjpeg()` pada file kosong memunculkan **warning PHP**, dan Laravel mengubah warning jadi
  `ErrorException` — jadi penjagaan `if ($image === false)` yang sudah ada **tidak pernah terpanggil**, dan
  seluruh command mati di file pertama yang rusak. **Pelajaran umum: di Laravel, memeriksa nilai balik fungsi
  GD/`file_*` tidak cukup; warning-nya sudah jadi exception sebelum nilai balik sempat diperiksa.** Sekarang
  divalidasi lebih dulu lewat `isUsableImage()` (`filesize() > 0` + `@getimagesize()`), bukan ditangkap setelah
  kejadian.
- `publish()` menyalin file ke public disk **sebelum** membuat thumbnail, jadi file 0-byte itu sempat terbit
  ke `storage/app/public/` walau command-nya crash. Sekarang sumber yang tidak terbaca dilewati total: tidak
  disalin, tidak masuk database, dan dilaporkan sebagai error terpisah (`invalid`) di ringkasan.
- Skrip unduhnya juga diperbaiki: tulis ke `.part` dulu, verifikasi magic bytes JPEG (`FF D8 FF`), baru
  `os.replace` ke nama akhir; retry 3×; dan file 0-byte diperlakukan sebagai "belum ada" supaya tidak
  terlewat saat dijalankan ulang.

### Tabel difficulty di detail lagu: scroll horizontal, bukan sembunyikan kolom

Keputusan pemilik: kalau kolom designer tidak muat di layar HP, **tabelnya di-scroll horizontal**, jangan
kolomnya disembunyikan. Jadi semua chart menampilkan field yang sama di semua lebar layar; layar sempit cuma
perlu menggeser. Implementasi: wrapper `-mx-4 px-4 overflow-x-auto` (sengaja menembus padding kartu supaya
tepi terpotongnya kelihatan = sinyal bisa di-scroll) + `min-w-[520px]` di `<table>`.

**Gotcha yang menyertainya:** `<section>` pembungkusnya **wajib** `min-w-0`. Tanpa itu, grid item-nya tumbuh
mengikuti `min-width` tabel dan yang ter-scroll jadi SELURUH halaman, bukan tabelnya — gejalanya persis sama
dengan bug overflow yang lain (jacket dan header ikut terpotong), jadi gampang salah didiagnosis.


## Gate admin: TOTP (Google Authenticator), bukan password & bukan OAuth

Keputusan pemilik. Yang dimaksud "2FA Google" ternyata **kode 6 digit dari app Google Authenticator**
(TOTP, RFC 6238), bukan tombol "Sign in with Google" (OAuth) — dua hal yang beda jauh, jadi ditanyakan dulu.
TOTP dipilih karena tidak perlu daftar OAuth client, tidak perlu internet saat login, dan tidak ada pihak
ketiga yang harus hidup supaya pemilik bisa masuk ke panel admin-nya sendiri. Juga konsisten dengan prinsip
proyek ini yang tanpa password (§ Akun).

### Satu admin, dikunci setelah kode pertama berhasil

Aturan pemilik: **admin cuma satu orang, yaitu dia**, dan begitu email terisi + validasi 2FA berhasil,
enrolment tidak bisa diganti lagi kecuali kolom email-nya dikosongkan manual di database.

Tabel `admin_accounts` (`email` nullable unique, `totp_secret`, `confirmed_at` nullable, `singleton`):

- `isLocked()` = `email` terisi **dan** `confirmed_at` tidak null. Dua-duanya perlu: secret yang belum pernah
  dipakai bisa jadi sisa setup yang batal di tengah jalan.
- `confirmed_at` diisi saat **kode pertama yang valid** masuk, bukan saat QR dibuat. Men-scan QR tidak
  membuktikan apa-apa; kode yang kembali membuktikan pemilik benar-benar punya secret-nya di app.
- Kolom `singleton` (boolean, **unique**) bikin "cuma satu admin" jadi **constraint database**, bukan sekadar
  konvensi kode — baris kedua ditolak MySQL apa pun yang dipercaya kode aplikasi.
- `totp_secret` **dienkripsi at rest** (cast `encrypted`, kunci dari `APP_KEY`), kolomnya `text` karena
  ciphertext-nya ~256 char. Ini tidak melindungi dari orang yang sudah menguasai app yang jalan — TOTP itu
  simetris, server wajib tahu secret-nya untuk memverifikasi kode. Yang ditutup adalah kasus yang realistis:
  salinan database sendirian (dump, backup, `SELECT` dari tool lain) tanpa `APP_KEY` jadi tidak berguna.
- **Email di sini cuma label pencatat, bukan pengaman.** Tidak pernah dikirim ke mana pun, tidak dipakai saat
  login, dan tidak diverifikasi — fungsinya menandai "install ini diklaim siapa" dan memberi nama entri di app
  authenticator. Keamanan seluruhnya ada di secret TOTP-nya.
- **Tidak ada koneksi ke Google sama sekali.** TOTP itu murni lokal: secret + waktu sekarang → HMAC-SHA1 → 6
  digit. "Google Authenticator" cuma nama app yang mengimplementasikan RFC 6238; app itu sendiri tidak
  menghubungi server Google untuk ini, dan Celestl tidak pernah bicara dengan Google. Aegis, Bitwarden,
  1Password, FreeOTP, Microsoft Authenticator sama-sama bisa dipakai.
- Jalan keluarnya sengaja manual: `UPDATE admin_accounts SET email = NULL;` di database. Tidak ada halaman,
  tombol, atau session yang bisa melakukannya.
- **Sengaja terpisah dari tabel `users`.** `users` untuk pemain (Fase 4, bareng `game_identities`) dan
  bentuknya belum final; gate admin tidak boleh menunggu itu, dan baris pemain tidak boleh cuma berjarak satu
  flag dari jadi admin.

### Detail lain

- Enrolment: `php artisan celestl:admin-totp --email=...`. **Secret TIDAK lagi di `.env`** — sempat begitu di
  commit sebelumnya, lalu dipindah ke database atas permintaan pemilik. `config('celestl.admin.*')` sudah
  dihapus; command memperingatkan kalau `ADMIN_TOTP_SECRET` masih tertinggal di `.env`.
- `App\Http\Middleware\EnsureAdmin` menjaga **semua** route `/admin/*` kecuali `/admin/login`. Route
  POST/DELETE ikut dijaga — gate yang cuma menutup GET meninggalkan endpoint yang mengubah data terbuka.
- **Fail shut:** belum ada yang enrol → admin terkunci, bukan terbuka.
- `throttle:5,1` di POST login. Kode TOTP cuma 6 digit dan berlaku dalam window, jadi tebakan tanpa batas
  pada akhirnya akan kena.
- Session di-`regenerate()` saat login, supaya session id yang sempat terlihat sebelum login tidak bisa
  dipakai ulang sebagai session yang sudah terautentikasi.
- Toleransi window `1` (±30 detik) untuk beda jam HP vs server.
- Di test: helper `actingAsAdmin()` di `tests/Pest.php`. Test tentang pack/chart tidak perlu jadi test tentang
  TOTP juga — `AdminGateTest.php` (21 test) dan `AdminEnrolmentTest.php` (6 test) yang menguji gate-nya.

### QR di terminal — dan kenapa bukan link ke generator online

Versi pertama command ini cuma mencetak URI `otpauth://` dan menyuruh pemilik menempelkannya ke generator QR
online. **Itu salah**: URI-nya berisi secret admin, jadi menempelkannya ke situs orang lain = mengirimkan
kredensial admin ke pihak ketiga. Sekarang QR-nya digambar sendiri di terminal (`bacon/bacon-qr-code`).

Dua jebakan nyata saat membuatnya:

- **`$this->output->writeln()` membuang ANSI.** Di Laravel 13 `$this->output` dibungkus style object
  (`Laravel\Pao\...OutputStyle`) yang `isDecorated()`-nya false saat stream bukan TTY, dan escape code-nya
  dihapus — QR jadi satu blok karakter identik yang kelihatan "tergambar" padahal tidak terbaca. `OUTPUT_RAW`
  saja **tidak cukup**; harus menulis ke `$this->output->getOutput()` (output di bawahnya).
- **Warna tidak boleh mengandalkan tema terminal.** QR butuh modul gelap di atas latar terang, dan separuh
  terminal orang temanya terbalik. Jadi fg/bg di-set eksplisit per karakter, memakai half-block `▀` (dua baris
  modul per baris teks) supaya modulnya tetap persegi — sel terminal tingginya ~2× lebarnya, QR yang gepeng
  jauh lebih susah di-scan. Quiet zone 4 modul wajib, tanpa itu scanner tidak menemukan tepinya.

Diverifikasi dengan mem-parse ulang output ANSI-nya jadi matriks dan memeriksa ketiga finder pattern 7×7 di
posisi yang benar plus quiet zone-nya bersih — bukan cuma "kelihatan seperti QR".

**Catatan keamanan untuk sesi mendatang:** jangan pernah menjalankan `celestl:admin-totp` lalu memakai secret
hasilnya sebagai secret sungguhan — begitu tercetak di transcript, secret itu sudah bocor. Secret yang tercetak
saat uji coba di sesi ini **tidak dipakai**; pemilik enrol sendiri.
