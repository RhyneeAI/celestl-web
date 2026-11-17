# Celestl — Arcaea Private Server & Tooling Ecosystem

Ecosystem repository for Celest Arcaea: server backend, web dashboard, client patcher, chart database, and automated integrity verification tools for Arcaea v7.1.0c.

---

## Global CLI Shortcuts (`~/.local/bin/`)

Convenient terminal shortcuts available globally from any working directory:

```bash
# 1. Instantly display Section 7 Progression & Economic Statistics (0.05s)
celest-stats
# or: celest-audit --stats

# 2. Run full automated chart & asset integrity audit (128 songs & 432 charts)
celest-audit --check

# 3. Run automated integrity audit with auto-repair
celest-audit --fix

# 4. Audit and repair a single song only
celest-audit --fix --song <song_id>

# 5. Audit background availability against client APK and server assets
celest-audit --bg

# 6. Start the Celest private server daemon
celest-server

# 7. Rebuild patched APK with libcocos2dcpp hooks and custom songs
cd /home/luhung/Documents/project/Celestl
/home/luhung/.venvs/arcaea-server/bin/python ArcaeaServerFork/tools/patch_arcaea.py --output arcaea_7.1.0c_patched.apk

# 8. Connect ADB to Waydroid and install patched APK
adb connect 192.168.240.112:5555
adb install -r --no-incremental arcaea_7.1.0c_patched.apk
```

---

## Directory Overview

- **`ArcaeaServerFork/`**: Core private server engine, SQLite database (`arcaea_database.db`), and asset store (`database/songs/`).
- **`web/`**: Web interface, management dashboard, and song catalogue.
- **`data/`**: Metadata definitions, songlist archives, and pack mappings.
- **`design/`**: UI/UX design mockups, potential rating assets, and stylesheets.
- **`AGENTS.md`**: AI agent and developer mandatory integrity workflow and rules.
- **`CHART_FIX_DOCUMENTATION.md`**: Complete documentation on chart sanitization, native engine syntax, and progression statistics.

---

## Arcaea Scoring Mechanics & Grade Boundaries

All scores simulated or saved in the database follow official Arcaea mathematical rules:

$$\text{Base Score} = \left\lfloor \frac{10\,000\,000}{\text{Total Notes}} \times \left(\text{Pure} + \frac{\text{Far}}{2}\right) \right\rfloor$$
$$\text{Total Score} = \text{Base Score} + \text{Shiny Pure Bonus} \quad (\text{Shiny Pure} \le \text{Pure})$$

### Official Score Grade Ranges
| Grade | Score Range | Description | Lamp Invariant |
|:---:|:---:|---|---|
| **D** | $< 8\,800\,000$ | Fail / Poor performance | Track Lost / Clear |
| **C** | $8\,800\,000 - 8\,999\,999$ | Minimum clear threshold | Track Lost / Clear |
| **B** | $9\,000\,000 - 9\,199\,999$ | Intermediate grade | Track Lost / Clear |
| **A** | $9\,200\,000 - 9\,499\,999$ | Upper-intermediate grade | Track Lost / Clear |
| **AA** | $9\,500\,000 - 9\,799\,999$ | Advanced clear grade | Clear / FR |
| **EX** | $9\,800\,000 - 9\,899\,999$ | Expert grade | Clear / FR |
| **EX+** | $9\,900\,000 - 9\,999\,999$ | Master grade | Clear / FR |
| **PM** | $\ge 10\,000\,000$ | **Pure Memory** ($10\,000\,000 + \text{Shiny}$) | **Strictly Far = 0, Lost = 0 (`clear_type = 3`)** |

### Potential Rating (PTT) System — Modern B50 Formula

> [!IMPORTANT]
> **Celest Server uses the modern B50 (Best 50) potential formula.** The legacy B30 (Best 30 + Recent 10) formula is deprecated and no longer relevant in this ecosystem.

1. **Chart Play Rating (Single Play)**:
   - For $\text{Score} \ge 10\,000\,000$ (PM):
     $$\text{Rating} = \text{Chart Constant} + 2.0$$
   - For $9\,800\,000 \le \text{Score} < 10\,000\,000$ (EX/EX+):
     $$\text{Rating} = \text{Chart Constant} + 1.0 + \frac{\text{Score} - 9\,800\,000}{200\,000}$$
   - For $\text{Score} < 9\,800\,000$:
     $$\text{Rating} = \max\left(0, \text{Chart Constant} + \frac{\text{Score} - 9\,500\,000}{300\,000}\right)$$
   *(+0.2 Clear Bonus applied when $\text{clear\_type} \neq 0$)*.

2. **User Profile Potential (`rating_ptt`)**:
   - Modern B50 calculates player potential from their **Top 50 best song play ratings**:
     $$\text{User PTT} = \frac{\sum_{i=1}^{50} \text{Rating}_i}{50}$$
   - In active Celest server configuration (`Config.BEST10_WEIGHT = 1/60, Config.BEST50_WEIGHT = 1/60`):
     $$\text{Celest PTT} = \frac{\sum_{i=1}^{10} \text{Rating}_i + \sum_{i=1}^{50} \text{Rating}_i}{60}$$
   - Stored with 3-decimal float precision in the SQLite database (`user.rating_ptt`).

---

## Automated Integrity Verification Suites (`celest-audit --check`)

The integrity audit verifies 8 comprehensive suites before packaging or pushing updates:
1. **Poin 1**: Songlist & Difficulty Completeness (Mandatory 0.aff, 1.aff, 2.aff base diffs).
2. **Poin 2**: Mandatory Song Asset Structure (`base.ogg`, `preview.ogg`, 4 JPEG RGB jackets, valid `bg`).
3. **Poin 3**: AffParser Supported Syntax & Extended Lanes (-3..6, decimal floats, negative BPM).
4. **Poin 4**: AffParser Prohibited Elements (Zero BPM division-by-zero, extreme BPM Scudo OOM).
5. **Poin 5**: Arc & Hold Minimum Duration Normalization (0ms Arcs & $\le$1ms Holds).
6. **Poin 6**: Hot Reload Server & Remote Download Sync (`date` timestamps and cache sync).
7. **Poin 7**: Unlocks Integrity & Beyond (`ratingClass: 3`) Prohibition & History Tracking.
8. **Poin 8**: Economic Statistics & Progression Tracking (Fragments, Memories, B50 Potential).


