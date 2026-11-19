# Identifikasi Lengkap 12 Lagu Batch 6 (`1batch6`) — Breakdown Pra-Import

> [!NOTE]
> Dokumen ini merupakan hasil analisis dan breakdown seluruh isi `/home/luhung/Documents/Chart/1batch6` (**9 folder utama / total 12 lagu**: 8 lagu standalone + **1 Pack `Emanant Glass`** berisi 4 lagu) sebelum dieksekusi import ke `ArcaeaServerFork/database/songs/`.
>
> **Temuan Kritis & Hal yang Perlu Konfirmasi Sebelum Import:**
> 1. **Tabrakan Song ID (`angelhalo`)**: `notordtofu.angelhalo` (*天使光輪* — REDALiCE & cosMo@暴走P) bentrok dengan lagu `angelhalo` (*ANGEL HALO* — RADiANT) yang sudah ada di server. **Disarankan pakai ID baru `tenshikourin`**.
> 2. **Pack Baru (`Emanant Glass`)**: Folder `sanctuary.emanantglass` berisi `pack.yml` (`packName: Emanant Glass`, cover `emanantcover.png`, `select_eg.png`) dengan 4 lagu: `Hoshifuri`, `Leadlight`, `Avys`, `ZEИITH` (`set: emanantglass`).
> 3. **Varian Chart `ヒアソビ` (`hiasobi`)**: Memiliki 2 file chart Beyond 10: `3.aff` (**184 `camera()`**, full gimmick) dan `33.aff` (**0 `camera()`**, `NotOrdinaryTofu - No cam`). Perlu dikonfirmasi memakai `3.aff` atau `33.aff` untuk slot BYD 10.
> 4. **3 Paket Masih Berbentuk `.arcpkg`**: `Maholova`, `ヒアソビ` (`hiasobi`), dan `Ark` masih berupa `.arcpkg` di dalam folder hasil ekstrak Google Drive (`*-1-001`).
> 5. **Normalisasi Asset & Audio**:
>    - File audio non-standar (`basase.ogg` pada `chuten`, serta nama panjang pada 4 lagu `Emanant Glass`) wajib di-rename menjadi `base.ogg`.
>    - 5 lagu memakai jacket PNG **RGBA** (`hiasobi`, `Hoshifuri`, `Leadlight`, `Avys`, `Zenith`) → wajib dikonversi ke 4 ukuran **JPEG RGB**.
>    - Preview audio `hiasobi` (31.79s) dan `luminositydyw` (50.74s) melebihi standar 15–25s → disarankan dipotong ke ~20s.
>    - Background `arccreate_*` dapat dipetakan ke vanilla BG (`alice_conflict`, `observer_conflict`, `omatsuri_conflict`, `tanoc_red`, `rotaeno_*`) atau di-upscale Lanczos $\ge 1080$p (`1920×1440`) bersama custom BG `chuten.png` & `ebulition_*`.
> 6. **Sanitasi `.aff` Otomatis (`celest-audit --fix`)**:
>    - Zero BPM (`0.00` → `0.01`): `Maholova` (1), `hiasobi` (5), `Ark` (5), `chuten` (1), `dddeathmatch` (1).
>    - Non-native `scenecontrol` (`groupalpha`) & atribut `timinggroup` non-native (`name="..."`, `noheightindicator`, `noarccap`, `noshadow`, `ignoremirror`, `autoplay`, `noclip`): ditemukan pada `hiasobi`, `chuten`, `dddeathmatch`, `kakuriyo`, `Hoshifuri`, `Leadlight`, `Avys`, `Zenith`.

---

## Ringkasan 12 Lagu Batch 6 (Tabel Master)

| No | Judul Lagu | Folder Sumber | Usulan Song ID | Pack (`set`) | Composer | BPM (Base) | Difficulty Slot | Chart Constant | Charter | Saran Background (`bg` / `bg_inverse`) | Side | Audio Preview |
|:---:|---|---|---|---|---|:---:|:---:|:---:|---|---|:---:|:---:|
| 1 | **Maholova** | `[ACC5] aran - Maholova...` | `maholova` | `single` | aran | `180` | FTR 9+ | `9.8` | NotOrdinaryTofu | `rotaeno_light` *(atau custom HD)* | `light (0)` | `26667 - 48014 ms`<br>(21.35s) |
| 2 | **ヒアソビ** | `[ACC6] ヒアソビ...` | `hiasobi` | `single` | かめりあ (feat. 初音ミク) | `134` | **BYD 10** | `10.3` | NotOrdinaryTofu | `alice_conflict` / `alice_light` | `conflict (1)` | `39437 - 71228 ms`<br>*(31.79s → potong ~20s)* |
| 3 | **Ark** | `kanoryo - Ark...` | `ark` | `single` | kanoryo | `180` | FTR 10 | `10.4` | NotOrdinaryTofu | `observer_conflict` / `observer_light` | `conflict (1)` | `105874 - 128874 ms`<br>(23.00s) |
| 4 | **天使光輪** | `notordtofu.angelhalo` | **`tenshikourin`** *(anti-bentrok)* | `single` | REDALiCE & cosMo@暴走P | `203` | FTR 10+ | `10.9` | NotOrdinaryTofu | `tanoc_red` *(atau custom HD 1920×1440)* | `light (0)` | `58227 - 78030 ms`<br>(19.80s) |
| 5 | **宙天** | `notordtofu.chuten(nerfed)` | `chuten` | `single` | t+pazolite vs かねこちはる | `125 - 190`<br>(190.0) | FTR 10+ | `10.9` *(10.89)* | NotOrdinaryTofu | `chuten` *(Custom HD upscale)* | `conflict (1)` | `57600 - 72960 ms`<br>(15.36s) |
| 6 | **Dual Doom Deathmatch** | `notordtofu.dddeathmatch` | `dddeathmatch` | `single` | Kobaryo vs. HyuN | `222` | **BYD 11** | `11.4` | NotOrdinaryTofu | `rotaeno_conflict` *(atau custom HD)* | `conflict (1)` | `23784 - 41081 ms`<br>(17.30s) |
| 7 | **Kakuriyo** | `notordtofu.kakuriyo` | `kakuriyo` | `single` | polysha | `170` | FTR 10 | `10.3` | NotOrdinaryTofu | `omatsuri_conflict` / `omatsuri_light` | `conflict (1)` | `51882 - 73412 ms`<br>(21.53s) |
| 8 | **Luminosity (Don't you worry)** | `notordtofu.luminositydyw` | `luminositydyw` | `single` | DJ Noriken | `175` | **ETR 9+** | `9.8` | NotOrdinaryTofu | `rotaeno_light` *(atau custom HD)* | `light (0)` | `24686 - 75429 ms`<br>*(50.74s → potong ~20s)* |
| 9 | **Hoshifuri** | `sanctuary.emanantglass/Hoshifuri` | `hoshifuri` | `emanantglass` | Kenuno | `178` | FTR 9+ | `9.7` | Pearlescence | `ebulition_light` *(Custom HD)* | `light (0)` | `94382 - 116292 ms`<br>(21.91s) |
| 10 | **Leadlight** | `sanctuary.emanantglass/Leadlight` | `leadlight` | `emanantglass` | Pearlescence | `174` | FTR 10 | `10.5` | Pearlescence | `ebulition_light` *(Custom HD)* | `light (0)` | `34483 - 56552 ms`<br>(22.07s) |
| 11 | **Avys** | `sanctuary.emanantglass/Avys` | `avys` | `emanantglass` | Se-U-Ra | `182` | FTR 10+ | `10.7` | Pearlescence | `ebulition_conflict` *(Custom HD)* | `conflict (1)` | `46154 - 67253 ms`<br>(21.10s) |
| 12 | **ZEИITH** | `sanctuary.emanantglass/Zenith` | `zenith` | `emanantglass` | Ashrount vs polysha | `190` | FTR 11 | `11.2` | Pearlescence | `ebulition_conflict_boss` *(Custom HD)* | `conflict (1)` | `41684 - 61895 ms`<br>(20.21s) |

---

## Rincian Lengkap per Lagu & Pemetaan Chart

### 1. Maholova (`maholova`)
- **Sumber:** `[ACC5] aran - Maholova-20261119T104546Z-1-001/[ACC5] aran - Maholova/notordtofu.Maholova.arcpkg`
- **Composer:** aran | **Illustrator:** 伊恩 | **Alias:** `Hoppe`
- **BPM:** `180` (Base BPM: `180.0`)
- **Audio & Preview:** Durasi `140.04s` | Preview: `26667 ms - 48014 ms` (`21.35s`)
- **Aset Visual:** Jacket `550×550` RGB | BG `arccreate_rotaeno_light.jpg` (`1280×960`, 575 KB)
- **Catatan Teknis Chart:** `2.aff` (`1385` baris, `0` timinggroup, `1` titik Zero BPM perlu normalisasi ke `0.01`). Base `0.aff` & `1.aff` diisi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 9+** | **`9.8`** | **`NotOrdinaryTofu`** |

---

### 2. ヒアソビ (`hiasobi`)
- **Sumber:** `[ACC6] ヒアソビ - かめりあ (feat. 初音ミク) [Beyond 10]-20261119T105219Z-1-001/[ACC6] ヒアソビ - かめりあ (feat. 初音ミク) [Beyond 10]/notordtofu.hiasobi.arcpkg`
- **Composer:** かめりあ (feat. 初音ミク) | **Illustrator:** りゅうら | **Alias:** `エンデミー`
- **BPM:** `134` (Base BPM: `134.0`)
- **Audio & Preview:** Durasi `130.46s` | Preview: `39437 ms - 71228 ms` (`31.79s` — disarankan potong ke `39437 - 59437 ms`)
- **Aset Visual:** Jacket `740×740` **RGBA** *(perlu konversi RGB JPEG)* | BG `arccreate_alice_conflict.jpg` (`1280×960`, 295 KB)
- **Catatan Teknis Chart:**
  - Tersedia 2 file chart: `3.aff` (`1789` baris, **184 `camera()`**) dan `33.aff` (`1606` baris, **0 `camera()`**, `NotOrdinaryTofu - No cam`).
  - `17` timinggroup dengan atribut non-native (`noheightindicator,noarccap`, `noshadow,ignoremirror,autoplay`), scenecontrol `groupalpha`, dan `5` Zero BPM. Wajib sanitasi via `celest-audit --fix`.
  - Base `0.aff`, `1.aff`, `2.aff` diisi dummy unrated. Dilarang masuk `unlocks`.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `3.aff` *(atau `33.aff`)* | Beyond (3) | **BYD 10** | **`10.3`** | **`NotOrdinaryTofu`** |

---

### 3. Ark (`ark`)
- **Sumber:** `kanoryo - Ark-20261119T104601Z-1-001/kanoryo - Ark/notordtofu.Ark.arcpkg`
- **Composer:** kanoryo | **Illustrator:** MOAI WORKS | **Alias:** `xz_8604 : [ REDEMPTION`
- **BPM:** `180` (Base BPM: `180.0`)
- **Audio & Preview:** Durasi `163.47s` | Preview: `105874 ms - 128874 ms` (`23.00s`)
- **Aset Visual:** Jacket `500×500` RGB | BG `arccreate_observer_conflict.jpg` (`1280×960`, 200 KB)
- **Catatan Teknis Chart:** `2.aff` (`1736` baris, `6` timinggroup standar, `5` titik Zero BPM). Base `0.aff` & `1.aff` diisi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.4`** | **`NotOrdinaryTofu`** |

---

### 4. 天使光輪 (`tenshikourin` — anti-bentrok `angelhalo`)
- **Sumber:** `notordtofu.angelhalo/angelhalo`
- **Composer:** REDALiCE & cosMo@暴走P | **Illustrator:** TOHRU MITSUHASHi / 大熊まい | **Alias:** `原始的な偉大さ`
- **BPM:** `203` (Base BPM: `203.0`)
- **Audio & Preview:** Durasi `140.69s` | Preview: `58227 ms - 78030 ms` (`19.80s`)
- **Aset Visual:** Jacket `1200×1200` RGB | BG `arccreate_tanoc_red.png` (`1920×1440`, 1.07 MB)
- **Catatan Teknis Chart:** `2.aff` (`1767` baris, `0` timinggroup, `0` Zero BPM, bersih!). **Wajib rename ID** dari `angelhalo` menjadi `tenshikourin` agar tidak menimpa `ANGEL HALO` (RADiANT) yang sudah ada di server.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.9`** | **`NotOrdinaryTofu`** |

---

### 5. 宙天 (`chuten`)
- **Sumber:** `notordtofu.chuten(nerfed)/chutenerfdasfas`
- **Composer:** t+pazolite vs かねこちはる | **Illustrator:** 川崎ヒロミツ (SIKAKU Inc.) | **Alias:** `// 創造 \\ Upon the ‣mai‣ universe`
- **BPM:** `125 - 190` (Base BPM: `190.0`)
- **Audio & Preview:** `basase.ogg` *(rename ke `base.ogg`)*, durasi `159.08s` | Preview: `57600 ms - 72960 ms` (`15.36s`)
- **Aset Visual:** Jacket `500×500` RGB | BG `chuten.png` (`1280×960`, 1.58 MB → upscale ke `1920×1440` JPG)
- **Catatan Teknis Chart:** `2.aff` (`3992` baris, `10` timinggroup dengan `name="..."` & `noclip` & `noheightindicator`, scenecontrol `groupalpha`, `1` Zero BPM). CC `10.89` dibulatkan ke `10.9` (`10+`).

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10+** | **`10.9`** | **`NotOrdinaryTofu`** |

---

### 6. Dual Doom Deathmatch (`dddeathmatch`)
- **Sumber:** `notordtofu.dddeathmatch/dddeathmatch`
- **Composer:** Kobaryo vs. HyuN | **Illustrator:** 炎獵 | **Alias:** `Terminate The Tofu`
- **BPM:** `222` (Base BPM: `222.0`)
- **Audio & Preview:** Durasi `141.08s` | Preview: `23784 ms - 41081 ms` (`17.30s`)
- **Aset Visual:** Jacket `base3.jpg` (`2048×2048` RGB) | BG `arccreate_rotaeno_conflict.jpg` (`1280×960`, 557 KB)
- **Catatan Teknis Chart:** `3.aff` (`3452` baris, `4` timinggroup dengan `name="diamond"`, scenecontrol `groupalpha`, `1` Zero BPM). Base `0.aff`, `1.aff`, `2.aff` diisi dummy unrated. Dilarang masuk `unlocks`.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `3.aff` | Beyond (3) | **BYD 11** | **`11.4`** | **`NotOrdinaryTofu`** |

---

### 7. Kakuriyo (`kakuriyo`)
- **Sumber:** `notordtofu.kakuriyo/Kakuriyo`
- **Composer:** polysha | **Illustrator:** 咪酱 | **Alias:** `虹色`
- **BPM:** `170` (Base BPM: `170.0`)
- **Audio & Preview:** Durasi `131.92s` | Preview: `51882 ms - 73412 ms` (`21.53s`)
- **Aset Visual:** Jacket `648×648` RGB | BG `arccreate_omatsuri_conflict.jpg` (`1280×960`, 47.9 KB → pakai vanilla `omatsuri_conflict` / `omatsuri_light`)
- **Catatan Teknis Chart:** `2.aff` (`1446` baris, `2` timinggroup, scenecontrol `groupalpha`, `0` Zero BPM). Base `0.aff` & `1.aff` diisi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 10** | **`10.3`** | **`NotOrdinaryTofu`** |

---

### 8. Luminosity (Don't you worry) (`luminositydyw`)
- **Sumber:** `notordtofu.luminositydyw/luminositydyw`
- **Composer:** DJ Noriken | **Illustrator:** Nich | **Alias:** `NotOrdinaryTofu [To the new era]`
- **BPM:** `175` (Base BPM: `175.0`)
- **Audio & Preview:** Durasi `146.76s` | Preview: `24686 ms - 75429 ms` (`50.74s` — disarankan potong ke `24686 - 44686 ms`)
- **Aset Visual:** Jacket `1000×1000` RGB | BG `arccreate_rotaeno_light.jpg` (`1280×960`, 575 KB)
- **Catatan Teknis Chart:** `4.aff` (`1272` baris, `0` timinggroup, `0` Zero BPM, bersih!). Base `0.aff`, `1.aff`, `2.aff` diisi dummy unrated.

| Chart File | Slot (ratingClass) | Difficulty | Chart Constant | Charter |
|---|---|---|---|---|
| `0.aff` | Past (0) | **PST 0** | `0.0` | *(Unrated Placeholder)* |
| `1.aff` | Present (1) | **PRS 0** | `0.0` | *(Unrated Placeholder)* |
| `2.aff` | Future (2) | **FTR 0** | `0.0` | *(Unrated Placeholder)* |
| `4.aff` | Eternal (4) | **ETR 9+** | **`9.8`** | **`NotOrdinaryTofu`** |

---

## Pack: `Emanant Glass` (`emanantglass` — 4 Lagu)
- **Sumber Pack:** `sanctuary.emanantglass/emanantglasspack` (`pack.yml`: `packName: Emanant Glass`, cover `emanantcover.png`, `select_eg.png`).
- **Catatan Umum Pack:** Keempat lagu memakai `timinggroup(name="noarccap",noarccap)` (perlu strip atribut non-native via `celest-audit --fix`), jacket PNG **RGBA** (perlu konversi JPEG RGB), nama file audio panjang (perlu rename ke `base.ogg`), serta BG `ebulition_*` `1280×960` (disarankan upscale Lanczos `1920×1440` JPG).

### 9. Hoshifuri (`hoshifuri`)
- **Composer:** Kenuno | **Illustrator:** Pearlescence | **Alias:** `Arc: Wake`
- **BPM:** `178` | **Audio:** `143.02s` | **Preview:** `94382 - 116292 ms` (`21.91s`)
- **Jacket:** `hoshijk.png` (`1500×1500` RGBA) | **BG:** `ebulition_light.png` (`1280×960`)
- **Chart:** `2.aff` (`1186` baris) — **FTR 9+**, CC **`9.7`**, Charter **`Pearlescence`**.

### 10. Leadlight (`leadlight`)
- **Composer:** Pearlescence | **Illustrator:** Salt | **Alias:** `Arc: Strike`
- **BPM:** `174` | **Audio:** `137.93s` | **Preview:** `34483 - 56552 ms` (`22.07s`)
- **Jacket:** `Group 58.png` (`2000×2000` RGBA) | **BG:** `ebulition_light.png` (`1280×960`)
- **Chart:** `2.aff` (`1356` baris) — **FTR 10**, CC **`10.5`**, Charter **`Pearlescence`**.

### 11. Avys (`avys`)
- **Composer:** Se-U-Ra | **Illustrator:** Salt | **Alias:** `Arc: Over`
- **BPM:** `182` | **Audio:** `136.07s` | **Preview:** `46154 - 67253 ms` (`21.10s`)
- **Jacket:** `Group 60.png` (`1027×1027` RGBA) | **BG:** `ebulition_conflict.png` (`1280×960`)
- **Chart:** `2.aff` (`1448` baris) — **FTR 10+**, CC **`10.7`**, Charter **`Pearlescence`**.

### 12. ZEИITH (`zenith`)
- **Composer:** Ashrount vs polysha | **Illustrator:** Salt | **Alias:** `Arc: Fracture`
- **BPM:** `190` | **Audio:** `118.52s` | **Preview:** `41684 - 61895 ms` (`20.21s`)
- **Jacket:** `Group 70.png` (`2000×2000` RGBA) | **BG:** `ebulition_conflict_boss.png` (`1280×960`)
- **Chart:** `2.aff` (`1509` baris) — **FTR 11**, CC **`11.2`**, Charter **`Pearlescence`**.
