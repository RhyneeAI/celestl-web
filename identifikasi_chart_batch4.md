# Identifikasi Lengkap 18 Lagu Batch 4 (`1batch4`) — Versi Terkoreksi & Terverifikasi

> [!NOTE]
> Dokumen ini mencakup **18 lagu Batch 4** (5 lagu awal + 8 lagu penambahan + `WACCA ULTRA DREAM MEGAMIX` + 2 lagu Etoile: `gengaozo` & `jump` + 2 lagu `James_BottomoftheBin2Packs`: `jedagjedugepilepsy` & `suisei_hathaway`).
> Seluruh penyesuaian pengguna telah diimplementasikan:
> 1. **HeaveИ's Rain (`heavensrain`):** Constant diubah ke **12.0** (ETR 12), side diubah ke **`lephon`** (Colorless / Side 2).
> 2. **Normalisasi Background Custom:** Seluruh file background custom dinormalisasi langsung ke ID / nama lagunya (`noxsilva.jpg`, `seimeiseisyndrome.jpg`, `heavensrain.jpg`, `apocalypserebellion.jpg`, `waccaultradreammegamix.jpg`, `suisei_hathaway.jpg`).
> 3. **Background Vanilla Arcaea Client:**
>    - `DANGEROOOOUS JUNGLE`: `bg: tanoc_light`, `bg_inverse: tanoc_conflict`
>    - `人生` (`ourlife`): `bg: lamentrain`, `side: lephon`
>    - `Future Eve`: `bg: virtualsingers_light`, `bg_inverse: virtualsingers_conflict` *(terverifikasi ada di client)*
>    - `Beloved Tomboyish Girl` (`cirnomede`): `bg: single2_light`, `bg_inverse: single2_conflict`
>    - `Mantra Hujan`: `bg: nijuusei2_light`, `bg_inverse: nijuusei2_conflict`
>    - `Raven Emperor`: `bg: maimai_boss`
>    - `Symphony Op.1 -CHAOS-`: `bg: byd_2_conflict`, `bg_inverse: byd_2_light` *(format native client untuk beyond 2)*
>    - `G e n g a o z o`: `bg: prelude_conflict`, `bg_inverse: prelude_light`
>    - `Jump`: `bg: alice_light`, `bg_inverse: alice_conflict`
>    - `Jedag Jedug Epilepsi`: `bg: byd_conflict`, `bg_inverse: byd_light`
>    - `Suisei Hathaway Talalala`: `bg: nijuusei2_light`, `bg_inverse: nijuusei2_conflict`
> 4. **Penambahan 2 Chart Resmi/Etoile (Genap 150):**
>    - `lowiro.gengaozo`: Konfigurasi disesuaikan dari `etoile.arcproj` (PST 4 / PRS 8 / FTR 10 / BYD 11 CC 11.0).
>    - `lowiro.jump`: Konfigurasi disesuaikan dari `etoile.arcproj` (PST 4 / PRS 6 / FTR 9 CC 9.0).
> 5. **Penambahan 2 Chart James Bottom of the Bin 2 Packs:**
>    - `jedagjedugepilepsy`: Ditempatkan di Beyond (`ratingClass: 3`) dengan `rating: 0` agar diff di game menjadi `"?"`, namun di database SQLite ber-constant `9.6`. Base diff 0, 1, 2 dilengkapi placeholder unrated. Tidak didaftarkan pada `unlocks` (mencegah diamond lock & crash).
>    - `suisei_hathaway`: Future 7 (CC `7.6`). Perbaikan 4 titik Zero BPM ($t > 0 \rightarrow 0.01$), clamp extreme BPM $2.08 \times 10^7 \rightarrow 1,000,000$, custom BG upscaled ke 1920×1440 HD.

---

## Ringkasan 18 Lagu Unik Batch 4 (Tabel Master)

| No | Judul Lagu | Song ID | Composer | BPM (Base) | Difficulty Slot | Chart Constant | Charter | Background (`bg` / `bg_inverse`) | Side | Track Skin | Catatan Khusus |
|:---:|---|---|---|:---:|:---:|:---:|---|---|:---:|---|---|
| 1 | **Nox Silva** | `noxsilva` | Nox Silva | `180` | ETR 10+ | 10.8 | V1Q | `noxsilva` *(Custom HD)* | `conflict (1)` | `default` | Charter **`V1Q`**, CC `10.8`, custom BG dinormalisasi ke `noxsilva.jpg`, jacket di-upscale dari 250px |
| 2 | **生命性シンドロウム**<br>*(Seimeisei Syndrome)* | `seimeiseisyndrome` | かめりあ feat. 初音ミク | `225 - 270`<br>(225.0) | FTR 10+<br>BYD 12 | 10.9<br>12.2 | Zenth (FTR)<br>RainyuU (BYD) | `seimeiseisyndrome` *(Custom HD)* | `conflict (1)` | `conflictvs` | Dual diff: FTR 10+ (`10.9`) + BYD 12 (`12.2`), custom BG dinormalisasi ke `seimeiseisyndrome.jpg` |
| 3 | **HeaveИ's Rain** | `heavensrain` | モリモリあつし | `285` | ETR 12 | 12.0 | ZydeKun | `heavensrain` *(Custom HD)* | `lephon (2)` | `light` | **ETR Only**, CC disesuaikan ke **`12.0`**, side disetel ke **`lephon`**, custom BG dinormalisasi ke `heavensrain.jpg` |
| 4 | **DANGEROOOOUS JUNGLE** | `dangeroooous` | Laur | `160` | FTR 10+ | 10.7 | beane | `tanoc_light` / `tanoc_conflict` | `light (0)` | `light` | Dual vanilla BG (`tanoc_light` / `tanoc_conflict`), perbaikan 6 titik Zero BPM ($t > 0 \rightarrow 0.01$), preview 20s |
| 5 | **人生**<br>*(Jinsei / Our Life)* | `ourlife` | gcmstyle (アンメルツP) | `185` | FTR 10+<br>ETR 11 | 10.9<br>11.7 | CcinoWrath (FTR)<br>Yagi ft. ZydeKun (ETR) | `lamentrain` | `lephon (2)` | `default` | ID **`ourlife`**, side **`lephon`**, vanilla BG `lamentrain`, `1.aff` $\rightarrow$ `2.aff` (`10.9`), `2.aff` $\rightarrow$ `4.aff` (`11.7`) |
| 6 | **Future Eve** | `futureeve` | sasakure.UK | `190` | FTR 10 | 10.1 | Aloney_jub | `virtualsingers_light` / `virtualsingers_conflict` | `light (0)` | `rei` | Terverifikasi dual vanilla BG Virtual Singer (`virtualsingers_light` / `conflict`), FTR 10 (`10.1`), 815 notes |
| 7 | **Beloved Tomboyish Girl**<br>*(Mede's Frenchcore Remix)* | `cirnomede` | Mede | `200` | FTR 9+ | 9.9 | Exiony vs. James | `single2_light` / `single2_conflict` | `conflict (1)` | `default` | Dual vanilla BG (`single2_light` / `conflict`), Touhou Cirno ⑨ remix, CC `9.9`, 844 notes, 42 scenecontrols native |
| 8 | **Kuru Kuru Kururin Song** | `kurukuru` | Adeline_l18 | `152` | FTR 7 | 7.0 | Twirling James | `shiawase2` | `light (0)` | `default` | Herta meme song (durasi 29.3s), 70 notes, strip 2 non-native `groupalpha`, vanilla BG `shiawase2` |
| 9 | **Mantra Hujan**<br>*(Adyoro Remix)* | `mantrahujan` | Adyoro feat. Kobo Kanaeru | `155` | FTR 10 | 10.3 | Exiony with James | `nijuusei2_light` / `nijuusei2_conflict` | `light (0)` | `default` | Dual vanilla BG (`nijuusei2_light` / `conflict`), Kobo Kanaeru remix, CC `10.3`, 562 notes, preview 20s |
| 10 | **アポカリプスに反逆の焔を焚べろ** | `apocalypserebellion` | cosMo@暴走AlterEgo | `222 - 333`<br>(333.0) | FTR 12 | 12.3 | KhronoLabyrinth | `apocalypserebellion` *(Custom HD)* | `conflict (1)` | `conflictvs` | cosMo boss song, 1,148 notes BPM 333, CC `12.3`, custom BG dinormalisasi ke `apocalypserebellion.jpg` |
| 11 | **華の集落、秋のお届け** | `hananoshuuraku` | Umiai | `165` | FTR 10 | 10.4 | KhronoLabyrinth | `omatsuri_conflict` / `omatsuri_light` | `conflict (1)` | `conflict` | 647 notes, CC `10.4`, sintaks AFF bersih, mapping dual vanilla BG festival `omatsuri_conflict` / `omatsuri_light` |
| 12 | **Raven Emperor** | `ravenemperor` | Kobaryo | `205` | FTR 10+ | 10.7 | KhronoLabyrinth | `maimai_boss` | `conflict (1)` | `conflict` | Kobaryo speedcore, 641 notes, CC `10.7`, vanilla BG `maimai_boss` |
| 13 | **Symphony Op.1 -CHAOS-** | `symphonyop1chaos` | Laur | `240`<br>(1-8000) | BYD 10+ | 10.8 | KhronoLabyrinth<br>-Chaotic Form- | `byd_2_conflict` / `byd_2_light` | `conflict (1)` | `conflict` | Dual vanilla BG (`byd_2_conflict` / `byd_2_light`), single-chart Beyond (`3.aff`), 404 notes, 71 Zero BPM diperbaiki |
| 14 | **WACCA ULTRA DREAM MEGAMIX** | `waccaultradreammegamix` | USAO & Kobaryo | `130 - 245`<br>(200.0) | FTR 11 | 11.4 | ArcCreate Charting Team | `waccaultradreammegamix` *(Custom HD)* | `conflict (1)` | `default` | Megamix kolaborasi 6 menit (358s), 1,810 notes, CC `11.4`, custom BG HD dinormalisasi ke `waccaultradreammegamix.jpg` |
| 15 | **G e n g a o z o** | `gengaozo` | -45 | `153` | PST 4<br>PRS 8<br>FTR 10<br>**BYD 11** | 4.0<br>8.1<br>10.1<br>**11.0** | _ P A S T (0)<br>_ P R E S E N T (1)<br>_ F U T U R E (2)<br>**天兔壽斯 (3)** | `prelude_conflict` / `prelude_light` | `conflict (1)` | `conflict` | Sesuai `etoile.arcproj` (folder non-arkpkg). 4 diff lengkap, BYD 11 CC `11.0`, vanilla dual BG `prelude_conflict` / `light` |
| 16 | **Jump** | `jump` | Rasmus Faber | `133` | PST 4<br>PRS 6<br>**FTR 9** | 4.0<br>6.0<br>**9.0** | Nitroだー！ (0, 1, 2) | `alice_light` / `alice_conflict` | `light (0)` | `light` | Sesuai `etoile.arcproj` (folder non-arkpkg). 3 diff lengkap (PST 4 / PRS 6 / FTR 9 CC `9.0`), charter Nitroだー！, vanilla dual BG `alice_light` / `conflict` |
| 17 | **Jedag Jedug Epilepsi** | `jedagjedugepilepsy` | VKar MeMe | `148.84` | **BYD ?**<br>(rating: 0) | **9.6** | Charter Berkelas - James | `byd_conflict` / `byd_light` | `conflict (1)` | `conflictvs` | Slot Beyond (`rating: 0` $\rightarrow$ "?"), CC `9.6` di database SQLite (`rating_byn: 96`), strip `name="..."` di timinggroup, dilarang di `unlocks` |
| 18 | **Suisei Hathaway Talalala** | `suisei_hathaway` | Ceka Éclair feat. Hoshimachi Suisei | `208` | **FTR 7** | **7.6** | James<br>(Blue-CMT) | `nijuusei2_light` / `nijuusei2_conflict` | `light (0)` | `default` | Dual vanilla BG, perbaikan 4 Zero BPM ($t > 0 \rightarrow 0.01$), clamp extreme BPM $2.08 \times 10^7 \rightarrow 1,000,000$, custom BG upscaled ke 1920×1440 HD |

---

## Rincian Identifikasi Lengkap (1 – 16)

### 1. Nox Silva (`noxsilva`)
- **File Sumber:** `ArcCreate.NoxSilva.arcpkg`
- **Composer:** Nox Silva | **Illustrator:** 画纱
- **BPM:** `180` (Base BPM: 180.0)
- **Audio & Preview:** Durasi audio: 164.29s | Preview: `124000 ms - 145333 ms` (21.33s)
- **Side & Background:** Side: `conflict (1)` | Background: `noxsilva` (dinormalisasi dari `pendulum_of_doom_bg_light.jpg` ke `noxsilva.jpg` 1920×1440 HD)
- **Catatan Teknis Chart:** `4.aff` (1570 baris, 784 notes). Normalisasi baris 1420 `timinggroup(name="evil arcres group of doom",arcresolution=1.5){` $\rightarrow$ `timinggroup(){`.
- **Penyesuaian:** Eternal 10+ (CC **`10.8`**), charter: **`V1Q`**. Dummy unrated untuk 0, 1, 2.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `4.aff` | Eternal (4) | **ETR 10+** | **`10.8`** | **`V1Q`** |

---

### 2. 生命性シンドロウム (`seimeiseisyndrome`)
- **File Sumber:** `RainyuU.SeimeiseiSyndrome.arcpkg`
- **Composer:** かめりあ feat. 初音ミク | **Illustrator:** モズ
- **BPM:** `225 - 270` (Base BPM: 225.0)
- **Audio & Preview:** Durasi audio: 133.14s | Preview: `46246 ms - 71246 ms` (25.0s Vorbis fade-in/out)
- **Side & Background:** Side: `conflict (1)` | Background: `seimeiseisyndrome` (dinormalisasi dari `Atomospherent.jpg` ke `seimeiseisyndrome.jpg` 1920×1440 HD) | Track: `conflictvs`
- **Catatan Teknis Chart:** `2.aff` (1942 baris, 867 notes, bersih). `3.aff` (2121 baris, 1024 notes, 4 native scenecontrols `enwidencamera`/`enwidenlanes`).
- **Penyesuaian:** Dual difficulty: FTR 10+ (`10.9`, Zenth) dan BYD 12 (`12.2`, RainyuU). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.9`** | **`Zenth`** |
| `3.aff` | Beyond (3) | **BYD 12** | **`12.2`** | **`RainyuU`** |

---

### 3. HeaveИ's Rain (`heavensrain`)
- **File Sumber:** `ZydeKun.heavensrain.arcpkg`
- **Composer:** モリモリあつし | **Illustrator:** qq
- **BPM:** `285` (Base BPM: 285.0)
- **Audio & Preview:** Durasi audio: 133.49s | Preview: `48000 ms - 69401 ms` (21.40s)
- **Side & Background:** Side: **`lephon (2)`** | Background: `heavensrain` (dinormalisasi dari `arccreate_mirai_light.jpg` ke `heavensrain.jpg` 1920×1440 HD) | Track: `light`
- **Catatan Teknis Chart:** `4.aff` (2733 baris, 1019 notes, 16 scenecontrols native). Normalisasi timinggroup editor attributes baris 191, 2610, 2697.
- **Penyesuaian:** **Hanya ETR yang disertakan**, constant diubah ke **`12.0`** (ETR 12, ZydeKun). Side diubah ke **`lephon`**. Dummy unrated untuk 0, 1, 2.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `4.aff` | Eternal (4) | **ETR 12** | **`12.0`** | **`ZydeKun`** |

---

### 4. DANGEROOOOUS JUNGLE (`dangeroooous`)
- **File Sumber:** `beane.dangeroooous.arcpkg`
- **Composer:** Laur | **Illustrator:** みしゃも
- **BPM:** `160` (Base BPM: 160.0)
- **Audio & Preview:** Durasi audio: 138.00s | Preview: `37500 ms - 57500 ms` (20.0s — diperpanjang dari 12s)
- **Side & Background:** Side: `light (0)` | Background: `tanoc_light` | Background Inverse: `tanoc_conflict` (Vanilla client Arcaea) | Track: `light`
- **Catatan Teknis Chart:** `2.aff` (2768 baris, 725 notes). Normalisasi 6 titik Zero BPM ($t > 0 \rightarrow 0.01$) pada baris 767, 772, 777, 782, 787, 792. Normalisasi baris 2669 `timinggroup(name="trace"){`.
- **Penyesuaian:** FTR 10+ (CC **`10.7`**, beane). Dual vanilla background `tanoc_light` / `tanoc_conflict`. Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.7`** | **`beane`** |

---

### 5. 人生 (`ourlife`)
- **File Sumber:** `akaruiyagi.ourlife.arcpkg` & `CcinoWrath.ourlife (1).arcpkg`
- **Composer:** gcmstyle (アンメルツP) | **Illustrator:** 黎
- **BPM:** `185` (Base BPM: 185.0)
- **Audio & Preview:** Durasi audio: 150.86s | Preview: `98058 ms - 119462 ms` (21.40s)
- **Side & Background:** Side: **`lephon (2)`** | Background: `lamentrain` (Vanilla client Arcaea)
- **Catatan Teknis Chart:** `1.aff` (1287 baris, 1089 notes, bersih). `2.aff` (1627 baris, 1422 notes, bersih).
- **Penyesuaian:** ID resmi **`ourlife`**, side **`lephon`**, background vanilla **`lamentrain`**. Konversi slot: `1.aff` $\rightarrow$ `2.aff` (FTR 10+, CC **`10.9`**, CcinoWrath); `2.aff` $\rightarrow$ `4.aff` (ETR 11, CC **`11.7`**, Yagi ft. ZydeKun). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` *(dari 1.aff)* | Future (2) | **FTR 10+** | **`10.9`** | **`CcinoWrath`** |
| `4.aff` *(dari 2.aff)* | Eternal (4) | **ETR 11** | **`11.7`** | **`Yagi ft. ZydeKun`** |

---

### 6. Future Eve (`futureeve`)
- **File Sumber:** `aloneyjub.futureeve.arcpkg`
- **Composer:** sasakure.UK | **Illustrator:** -
- **BPM:** `190` (Base BPM: 190.0)
- **Audio & Preview:** Durasi audio: 154.25s | Preview: `100000 ms - 120000 ms` (20.0s — klimaks chorus)
- **Side & Background:** Side: `light (0)` | Background: `virtualsingers_light` | Background Inverse: `virtualsingers_conflict` (Vanilla client Arcaea) | Track: `rei`
- **Catatan Teknis Chart:** `2.aff` (2420 baris, 815 notes). Memiliki 1 event `scenecontrol(42474,hidegroup,1,1);` dan 2 timinggroup native valid (`noinput` dan `{}`).
- **Penyesuaian:** Dual vanilla background Virtual Singer (`virtualsingers_light` / `virtualsingers_conflict`). Single-chart Future 10 (CC **`10.1`**, Aloney_jub). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.1`** | **`Aloney_jub`** |

---

### 7. Beloved Tomboyish Girl (Mede's Frenchcore Remix) (`cirnomede`)
- **File Sumber:** `James.Cirno_Mede.arcpkg`
- **Composer:** Mede | **Illustrator:** 月本葵 (James Edit)
- **BPM:** `200` (Base BPM: 200.0)
- **Audio & Preview:** Durasi audio: 134.40s | Preview: `61125 ms - 79714 ms` (18.59s)
- **Side & Background:** Side: `conflict (1)` | Background: `single2_light` | Background Inverse: `single2_conflict` (Vanilla client Arcaea) | Track: `mirailight`
- **Catatan Teknis Chart:** `2.aff` (1687 baris, 844 notes). Memiliki 42 event native scenecontrol (`trackdisplay`, `enwidencamera`, `enwidenlanes`). Memiliki 1 titik Zero BPM di $t > 0$ yang otomatis diperbaiki ke `0.01`.
- **Penyesuaian:** Dual vanilla background `single2_light` / `single2_conflict`. FTR 9+ (CC **`9.9`**, Exiony vs. James). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 9+** | **`9.9`** | **`Exiony vs. James`** |

---

### 8. Kuru Kuru Kururin Song (`kurukuru`)
- **File Sumber:** `james.kurukuru.arcpkg`
- **Composer:** Adeline_l18 | **Illustrator:** seseren
- **BPM:** `152` (Base BPM: 152.0)
- **Audio & Preview:** Durasi audio: 29.34s (lagu meme pendek) | Preview: `5000 ms - 25000 ms` (20.0s)
- **Side & Background:** Side: `light (0)` | Background: `shiawase2` (Vanilla client Arcaea) | Track: `default`
- **Catatan Teknis Chart:** `kuruing.aff` (425 baris, 70 notes). Strip 2 perintah non-native `groupalpha`.
- **Penyesuaian:** Dipetakan ke slot Future (`2.aff`) dengan level FTR 7 (CC **`7.0`**, Twirling James). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` *(kuruing.aff)* | Future (2) | **FTR 7** | **`7.0`** | **`Twirling James`** |

---

### 9. Mantra Hujan (Adyoro Remix) (`mantrahujan`)
- **File Sumber:** `James.MantraHujan_Adyoro.arcpkg`
- **Composer:** Adyoro feat. Kobo Kanaeru | **Illustrator:** Ryo
- **BPM:** `155` (Base BPM: 155.0)
- **Audio & Preview:** Durasi audio: 155.83s | Preview: `95488 ms - 115488 ms` (20.0s — diperpanjang dari 12s)
- **Side & Background:** Side: `light (0)` | Background: `nijuusei2_light` | Background Inverse: `nijuusei2_conflict` (Vanilla client Arcaea) | Track: `mirailight`
- **Catatan Teknis Chart:** `2.aff` (2061 baris, 562 notes). Sintaks bersih.
- **Penyesuaian:** Dual vanilla background `nijuusei2_light` / `nijuusei2_conflict`. FTR 10 (CC **`10.3`**, Exiony with James). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.3`** | **`Exiony with James`** |

---

### 10. アポカリプスに反逆の焔を焚べろ (`apocalypserebellion`)
- **File Sumber:** `KhronoLabyrinth.apocalypserebellion.arcpkg`
- **Composer:** cosMo@暴走AlterEgo | **Illustrator:** -
- **BPM:** `222 - 333` (Base BPM: 333.0)
- **Audio & Preview:** Durasi audio: 140.90s | Preview: `18373 ms - 35811 ms` (17.44s)
- **Side & Background:** Side: `conflict (1)` | Background: `apocalypserebellion` (dinormalisasi dari `arccreate_apocalypse.jpg` ke `apocalypserebellion.jpg` 1920×1440 HD) | Track: `conflictvs`
- **Catatan Teknis Chart:** `2.aff` (2004 baris, 1,148 notes). 6 event native `trackdisplay`. 2 Zero BPM pada $t > 0$ dinormalisasi ke `0.01`.
- **Penyesuaian:** FTR 12 (CC **`12.3`**, KhronoLabyrinth). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 12** | **`12.3`** | **`KhronoLabyrinth`** |

---

### 11. 華の集落、秋のお届け (`hananoshuuraku`)
- **File Sumber:** `KhronoLabyrinth.hananoshuuraku.arcpkg`
- **Composer:** Umiai | **Illustrator:** -
- **BPM:** `165` (Base BPM: 165.0)
- **Audio & Preview:** Durasi audio: 138.19s | Preview: `48000 ms - 71272 ms` (23.27s)
- **Side & Background:** Side: `conflict (1)` | Background: `omatsuri_conflict` | Background Inverse: `omatsuri_light` (Vanilla client Arcaea) | Track: `conflict`
- **Catatan Teknis Chart:** `2.aff` (1462 baris, 647 notes). Sintaks sangat bersih.
- **Penyesuaian:** FTR 10 (CC **`10.4`**, KhronoLabyrinth). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.4`** | **`KhronoLabyrinth`** |

---

### 12. Raven Emperor (`ravenemperor`)
- **File Sumber:** `KhronoLabyrinth.ravenemperor.arcpkg`
- **Composer:** Kobaryo | **Illustrator:** -
- **BPM:** `205` (Base BPM: 205.0)
- **Audio & Preview:** Durasi audio: 134.77s | Preview: `90146 ms - 111219 ms` (21.07s)
- **Side & Background:** Side: `conflict (1)` | Background: `maimai_boss` (Vanilla client Arcaea) | Track: `conflict`
- **Catatan Teknis Chart:** `2.aff` (1122 baris, 641 notes). Sintaks bersih.
- **Penyesuaian:** Vanilla background `maimai_boss`. FTR 10+ (CC **`10.7`**, KhronoLabyrinth). Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.7`** | **`KhronoLabyrinth`** |

---

### 13. Symphony Op.1 -CHAOS- (`symphonyop1chaos`)
- **File Sumber:** `KhronoLabyrinth.symphonyop1chaos.arcpkg`
- **Composer:** Laur | **Illustrator:** KEI
- **BPM:** `240` (Display: `1-8000`, Base BPM: 240.0)
- **Audio & Preview:** Durasi audio: 214.48s | Preview: `63094 ms - 85094 ms` (22.0s Vorbis clip)
- **Side & Background:** Side: `conflict (1)` | Background: `byd_2_conflict` | Background Inverse: `byd_2_light` (Vanilla client Arcaea native beyond 2) | Track: `conflict`
- **Catatan Teknis Chart:** `3.aff` (4763 baris, 404 notes, 405 scenecontrols, 71 Zero BPM diperbaiki ke `0.01`).
- **Penyesuaian:** Dual vanilla background `byd_2_conflict` / `byd_2_light`. BYD 10+ (CC **`10.8`**, KhronoLabyrinth\n-Chaotic Form-). Dummy unrated untuk 0, 1, 2.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `3.aff` | Beyond (3) | **BYD 10+** | **`10.8`** | **`KhronoLabyrinth\n-Chaotic Form-`** |

---

### 14. WACCA ULTRA DREAM MEGAMIX (`waccaultradreammegamix`)
- **File Sumber:** `'wACCT.WACCA ULTRA DREAM MEGAMIX.arcpkg'` (folder: `'wACCT.WACCA ULTRA DREAM MEGAMIX'`)
- **Composer:** USAO & Kobaryo | **Illustrator:** -
- **BPM:** `130 - 245` (Base BPM: 200.0)
- **Audio & Preview:** Durasi audio: 358.38s (5.97 menit kolaborasi megamix) | Preview: `2100 ms - 24000 ms` (21.90s)
- **Side & Background:** Side: `conflict (1)` | Background: `waccaultradreammegamix` (dinormalisasi dari `arccreate_wacca-blender_conflict.jpg` ke `waccaultradreammegamix.jpg` 1920×1440 HD) | Track: `default`
- **Catatan Teknis Chart:** `2.aff` (5307 baris, 1,810 notes: 730 taps, 301 holds, 4040 arcs, 779 arctaps). 37 scenecontrols non-native (ArcCreate extension) dibersihkan, 3 titik Zero BPM dinormalisasi ke `0.01`, 1 timinggroup dinormalisasi.
- **Penyesuaian:** Single-chart Future 11 (CC **`11.4`**) oleh ArcCreate Charting Team. Custom BG HD dinormalisasi ke `waccaultradreammegamix.jpg`. Dummy unrated untuk 0, 1.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 11** | **`11.4`** | **`ArcCreate Charting Team`** |


---

### 15. G e n g a o z o (`gengaozo`)
- **File Sumber:** Direktori `/home/luhung/Documents/Chart/1batch4/lowiro.gengaozo` (Metadata diekstrak langsung dari `etoile.arcproj` folder non-arkpkg)
- **Composer:** -45 | **Illustrator:** -45 (BYD) / -
- **BPM:** `153` (Base BPM: 153.0)
- **Audio & Preview:** Durasi audio: 160.51s (`base.ogg`) | Preview: `50196 ms - 70196 ms` (20.0s Vorbis clip, bar 33 main drop)
- **Side & Background:** Side: `conflict (1)` | Background: `prelude_conflict` | Background Inverse: `prelude_light` (Vanilla client Arcaea) | Track: `conflict`
- **Catatan Teknis Chart:** 
  - `0.aff` (351 baris, 431 notes, Past 4, CC `4.0`, charter: `© lowiro`, alias: `_ P A S T`)
  - `1.aff` (674 baris, 750 notes, Present 8, CC `8.1`, charter: `© lowiro`, alias: `_ P R E S E N T`)
  - `2.aff` (1064 baris, 1,237 notes, Future 10, CC `10.1`, charter: `© lowiro`, alias: `_ F U T U R E`)
  - `3.aff` (1165 baris, 1,322 notes, Beyond 11, CC `11.0`, charter: `天兔壽斯 -_B E Y O N D-`, illustrator: `-45`)
  - Seluruh file `.aff` memiliki sintaks native bersih, tanpa Zero BPM, tanpa extreme BPM, format float desimal valid.
- **Penyesuaian:** Dilengkapi 4 set difficulty lengkap (PST, PRS, FTR, BYD) sesuai konfigurasi `etoile.arcproj`. BYD 11 dengan chart constant **`11.0`** oleh 天兔壽斯. Menggunakan dual background vanilla `prelude_conflict` / `prelude_light`.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 4** | **`4.0`** | **`© lowiro (_ P A S T)`** |
| `1.aff` | Present (1) | **PRS 8** | **`8.1`** | **`© lowiro (_ P R E S E N T)`** |
| `2.aff` | Future (2) | **FTR 10** | **`10.1`** | **`© lowiro (_ F U T U R E)`** |
| `3.aff` | Beyond (3) | **BYD 11** | **`11.0`** | **`天兔壽斯 -_B E Y O N D-`** |

---

### 16. Jump (`jump`)
- **File Sumber:** Direktori `/home/luhung/Documents/Chart/1batch4/lowiro.jump` (Metadata diekstrak langsung dari `etoile.arcproj` folder non-arkpkg)
- **Composer:** Rasmus Faber | **Illustrator:** あるみっく
- **BPM:** `133` (Base BPM: 133.0)
- **Audio & Preview:** Durasi audio: 149.77s (`base.ogg`) | Preview: `57744 ms - 77744 ms` (20.0s Vorbis clip, bar 33 chorus)
- **Side & Background:** Side: `light (0)` | Background: `alice_light` | Background Inverse: `alice_conflict` (Vanilla client Arcaea) | Track: `light`
- **Catatan Teknis Chart:** 
  - `0.aff` (365 baris, 300 notes, Past 4, CC `4.0`, charter: `Nitroだー！`)
  - `1.aff` (373 baris, 303 notes, Present 6, CC `6.0`, charter: `Nitroだー！`)
  - `2.aff` (755 baris, 458 notes, Future 9, CC `9.0`, charter: `Nitroだー！`)
  - Seluruh file `.aff` memiliki sintaks native bersih, tanpa Zero BPM, tanpa extreme BPM, format float desimal valid.
- **Penyesuaian:** Dilengkapi 3 set difficulty lengkap (PST, PRS, FTR) sesuai konfigurasi `etoile.arcproj`. Future 9 dengan chart constant **`9.0`** oleh Nitroだー！. Menggunakan dual background vanilla `alice_light` / `alice_conflict`.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 4** | **`4.0`** | **`© lowiro (Nitroだー！)`** |
| `1.aff` | Present (1) | **PRS 6** | **`6.0`** | **`© lowiro (Nitroだー！)`** |
| `2.aff` | Future (2) | **FTR 9** | **`9.0`** | **`© lowiro (Nitroだー！)`** |

---

### 17. Jedag Jedug Epilepsi (`jedagjedugepilepsy`)
- **File Sumber:** Direktori `/home/luhung/Documents/Chart/1batch4/James_BottomoftheBin2Packs/jedagjedugepilepsy` (`ow my eyes.arcproj`)
- **Composer:** VKar MeMe (tag Vorbis) / N/A | **Illustrator:** N/A
- **BPM:** `148.84` (Base BPM: 148.84)
- **Audio & Preview:** Durasi audio: 27.82s (`base.ogg`) | Preview: `938 ms - 20938 ms` (20.0s Vorbis clip)
- **Side & Background:** Side: `conflict (1)` | Background: `byd_conflict` | Background Inverse: `byd_light` (Vanilla client Arcaea Beyond BG) | Track: `conflictvs`
- **Catatan Teknis Chart:**
  - `3.aff` (334 baris, 70+ notes, Beyond, dipindahkan dari `2.aff`).
  - Baris 319: `timinggroup(name="camerax"){` $\rightarrow$ dinormalisasi ke `timinggroup(){` (menghapus atribut `name="..."` yang memicu fatal error di native C++ Arcaea).
  - Event `camera`: 11 event kamera terverifikasi valid, parameter float dan easing (`qo`, `qi`, `reset`) valid.
  - Base difficulties [0, 1, 2] dilengkapi placeholder dummy aff unrated.
- **Penyesuaian Khusus:** 
  - Disimpan pada slot Beyond (`ratingClass: 3`) dengan **`rating: 0`** agar pada game client kesulitan ditampilkan sebagai **`"?"`**.
  - Pada database SQLite (`arcaea_database.db`), rating constant diisi **`9.6`** (`rating_byn: 96`) sehingga kalkulasi rating dan potensi tetap akurat.
  - **Larangan Unlocks**: Sesuai aturan arsitektur engine Arcaea, chart Beyond ini **TIDAK didaftarkan pada `unlocks`** untuk mencegah diamond terkunci, label force `?`, dan crash pada tab BEYOND.
  - Jacket `base.png` (Mode P, 447×447) dikonversi menjadi 4 file JPG RGB standar Arcaea (`base.jpg`, `base_256.jpg`, `1080_base.jpg`, `1080_base_256.jpg`).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `3.aff` | Beyond (3) | **BYD ?** (`rating: 0`) | **`9.6`** | **`Charter Berkelas - James`**<br>*(《EPILEPSY AND TONS OF FLASHING LIGHTS WARNING》)* |

---

### 18. Suisei Hathaway Talalala (`suisei_hathaway`)
- **File Sumber:** Direktori `/home/luhung/Documents/Chart/1batch4/James_BottomoftheBin2Packs/suisei_hathaway` (`project.arcproj`)
- **Composer:** Ceka Éclair feat. Hoshimachi Suisei | **Illustrator:** Reiruka れいるか
- **BPM:** `208` (Base BPM: 208.0)
- **Audio & Preview:** Durasi audio: 31.08s (`base.ogg`) | Preview: `1344 ms - 21344 ms` (20.0s Vorbis clip)
- **Side & Background:** Side: `light (0)` | Background: `nijuusei2_light` | Background Inverse: `nijuusei2_conflict` (Dual vanilla client Arcaea) | Custom BG: `suisei_hathaway.jpg` (1920×1440 HD upscaled dari `arccreate_nijuusei_light.jpg`) | Track: `default`
- **Catatan Teknis Chart:**
  - `2.aff` (289 baris, Future 7, CC `7.6`).
  - **Perbaikan Fatal Zero BPM**: 4 titik `timing(..., 0.00, 4.00);` pada baris 241, 248, 251, 255 otomatis diperbaiki menjadi `0.01` (`timing(..., 0.01, 4.00);`) untuk mencegah pembagian dengan nol pada native engine.
  - **Perbaikan Fatal Extreme BPM**: Baris 277 `timing(23651,20800000.00,4.00);` (BPM $2.08 \times 10^7$) otomatis di-clamp ke `timing(23651,1000000.00,4.00);` untuk mencegah Android Scudo OOM (jutaan tick allocation).
  - Timinggroup baris 275: `timinggroup(){` sintaks native valid.
  - Base difficulties [0, 1] dilengkapi placeholder dummy aff unrated.
- **Penyesuaian:** 
  - Future 7 (CC **`7.6`**), charter: **`James`** (alias: `Blue-CMT`), illustrator: **`Reiruka れいるか`**.
  - Didaftarkan ke `unlocks` untuk FTR (ratingClass 2) dengan biaya 150 Fragment.
  - Jacket `base.jpg` dikonversi dan di-crop square menjadi 4 file JPG RGB standar Arcaea (`base.jpg`, `base_256.jpg`, `1080_base.jpg`, `1080_base_256.jpg`).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter & Alias |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 7** | **`7.6`** | **`James (Blue-CMT)`** |
