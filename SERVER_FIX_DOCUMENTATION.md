# Dokumentasi Arsitektur Server, Penanganan Issue Jaringan & Post-Mortem Perbaikan (Arcaea Server — Celestl)

Dokumen ini adalah spesifikasi teknis resmi dan panduan pemeliharaan server (*backend architecture & network fix post-mortem*) untuk private server **Celestl** (`ArcaeaServerFork`). Dokumen ini merangkum seluruh akar masalah jaringan, inkonsistensi protokol native C++ (`libcocos2dcpp.so`), perbaikan skema database, penanganan download loop, dan integritas cloud save yang telah diselesaikan pada server.

Dokumen pendamping:
- [`CHART_FIX_DOCUMENTATION.md`](file:///home/luhung/Documents/project/Celestl/CHART_FIX_DOCUMENTATION.md) (Integritas chart `.aff`, sintaks AffParser & aset visual)
- [`APK_PATCH_DOCUMENTATION.md`](file:///home/luhung/Documents/project/Celestl/APK_PATCH_DOCUMENTATION.md) (Reverse engineering, binary patching & Dalvik IAP mock)
- [`WEB_ADMIN_GUI_DOCUMENTATION.md`](file:///home/luhung/Documents/project/Celestl/WEB_ADMIN_GUI_DOCUMENTATION.md) (Arsitektur web dashboard & manajemen single-player PTT)

---

## 1. Arsitektur Umum Private Server Celestl

Server Celestl dibangun menggunakan framework Python (Flask & WSGI / gevent) yang dijalankan baik secara lokal maupun di dalam container Docker (`celest-arcaea-server`) pada VPS produksi (`139.190.96.194`):
- **Port HTTP/HTTPS**: `8765` (SSL self-signed dengan sertifikat `server.crt` dan `server.key`).
- **Port Link Play (TCP)**: `10901` (sinkronisasi status ruangan & data lobi).
- **Port Link Play (UDP)**: `10900` (sinkronisasi waktu nyata gameplay multipemain).
- **Prefix API Versi Client**:
  - `/concentrateavailable/43/` (Arcaea `v7.1.x`)
  - `/egoeimi/42/` (Arcaea `v7.0.x`)
  - Fallback: `/concentrateavailable/`, `/egoeimi/`, `/brieflywingtip/41/`

Seluruh komunikasi antara client APK Arcaea dan server diverifikasi secara ketat oleh engine native `libcocos2dcpp.so`. Ketidakcocokan format satu field saja pada respons JSON server akan langsung memicu penghentian paksa aplikasi (*abrupt termination / SIGSEGV*).

---

## 2. Issue Cloud Sync & Arsitektur Save Data (`/user/me/save`)

### 2.1. Akar Masalah Native C++ (`libcocos2dcpp.so`)
Proses pertukaran data simpanan awan (*cloud sync*) diatur oleh kelas C++ `SaveData`:
- Serializer upload client: Alamat `0xaf3d00` – `0xaf4100`.
- Deserializer unduh save: Alamat `0x971900` – `0x972500` (`SaveData::fromJson`).
- Handler tombol dialog unduh: Alamat `0x1380c50` – `0x13816f0`.
- Eksekutor penulisan SQLite lokal client: Alamat `0x13ee3b0` – `0x13ee800`.

Engine native menggunakan parser JSON pihak ketiga (`rapidjson`). Secara arsitektural, Arcaea mengorganisasi data save ke dalam sub-objek berformat wrapper unik:
```json
{
  "scores": { "": [ { ... } ] },
  "clearlamps": { "": [ { ... } ] },
  "clearedsongs": { "": [ "song_id" ] },
  "unlocklist": { "": [ { ... } ] },
  "story": { "": [ { ... } ] },
  "installid": { "val": "..." },
  "devicemodelname": { "val": "..." },
  "finalestate": { "val": "..." },
  "createdAt": 1794849741967,
  "version": { "val": 1 }
}
```

Pada `SaveData::fromJson` (`0x971a60`), parser C++ mengeksekusi:
```cpp
auto scoresMember = root.FindMember("scores");
auto innerArray = scoresMember->value.FindMember(""); // MENCARI KEY EMPTY STRING ""
```
Jika server mengembalikan array langsung (misal `"scores": [ ... ]`) atau mengembalikan `null`, iterator `FindMember` mengembalikan `MemberEnd`. Pemanggilan langsung ke `it->value` tanpa pengecekan menghasilkan **null pointer dereference (`SIGSEGV` signal 11)**.

### 2.2. Post-Mortem 1: Crash saat Buka Menu Cloud Sync (`tombstone_34` & `tombstone_35`)
- **Gejala**: Ketika pemain menekan menu *Network -> Cloud Sync*, aplikasi langsung keluar seketika.
- **Penyebab Teknis**:
  Tabel `user_save` di database sempat diisi dengan 561 kunci lagu buatan pada field `unlocklist`, misalnya `{"unlock_key": "rinka0", "complete": 100}`.
  Di dalam engine native Arcaea, `unlocklist` **bukan digunakan untuk membuka lagu biasa**, melainkan untuk kondisi anomali khusus (seperti `aegleseeker|2|3|...`, `saikyostronger|...`). Engine mem-parsing string `unlock_key` menggunakan pemisah pipa (`|`). Ketika parser menerima format tanpa pipa (`rinka0`), parser memicu error dereferensi pada struktur `ConditionTree`, menyebabkan crash `SIGSEGV` saat dialog dibangun.
- **Solusi Server**:
  Field `unlocklist` dikembalikan ke arsitektur bersih versi awal (`2cb6c29b`):
  ```json
  "unlocklist": { "": [] }
  ```
  Lagu-lagu dibuka melalui database kepemilikan item (`user_item`), bukan melalui `unlocklist`.

### 2.3. Post-Mortem 2: Crash saat Klik "OK" pada Modal "Confirm Data Download" (`tombstone_33`)
- **Gejala**: Halaman Cloud Sync dapat terbuka dan menampilkan data statistik akun. Namun saat pemain menekan tombol **Download** lalu mengonfirmasi dengan menekan tombol **OK**, aplikasi langsung mengalami crash abort (`Cannot process signal 11`).
- **Penyebab Teknis**:
  Ketika tombol OK ditekan, engine C++ mengeksekusi callback lambda `0x1381618` yang membaca array `scores` dari payload JSON unduhan dan memasukkannya ke SQLite internal client:
  ```sql
  INSERT OR REPLACE INTO scores (id, version, score, shinyPerfectCount, perfectCount, nearCount, missCount, date, songId, songDifficulty, modifier, health, ct) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12, ?13);
  ```
  Sebelum menyimpan ke SQLite, engine memanggil `SongManager::getSong(song_id)`. Jika terdapat skor untuk lagu yang **tidak terdaftar di file `songlist` lokal APK** (misal ID typo atau lagu baru yang belum ada di client), fungsi mengembalikan `nullptr`. Saat engine memanggil `song->getDifficulty()`, Android langsung melemparkan `SIGSEGV`.
- **Solusi Server**:
  Sinkronisasi save akun (`generate_user_saves.py`) hanya memproses lagu-lagu yang valid dan terverifikasi ada pada katalog lagu client.

### 2.4. Penanganan `finalestate` (Axiom of the End)
Di Arcaea 5.0+, progres event *Axiom of the End* (Testify, Infinite Strife, dll.) disimpan pada string pipa `finalestate`:
- Format: `0|100|45106|82952|...|1337` (74 nilai switch status).
- **Aturan**: Jika field `finalestate_data` di database bernilai kosong `""`, kelas [`core/save.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/core/save.py) secara otomatis menginjeksi switch default resmi dari `Constant.FINALE_SWITCH`. Client yang menerima string kosong akan mengalami pembagian array di luar batas indeks (*out of bounds exception*).

### 2.5. Peran `installid` & Identifikasi Perangkat
- Client APK mengirimkan UUID instalasi (`installid`) perangkat saat melakukan upload save data.
- Server Celestl menetapkan `installid`:
  ```json
  "installid": { "val": "0fcec8ed-7b62-48e2-9d61-55041a22b123" }
  ```
- Format ini memastikan kompatibilitas penuh saat pemain berpindah perangkat (antara Waydroid, ponsel Android, dan tablet) tanpa memicu dialog peringatan konflik kepemilikan akun yang merusak alur sinkronisasi.

---

## 3. Issue Download Loop (Pack vs Single Purchase)

### 3.1. Gejala Permasalahan
Pemain membeli pack lagu (misalnya *Silent Answer* atau *Memory Archive*) di toko menggunakan tiket Memori. Pembelian dinyatakan sukses oleh server. Namun di menu Song Select:
1. Ikon unduhan $(\downarrow)$ tetap muncul pada lagu yang bersangkutan.
2. Saat ikon unduh diklik, muncul dialog *"All songs downloaded successfully"*, namun chart tetap tidak dapat dimainkan atau langsung meminta unduh ulang secara berulang-ulang (*infinite download loop*).

### 3.2. Akar Masalah di Native Client
Di Arcaea v7.1.x, mekanisme verifikasi kepemilikan lagu diatur dalam dua tingkat:
1. Kepemilikan Induk: Client memeriksa apakah pack ID terdaftar di `user_item` dengan tipe `'pack'`.
2. Kepemilikan Chart Tunggal: Client memeriksa tabel `user_item` untuk setiap `item_id` bertipe `'single'`.
3. **Ketiadaan Suffix Difficulty 3 & 4 (Beyond & Eternal)**:
   Untuk lagu yang memiliki chart Beyond (diff `3`) atau Eternal (diff `4`), native client **tidak hanya memeriksa `song_id` biasa**, melainkan memeriksa apakah kunci `song_id3` atau `song_id4` terdaftar sebagai item `'single'` atau `'world_song'`.
   Jika server hanya mendaftarkan `song_id` tanpa menyertakan varian difficulty-nya, client menganggap chart Beyond/Eternal belum terbeli dan menolak memuat file chart, memicu permintaan unduh berulang-ulang ke server.

### 3.3. Solusi Server pada `server/purchase.py`
Pada endpoint [`server/purchase.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/server/purchase.py) fungsi `buy_pack_or_single(user_id)`:
```python
# Menjamin seluruh varian difficulty Beyond (3) dan Eternal (4) diinjeksi ke user_item
from core.download import SonglistParser
SonglistParser.ensure_fresh()

target_songs = []
if 'single_id' in request.form:
    target_songs = [purchase_name]
elif 'pack_id' in request.form:
    target_songs = list(SonglistParser.pack_info.get(purchase_name, set()))

for sid in target_songs:
    c.execute("INSERT OR IGNORE INTO user_item (user_id, item_id, type, amount) VALUES (?, ?, 'single', 1)",
              (user_id, sid))
    for diff_suffix in ('3', '4'):
        diff_key = f"{sid}{diff_suffix}"
        if diff_key in SonglistParser.world_songs:
            c.execute("INSERT OR IGNORE INTO user_item (user_id, item_id, type, amount) VALUES (?, ?, 'single', 1)",
                      (user_id, diff_key))
            c.execute("INSERT OR IGNORE INTO user_item (user_id, item_id, type, amount) VALUES (?, ?, 'world_song', 1)",
                      (user_id, diff_key))
```
Perbaikan ini memastikan bahwa ketika sebuah pack atau lagu dibeli, seluruh hak akses lagu dasar beserta varian Beyond dan Eternal langsung tercatat lengkap di database server.

---

## 4. Larangan Mutlak `ratingClass: 3` (Beyond) pada `database/songs/unlocks`

### 4.1. Akar Masalah Native UI
Di Arcaea resmi, sistem *Fragment Unlock* (membuka lagu dengan pecahan fragmen di Song Select) **hanya didesain untuk Past (0), Present (1), dan Future (2)**.
- Kesulitan Beyond (3) secara native hanya dibuka melalui **World Mode (Lost Chapter)** atau event khusus.
- Di dalam client native C++ (`libcocos2dcpp.so`), **tidak ada komponen antarmuka (UI Dialog) untuk membeli difficulty Beyond menggunakan fragmen**.

### 4.2. Dampak Fatal Deklarasi Beyond di `unlocks`
Jika sebuah chart Beyond dideklarasikan di [`database/songs/unlocks`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/unlocks), misalnya:
```json
// DILARANG KERAS:
{"song_id": "rinka", "ratingClass": 3, "cost": 1000}
```
Client native akan membaca konfigurasi tersebut dan bereaksi:
1. **Mengunci Diamond ke-4 Permanen**: Diamond kesulitan Beyond terkunci dengan gembok hitam.
2. **Label Berubah Menjadi `"?"`**: Judul dan tingkat kesulitan lagu dipaksa menjadi tanda tanya.
3. **Lagu Hilang dari Tab BEYOND**: Seluruh lagu yang belum pernah dimainkan akan **disembunyikan sepenuhnya** dari tab BEYOND pada Song Select.
4. Karena tidak ada tombol pembelian fragmen untuk Beyond, pemain **sama sekali tidak memiliki cara untuk membuka chart tersebut**.

### 4.3. Solusi & Audit Otomatis (Commit `f39b235`)
1. Sebanyak **476 baris deklarasi `ratingClass: 3` dihapus total** dari file [`database/songs/unlocks`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/unlocks).
2. Dibuat unit test otomatis [`tests/test_07_unlocks_integrity.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/tests/test_07_unlocks_integrity.py) yang memverifikasi bahwa:
   $$\forall u \in \text{unlocks}, \quad u.\text{ratingClass} \neq 3$$
3. Skrip verifikasi global [`check_chart_integrity.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/tools/check_chart_integrity.py) akan otomatis menggagalkan audit build jika ditemukan entri `ratingClass: 3` di file `unlocks`.

---

## 5. Song Cache Dinamis & Watcher Hot Reload (`song_cache.db`)

### 5.1. Masalah Client Cache Invalidation
Client Arcaea menyimpan cache file chart (`.aff`), audio (`.ogg`), dan jacket (`.jpg`) di penyimpanan internal perangkat. Client hanya akan meminta unduhan ulang jika:
1. Properti `"remote_dl"` bernilai `true` pada [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
2. Nilai timestamp `"date"` pada [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) lebih baru daripada cache lokal client.

### 5.2. Implementasi `SongFileWatcher` & Hash BLAKE2b
Untuk mendeteksi pembaruan file di server tanpa harus me-restart daemon server:
1. **Hash BLAKE2b Deterministik** ([`core/download.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/core/download.py)):
   Fungsi `compute_song_dir_signature(song_id)` menghitung digest 64-bit dari gabungan waktu modifikasi direktori (`mtime_ns`), bitmap kesulitan aktif pada songlist, serta ukuran dan timestamp setiap file asset di folder lagu.
2. **Background Watcher**:
   Thread latar belakang memantau direktori `database/songs/` setiap 1.0 detik. Jika charter melakukan perubahan in-place pada file `.aff` atau audio, cache database `database/song_cache.db` otomatis diperbarui seketika dan in-memory LRU cache dibersihkan.
3. **Prosedur Hot Reload Resmi**:
   Saat charter selesai memodifikasi chart `.aff`:
   - Naikkan nilai `"date": int(time.time())` pada [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
   - Jalankan `celest-audit --fix` untuk sinkronisasi cache.
   - Client APK akan mendeteksi perbedaan tanggal dan mengunduh ulang chart secara otomatis saat lagu dipilih di Song Select.

---

## 6. Bypass Pembelian Tiket Memori (IAP) & Gacha Jackpot

### 6.1. Mekanisme Endpoint `/purchase/me/iap/ticket`
Pada client APK resmi, pembelian tiket Memori dialihkan ke Google Play Billing. Di server Celestl, endpoint [`server/purchase.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/server/purchase.py) menyediakan bypass penuh:
- Menerima SKU Memori: `arcaea_memory100`, `arcaea_memory500`, `arcaea_memory1000`, hingga tier paket kustom.
- Mengekstrak SKU secara fleksibel dari parameter form, JSON body, maupun token receipt pembelian mock.
- Menambahkan kredit saldo tiket Memori ke akun pengguna secara instan tanpa validasi tanda terima Google Play.

### 6.2. Sistem Probabilitas Gacha Jackpot Memori
Untuk meningkatkan pengalaman ekonomi permainan, server mengintegrasikan tabel bonus terbobot (*weighted random distribution*) dengan 10.000 titik sampel:
- **Peluang Normal (No Bonus)**: Tepat **85.0%** (8.500 / 10.000 pembelian).
- **Peluang Bonus Ekstra**: Sebanyak **15.0%** didistribusikan ke 12 tier reward:
  - Lucky Dip (+5%): 4.0%
  - Bronze (+10%): 3.0%
  - Silver (+20%): 1.7%
  - Gold (+50%): 1.0%
  - Double 2x (+100%): 0.5%
  - Triple 3x (+200%): 0.35%
  - Mega Win 4x (+300%): 0.22%
  - **JACKPOT 6x (+500%)**: Tepat **0.08%** (8 dari 10.000 transaksi).
  - **LEGENDARY JACKPOT 51x (+5000%)**: Tepat **0.05%** (5 dari 10.000 transaksi).

---

## 7. Standar Integritas Skor, Lamp Invariant & Rumus PTT

### 7.1. Rumus Resmi Skor Pure Memory (PM)
Skor di tabel `best_score`, `recent30`, dan `user_save` tidak boleh diisi nilai sembarang (*random*). Skor wajib mengikuti hukum matematika resmi Arcaea:
$$\text{Base Score} = \left\lfloor \frac{10\,000\,000}{\text{Total Notes}} \times \left(\text{Pure} + \frac{\text{Far}}{2}\right) \right\rfloor$$
$$\text{Total Score} = \text{Base Score} + \text{Shiny Pure Bonus} \quad (\text{Shiny Pure} \le \text{Pure})$$

### 7.2. Invariant Konsistensi Clear Type (Lamp)
- **Pure Memory (`clear_type = 3`)**: Wajib memenuhi syarat:
  $$\text{Score} \ge 10\,000\,000, \quad \text{Near/Far} = 0, \quad \text{Miss/Lost} = 0$$
- **Full Recall (`clear_type = 2`)**: Wajib memenuhi syarat:
  $$\text{Miss/Lost} = 0, \quad \text{Near/Far} > 0, \quad \text{Score} < 10\,000\,000$$
- **Normal Clear (`clear_type = 1`)**: Wajib $\text{Miss/Lost} > 0$, dan gauge akhir $\ge 70\%$.

### 7.3. Perhitungan Potential (PTT)
Server Celestl menerapkan formula ganda yang dapat dikonfigurasi melalui [`core/config_manager.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/core/config_manager.py):
1. **Mode Modern Arcaea 5.0+ (B50 + B10)**:
   $$\text{PTT} = \frac{\sum \text{Top 50 Best} + \sum \text{Top 10 Best}}{60} + \text{Clear Bonus (0.2)}$$
2. **Mode Klasik Arcaea (B30 + R10)**:
   $$\text{PTT} = \frac{\sum \text{Top 30 Best} + \sum \text{Top 10 Recent}}{40}$$
Skrip [`tools/generate_user_saves.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/tools/generate_user_saves.py) dan [`tools/update_celest_scores.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/tools/update_celest_scores.py) secara otomatis menghitung ulang nilai PTT akun pemain setiap kali data skor diperbarui.

---

## 8. Ringkasan Perintah CLI & Pemeliharaan Server

Seluruh operasi server dapat dikelola melalui shortcut global di terminal:

```bash
# 1. Menampilkan statistik ekonomi, progres fragmen, dan potensi maksimal B50
celest-stats

# 2. Audit integritas chart, unlock list, dan background aset
celest-audit --check

# 3. Memperbaiki dan menormalkan integritas database & chart secara otomatis
celest-audit --fix

# 4. Menjalankan daemon private server lokal
celest-server-start

# 5. Menghentikan daemon private server lokal dan melepaskan seluruh port
celest-server-stop

# 6. Memperbarui save data seluruh pengguna dari best_score
python3 ArcaeaServerFork/tools/generate_user_saves.py --all

# 7. Restart container server produksi pada VPS (sshsefeo)
sshsefeo "docker restart celest-arcaea-server"
```

