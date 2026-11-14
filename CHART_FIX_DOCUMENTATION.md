# Dokumentasi Wajib Integritas Chart, Aset & Automated Testing (`.aff` — Arcaea 7.1.0c)

Dokumen ini adalah spesifikasi teknis dan panduan pengujian wajib (*mandatory verification checklist*) yang harus dijalankan sebelum melakukan build/patch APK atau setelah menambahkan/memperbarui chart lagu pada Arcaea Server. Seluruh aturan diverifikasi langsung terhadap perilaku engine native `libcocos2dcpp.so` (Cocos2d-x / LogicChart) pada Arcaea `7.1.0c`.

Suite pengujian otomatis tersedia di:
- Skrip testing: [`ArcaeaServerFork/tools/check_chart_integrity.py`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/tools/check_chart_integrity.py)
- Symlink root: [`check_chart_integrity.py`](file:///home/luhung/Documents/project/Celestl/check_chart_integrity.py)

---

## 1. Songlist & Difficulty Checker (Wajib 0.aff, 1.aff, 2.aff)

### 1.1. Akar Masalah Native C++
Di Arcaea resmi, **100% lagu memiliki difficulty dasar**:
- `0`: Past (PST)
- `1`: Present (PRS)
- `2`: Future (FTR)
- `3`: Beyond (BYD) *(opsional)*
- `4`: Eternal (ETR) *(opsional)*

Ketika pemain membuka menu Song Select dan berpindah tab difficulty (misal menekan tab **PAST** atau **PRESENT**), engine C++ melakukan iterasi seluruh lagu dan memanggil:
```cpp
auto diff = song->getDifficulty(ratingClass);
int r = diff->rating; // DEREFERENSI POINTER
```
Jika sebuah lagu hanya memiliki chart FTR (`ratingClass: 2`) atau hanya ETR (`ratingClass: 4`), pemanggilan `getDifficulty(0)` atau `getDifficulty(1)` mengembalikan `nullptr`. Saat properti `diff` dibaca, sistem Android memicu sinyal **`SIGSEGV (SEGV_MAPERR)` / crash seketika** (seperti yang tercatat pada `tombstone_32`).

Selain itu, jika difficulty dasar tidak terdaftar di file [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) atau file `.aff`-nya tidak ada di disk, Song Select menganggap lagu tersebut **belum lengkap terunduh**, memunculkan tombol unduh $(\downarrow)$ yang ketika diklik memicu pop-up semu *"All songs has downloaded successfully"*.

### 1.2. Aturan Wajib
1. Setiap entri lagu di [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) **wajib mendaftarkan minimal ratingClass `0`, `1`, dan `2`**.
2. Jika charter hanya menyediakan difficulty tertentu (misalnya hanya FTR atau hanya ETR), difficulty dasar yang tidak tersedia wajib diisi dengan **dummy difficulty unrated**:
   ```json
   {
     "ratingClass": 0,
     "chartDesigner": "-",
     "jacketDesigner": "",
     "rating": 0
   },
   {
     "ratingClass": 1,
     "chartDesigner": "-",
     "jacketDesigner": "",
     "rating": 0
   }
   ```
   *(Dan tambahkan `ratingClass: 2` dengan `rating: 0` jika lagu tersebut adalah ETR-only atau BYD-only)*.
3. Di direktori lagu, wajib tersedia file chart dummy `0.aff` dan `1.aff` (serta `2.aff` jika missing):
   ```text
   AudioOffset:0
   TimingPointDensityFactor:1
   -
   timing(0,4.00,4.00);
   (1000,1);
   ```
4. Seluruh array `difficulties` di [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) harus diurutkan secara ascending berdasarkan `ratingClass` ($0 \rightarrow 1 \rightarrow 2 \rightarrow 3/4$).

---

## 2. Struktur Dasar File Lagu (Mandatory Song Assets)

Setiap folder lagu di [`database/songs/<song_id>/`](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/) wajib memiliki struktur file lengkap berikut:

| File | Status | Keterangan & Standar Teknis |
| :--- | :---: | :--- |
| `0.aff`, `1.aff`, `2.aff` | **Wajib** | File chart untuk difficulty Past, Present, Future. Wajib sinkron dengan array `difficulties` di `songlist`. |
| `3.aff` / `4.aff` | *Kondisional* | Wajib ada jika difficulty Beyond (3) atau Eternal (4) dideklarasikan di `songlist`. |
| `base.ogg` | **Wajib** | Audio lagu utama. Format: Ogg Vorbis, stereo, 44.1kHz / 48kHz. File tidak boleh kosong (> 4 KB) dan durasi > 0s. |
| `preview.ogg` | **Wajib** | Audio preview saat pemilihan lagu. Wajib Ogg Vorbis utuh (tidak boleh terpotong / truncated EOF). Rentang durasi ideal: 15–25 detik dengan fade in/out. Nilai `audioPreview` dan `audioPreviewEnd` di `songlist` tidak boleh melebihi durasi `base.ogg`. |
| `{rc}_preview.ogg` | *Kondisional* | Wajib ada jika difficulty tertentu memiliki `"audioOverride": true` (misal `3_preview.ogg` pada lagu `merikurilostinthesnowstorm`). |
| `base.jpg` | **Wajib** | Cover jacket resolusi standar: **`512×512`**, format JPEG RGB (bukan PNG / RGBA). |
| `base_256.jpg` | **Wajib** | Thumbnail jacket: **`256×256`**, JPEG RGB. Digunakan pada song wheel dan dialog. |
| `1080_base.jpg` | **Wajib** | High-definition jacket untuk layar 1080p: **`768×768`**, JPEG RGB. |
| `1080_base_256.jpg` | **Wajib** | Thumbnail HD: **`384×384`**, JPEG RGB. |
| `{rc}.jpg`, `1080_{rc}.jpg` | *Kondisional* | Wajib ada jika difficulty tertentu memiliki `"jacketOverride": true` (contoh: `3.jpg`, `1080_3.jpg`). |
| `bg` & `bg_inverse` | *Opsional* | Jika didefinisikan di `songlist`, nama background **harus ada di APK vanilla** (`assets/img/bg/`) ATAU tersedia sebagai file custom di folder lagu. Tidak boleh salah ketik (contoh: gunakan `lanota-light` bukan `lanota_light`, `chunithmnew_conflict` bukan `chunithm_new_conflict`, `base_conflict` bukan `conflict`). |
| `*.wav` SFX | *Opsional* | Jika chart `.aff` memanggil custom hitsound (contoh: `biji_wav` atau `glass_wav`), file audio pendukung (`biji.wav`, `glass.wav`) wajib ada di folder lagu. |

---

## 3. AffParser Safety: Elemen yang Didukung & Dinormalisasi

Berikut adalah fitur chart yang **didukung oleh engine native Arcaea 7.1.0c** namun wajib mengikuti aturan sintaks ketat agar parser tidak mengalami kegagalan baca:

### 3.1. Negative BPM
* **Perilaku Engine**: Native `LogicChart` mendukung BPM negatif pada event `timing(t, bpm, beats);` untuk efek scroll mundur.
* **Aturan Format**:
  * Nilai BPM negatif dipertahankan sepenuhnya.
  * Format nilai BPM wajib berupa desimal bertitik dengan 2 desimal: `f"{bpm:.2f}"` (contoh: `-120.00`).
  * Tidak boleh ada timing line dengan timestamp negatif ($t < 0$) sebelum $t = 0$.

### 3.2. Native SceneControl
* **Perilaku Engine**: `libcocos2dcpp.so` mengenali **9 SceneControl resmi**:
  * 2 Argumen: `trackhide`, `trackshow`
  * 4 Argumen: `trackdisplay`, `redline`, `arcahvdistort`, `arcahvdebris`, `hidegroup`, `enwidenlanes`, `enwidencamera`
* **Aturan Format**:
  * SceneControl 3 argumen non-standar (`scenecontrol(t, hidegroup, val);`) harus dinormalisasi menjadi 4 argumen: `scenecontrol(t, hidegroup, 0.00, <1|0>);`.
  * Parameter boolean ke-4 (`hidegroup`, `enwidenlanes`, `enwidencamera`): gunakan **`1`** (aktif) dan **`0`** (non-aktif).
  * Khusus `trackdisplay`: Skala opacity adalah `0..255`. Jika bernilai `1.0`, otomatis dinormalisasi ke `255` agar lintasan terlihat utuh.

### 3.3. Camera Events & Extended Lanes
* **Perilaku Engine**: Parser mendukung event kamera:
  `camera(t, trans_x, trans_y, trans_z, rot_x, rot_y, rot_z, easing, duration);`
* **Aturan Format**:
  * 6 parameter koordinat dan rotasi wajib berupa float desimal `%.2f`.
  * Parameter `easing` harus merupakan tipe valid: `l`, `s`, `qi`, `qo`, atau `reset`.
  * `duration` wajib integer non-negatif ($\ge 0$).
  * Lane `0` dan `5` (efek `enwidenlanes`) didukung secara native.

### 3.4. Normalisasi Angka Desimal (Mandatory Decimals)
* **Perilaku Engine**: Lexer `.aff` membedakan token integer (`TINT`) dan token float (`TFLOAT`). Angka tanpa titik desimal pada posisi float akan menyebabkan kegagalan parse.
* **Aturan Format**:
  * Seluruh parameter `bpm` dan `beats` pada baris `timing(t, bpm, beats);` wajib memiliki titik desimal (contoh: `140.00`, bukan `140`).
  * Koordinat `arc(t1, t2, x1, x2, ...)` wajib desimal `%.2f`.

---

## 4. AffParser Safety: Elemen Terlarang yang Memicu Crash

Unsur-unsur berikut **tidak didukung dan wajib dibersihkan atau diganti** secara otomatis sebelum chart dimasukkan ke dalam game:

### 4.1. Zero BPM (Division by Zero)
* **Penyebab Crash**: Nilai `bpm = 0.00` memicu pembagian nol saat engine menghitung posisi vertikal note dan tick hold, menghasilkan `NaN`/freeze atau crash saat transisi chart.
* **Solusi**:
  * Jika Zero BPM berada di $t = 0$: ganti dengan **Base BPM positif** lagu tersebut.
  * Jika Zero BPM berada di $t > 0$ (gimmick visual stop): ganti menjadi **`0.01`** (`timing(t, 0.01, beats);`). Efek visual stop tetap terjaga tanpa pembagian nol.

### 4.2. Extreme BPM & Scientific Notation
* **Penyebab Crash**:
  * Angka dengan notasi ilmiah seperti `7E+08` tidak dapat dibaca oleh lexer C++ Arcaea.
  * BPM bernilai sangat besar ($\ge 10^8$ BPM) pada segmen dengan hold atau arc solid memicu **`Scudo OOM`** karena engine mencoba mengalokasikan puluhan juta node tick (`(t2 - t1) * abs(bpm) / 30000.0`).
* **Solusi**:
  * Nilai BPM dibatasi pada rentang aman (maksimal `10000.00` atau `-10000.00`).
  * Semua angka notasi ilmiah dinormalisasi menjadi float desimal biasa (`%.2f`).

### 4.3. Anomaly SceneControls & ArcCreate Extensions
* **Penyebab Crash**: SceneControl pihak ketiga dari simulator/editor (ArcCreate) seperti `groupalpha`, `charterswitch`, `bgshow`, `bgcreate`, `hudalpha`, `setangle`, dll. tidak terdaftar di binary resmi dan menyebabkan syntax error.
* **Solusi**:
  * Seluruh SceneControl yang tidak termasuk dalam daftar 9 SceneControl native langsung **dihapus**.
  * Modifier non-native pada header `timinggroup(...)` (seperti `name="..."`, `noclip`, `autoplay`, `arcresolution=...`) dibersihkan, hanya menyisakan flag native `noinput`, `fadingholds`, atau `noinput_fadingholds`.
  * Nilai warna arc $> 2$ di-clamp menjadi `color % 2`.

---

## 5. Hot Reload Server & Remote Download Sync

### 5.1. Mekanisme Hot-Reload Client Arcaea
* **Arcaea tidak melakukan polling aktif ke server saat chart dimainkan.**
* Client menentukan apakah suatu file lagu lokal di `/data/data/moe.low.arc/files/dl/` perlu diunduh ulang dengan **membandingkan nilai `"date"` pada `songlist` lokal APK** dengan timestamp saat lagu pertama kali diunduh.
* Jika charter memperbarui file `.aff` di server tetapi field `"date"` di `songlist` tidak dinaikkan, client tetap memakai file cache lokal lama dan tidak meminta pembaruan.

### 5.2. Aturan Wajib Hot-Reload
1. **Update Key `"date"` Saat Edit Chart**:
   Ketika mengedit atau memperbaiki file `.aff` di direktori `database/songs/<song_id>/`, timestamp `"date"` pada [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) **wajib diperbarui ke epoch detik terkini**:
   ```python
   song["date"] = int(time.time())
   ```
2. **Flag `"remote_dl": true`**:
   Seluruh lagu custom/fanmade dari server (kecuali lagu offline dasar seperti `infinityheaven`) **wajib memiliki `"remote_dl": true`**. Ini memastikan binary client mengambil chart dan audio terbaru dari server dan mengizinkan redownload dinamis.
3. **Penyelarasan Cache Server (`SongFileCache`)**:
   Setelah mengubah chart atau songlist, jalankan sinkronisasi signature cache server:
   ```bash
   cd ArcaeaServerFork && /home/luhung/.venvs/arcaea-server/bin/python -c "from core.download import SongFileCache; SongFileCache.sync_all()"
   ```
   Server watcher (`SongFileWatcher`) juga secara otomatis mendeteksi perubahan file di `database/songs/` setiap 1 detik.

---

## 6. Automated Testing Suite & CI/CD Pre-Build Hook

### 6.1. Menjalankan Automated Test
Skrip pengujian otomatis telah disediakan dan dapat dijalankan kapan saja dari root repository atau folder tools:

```bash
# 1. Mode Audit (Hanya memeriksa tanpa mengubah file):
/home/luhung/.venvs/arcaea-server/bin/python check_chart_integrity.py --check

# 2. Mode Auto-Repair (Memeriksa dan otomatis memperbaiki semua issue yang terdeteksi):
/home/luhung/.venvs/arcaea-server/bin/python check_chart_integrity.py --fix

# 3. Mode Single Song (Memeriksa lagu tertentu secara spesifik):
/home/luhung/.venvs/arcaea-server/bin/python check_chart_integrity.py --fix --song <song_id>
```

### 6.2. Integrasi Otomatis ke Build Tool (`patch_arcaea.py`)
Skrip [patch_arcaea.py](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/tools/patch_arcaea.py) telah dilengkapi dengan **Pre-Packaging Integrity Hook**:
* Setiap kali perintah rebuild APK dijalankan, `check_chart_integrity.py` akan dipanggil terlebih dahulu secara otomatis dengan mode `--fix`.
* Jika ditemukan file yang tidak lengkap, script akan otomatis menghasilkan file dummy, memperbaiki background typo, dan menormalisasi BPM sebelum APK dirakit.
* Jika terdapat kegagalan fatal yang tidak dapat diperbaiki otomatis, proses build langsung dihentikan (*abort*) sehingga **tidak akan pernah ada APK rusak yang ter-generate ke perangkat client**.
