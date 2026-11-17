# Identifikasi Lengkap 17 Folder Lagu Batch 5 (`1batch5`) — Versi Terkoreksi & Terverifikasi

> [!NOTE]
> Dokumen ini mencakup **17 entri lagu Batch 5 (v1.5)** yang dianalisis langsung dari **folder** di `/home/luhung/Documents/Chart/1batch5` sebagai acuan utama.
> Seluruh arahan dan konfirmasi pengguna telah diterapkan:
> 1. **Audio Preview Terkonfirmasi:**
>    - `euphoria`: Diatur ke klimaks chorus **`25340 - 45340 ms`** (20.0s).
>    - `stronger`: Diatur ke drop chorus vokal **`34375 - 54375 ms`** (20.0s).
>    - `finorza`: Disamakan ke chorus ETR **`87085 - 107351 ms`** (20.27s).
>    - `galacticwarzone`: Disamakan ke **`33702 - 55772 ms`** (22.07s).
>    - `astaroth`: Dipertahankan sesuai file asli di **`0 - 28000 ms`** (28.0s).
> 2. **Normalisasi & Pilihan Background / Track Skin:**
>    - `finorza`: Menggunakan custom BG **`finorza.jpg`** (upscale dari `bg.png`), Track Skin **`tempestissimo`**, Side **`lephon dark (3)`**.
>    - `stardustray`: Background vanilla **`lamia`**.
>    - `superemulator`: Background vanilla **`pentiment`**, Side **`pentiment (4)`**.
>    - `solarorbit`: Background vanilla **`quon`**, Side **`light (0)`**.
>    - `superreactorx`: Background vanilla **`wacca_conflict`**, `bg_inverse: wacca_light`.
>    - `millionpp`: Background vanilla **`byd_2_conflict`**, `bg_inverse: byd_2_light`.
>    - `z:irnitra`: Menggunakan custom BG **`zirnitra.jpg`** (upscale dari `bg.png`), Track Skin **`tempestissimo`**, Side **`lephon dark (3)`**.
>    - `euphoria`: Menggunakan custom BG **`euphoria.jpg`** (upscale HD), Side **`colorless (2)`**.
>    - `deicide`: Menggunakan custom HD **`deicide.jpg`** (1920×1440), Side **`colorless (2)`**.
>    - `galacticwarzone`: Menggunakan custom HD **`galacticwarzone.jpg`** (upscale HD), Track Skin **`conflictvs`**.
>    - Lagu dengan dual vanilla BG: `astaroth` (`lanota-conflict` / `light`), `entertherave` (`ongeki_conflict` / `light`), `trackwilderness` (`vs_conflict` / `light`), `lyrith` (`vs_conflict` / `light`), `stronger` (`single2_light` / `conflict`).
> 3. **Penyatuan (Merge) 2 Lagu yang Sudah Ada:**
>    - **`heavensrain` (Opsi A):** Chart `2.aff` Kurumi087 dimasukkan ke slot **FTR 11 (CC 11.6)** melengkapi slot ETR 12 ZydeKun yang sudah ada di server.
>    - **`phony`:** Dileburkan ke folder `phony` yang sudah ada di server, di mana chart Kurumi087 dimasukkan ke slot **ETR 10 (CC 10.1)** sebagai `4.aff`.
> 4. **Penyesuaian Khusus Slot Kesulitan:**
>    - **`astaroth`:** Chart Present (1.aff) ditiadakan dan diganti dummy unrated placeholder (`rating: 0`). Hanya menyisakan Future 11 (`2.aff` CC 11.4 Kurumi).
>    - **`stardustray`:** Chart `1.aff` dipindahkan ke slot **FTR 10 (CC 10.3, Kurumi:087)**, dan chart `2.aff` dipindahkan ke slot **ETR 10+ (CC 10.9, recharge & Archtoz)** sebagai `4.aff`. Base 0 & 1 menggunakan dummy.
>    - **`finorza`:** Chart Nikro dipetakan ke slot **ETR 12 (CC 12.6)** sebagai `4.aff`. Base diffs: dummy 0, dummy 1, FTR 11 (`2.aff` CC 11.4).

---

## Ringkasan 17 Lagu Batch 5 (Tabel Master Terkoreksi)

| No | Judul Lagu | Folder Sumber | Song ID | Composer | BPM (Base) | Difficulty Slot | Chart Constant | Charter | Background (`bg` / `bg_inverse`) | Side | Track Skin | Audio Preview |
|:---:|---|---|---|---|:---:|:---:|:---:|---|---|:---:|---|:---:|
| 1 | **Astaroth** | `comboAstaroth` | `astaroth` | Team Grimoire | `210` | FTR 11 | 11.4 | Kurumi (FTR) | `lanota-conflict` / `lanota-light` | `conflict (1)` | `default` | `0 - 28000 ms`<br>(28.0s) |
| 2 | **Enter The Rave** | `comboEntertherave` | `entertherave` | USAO | `195` | FTR 10+ | 10.8 | LivalinkZ | `ongeki_conflict` / `ongeki_light` | `conflict (1)` | `default` | `134000 - 153769 ms`<br>(19.77s) |
| 3 | **Euphoria (feat. Tsugumi Nagahara)** | `comboEuphoria` | `euphoria` | PIKASONIC & Tatsunoshin | `175` | FTR 10 | 10.2 | Ar+1 | `euphoria` *(Custom HD)* | `colorless (2)` | `light` | `25340 - 45340 ms`<br>(20.0s) |
| 4 | **Stardust:RAY** | `comboStardustray` | `stardustray` | kanone vs. BlackY | `164` | FTR 10<br>ETR 10+ | 10.3<br>10.9 | Kurumi:087 (FTR)<br>recharge & Archtoz (ETR) | `lamia` | `conflict (1)` | `default` | `49756 - 74999 ms`<br>(25.24s) |
| 5 | **SUPER EMULATOR** | `comboSuperemulator` | `superemulator` | Kobaryo feat. HiTNEX-X | `208` | FTR 11 | 11.0 | Archtesia | `pentiment` | `pentiment (4)` | `conflict` | `64904 - 87694 ms`<br>(22.79s) |
| 6 | **Track Wilderness** | `comboTrackwilderness` | `trackwilderness` | Noah | `217` | FTR 10+ | 10.7 | DreamFlux- | `vs_conflict` / `vs_light` | `conflict (1)` | `default` | `87304 - 110875 ms`<br>(23.57s) |
| 7 | **ƒiиorzᾶ** | `finorza` | `finorza` | かめりあ feat. ななひら | `225` | FTR 11<br>ETR 12 | 11.4<br>12.6 | - (FTR)<br>Nikro (ETR) | `finorza` *(Custom HD)* | `lephon dark (3)` | `tempestissimo` | `87085 - 107351 ms`<br>(20.27s) |
| 8 | **黃道、知希朋友と紡ぎありく。**<br>*(SolarOrbit)* | `imrich.solarorbitNERFED` | `solarorbit` | Apo11o"FIXEDSTAR"program | `105 - 440`<br>(220.0) | FTR 11<br>ETR 11 | 11.1<br>11.5 | - (FTR)<br>imrich (Nerfed) (ETR) | `quon` | `light (0)` | `rei` | `20685 - 40091 ms`<br>(19.41s) |
| 9 | **HeaveИ's Rain** | `kurumi087.heavensrain` | `heavensrain` | モリモリあつし | `285` | **FTR 11**<br>*(Merge)* | **11.6** | Kurumi087 | `heavensrain` *(Custom HD)* | `lephon (2)` | `light` | `48000 - 69401 ms`<br>(21.40s) |
| 10 | **フォニイ**<br>*(Phony)* | `Kurumi087.phony` | `phony` | ツミキ feat. 可不 | `170` | **ETR 10**<br>*(Merge)* | **10.1** | Kurumi087 | `rei` | `light (0)` | `rei` | `61873 - 84462 ms`<br>(22.59s) |
| 11 | **SUPER REACTOR X** | `kurumi087.superreactorx` | `superreactorx` | Kobaryo feat. HiTNEX-X | `152` | FTR 10 | 10.6 | Kurumi087 | `wacca_conflict` / `wacca_light` | `conflict (1)` | `conflict` | `1806 - 25786 ms`<br>(23.98s) |
| 12 | **Lyrith -迷宮リリス-** | `Lyrith` | `lyrith` | ユメミド | `177` | FTR 10 | 10.3 | ino | `vs_conflict` / `vs_light` | `conflict (1)` | `default` | `92982 - 114677 ms`<br>(21.70s) |
| 13 | **M1LLI0N PP** | `millionpp` | `millionpp` | かめりあ | `117 - 234`<br>(234.0) | BYD 12+ | 12.9 | - | `byd_2_conflict` / `byd_2_light` | `conflict (1)` | `conflict` | `17774 - 38670 ms`<br>(20.90s) |
| 14 | **Stronger** | `stronger` | `stronger` | TheFatRat, Slaydit & Anjulie | `160` | FTR 9 | 9.2 | - | `single2_light` / `single2_conflict` | `light (0)` | `default` | `34375 - 54375 ms`<br>(20.0s) |
| 15 | **GALACTIC WARZONE** | `UltraDark.GALACTIC_WARZONE` | `galacticwarzone` | Akira Complex | `174` | PST 5<br>PRS 9<br>FTR 10+<br>ETR 11 | 5.0<br>9.3<br>10.7<br>11.3 | Syltheral (0)<br>UltraDark (1)<br>UltraDark/Aximax (2)<br>AltF4+ (4) | `galacticwarzone` *(Custom HD)* | `conflict (1)` | `conflictvs` | `33702 - 55772 ms`<br>(22.07s) |
| 16 | **Z:iRNiTRA** | `wazzuo.zirnitra` | `zirnitra` | かめりあ | `235` | FTR 11 | 11.7 | WazzuO | `zirnitra` *(Custom HD)* | `lephon dark (3)` | `tempestissimo` | `262291 - 284680 ms`<br>(22.39s) |
| 17 | **Deicide** | `zeerqi27ANDexiony.deicide` | `deicide` | void feat. 古泉葉月 | `163` | FTR 10+<br>BYD 11+ | 10.8<br>11.8 | RedlixHD (FTR)<br>泽贰七 & Exiony (BYD) | `deicide` *(Custom HD)* | `colorless (2)` | `default` | `32391 - 70673 ms`<br>(38.28s) |

---

## Rincian Lengkap per Lagu & Pemetaan Chart

### 1. Astaroth (`astaroth`)
- **Folder Sumber:** `comboAstaroth`
- **Composer:** Team Grimoire | **Illustrator:** atsushi
- **BPM:** `210` (Base BPM: 210.0)
- **Audio & Preview:** Durasi audio: 162.11s | Preview: `0 ms - 28000 ms` (28.0s)
- **Side & Background:** Side: `conflict (1)` | Background: `lanota-conflict` | Background Inverse: `lanota-light` (Vanilla)
- **Catatan Teknis Chart:** 
  - `0.aff`: Dummy unrated placeholder.
  - `1.aff`: **Diganti dummy unrated placeholder** sesuai instruksi (chart PRS ditiadakan).
  - `2.aff`: Future 11 CC `11.4` (charter `Kurumi`, 2359 baris, 8 titik Zero BPM dinormalisasi ke `0.01`).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 11** | **`11.4`** | **`Kurumi`** |

---

### 2. Enter The Rave (`entertherave`)
- **Folder Sumber:** `comboEntertherave`
- **Composer:** USAO | **Illustrator:** NC Empire
- **BPM:** `195` (Base BPM: 195.0)
- **Audio & Preview:** Durasi audio: 174.04s | Preview: `134000 ms - 153769 ms` (19.77s)
- **Side & Background:** Side: `conflict (1)` | Background: `ongeki_conflict` | Background Inverse: `ongeki_light` (Vanilla)
- **Catatan Teknis Chart:** `2.aff` (1770 baris, Future 10+ CC `10.8`, charter `LivalinkZ`). Base 0 & 1 dilengkapi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.8`** | **`LivalinkZ`** |

---

### 3. Euphoria (feat. Tsugumi Nagahara) (`euphoria`)
- **Folder Sumber:** `comboEuphoria`
- **Composer:** PIKASONIC & Tatsunoshin | **Illustrator:** おみや
- **BPM:** `175` (Base BPM: 175.0)
- **Audio & Preview:** Durasi audio: 208.46s | Preview: **`25340 ms - 45340 ms`** (20.0s — klimaks chorus vokal)
- **Side & Background:** Side: **`colorless (2)`** | Background: `euphoria` (Custom HD upscaled dari `euphoria.jpg` 1281×960) | Track Skin: `light`
- **Catatan Teknis Chart:** `2.aff` (3021 baris, Future 10 CC `10.2`, charter `Ar+1`). Base 0 & 1 dilengkapi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.2`** | **`Ar+1`** |

---

### 4. Stardust:RAY (`stardustray`)
- **Folder Sumber:** `comboStardustray`
- **Composer:** kanone vs. BlackY | **Illustrator:** SEGA
- **BPM:** `164` (Base BPM: 164.0)
- **Audio & Preview:** Durasi audio: 170.04s | Preview: `49756 ms - 74999 ms` (25.24s)
- **Side & Background:** Side: `conflict (1)` | Background: **`lamia`** (Vanilla)
- **Catatan Teknis Chart (Sesuai Arahan Khusus):** 
  - `1.aff` (asalnya PRS) $\rightarrow$ dikonversi menjadi **`2.aff` (FTR 10, CC `10.3`, charter: `Kurumi:087`)**.
  - `2.aff` (asalnya FTR) $\rightarrow$ dikonversi menjadi **`4.aff` (ETR 10+, CC `10.9`, charter: `recharge & Archtoz`)**.
  - Slot 0 & 1 diisi placeholder unrated agar tidak terjadi bentrok level.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` *(dari 1.aff)* | Future (2) | **FTR 10** | **`10.3`** | **`Kurumi:087`** |
| `4.aff` *(dari 2.aff)* | Eternal (4) | **ETR 10+** | **`10.9`** | **`recharge & Archtoz`** |

---

### 5. SUPER EMULATOR (`superemulator`)
- **Folder Sumber:** `comboSuperemulator`
- **Composer:** Kobaryo feat. HiTNEX-X | **Illustrator:** Neg
- **BPM:** `208` (Base BPM: 208.0)
- **Audio & Preview:** Durasi audio: 153.22s | Preview: `64904 ms - 87694 ms` (22.79s)
- **Side & Background:** Side: **`pentiment (4)`** | Background: **`pentiment`** (Vanilla) | Track Skin: `conflict`
- **Catatan Teknis Chart:** `2.aff` (2158 baris, Future 11 CC `11.0`, charter `Archtesia`). Base 0 & 1 dilengkapi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 11** | **`11.0`** | **`Archtesia`** |

---

### 6. Track Wilderness (`trackwilderness`)
- **Folder Sumber:** `comboTrackwilderness`
- **Composer:** Noah | **Illustrator:** SSuzuren
- **BPM:** `217` (Base BPM: 217.0)
- **Audio & Preview:** Durasi audio: 142.81s | Preview: `87304 ms - 110875 ms` (23.57s)
- **Side & Background:** Side: `conflict (1)` | Background: `vs_conflict` | Background Inverse: `vs_light` (Vanilla)
- **Catatan Teknis Chart:** `2.aff` (1128 baris, Future 10+ CC `10.7`, charter `DreamFlux-`). Base 0 & 1 dilengkapi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.7`** | **`DreamFlux-`** |

---

### 7. ƒiиorzᾶ (`finorza`)
- **Folder Sumber:** `finorza`
- **Composer:** かめりあ feat. ななひら | **Illustrator:** JNTHED
- **BPM:** `225` (Base BPM: 225.0)
- **Audio & Preview:** Durasi audio: 289.96s | Preview disamakan: **`87085 ms - 107351 ms`** (20.27s)
- **Side & Background:** Side: **`lephon dark (3)`** | Background: `finorza` (Custom HD upscaled dari `bg.png` 775×581) | Track Skin: **`tempestissimo`**
- **Catatan Teknis Chart:** 
  - `2.aff`: Future 11 CC `11.4` (2766 baris, 28 titik Zero BPM dinormalisasi ke `0.01`).
  - `4.aff` *(dari 3.aff)*: Eternal 12 CC `12.6` (charter `Nikro`, alias `THÃИÂTØS |:| Xhaos-Destruxxion 〜the one and final end.〜`).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 11** | **`11.4`** | **`-`** |
| `4.aff` | Eternal (4) | **ETR 12** | **`12.6`** | **`Nikro`** |

---

### 8. 黃道、知希朋友と紡ぎありく。 (`solarorbit`)
- **Folder Sumber:** `imrich.solarorbitNERFED`
- **Composer:** Apo11o"FIXEDSTAR"program feat Ritsuka | **Illustrator:** hideo
- **BPM:** `105 - 440` (Base BPM: 220.0)
- **Audio & Preview:** Durasi audio: 163.53s | Preview: `20685 ms - 40091 ms` (19.41s)
- **Side & Background:** Side: `light (0)` | Background: **`quon`** (Vanilla) | Track Skin: `rei`
- **Catatan Teknis Chart:** 
  - `2.aff`: Future 11 CC `11.1` (2609 baris, 7 titik Zero BPM dinormalisasi).
  - `4.aff`: Eternal 11 CC `11.5` (2411 baris, charter `imrich (Nerfed)`, strip `groupalpha`).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 11** | **`11.1`** | **`-`** |
| `4.aff` | Eternal (4) | **ETR 11** | **`11.5`** | **`imrich (Nerfed)`** |

---

### 9. HeaveИ's Rain (`heavensrain`) — *Merge Opsi A*
- **Folder Sumber:** `kurumi087.heavensrain`
- **Composer:** モリモリあつし
- **BPM:** `285` (Base BPM: 285.0)
- **Audio & Preview:** Durasi audio: 133.49s | Preview: `48000 ms - 69401 ms` (21.40s)
- **Side & Background:** Side: `lephon (2)` | Background: `heavensrain` (Custom HD) | Track Skin: `light`
- **Integrasi Server:** Menggantikan dummy `2.aff` pada lagu `heavensrain` di server sehingga memiliki FTR 11 Kurumi087 dan ETR 12 ZydeKun.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` *(Baru)* | Future (2) | **FTR 11** | **`11.6`** | **`Kurumi087`** |
| `4.aff` *(Batch 4)* | Eternal (4) | **ETR 12** | **`12.0`** | **`ZydeKun`** |

---

### 10. フォニイ (`phony`) — *Merge ke Folder Server*
- **Folder Sumber:** `Kurumi087.phony`
- **Composer:** ツミキ feat. 可不
- **BPM:** `170` (Base BPM: 170.0)
- **Audio & Preview:** Durasi audio: 189.88s | Preview: `61873 ms - 84462 ms` (22.59s)
- **Side & Background:** Side: `light (0)` | Background: `rei` (Vanilla) | Track Skin: `rei`
- **Integrasi Server:** Dileburkan ke folder `database/songs/phony/` sebagai slot **ETR 10 (`4.aff`, CC `10.1`, charter: `Kurumi087`)**, sedangkan chart FTR 9 Alice tetap dipertahankan pada `2.aff`.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` *(Server)* | Future (2) | **FTR 9** | **`9.5`** | **`Alice`** |
| `4.aff` *(Baru)* | Eternal (4) | **ETR 10** | **`10.1`** | **`Kurumi087`** |

---

### 11. SUPER REACTOR X (`superreactorx`)
- **Folder Sumber:** `kurumi087.superreactorx`
- **Composer:** Kobaryo feat. HiTNEX-X
- **BPM:** `152` (Base BPM: 152.0)
- **Audio & Preview:** Durasi audio: 199.68s | Preview: `1806 ms - 25786 ms` (23.98s)
- **Side & Background:** Side: `conflict (1)` | Background: **`wacca_conflict`** | Background Inverse: **`wacca_light`** | Track Skin: `conflict`
- **Catatan Teknis Chart:** `2.aff` (2543 baris, Future 10 CC `10.6`, charter `Kurumi087`). Base 0 & 1 dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.6`** | **`Kurumi087`** |

---

### 12. Lyrith -迷宮リリス- (`lyrith`)
- **Folder Sumber:** `Lyrith`
- **Composer:** ユメミド | **Illustrator:** 遥壱朗
- **BPM:** `177` (Base BPM: 177.0)
- **Audio & Preview:** Durasi audio: 150.32s | Preview: `92982 ms - 114677 ms` (21.70s)
- **Side & Background:** Side: `conflict (1)` | Background: `vs_conflict` | Background Inverse: `vs_light` (Vanilla)
- **Catatan Teknis Chart:** `2.aff` (1451 baris, Future 10 CC `10.3`, charter `ino`). 10 titik Zero BPM dinormalisasi ke `0.01`.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.3`** | **`ino`** |

---

### 13. M1LLI0N PP (`millionpp`)
- **Folder Sumber:** `millionpp`
- **Composer:** かめりあ
- **BPM:** `117 - 234` (Base BPM: 234.0)
- **Audio & Preview:** Durasi audio: 430.13s (7 menit 10 detik!) | Preview: `17774 ms - 38670 ms` (20.90s)
- **Side & Background:** Side: `conflict (1)` | Background: **`byd_2_conflict`** | Background Inverse: **`byd_2_light`** | Track Skin: `conflict`
- **Catatan Teknis Chart:** `3.aff` (12,848 baris, Beyond 12+ CC `12.9`). 102 titik Zero BPM dinormalisasi ke `0.01`. Dilarang masuk `database/songs/unlocks`. Base 0, 1, 2 dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `3.aff` | Beyond (3) | **BYD 12+** | **`12.9`** | **`-`** |

---

### 14. Stronger (`stronger`)
- **Folder Sumber:** `stronger`
- **Composer:** TheFatRat, Slaydit & Anjulie
- **BPM:** `160` (Base BPM: 160.0)
- **Audio & Preview:** Durasi audio: 131.31s | Preview: **`34375 ms - 54375 ms`** (20.0s — drop vokal)
- **Side & Background:** Side: `light (0)` | Background: `single2_light` | Background Inverse: `single2_conflict` (Vanilla)
- **Catatan Teknis Chart:** `2.aff` (910 baris, Future 9 CC `9.2`). Base 0 & 1 dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 9** | **`9.2`** | **`-`** |

---

### 15. GALACTIC WARZONE (`galacticwarzone`)
- **Folder Sumber:** `UltraDark.GALACTIC_WARZONE`
- **Composer:** Akira Complex | **Illustrator:** Mechari
- **BPM:** `174` (Base BPM: 174.0)
- **Audio & Preview:** Durasi audio: 136.52s | Preview: `33702 ms - 55772 ms` (22.07s)
- **Side & Background:** Side: `conflict (1)` | Background: `galacticwarzone` (Custom HD upscaled dari `galactic-warzone.png` 1280×960) | Track Skin: `conflictvs`
- **Catatan Teknis Chart (4 Diff Lengkap):**
  - `0.aff`: Past 5 (CC `5.0`, charter `Syltheral`, 373 baris).
  - `1.aff`: Present 9 (CC `9.3`, charter `UltraDark and Syltheral`, 729 baris).
  - `2.aff`: Future 10+ (CC `10.7`, charter `UltraDark, Aximax, G.S`, 1539 baris).
  - `4.aff` *(dari 3.aff)*: Eternal 11 (CC `11.3`, charter `AltF4+`, 1905 baris).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 5** | **`5.0`** | **`Syltheral`** |
| `1.aff` | Present (1) | **PRS 9** | **`9.3`** | **`UltraDark and Syltheral`** |
| `2.aff` | Future (2) | **FTR 10+** | **`10.7`** | **`UltraDark, Aximax, G.S`** |
| `4.aff` | Eternal (4) | **ETR 11** | **`11.3`** | **`AltF4+`** |

---

### 16. Z:iRNiTRA (`zirnitra`)
- **Folder Sumber:** `wazzuo.zirnitra`
- **Composer:** かめりあ | **Illustrator:** JNTHED
- **BPM:** `235` (Base BPM: 235.0)
- **Audio & Preview:** Durasi audio: 381.66s (6.3 menit) | Preview: `262291 ms - 284680 ms` (22.39s)
- **Side & Background:** Side: **`lephon dark (3)`** | Background: `zirnitra` (Custom HD upscaled dari `bg.png` 775×581) | Track Skin: **`tempestissimo`**
- **Catatan Teknis Chart:** `2.aff` (5637 baris, Future 11 CC `11.7`, charter `WazzuO`). Base 0 & 1 dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 11** | **`11.7`** | **`WazzuO`** |

---

### 17. Deicide (`deicide`)
- **Folder Sumber:** `zeerqi27ANDexiony.deicide`
- **Composer:** void (Mournfinale) feat. 古泉葉月 | **Illustrator:** lack、小路さこ
- **BPM:** `163` (Base BPM: 163.0)
- **Audio & Preview:** Durasi audio: 144.68s | Preview: `32391 ms - 70673 ms` (38.28s)
- **Side & Background:** Side: **`colorless (2)`** | Background: `deicide` (Custom HD asli 1920×1440 `deicide.jpg`) | Track Skin: `default`
- **Catatan Teknis Chart:** 
  - `2.aff`: Future 10+ CC `10.8` (2190 baris, charter `RedlixHD`).
  - `3.aff`: Beyond 11+ CC `11.8` (24,045 baris, charter `泽贰七 & Exiony`). 355 titik Zero BPM dinormalisasi. Dilarang masuk `database/songs/unlocks`.
  - Base 0 & 1 dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.8`** | **`RedlixHD`** |
| `3.aff` | Beyond (3) | **BYD 11+** | **`11.8`** | **`泽贰七 & Exiony`** |

---
