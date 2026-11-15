# AGENTS.md — Arcaea Server & Chart Integrity Workflow

This document provides mandatory guidance and automated verification procedures for AI agents (and developers) working on chart imports, asset updates, server maintenance, and APK patching in this repository.

---

## 1. Golden Rules for AI Agents

1. **All written code and commit messages MUST be in English** (`<RULE[user_global]>`).
2. **Never generate an APK without running the automated integrity audit** (`check_chart_integrity.py --fix`).
3. **Always preserve base difficulties [0, 1, 2]**: In Arcaea, every single song must have entries for Past (0), Present (1), and Future (2) in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) and valid `.aff` files on disk. Missing base difficulties will cause `nullptr` dereference crashes in the game's native C++ engine (`libcocos2dcpp.so`).

---

## 2. Mandatory Verification Checklist

Before packaging the APK or pushing server updates, verify these 5 core requirements:

### Check 1: Songlist & Difficulty Completeness
- Every song in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) must have `ratingClass` 0, 1, and 2.
- If a chart is single-difficulty (e.g. FTR-only or ETR-only), add unrated placeholder difficulties:
  ```json
  {"ratingClass": 0, "chartDesigner": "-", "jacketDesigner": "", "rating": 0},
  {"ratingClass": 1, "chartDesigner": "-", "jacketDesigner": "", "rating": 0}
  ```
  *(If ETR-only or BYD-only, also include `ratingClass: 2` with `rating: 0`)*.
- The corresponding `0.aff`, `1.aff`, and `2.aff` files must exist on disk:
  ```text
  AudioOffset:0
  TimingPointDensityFactor:1
  -
  timing(0,4.00,4.00);
  (1000,1);
  ```

### Check 2: Song Asset Structure
Every song folder in `ArcaeaServerFork/database/songs/<song_id>/` must contain:
- Chart files: `0.aff`, `1.aff`, `2.aff` (and `3.aff`/`4.aff` if declared).
- Audio:
  - `base.ogg`: valid Vorbis audio, size > 4 KB, duration > 0s.
  - `preview.ogg`: valid Vorbis audio, non-truncated (no EOF error), 15–25s duration.
  - `{rc}_preview.ogg`: if difficulty has `"audioOverride": true`.
- Jackets: 4 JPEG RGB files (never PNG or RGBA):
  - `base.jpg` (512×512)
  - `base_256.jpg` (256×256)
  - `1080_base.jpg` (768×768)
  - `1080_base_256.jpg` (384×384)
- Backgrounds:
  - `bg` is **MANDATORY** in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
  - `bg_inverse` is optional (used for light/conflict inversion).
  - Quality Standard: Custom backgrounds must be $\ge 1080$p ($1920\times 1440$ or $1920\times 1080$) and file size $\ge 100\text{ KB}$ (images $< 100\text{ KB}$ are low-res 720p and auto-enhanced with Lanczos 95).
  - Background names must exist in vanilla APK (`assets/img/bg/`) or as custom files in the song folder. Watch for known typos:
    - Use `lanota-light` and `lanota-conflict` (hyphens, not underscores).
    - Use `chunithmnew_light` and `chunithmnew_conflict` (no underscore after chunithm).
    - Use `base_conflict` (not `conflict`).
    - Use `base_light` (not `pentiment_light`).
- Custom `.wav` sounds: Any audio trigger referenced in the chart (`sound_wav` or `arc(...,name_wav)`) must have `name.wav` in the song folder.

### Check 3: AffParser Supported Syntax (Normalized)
- **Negative BPM**: Supported by `LogicChart`. Preserve negative BPMs, but format as decimal `%.2f` (e.g. `-120.00`). No negative timestamps ($t < 0$) before $t = 0$.
- **Native SceneControls**: Only use the 9 native commands:
  `trackdisplay`, `trackshow`, `trackhide`, `redline`, `arcahvdistort`, `arcahvdebris`, `hidegroup`, `enwidencamera`, `enwidenlanes`.
  - Boolean controls (`hidegroup`, `enwidenlanes`, `enwidencamera`): parameter 4 must be `1` (active) or `0` (inactive).
  - Opacity control (`trackdisplay`): uses 0..255 scale (normalize boolean `1.0` to `255`).
- **Camera Events**: `camera(t,trans_x,trans_y,trans_z,rot_x,rot_y,rot_z,easing,duration);`. Float parameters formatted as `%.2f`, duration $\ge 0$, easing in `['l', 's', 'qi', 'qo', 'reset']`.
- **Decimal Numbers**: In `.aff`, all float tokens (`bpm`, `beats`, `p3`, `arc` coordinates) MUST contain decimal points (e.g. `120.00`, never raw integer `120`).

### Check 4: Prohibited Elements (Crash Prevention)
- **Extreme BPM & Scientific Notation**: Reject scientific notation (e.g. `7E+08` or `1.5e7`). Extreme BPMs ($\ge 10^8$) trigger Android `Scudo OOM` from millions of tick allocations. Clamp to safe 6-digit decimal float range $[-1000000.00, 1000000.00]$.
- **Zero BPM**: `bpm == 0.00` causes division by zero. Replace at $t = 0$ with base BPM (initial tempo), and at $t > 0$ with `0.01` (`timing(t, 0.01, beats);` to preserve visual stop gimmick).
- **Anomaly SceneControls**: Strip non-native commands (e.g. ArcCreate extensions: `groupalpha`, `charterswitch`, `bgshow`, `hudalpha`, etc.).

### Check 5: Hot Reload & Remote DL
- All server charts (except offline `infinityheaven`) must have `"remote_dl": true` in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
- When modifying `.aff` files on the server during debugging:
  - Update `"date": int(time.time())` in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
  - Re-sync server cache: `from core.download import SongFileCache; SongFileCache.sync_all()`.
  - The client checks `"date"` against its local cache and automatically re-downloads the updated chart.

### Check 6: Pre-Build Progression & Economic Statistics
Before packaging, automated integrity check prints out 6 core metrics:
1. Total Fragments required to unlock songs (positive costs only, negative assistance ignored).
2. Total Memories required to unlock songs and packs.
3. Total songs per difficulty class (PST, PRS, FTR, BYD, ETR).
4. Total rated charts and level distribution (Lv.1 to Lv.12+).
5. Theoretical maximum potential rating on B30 (legacy), B50 (modern), and server active formula with 3-digit precision and +0.2 clear bonus.
6. Background availability & client APK bundling status (Vanilla APK vs Custom server assets vs Patched APK status).

---

## 3. Automated CLI Commands

Global shortcut commands are available directly in your PATH (`~/.local/bin/`):
```bash
# 1. Instantly display Section 7 Progression & Economic Statistics (0.05s)
celest-stats
# or: celest-audit --stats

# 2. Run full automated chart integrity audit (Checks all 128 songs & 432 charts)
celest-audit --check

# 3. Run automated chart integrity test (Auto-repair mode)
celest-audit --fix

# 4. Audit a single song only
celest-audit --fix --song <song_id>

# 5. Audit background availability against client APK and server assets
celest-audit --bg

# 6. Rebuild patched APK (Pre-build integrity hook will automatically run)
cd /home/luhung/Documents/project/Celestl
/home/luhung/.venvs/arcaea-server/bin/python ArcaeaServerFork/tools/patch_arcaea.py --output arcaea_7.1.0c_patched.apk

# 7. Connect ADB to Waydroid and install patched APK
celest-apk-update

# 8. Start Arcaea private server daemon
celest-server-start

# 9. Stop Arcaea private server daemon and release all ports
celest-server-stop
```

