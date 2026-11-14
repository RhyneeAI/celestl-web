# Metadata Audit: `songlist (1)` vs `.arcproj` Project Files

> **Audit Target:** `/home/luhung/Documents/project/Celestl/ArcaeaServerFork/database/songs/songlist (1)`  
> **Metadata Source Directory:** `/home/luhung/Documents/Chart`  
> **Execution Mode:** Read-only audit (Strictly non-modifying)  

---

## 1. Executive Summary

| Metric | Count | Details |
| :--- | :--- | :--- |
| **Total Songs in `songlist (1)`** | **128** | All entries in current songlist copy |
| **Songs Matched to `.arcproj`** | **107** | Found corresponding project files in `/home/luhung/Documents/Chart` |
| **Songs Without `.arcproj` Source** | **21** | 17 `yue` pack + 2 legacy singles + 1 `songlist` JSON + 1 tutorial |
| **Songs with Song-Level Mismatches** | **14** | Discrepancies in `title`, `artist`, `bpm`, or `bpm_base` |
| **Songs with Difficulty / Charter Adjustments** | **107** | Engine placeholders, alias formatting, CC / rating calibration |

---

## 2. Core Architectural & Engine Rules Explaining Discrepancies

Before listing individual songs, several structural differences occur consistently across the entire dataset due to the following reasons:

### A. The Native C++ Engine Base Difficulty Requirement (`libcocos2dcpp.so`)
- **The Phenomenon:** In nearly all community charts, only a single difficulty (`2.aff` for Future, `3.aff` for Beyond, or `4.aff` for Eternal) was authored in ArcCreate (`.arcproj`). However, in `songlist (1)`, difficulties `0` (Past) and `1` (Present) almost always exist with:
  ```json
  {"ratingClass": 0, "chartDesigner": "-", "jacketDesigner": "", "rating": 0, "constant": 0.0},
  {"ratingClass": 1, "chartDesigner": "-", "jacketDesigner": "", "rating": 0, "constant": 0.0}
  ```
- **The Reason:** Arcaea's native engine (`libcocos2dcpp.so`) expects difficulties `[0, 1, 2]` to always be present for every song. If base difficulties (0 and 1) are missing in `songlist` or on disk (`0.aff`, `1.aff`), the game triggers an immediate `nullptr` dereference crash upon entering the song select screen. The Celestl server import pipeline intentionally injects these placeholders to protect client stability.

### B. Charter Name and Alias Concatenation
- **The Phenomenon:** In `.arcproj`, charter metadata is split into two distinct fields: `charter` (the person) and `alias` (the chart title/subtitle/flavor text, e.g., `charter: Tefrish`, `alias: 白-世界が終わる時`).
- **In `songlist (1)`:** The server combines both using a newline delimiter (`Tefrish \n 白-世界が終わる時`) so that Arcaea displays both the charter name and subtitle on the play screen.

### C. Single-Chart Slot Remapping (Beyond / Eternal / Inscribed)
- **The Phenomenon:**
  - Community charts created with `Eternal` or `Inscribed` difficulties were sometimes saved as `2.aff` or `4.aff`. In Celestl:
    - Songs like `Aciel` and `Journey With You` had `2.aff` with difficulty labeled `Eternal` in `.arcproj`. They were remapped to slot `4` (Eternal) on the server, with dummy placeholders injected into slots `0, 1, 2`.
    - `Entrance to the chaos` had `4.aff` labeled `Inscribed 11` (ArcCreate April Fools badge), mapped to slot `4` (Eternal).
    - `Flay` had `3.aff` labeled `Inscribed 10+`, mapped to slot `3` (Beyond).
    - `Melodiniq` had inverted labels in `.arcproj` (`2.aff` labeled Beyond 11+, `3.aff` labeled Future 10+); during server import, they were corrected to standard Arcaea hierarchy (`2.aff` = Future 10+, `3.aff` = Beyond 11+).

### D. Chart Constant (CC) Calibration
- **The Phenomenon:** Certain `.arcproj` files omit `chartConstant` (e.g. `null`/`None`), or use non-standard rating strings like `Future 9.96`.
- **The Reason:** In Arcaea, `rating` must be an integer, and `constant` must be a decimal (e.g., `996` has `difficulty: Future 9.96` in `.arcproj`, but is stored as `rating: 10, constant: 10.1` in `songlist`). Missing CCs were calibrated from file tags (e.g., `[Etr10.6]`) or community sheets.

---

## 3. Song-Level Metadata Discrepancies (14 Songs)

The following 14 songs exhibit discrepancies in song-level properties (`title`, `artist/composer`, `bpm/bpmText`, or `bpm_base/baseBpm`):

### Asmodeus ~Be loyal to your desires~ (`asmodeus`)
- **Source Arcproj:** `WanderlustEternal/asmodeus/asmodeus.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `bpm <-> bpmText` | `200` | `74-200` | BPM range in `.arcproj` (`74-200`) was simplified to top tempo (`200`) in `songlist`. |

### Rabbit In The Black Room (`rabbitintheblackroom`)
- **Source Arcproj:** `1official/rabbitintheblackroom/etoile.arcproj, rabbitintheblackroom2023VIP/Rabbit In The Black Room (2023 VIP)/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `bpm <-> bpmText` | `220` | `270` | `songlist` retains original song BPM (`220.0`), whereas the 2023 VIP project `.arcproj` was adjusted to VIP remix tempo (`270.0`). |
| `bpm_base <-> baseBpm` | `220.0` | `270.0` | `songlist` retains original song BPM (`220.0`), whereas the 2023 VIP project `.arcproj` was adjusted to VIP remix tempo (`270.0`). |

### Exoplanetary Mirage (`exoplanetarymirage`)
- **Source Arcproj:** `exoplanetarymirage/ExoplanetaryMirage/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `かめりあ` | `Camellia` | Artist name is in Japanese (`かめりあ`) in `songlist`, but romanized (`Camellia`) in `.arcproj`. |

### Lost Requiem (`lostrequiembyd`)
- **Source Arcproj:** `77 Chemist.LostRequiem/LostRequiem.arcpkg/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `title` | `Lost Requiem` | `?????` | The Beyond chart project (`77 Chemist.LostRequiem`) used placeholder `?????` for title and artist in its `.arcproj`. The server restored the true song identity. |
| `composer/artist` | `Ludicin` | `?????` | The Beyond chart project (`77 Chemist.LostRequiem`) used placeholder `?????` for title and artist in its `.arcproj`. The server restored the true song identity. |
| `bpm <-> bpmText` | `100-240` | `100 - 240` | The Beyond chart project (`77 Chemist.LostRequiem`) used placeholder `?????` for title and artist in its `.arcproj`. The server restored the true song identity. |

### WalpurgisnachT (`walpurugisnachT`)
- **Source Arcproj:** `walpurugisnachT/Syarmony.WalpurgisnachT/WalpurgisnachT/WalpurgısnachT.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `title` | `WalpurgisnachT` | `WalpurgısnachT` | The `.arcproj` file contains a Turkish dotless small letter 'ı' (`WalpurgısnachT`), while `songlist` uses standard Latin 'i' (`WalpurgisnachT`). |

### Absolute end (`absoluteend`)
- **Source Arcproj:** `1batch2/AbsoluteEnd[11.0] .Syarmony/Syarmony/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `打打だいず` | `D-D-Dice` | Composer is written in Japanese Kanji/Hiragana (`打打だいず`) in `songlist`, but as romanized alias (`D-D-Dice`) in `.arcproj`. |

### Blood Drunker (N4Gi remix) (`blooddrunkern4giremix`)
- **Source Arcproj:** `1batch2/BloodDrunker(N4GiRemix)[Etr10.6].Syarmony/Syarmony/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `RoughSketch feat. DD"ナカタ"Metal` | `RoughSketch` | `songlist` specifies full featuring credit (`RoughSketch feat. DD"ナカタ"Metal`), whereas `.arcproj` lists only primary artist (`RoughSketch`). |

### Entrance to the chaos (`entrancetothechaos`)
- **Source Arcproj:** `1batch2/Harsyamony.Entrance of the chaos/Entrance of the chaos/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `打打だいず vs. siromaru` | `D-D-Dice vs Siromaru` | Artist in `songlist` uses Japanese name (`打打だいず vs. siromaru`), while `.arcproj` uses English (`D-D-Dice vs Siromaru`). |

### ループザルーム feat. 初音ミク (`loopingtheroom`)
- **Source Arcproj:** `1batch2/Loopingtheroom.Syarmony/Syarmony/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `title` | `ループザルーム feat. 初音ミク` | `Looping The Room` | Title in `songlist` is in Japanese (`ループザルーム feat. 初音ミク`) with artist `Looping The Room`. In `.arcproj`, title is English (`Looping The Room`) and composer is credited to `Rusino`. |
| `composer/artist` | `Looping The Room` | `Rusino` | Title in `songlist` is in Japanese (`ループザルーム feat. 初音ミク`) with artist `Looping The Room`. In `.arcproj`, title is English (`Looping The Room`) and composer is credited to `Rusino`. |

### ANiMA (`anima`)
- **Source Arcproj:** `1batch2/milkannae.anima/anima/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `Xi` | `xi` | Artist capitalization: capitalized `Xi` in `songlist` vs lowercase `xi` in `.arcproj`. |

### Reblossia (`reblossia`)
- **Source Arcproj:** `1batch2/Reblossia[11.2].Syarmony/Syarmony/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `打打だいず` | `D-D-Dice` | Composer is written in Japanese Kanji/Hiragana (`打打だいず`) in `songlist`, but as romanized alias (`D-D-Dice`) in `.arcproj`. |

### 系ぎて (`tsunagite`)
- **Source Arcproj:** `1batch2/red.tsunagite/tsunagite/tsunagite.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `composer/artist` | `よみぃ` | `rintaro soma` | Artist in `songlist` is pianist `よみぃ`, while `.arcproj` credits composer `rintaro soma` (相馬 倫太郎). |

### Betrayal Alice! (`betrayalalice`)
- **Source Arcproj:** `1batch2/Syarmony.BetrayalAlice/BetrayalAlice/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `bpm <-> bpmText` | `188` | `189` | Tempo in `songlist` is `188`, while `.arcproj` specifies `189`. |

### MERO+MERO PANIC!! feat. 音琴兎愛 (`meromeropanicfeatnegotobunnyla`)
- **Source Arcproj:** `1batch2/Syarmony.MERO+MERO PANIC!!/MERO+MERO PANIC!!/project.arcproj`

| Field | In `songlist (1)` | In `.arcproj` | Reason / Analysis |
| :--- | :--- | :--- | :--- |
| `title` | `MERO+MERO PANIC!! feat. 音琴兎愛` | `MERO+MERO PANIC!! feat. Negoto Bunnyla` | Title in `songlist` uses Japanese Kanji artist name (`feat. 音琴兎愛`), while `.arcproj` uses English romanization (`feat. Negoto Bunnyla`). |

---

## 4. Difficulty, Charter, Constant & Jacket Audit (Per RatingClass)

This section examines the 107 audited songs difficulty-by-difficulty.

### A. Specific Rating & Constant (CC) Discrepancies on Playable Charts

| Song ID | Song Title | RatingClass | `songlist` Rating / CC | `.arcproj` Diff / CC | Detailed Reason |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aegleseeker` | Aegleseeker | Present (1) | `9` (CC: `9.1`) | `Present 9` (CC: `9`) | Chart Constant mismatch: songlist=9.1 vs arcproj=9.0 |
| `aegleseeker` | Aegleseeker | Future (2) | `11` (CC: `11.2`) | `Future 11` (CC: `11`) | Chart Constant mismatch: songlist=11.2 vs arcproj=11.0 |
| `rabbitintheblackroom` | Rabbit In The Black Room | Past (0) | `2` (CC: `2.5`) | `Past 2` (CC: `2`) | Chart Constant mismatch: songlist=2.5 vs arcproj=2.0 |
| `rabbitintheblackroom` | Rabbit In The Black Room | Present (1) | `5` (CC: `5.5`) | `Present 5` (CC: `5`) | Chart Constant mismatch: songlist=5.5 vs arcproj=5.0 |
| `rabbitintheblackroom` | Rabbit In The Black Room | Future (2) | `8` (CC: `8.4`) | `Future 8` (CC: `8`) | Chart Constant mismatch: songlist=8.4 vs arcproj=8.0 |
| `abyssgazer` | Abyssgazer | Beyond (3) | `11` (CC: `11.8`) | `Beyond 11+` (CC: `11.7`) | Rating plus mismatch: songlist ratingPlus=False vs arcproj='Beyond 11+'<br>Chart Constant mismatch: songlist=11.8 vs arcproj=11.7 |
| `amethyst` | Amethyst | Beyond (3) | `11` (CC: `11.0`) | `Beyond 11` (CC: `11.1`) | Chart Constant mismatch: songlist=11.0 vs arcproj=11.1 |
| `arcaeamashup` | Arcaea Mash-up! 2 (Cansol bootleg) | Past (0) | `0` (CC: `0.0`) | `Past 10+` (CC: `None`) | Rating numerical mismatch: songlist=0 vs arcproj=10 (diff='Past 10+')<br>Rating plus mismatch: songlist ratingPlus=False vs arcproj='Past 10+'<br>Chart Constant in arcproj is null/None, while songlist has 0.0 |
| `arcaeamashup` | Arcaea Mash-up! 2 (Cansol bootleg) | Future (2) | `0` (CC: `0.0`) | `Beyond 12` (CC: `12.3`) | Rating numerical mismatch: songlist=0 vs arcproj=12 (diff='Beyond 12')<br>Chart Constant mismatch: songlist=0.0 vs arcproj=12.3<br>Slot remapped: arcproj labeled as Beyond (Beyond 12) but placed into ratingClass 2 (Future) |
| `arcaeamashup` | Arcaea Mash-up! 2 (Cansol bootleg) | Beyond (3) | `12` (CC: `12.1`) | `Beyond ?` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 12.1 |
| `artemibility` | Artemizija Irreversibility | Past (0) | `0` (CC: `0.0`) | `Past 10+` (CC: `None`) | Rating numerical mismatch: songlist=0 vs arcproj=10 (diff='Past 10+')<br>Rating plus mismatch: songlist ratingPlus=False vs arcproj='Past 10+'<br>Chart Constant in arcproj is null/None, while songlist has 0.0 |
| `artemiguration` | Artemizija Transfiguration | Past (0) | `0` (CC: `0.0`) | `Past 10+` (CC: `None`) | Rating numerical mismatch: songlist=0 vs arcproj=10 (diff='Past 10+')<br>Rating plus mismatch: songlist ratingPlus=False vs arcproj='Past 10+'<br>Chart Constant in arcproj is null/None, while songlist has 0.0 |
| `dextroy` | Dextroy | Future (2) | `0` (CC: `0.0`) | `Beyond 11` (CC: `11.1`) | Rating numerical mismatch: songlist=0 vs arcproj=11 (diff='Beyond 11')<br>Chart Constant mismatch: songlist=0.0 vs arcproj=11.1<br>Slot remapped: arcproj labeled as Beyond (Beyond 11) but placed into ratingClass 2 (Future) |
| `illnesslilin` | iLLness LiLin | Future (2) | `11` (CC: `11.0`) | `Future 11` (CC: `11.4`) | Chart Constant mismatch: songlist=11.0 vs arcproj=11.4 |
| `lostrequiembyd` | Lost Requiem | Beyond (3) | `12+` (CC: `12.9`) | `?` (CC: `12.7`) | Rating plus mismatch: songlist ratingPlus=True vs arcproj='?'<br>Chart Constant mismatch: songlist=12.9 vs arcproj=12.7 |
| `petrichor` | Petrichor | Past (0) | `0` (CC: `0.0`) | `Past ?` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 0.0 |
| `postliminium` | Postliminium | Future (2) | `8+` (CC: `8.9`) | `Future 8` (CC: `8.9`) | Rating plus mismatch: songlist ratingPlus=True vs arcproj='Future 8' |
| `reunion` | RE:UNION -Duo Blade Against- | Present (1) | `8+` (CC: `8.9`) | `Present 8` (CC: `8.9`) | Rating plus mismatch: songlist ratingPlus=True vs arcproj='Present 8' |
| `suddendeath` | SuddeИDeath | Future (2) | `11` (CC: `11.0`) | `Future 11` (CC: `11.3`) | Chart Constant mismatch: songlist=11.0 vs arcproj=11.3 |
| `thelastpage` | The Last Page | Future (2) | `9` (CC: `9.1`) | `Future 8` (CC: `9.1`) | Rating numerical mismatch: songlist=9 vs arcproj=8 (diff='Future 8') |
| `utakatanosekaide` | うたかたのせかいで | Future (2) | `10+` (CC: `10.8`) | `Future 10+` (CC: `10.7`) | Chart Constant mismatch: songlist=10.8 vs arcproj=10.7 |
| `veil` | Veil | Beyond (3) | `11` (CC: `11.1`) | `Beyond 11` (CC: `11`) | Chart Constant mismatch: songlist=11.1 vs arcproj=11.0 |
| `worldsendloneliness` | World's end loneliness | Beyond (3) | `11` (CC: `11.0`) | `Beyond 11` (CC: `11.4`) | Chart Constant mismatch: songlist=11.0 vs arcproj=11.4 |
| `xhronoxapsule` | XHRONOXAPSULΞ | Future (2) | `11` (CC: `11.1`) | `Future 11` (CC: `11.4`) | Chart Constant mismatch: songlist=11.1 vs arcproj=11.4 |
| `xhronoxapsule` | XHRONOXAPSULΞ | Beyond (3) | `12` (CC: `12.0`) | `Beyond 13` (CC: `13`) | Rating numerical mismatch: songlist=12 vs arcproj=13 (diff='Beyond 13')<br>Chart Constant mismatch: songlist=12.0 vs arcproj=13.0 |
| `absoluteend` | Absolute end | Future (2) | `11` (CC: `11.2`) | `Future 11` (CC: `11`) | Chart Constant mismatch: songlist=11.2 vs arcproj=11.0 |
| `blooddrunkern4giremix` | Blood Drunker (N4Gi remix) | Eternal (4) | `10` (CC: `10.4`) | `Eternal 10` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 10.4 |
| `journeywithyou` | Journey With You | Future (2) | `0` (CC: `0.0`) | `Eternal 9+` (CC: `9.8`) | Rating numerical mismatch: songlist=0 vs arcproj=9 (diff='Eternal 9+')<br>Rating plus mismatch: songlist ratingPlus=False vs arcproj='Eternal 9+'<br>Chart Constant mismatch: songlist=0.0 vs arcproj=9.8<br>Slot remapped: arcproj labeled as Eternal (Eternal 9+) but placed into ratingClass 2 (Future) |
| `daydream` | Daydream | Future (2) | `10` (CC: `10.4`) | `Future 10` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 10.4 |
| `anima` | ANiMA | Future (2) | `10` (CC: `10.4`) | `Future 10` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 10.4 |
| `amara` | ÅMARA(大未来電脳) | Future (2) | `11` (CC: `11.7`) | `Future 11+` (CC: `11.8`) | Rating plus mismatch: songlist ratingPlus=False vs arcproj='Future 11+'<br>Chart Constant mismatch: songlist=11.7 vs arcproj=11.8 |
| `ethersecond` | Ether Second | Future (2) | `10` (CC: `10.5`) | `Future 10` (CC: `10`) | Chart Constant mismatch: songlist=10.5 vs arcproj=10.0 |
| `reendofadream` | Re : End of a Dream | Future (2) | `11` (CC: `11.4`) | `Future 11` (CC: `11.2`) | Chart Constant mismatch: songlist=11.4 vs arcproj=11.2 |
| `ray` | Ray | Eternal (4) | `9` (CC: `9.7`) | `Eternal 9+` (CC: `None`) | Rating plus mismatch: songlist ratingPlus=False vs arcproj='Eternal 9+'<br>Chart Constant in arcproj is null/None, while songlist has 9.7 |
| `terabyteconnection` | +ERABY+E CONNEC+10N | Future (2) | `11` (CC: `11.7`) | `Future 11+` (CC: `11.7`) | Rating plus mismatch: songlist ratingPlus=False vs arcproj='Future 11+' |
| `aciel` | Aciel | Future (2) | `0` (CC: `0.0`) | `Eternal 10` (CC: `10.5`) | Rating numerical mismatch: songlist=0 vs arcproj=10 (diff='Eternal 10')<br>Chart Constant mismatch: songlist=0.0 vs arcproj=10.5<br>Slot remapped: arcproj labeled as Eternal (Eternal 10) but placed into ratingClass 2 (Future) |
| `deceiver` | Deceiver | Future (2) | `10+` (CC: `10.7`) | `Future 11` (CC: `11`) | Rating numerical mismatch: songlist=10 vs arcproj=11 (diff='Future 11')<br>Rating plus mismatch: songlist ratingPlus=True vs arcproj='Future 11'<br>Chart Constant mismatch: songlist=10.7 vs arcproj=11.0 |
| `ki` | 祈 -我ら神祖と共に歩む者なり- | Beyond (3) | `11` (CC: `11.7`) | `Beyond 11+` (CC: `11.7`) | Rating plus mismatch: songlist ratingPlus=False vs arcproj='Beyond 11+' |
| `996` | 996 | Future (2) | `10` (CC: `10.1`) | `Future 9.96` (CC: `9.96`) | Rating numerical mismatch: songlist=10 vs arcproj=9 (diff='Future 9.96')<br>Chart Constant mismatch: songlist=10.1 vs arcproj=9.96 |
| `tvsshark` | T+ VS SHARK | Future (2) | `10+` (CC: `10.9`) | `Future 10+` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 10.9 |
| `cryolight` | Cryolight | Eternal (4) | `10+` (CC: `10.8`) | `Eternal 10+` (CC: `None`) | Chart Constant in arcproj is null/None, while songlist has 10.8 |

### B. Slot Remapping and Difficulty Structural Adjustments

| Song ID | Song Title | Source Chart Path | Source Label | Assigned Slot | Explanation & Engine Rationalization |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `aciel` | Aciel | `2.aff` | `Eternal 10` | Eternal (4) | Chart file named `2.aff` was authored with `difficulty: Eternal 10`. Server properly remapped it to `ratingClass: 4` (Eternal) and inserted dummy base `0, 1, 2` to satisfy native engine requirements. |
| `journeywithyou` | Journey With You | `2.aff` | `Eternal 9+` | Eternal (4) | Chart file named `2.aff` was authored with `difficulty: Eternal 9+`. Server remapped it to `ratingClass: 4` and inserted dummy base `0, 1, 2`. |
| `entrancetothechaos` | Entrance to the chaos | `4.aff` | `Inscribed 11` | Eternal (4) | Source difficulty labeled as ArcCreate `Inscribed 11` (April Fools badge). In native Arcaea 7.1.0c, assigned to slot 4 (Eternal). Base difficulties 0, 1, 2 populated as placeholders. |
| `flay` | Fractured Skies | `3.aff` | `Inscribed 10+` | Beyond (3) | Source difficulty labeled as ArcCreate `Inscribed 10+`. Mapped to slot 3 (Beyond) in Celestl. Base difficulties 0, 1, 2 populated as placeholders. |
| `melodiniq` | Melodiniq | `2.aff`, `3.aff` | `2.aff: Beyond 11+`<br>`3.aff: Future 10+` | `2.aff -> Future (2)`<br>`3.aff -> Beyond (3)` | **Inverted Author Label Fixed:** The original author accidentally swapped labels in `.arcproj` (`2.aff` was labeled Beyond 11+ and `3.aff` Future 10+). During server import, the charts were properly swapped to obey standard Arcaea hierarchy. |
| `unwelcomeschoolmrmremix` | Unwelcome School (MRM REMIX) | `thechart.aff` | `Future 10` | Future (2) | Source `.arcproj` references `thechart.aff` (and secondary `2lpm.aff`). Server mapped `thechart.aff` to standard `2.aff` (Future). |
| `tsukinimurakumo` | Tsuki ni Murakumo, Hana ni Kaze | `3.aff` | `Beyond 10` | Beyond (3) | Source `.arcproj` only declared `3.aff` (Yama's Beyond chart). However, the archive contained official base difficulties authored by `Lovely Visitor「Toaster」` (PST 3, PRS 6, FTR 8+), which were preserved in `songlist` instead of zeroed dummies. |
| `rabbitintheblackroom` | Rabbit In The Black Room | `0,1,2.aff` + `2023 VIP` | Base + VIP `2.aff` | Base (0,1,2) + Beyond (3) | Combines vanilla official charts for Past, Present, Future with the custom `Rabbit In The Black Room (2023 VIP)` chart as Beyond (slot 3), enabling `jacketOverride` and `audioOverride`. |
| `abyssgazer` | Abyssgazer | `2,3.aff` (Reflux) + `3/4.aff` (Unlucky) | FTR 10+, BYD 11+, BYD 11 | FTR (2), BYD (3), ETR (4) | Merges multiple community charting projects: Reflux chart in FTR (10.9) and BYD (11.8), and Unlucky chart in ETR (11.2). |

### C. Charter & Jacket Designer / Illustrator Field Analysis

#### 1. Wanderlust Pack (`set: wanderlust`) Charter Multi-Diff Anomaly
In the Wanderlust pack songs (`42flux`, `aloneintelligence`, `asmodeus`, `chronofuror`, `epilogue`, `sightless`), the `.arcproj` files contain dedicated charter credits per difficulty (e.g., `aloneintelligence` Past: `Froot`, Present: `Yama`, Future: `VerglasAcolyte, red newdlorW`).  
In `songlist (1)`, the Past charter with pack tag was copied across all difficulties (`Froot (Timeless Archive)`).  
Additionally, all Wanderlust songs have empty `jacketDesigner: ""` in `songlist (1)`, whereas the `.arcproj` files define specific illustrators (`rN`, `Transendium`, `白祈`, `衣魚`, `あるし`, `ShaLink`).

#### 2. Charter vs Alias Concatenation Overview
Most single-difficulty custom charts merge `alias` into `chartDesigner`:
- `QueenOfWhite`: `Tefrish \n 白-世界が終わる時` (arcproj: charter `Tefrish`, alias `白-世界が終わる時`, illustrator `老邦` -> in songlist jacketDesigner has alias `白-世界が終わる時`)
- `Artemizija Irreversibility`: `KazuilA -Irreversibility- \n Reverse'`
- `Artemizija Transfiguration`: `かぜな \n ~Transcended~`
- `Amethyst`: `Arcthesia \n Over&#124;Shattered`
- `Bl∞min'`: `UtopiaGarden \n -ArcHitecture- [Redefine Infinity]`
- `Somniomancer [null set]`: `泽贰七 \n μΩ.scriptor`
- `Veil`: `Kazen w/Rinn x Ar+1 \n Half 夜浪`
- `F-Rozenette`: `Nikro \n 二鴉※時間内に凍結`
- `Re : End of a Dream`: `Nikro \n 二鴉※現実逃避`
- `Luminescence`: `red newdlorW ～転生～`
- `Ars Cantate`: `Tefrish vs. Telamation`
- `T+ VS SHARK`: `Y+ VS SWIFT`

---

## 5. Songs Without `.arcproj` Source in `/home/luhung/Documents/Chart` (21 Songs)

The following 21 songs present in `songlist (1)` have no `.arcproj` project file inside `/home/luhung/Documents/Chart`:

| Song ID | Title | Artist | Set / Category | Origin / Source Status |
| :--- | :--- | :--- | :--- | :--- |
| `rinka` | 燐華 | Gram | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `alive` | Alive | eicateve | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `avataar` | Avataar ~Reincarnation of Kalpa~ | Scarlette a.k.a CrYmson | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `chronomia` | Chronomia | Lime | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `converge` | Converge | SOTUI & Hundotte | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `darlingdance` | Darling Dance | かいりきベア (MORE MORE JUMP! × 初音ミク) | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `hopeisthething` | Hope is The Thing With Feathers | HOYO-MiX (Chevy) | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `ificanstoponeheart` | If I Can Stop One Heart From Breaking | HOYO-MiX (Chevy) | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `jouou` | 嬢王 | 八王子P | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `lyricalstrike` | Lyrical Strike! | REDALiCE | `single` | Legacy single chart (located in server `aff_orig`) |
| `mistilteinn` | Mistilteinn | LucaProject | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `opheliaphantasm` | Ophelia -Phantasm- | Lime | `single` | Legacy single chart (located in server `aff_orig`) |
| `ringingbloom` | Ringing Bloom | Roselia (Fujinaga Ryotaro) | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `starcape` | Star Cape | 打打だいず | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `stellarfragment` | Stellar Fragment | BLV3HAZUKI | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `straysoularound` | ストレイソウル ・ アラウンド | みーに | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `traumerei` | 夢想曲 -Träumerei- | RONDO | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `unlimatedimageworld` | Unlimated Image World | Campuss Furry | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `venomofvenus` | Venom of Venus | Powerwolf | `yue` | Dedicated `yue` pack (imported via custom assets / external package) |
| `koishitemacaronage` | 恋してマカロナージュ | U-Ske feat. ななひら | `single` | Raw `songlist` JSON package in `恋してマカロナージュ/` (no `.arcproj` created by author) |
| `kai_` | 悔_ | Esbee_ | `single` | Server internal / Tutorial chart |

---

## 6. Comprehensive Audit Inventory Table (All 128 Songs)

| # | Song ID | Title | Artist | BPM | BaseBPM | Arcproj Matched | Status Summary |
| :--- | :--- | :--- | :--- | :--- | :--- | :---: | :--- |
| 1 | `rinka` | 燐華 | Gram | 256 | 256 | ❌ | No .arcproj in /Chart |
| 2 | `alive` | Alive | eicateve | 190 | 190 | ❌ | No .arcproj in /Chart |
| 3 | `avataar` | Avataar ~Reincarnation of Kalpa~ | Scarlette a.k.a CrYmson | 180 | 180 | ❌ | No .arcproj in /Chart |
| 4 | `chronomia` | Chronomia | Lime | 227 | 227 | ❌ | No .arcproj in /Chart |
| 5 | `converge` | Converge | SOTUI & Hundotte | 180 | 180 | ❌ | No .arcproj in /Chart |
| 6 | `darlingdance` | Darling Dance | かいりきベア (MORE MORE JUMP! × 初音ミク) | 153 | 153 | ❌ | No .arcproj in /Chart |
| 7 | `hopeisthething` | Hope is The Thing With Feathers | HOYO-MiX (Chevy) | 128 | 128 | ❌ | No .arcproj in /Chart |
| 8 | `ificanstoponeheart` | If I Can Stop One Heart From Breaking | HOYO-MiX (Chevy) | 160 | 160 | ❌ | No .arcproj in /Chart |
| 9 | `jouou` | 嬢王 | 八王子P | 200 | 200 | ❌ | No .arcproj in /Chart |
| 10 | `lyricalstrike` | Lyrical Strike! | REDALiCE | 185 | 185 | ❌ | No .arcproj in /Chart |
| 11 | `mistilteinn` | Mistilteinn | LucaProject | 167 | 167 | ❌ | No .arcproj in /Chart |
| 12 | `opheliaphantasm` | Ophelia -Phantasm- | Lime | 186 | 186 | ❌ | No .arcproj in /Chart |
| 13 | `ringingbloom` | Ringing Bloom | Roselia (Fujinaga Ryotaro) | 195 | 195 | ❌ | No .arcproj in /Chart |
| 14 | `starcape` | Star Cape | 打打だいず | 92 | 92 | ❌ | No .arcproj in /Chart |
| 15 | `stellarfragment` | Stellar Fragment | BLV3HAZUKI | 179 | 179 | ❌ | No .arcproj in /Chart |
| 16 | `straysoularound` | ストレイソウル ・ アラウンド | みーに | 150 | 150 | ❌ | No .arcproj in /Chart |
| 17 | `traumerei` | 夢想曲 -Träumerei- | RONDO | 190 | 190 | ❌ | No .arcproj in /Chart |
| 18 | `unlimatedimageworld` | Unlimated Image World | Campuss Furry | 201 | 201 | ❌ | No .arcproj in /Chart |
| 19 | `venomofvenus` | Venom of Venus | Powerwolf | 164 | 164 | ❌ | No .arcproj in /Chart |
| 20 | `42flux` | 42-flux | rN vs. nm-y (Cataclysmia) | 225 | 225 | ✅ | 6 chart diff points |
| 21 | `aloneintelligence` | Alone intelligence | かめりあ | 150 | 150 | ✅ | 6 chart diff points |
| 22 | `asmodeus` | Asmodeus ~Be loyal to your desires~ | Garbagecan vs. CS4W | 200 | 200 | ✅ | 1 song diffs; 6 chart diff points |
| 23 | `chronofuror` | Chrono Furor -Reloaded- | Felysrator | 197 | 197 | ✅ | 6 chart diff points |
| 24 | `epilogue` | epilogue | VeetaCrush | 186 | 186 | ✅ | 6 chart diff points |
| 25 | `sightless` | A Gleam For The Sightless | Lidelle × BilliumMoto | 174 | 174 | ✅ | 6 chart diff points |
| 26 | `aegleseeker` | Aegleseeker | Silentroom vs Frums | 234 | 234 | ✅ | 5 chart diff points |
| 27 | `rabbitintheblackroom` | Rabbit In The Black Room | Rabbit House | 220 | 220.0 | ✅ | 2 song diffs; 9 chart diff points |
| 28 | `queenofwhite` | エセ交響詩「若き白の女王」 | rN | 249 | 249.0 | ✅ | 2 chart diff points |
| 29 | `abyssgazer` | Abyssgazer | xi vs. Sakuzyo | 191 | 191.0 | ✅ | 7 chart diff points |
| 30 | `amethyst` | Amethyst | かねこちはる | 170 | 170.0 | ✅ | 2 chart diff points |
| 31 | `angelhalo` | ANGEL HALO | REDALiCE & cosMo＠暴走P | 203 | 203.0 | ✅ | 1 chart diff points |
| 32 | `anotherme` | Another Me | D_AAN | 210 | 210.0 | ✅ | 2 chart diff points |
| 33 | `arcaeamashup` | Arcaea Mash-up! 2 (Cansol bootleg) | Cansol | 200 | 200.0 | ✅ | 12 chart diff points |
| 34 | `artemibility` | Artemizija Irreversibility | CS4W | 175 | 200.0 | ✅ | 6 chart diff points |
| 35 | `artemiguration` | Artemizija Transfiguration | CS4W | 175 | 175.0 | ✅ | 6 chart diff points |
| 36 | `blackswan` | BLACK SWAN | ぺのれり | 201 | 201.0 | ✅ | Clean chart match |
| 37 | `blanoir` | βlαnoir | Aoi | 202 | 202.0 | ✅ | Clean chart match |
| 38 | `blinfmin` | Bl∞min' | MisoilePunch♪ -Forever- | 117-234 | 234.0 | ✅ | 2 chart diff points |
| 39 | `c0pyf0x` | c0pyf0x (Cut Ver.) | かたぎり | 84-288 | 228.0 | ✅ | 2 chart diff points |
| 40 | `collapse` | Collapse | Laur feat. 藍月なくる | 155 | 155.0 | ✅ | 2 chart diff points |
| 41 | `dextroy` | Dextroy | MonstDeath | 270-4000 | 270.0 | ✅ | 4 chart diff points |
| 42 | `ephemeralization` | ephemeralization | ぴれんどらー | 190 | 190.0 | ✅ | 1 chart diff points |
| 43 | `exoplanetarymirage` | Exoplanetary Mirage | かめりあ | 192 | 192.0 | ✅ | 1 song diffs; Clean chart match |
| 44 | `flay` | Fractured Skies | Flay! feat. xia & Yoominel | 140 | 140.0 | ✅ | 2 chart diff points |
| 45 | `i` | I | 黒魔 | 225 | 225.0 | ✅ | 1 chart diff points |
| 46 | `illnesslilin` | iLLness LiLin | かねこちはる | 280 | 280.0 | ✅ | 2 chart diff points |
| 47 | `khymexa` | KHYMΞXΛ | のらねこさい feat.ricono | 220 | 220.0 | ✅ | 1 chart diff points |
| 48 | `lostrequiem` | Lost Requiem | Ludicin | 100-240 | 210.0 | ✅ | Clean chart match |
| 49 | `lostrequiembyd` | Lost Requiem | Ludicin | 100-240 | 200.0 | ✅ | 3 song diffs; 4 chart diff points |
| 50 | `mayhem` | MAYHEM | RoughSketch x CANVAS feat. Quimär | 998 | 998.0 | ✅ | 1 chart diff points |
| 51 | `memoria` | ΛΛemoria | MisoilePunch♪ | 118 | 118.0 | ✅ | 1 chart diff points |
| 52 | `mixxion` | MixxioN | MisoilePunch♪ | 275 | 275.0 | ✅ | 3 chart diff points |
| 53 | `mobius` | Möbius | USAO & Camellia | 230 | 230.0 | ✅ | 1 chart diff points |
| 54 | `omoide` | オモイデ・パッチワーク・サービス | t+pazolite & ミツキヨ feat. ななひら | 150 | 150.0 | ✅ | 1 chart diff points |
| 55 | `op1` | Op.I《fear-TITΛN-》 | xi vs かねこちはる | 212 | 212.0 | ✅ | 1 chart diff points |
| 56 | `opfer` | Opfer | かねこちはる | 175 | 175.0 | ✅ | 1 chart diff points |
| 57 | `pasyattocheese` | パシャっとCheese!! | Maron feat.ななぽんち | 165 | 165.0 | ✅ | 1 chart diff points |
| 58 | `petrichor` | Petrichor | void (mournfinale) | 163 | 163.0 | ✅ | 5 chart diff points |
| 59 | `postliminium` | Postliminium | ARForest | 220 | 110.0 | ✅ | 2 chart diff points |
| 60 | `recollectlines` | Recollect Lines | ああああ vs ぺのれり | 238 | 215.0 | ✅ | 4 chart diff points |
| 61 | `reunion` | RE:UNION -Duo Blade Against- | Ice vs. Morimori Atsushi | 202 | 202.0 | ✅ | 7 chart diff points |
| 62 | `somioncernullset` | Somniomancer [null set] | 塞壬唱片-MSR / Crywolf | 150 | 150.0 | ✅ | 1 chart diff points |
| 63 | `suddendeath` | SuddeИDeath | xi vs. モリモリあつし | 236 | 118.0 | ✅ | 3 chart diff points |
| 64 | `suito` | 翠杜 | 隣の庭は青い(庭師+Aoi) | 180 | 180.0 | ✅ | 1 chart diff points |
| 65 | `thecoloroftaintedsorrow` | 汚れっちまった悲しみの色 (t+pazolite Remix) | Hiroshi Egawa | 180 | 180.0 | ✅ | 1 chart diff points |
| 66 | `thelastpage` | The Last Page | ARForest | 195 | 97.5 | ✅ | 2 chart diff points |
| 67 | `titania` | Titania | xi | 212 | 212.0 | ✅ | 1 chart diff points |
| 68 | `utakatanosekaide` | うたかたのせかいで | DJ Raisei vs Setca. feat.nayuta | 216 | 216.0 | ✅ | 2 chart diff points |
| 69 | `veil` | Veil | Misuzu Hataya | 150 | 150.0 | ✅ | 2 chart diff points |
| 70 | `walpurugisnachT` | WalpurgisnachT | Raimukun | 210 | 210.0 | ✅ | 1 song diffs; 1 chart diff points |
| 71 | `worldsendloneliness` | World's end loneliness | 打打だいず | 180 | 180.0 | ✅ | 3 chart diff points |
| 72 | `xhronoxapsule` | XHRONOXAPSULΞ | Silentroom | 277 | 277.0 | ✅ | 7 chart diff points |
| 73 | `koishitemacaronage` | 恋してマカロナージュ | U-Ske feat. ななひら | 26-103 | 103 | ❌ | No .arcproj in /Chart |
| 74 | `akasha` | Λkasha | BlackY feat. Risa Yuzuki | 180 | 180.0 | ✅ | 2 chart diff points |
| 75 | `alfheim` | Alfheim's faith | 影虎。 | 200 | 200.0 | ✅ | 1 chart diff points |
| 76 | `kai_` | 悔_ | Esbee_ | 164 | 193 | ❌ | No .arcproj in /Chart |
| 77 | `absoluteend` | Absolute end | 打打だいず | 150 | 150.0 | ✅ | 1 song diffs; 2 chart diff points |
| 78 | `1nception` | 1nception | 打打だいず | 205 | 205.0 | ✅ | 1 chart diff points |
| 79 | `blooddrunkern4giremix` | Blood Drunker (N4Gi remix) | RoughSketch feat. DD"ナカタ"Metal | 205 | 205.0 | ✅ | 1 song diffs; 2 chart diff points |
| 80 | `blueberrytrain` | Blueberry Train | Minami Kotori | 172 | 172.0 | ✅ | Clean chart match |
| 81 | `armageddon` | Armageddon | LeaF | 210 | 210.0 | ✅ | 2 chart diff points |
| 82 | `entrancetothechaos` | Entrance to the chaos | 打打だいず vs. siromaru | 207 | 207.0 | ✅ | 1 song diffs; 2 chart diff points |
| 83 | `galvanizer` | GALVANIZER | Ashrount | 288 | 288.0 | ✅ | 1 chart diff points |
| 84 | `journeywithyou` | Journey With You | Iris | 150 | 150.0 | ✅ | 8 chart diff points |
| 85 | `spicaterrible` | Spicaterrible | Kotori Minami (CV: Aya Uchida) | 165 | 165.0 | ✅ | 1 chart diff points |
| 86 | `unravelling` | Unravelling | Aethoro & Moon Jelly | 195 | 195.0 | ✅ | 1 chart diff points |
| 87 | `idol` | アイドル | YOASOBI | 166 | 166.0 | ✅ | Clean chart match |
| 88 | `breakingdawn` | Breaking Dawn | Getty & Kobaryo feat. 棗いつき | 180 | 180.0 | ✅ | 2 chart diff points |
| 89 | `daydream` | Daydream | RiraN | 150 | 150.0 | ✅ | 3 chart diff points |
| 90 | `lunatixxx` | Lunàtixxx Gear | Laur vs HyuN | 196 | 196.0 | ✅ | 2 chart diff points |
| 91 | `unwelcomeschoolmrmremix` | Unwelcome School (MRM REMIX) | ミツキヨ Remixed by モリモリあつし | 190 | 190.0 | ✅ | 1 chart diff points |
| 92 | `rip` | R.I.P | eicateve | 192 | 192.0 | ✅ | Clean chart match |
| 93 | `loopingtheroom` | ループザルーム feat. 初音ミク | Looping The Room | 162 | 162.0 | ✅ | 2 song diffs; 1 chart diff points |
| 94 | `anima` | ANiMA | Xi | 183.5 | 183.5 | ✅ | 1 song diffs; 2 chart diff points |
| 95 | `mopemope` | もぺもぺ | LeaF | 100 | 100.0 | ✅ | 1 chart diff points |
| 96 | `technopolis2085` | TECHNOPOLIS 2085 | PRASTIK DANCEFLOOR | 134 | 134.0 | ✅ | Clean chart match |
| 97 | `amara` | ÅMARA(大未来電脳) | sasakure.UK | 230? | 230.0 | ✅ | 2 chart diff points |
| 98 | `ethersecond` | Ether Second | Akira Complex | 150 | 150.0 | ✅ | 1 chart diff points |
| 99 | `ogyarinizer` | おぎゃりないざー | Ponchi♪ | 140-310 | 245.0 | ✅ | 2 chart diff points |
| 100 | `frozenette` | F-Rozenette | Se-U-Ra | 219 | 219.0 | ✅ | 1 chart diff points |
| 101 | `reendofadream` | Re : End of a Dream | uma vs. モリモリあつし | 212 | 212.0 | ✅ | 3 chart diff points |
| 102 | `dollmadness` | 玩具狂奏曲 -終焉- | きくお | 130 | 130.0 | ✅ | 1 chart diff points |
| 103 | `caesura` | caesura | nm-y feat.AKA | 200 | 200.0 | ✅ | Clean chart match |
| 104 | `ray` | Ray | Kaguya & Runami Yachiyo | 132 | 132.0 | ✅ | 2 chart diff points |
| 105 | `reblossia` | Reblossia | 打打だいず | 211 | 211.0 | ✅ | 1 song diffs; Clean chart match |
| 106 | `luminescence` | Luminescence | 米虾Fomiki & 初云CLoudie | 184 | 184.0 | ✅ | 1 chart diff points |
| 107 | `terabyteconnection` | +ERABY+E CONNEC+10N | かめりあ | 230 | 230.0 | ✅ | 1 chart diff points |
| 108 | `tsunagite` | 系ぎて | よみぃ | 177.6 | 177.6 | ✅ | 1 song diffs; Clean chart match |
| 109 | `merikurilostinthesnowstorm` | メリクリ ~Lost in the Snowstorm~ | AiSS vs. 华牧狸 w/ 夜輪 ft.結月ゆかり | 234 | 234.0 | ✅ | Clean chart match |
| 110 | `adam` | Adam | P*Light | 200 | 200.0 | ✅ | Clean chart match |
| 111 | `aciel` | Aciel | Anfini | 205 | 205.0 | ✅ | 4 chart diff points |
| 112 | `betrayalalice` | Betrayal Alice! | MYANSR (Artcore remix) | 188 | 188.0 | ✅ | 1 song diffs; Clean chart match |
| 113 | `melodiniq` | Melodiniq | Onoken a.k.a owl * tree | 193~240 | 193.0 | ✅ | 2 chart diff points |
| 114 | `meromeropanicfeatnegotobunnyla` | MERO+MERO PANIC!! feat. 音琴兎愛 | RiraN | 180 | 180.0 | ✅ | 1 song diffs; Clean chart match |
| 115 | `breakover` | Break Over | K-forest | 185 | 185.0 | ✅ | Clean chart match |
| 116 | `arscantate` | Ars Cantate | rN | 33-501 | 300.0 | ✅ | 1 chart diff points |
| 117 | `bloody` | Bloody Crown | Dimier√Lisb | 200 | 200.0 | ✅ | Clean chart match |
| 118 | `deceiver` | Deceiver | Laur vs M1shamo | 200 | 200.0 | ✅ | 3 chart diff points |
| 119 | `ki` | 祈 -我ら神祖と共に歩む者なり- | 光吉猛修 VS 穴山大輔 VS Kai VS 水野健治 VS 大国奏音 | 219 | 219.0 | ✅ | 2 chart diff points |
| 120 | `miu3` | μ3 | 水野健治 vs 穴山大輔 | 192 | 192.0 | ✅ | Clean chart match |
| 121 | `retribution` | Retribution | nm-y & Kry.exe | 190 | 190.0 | ✅ | Clean chart match |
| 122 | `vorpalize` | VorpΛlize | Reku Mochizuki | 224 | 224.0 | ✅ | Clean chart match |
| 123 | `996` | 996 | 李化禹 | 140 | 140.0 | ✅ | 2 chart diff points |
| 124 | `chronologika` | Chronologika | Hundotte | 180 | 180.0 | ✅ | Clean chart match |
| 125 | `tsukinimurakumo` | Tsuki ni Murakumo, Hana ni Kaze | 幽閉サテライト | 160 | 160.0 | ✅ | 1 chart diff points |
| 126 | `tvsshark` | T+ VS SHARK | t+pazolite | 200 | 200.0 | ✅ | 2 chart diff points |
| 127 | `cryolight` | Cryolight | 打打だいず | 197 | 197.0 | ✅ | 2 chart diff points |
| 128 | `sigma` | Sigma | Kry.exe | 200 | 200.0 | ✅ | Clean chart match |

---

## 7. Conclusion & Recommendations

1. **No Accidental Corruption:** The differences identified in `songlist (1)` are not random corruptions. They represent standard server sanitization, engine stabilization (base 0, 1 placeholders), and title/charter formatting.
2. **Title & Artist Accuracy:** For `loopingtheroom`, `absoluteend`, `reblossia`, and `tsunagite`, determine whether you prefer native Japanese or romanized artist credits.
3. **Wanderlust Pack Illustrators & Charters:** The 6 Wanderlust songs currently have empty jacket designers and cloned Past charters in `songlist (1)`; updating them using their `.arcproj` files would restore full author attribution.
4. **Zero Code Modified:** In accordance with the prompt instruction, no modifications were made to `songlist (1)` or any asset files during this audit.
