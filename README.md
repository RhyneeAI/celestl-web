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

