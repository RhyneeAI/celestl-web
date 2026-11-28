# Identifikasi & Audit Teknis Chart Batch 9 (`/home/luhung/Documents/Chart/1chart9`)

> **Status Dokumen:** Audit pra-import (untuk rilis **v1.10**, **BELUM di-import** ke `ArcaeaServerFork/database/songs/`).
> **Total File di Direktori:** **27 arsip** (`23` awal + `4` tambahan: `Arcanahikari.sakutorei.arcpkg`, `deluxelight.abyssalduality.arcpkg`, `hyper_memories.fixed1.arcpkg`, `notordtofu.cytus2hydra.arcpkg` + `1` file BG `chariot.webp`).
> **Hasil Pemetaan:** `1` duplikat arsip (`META-morphose`), `1` pasangan multi-diff siap merge (`thrinos;pygmalion` FTR+BYD), `4` integrasi ke lagu eksisting/pasangan (`braveroad` +ETR, `ultimateforce` FTR+ETR, `spasmodic` blend FTR+BYD, `altersist` blend FTR+BYD), `2` pack baru (`milthm`, `rizline`), plus timpa banner enhancement (`sdvx`, `orzmic`, `vstasis`).

---

## 1. Inventaris Lengkap 27 Arsip (`1chart9`)

| # | Nama File | Format | ID (Arsip) | Judul & Artist | Diff & Rating/CC (Arsip) | Origin (Verifikasi Web/Tag) | Status Awal |
|---:|---|---|---|---|---|---|---|
| 1 | `Arcanahikari.Rei.arcpkg` | `.arcpkg` | `Rei` | **Rei** (*靈*) — `MYTK` | BYD `11+` (`11.9`) | **Milthm** (*Side Story Ch. 1*) | Fix `.aff`/SC/jacket/preview; `track: "dark"` |
| 2 | `Arcanahikari.sakutorei.arcpkg` | `.arcpkg` | `sakutorei` | **Sakuyahime** *(-> Rei)* — `MYTK` | ETR `10?` (`12.8`) | **Milthm** (*Side Story 1 Anomaly Cut*) | **BARU:** `338.88s`, audio `-17.8 dB`, `4` cam, `164` SC, `360×360` PNG |
| 3 | `Arcaneura.META-morphose.arcpkg` | `.arcpkg` | `META-morphose` | **META-morphose** — `Silentroom` | ETR `10+` (`10.7`) | Album *In My Heart* | **DUPLIKAT** (punya `neg_t=-10000`, kalah dari #4) |
| 4 | `Arcaneura.META-morphose (1).arcpkg` | `.arcpkg` | `META-morphose` | **META-morphose** — `Silentroom` | ETR `10+` (`10.7`) | Album *In My Heart* | **Pilih ini** (`neg_t` sudah diperbaiki) |
| 5 | `Fatum.SUPERNOVA.arcpkg` | `.arcpkg` | `supernova` | **SUPERNOVA** — `Kyotsugyon` | BYD `12` (`12.3`) | **vivid/stasis** (*Ch. 4*) | Siap olah (JSON wrapper + PNG RGBA + stub) |
| 6 | `Tefrish.UnravelingStasis.arcpkg` | `.arcpkg` | `unravelingstasis` | **Unraveling Stasis** — `l'avenir proche` | FTR `11` (`11.6`) | **vivid/stasis** (*Ch. 2*) | BG khusus `vividstasis_yuri` (upscale 1080p) + `11` |
| 7 | `deluxelight.abyssalduality.arcpkg` | `.arcpkg` | `abyssalduality` | **Abyssal Duality** — `Ashrount vs. 打打だいず` | **Inscribed `11+`** (`11.7`, `legacy11: true`, `ratingClassAlias: 1`) | Album *Abyssal Duality* (`2024`) | `3.aff`, `232.59s`, `-7.9 dB`, butuh `preview` (`5s` kosong) |
| 8 | `hyper_memories.fixed1.arcpkg` | `.arcpkg` | `hypermemories` (`fixed1`) | **Hyper Memories** — `Wooden & Salty Salt` | ETR **`11.3`** (`4.aff`) | **Milthm** (*Ch. 1*) | `328× zero_arc_at`, `tg_eq`, BG **`byd_2_conflict`** / `byd_light` |
| 9 | `notordtofu.cytus2hydra.arcpkg` | `.arcpkg` | `hydra` (`cytus2hydra`) | **Hydra** — `James Landino X Akira Complex` | FTR **`10.6`** (`2.aff`) | **Cytus II** | **BARU:** `149.98s`, `-12.4 dB`, `.aff` bersih, BG **`cytus_conflict`** / `cytus_light` |
| 9 | `[BYD10.0]Chariot.zip` | `.zip` | `chariot` | **Chariot** — `USAO` | BYD `10` (`10.0`) | **WACCA** | Pakai BG `chariot.webp` -> JPG + `track: "tempestissimo"` |
| 10 | `[BYD10.6]OΔYΣΣEIA - Sober Bear.zip` | `.zip` | `odysseia` | **ΟΔΥΣΣΕΙΑ** — `Sober Bear` | BYD `10.6` *(JSON `10+`)* | **Arcaea** (*Song Contest 2020*) | Belum ada di server; koreksi `ratingPlus: false` |
| 11 | `[BYD10.7]Altersist (Album Ver.).zip` | `.zip` | `altersistfull` | **Altersist (Album Ver.)** — `void (Mournfinale)` | BYD `10+` (`10.7`) | Album *Altersist* (`7m 42s`) | **BLEND** ke `altersist` sebagai BYD (`audioOverride`) |
| 12 | `[BYD11.7]運命論.zip` | `.zip` | `unmeiron` | **Unmeiron** (*運命論*) — `ルゼ feat. えみゅう` | BYD `11.7` *(JSON `legacy11`)* | **BMS** (*BOF2013*) | `side: 4`, `bg: "konzetsu-a"`, `inv: "konzetsu-b"`, `track: "dark_vs"` |
| 13 | `[BYD12.5]Lingering Souls.zip` | `.zip` | `lingeringsouls` | **Lingering Souls** — `void (Mournfinale) feat. AKA` | BYD `12.5` *(JSON `legacy11`)* | Album *AD:PIANO X* (`100 BPM`) | `bg: "eclipse_conflict"`, `inv: "eclipse_light"` (`12`) |
| 14 | `[ETR10.4]Altersist.zip` | `.zip` | `altersist` | **Altersist (Cut Ver.)** — `void (Mournfinale)` | ETR `10` -> **FTR** `10.4` | **BMS / Arcaea** (`2m 56s`) | **BLEND** ke `altersist` sebagai FTR (`2.aff`) |
| 15 | `[FTR10.1]Gimme x Gimme.zip` | `.zip` | `gimme` | **Gimme x Gimme** — tag audio: `初音ミク+鏡音リン` *(JSON: `P*Light/ギガP`)* | FTR `10` (`10.1`) | **Project SEKAI / Vocaloid** | Konfirmasi koreksi artist ke `八王子P × Giga` |
| 16 | `[FTR10.3]Triad of Dryad.zip` | `.zip` | `triadofdryad` | **Triad of Dryad** — `MYUKKE.` | FTR `10` (`10.3`) | **Rotaeno** (*Ch. 3*) | Bersih, hapus folder `Arcade/` |
| 17 | `[FTR10.3]テトリス.zip` | `.zip` | `tetorisu` | **テトリス** — `柊マグネタイト` | FTR `10` (`10.3`) | **SynthV / Project SEKAI / maimai** | Bersih, potong `preview.ogg` |
| 18 | `[FTR10.4]Name of oath.zip` | `.zip` | `nameofoath` | **Name of oath** — `void (Mournfinale) feat. コツキミヤ (Gt. えば)` | FTR `10` (`10.4`) | **BMS (*BOF2010*) / CHUNITHM / Rotaeno** | Upscale jacket `300×300` + hapus `Arcade/` |
| 19 | `[FTR10.6]thrinos;pygmalion.zip` | `.zip` | `thrinospygmalion` | **thrinos;pygmalion** — `baeddelite` | FTR `10` (`10.6`) | **vivid/stasis** (*Final Ch.*) | **MERGE dengan #26** (`track: "arcana"`, BG `vivid_thrinos`) |
| 20 | `[FTR10.8]Spasmodic.zip` | `.zip` | `spasmodic` | **Spasmodic** — `姜米條` *(JSON meme)* | FTR `10+` (`10.8`) | **Phigros** (*Ch. 5*) | **BLEND FTR** + Haocore di BYD `3.aff` (`audioOverride` + `jacketOverride`) |
| 21 | `[FTR11.2]BR-E ROAD.zip` | `.zip` | `braveroad` | **BRAVE：ROAD** — `uma vs. モリモリあつし` | ETR `11.2` (`4.aff`) | **Rizline** (*Disc 1*) | **TAMBAH ETR** di `kurumi/braveroad` (`audioOverride`) |
| 22 | `[FTR11.6]BANGING STRIKE.zip` | `.zip` | `bangingstrike` | **BANGING STRIKE** — `Dew Pleiades` | FTR `11.6` *(JSON `legacy11`)* | **Phigros** (*PMT 2025*) | Hapus `legacy11`, `bg: "single2_conflict"`, `inv: "single2_light"` |
| 23 | `[FTR11.6]Ultimate Force.zip` | `.zip` | `ultimateforce` | **Ultimate Force** — `Sakuzyo` | FTR `11.6` (+ Adr ETR `11.8`) | **CHUNITHM** | **MERGE FTR+ETR** (durasi sama `149.30s` vs `149.35s`) |
| 24 | `evenattheend.zip` | `.zip` | `evenattheend` | **even at the end of the world,you left it** — `they` | FTR `9+` (`9.9`) | **vivid/stasis** (*Ch. 6*) | Audio `-18.2 dB` wajib boost, `bg: "vivid_light"`, CC `9.9` |
| 25 | `wersovia.heptagramme.arcpkg` | `.arcpkg` | `heptagramme` | **Heptagramme** — `l'avenir proche ft. Fivda` | FTR `10` (`10.6`) | **vivid/stasis** (*Ch. 6*) | BG khusus (`vivid_light.png` -> `heptagramme.jpg`), **`track: "rei"`** |
| 26 | `wersoviaaltf4.thrinospygmalion.arcpkg` | `.arcpkg` | `thrinospygmalion` | **thrinos;pygmalion** — `baeddelite` | BYD `11.6` *(arcproj `11+`)* | **vivid/stasis** (*Final Ch.*) | **MERGE dengan #19**; strip Lua/SC, clamp BPM `>16M`, `tg_angle` × 10 |

---

## 2. Analisis Duplikat, Penggabungan Multi-Diff & Kolisi Eksisting

### A. Duplikat Arsip (`Arcaneura.META-morphose`)
- **`Arcaneura.META-morphose.arcpkg`** dan **`Arcaneura.META-morphose (1).arcpkg`** memiliki `base.ogg` (`267.57s`, SHA256 `5f0158a90cbc`), `base.jpg` (`1254×1254`), `kaguya1.jpg` (`2048×1536`), `4.sc.json`, dan metadata `.arcproj` yang identik.
- Perbedaan ada pada `4.aff`: arsip tanpa `(1)` mengandung `arc(-10000,1621,...)` (**timestamp negatif ilegal** yang langsung crash di `AffParser`), sedangkan versi **`(1)`** memperbaikinya menjadi dua arc yang dimulai di `t = 0` (`arc(0,1621,...)`).
- **Tindakan:** Import hanya **`Arcaneura.META-morphose (1).arcpkg`** dan abaikan `Arcaneura.META-morphose.arcpkg`.

### B. Penggabungan Multi-Difficulty (`thrinos;pygmalion` FTR + BYD)
- `[FTR10.6]thrinos;pygmalion.zip` (`2.aff`, `10.6`, `ash;rend`, `AudioOffset:325`, durasi `151.18s`, `mean=-7.8 dB`) dan `wersoviaaltf4.thrinospygmalion.arcpkg` (`3.aff`, `11.6`, `altf4++ // wersovia`, `AudioOffset:348`, durasi `151.22s`, `mean=-10.9 dB`) memakai master audio yang sama.
- Verifikasi envelope/cross-correlation PCM membuktikan audio BYD tertunda tepat **`+25 ms`** dibanding audio FTR — selisih ini cocok dengan perbedaan `AudioOffset` mereka (`348 - 325 = +23 ms`).
- **Rekomendasi:** Gabung ke 1 lagu (`thrinospygmalion`, 1 folder) dengan memakai `base.ogg` versi FTR (`-7.8 dB`, lebih jernih dan bertenaga) dan menyamakan `AudioOffset:325` pada `2.aff` maupun `3.aff`, plus pakai `base.jpg` `768×768` dari versi FTR (karena versi BYD hanya `300×300` PNG).

### C. Perbandingan 2 Versi `Altersist` (Bukan Duplikat)
- **`[ETR10.4]Altersist.zip` (`altersist`)**: durasi **`176.05s` (`2m 56s`)**, `138 BPM`, ETR `10.4` (`4.aff`, `514` + `267` AT), `bg: mirai_light`.
- **`[BYD10.7]Altersist (Album Ver.).zip` (`altersistfull`)**: durasi **`462.00s` (`7m 42s`)**, versi album penuh, BYD `10.7` (`3.aff`, `1024` + `682` AT + SC), custom `bg: altersist.jpg` (`1920×1440`).
- **Status Server:** `altersist` ada di APK vanilla (`v6.14`), namun **tidak ada** di `ArcaeaServerFork/database/songs/songlist` (server berisi `475` lagu custom/pilihan). Karena durasi dan aransemen audionya berbeda hampir 5 menit, keduanya aman diimport sebagai **2 entri terpisah** (`altersist` dan `altersistfull`).

### D. Kolisi ID & Slot Difficulty dengan Lagu Eksisting di Server
| ID / Judul | Data Server Saat Ini (`songlist` v1.9.6) | Data Batch 9 (`1chart9`) | Perbedaan Kunci |
|---|---|---|---|
| **`braveroad`** (*BRAVE：ROAD*) | `set: kurumi`, FTR `10+` (**`10.9`**) oleh `Kurumi087`, `audio=156.14s`, `offset=996`, `854` notes | `[FTR11.2]BR-E ROAD.zip`, FTR `11` (**`11.2`**) oleh `Ashrend`, `audio=157.48s`, `offset=0`, `985` notes, custom BG `braveroad` | **Sama ID (`braveroad`) & sama-sama FTR (`2.aff`)**, namun panjang audio & offset berbeda (`156.14s` vs `157.48s`). |
| **`ultimateforce`** (*Ultimate Force*) | `set: single`, FTR `11+` (**`11.8`**) oleh `Adr`, `audio=149.30s`, `offset=30`, `852` notes, custom BG `ultimateforce` | `[FTR11.6]Ultimate Force.zip`, FTR `11` (**`11.6`**) oleh `Rended-Ash`, `audio=149.35s`, `offset=0`, `796` notes, BG `chunithmnew_conflict` | **Sama ID (`ultimateforce`) & sama-sama FTR (`2.aff`)**, file `base.ogg` & jacket berbeda (`2.11 MB` vs `2.18 MB`). |
| **`spasmodic`** vs `spasmodichaocoremix` | `set: phigros`, **`Spasmodic (Haocore Mix)`** (`10.5` oleh `milkwaa`, `143.99s`) | `[FTR10.8]Spasmodic.zip`, **`Spasmodic`** original (`10.8` oleh `Ashrend`, `153.00s`, custom BG `spasmodic.png`) | **BUKAN duplikat** — lagu original vs remix. Aman ditambah sebagai `spasmodic` ke pack `phigros`. |

---

## 3. Audit Teknis Chart, `ratingPlus` & Metadata (`AGENTS.md`)

### A. Penyesuaian `ratingPlus`, `legacy11` & Constant (`Check 1` & `Check 7`)
Sesuai aturan `AGENTS.md`: `ratingPlus: true` berlaku pada desimal **`.7+`** untuk **Lv. 1–10 & Lv. 12+**, dan **`.8+`** khusus **Lv. 11**.

1. **`[BYD10.6]OΔYΣΣEIA - Sober Bear.zip`**: `songlist.json` menuliskan `"rating": 10, "ratingPlus": true`, padahal label arsip `[BYD10.6]`. Wajib dikoreksi menjadi **`10` (`ratingPlus: false`, `constant: 10.6`)**.
2. **`[BYD11.7]運命論.zip`**: `songlist.json` menuliskan `"rating": 11, "legacy11": true` untuk `11.7`. Wajib hapus `legacy11`, set **`11` (`ratingPlus: false`, `constant: 11.7`)**.
3. **`wersoviaaltf4.thrinospygmalion.arcpkg`**: `.arcproj` menuliskan `Beyond 11+` dengan `chartConstant: 11.6`. Wajib dikoreksi ke **`11` (`ratingPlus: false`, `constant: 11.6`)**.
4. **`[FTR11.6]BANGING STRIKE.zip`** & **`[BYD12.5]Lingering Souls.zip`**: Hapus field obsolet `"legacy11": true`, pakai `11` (`11.6`, `ratingPlus: false`) dan `12` (`12.5`, `ratingPlus: false`).
5. **Chart `evenattheend.zip`**: `songlist` tertulis `"rating": 9, "ratingPlus": true` tanpa `constant`. Perlu ditetapkan `constant` eksplisit (mis. `9.7` atau `9.8`) agar `ratingPlus` dan perhitungan PTT konsisten.
6. **Chart BYD / ETR-Only & Placeholder `[0, 1, 2].aff`**:
   - Seluruh lagu single-difficulty di batch ini rata-rata masih memakai `rating: -1` dan belum memiliki `0.aff`/`1.aff` (atau `2.aff` untuk BYD/ETR-only). Wajib lengkapi `[0, 1, 2]` dengan `rating: 0` dan dummy `.aff` standar (`(1000,1);`), termasuk mengganti `2.aff` milik `Fatum.SUPERNOVA.arcpkg` yang saat ini hanya berisi `timing(0,100.00,4.00);` tanpa note.
   - **Tidak boleh** memasukkan entry `ratingClass: 3` (Beyond) ke `database/songs/unlocks` (`Check 7`).

### B. Pelanggaran & Anomali `.aff` / Ekstensi ArcCreate (`Check 3, 4, 6`)
| Lagu & File | Anomali Terdeteksi | Penanganan Wajib Saat Import (`celest-audit --fix`) |
|---|---|---|
| **`thrinos;pygmalion` (`3.aff`)** | - **`30×` Extreme BPM hingga `174,079,300.00`** (`t=999996`, grup `noinput` `$zero.arccap` dengan dummy `arc(999997,999999,...)`)<br>- **`151×` 0ms Arc + ArcTap** (`zero_arc_at`)<br>- **`43×` `tg_eq`**, **`37×` `tg_comma`**, **`103×` atribut non-native** (`name="..."`, `noheightindicator`, `nohead`, `miss=max`)<br>- **`6×` `tg_angle`** (`angley=1.50`, `-1.50`, `2.50`, `-2.50`, `10.00`, `-10.00`)<br>- **`1194×` Non-native SC** (`groupalpha` `1118`, `fxhitlinear` `56`, `fxrepeat` `15`, `fxhit` `3`, `fxhitsidechain` `1`, `fxhitrise` `1`) + `3.sc.json` + `Scenecontrol/*.lua`<br>- `7×` `zero_bpm_gt0`, `117×` `arctap(t, width)` | - Clamp BPM ke `[-16000000.00, 16000000.00]`<br>- Perpanjang parent 0ms arc yang punya `arctap` menjadi `+1 ms`<br>- Strip atribut `timinggroup` non-native, ubah koma -> `_`, konversi **`angley` × 10** (`angley15`, `angley-15`, `angley25`, `angley-25`, `angley100`, `angley-100`)<br>- Strip seluruh SC non-native, `.sc.json`, & `.lua`<br>- Pertahankan `0.00` BPM (`t > 0`) & `arctap(t, width)` (dukungan Patch 44+) |
| **`Rei` (`3.aff`)** | - `1×` `noinput,noclip` (`tg_comma` + non-native)<br>- **`80×` Non-native SC** (`chroma` `37`, `glitch` `10`, `hudalpha` `9`, `star_create` `5`, `bgshow` `5`, `bgcreate` `3`, `changeinfo`/`jacket`/`rainbowdiff`/`vignette`/`groupalpha` `@2`, `setdiff` `1`) + `3.sc.json` + `7` file `.lua` + `6` sprite PNG<br>- `2×` `zero_bpm_gt0` | - Ubah `timinggroup(noinput,noclip)` -> `timinggroup(noinput)`<br>- Strip SC non-native, `.lua`, `.sc.json`, dan sprite PNG; pertahankan `hidegroup` (`8×`) & `0.00` BPM (`t > 0`) |
| **`Sakuyahime` *(sakutorei `3.aff`)* ** | - **`12.8`** (`Eternal 10?` -> ubah ke `BYD 12+` / `ETR 12+`)<br>- `1×` `noinput,noclip`, `4× camera`<br>- **`152×` Non-native SC** (`chroma` `101`, `glitch` `13`, `hudalpha` `9`, `star_create`/`bgshow` `@5`, `changeinfo`/`vignette` `@4`, `bgcreate`/`setdiff` `@3`, `rainbowdiff`/`groupalpha` `@2`, `jacket` `1`) + `3.sc.json` + `7` `.lua` + `6` PNG<br>- `11×` `zero_bpm_gt0` | - Strip non-native `noclip`, `.lua`, `.sc.json`, sprite PNG, & SC non-native; pertahankan `camera` (`4×`), `hidegroup` (`8×`), `enwidenlanes`/`enwidencamera` (`2×`/`2×`), & `0.00` BPM (`t > 0`) |
| **`Hyper Memories` (`4.aff`)** | - **`328×` 0ms Arc + ArcTap** (`zero_arc_at`)<br>- `1×` `name="Fake",noinput` (`tg_comma` + `tg_eq` + non-native)<br>- `18×` SC (`trackdisplay` `12`, `hidegroup` `5`, `enwidencamera` `1`) + `4.sc.json` | - Perpanjang `328×` parent arc 0ms menjadi `+1 ms`<br>- Ubah `timinggroup(name="Fake",noinput)` -> `timinggroup(noinput)`<br>- Hapus `4.sc.json`; pertahankan SC native (`trackdisplay` dll.) |
| **`Abyssal Duality` (`3.aff`)** | - `38×` `arc_11_args` (`smoothness`), `36×` `hidegroup` + `3.sc.json`, `0` error syntax | - Hapus `3.sc.json`; pertahankan `smoothness` & `hidegroup`; beri `constant` & cek slot BYD (`3.aff`) |
| **`Heptagramme` (`2.aff`)** | - **`42×` 0ms Arc + ArcTap** (`zero_arc_at`)<br>- **`36×` `groupalpha`** + `2.sc.json`<br>- `12×` `zero_bpm_gt0` (`t=2`), `skin: None` di `.arcproj` | - Perpanjang `zero_arc_at` menjadi `+1 ms`<br>- Strip `groupalpha` & `2.sc.json`; pertahankan `0.00` BPM di `t=2`; pastikan `side: 0` |
| **`Unraveling Stasis` (`2.aff`)** | - `5×` `zero_bpm_gt0`, `2.sc.json` *(27 SC di `.aff` adalah native `hidegroup`)* | - Hapus `2.sc.json`; pertahankan `0.00` BPM (`t > 0`) & `hidegroup` |
| **`META-morphose (1)` (`4.aff`)** | - `8×` `zero_bpm_gt0`, `174×` `arc_11_args` (`smoothness`), `4.sc.json` *(14 SC adalah native)* | - Hapus `4.sc.json`; pertahankan `0.00` BPM (`t > 0`) & `smoothness` |
| **`SUPERNOVA` (`3.aff` & `songlist`)** | - `songlist` cacat JSON (kurang pembuka `{ "songs": [` -> parse error `Extra data`)<br>- `2.aff` dummy tanpa note, `1×` `zero_bpm_gt0` | - Perbaiki wrapper JSON `songlist`<br>- Ganti `0.aff`/`1.aff`/`2.aff` dengan dummy standar `(1000,1);` |
| **`even at the end...` (`songlist`)** | - `songlist` cacat JSON (kurang pembuka `{ "songs": [` -> parse error `Extra data`) | - Perbaiki wrapper JSON; verifikasi parameter `hidegroup` (native) |
| **`Name of oath` (`2.aff`)** & **`Triad of Dryad`** | - `Name of oath`: `2×` `zero_bpm_gt0`, folder `Arcade/` + `ChartFault.txt`<br>- `Triad of Dryad`: folder `Arcade/` | - Hapus seluruh subfolder `Arcade/` & file backup autosave |
| **`Chariot`, `Altersist (Album Ver.)`, `Lingering Souls`** | - Menyediakan varian `*_no_smoothness.aff`; khusus `Lingering Souls` ada `3.aff` (half-BPM `100.00`) vs `原速.aff` (original BPM `200.00`) | - Client **v1.9.3+ (Patch 44+)** sudah mendukung argumen ke-11 `smoothness` secara native → disarankan pakai `.aff` utama dengan `smoothness` penuh. Perlu keputusan untuk `100` vs `200` BPM pada `Lingering Souls`. |

---

## 4. Audit Aset Gambar (Jacket & Background) & Konfirmasi Rating `>= 11.0`

### A. Jacket Perlu Perbaikan (`PNG RGBA` -> `RGB JPG` & Resolusi `< 512px`)
Semua lagu wajib menghasilkan 4 ukuran JPEG RGB (`base.jpg` 512, `base_256.jpg` 256, `1080_base.jpg` 768, `1080_base_256.jpg` 384):
- **Wajib Swin2SR + Konversi PNG RGBA -> RGB JPG:**
  - `Rei`: `Rei.png` (`360×360` PNG RGBA)
  - `Sakuyahime` (`sakutorei`): `Sakuyahime_jacket.png` (`360×360` PNG RGBA)
  - `Heptagramme`: `base.jpg` (`400×400` PNG RGBA, `7 KB`)
  - `even at the end...`: `base.jpg` (`452×452` PNG RGBA)
- **Wajib Swin2SR Upscale (JPG kecil):**
  - `Name of oath`: `300×300` JPEG RGB (`60 KB`)
  - *(Jika `thrinos;pygmalion` tidak di-merge, versi BYD hanya `300×300` PNG RGB — namun sudah disepakati merge memakai `768×768` JPEG RGB dari versi FTR)*
- **Wajib Konversi Format / Crop / Generate 4 Ukuran Standar:**
  - `Gimme x Gimme`: `740×740` **PNG RGBA** berekstensi `.jpg`
  - `Ultimate Force`: `897×894` non-square JPEG RGB -> crop simetris ke 1:1 lalu generate 4 ukuran
  - `SUPERNOVA` (`3000×3000`) & `Hyper Memories` (`3224×3220` non-square 4px) -> crop simetris & downscale Lanczos ke 768/512/384/256
  - `Unraveling Stasis` (`600×600`), `BR-E ROAD` (`720×720`), `Abyssal Duality` (`800×800`), `ΟΔΥΣΣΕΙΑ` (`512×512`, atau pakai `1080_base.jpg` vanilla dari APK).

### B. Custom Background Perlu Konversi/Upscale (`>= 1080p` JPEG RGB)
- **`chariot.webp` (`Chariot`)**: `1251×938` WEBP RGB → konversi ke RGB JPG & upscale ke `chariot.jpg` (`1920×1440`).
- **`hyper_memories.fixed1.arcpkg` (`hybg.jpg`)**: `1010×752` JPEG RGB (`33 KB` < 100 KB) → **upscale ke `1920×1440`** (`hypermemories.jpg`, >= 100 KB).
- **`Fatum.SUPERNOVA.arcpkg` (`supernova.jpg`)**: `2560×1920` **PNG RGBA** palsu → konversi ke RGB JPG (`1920×1440` / `2560×1920`).
- **`[FTR10.8]Spasmodic.zip` (`spasmodic.png`)**: `1920×1440` PNG RGBA → konversi ke RGB JPG (`spasmodic.jpg`).
- **`[FTR11.2]BR-E ROAD.zip` (`braveroad.jpg`)**: `1920×1440` **PNG RGBA** palsu → konversi ke RGB JPG.
- **`Tefrish.UnravelingStasis.arcpkg` (`vividstasis_yuri.jpg`)**: `1280×960` (720p) JPEG RGB → **upscale ke `1920×1440`** (eksklusif `unravelingstasis`).
- **`wersovia.heptagramme.arcpkg` (`vivid_light.png`)**: `1280×960` (720p) PNG RGB → **upscale ke `1920×1440` & konversi ke RGB JPG** (simpan unik sebagai `heptagramme.jpg`).
- **`wersoviaaltf4.thrinospygmalion.arcpkg` (`vivid_thrinos.png`)**: `1280×960` (720p) PNG RGB → **upscale ke `1920×1440` & konversi ke RGB JPG**.
- **`Arcanahikari.Rei.arcpkg` & `sakutorei` (`YES.png`)**: `1920×1440` PNG RGBA → jika dipakai custom BG (bukan vanilla `macula_conflict_a`), konversi ke RGB JPG.
- **Sudah Valid (`1920×1440+` RGB JPG):** `abyssalduality.jpg` (`1920×1440`), `kaguya1.jpg` (`2048×1536`, `META-morphose`), `vividstasis_light.jpg` (`1920×1440`, `evenattheend` -> akan dinamai `vivid_light.jpg`), `altersist.jpg` (`1920×1440`, `Altersist`).

### C. Konfirmasi Wajib Chart `Rating >= 11.0` (`AGENTS.md` Check 2)
Sesuai aturan repo, seluruh chart `>= 11.0` wajib mendapat persetujuan BG & `side`:

| Lagu | CC & Diff | BG & Track Pilihan | Side | Status Konfirmasi |
|---|---|---|---|---|
| **SUPERNOVA** | `12.3` BYD | Custom `supernova.jpg` | `1` (Conflict) | Custom BG eksklusif |
| **Lingering Souls** | `12.5` BYD | **`eclipse_conflict`** (`inv: eclipse_light`) | `1` (Conflict) | **Terkonfirmasi user** (`legacy11` dihapus) |
| **Rei** (*靈*) | `11.9` BYD | `macula_conflict_a` *(atau `YES.png`)*, **`track: "dark"`** | `1` (Conflict) | Konfirmasi `macula_conflict_a` |
| **Sakuyahime** *(sakutorei)* | `12.8` ETR/BYD | Custom `YES.png` (`sakutorei.jpg`) / `macula_conflict_a`?, `track: "pentiment"` | `1` (Conflict) | **BARU — perlu konfirmasi BG & slot** |
| **Hyper Memories** | `11` (`4.aff`) | Custom `hybg.jpg` (upscale `1920×1440`), `track: "arcana"` | `1` (Conflict) | **BARU — custom BG tersedia, konfirmasi CC** |
| **Abyssal Duality** | `11` (`3.aff`) | Custom `abyssalduality.jpg` (`1920×1440`), `track: "pentiment"` | `1` (Conflict) | **BARU — custom BG siap pakai, konfirmasi CC** |
| **運命論** (*Unmeiron*) | `11.7` BYD | **`konzetsu-a`** (`inv: konzetsu-b`), **`track: "dark_vs"`** | **`4`** | **Terkonfirmasi user** |
| **Unraveling Stasis** | `11.6` FTR | Custom **`vividstasis_yuri`** (upscale 1080p) | `1` (Conflict) | **Terkonfirmasi user** |
| **thrinos;pygmalion** | `10.6` + `11.6` | Custom **`vivid_thrinos`**, **`track: "arcana"`** | `1` (Conflict) | **Terkonfirmasi user** |
| **BANGING STRIKE** | `11.6` FTR | **`single2_conflict`** (`inv: single2_light`) | `1` (Conflict) | **Terkonfirmasi user** |
| **BR-E ROAD** *(ETR)* | `11.2` ETR | Diff BG `braveroad.jpg` (atau `nijuusei2_light/conflict`) | `0` (Light) | ETR `4.aff` di `kurumi/braveroad` |
| **Ultimate Force** | `11.6` FTR + `11.8` ETR | Eksisting `ultimateforce.jpg` (atau `chunithmnew_conflict` per-diff) | `1` (Conflict) | `Rended-Ash` `2.aff` + `Adr` `4.aff` |

---

## 5. Audit Audio: Loudness & Rekomendasi Jendela `preview.ogg` (`15–25s`)

**Penting:** Tidak ada satu pun dari **27 arsip** yang menyertakan `preview.ogg`. Semua wajib di-slice ke `preview.ogg` durasi **15–25 detik** serta disinkronkan field `audioPreview` dan `audioPreviewEnd`-nya di `songlist`.

| Lagu | Durasi | `mean_db` | `audioPreview` Arsip | Status Preview & Rekomendasi `preview.ogg` |
|---|---:|---:|---|---|
| **even at the end...** | `181.46s` | **`-18.2 dB`** *(Sangat Pelan!)* | `118400–145600` (`27.2s`) | **Boost audio (`+7–8 dB` + limiter)**; potong ke **`118400–138400` (`20.0s`)** |
| **Sakuyahime** *(sakutorei)* | `338.88s` | **`-17.8 dB`** *(Sangat Pelan!)* | `None–130000` *(Kosong!)* | **Boost audio (`+7–8 dB` + limiter)**; RMS puncak **`284000–304000` (`20.0s`, `-15.9 dB`)** |
| **Rei** | `192.05s` | **`-12.9 dB`** *(Pelan untuk `11.9`)* | `None–150000` *(Kosong!)* | **Boost audio (`+3–4 dB`)**; RMS puncak **`135000–155000` (`20.0s`, `-11.7 dB`)** |
| **Hydra** | `149.98s` | **`-12.4 dB`** | `94520–120020` (`25.5s`) | Pertimbangkan boost ringan; potong 500ms ke **`94520–114520` (`20.0s`)** atau `119520` (`25.0s`) |
| **Gimme x Gimme** | `134.92s` | `-12.0 dB` | `43428–63428` (`20.0s`) | Rekomendasi sedikit boost; rentang `43428–63428` **sudah valid (`20.0s`)** |
| **Unraveling Stasis** | `168.02s` | `-11.5 dB` *(Lv. 11.6)* | `90402–107083` (`16.7s`) | Rentang **valid (`16.7s`)**; pertimbangkan boost ringan (`+2 dB`) |
| **運命論** | `168.52s` | `-11.3 dB` *(Lv. 11.7)* | `116581–150286` (`33.7s`) | Pertimbangkan boost ringan; potong ke **`118000–138000` (`20.0s`, RMS `-10.3 dB`)** |
| **SUPERNOVA** | `213.04s` | `-11.2 dB` *(Lv. 12.3)* | `146785–163928` (`17.1s`) | Rentang **valid (`17.1s`)**; pertimbangkan boost ringan (`+2 dB`) |
| **Altersist (Album Ver.)** | `462.00s` | `-11.1 dB` | `236751–302838` (`66.1s`) | Terlalu panjang; potong ke **`236751–256751` (`20.0s`)** atau puncak RMS `389000–409000` |
| **Name of oath** | `160.17s` | `-10.9 dB` | `102068–132068` (`30.0s`) | Potong ke **`102068–122068` (`20.0s`)** |
| **thrinos;pygmalion** | `151.18s` (FTR) | `-7.8 dB` (FTR) / `-10.9 dB` (BYD) | FTR `30.8s` / BYD `18.0s` | Pakai audio FTR (`-7.8 dB`); potong preview **`41468–59468` (`18.0s`)** sesuai rentang BYD |
| **Spasmodic** | `153.00s` | `-10.7 dB` | `73200–103200` (`30.0s`) | Potong ke **`73200–93200` (`20.0s`)** (RMS puncak `54000–74000`, `-9.4 dB`) |
| **Altersist** | `176.05s` | `-10.4 dB` | `104451–134233` (`29.8s`) | Potong ke **`104451–124451` (`20.0s`)** (RMS puncak `120000–140000`, `-9.7 dB`) |
| **BR-E ROAD** *(ETR)* | `157.48s` | `-10.2 dB` | `64319–88194` (`23.9s`) | Rentang **valid (`23.9s`)** sebagai `4_preview.ogg` |
| **BANGING STRIKE** | `147.05s` | `-10.0 dB` | `100618–116901` (`16.3s`) | Rentang **valid (`16.3s`)** |
| **META-morphose (1)** | `267.57s` | `-9.8 dB` | `78243–105405` (`27.2s`) | Potong ke **`78243–98243` (`20.0s`)** (RMS puncak `30000–50000`, `-9.5 dB`) |
| **Lingering Souls** | `305.75s` | `-9.7 dB` | `141950–199400` (`57.5s`) | Terlalu panjang; potong ke **`141950–161950` (`20.0s`)** atau puncak RMS `201000–221000` |
| **Hyper Memories** | `277.01s` | `-9.3 dB` | `214798–239863` (`25.07s`) | Potong 65ms ke **`214798–239798` (`25.0s`)** atau `214798–234798` (`20.0s`) |
| **テトリス** | `142.59s` | `-9.3 dB` | `62103–90338` (`28.2s`) | Potong ke **`62103–82103` (`20.0s`)** |
| **ΟΔΥΣΣΕΙΑ** | `144.64s` | `-9.1 dB` | `55172–85172` (`30.0s`) | Potong ke **`55172–75172` (`20.0s`)** |
| **Chariot** | `145.38s` | `-8.7 dB` | `111278–135536` (`24.3s`) | Rentang **valid (`24.3s`)** |
| **Heptagramme** | `171.44s` | `-8.2 dB` | `28475–66441` (`38.0s`) | Terlalu panjang; potong ke **`46441–66441` (`20.0s`)** atau puncak RMS `150000–170000` |
| **Triad of Dryad** | `139.76s` | `-8.2 dB` | `91575–114339` (`22.8s`) | Rentang **valid (`22.8s`)** |
| **Abyssal Duality** | `232.59s` | `-7.9 dB` | `None–5000` *(Kosong!)* | RMS puncak **`35000–55000` (`20.0s`, `-7.1 dB`)** |
| **Ultimate Force** | `149.35s` | `-7.2 dB` | `54293–73849` (`19.6s`) | Rentang **valid (`19.6s`)** (selaraskan offset `+47 ms` ke eksisting `base.ogg`) |

---

## 6. Keputusan Final User & Poin Konfirmasi Terakhir (`v1.10`)

### A. Keputusan yang Sudah Ditetapkan User (Tervalidasi Teknis)
1. **`Rei` (*靈*, `11.9` BYD):** `track: "dark"`, `bg: "macula_conflict_a"` (+ opsional `bg_inverse: "macula_light_a"` — nama resmi *Undying Macula* di APK).
2. **`Unmeiron` (*運命論*, `11.7` BYD):** `side: 4`, **`track: "dark_vs"`**, **`bg: "konzetsu-a"`**, **`bg_inverse: "konzetsu-b"`**.
3. **`Lingering Souls` (`12.5` BYD):** **`bg: "eclipse_conflict"`**, **`bg_inverse: "eclipse_light"`** (`legacy11` dihapus -> `12` `ratingPlus: false`). BPM asli musik = **`100 BPM`** (*AD:PIANO X* & dominan gap 16th `150 ms` / 32nd `75 ms`); `3.aff` memakai `100.00` BPM sedangkan `原速.aff` memakai double-time `200.00` BPM (pilih mana saat import).
4. **`Chariot` (`10.0` BYD):** `3.aff` (dengan `smoothness`), BG `/home/luhung/Documents/Chart/1chart9/chariot.webp` -> `chariot.jpg` (`1920×1440`), **`track: "tempestissimo"`**.
5. **`thrinos;pygmalion` (`FTR 10.6` + `BYD 11.6`):** Merge jadi `2.aff` + `3.aff`, custom BG **`vivid_thrinos`**, **`track: "arcana"`**.
6. **`Heptagramme` (`10.6` FTR):** BG khusus **`heptagramme.jpg`** (`vivid_light.png` -> upscale `1920×1440`), **`track: "rei"`**.
7. **`Unraveling Stasis` (`11.6` FTR):** Tetap pakai BG eksklusif **`vividstasis_yuri`** (upscale `1920×1440`).
8. **`evenattheend` (`9.9` FTR):** `constant: 9.9`, BG **`vivid_light`** (`vividstasis_light.jpg`, boost audio `-18.2 dB`).
9. **`BANGING STRIKE` (`11.6` FTR):** **`bg: "single2_conflict"`**, **`bg_inverse: "single2_light"`**.
10. **`braveroad` (`kurumi/braveroad`):** `Ashrend` (`11.2`) ditambah sebagai **ETR (`4.aff`)** dengan `audioOverride: true` (`4.ogg`, `4_preview.ogg`).
11. **`ultimateforce` (`Ultimate Force`):** Durasi sama (`149.30s` vs `149.35s`) -> eksisting `Adr` (`11.8`) pindah ke **ETR (`4.aff`)** dan `Rended-Ash` (`11.6`) isi **FTR (`2.aff`)**.
12. **`spasmodic` (Blend di `phigros`):** ID `spasmodic` (skor VPS `spasmodichaocoremix` = 0); `Ashrend` (`10.8`) di **FTR (`2.aff`)** + *Haocore Mix* (`milkwaa`, `10.5`) pindah ke **BYD (`3.aff`)** dengan `title_localized`, `audioOverride: true`, `jacketOverride: true`.
13. **`altersist` (Blend):** `176.05s` (`10.4`) di **FTR (`2.aff`)** dengan `title_localized: "Altersist (Cut Ver.)"`, dan `462.00s` (`10.7`) di **BYD (`3.aff`)** sebagai `"Altersist (Album Ver.)"` + `audioOverride: true`.

### B. Audit Pemetaan Pack *Milthm* & *Rizline* di `songlist` (`475` Lagu)
- **Milthm:** **Tidak ada** lagu original Milthm di `songlist` saat ini. Dengan 3 chart di Batch 9 (**`Rei`**, **`Sakuyahime` (*sakutorei*)**, dan **`Hyper Memories`**), sudah cukup jika ingin dibuatkan pack baru **`milthm`** (atau tetap di `single`).
- **Rizline (`selain BRAVE:ROAD`):**
  - **Lagu yang tampil di Rizline & sudah ada di `songlist` kita:**
    1. `braveroad` (*BRAVE：ROAD* — `kurumi`, **Rizline original Disc 1**).
    2. `nooneyesman` (*NO ONE YES MAN* — MYUKKE., di pack **`phigros`**; debut original *Phigros*, masuk Rizline Disc 1).
    3. `concvssion` (*Concvssion* — Halv, di pack **`phigros`**; masuk Rizline via *Track Series SP - Phigros*).
    4. `tvsshark` (*T+ VS SHARK* — `t+pazolite`, di **`single`**; dari *HARDCORE TANO\*C*, masuk Rizline *Track Series 10*).
    5. `thelastpage` (*The Last Page* — ARForest, di **`single`**; dari *BOFXV*, masuk event Rizline *"Support Us!"* & Phigros/Orzmic/KALPA).
    6. `nighttheater` (*Night Theater* — わかどり, di **`single`**; dari *BOFXVI*, masuk Rizline *EX - Single* & Phigros/Rotaeno/maimai/dll.).
  - Jadi sebagai **Rizline original**, memang **hanya `BRAVE：ROAD`** yang ada di `songlist` saat ini.

### C. Sisa Konfirmasi Sebelum Eksekusi Import `v1.10`
1. **`Lingering Souls` BPM Chart:** Karena BPM asli lagunya `100`, mau pakai **`3.aff` (`100.00` asli)** atau **`原速.aff` (`200.00` double-time)**?
2. **Pack Baru `milthm` & `rizline`:**
   - **`milthm`** (`select_milthm.png`): `Rei`, `Sakuyahime` (`BYD 12+`, `12.8`), dan `Hyper Memories` (`ETR 11.3`, `bg: "byd_2_conflict"`, `bg_inverse: "byd_light"`). *(Konfirmasi BG `Sakuyahime`: pakai custom `YES.png` atau `macula_conflict_a`?)*
   - **`rizline`** (`select_rizline.png`): pindahkan `braveroad` (*BRAVE：ROAD* + ETR `11.2`) dari `kurumi` ke `rizline`? *(Dan apakah `nooneyesman` tetap di `phigros` atau pindah ke `rizline`?)*

---

## 7. Tambahan Batch 9 & Pemetaan `v1.10.1`

### A. Chart Baru & Merge Official
1. **`Observatory` — かめりあ (`observatory`, Pack `paraboot`, `© TunerGames`):**
   - Menggabungkan 3 chart (`Pooh5821` PST `6.5`, `Knight` FTR `11.8`, `Pluncks` ETR `10.7`) dengan audio, jacket, dan BG kustom milik Knight (`observatory.jpg`), `track: "dark_vs"` (FTR) / `"dark_nijuusei"` (ETR).
2. **`Never Say Goodbye` — 黒魔 (`neversaygoodbye`, Pack `rizline`, `© Pigeon Games`):**
   - Ditempatkan di **`rizline`** (final boss Disc 2 Rizline menurut Wiki), FTR `10+` (`10.7`, `2.aff`), BG `nijuusei2_light` + `bg_inverse: nijuusei2_conflict`.
3. **`ΟΔΥΣΣΕΙΑ` — Sober Bear (`odysseia`, `© lowiro`):**
   - Chart resmi PST `4.0`, PRS `7.8+`, dan FTR `9.5` di-merge verbatim dari `1official/lowiro.odysseia.arcpkg` tanpa menyentuh chart fanmade `3.aff` (`BYD 10.6`), dan didaftarkan di `OFFICIAL_CHART_DIFFS` / `OFFICIAL_RAW_SONGS` untuk diff `{0, 1, 2}`.

### B. Pack `Paradigm: Reboot` (`paraboot`), Pemindahan Pack & Audit *TAKUMI³*
- **`paraboot` (`6` lagu):** `observatory` + 5 original dari `single` (`cyberneticvampire`, `trainnozero1`, `abyssgazer`, `rebellion`, `noxsilva`).
- **`phigros` & `rotaeno`:** `pixelrebelz` → `phigros`, `aclock` → `rotaeno` (`chronologika` sudah berada di `phigros`).
- **Temuan *TAKUMI³* (`© THIQXIS`):** `omg` (*OMG*) dan `rendajoceky` (*RENDA JOCEKY*) terverifikasi original *TAKUMI³* di `songlist` (`single`).
- **`source_copyright`:** Ditambahkan/dirapikan pada pack & single berlisensi game (`paraboot`, `phigros`, `rizline`, `milthm`, `vstasis`, `orzmic`, `rotaeno`, `sdvx`, `taiko`, `kalpa`, `lowiro`, serta single game terverifikasi).
3. **Metadata Kecil:** Setuju koreksi artist *Gimme x Gimme* ke **`八王子P × Giga feat. 初音ミク & 鏡音リン`**, bersihkan embel meme *Spasmodic*, dan pakai ID **`spasmodic`**?
