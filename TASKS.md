# Celestl — Tahapan Kerja

Kerjakan berurutan. Fokus **Arcaea saja**; Rotaeno dan deteksi game otomatis ditunda. Proyek personal skala
kecil (lihat CLAUDE.md § Akun) — prioritas pemilik: content management (data Arcaea) dan rating engine/OCR
dulu, sistem akun digeser belakangan. Aturan rating ada di CLAUDE.md. Centang task yang sudah selesai.

Urutan clamp minimum 0 vs bonus **sudah terjawab** (`max(0, constant + modifier) + bonus`, lihat CLAUDE.md) dan
sudah diterapkan di Task 2.1. Rumus PTT total masih belum terverifikasi — pemilik menegaskan itu tidak
menghalangi, yang penting perhitungan per lagu; PTT total baru relevan di Task 2.4.

---

## Fase 1 — Fondasi data

### [x] 1.1 Setup proyek Laravel
Buat proyek di `web/` dengan Inertia + React + Tailwind dan test runner. Database **MySQL** (sudah diputuskan). Test runner **Pest** (sudah diputuskan). Catat di CLAUDE.md beserta bagian "Perintah" (dev server, semua test, satu test). Siapkan struktur i18n Laravel (bahasa utama Inggris) sejak awal. Jangan buat fitur dulu. Autentikasi bawaan starter kit **tidak dipakai** (login tanpa password, dibuat di Fase 4).
**Selesai jika:** aplikasi jalan lokal dan test bawaan lolos.

### [x] 1.2 Skema lagu & chart
Migration + model: `games` (slug, name), `packs` (game_id, slug, name, section nullable, parent_id nullable
self-FK, small_pack_image bool — **ditambah di luar rancangan awal task ini**, karena `pack` sebagai string
lepas di `songs` tidak cukup untuk pengelompokan per kategori + chapter/append yang dipakai admin mockup;
lihat CLAUDE.md § Skema), `songs` (game_id, pack_id nullable FK, slug, title, title_localized json nullable,
artist, composer nullable, jacket_designer nullable, side nullable, bpm nullable, length nullable, version
nullable, released_at date nullable, jacket_hash nullable), `charts` (song_id, difficulty — string + PHP enum
`App\Difficulty`, bukan enum native DB, lihat CLAUDE.md — level string (bisa "?" untuk April Fools), constant
decimal(4,1) nullable, chart_designer, jacket_designer, note_count nullable, game_version, source). Relasi,
factory, unique (game_id+slug di songs, song_id+difficulty di charts). `game_identities` (§ Rencana jauh di
CLAUDE.md) **tetap ditunda** — tidak disentuh, tidak menghalangi skema ini karena itu soal tabel `users`.
**Selesai jika:** relasi teruji, tidak ada chart ganda per lagu + difficulty. ✅ `tests/Feature/ArcaeaSchemaTest.php` (7 test).

### [x] 1.3 Import chart constant
**Dipilih: import langsung dari JSON**, bukan CSV — sumbernya (`data/songlist.json` + `data/packlist.json` +
`data/chartconstant.json` + `data/notecount.json` + `data/songlength.json` + `data/songlistothers.json`) sudah
tervalidasi silang sebelumnya (lihat CLAUDE.md § Sumber chart constant ditemukan), jadi CSV perantara cuma
nambah langkah tanpa manfaat. Artisan command `celestl:import-arcaea-content` (tanpa argumen file — baca
langsung dari `config('celestl.arcaea_data_path')`), upsert packs → songs → charts, laporkan baru/diperbarui/
dilewati lewat tabel di terminal. Melewati stub `deleted:true` (ada di DUA tempat: stub kosong di
`songlist.json` sendiri, dan entri penuh di `songlistothers.json`'s `deleted` — keduanya dilewati). Lagu
`special` (April Fools + 1 lagu `tutorial` yang bukan April Fools tapi juga tanpa pack asli) dikelompokkan ke
pack sintetis "April Fools" — lihat CLAUDE.md untuk status "dugaan, bukan keputusan" soal `tutorial`.
Idempoten (diuji lewat re-run, 0 baris baru kedua kalinya). Dijalankan terhadap data asli: 63 pack (62 asli +
1 sintetis), 563 lagu, 1.848 chart — cocok persis dengan statistik mockup `design/admin-dashboard.html`.
**Selesai jika:** bisa diulang tanpa duplikasi, baris rusak/null dilaporkan tanpa menghentikan proses. ✅
`tests/Feature/ImportArcaeaContentTest.php` (6 test, data fixture sintetis di `tests/fixtures/arcaea-data/` —
bukan data asli, aman di-commit).

### [x] 1.4 Daftar lagu (publik)
Halaman publik (bukan admin): `/` daftar lagu + pencarian, `/songs/{slug}` detail, `/packs` + `/packs/{slug}`.
Layout `AppLayout` sendiri, **tema gelap di semua ukuran layar** (keputusan pemilik) — acuannya cuma frame
mobile Figma; tata letak layar lebar diturunkan dari situ, frame desktop Figma 277:31 **tidak dipakai** karena
belum final (lihat CLAUDE.md § Desain). Semua teks lewat `lang/en/app.php` + `useTranslations()`, tidak ada
teks yang di-hardcode di React. Jacket/pack art tetap gradien placeholder (file asli opsional di public disk).
**Selesai jika:** data hasil import tampil dan bisa dicari di HP dan desktop. ✅
`tests/Feature/SongCatalogueTest.php` (7 test): urutan chart ikut urutan enum bukan urutan insert, pack
chapter ikut section induknya, pack kosong tidak muncul, slug tak dikenal 404, teks UI datang dari translations.
Diverifikasi visual di 390 / 820 / 1440 px — termasuk lagu 6-difficulty (DREAD AREA) yang INS-nya tampil benar.

**Catatan terbuka:** warna INS (`#0000CD`) di tabel detail lagu praktis tidak terbaca di atas sel `--violet`,
persis seperti yang sudah dihitung di CLAUDE.md § Kontras warna difficulty (kontras 1.72). Sekarang
kelihatannya di halaman asli, bukan cuma di atas kertas — tetap menunggu keputusan pemilik, jangan diubah
sepihak.

---

## Fase 2 — Rating engine & kalkulator

### [x] 2.1 Rating engine Arcaea
Service murni `App\Services\ArcaeaRating` (tanpa database): `modifier(int $score)`, `grade(int $score)`,
`playRating(float $constant, int $score, Lamp $lamp)` termasuk bonus +0.2 untuk semua lamp clear. Enum baru:
`App\Lamp` (6 lamp + `isClear()` + `fromPrivateServerClearType()` untuk segmen Unofficial) dan `App\Grade`.
Semua aturan **berasal dari pemilik** (CLAUDE.md § Aturan rating Arcaea), bukan wiki dan bukan simpulan dari
gambar — contoh Extradimensional dipakai sebagai pembuktian, bukan sumber rumus.
**Selesai jika:** semua nilai uji lolos. ✅ `tests/Unit/ArcaeaRatingTest.php` (34 test): 7 nilai uji wajib,
contoh asli dari game, tiap lamp, batas 9.8M/9.9M/10M dan di atasnya, clamp nol, dan semua batas grade.
Test ditulis dulu dan dipastikan gagal sebelum implementasi. Angkanya juga diverifikasi silang dengan
hitungan ulang presisi tinggi di luar PHP, bukan cuma "kode cocok dengan dirinya sendiri".

### [ ] 2.2 Kalkulator + log perhitungan
Form kalkulator (cari lagu, difficulty, skor, lamp) dengan play rating real-time. Sediakan juga **section "Drop Image"** sesuai desain Figma, tapi non-aktif/placeholder dulu — logika CV baru ada di Fase 3. Tiap perhitungan disimpan sebagai log di tabel `plays` (chart_id, score, lamp enum, played_at, source enum manual/scan) dan bisa dilihat di halaman riwayat. Sebelum ada akun (Fase 4), log boleh tanpa `user_id` atau diasosiasikan ke satu identitas default — putuskan dengan pemilik saat task ini mulai.
**Selesai jika:** rating tampil real-time, log tersimpan.

### [ ] 2.3 Top 50 (dari log)
Halaman Top 50: skor terbaik per chart, urut play rating, 50 teratas. **Tanpa PTT total** sampai rumusnya terverifikasi.
**Selesai jika:** daftar benar dan konsisten dengan rating engine.

### [ ] 2.4 Simulasi skor target
Kebalikan rumus: skor minimal untuk play rating X pada sebuah chart (memperhitungkan bonus clear), dengan test round-trip skor → rating → skor. Fitur "agar PTT naik 0,01" menunggu rumus PTT total.
**Selesai jika:** round-trip konsisten dengan engine.

---

## Fase 3 — Upload Best 50 (Arcaea)

### [ ] 3.1 Layanan vision
`vision/` (FastAPI), satu endpoint: terima gambar Best 50 resmi (layout tetap 5×10), kembalikan JSON data mentah (nickname, generated date, per kartu: rank, judul/jacket, skor, lamp, potential tercetak, level) + confidence. Tanpa logika rating. Komentar menjelaskan *kenapa*.
**Selesai jika:** gambar contoh menghasilkan 50 entri yang benar (diverifikasi manual).

### [ ] 3.2 Upload, cek nickname, konfirmasi
Laravel memanggil vision, mencocokkan lagu ke database (hash jacket dulu, judul OCR sebagai cadangan — judul di kartu sering terpotong), memeriksa nickname gambar = nickname akun (bukan bukti kepemilikan), membandingkan potential tercetak dengan hasil engine sebagai cross-check, lalu menampilkan hasil untuk dikonfirmasi user.
**Selesai jika:** upload yang cocok tersimpan, nickname berbeda ditolak, selisih rating dilaporkan.

### [ ] 3.3 Riwayat Best 50
Simpan snapshot (tanggal generate, nickname, 50 entri) dan menu untuk melihat snapshot sebelumnya.
**Selesai jika:** beberapa snapshot bisa dilihat dan dibandingkan.

---

## Fase 4 — Akun

### [ ] 4.1 Register, login, profile, mode guest
Tanpa password. Register sendiri dengan nickname in-game + player ID 9 digit; login dengan salah satunya. Player ID (ternormalisasi tanpa spasi) adalah kunci akun; nickname display-only dan bisa berubah. Halaman profile. Mode tanpa login: kalkulator jalan tanpa menyimpan riwayat di server. Hubungkan log `plays` dan snapshot Best 50 dari Fase 2–3 ke akun yang baru dibuat. Proyek personal skala kecil (lihat CLAUDE.md) — alur boleh sederhana, tidak perlu proteksi tingkat produk publik.
**Selesai jika:** register/login/logout dan guest berjalan, ada test untuk keduanya.

---

## Fase 5 — Admin

### [ ] 5.1 Admin: fondasi (layout, Songs & charts, Packs)
Layout admin (flag is_admin) mengikuti `design/admin-dashboard.html`: sidebar 8 menu (Home, Packs, Songs &
charts, Users, Game management, Activity log, CSV import, Testing tools — yang terakhir boleh jadi halaman
kosong "coming soon" dulu kalau vision/ belum ada). Songs & charts: tabel level-lagu (No/Song/Composer/Jacket
designer/Release date/Source) + panel detail per-difficulty saat baris diklik. Packs: grid pack dengan jumlah
lagu. Kolom `composer`, `jacket_designer`, `released_at` sudah ada dari Task 1.2.

**Progres:** layout (`web/resources/js/layouts/admin-layout.tsx`) + ke-8 route Inertia (`routes/admin.php`,
prefix `/admin`) sudah ada, dicek lewat `php artisan serve` + headless screenshot — cocok visual dengan mockup
(warna, font Poppins/Exo 2, sidebar grouping, active state). Home sudah **DB-backed sungguhan**
(`AdminHomeController`): hero stat (total chart, per-difficulty breakdown), "Recently added" (20 lagu terbaru
by `released_at`, rank diamond top-3), "Recent activity" masih dari fixture statis
`web/resources/js/data/admin-examples.ts` (port 1:1 const `GAMES`/`USERS`/`LOG` dari mockup — dipakai juga
nanti oleh Users/Game management/Activity log). Packs juga sudah **DB-backed sungguhan**
(`AdminPackController`): dikelompokkan per kategori (pita label vertikal), chapter/append tampil di bawah
kartu induknya, tombol "+ Add pack" buka modal (prototipe, belum submit sungguhan). Klik pack/chapter
mengarah ke `/admin/songs?pack=<nama>` — **sudah diverifikasi jalan** (8 lagu Divine Oblivion terfilter benar,
termasuk 4 chart INS legacy-nya tampil biru seperti seharusnya).

Songs & charts juga sudah **DB-backed sungguhan** (`AdminSongController`): master-detail, pencarian
(judul/artist/pack), sort (title/pack/newest/BPM/constant tertinggi), filter pack dari query string, panel
detail (jacket zoomable lewat lightbox, kv Pack/Side/BPM/Length/Released/Version, tabel per-difficulty),
modal "+ Add song" (pack dropdown dikelompokkan per kategori, upload jacket + preview zoomable). **Mode edit
sengaja TIDAK diporting** dari mockup — mockup punya mode lihat/edit toggle, tapi karena belum ada endpoint
update sungguhan, UI edit yang tidak benar-benar menyimpan dianggap kurang jujur dibanding tidak
menampilkannya sama sekali; menyusul begitu endpoint update dibuat.

CSV import dan Testing tools (dua sisa dari 8 menu sidebar) juga sudah diisi — bukan lagi placeholder "coming
soon": CSV import menjelaskan dengan jujur bahwa jalur CSV tidak pernah dibangun (Task 1.3 pakai JSON
langsung) dan menampilkan hasil nyata `celestl:import-arcaea-content` terakhir; Testing tools tetap murni
pratinjau non-fungsional (sesuai rencana — `vision/` baru Fase 3) dengan label "Belum fungsional" yang jelas.

Belum ada flag `is_admin`/middleware proteksi (belum ada sistem akun — Fase 4 — jadi `/admin` masih bisa
diakses siapa saja untuk sekarang, **sengaja**, bukan lupa). **Belum diuji responsif** (mobile/tablet) — semua
halaman admin baru dicek di lebar desktop (1400px); layout grid (`grid-cols-[224px_1fr]` sidebar,
`grid-cols-[minmax(0,1.5fr)_minmax(400px,1fr)]` master-detail Songs & charts) belum punya breakpoint sama
sekali. Ini satu-satunya sisa sebelum kriteria "selesai" task ini terpenuhi.
**Selesai jika:** Songs & charts dan Packs bisa dicari/difilter (✅), detail per-difficulty tampil benar (✅),
responsif (❌ belum).

### [ ] 5.2 Admin: Users, Activity log, Game management
Users: tabel user + identitas game (siapkan kolom untuk banyak identitas per user kalau § Rencana jauh:
multi-game identity sudah disetujui; kalau belum, cukup satu identitas Arcaea per user). Activity log: linimasa
gabungan (upload Best 50, import CSV, edit admin, akun baru) dengan filter tipe + "Needs review". Game
management: boleh dibuat read-only dulu (menampilkan Arcaea saja) kalau multi-game belum diputuskan jalan.

**Progres:** ketiga halaman sudah dibangun dan render data (`web/resources/js/pages/admin/{users,games,log}.tsx`),
tapi **masih dari fixture statis** `admin-examples.ts` (`USERS`/`GAMES`/`LOG`, port 1:1 dari mockup), bukan
tabel database. Users: tabel + search nickname/Player ID. Activity log: linimasa + 5 chip filter (All/Best
50/CSV import/Admin edit/Needs review) — logika filter "Needs review" (state ≠ ok) sudah jalan, diuji lewat
`npm run types:check`/`vp check`, belum diklik manual di browser. Game management: 2 kartu game (Arcaea
active, Rotaeno di-hold/opacity redup) + tombol "Add game" (non-fungsional).
Belum bisa dicentang selesai — kriteria "Activity log menampilkan kejadian nyata" sengaja belum terpenuhi:
upload Best 50 (Fase 3), import CSV (Task 1.3 jalur CSV, belum dipakai — importer sungguhan pakai JSON
langsung), dan sistem akun (Fase 4) semuanya belum ada, jadi tidak ada kejadian nyata untuk ditampilkan.
Menyusul begitu sistem-sistem itu ada.
**Selesai jika:** Activity log menampilkan kejadian nyata dari task-task sebelumnya (bukan data contoh).

---

## Fase 6 — Unofficial (private server)

Arah baru di luar rencana awal (lihat CLAUDE.md § Unofficial). Dikerjakan sejajar/menyelip di antara fase
lain atas permintaan pemilik, bukan menggantikan urutan Fase 1-5. **Dua clone lokal sudah ada** di
`Arcaea-server/` dan `ArcaeaServerFork/` (gitignored, repo git sendiri-sendiri, lihat CLAUDE.md).

### [x] 6.1 Admin: upload custom chart (`/admin/unofficial`)
Tabel `unofficial_songs`/`unofficial_charts` (terpisah total dari `songs`/`charts` resmi), halaman admin
upload `.aff` + constant per difficulty (5 slot: PST/PRS/FTR/BYD/ETR, sesuai batas skema private server
dasar). File `.aff` disimpan di `storage/app/private/unofficial-charts/`. **Belum terhubung ke server** —
baru tersimpan di Celestl.
**Selesai jika:** bisa tambah custom song, upload/replace `.aff` per difficulty tanpa duplikasi, hapus song
ikut hapus filenya. ✅ `tests/Feature/AdminUnofficialControllerTest.php` (7 test).

### [ ] 6.2 Jalankan private server, sambungkan ke game Arcaea
Clone & jalankan `Arcaea-server`/`ArcaeaServerFork` (config.py, cek kebutuhan data chart tambahan di luar
kode Python-nya). Lanjut: cara menyambungkan client Arcaea asli ke server ini (lihat `data/server-arcaea.md`
+ riset proxy/sertifikat yang sudah dibahas sesi sebelumnya). "Aku + beberapa teman" — disarankan lewat
VPN/jaringan privat, bukan port publik (permintaan README resmi proyeknya).

**Progres (bagian "jalankan" selesai):** `ArcaeaServerFork` (main) sudah dijalankan lokal dan terverifikasi
boot — lihat CLAUDE.md § Menjalankan private server. Venv di `~/.venvs/arcaea-server` (di luar repo),
`ArcaeaServerFork/config.py` buatan lokal (HOST 127.0.0.1, PORT 8765; port 8080 ternyata sudah dipakai
Adminer di mesin ini). Token API admin juga sudah dipetakan alurnya (dibutuhkan 6.3). **Belum:** nyambung
dari client Arcaea asli — butuh tahu versi client + platform yang dipakai dulu (menentukan server mana yang
cocok & langkah proxy-nya).
**Selesai jika:** server jalan lokal, minimal satu device bisa login & main lewat server ini.

### [x] 6.3 Push custom chart ke private server
Tombol "Push to server" di tiap lagu di `/admin/unofficial` (`App\Services\PrivateServerPusher`): constant lewat
API admin server (`GET` cek ada → `POST /songs` atau `PUT /songs/<id>`), file `.aff` disalin ke
`database/songs/<song_id>/<index>.aff` (PST=0..ETR=4), lalu `refresh_song_file_cache`. `pushed_at` terisi
setelah berhasil. Auth pakai `API_TOKEN` statis server (tanpa password admin di Celestl); isinya sudah diisi
acak di `ArcaeaServerFork/config.py` dan `web/.env` (keduanya gitignored). Validasi constant: batas atas 12
dihapus, tetap max 1 desimal.
**Selesai jika:** custom chart dari 6.1 sampai ke server. ✅ Terbukti ke **server asli** (salinan sementara,
bukan databasemu): constant masuk (13.5 diterima) dan ter-update lewat PUT, file `.aff` tersalin, refresh 200.
`tests/Feature/PrivateServerPushTest.php` (6 test). **Belum terbukti:** apakah game client *menampilkan* dan
bisa *memainkan* lagu custom ini — itu butuh 6.2 (client tersambung); lagu baru kemungkinan juga perlu entri
songlist/content bundle supaya muncul di game (belum diselidiki, jangan diasumsikan).

### [ ] 6.4 Baca skor dari private server (read-only)
Koneksi DB kedua Laravel (read-only) ke SQLite private server, baca `best_score`/`user`. **Jangan percaya
rating/grade bawaan server** — hitung ulang pakai rating engine sendiri (Task 2.1, lihat catatan dependency
di CLAUDE.md § Unofficial). Tampil di halaman/Top 50 terpisah, tidak campur dengan data OCR resmi.
**Selesai jika:** skor dari server private muncul di Celestl dengan rating yang dihitung ulang (bukan ambil
langsung dari kolom `rating` server), di halaman yang jelas terpisah dari Top 50 resmi.

---

## Ditunda

- Rotaeno (rumus, data, UI) dan deteksi game otomatis
- Export ke gambar
- Logika CV untuk "Drop Image" di kalkulator (section UI-nya sudah dibuat di Task 2.2)
- YOLO, foto kamera dengan koreksi perspektif, konfirmasi otomatis berbasis confidence
