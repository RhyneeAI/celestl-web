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
| `bg` | **Wajib** | Background utama lagu di `songlist`. Nama background **harus ada di APK vanilla** (`assets/img/bg/`) ATAU tersedia sebagai file custom di folder lagu. Standar kualitas gambar custom: **`1920×1440`** (4:3) atau **`1920×1080`** (16:9), ukuran file **`≥ 100 KB`**, format JPEG RGB. File < 100 KB dianggap kualitas rendah (720p) dan wajib di-enhance otomatis ke 1080p. Perhatikan penamaan baku: gunakan `lanota-light` (bukan `lanota_light`), `chunithmnew_conflict` (bukan `chunithm_new_conflict`), `base_conflict` (bukan `conflict`). |
| `bg_inverse` | *Opsional* | Background alternatif untuk mode inversi (Light/Conflict) atau skill partner tertentu. Jika didefinisikan, harus memenuhi standar kualitas yang sama dengan `bg`. |
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
* **Penyebab Crash Native**:
  Di dalam engine C++ (`libcocos2dcpp.so` / `LogicChart`), posisi vertikal note, kecepatan scroll, dan subdivisi ketukan dihitung dengan membagi terhadap BPM:
  $$\Delta t_{\text{tick}} = \frac{60000}{\text{bpm} \times \text{density}}, \quad \text{beat} = \frac{(T - t_0) \times \text{bpm}}{60000}$$
  Jika $\text{bpm} = 0.00$, operasi pembagian menghasilkan `NaN` atau `+Infinity`. Nilai ini merusak transformasi matriks OpenGL, menyebabkan loop alokasi tak terbatas, atau seketika memicu crash fatal saat inisialisasi chart.
* **Perbedaan Kasus $t = 0$ vs $t > 0$**:
  1. **Kasus $t = 0$ (Inisialisasi Chart Awal)**:
     - **Masalah**: Setiap chart Arcaea wajib memiliki titik awal timing di $t = 0$. Jika $t = 0$ memiliki BPM `0.00`, engine gagal menginisialisasi kecepatan awal kamera dan note horizon. Jika dinormalisasi ke `0.01`, note di awal lagu akan menumpuk tidak bergerak di garis start selamanya.
     - **Solusi**: Di $t = 0$, BPM **wajib diganti dengan Base BPM positif lagu** (misalnya `180.00` jika lagu tersebut ber-tempo 180 BPM).
     - **Contoh Kasus**:
       ```text
       // Sebelum (Crash saat lagu mulai / loading freeze):
       timing(0,0.00,4.00);

       // Sesudah (Aman, note meluncur sesuai tempo dasar lagu):
       timing(0,180.00,4.00);
       ```
  2. **Kasus $t > 0$ (Gimmick Visual Stop di Tengah Lagu)**:
     - **Masalah**: Pada fanmade chart atau chart gimmick (misal saat jeda drum atau suara hening), charter sengaja memasukkan `0.00` BPM dengan maksud agar note "berhenti diam membeku" di layar (Stop Gimmick).
     - **Solusi**: Di $t > 0$, BPM dinormalisasi menjadi **`0.01`** (`timing(t, 0.01, beats);`).
     - **Mengapa 0.01?**: Kecepatan scroll pada $0.01$ BPM hanya bergeser sekitar $0.0001\text{ px/detik}$ (secara visual mata manusia notes tampak diam membeku 100%), namun secara matematika C++: $\frac{x}{0.01}$ adalah angka berhingga yang valid, sehingga pembagian nol terhindar dan gimmick visual charter tetap terwujud sempurna!
     - **Contoh Kasus**:
       ```text
       timing(0,180.00,4.00);
       // ... note berjalan normal ...
       // Charter ingin chart berhenti diam selama 2 detik dari t=25000 ke t=27000:
       timing(25000,0.01,4.00);  // Dinormalisasi dari 0.00 menjadi 0.01
       timing(27000,180.00,4.00); // Lagu lanjut berjalan normal kembali
       ```

### 4.2. Extreme BPM & Scientific Notation (Rentang Floating Point & Scudo OOM)
* **Mengapa Extreme BPM Memicu Crash Padahal Float Adalah 32-bit?**:
  Tipe data `float` (IEEE 754 32-bit single-precision) memang memiliki rentang teoritis hingga $\approx 3.4 \times 10^{38}$. Namun crash pada BPM ekstrem bukan karena batas floating-point arsitektur, melainkan akibat 3 faktor kritis:
  1. **Scudo Memory Allocator OOM (Out Of Memory) akibat Loop Tick Hold/Arc**:
     Engine Arcaea menggunakan BPM untuk mengalokasikan struct Judgement Tick pada setiap Hold Note dan Arc Note:
     $$\text{num\_ticks} = \frac{(t_2 - t_1) \times |\text{bpm}|}{60000 \times \text{density}}$$
     - Pada BPM 200 normal (hold 1 detik): $\text{num\_ticks} \approx 3\text{ ticks}$ (sangat ringan).
     - Pada BPM 6 digit ($1,000,000$): $\text{num\_ticks} \approx 16,666\text{ ticks}$ (mulai membebani heap).
     - Pada BPM 8 digit ($10^8$ s/d $7 \times 10^8$, misal `7E+08`): $\text{num\_ticks} > 11,000,000\text{ ticks}$!
     - Android dengan Scudo Memory Allocator akan langsung menghentikan proses (*kill process via SIGABRT / OOM*) karena kehabisan RAM dalam hitungan milidetik saat mengalokasikan puluhan juta node tick dalam 1 frame.
  2. **Float Precision Loss (Mantissa 24-bit)**:
     Float 32-bit hanya memiliki presisi mantissa 24-bit (sekitar 7 digit desimal). Jika BPM mencapai 7–8 digit, perhitungan koordinat $y$ note kehilangan presisi desimal (*catastrophic cancellation*), menyebabkan note bergetar (*jittering*) hebat atau melompat keluar layar.
  3. **Lexer Incompatibility dengan Notasi Ilmiah (`e`/`E`)**:
     Exporter chart sering menuliskan angka besar dalam notasi ilmiah (seperti `7E+08` atau `1.5e7`). Parser Arcaea tidak mengenali huruf `'e'`/`'E'` pada token angka dan langsung membatalkan parsing chart (*syntax error*).
* **Batas Toleransi yang Didukung**:
  - Untuk teleport gimmick instan (tanpa hold note aktif), engine Arcaea dapat mentoleransi BPM hingga **6 digit desimal (`±1,000,000.00`)**.
  - Nilai di atas $10^6$ atau yang berformat notasi ilmiah otomatis di-clamp ke rentang aman $[-1000000.00, 1000000.00]$ dan diformat sebagai **float desimal murni** (`%.2f`) tanpa karakter eksponensial.

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

### 6.1. Menjalankan Automated Test & Shortcut CLI
Skrip pengujian otomatis telah disediakan dan dapat dijalankan kapan saja dari root repository, folder tools, atau langsung dari terminal via shortcut global di PATH:

```bash
# === SHORTCUT GLOBAL (Dapat dijalankan langsung dari direktori mana saja) ===
# 1. Menampilkan Statistik Ekonomi Server & Progresi Songlist (Bagian 7) secara instan:
celest-stats
# Atau:
celest-audit --stats

# 2. Mode Audit Penuh (Memeriksa integritas seluruh 128 lagu dan 432 chart):
celest-audit --check

# 3. Mode Auto-Repair (Memeriksa dan otomatis memperbaiki semua issue yang terdeteksi):
celest-audit --fix

# 4. Audit Ketersediaan Background (Vanilla APK vs Custom Assets vs Patched Client):
celest-audit --bg

# 5. Uji Coba Lagu Tertentu Secara Spesifik:
celest-audit --song <song_id>
```

Atau menggunakan pemanggilan skrip langsung:
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

---

## 7. Statistik Ekonomi Server & Progresi Songlist (Pre-Build Statistics)

Sebelum memulai packaging APK, tool audit integrity secara otomatis mengkalkulasi dan mencetak metrik progresi ekonomi dan distribusi tingkat kesulitan server:

### 7.1. Total Fragment Unlock
* **Total Fragment Positif Wajib**: **`16,238 Fragments`** (tersebar pada 151 aturan unlock berdasarkan formula `rating * 10 + ratingClass`).
* **Bonus Fragment Negatif (Bantuan Player Baru)**: **`-9,696 Fragments`** (contoh: `darlingdance` FTR `-2727`, `rabbitintheblackroom` FTR `-6969`). Nilai ini **diabaikan dari total biaya** karena berfungsi menyuntikkan saldo fragment gratis secara instan bagi akun baru saat membuka lagu.

### 7.2. Total Memories Unlock
* **Pembelian Pack (4 Pack @ 500 Memories)**: **`2,000 Memories`**
  - *Wanderlust Eternal* (`wanderlust`): 500 Memories (6 lagu)
  - *Kurumi* (`kurumi`): 500 Memories (11 lagu)
  - *Yue* (`yue`): 500 Memories (17 lagu)
  - *Observer / Esoteric Order* (`observer`): 500 Memories (1 lagu)
* **Pembelian Lagu Tunggal (Single)**:
  - Database terdaftar saat ini (92 single): **`99,370 Memories`** (dihitung dinamis dari `highest_constant * 100` di SQLite database)
* **Total Kebutuhan Memories Server**: **`101,370 Memories`** (4 pack + 92 single).

### 7.3. Total Lagu per Difficulty Class
Dari total **128 lagu** di katalog server, terdapat **432 chart file**:
- **Past (0)**: **128 lagu** (100% lengkap)
- **Present (1)**: **128 lagu** (100% lengkap)
- **Future (2)**: **128 lagu** (100% lengkap)
- **Beyond (3)**: **28 lagu**
- **Eternal (4)**: **20 lagu**

### 7.4. Distribusi Difficulty Angka (Rated vs Unrated)
- **Rated Charts (`rating > 0`)**: **171 charts**
- **Dummy Unrated Charts (`rating == 0`)**: **261 charts** (chart placeholder pelindung crash Cocos2d-x)
- **Rincian Sebaran Tingkat Kesulitan**:
  - `Level 1` : 1 chart
  - `Level 2` : 1 chart
  - `Level 3` : 3 charts
  - `Level 4` : 1 chart
  - `Level 5` : 3 charts
  - `Level 6` : 4 charts
  - `Level 7` : 3 charts | `Level 7+` : 1 chart
  - `Level 8` : 2 charts | `Level 8+` : 4 charts
  - `Level 9` : 11 charts | `Level 9+`: 15 charts
  - `Level 10`: 34 charts | `Level 10+`: 32 charts
  - `Level 11`: 45 charts | `Level 11+`: 4 charts
  - `Level 12`: 6 charts | `Level 12+`: 1 chart

### 7.5. Teoretis Max Potential Rating (Sistem 3-Digit Precision & +0.2 Clear Bonus)
Pada arsitektur server terkini (`core/score.py` & `core/config_manager.py`), perhitungan potential menggunakan **sistem presisi 3 digit desimal** (`round(ptt * 1000)`) dan menerapkan **bonus rating `+0.2`** saat lagu berhasil di-clear (`Constant.CLEAR_BONUS = 0.2` untuk `clear_type != 0`):

$$\text{PM Play Rating} = \text{Chart Constant} + 2.0 + 0.2 = \text{Chart Constant} + \mathbf{2.200}$$

* **Modern Best 50 (Rata-rata Top 50 Lagu + 0.2 Clear Bonus)**: **`13.668`** (Eksak: `13.6680`, Integer DB: `13668`)
* **Legacy Best 30 (Rata-rata Top 30 Lagu + 0.2 Clear Bonus)**: **`13.917`** (Eksak: `13.9167`, Integer DB: `13917`)
* **Rumus Aktif Celest-Server (`1/60 * Best 10 + 1/60 * Best 50`)**: **`13.782`** (Eksak: `13.7817`, Integer DB: `13782`)
* *(Sebagai perbandingan, Base PM murni tanpa Clear Bonus: B30 = `13.717` (~13.72), B50 = `13.468` (~13.47))*.

* **Top 5 Lagu dengan Chart Constant Tertinggi (dengan +0.2 Clear Bonus)**:
  1. `lostrequiembyd` [BYD] — Constant `12.9` $\rightarrow$ PM Rating: **`15.100`**
  2. `lostrequiem` [FTR] — Constant `12.6` $\rightarrow$ PM Rating: **`14.800`**
  3. `rinka` [BYD] — Constant `12.2` $\rightarrow$ PM Rating: **`14.400`**
  4. `arcaeamashup` [BYD] — Constant `12.1` $\rightarrow$ PM Rating: **`14.300`**
  5. `merikurilostinthesnowstorm` [BYD] — Constant `12.1` $\rightarrow$ PM Rating: **`14.300`**

### 7.6. Ketersediaan Background & Status Bundling Client APK
Pengecekan integritas background memverifikasi seluruh deklarasi `bg`, `bg_inverse`, dan difficulty-level `bg` terhadap aset **Vanilla APK** (`arcaea_7.1.0c.apk`), aset folder lagu server (`ArcaeaServerFork/database/songs/`), dan file **Patched APK Client** (`arcaea_7.1.0c_patched.apk`):
* **Total Referensi Background Diverifikasi**: **`185 referensi`**
* **Tersedia di Vanilla Client APK**: **`120 referensi`** (misal: `base_light`, `base_conflict`, `pentiment`, `chunithmnew_conflict`, `lanota-light`, dll.)
* **Tersedia di Custom Server Assets**: **`65 referensi`** (background kustom fanmade beresolusi $\ge 1080$p)
* **Status Patched Client APK**: **`185 / 185 ter-bundle (100% Bundled)`** (termasuk background `terabyte` pada lagu `terabyteconnection`)
* **Missing Backgrounds (Fatal Crash Cocos2d-x)**: **`0 (Zero Missing)`** — seluruh 185 background terverifikasi 100% aman dan tidak ada aset yang hilang.

Tool CLI ini dapat dijalankan mandiri kapan saja dengan:
```bash
celest-audit --bg
# Atau untuk lagu tertentu:
celest-audit --bg --song <song_id>
```
# Atau untuk lagu tertentu:
/home/luhung/.venvs/arcaea-server/bin/python ArcaeaServerFork/tools/check_chart_integrity.py --check-bg --song <song_id>
```
