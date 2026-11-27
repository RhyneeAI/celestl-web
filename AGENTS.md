# AGENTS.md — Arcaea Server & Chart Integrity Workflow

This document provides mandatory guidance and automated verification procedures for AI agents (and developers) working on chart imports, asset updates, server maintenance, and APK patching in this repository.

---

## 1. Golden Rules for AI Agents

1. **All written code and commit messages MUST be in English** (`<RULE[user_global]>`).
2. **Never generate an APK without running the automated integrity audit** (`check_chart_integrity.py --fix`).
3. **Always preserve base difficulties [0, 1, 2]**: In Arcaea, every single song must have entries for Past (0), Present (1), and Future (2) in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist) and valid `.aff` files on disk. Missing base difficulties will cause `nullptr` dereference crashes in the game's native C++ engine (`libcocos2dcpp.so`).
4. **Always bump the App Release Version on any songs, metadata, or lib changes**: Whenever modifying `database/songs/` charts/assets, metadata (`songlist`, `unlocks`, `packlist`), or especially native libraries/patcher (`libcocos2dcpp.so`, `patch_arcaea.py`), you MUST increment the release version (`arcelest_<X.Y.Z>_release.apk`), update `DEFAULT_OUTPUT_APK` in `patch_arcaea.py`, update `RELEASE_CHANGELOG.md`, and rebuild the APK (see [RELEASE_CHANGELOG.md](file:///home/luhung/Documents/project/Celestl/RELEASE_CHANGELOG.md)).
5. **NEVER overwrite live VPS `arcaea_database.db` with a local copy**: Players actively submit scores and register on the VPS (`139.190.96.194`). Uploading local `arcaea_database.db` wipes live `best_score`, `recent30`, `user.rating_ptt`, and newly registered accounts. Always run DB migrations (`recalculate_ratings.py` / SQL updates) against the live VPS database directly (or pull a live `sqlite3.backup()` first, back it up on VPS, update, and verify).

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
- **Prohibit ratingClass: 3 in `unlocks`**: Never declare entries for `ratingClass: 3` (Beyond) in `database/songs/unlocks`. Beyond difficulty has no native fragment purchase UI; declaring it in `unlocks` locks the 4th difficulty diamond, forces label to `"?"`, and hides unplayed charts from the BEYOND tab in Song Select.
- **`ratingPlus` Threshold Rule**: For `rating < 11`, set `"ratingPlus": true` when the constant decimal is `>= .7` (e.g. `10.7` → `10+`); for `rating >= 11`, set `"ratingPlus": true` only when the constant decimal is `>= .8` (e.g. `11.7` → `11`, `11.8` → `11+`). See [CHART_FIX_DOCUMENTATION.md](file:///home/luhung/Documents/project/Celestl/CHART_FIX_DOCUMENTATION.md#L58-L68).

### Check 2: Song Asset Structure
Every song folder in `ArcaeaServerFork/database/songs/<song_id>/` must contain:
- Chart files: `0.aff`, `1.aff`, `2.aff` (and `3.aff`/`4.aff` if declared).
- Audio:
  - `base.ogg`: valid Vorbis audio, size > 4 KB, duration > 0s. For high-rating (`10+` / `11.0+`) or boss-vibe songs, boost/normalize audio loudness (dB) with peak limiting to avoid clipping.
  - `preview.ogg`: valid Vorbis audio, non-truncated (no EOF error), 15–25s duration (matching boosted loudness if applied).
  - `{rc}_preview.ogg`: if difficulty has `"audioOverride": true`.
- Jackets: 4 JPEG RGB files (never PNG or RGBA):
  - `base.jpg` (512×512)
  - `base_256.jpg` (256×256)
  - `1080_base.jpg` (768×768)
  - `1080_base_256.jpg` (384×384)
- Backgrounds & `side` Mapping:
  - `bg` is **MANDATORY** in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
  - `bg_inverse` is paired automatically for `_light` / `_conflict` sets.
  - **`arccreate_*` Native Substitution**: Any non-custom background named `arccreate_*` (or generic template copy) that has an equivalent in the original vanilla APK (`assets/img/bg/`) MUST be replaced with the native vanilla BG name (e.g. `single_light`/`single_conflict` for `arccreate_base_*` — never `base_light`/`base_conflict` on fanmade songs; `chuni-worldvanquisher`, `chunithmnew_light`/`chunithmnew_conflict`, `lanota-light`/`lanota-conflict`, `nijuusei2_conflict`, etc.).
  - **`.arcproj` `side` Mapping**: Map `skin.side` directly as `light` → `0`, `conflict` → `1`, `colorless` → `2` (and `lephon` → `3` / `4`).
  - **Mandatory Prompt for Rating `>= 11.0` Without Custom BG/Side**: For any imported chart with `rating >= 11` (`constant >= 11.0`) that lacks a custom background or explicit custom `side`, ask the user first before assigning defaults.
  - Quality Standard: Custom backgrounds must be $\ge 1080$p ($1920\times 1440$ or $1920\times 1080$) and file size $\ge 100\text{ KB}$ (images $< 100\text{ KB}$ are low-res 720p and auto-enhanced with Lanczos 95).
  - Background names must exist in vanilla APK (`assets/img/bg/`) or as custom files in the song folder. Watch for known typos:
    - Use `lanota-light` and `lanota-conflict` (hyphens, not underscores).
    - Use `chunithmnew_light` and `chunithmnew_conflict` (no underscore after chunithm).
    - Use `chuni-worldvanquisher` (hyphen, not underscore).
    - Use `single_conflict` / `single_light` for custom fanmade songs (reserve `base_conflict` / `base_light` for official base songs).
    - Use `base_light` (not `pentiment_light`).
- Custom `.wav` sounds: Any audio trigger referenced in the chart (`sound_wav` or `arc(...,name_wav)`) must have `name.wav` in the song folder.

### Check 3: AffParser Supported Syntax (Normalized)
- **Header & Delimiter**: Must begin with `AudioOffset:<integer>` (and optional `TimingPointDensityFactor:<float>`), terminated with `-` delimiter on a line by itself before event body.
- **Native Function Whitelist**: Body statements must strictly comply with the 8 native Cocos2d-x engine functions: `()` (tap), `hold()`, `arc()` (with optional `[arctap(t), ...]`), `camera()`, `timing()`, `scenecontrol()`, `timinggroup()`, and `flick()`. Every event statement must terminate with `;`. Unrecognized commands or missing semicolons trigger fatal `ChartLoadError`.
- **Negative BPM**: Supported by `LogicChart`. Preserve negative BPMs, but format as decimal `%.2f` (e.g. `-120.00`). No negative timestamps ($t < 0$) before $t = 0$.
- **Native SceneControls**: Only use the 9 native commands:
  `trackdisplay`, `trackshow`, `trackhide`, `redline`, `arcahvdistort`, `arcahvdebris`, `hidegroup`, `enwidencamera`, `enwidenlanes`.
  - Boolean controls (`hidegroup`, `enwidenlanes`, `enwidencamera`): parameter 4 must be `1` (active) or `0` (inactive).
  - Opacity control (`trackdisplay`): uses 0..255 scale (normalize boolean `1.0` to `255`).
- **Camera Events**: `camera(t,trans_x,trans_y,trans_z,rot_x,rot_y,rot_z,easing,duration);`. Float parameters formatted as `%.2f`, duration $\ge 0$, easing in `['l', 's', 'qi', 'qo', 'reset']`.
- **Decimal Numbers**: In `.aff`, all float tokens (`bpm`, `beats`, `p3`, `arc` coordinates) MUST contain decimal points (e.g. `120.00`, never raw integer `120`).

### Check 4: Prohibited Elements (Crash Prevention)
- **Extreme BPM & Scientific Notation**: Reject scientific notation (e.g. `7E+08` or `1.5e7`). Extreme BPMs ($\ge 10^8$) trigger Android `Scudo OOM` from millions of tick allocations if active holds/playable arcs exist. For visual gimmicks, preserve BPM up to the IEEE 754 24-bit mantissa limit $[-16000000.00, 16000000.00]$. Clamped extreme BPMs must be formatted as decimal `%.2f`.
- **Zero BPM**: `bpm == 0.00` causes division by zero. Replace at $t = 0$ with base BPM (initial tempo), and at $t > 0$ with `0.01` (`timing(t, 0.01, beats);` to preserve visual stop gimmick).
- **Anomaly SceneControls**: Strip non-native commands (e.g. ArcCreate extensions: `groupalpha`, `charterswitch`, `bgshow`, `hudalpha`, etc.).
- **Timinggroup Attributes**: Strip non-native timinggroup arguments (e.g. `name="..."`, `light`, `noclip`). Only native parameters (`noinput`, `fadingholds`, `anglex<deg>`, `angley<deg>`) are permitted. In native Arcaea (`libcocos2dcpp.so` 0x145b5b8), multiple attributes are concatenated with `'_'` (e.g. `noinput_fadingholds`); commas trigger fatal parser exceptions (`expected RPAREN, got RPAREN instead`). Always normalize comma-separated timinggroup parameters to underscore (e.g. `noinput,fadingholds` -> `noinput_fadingholds`).

### Check 5: Hot Reload & Remote DL
- All server charts (except offline `infinityheaven`) must have `"remote_dl": true` in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
- When modifying `.aff` files on the server during debugging:
  - Update `"date": int(time.time())` in [songlist](file:///home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist).
  - Re-sync server cache: `from core.download import SongFileCache; SongFileCache.sync_all()`.
  - The client checks `"date"` against its local cache and automatically re-downloads the updated chart.

### Check 6: Arc & Hold Duration Normalization (ArcTap Hazards & Short Holds)
- **Pure 0ms Arcs Native Support**: Pure 0ms trace arcs (`is_trace = true`, $t_1 == t_2$) and pure 0ms active arcs (`is_trace = false`, $t_1 == t_2$) are 100% natively supported by Arcaea. DO NOT extend them to 1ms. Extending pure 0ms trace arcs causes 3D ribbon mesh extrusion, GPU buffer saturation, and Z-fighting; extending 0ms active arcs turns them into nearly impossible-to-tap 1ms active notes.
- **0ms Arc with ArcTap Hazard**: Arcs with duration $0\text{ ms}$ (`t_start == t_end`) that contain ArcTaps (`[arctap(t)]`) trigger native divide-by-zero ($s = \frac{0}{0} = \text{NaN}$). Automatically extend parent arc to $1\text{ ms}$ (`t_end = t_start + 1`).
- **Out-of-Bounds ArcTaps**: Clamp ArcTap timestamps strictly to the parent arc's interval $[\min(t_1, t_2), \max(t_1, t_2)]$.
- **Holds with duration $\le 1\text{ ms}$**: Short holds cannot generate hold ticks and trigger combo breaks; auto-convert to tap note `(t, lane);`.
- **Chronologically Inverted Notes**: Swap timestamps and coordinates ($t_1 \leftrightarrow t_2$, $x_1 \leftrightarrow x_2$, $y_1 \leftrightarrow y_2$).

### Check 7: Unlocks Integrity & Beyond (ratingClass 3) Prohibition
- **Strict Prohibition on ratingClass 3 in `unlocks`**: Beyond difficulty has no fragment purchase UI in native Arcaea client. Declaring it in `database/songs/unlocks` locks the 4th difficulty diamond, forces label to `"?"`, and hides unplayed charts from the BEYOND tab in Song Select.
- Any unlock requiring chaining (such as Wanderlust Eternal) must maintain valid progression conditions and diagram records.

### Check 8: Pre-Build Progression & Economic Statistics
Before packaging, automated integrity check prints out 6 core metrics:
1. Total Fragments required to unlock songs (positive costs only, negative assistance ignored).
2. Total Memories required to unlock songs and packs.
3. Total songs per difficulty class (PST, PRS, FTR, BYD, ETR).
4. Total rated charts and level distribution (Lv.1 to Lv.12+).
5. Theoretical maximum potential rating on B50 (modern) and server active formula with 3-digit precision and +0.2 clear bonus.
6. Background availability & client APK bundling status (Vanilla APK vs Custom server assets vs Patched APK status).

### Check 9: Arcaea Scoring, Grade Ranges & Lamp Invariants
Scores in `best_score`, `recent30`, and `user` tables MUST strictly adhere to official Arcaea mathematical rules and judge boundaries:

#### 1. Official Grade Score Ranges
| Grade | Score Range | Description |
|:---:|:---:|---|
| **D** | $< 8\,800\,000$ | Fail / Poor performance |
| **C** | $8\,800\,000 - 8\,999\,999$ | Minimum clear threshold |
| **B** | $9\,000\,000 - 9\,199\,999$ | Intermediate grade |
| **A** | $9\,200\,000 - 9\,499\,999$ | Upper-intermediate grade |
| **AA** | $9\,500\,000 - 9\,799\,999$ | Advanced clear grade |
| **EX** | $9\,800\,000 - 9\,899\,999$ | Expert grade |
| **EX+** | $9\,900\,000 - 9\,999\,999$ | Master grade |
| **PM** | $\ge 10\,000\,000$ | **Pure Memory** ($10\,000\,000 + \text{Shiny Pure Count}$) |

#### 2. Exact Score Formula
$$\text{Base Score} = \left\lfloor \frac{10\,000\,000}{\text{Total Notes}} \times \left(\text{Pure} + \frac{\text{Far}}{2}\right) \right\rfloor$$
$$\text{Total Score} = \text{Base Score} + \text{Shiny Pure Bonus} \quad (\text{Shiny Pure} \le \text{Pure})$$

#### 3. Strict Lamp (Clear Type) & Judge Consistency
- **Pure Memory (`clear_type = 3`)**: Strictly requires $\text{Score} \ge 10\,000\,000$, $\text{Near/Far} = 0$, and $\text{Miss/Lost} = 0$. Never set `clear_type = 3` if score $< 10\,000\,000$ or if there are any Near/Miss notes.
- **Full Recall (`clear_type = 2`)**: Strictly requires $\text{Miss/Lost} = 0$, $\text{Near/Far} > 0$, and $\text{Score} < 10\,000\,000$.
- **Normal Clear (`clear_type = 1`)**: Strictly requires $\text{Miss/Lost} > 0$, and gauge maintained $\ge 70\%$ at track completion.
- **Easy / Hard Clear (`clear_type = 4 / 5`)**: Easy / Hard gauge clears.
- **Track Lost (`clear_type = 0`)**: Final gauge $< 70\%$ (or $0\%$ on Hard gauge).

#### 4. Potential Rating (PTT) System — Modern B50 Formula
- **Mandatory Modern B50 Formula**: In Celest Server, player potential (`rating_ptt`) strictly follows the modern **Best 50 (B50)** formula. The legacy B30 (Best 30 + Recent 10) formula is obsolete and prohibited.
- **Single Play Rating**:
  - Score $\ge 10\,000\,000$ (PM): $\text{Rating} = \text{Constant} + 2.0$
  - $9\,800\,000 \le \text{Score} < 10\,000\,000$ (EX/EX+): $\text{Rating} = \text{Constant} + 1.0 + \frac{\text{Score} - 9\,800\,000}{200\,000}$
  - Score $< 9\,800\,000$: $\text{Rating} = \max\left(0, \text{Constant} + \frac{\text{Score} - 9\,500\,000}{300\,000}\right)$
  - Clear bonus: $+0.2$ added for all clears ($\text{clear\_type} \neq 0$).
- **Server Active PTT**: $\text{Celest PTT} = \frac{\sum_{i=1}^{10} \text{Rating}_i + \sum_{i=1}^{50} \text{Rating}_i}{60}$ (stored as 3-decimal float in `user.rating_ptt`).

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

# 6. Rebuild patched APK (Pre-build integrity hook will automatically run; bump version on songs/metadata/lib changes)
cd /home/luhung/Documents/project/Celestl
/home/luhung/.venvs/arcaea-server/bin/python ArcaeaServerFork/tools/patch_arcaea.py --output arcelest_1.8.5_release.apk

# 7. Connect ADB to Waydroid and install patched APK
celest-apk-update

# 8. Start Arcaea private server daemon
celest-server-start

# 9. Stop Arcaea private server daemon and release all ports
celest-server-stop
```

