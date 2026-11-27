# Arcelest Client & Server Release Versioning Policy

This document defines the mandatory app versioning policy and release history for the **Arcelest (`moe.cel.arc`)** patched Android client and server assets.

---

## Mandatory Version Bump Rule

**Every change to the following areas MUST bump the Arcelest app release version (`arcelest_<MAJOR.MINOR.PATCH>_release.apk`):**

1. **Songs / Charts (`ArcaeaServerFork/database/songs/<song_id>/`)**:
   - Adding, removing, or modifying `.aff` charts, audio (`base.ogg`, `preview.ogg`, custom `.wav`), jackets, or song backgrounds.
2. **Metadata (`ArcaeaServerFork/database/songs/`)**:
   - Editing `songlist`, `unlocks`, or `packlist` (including BPM, `bpm_base`, ratings/constants, chart designers, `version`, `side`, or `date` fields — remember the APK bundles `assets/songs/songlist` and `assets/songs/unlocks` directly inside the client).
3. **Native Libraries & Patcher (`libcocos2dcpp.so` / `patch_arcaea.py`)**:
   - Any modification to ARM64 binary hooks, code caves, package/manifest patching, `resources.arsc`, icons, or `patch_arcaea.py`.

### Version Numbering Standard (`MAJOR.MINOR.PATCH`)
- **`PATCH` (`1.5.3` → `1.5.4`)**: Chart fixes/experiments, BPM/rating/metadata corrections, audio/jacket refinements, or targeted bugfixes.
- **`MINOR` (`1.5.x` → `1.6.0`)**: New song import batches, new packs/partners, or major native `libcocos2dcpp.so` feature hooks.
- **`MAJOR` (`1.x.x` → `2.0.0`)**: Base Arcaea APK version upgrade (e.g., `7.1.0c` → newer client) or breaking architectural changes.

### Mandatory Release Checklist
Before distributing or installing a new build:
1. Run `celest-audit --fix` (all 8 verification points must report `[PASSED]`).
2. Sync server file cache if songs/charts changed: `from core.download import SongFileCache; SongFileCache.sync_all()`.
3. Bump `DEFAULT_OUTPUT_APK` in `ArcaeaServerFork/tools/patch_arcaea.py` to `arcelest_<NEW_VERSION>_release.apk`.
4. Update the active release target in `AGENTS.md`, `ArcaeaServerFork/AGENTS.md`, `CLAUDE.md`, and this `RELEASE_CHANGELOG.md`.
5. Rebuild the APK:
   ```bash
   cd /home/luhung/Documents/project/Celestl
   /home/luhung/.venvs/arcaea-server/bin/python ArcaeaServerFork/tools/patch_arcaea.py
   ```
6. Verify the generated APK manifest (`moe.cel.arc`) and bundled `assets/songs/songlist`, then install (`celest-apk-update` or `adb install -r --no-incremental arcelest_<NEW_VERSION>_release.apk`).

---

## Release History

### `v1.8.5` — 2026-11-27
- **Official Arcaea Wiki Chart Constant Alignment (`halcyon`, `vector`, `trrricksters`, `dualdoom`, `aegleseeker`)**:
  - Synchronized decimal chart constants, `rating` / `ratingPlus` flags, `unlocks` fragment credits, and SQLite `chart` table (`×10`) with official Arcaea Wiki / vanilla `7.1.0c` values across all unmodified official difficulties while preserving custom fanmade difficulty additions:
    - `halcyon`: PST `5.0` → **`5.5`**, PRS `8.0` → **`8.2`**, FTR `10.0` → **`10.5`** (BYD `11.4` custom preserved).
    - `vector`: FTR `9.0` → **`9.4`** (PST `3.0`, PRS `7.0`, BYD `10.3` custom preserved).
    - `trrricksters`: PST `4.0` → **`4.5`**, PRS `7.0` → **`7.5`**, FTR `10.0` → **`10.1`** (ETR `10.7` `10+` custom preserved).
    - `dualdoom`: PST `3.0` → **`3.5`**, PRS `6.0` → **`6.5`**, FTR `10.3` (`10`) → **`8.9` (`8+`)** (`ratingPlus: true`; ETR `10.3` & BYD `11.4` custom preserved).
    - `aegleseeker`: PST `5.0` → **`5.5`** (PRS `9.1`, FTR `11.2`, BYD `11.4` custom preserved).
  - Synced updated `songlist`, `unlocks`, `chart` constants, `SongFileCache`, and recalculated player ratings/PTT on both local and live VPS databases.

### `v1.8.4` — 2026-11-27
- **No-Sharpen HD Jacket Overhaul, AI Super-Resolution (`swin2SR`) & Client Asset Restoration (`34` Songs)**:
  - Fixed `athaza` crop framing (`left=363`) so the full `"ATHAZA"` / `"LeaF"` title and character art fit cleanly without clipping the trailing `"A"`.
  - Converted and regenerated pure `RGB JPEG` variants (`LANCZOS` without `UnsharpMask`) for `malkuth`, `hainuwele`, `surtrswish`, and all `11` user-replaced masters (`sage`, `folern`, `luminescence`, `maholova`, `omg`, `weleavetheworldtogether`, `amenohoakarinomikoto`, `adam`, `scatteredrose`, `neo`, `monitoring`), applying `swin2SR-realworld-sr-x4` on `< 740px` sources and soft square padding on `omg`.
  - Re-rendered `13` target jackets (`ultimateforce` native `1080×1080`, `magicalpanicadventure` native `1000×1000`, and `swin2SR` 4× → `LANCZOS` downscale for `makear`, `anu`, `stardustray`, `squadphvntom`, `apocalypserebellion`, `crackpotevangelist`, `angelsladder`, `angelikvice`, `ravenemperor`, `hibiki`, `kagami`) for dense, halo-free pixels.
  - Restored original vanilla client `1080_base.jpg` / `1080_base_256.jpg` directly from `arcaea_7.1.0c.apk` (`assets/songs/dl_<id>/`) for `halcyon`, `vector`, `tsukinimurakumo`, `jump`, `dualdoom`, and `trrricksters` (PST/PRS/FTR).
- **VPS Production Sync, Nginx Reverse Proxy & `web_nuxt` Profile Editing**:
  - Deployed Nginx SSL + HTTP/2 + Keep-Alive + `X-Accel-Redirect` sidecar (`celest-arcaea-nginx`) on VPS port `8765`, synced full `v1.8.3`–`v1.8.4` song assets (`407` songs / `408` charts) & store catalog tables without touching player accounts/scores.
  - Added Admin `Edit Profile` modal & `/api/admin/server/players/update-profile` in `web_nuxt` to edit `user.name` and mock account (`@celest.local`) `rating_ptt`.

### `v1.8.3` — 2026-11-27
- **Difficulty, Rating & Localization Fixes (`dame`, `avantgarde`, `nocturneop9no2`, `snowmagic`, `halcyon`)**:
  - Normalized `dame` (`"ダメッッッッッ！！！！！ feat. 初音ミク"`) from broken NFD (`タ + \u3099`) to precomposed NFC across `songlist` (`title_localized` + `search_title`) and SQLite `chart.name` so `L2` bitmap fonts render `"メ"` cleanly instead of truncating on combining dakuten.
  - Migrated `avantgarde` chart (`2.aff`) to Beyond (`3.aff`) (`rating: 10`, `ratingPlus: true`, `constant: 10.8`), added minimal dummy `2.aff`, synced `unlocks` (`ratingClass: 2` credit `1`, no `ratingClass: 3`), and updated SQLite `chart` (`rating_ftr: -10, rating_byn: 108`).
  - Adjusted `nocturneop9no2` FTR (`ratingClass: 2`) to `4+` (`constant: 4.9`, `rating: 4`, `ratingPlus: true`), synced `unlocks` (`49`), and SQLite `chart` / `purchase` (`49`).
  - Downgraded `snowmagic` FTR constant from `9.8` (`9+`) to **`9.5` (`9`)**, syncing `unlocks` (`95`) and SQLite `chart` / `purchase` (`95`).
  - Restored `halcyon` vanilla Arcaea base jackets (`0`, `1`, `2`), removed the `rc=3` `bg: "yugamu"` override so both base and Beyond (`Halcyon (MRM REMIX)`) use `bg: "rei"` / `bg_inverse: "yugamu"`, and upgraded BYD `3.jpg` variants cleanly from iTunes `1400×1400`.
- **11-Track Clarity & Loudness Audio Remaster**:
  - Remastered `base.ogg` and re-sliced `preview.ogg` with balanced EQ clarity and anti-clipping `alimiter=level=disabled`:
    - Normal tier (`~-8.1 to -9.6 dB`): `folern`, `failnaught`, `chuten`, `deadlocked`, `electrodynamix`, `squadphvntom`.
    - Boss tier (`~-8.5 to -9.9 dB`): `bayonex`, `destruction321`, `eligos`, `astaroth`, `malkuth`.
- **42-Song Clean HD Jacket Overhaul & Anti-Halo Re-Render**:
  - Upgraded Group 1 (`11` songs: `distortedheavens`, `alfheim`, `monitoring`, `sigmachuni`, `xeno`, `reblossia`, `chuten`, `kaleidosc0pe`, `kakuriyo`, `theendlessfortraveler`, `jannedaruku`) from verified `1024–2048px` masters.
  - Replaced Group 3 confirmed cross-game covers (`quaoar` Rotaeno, `athaza`/`eltaw`/`tsukiyomininaru`/`dontneveraround` Phigros, `eligos` Orzmic `1920×1080`) and cleanly re-rendered Group 2 (`7` local masters) + `zenithalize`/`astaroth`.
  - Upgraded Group 4 (`16` songs) from authentic lossless masters (`lowiro.trrricksters.arcpkg` `768×768`, `sdvx.in` `608×608` lossless PNGs for `failnaught`/`guinevere`/`bayonex`, `sdvx.in/chunithm` `300–400px` lossless PNGs for `swiftswing`/`makear`/`squadphvntom`/`malkuth`/`anu`/`hainuwele`/`qliphothgear`, `647×647` clean YouTube crop for `crackpotevangelist`) with gentle zero-halo Lanczos scaling, eliminating prior over-sharpening artifacts.

### `v1.8.2` — 2026-11-27
- **Difficulty Tier Migrations (`midvinter` & `parvorbital`)**:
  - Migrated `midvinter` (`4.aff`, `9.7` `9+` by `Adro`) from Eternal (`4`) to Future (`2.aff`) while preserving Beyond (`3.aff`, `12.8`).
  - Migrated `parvorbital` (`4.aff`, `10.7` `10+` by `Foahh`) from Eternal (`4`) to Future (`2.aff`) while preserving Beyond (`3.aff`, `11.5` by `MitakeCocoa`).
  - Updated `songlist`, `unlocks` (`ratingClass: 2` credits `97` / `107`), `arcaea_database.db` (`chart`), and `execute_import_batch7.py`.
- **`eligos` Audio Clarity & Loudness Remaster**:
  - Re-mastered `eligos/base.ogg` from original `lam.eligos.arcpkg` with subtle mud trim (`150 Hz` `-1.5 dB`), presence clarity boost (`2.2 kHz` `+1.8 dB`, `5.5 kHz` high-shelf `+3.0 dB`), `+3.5 dB` gain, and anti-clipping limiter (`0.93`), raising overall loudness from `-12.1 dB` (`-9.0 LUFS`) → **`-10.0 dB` (`-6.6 LUFS`)**, and re-sliced `eligos/preview.ogg`.
- **`reblossia` & `konzetsu` Metadata Updates**:
  - Updated `reblossia` to **`side: 1`** (Conflict) and **`track: "dark_vs"`**.
  - Moved `konzetsu` (*Divine Oblivion*) pack `"section"` from `"variety"` to **`"mainstory"`** in `packlist` and `patch_arcaea.py`.
- **`outerheaven` Per-Difficulty `jacketOverride` (`0.jpg`, `1.jpg`, `2.jpg`)**:
  - Generated 4-resolution RGB JPEGs (`*.jpg`, `*_256.jpg`, `1080_*.jpg`, `1080_*_256.jpg`) for `0` (`OUTERHEAVEN_ADV.jpg`), `1` (`OUTERHEAVEN_EXH.jpg`), and `2` / `base` (`base.jpg`), enabled `"jacketOverride": true` across difficulties `0, 1, 2`, and expanded `patch_arcaea.py` `allowed_jackets` to bundle `0*/1*/2*.jpg` into `dl_outerheaven/`.

### `v1.8.1` — 2026-11-27
- **`synthesis_ext` (`Synthesis.`) Expansion to FTR + BYD (`audioOverride`) & Exclusive Blender Background**:
  - Restored `2.aff` as **FTR `10` (`10.5`, `S2erp5ent`)** paired with **`basecut.ogg`** (`164.02s`, boosted/limited cleanly) and `preview.ogg` (`49333..60000 ms`).
  - Migrated `5.aff` (`11.0`, `<color=#DDDDFF>S2erp5ent`) from ETR `4.aff` to **BYD `3.aff`** with native **`audioOverride: true`**, full-length **`3.ogg`** (`236.02s`, boosted/limited cleanly), and `3_preview.ogg` (`174667..185333 ms`), removing `4.aff`.
  - Converted `arccreate-blender_rei_conflict.png` (`2290×1720`) to `1920×1440` RGB JPEG **`synthesis_ext.jpg`** with **`bg_inverse: "rei"`** (`side: 1`).
  - Synchronized `unlocks` (`ratingClass: 2` credit `105`, stripped `4` and prohibited `3`), SQLite `chart` (`rating_ftr: 105`, `rating_byn: 110`, `rating_etr: -10`), and `SongFileCache`. All 8 integrity suites passed.

### `v1.8.0` — 2026-11-27
- **Batch 7 (`1batch7`) + Official Chart Pack Expansion (`407` Songs / `1,363` Charts)**:
  - Imported `211` new songs across `single` (`+184`) and `kurumi` (`+27` unique charts -> `38` songs total, `3,800` Memories pack price) via `execute_import_batch7.py`, plus merged official packages (`halcyon` + MRM REMIX BYD `11.4`, `trrricksters` + ETR `10.7`, `vector` + BYD `10.3`) and `synthesis_ext` (`Synthesis.` ETR `11.0`).
  - Merged `12` server collision charts (`anemonecrown`, `millionpp`, `blinfmin`, `bloody`, `lyrith`, `tsunagite`, `blanoir`, `miu3`, `amara`, `eltaw`, `i`, `ravenemperor`) and `16` internal multi-charter songs (`anu`, `cryptarithm`, `disorder`, `energytrixxx`, `exitium`, `fft`, `malkuth`, `marenol`, `mukurojunohakamori`, `parvorbital`, `rtx20000`, `satellite`, `sense`, `shukuseishinpan`, `solips`, `soundchimera`) with FFT waveform `AudioOffset` alignment and native BYD (`3.aff`/`3.ogg`) `audioOverride` support.
  - Applied special chart fixes: `flugel` BPM x2 scaling (`120 -> 240`, `60 -> 120`, `90 -> 180`), `ka` `-1.aff` removal + `single_glitch.jpg` 1080p background, `lagtrain` Player 1/2 split (`2.aff`/`3.aff`), `midvinter` BYD `12.8` & ETR `9.7`, `symphonyofthenight` (`3.ogg`/`3.jpg` BYD), `aragami` BYD `11.5`, `oniichanhitech` BYD `9.3`, `nyarlathotepsdreamland` FTR `11.3`, and updated `fix_charts.py` to preserve native arc colors `0..3` (`>= 4` -> `2` green).
- **Audio Gain, Previews, HD Jackets & SDVX Backgrounds**:
  - Detected and sliced `20s` drop/chorus `preview.ogg` windows for `55+` short/missing-preview songs and official merges; applied anti-clipping `alimiter` loudness boost to `24` quiet high-rating (`>= 10.7`) / boss tracks.
  - Replaced `terabyteconnection` WEBP jacket with 4x center-cropped JPEG RGB variants, installed uncropped `satellite` HD cover, white-padded `oiiaoiia`, fetched/upscaled HD covers and `1920x1440` custom backgrounds (named after `song_id`), and bundled `sdvx_conflict.jpg` (`triplesix`, `zenith`, `reetenshi`, `lachrymare`, `kaitan`) via `extra_bgs`.
  - Synchronized `unlocks` (`1,281` entries, zero `ratingClass: 3`), SQLite `chart`/`item`/`purchase`/`purchase_item`, and `SongFileCache`. All 8 integrity suites (`celest-audit --fix` & `--check`) passed cleanly.

### `v1.7.9` — 2026-11-26
- **Constant & Pricing Adjustments (`eltaw`, `blanoir`, `heavensrain`)**:
  - **`eltaw` (FTR `2`)**: Updated constant from `10.3` → **`10.4`** (`rating: 10`, `ratingPlus: false`), synced `unlocks` credit (`104` Fragments) and `purchase` price (`104` Memories).
  - **`blanoir` (FTR `2`)**: Updated constant from `10.6` → **`10.5`** (`rating: 10`, `ratingPlus: false`), synced `unlocks` credit (`105` Fragments) and `purchase` price (`105` Memories).
  - **`heavensrain` (FTR `2`)**: Updated constant from `11.6` → **`11.7`** (`rating: 11`, `ratingPlus: false`), synced `unlocks` credit (`117` Fragments; `purchase` remains `1200` Memories based on ETR `12.0`).
  - Synchronized `chart` table and recalculated user PTT on both local and live VPS databases.

### `v1.7.8` — 2026-11-26
- **Mass Constant Rebalance & Chart Designer Formatting (`23` Songs)**:
  - Updated chart constants and `ratingPlus` flags across `vengeanceofthev` (FTR `11.6`), `secretillumination` (FTR `10.5`), `deicide` (FTR `10.9`), `retribution` (FTR `11.0`), `tvsshark` (FTR `10.8`), `deceiver` (FTR `10.8`), `blanoir` (FTR `10.6`), `1nception` (FTR `10.8`), `eltaw` (FTR `10.3`), `abyssgazer` (BYD `11.7` / `11`), `lyricalstrike` (ETR `10.6`), `dualdoom` (ETR `10.3`), `journeywithyou` (ETR `9.9`), `kakuriyo` (FTR `10.5`), `terabyteconnection` (FTR `11.6`), `anemonecrown` (FTR `11.1`), `c0pyf0x` (BYD `11.9`), `blinfmin` (BYD `11.8`), `i` (FTR `10.9`), and `amara` (ETR `11.7`).
  - Formatted `ki` (Inori) `chartDesigner` with a clean newline split (`Tefrish vs Telamation vs\nTracol vs Terfish vs Roatamax`).
- **Difficulty Migrations & Chart Bugfixes (`amara`, `mopemope`, `angelhalo`, `terabyteconnection`)**:
  - **`amara`**: Migrated FTR (`2.aff`) to ETR (`4.aff`, `11.7`) with dummy placeholder `2.aff`, preserving `unlocks` conditions (`ratingClass: 4`, `type: 5, rating: 1100`, `credit: 117`).
  - **`mopemope`**: Migrated FTR `9+` (`2.aff`) to BYD `10` (`3.aff`, `10.0`), replaced `2.aff` with placeholder, removed `ratingClass: 3` from `unlocks`, and added `camera(99951,0.00,0.00,0.00,0.00,0.00,0.00,reset,1);` to restore normal camera view after the `t=99950` shake sequence.
  - **`angelhalo`**: Switched to Conflict (`side: 1`, `bg: "wacca_boss"`), kept chart in ETR (`4.aff`), removed incompatible `audioOverride` (`4.ogg` unsupported natively by `libcocos2dcpp.so`), and synced `4.aff` to `AudioOffset:-865` matching `base.ogg` waveform alignment (`-864.69 ms`).
  - **`terabyteconnection`**: Switched to Lephon Dark (`side: 4`) with `anima_conflict` / `anima_light`, and removed 11 stray post-audio main-group trace arcs (`t=204964..205681 ms`) past the `168,010 ms` song duration so the chart ends properly with the music.
- **Background Inversion & Brightness Refinements**:
  - Darkened upper diamond glare on custom backgrounds `noxsilva.jpg` (obsidian v1), `frozenette.jpg`, and `freedomdive.jpg`, and softly dimmed `blinfmin.jpg` & `straysoularound.jpg`.
  - Replaced `eltaw` `base_conflict`/`base_light` with `single_conflict`/`single_light`, set `sigma` to `single2_light`/`single2_conflict`, and completed missing `bg_inverse` pairs + `side` alignment across `maholova`, `luminositydyw`, `arscantate`, `deceiver`, `masqueraderhapsodyrequest`, `vorpalize`, `phony`, `triplesix`, `blooddrunkern4giremix`, and `cirnomede`.
- **Full Memories & Fragment Pricing Synchronization**:
  - Synchronized all `623` `unlocks` fragment prices (`round(constant * 10)`) and all `purchase` Memories prices across both local and live VPS databases without modifying existing player unlocks.

### `v1.7.7` — 2026-11-23
- **Divine Oblivion (`konzetsu`) Pack Carousel Integration & Deinos EN Search Indexing**:
  - Moved pack `konzetsu` (*Divine Oblivion*) from `"section": "mainstory2"` to `"section": "variety"` in `packlist` and `patch_arcaea.py`, placing it directly in the primary song carousel with its native pack banner `1080_select_konzetsu.png`.
  - Added English search titles (`"DEINOS PHAINEIN"`, `"deinos phainein"`, `"deinosphainein"`, `"deinos"`, `"phainein"`) and artists to `deinosphainein` in `songlist`.
- **Chart & Jacket Refinements (`finorza`, `dollmadness`, `blackswan`)**:
  - **`finorza` (FTR)**: Updated `2.aff` timing events and audio offset (`AudioOffset:1250`), normalized zero BPMs to `0.01` (`celest-audit --fix`).
  - **`dollmadness`**: Replaced jacket artwork with high-res 1080p source (`base.png`) and regenerated full 4-variant RGB JPEG set (`1080_base.jpg`, `base.jpg`, `1080_base_256.jpg`, `base_256.jpg`).
  - **`blackswan`**: Updated `base.jpg` artwork and regenerated full 4-variant set.
  - Bumped `date` timestamps (`1795413469`) for `finorza`, `blackswan`, and `dollmadness` in `songlist`.

### `v1.7.6` — 2026-11-20
- **Batch 1–5 Extreme BPM Restoration & Non-Opening `groupalpha` → `hidegroup` Conversion (`70` Songs)**:
  - Restored **`17,467`** over-clamped `timing()` lines across `70` Batch 1–5 songs (including `merikurilostinthesnowstorm/2.aff`, `terabyteconnection/2.aff`, `tsunagite/2.aff`, `veil/2.aff`/`3.aff`, `arcaeamashup`, `artemibility`, `somioncernullset`, `lostrequiem`, `mixxion`, `xaleidoscopix`, `aegleseeker`, etc.) back to original BPMs within `[-16000000.00, 16000000.00]` while keeping segment-level Scudo OOM protection (`12` dense segments kept at `±10000.00`).
  - Converted **`197`** non-opening `groupalpha` visibility cues (mid-chart hides/toggles, excluding opening fade-ins/blinks) to native `scenecontrol(...,hidegroup,0.00,1/0);` across `amara/2.aff`, `lostrequiem/2.aff`, `memoria/2.aff`, `mixxion/3.aff`, `mopemope/2.aff`, `pasyattocheese/2.aff`, `petrichor/3.aff`, `solarorbit/4.aff`, `technopolis2085/3.aff`, and `waccaultradreammegamix/2.aff`.
  - Updated `songlist` `"date"` timestamps (`1795169000`) for all `70` affected songs and synced both local and VPS caches.

### `v1.7.5` — 2026-11-20
- **`dualdoom` FTR Constant Update (`songlist` & DB)**:
  - Updated `dualdoom` FTR (`ratingClass: 2`) from `8+` (`8.7`) to `10` (`10.3`, `ratingPlus: false`) in `songlist` and synced SQLite `chart.rating_ftr = 103` + recalculated user ratings on local and VPS databases.

### `v1.7.4` — 2026-11-20
- **`merikurilostinthesnowstorm/3.aff` & `deinosphainein` Chart Sync**:
  - Cleaned duplicate `scenecontrol(217429,enwidencamera,2.00,0);` in `merikurilostinthesnowstorm/3.aff` (keeping single `enwidencamera` reset before `enwidenlanes` returns to 4-lane at `217431 ms`).
  - Updated `date` timestamps (`1795167100`) in `songlist` for `merikurilostinthesnowstorm` and `deinosphainein` to trigger client chart re-download.

### `v1.7.3` — 2026-11-20
- **Aegleseeker + Lagrange Post-Clear Crash Fix & `deinosphainein` Songlist Cleanup**:
  - **Native Crash Guard (`patch_arcaea.py`)**: Guarded `0x1386298` in `SpecialSceneAegleseekerChallenge::performSpecialSongFinish` (`0x1386140`) via code cave `0xA46FE0` so `Chart->unlock == nullptr` (when `aegleseeker` has no `unlocks` entries) skips `0xf361fc` instead of dereferencing `NULL + 0x28` (`SIGSEGV`).
  - **`deinosphainein` Songlist Cleanup (`ArcaeaServerFork/database/songs/songlist`)**: Removed missing `additional_files` video declarations and `hidden_until_unlocked`/`hidden_until` locks, and restored chart constants (`7.5 / 9.6 / 10.9 / 12.0`). `ArcaeaServerFork/database/songs/deinosphainein/` remains ready to auto-serve `video.mp4`, `video_audio.ogg`, `video_720.mp4`, and `video_1080.mp4` once placed on disk.

### `v1.7.2` — 2026-11-20
- **Batch 6 Visual TimingGroup Fixes, Official `deinosphainein` (`Inscribed`) Integration & User Constant Sync**:
  - **Batch 6 Visual Fixes (`hiasobi`, `chuten`)**:
    - `hiasobi/2.aff` & `hiasobi/3.aff`: Converted `TG#10` (originally `autoplay` + `groupalpha=0`, 12 solid arcs at `128507..128955`) to `timinggroup(noinput){` with `scenecontrol(0,hidegroup,0.00,1);` to eliminate 12 false `LOST` hits, and converted `TG#1..TG#8` opening `groupalpha` frames (`3162..3358 ms`) to native `hidegroup`.
    - `chuten/2.aff`: Restored hidden `groupalpha` timing groups (`TG#6`, `TG#7`, `TG#9`) using native `hidegroup` so early red/green/fake notes stay hidden until their cues, and converted `TG#10` (`groupalpha=0`) to `timinggroup(noinput){` + `scenecontrol(0,hidegroup,0.00,1);`.
  - **Official `deinosphainein` (`DEINOS PHAINEIN`) & Global `Inscribed` UI Unlock (`patch_arcaea.py`, `songlist`, `unlocks`, `user.py`)**:
    - Imported `deinosphainein` from `songs_official` using vanilla `7.1.0c` `songlist` metadata (`set: "konzetsu"`, `side: 4`, `bg: "deinosphainein"`, `byd_local_unlock: true`, `ratingClassAlias: 1`, `legacy11: true`, constants `7.5 / 9.6 / 10.9 / 12.0`).
    - Included vanilla `konzetsu` (*Divine Oblivion*) pack and its native pack banners (`1080_select_konzetsu.png`, `1080_select_konzetsu_alt.png`) in `patch_arcaea.py`, and granted `konzetsu` pack ownership in `user.py` and `user_item`.
    - Patched `hasUnlockedInscribed()` at `0x18ce648` (`mov w0, #1; ret`) in `libcocos2dcpp.so` so `Inscribed` (`ratingClassAlias == 1`, `legacy11: true`) difficulty labels and ratings render everywhere instead of `"???"` / `"?"`.
  - **User Constant Updates (`reendofadream` FTR `11.5`, `ray` ETR `9.3`)**: Preserved updated constants in `songlist`, synced `unlocks`, and recalculated SQLite `chart` table and user ratings.

### `v1.7.1` — 2026-11-20
- **Anomaly Polish & Chart BPM Restoration (`patch_arcaea.py`, `fix_charts.py`, `epilogue`, `abyssgazer`, `42flux`)**:
  - **42flux Anomaly Visual Cleanup**: Disabled hardcoded injection of 20 Ether Strike fake hold notes at `0xdccbcc` (`NOP` over `bl #0xd0f53c`) so holds no longer collide with `42flux` [FTR] streams before shutter transition, and replaced `assets/img/bg/1080/etherstrike_o.png` with an `asmodeus.jpg` crystal silhouette overlay using the starburst alpha mask.
  - **Fix `fix_charts.py` Segment Overlap Guard & Restore High BPMs**: Updated `has_dense_long_note` in `fix_charts.py` to compute hold/arc overlap only inside the active timing segment `(min(t2, next_t) - max(t1, t_val))` instead of full note duration, preventing false clamping of 1 ms scroll-teleport BPMs down to `10000.00`.
  - Restored original 1 ms extreme BPMs (`999999.00` / `1860000.00`) in `epilogue/2.aff`, `abyssgazer/2.aff`, `abyssgazer/3.aff`, and `42flux/0.aff`, and bumped `songlist` `"date"` timestamps for automatic `remote_dl` chart refresh.

### `v1.7.0` — 2026-11-20
- **Native Anomaly Feature (`libcocos2dcpp.so` / `patch_arcaea.py`, `songlist`, `unlocks`)**:
  - Added a custom Fracture Ray-style anomaly unlock sequence for **`asmodeus`** (pack `wanderlust`) triggered exclusively by playing **`42flux` [FTR] (`ratingClass == 2`)**:
    - **Hidden Before Unlock**: Added `"hidden_until": "song"` across `asmodeus` difficulties `0, 1, 2` in `songlist` and replaced fragment/chart conditions with `{"type": 101, "min": 0, "max": 0}` in `unlocks`.
    - **Any Partner & Gauge >= 70%**: Bypassed Hikari Zero (`character_id == 14`) & sealed-skill restrictions in `SpecialSceneFractureRayTrigger::init` (`0x83320c`), and locked the trigger threshold in `performSpecialSongUpdate` (`0xdccb14`/`0xdccb4c`) to `70.0%` Recollection Rate regardless of partner or level.
    - **Direct Unlock (No `min`/`max` Progress Bar) & Shutter Reuse**: Redirected `TriggerFactory`, `InnerLambda`, `AnomalyUnlock`, and `UnlockCondition101` hints via code cave `0x780c80` to launch/unlock `asmodeus` [FTR] immediately upon anomaly completion or track lost, reusing `img/shutter_r_tempestissimo.png` / `img/shutter_l_tempestissimo.png` at `0xc6abfc`.

### `v1.6.0` — 2026-11-19
- **Batch 6 Song Import (`11` New Songs + `1` Merged ETR + New `Emanant Glass` Pack)**:
  - **New Singles (`7`)**: `maholova` (FTR 9+ / `9.8`), `hiasobi` (FTR 10 No-Cam / `10.3` + BYD 10 Camera / `10.3`), `ark` (FTR 10 / `10.4`), `chuten` (FTR 10+ / `10.9`, `side: 3`), `dualdoom` (Official `lowiro.dualdoom` PST 3 / PRS 6 / FTR 8+ / ETR 10 merged with Batch 6 BYD 11 / `11.4` + `jacketOverride`), `kakuriyo` (FTR 10 / `10.3`), `luminositydyw` (ETR 9+ / `9.8`).
  - **New Pack (`emanantglass` — 4 Songs, `400` Memories)**: `hoshifuri` (FTR 9+ / `9.7`), `leadlight` (FTR 10 / `10.5`), `avys` (FTR 10+ / `10.7`), `zenith` (FTR 11 / `11.2`), bundled with `select_emanantglass.png` and `1080_select_emanantglass.png`.
  - **Merged Song**: Added `angelhalo` Eternal (`4.aff`, ETR 10+ / `10.9`) with `audioOverride: true` (`4.ogg`, `4_preview.ogg`) and `jacketOverride: true`.
- **Metadata & Unlocks**:
  - Added full `category`, `source_copyright`, `search_title`, and `search_artist` localization for all Batch 6 songs.
  - Synchronized `unlocks` fragment pricing (`round(constant * 10)`), correcting `ray` `rc=4` (`97` → `96`), `tsukinimurakumo` `rc=2` (`85` → `87`), `angelhalo` `rc=4` (`109`), and all new Batch 6 songs.

### `v1.5.6` — 2026-11-19
- **Charts & Metadata (`deicide/3.aff`, `songlist`)**:
  - Restored `deicide/3.aff` (Beyond) back to the optimized `1f1d916` release (`357,187` bytes, keyframe/idle/triplet reductions with `hidegroup()` culling) after native Android performance comparison against the full 1.31 MB chart.
  - Bumped `deicide` `"date"` timestamp in `songlist` (`1795071456`) so connected clients automatically re-fetch the optimized chart via `remote_dl`.

### `v1.5.5` — 2026-11-19
- **Metadata (`songlist` & `chart` DB)**:
  - Updated `tsukinimurakumo` Future (`ratingClass: 2`) constant to `8.7` (`8+`, aligned with `3.0 | 6.0 | 8.7 | 10.0` fanmade reference) and synced `chart.rating_ftr = 87`.
  - Lowered `ray` Eternal (`ratingClass: 4`) constant from `9.7` to `9.6` (`9`, keeping `ratingPlus: false`) and synced `chart.rating_etr = 96`.
  - Synced `jedagjedugepilepsy` Beyond (`ratingClass: 3`) constant (`rating_byn = 79`) in `arcaea_database.db` `chart` table.
  - Aligned `ratingPlus` across all remaining out-of-spec charts (`rating < 11` threshold `>= .7`; `rating >= 11` threshold `>= .8`):
    - `aclock` [FTR]: `8.8` → `8+` (`ratingPlus: true`)
    - `rinka` [PRS]: `9.6` → `9` (`ratingPlus: false`)
    - `koishitemacaronage` [FTR]: `9.8` → `9+` (`ratingPlus: true`)
    - `superreactorx` [FTR]: `10.6` → `10` (`ratingPlus: false`)
    - `zirnitra` [FTR]: `11.7` → `11` (`ratingPlus: false`)
    - `abyssgazer` [BYD]: `11.8` → `11+` (`ratingPlus: true`)
- **Documentation**:
  - Documented `ratingPlus` constant threshold rules in `CHART_FIX_DOCUMENTATION.md` Section 1.3 and `AGENTS.md`.

### `v1.5.4` — 2026-11-19
- **Metadata (`songlist`)**:
  - Fixed `jedagjedugepilepsy` Beyond (`ratingClass: 3`) display rating from `0` to `9` (matching `constant: 9.6`) so the song is no longer hidden in Song Select and Search.
  - Restored `rabbitintheblackroom` root BPM to `"270"` (`bpm_base: 270`) and added per-difficulty override `"bpm": "220"`, `"bpm_base": 220` for Beyond VIP (`ratingClass: 3`).
  - Fixed `artemibility` display BPM (`"175"` → `"200"`, matching `bpm_base: 200`) and `kai_` display BPM (`"164"` → `"193"`, matching `bpm_base: 193`).
  - Updated BPM range display strings to match original charter metadata: `worldsendloneliness` (`"100-205"`), `asmodeus` (`"74-200"`), `worldsendblackbox` (`"205-266"`), `betrayalalice` (`"188-189"`).
- **Charts (`songs/`)**:
  - Restored `deicide/3.aff` to full 370 `timinggroup`s / 20,733 arcs with full `hidegroup()` culling (1,111 events) from commit `7828a5e9`, sanitized cleanly (`0.00` → `0.01`, extreme BPM clamped to `[-16000000.00, 16000000.00]`) for native Android performance testing.
- **Process / Docs**:
  - Formalized mandatory app version bump policy in `RELEASE_CHANGELOG.md`, `AGENTS.md`, `ArcaeaServerFork/AGENTS.md`, and `CLAUDE.md`.

### `v1.5.3` — 2026-11-18
- **Songs / Assets**: Enhanced audio loudness on 29 songs (including `zirnitra`, `deicide`, `finorza`, etc.), upgraded HD jackets (`stardustray`, `noxsilva`), updated `finorza` side (`4`), and tightened potential restrictions on high-constant charts in `unlocks`.
- **Metadata**: Aligned `songlist` batch `"version"` fields (`1.0`–`1.5`) matching import history across all 184 songs.

### `v1.4.0` — 2026-11-17
- **APK / Manifest (`patch_arcaea.py`)**: Configured side-by-side package ID `moe.cel.arc` and launcher app name `Arcelest`, plus extended lanes / camera / partner hooks in `libcocos2dcpp.so`.

