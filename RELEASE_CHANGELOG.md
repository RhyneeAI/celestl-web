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

