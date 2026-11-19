# Identifikasi Lengkap 12 Lagu Batch 6 (`1batch6`) — Rencana Import Terkonfirmasi

> [!NOTE]
> Dokumen ini memuat rencana import **12 lagu Batch 6 (`1batch6`)** beserta penyelarasan `songlist` dan `unlocks` berdasarkan arahan terbaru pengguna:
> 1. **Merge `angelhalo` → Slot Eternal (`ratingClass: 4`, ETR 10+ CC `10.9`)**:
>    - Disatukan ke folder server [angelhalo/](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/angelhalo) (existing: FTR 10 CC `10.6` by `RADiANT.`).
>    - Chart `notordtofu.angelhalo` masuk ke slot **Eternal (`4.aff`, `ratingClass: 4`)** dengan **`"audioOverride": true`**. Karena Arcaea membaca `{rc}.ogg` dan `{rc}_preview.ogg`, file audionya harus memakai **`4.ogg`** dan **`4_preview.ogg`** (khusus `ratingClass: 4`), serta **`4.jpg` / `4_256.jpg` / `1080_4.jpg` / `1080_4_256.jpg`** (`"jacketOverride": true`) agar jacket `天使光輪` ikut tampil di ETR.
> 2. **Dua Slot untuk `hiasobi` (FTR 10 & BYD 10)**:
>    - **`3.aff` (Full `184 camera()`):** Masuk slot **Beyond 10 (`ratingClass: 3`, CC `10.3`)**, dinormalisasi sintaks camera & timinggroup-nya agar aman di `AffParser` native.
>    - **`33.aff` (`NotOrdinaryTofu - No cam`, `0 camera()`):** Dipetakan ke **`2.aff` / Future 10 (`ratingClass: 2`, CC `10.3`)** sebagai variasi non-camera. Base `0.aff` & `1.aff` diisi dummy unrated (`rating: 0`).
> 3. **Audio Preview > 20s Dipertahankan**:
>    - Preview `hiasobi` (`39437 - 71228 ms`, `31.79s`) dan `luminositydyw` (`24686 - 75429 ms`, `50.74s`) **tidak dipotong**, dipertahankan sesuai file sumber.
> 4. **Side untuk `chuten` (`宙天`)**:
>    - Menggunakan **`side: 3` (`Lephon`)**, dengan constant dibulatkan `10.89` → **`10.9`** (`10+`, `ratingPlus: true`).
> 5. **Merge `dualdoom` dengan Chart Official (`1official/dualdoom`)**:
>    - Chart **BYD 11 (`3.aff`, CC `11.4`, charter `NotOrdinaryTofu`)** dari `notordtofu.dddeathmatch` disatukan ke ID **`dualdoom`** bersama chart official **PST 3 (`0.aff`), PRS 6 (`1.aff`), FTR 8+ (`2.aff`), ETR 10 (`4.aff`)** (metadata vanilla APK 7.1.0c: `Kobaryo vs HyuN`, `bpm: 222`, `bg: rotaeno_conflict`, `bg_inverse: rotaeno_light`, `source_copyright: "© Dream Engine Games"`).
>    - [!IMPORTANT] Folder `/home/luhung/Documents/Chart/1official/dualdoom` (atau `.arcpkg`-nya dari `fragments-portal`) **belum ada di disk saat ini** (di `arcaea_7.1.0c.apk` hanya tersedia `1080_base.jpg`, `1080_base_256.jpg`, `preview.ogg` karena official `dualdoom` memakai `remote_dl: true`). Wajib siapkan paket/folder `1official/dualdoom` sebelum eksekusi import `dualdoom`.
> 6. **Kelengkapan Search & Copyright Metadata di [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist)**:
>    - Semua lagu Batch 6 wajib dilengkapi key **`category`**, **`source_copyright`** *(jika kolaborasi/franchise resmi)*, **`search_title`** (`en`, `ja`, `ko`), dan **`search_artist`** (`en`, `ja`, `ko`).
> 7. **Penyelarasan Fragment Cost di [unlocks](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/unlocks)**:
>    - Mengikuti aturan `fill_fragment.py` (`credit = round(constant * 10)` untuk `rc` 0, 1, 2, 4; `credit: 1` untuk dummy `rating: 0`; **`ratingClass: 3` BYD dilarang masuk `unlocks`**).
>    - Audit seluruh `unlocks` vs `songlist` saat ini menemukan **2 ketidaksesuaian**:
>      - **`ray` (`rc=4`)**: tercatat `credit: 97` → wajib diperbaiki ke **`96`** (`constant: 9.6`).
>      - **`tsukinimurakumo` (`rc=2`)**: tercatat `credit: 85` → wajib diperbaiki ke **`87`** (`constant: 8.7`).
>      - *(Catatan untuk **`millionpp`**: hanya memiliki entry `rc=0, 1, 2` dengan `credit: 1`, karena satu-satunya chart berperingkatnya adalah `rc=3` BYD `12.8`/`12+` yang dilarang dideklarasikan di `unlocks` per `AGENTS.md` Check 1 & 7).*

---

## Ringkasan 12 Lagu Batch 6 (Tabel Master Terkoreksi)

| No | Judul Lagu | Folder Sumber | Song ID | Pack (`set`) | Composer | BPM (Base) | Difficulty Slot | Chart Constant | Charter | Background (`bg` / `bg_inverse`) | Side | Category | Audio Preview |
|:---:|---|---|---|---|---|:---:|:---:|:---:|---|---|:---:|---|:---:|
| 1 | **Maholova** | `[ACC5] aran - Maholova...` | `maholova` | `single` | aran | `180` | FTR 9+ | `9.8` | NotOrdinaryTofu | `rotaeno_light` *(atau custom HD)* | `light (0)` | `musicgames` | `26667 - 48014 ms`<br>(21.35s) |
| 2 | **ヒアソビ** | `[ACC6] ヒアソビ...` | `hiasobi` | `single` | かめりあ (feat. 初音ミク) | `134` | **FTR 10** *(No Cam)*<br>**BYD 10** *(Camera)* | `10.3`<br>`10.3` | NotOrdinaryTofu - No cam (`2`)<br>NotOrdinaryTofu (`3`) | `alice_conflict` / `alice_light` | `conflict (1)` | `musicgames` | `39437 - 71228 ms`<br>(31.79s) |
| 3 | **Ark** | `kanoryo - Ark...` | `ark` | `single` | kanoryo | `180` | FTR 10 | `10.4` | NotOrdinaryTofu | `observer_conflict` / `observer_light` | `conflict (1)` | `musicgames` | `105874 - 128874 ms`<br>(23.00s) |
| 4 | **ANGEL HALO**<br>*(天使光輪)* | `notordtofu.angelhalo` | **`angelhalo`**<br>*(Merge)* | `single` | REDALiCE & cosMo＠暴走P | `203` | FTR 10 *(existing)*<br>**ETR 10+** *(override)* | `10.6`<br>**`10.9`** | RADiANT. (`2`)<br>NotOrdinaryTofu (`4`) | `wacca_boss` | `light (0)` | `musicgames` | `66403 - 85320 ms` *(base)*<br>`58227 - 78030 ms` *(`4_preview.ogg`)* |
| 5 | **宙天** | `notordtofu.chuten(nerfed)` | `chuten` | `single` | t+pazolite vs かねこちはる | `125 - 190`<br>(190.0) | FTR 10+ | `10.9` | NotOrdinaryTofu | `chuten` *(Custom HD upscale)* | **`lephon (3)`** | `musicgames` | `57600 - 72960 ms`<br>(15.36s) |
| 6 | **Dual Doom Deathmatch** | `1official/dualdoom` + `notordtofu.dddeathmatch` | **`dualdoom`**<br>*(Merge)* | `single` *(atau `rotaeno`)* | Kobaryo vs. HyuN | `222` | PST 3 / PRS 6 / FTR 8+ / ETR 10 *(Official)*<br>**BYD 11** *(Batch 6)* | Official +<br>**`11.4`** (`3`) | NITRO (`0,1,2,4`)<br>NotOrdinaryTofu (`3`) | `rotaeno_conflict` / `rotaeno_light` | `conflict (1)` | `musicgames` | `23784 - 41081 ms`<br>(17.30s) |
| 7 | **Kakuriyo** | `notordtofu.kakuriyo` | `kakuriyo` | `single` | polysha | `170` | FTR 10 | `10.3` | NotOrdinaryTofu | `omatsuri_conflict` / `omatsuri_light` | `conflict (1)` | `variety` | `51882 - 73412 ms`<br>(21.53s) |
| 8 | **Luminosity (Don't you worry)** | `notordtofu.luminositydyw` | `luminositydyw` | `single` | DJ Noriken | `175` | **ETR 9+** | `9.8` | NotOrdinaryTofu | `rotaeno_light` *(atau custom HD)* | `light (0)` | `musicgames` | `24686 - 75429 ms`<br>(50.74s) |
| 9 | **Hoshifuri** | `sanctuary.emanantglass/Hoshifuri` | `hoshifuri` | `emanantglass` | Kenuno | `178` | FTR 9+ | `9.7` | Pearlescence | `ebulition_light` *(Custom HD)* | `light (0)` | `variety` | `94382 - 116292 ms`<br>(21.91s) |
| 10 | **Leadlight** | `sanctuary.emanantglass/Leadlight` | `leadlight` | `emanantglass` | Pearlescence | `174` | FTR 10 | `10.5` | Pearlescence | `ebulition_light` *(Custom HD)* | `light (0)` | `variety` | `34483 - 56552 ms`<br>(22.07s) |
| 11 | **Avys** | `sanctuary.emanantglass/Avys` | `avys` | `emanantglass` | Se-U-Ra | `182` | FTR 10+ | `10.7` | Pearlescence | `ebulition_conflict` *(Custom HD)* | `conflict (1)` | `musicgames` | `46154 - 67253 ms`<br>(21.10s) |
| 12 | **ZEИITH** | `sanctuary.emanantglass/Zenith` | `zenith` | `emanantglass` | Ashrount vs polysha | `190` | FTR 11 | `11.2` | Pearlescence | `ebulition_conflict_boss` *(Custom HD)* | `conflict (1)` | `musicgames` | `41684 - 61895 ms`<br>(20.21s) |

---

## Rincian Lengkap per Lagu & Pemetaan Chart

### 1. Maholova (`maholova`)
- **Sumber:** `[ACC5] aran - Maholova-20261119T104546Z-1-001/[ACC5] aran - Maholova/notordtofu.Maholova.arcpkg`
- **Composer:** aran | **Illustrator:** 伊恩 | **Alias:** `Hoppe`
- **Category:** `musicgames` | **Source Copyright:** `© Dream Engine Games` *(Rotaeno)*
- **Search Metadata:**
  - `search_title`: `en: ["Maholova", "maholova", "Hoppe"]`, `ja: ["Maholova", "まほろば", "マホロバ"]`, `ko: ["Maholova", "마호로바"]`
  - `search_artist`: `en: ["aran", "Aran"]`, `ja: ["aran"]`, `ko: ["aran"]`
- **BPM:** `180` (`bpm_base: 180`) | **Audio:** `140.04s` | **Preview:** `26667 - 48014 ms` (`21.35s`)
- **Visual & Side:** Side `light (0)` | Jacket `550×550` RGB | BG `rotaeno_light` (atau `arccreate_rotaeno_light.jpg` upscale HD)
- **Teknis Chart:** `2.aff` (`1385` baris, `1` Zero BPM → `0.01`). Base `0.aff` & `1.aff` dummy (`credit: 1`), `2.aff` (`credit: 98`).

---

### 2. ヒアソビ (`hiasobi`)
- **Sumber:** `[ACC6] ヒアソビ - かめりあ (feat. 初音ミク) [Beyond 10]-20261119T105219Z-1-001/[ACC6] ヒアソビ - かめりあ (feat. 初音ミク) [Beyond 10]/notordtofu.hiasobi.arcpkg`
- **Composer:** かめりあ (feat. 初音ミク) | **Illustrator:** りゅうら | **Alias:** `エンデミー`
- **Category:** `musicgames` | **Source Copyright:** `© SEGA / Colorful Palette` *(Project SEKAI)*
- **Search Metadata:**
  - `search_title`: `en: ["Hiasobi", "hiasobi", "Play with Fire", "エンデミー"]`, `ja: ["ヒアソビ", "ひあそび", "エンデミー"]`, `ko: ["Hiasobi", "히아소비"]`
  - `search_artist`: `en: ["Camellia", "cametek", "Hatsune Miku", "Camellia feat. Hatsune Miku"]`, `ja: ["かめりあ", "初音ミク", "かめりあ (feat. 初音ミク)"]`, `ko: ["카메리아", "하츠네 미쿠"]`
- **BPM:** `134` (`bpm_base: 134`) | **Audio:** `130.46s` | **Preview:** `39437 - 71228 ms` (`31.79s` — dipertahankan)
- **Visual & Side:** Side `conflict (1)` | Jacket `740×740` RGBA → JPEG RGB | BG `alice_conflict` / `alice_light`
- **Teknis Chart (2 Variasi):**
  - `0.aff` & `1.aff`: Dummy unrated (`credit: 1`).
  - `2.aff` *(dari `33.aff`)*: **FTR 10** (`constant: 10.3`, `ratingPlus: false`, `NotOrdinaryTofu - No cam`, `1606` baris, `0` camera, `unlocks` `credit: 103`).
  - `3.aff` *(dari `3.aff`)*: **BYD 10** (`constant: 10.3`, `ratingPlus: false`, `NotOrdinaryTofu`, `1789` baris, **184 `camera()`** dinormalisasi `celest-audit --fix`, tanpa entry `unlocks`).
  - Kedua chart memiliki `17` timinggroup non-native & scenecontrol `groupalpha` + `5` Zero BPM yang otomatis dinormalisasi saat sanitasi.

---

### 3. Ark (`ark`)
- **Sumber:** `kanoryo - Ark-20261119T104601Z-1-001/kanoryo - Ark/notordtofu.Ark.arcpkg`
- **Composer:** kanoryo | **Illustrator:** MOAI WORKS | **Alias:** `xz_8604 : [ REDEMPTION`
- **Category:** `musicgames` | **Source Copyright:** `© Pigeon Games` *(Phigros)*
- **Search Metadata:**
  - `search_title`: `en: ["Ark", "ark", "REDEMPTION"]`, `ja: ["Ark", "アーク"]`, `ko: ["Ark", "아크"]`
  - `search_artist`: `en: ["kanoryo", "Kanoryo"]`, `ja: ["kanoryo"]`, `ko: ["kanoryo"]`
- **BPM:** `180` (`bpm_base: 180`) | **Audio:** `163.47s` | **Preview:** `105874 - 128874 ms` (`23.00s`)
- **Visual & Side:** Side `conflict (1)` | Jacket `500×500` RGB | BG `observer_conflict` / `observer_light`
- **Teknis Chart:** `2.aff` (`1736` baris, `6` timinggroup, `5` Zero BPM → `0.01`, `unlocks` `credit: 104`). Base `0.aff` & `1.aff` dummy (`credit: 1`).

---

### 4. ANGEL HALO (`angelhalo` — Merge Slot ETR + `audioOverride`)
- **Sumber:** `notordtofu.angelhalo/angelhalo` digabung ke folder server `ArcaeaServerFork/database/songs/angelhalo/`
- **Composer:** REDALiCE & cosMo＠暴走P | **Illustrator:** TOHRU MITSUHASHi / 大熊まい
- **Category:** `musicgames` | **Source Copyright:** `©SEGA`
- **Search Metadata:** *(pertahankan metadata lengkap yang sudah ada + tambah alias `原始的な偉大さ` jika perlu)*
- **Side & Visual:** Side `light (0)` | Base BG `wacca_boss` | Jacket override untuk ETR: `4.jpg`, `4_256.jpg`, `1080_4.jpg`, `1080_4_256.jpg` (`jacketOverride: true`).
- **Audio & `audioOverride`:**
  - Base `0, 1, 2`: pakai `base.ogg` & `preview.ogg` existing (`66403 - 85320 ms`).
  - Slot **ETR (`4.aff`, `ratingClass: 4`)**: pakai `"audioOverride": true` dengan file **`4.ogg`** (`140.69s`) dan **`4_preview.ogg`** (`58227 - 78030 ms`, `19.80s`).
- **Pemetaan Difficulty & Unlocks:**
  - `0.aff`: Dummy (`rating: 0`, `credit: 1`)
  - `1.aff`: Dummy (`rating: 0`, `credit: 1`)
  - `2.aff`: **FTR 10** (`10.6`, `RADiANT.`, `credit: 106` — existing)
  - `4.aff`: **ETR 10+** (**`10.9`**, `ratingPlus: true`, `NotOrdinaryTofu`, `audioOverride: true`, `jacketOverride: true`, `unlocks` **`credit: 109`**)

---

### 5. 宙天 (`chuten`)
- **Sumber:** `notordtofu.chuten(nerfed)/chutenerfdasfas`
- **Composer:** t+pazolite vs かねこちはる | **Illustrator:** 川崎ヒロミツ (SIKAKU Inc.) | **Alias:** `// 創造 \\`
- **Category:** `musicgames` | **Source Copyright:** `© SEGA` *(maimai)*
- **Search Metadata:**
  - `search_title`: `en: ["Chuten", "chuten", "Solstice", "Chuuten"]`, `ja: ["宙天", "ちゅうてん", "チュウテン"]`, `ko: ["宙天", "츄텐"]`
  - `search_artist`: `en: ["t+pazolite vs Chiharu Kaneko", "t+pazolite", "tpazolite", "Chiharu Kaneko", "kanekochiharu"]`, `ja: ["t+pazolite vs かねこちはる", "t+pazolite", "かねこちはる"]`, `ko: ["t+pazolite vs 카네코 치하루"]`
- **BPM:** `125 - 190` (`bpm_base: 190`) | **Audio:** `basase.ogg` → `base.ogg` (`159.08s`) | **Preview:** `57600 - 72960 ms` (`15.36s`)
- **Visual & Side:** Side **`lephon (3)`** | Jacket `500×500` RGB | BG `chuten.jpg` (Custom HD upscale dari `1280×960`)
- **Teknis Chart:** `2.aff` (`3992` baris, FTR 10+ CC `10.9` dari `10.89`, `unlocks` `credit: 109`). Base `0.aff` & `1.aff` dummy (`credit: 1`). Sanitasi atribut `name="..."`, `noclip`, `noheightindicator`, `groupalpha`, dan `1` Zero BPM.

---

### 6. Dual Doom Deathmatch (`dualdoom` — Merge `1official/dualdoom` + Batch 6 BYD 11)
- **Sumber Merge:** `/home/luhung/Documents/Chart/1official/dualdoom` *(belum ada di disk)* + `1batch6/notordtofu.dddeathmatch/dddeathmatch`
- **Composer:** Kobaryo vs. HyuN | **Illustrator:** 炎獵 | **Alias:** `Terminate The Tofu`
- **Category:** `musicgames` | **Source Copyright:** `© Dream Engine Games` *(Rotaeno)*
- **Search Metadata:**
  - `search_title`: `en: ["Dual Doom Deathmatch", "dualdoom", "dual doom deathmatch", "dddeathmatch"]`, `ja: ["Dual Doom Deathmatch", "でゅあるどぅーむですまっち"]`, `ko: ["Dual Doom Deathmatch", "듀얼 룸 데스매치"]`
  - `search_artist`: `en: ["Kobaryo vs. HyuN", "Kobaryo", "HyuN"]`, `ja: ["Kobaryo vs. HyuN", "こばりょー", "ひゅん"]`, `ko: ["Kobaryo vs. HyuN", "코바료", "현"]`
- **BPM:** `222` (`bpm_base: 222`) | **Side & BG:** `conflict (1)`, `rotaeno_conflict` / `rotaeno_light`
- **Audio & Jacket:** `base.ogg` (`141.08s`), Preview `23784 - 41081 ms` (`17.30s`), Jacket `base3.jpg` (`2048×2048` RGB → 4 ukuran; plus jacket official jika berbeda)
- **Pemetaan Difficulty & Unlocks:**
  - `0.aff`: **PST 3** *(Official, `NITRO`)*
  - `1.aff`: **PRS 6** *(Official, `NITRO`)*
  - `2.aff`: **FTR 8+** *(Official, `NITRO`)*
  - `3.aff`: **BYD 11** (`11.4`, `NotOrdinaryTofu`, `3452` baris, sanitasi `name="diamond"`, `groupalpha`, `1` Zero BPM — **tidak masuk `unlocks`**)
  - `4.aff`: **ETR 10** *(Official, `NITRO`)*

---

### 7. Kakuriyo (`kakuriyo`)
- **Sumber:** `notordtofu.kakuriyo/Kakuriyo`
- **Composer:** polysha | **Illustrator:** 咪酱 | **Alias:** `虹色`
- **Category:** `variety` | **Source Copyright:** `""` *(Original / Doujin)*
- **Search Metadata:**
  - `search_title`: `en: ["Kakuriyo", "kakuriyo"]`, `ja: ["Kakuriyo", "かくりよ", "カクリヨ", "幽世"]`, `ko: ["Kakuriyo", "카쿠리요"]`
  - `search_artist`: `en: ["polysha", "Polysha"]`, `ja: ["polysha"]`, `ko: ["polysha"]`
- **BPM:** `170` (`bpm_base: 170`) | **Audio:** `131.92s` | **Preview:** `51882 - 73412 ms` (`21.53s`)
- **Visual & Side:** Side `conflict (1)` | Jacket `648×648` RGB | BG `omatsuri_conflict` / `omatsuri_light`
- **Teknis Chart:** `2.aff` (`1446` baris, FTR 10 CC `10.3`, sanitasi `groupalpha`, `unlocks` `credit: 103`). Base `0.aff` & `1.aff` dummy (`credit: 1`).

---

### 8. Luminosity (Don't you worry) (`luminositydyw`)
- **Sumber:** `notordtofu.luminositydyw/luminositydyw`
- **Composer:** DJ Noriken | **Illustrator:** Nich | **Alias:** `NotOrdinaryTofu [To the new era]`
- **Category:** `musicgames` | **Source Copyright:** `© Dream Engine Games` *(Rotaeno)*
- **Search Metadata:**
  - `search_title`: `en: ["Luminosity (Don't you worry)", "Luminosity", "luminosity", "luminositydyw", "Don't you worry"]`, `ja: ["Luminosity (Don't you worry)", "Luminosity", "ルミノシティ"]`, `ko: ["Luminosity (Don't you worry)", "루미노시티"]`
  - `search_artist`: `en: ["DJ Noriken", "Noriken", "dj noriken"]`, `ja: ["DJ Noriken"]`, `ko: ["DJ Noriken"]`
- **BPM:** `175` (`bpm_base: 175`) | **Audio:** `146.76s` | **Preview:** `24686 - 75429 ms` (`50.74s` — dipertahankan)
- **Visual & Side:** Side `light (0)` | Jacket `1000×1000` RGB | BG `rotaeno_light` (atau `arccreate_rotaeno_light.jpg` upscale HD)
- **Teknis Chart:** `4.aff` (`1272` baris, **ETR 9+**, CC `9.8`, bersih!, `unlocks` `credit: 98`). Base `0.aff`, `1.aff`, `2.aff` dummy (`credit: 1`).

---

## Pack: `Emanant Glass` (`emanantglass` — 4 Lagu)
- **Sumber Pack:** `sanctuary.emanantglass/emanantglasspack` (`pack.yml`: `packName: Emanant Glass`, cover `emanantcover.png`, `select_eg.png`).
- **Catatan Umum Pack:** Semua chart memakai `timinggroup(name="noarccap",noarccap)` (strip via `celest-audit --fix`), jacket PNG **RGBA** → JPEG RGB, nama audio panjang → `base.ogg`, serta BG `ebulition_*` `1280×960` di-upscale Lanczos `1920×1440` JPG.

### 9. Hoshifuri (`hoshifuri`)
- **Composer:** Kenuno | **Illustrator:** Pearlescence | **Alias:** `Arc: Wake`
- **Category:** `variety` | **Source Copyright:** `© Kenuno`
- **Search Metadata:** `search_title`: `["Hoshifuri", "hoshifuri", "星降り", "호시후리"]`, `search_artist`: `["Kenuno", "kenuno"]`
- **BPM:** `178` | **Audio:** `143.02s` | **Preview:** `94382 - 116292 ms` (`21.91s`) | **Side:** `light (0)` | **BG:** `ebulition_light`
- **Chart:** `2.aff` (`1186` baris) — **FTR 9+**, CC **`9.7`** (`unlocks` `credit: 97`), Charter **`Pearlescence`**. Base `0, 1` dummy.

### 10. Leadlight (`leadlight`)
- **Composer:** Pearlescence | **Illustrator:** Salt | **Alias:** `Arc: Strike`
- **Category:** `variety` | **Source Copyright:** `© Pearlescence`
- **Search Metadata:** `search_title`: `["Leadlight", "leadlight", "リードライト"]`, `search_artist`: `["Pearlescence", "pearlescence"]`
- **BPM:** `174` | **Audio:** `137.93s` | **Preview:** `34483 - 56552 ms` (`22.07s`) | **Side:** `light (0)` | **BG:** `ebulition_light`
- **Chart:** `2.aff` (`1356` baris) — **FTR 10**, CC **`10.5`** (`unlocks` `credit: 105`), Charter **`Pearlescence`**. Base `0, 1` dummy.

### 11. Avys (`avys`)
- **Composer:** Se-U-Ra | **Illustrator:** Salt | **Alias:** `Arc: Over`
- **Category:** `musicgames` | **Source Copyright:** `© BIGO LIVE / Orzmic` *(Orzmic)*
- **Search Metadata:** `search_title`: `["Avys", "avys", "アビス"]`, `search_artist`: `["Se-U-Ra", "seura", "SeURa"]`
- **BPM:** `182` | **Audio:** `136.07s` | **Preview:** `46154 - 67253 ms` (`21.10s`) | **Side:** `conflict (1)` | **BG:** `ebulition_conflict`
- **Chart:** `2.aff` (`1448` baris) — **FTR 10+**, CC **`10.7`** (`unlocks` `credit: 107`), Charter **`Pearlescence`**. Base `0, 1` dummy.

### 12. ZEИITH (`zenith`)
- **Composer:** Ashrount vs polysha | **Illustrator:** Salt | **Alias:** `Arc: Fracture`
- **Category:** `musicgames` | **Source Copyright:** `© KONAMI` *(SDVX)*
- **Search Metadata:** `search_title`: `["ZEИITH", "ZENITH", "zenith", "ゼニス", "제니스"]`, `search_artist`: `["Ashrount vs polysha", "Ashrount", "polysha"]`
- **BPM:** `190` | **Audio:** `118.52s` | **Preview:** `41684 - 61895 ms` (`20.21s`) | **Side:** `conflict (1)` | **BG:** `ebulition_conflict_boss`
- **Chart:** `2.aff` (`1509` baris) — **FTR 11**, CC **`11.2`** (`unlocks` `credit: 112`), Charter **`Pearlescence`**. Base `0, 1` dummy.
