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

