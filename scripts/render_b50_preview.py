import os
import json
import sqlite3
import math
from PIL import Image

def build_html(items, player_info):
    name = player_info.get("name", "AnisphiaaaUwU")
    user_code = player_info.get("userCode", "002000000")
    ptt = player_info.get("ptt", "12.668")
    b50 = player_info.get("b50", "12.668")
    b10 = player_info.get("b10", "12.742")
    date_str = "2026/09/18"
    
    # Generate cards HTML
    cards_html = []
    diff_styles = {
        0: "background: #1976d2; border-color: #64b5f6;",
        1: "background: #2e7d32; border-color: #81c784;",
        2: "background: #5c2482; border-color: #9b48d4;",
        3: "background: #8b1832; border-color: #d83458;",
        4: "background: #a31962; border-color: #e64598;"
    }
    
    lamp_styles = {
        "P": "background: linear-gradient(180deg, #137e9e 0%, #0c4d63 100%); box-shadow: inset 0 0 0 1px #2dd4bf, 0 2px 6px rgba(0,0,0,0.5);",
        "F": "background: linear-gradient(180deg, #741d7a 0%, #4c1150 100%); box-shadow: inset 0 0 0 1px #e879f9, 0 2px 6px rgba(0,0,0,0.5);",
        "C": "background: linear-gradient(180deg, #233162 0%, #151d3b 100%); box-shadow: inset 0 0 0 1px #60a5fa, 0 2px 6px rgba(0,0,0,0.5);",
        "E": "background: linear-gradient(180deg, #1b6338 0%, #114124 100%); box-shadow: inset 0 0 0 1px #4ade80, 0 2px 6px rgba(0,0,0,0.5);",
        "H": "background: linear-gradient(180deg, #991b1b 0%, #681111 100%); box-shadow: inset 0 0 0 1px #f87171, 0 2px 6px rgba(0,0,0,0.5);",
        "L": "background: linear-gradient(180deg, #374151 0%, #1f2937 100%); box-shadow: inset 0 0 0 1px #9ca3af, 0 2px 6px rgba(0,0,0,0.5);"
    }
    
    for item in items:
        rank = item["rank"]
        if item.get("empty"):
            card = f"""
            <div class="card empty-card">
              <div class="rank-tag">
                <span class="rank-num">#{rank}</span>
              </div>
              <div class="empty-dashes">—</div>
              <div class="title-strip">
                <span class="title-text">—</span>
              </div>
            </div>
            """
        else:
            title = item["title"]
            score = item["score"]
            pot = item["potential"]
            grade = item["grade"]
            diff_label = item["diff"]
            rc = item.get("rc", 2)
            lamp = item.get("lamp", "C")
            jacket_url = item.get("jacket", "/favicon.ico")
            
            diff_style = diff_styles.get(rc, diff_styles[2])
            lamp_style = lamp_styles.get(lamp, lamp_styles["C"])
            
            card = f"""
            <div class="card">
              <!-- Left Area: Rank, Potential, Grade -->
              <div class="left-col">
                <div class="rank-tag">
                  <span class="rank-num">#{rank}</span>
                </div>
                <div class="pot-label">POTENTIAL</div>
                <div class="pot-num">{pot}</div>
                <div class="pot-dots">· ·</div>
                <div class="grade-text">{grade}</div>
              </div>
              
              <!-- Right Area: Square Jacket (145x145) with Badges -->
              <div class="jacket-wrap">
                <img src="{jacket_url}" class="jacket-img" onerror="this.src='http://localhost:3000/storage/characters/0_icon.png'" />
                <div class="jacket-shade"></div>
                <div class="score-text">{score}</div>
                
                <!-- Diamond Level Badge -->
                <div class="lvl-diamond" style="{diff_style}">
                  <div class="lvl-text">{diff_label}</div>
                </div>
                
                <!-- Hexagon Clear Lamp Badge -->
                <div class="lamp-badge" style="{lamp_style}">
                  {lamp}
                </div>
              </div>
              
              <!-- Bottom Title Strip (Full card width) -->
              <div class="title-strip">
                <span class="title-text">{title}</span>
              </div>
            </div>
            """
        cards_html.append(card)

    all_cards = "\n".join(cards_html)
    
    html = f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Arcaea B50</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Exo+2:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,700;1,800;1,900&family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    * {{
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }}
    body {{
      background: #000;
      display: flex;
      justify-content: center;
      padding: 0;
      margin: 0;
      font-family: 'Exo 2', sans-serif;
      -webkit-font-smoothing: antialiased;
    }}
    
    /* 1445px Standard lowiro Canvas */
    #b50-export-canvas {{
      position: relative;
      width: 1445px;
      min-height: 2575px;
      overflow: hidden;
      background: #73808b;
    }}
    
    /* Blurred, Pale Desaturated Background */
    .bg-layer {{
      position: absolute;
      inset: -20px;
      z-index: 0;
      overflow: hidden;
    }}
    .bg-img {{
      width: calc(100% + 40px);
      height: calc(100% + 40px);
      object-fit: cover;
      object-position: center top;
      filter: blur(28px) saturate(0.35) brightness(1.22) contrast(0.88);
      transform: scale(1.05);
    }}
    .bg-overlay {{
      position: absolute;
      inset: 0;
      background: radial-gradient(ellipse at 50% 8%, rgba(246, 248, 244, 0.85) 0%, rgba(220, 228, 228, 0.75) 30%, rgba(140, 155, 168, 0.7) 65%, rgba(45, 48, 62, 0.85) 100%);
    }}
    .bg-vignette {{
      position: absolute;
      inset: 0;
      box-shadow: inset 0 0 140px rgba(18, 20, 32, 0.65);
      pointer-events: none;
    }}
    
    /* Translucent Glass Bokeh Spheres */
    .glass-sphere {{
      position: absolute;
      border-radius: 50%;
      pointer-events: none;
      z-index: 1;
      backdrop-filter: blur(4px);
      background: radial-gradient(circle at 35% 30%, rgba(255,255,255,0.48) 0%, rgba(255,255,255,0.06) 55%, rgba(180,205,215,0.18) 85%, rgba(255,255,255,0.38) 100%);
      box-shadow: inset 0 0 18px rgba(255,255,255,0.35), 0 6px 24px rgba(0,0,0,0.12);
    }}
    .sphere-1 {{
      width: 145px;
      height: 145px;
      top: 35px;
      left: 740px;
    }}
    .sphere-2 {{
      width: 95px;
      height: 95px;
      top: 80px;
      left: 865px;
    }}
    .sphere-3 {{
      width: 180px;
      height: 180px;
      top: 600px;
      left: -40px;
      opacity: 0.4;
    }}
    .sphere-4 {{
      width: 160px;
      height: 160px;
      bottom: 250px;
      right: -30px;
      opacity: 0.35;
    }}
    
    /* Side Golden Corner Brackets */
    .edge-bracket {{
      position: absolute;
      top: 50%;
      transform: translateY(-50%);
      width: 18px;
      height: 50px;
      z-index: 5;
      opacity: 0.65;
    }}
    .edge-bracket-left {{
      left: 14px;
    }}
    .edge-bracket-right {{
      right: 14px;
    }}

    /* HEADER (~270px) */
    .header {{
      position: relative;
      z-index: 10;
      height: 270px;
      width: 100%;
    }}
    
    /* Top Left Arcaea Logo */
    .logo-wrap {{
      position: absolute;
      top: 36px;
      left: 65px;
      z-index: 12;
    }}
    .arcaea-logo {{
      width: 270px;
      height: auto;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.45));
    }}
    
    /* Thin Gold/Cream Lines */
    .gold-lines {{
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 270px;
      pointer-events: none;
      z-index: 8;
    }}
    
    /* Center Nameplate Banner */
    .nameplate-container {{
      position: absolute;
      top: 88px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      z-index: 15;
    }}
    
    .nameplate-parallelogram {{
      position: relative;
      display: flex;
      align-items: center;
      width: 480px;
      height: 64px;
      transform: skewX(-14deg);
      background: linear-gradient(90deg, rgba(22, 25, 46, 0.95) 0%, rgba(32, 36, 64, 0.96) 100%);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.35);
      border: 1px solid rgba(224, 211, 182, 0.45);
      border-radius: 2px;
      padding-left: 20px;
      overflow: visible;
    }}
    
    /* Diagonal Stripe Pattern on Left of Nameplate */
    .nameplate-stripes {{
      position: absolute;
      top: 0;
      left: 0;
      width: 140px;
      height: 100%;
      background: repeating-linear-gradient(45deg, rgba(255,255,255,0.06), rgba(255,255,255,0.06) 2px, transparent 2px, transparent 8px);
      pointer-events: none;
      border-top-left-radius: 2px;
      border-bottom-left-radius: 2px;
    }}
    
    .player-name {{
      transform: skewX(14deg);
      color: #ffffff;
      font-size: 25px;
      font-weight: 500;
      letter-spacing: 0.02em;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 330px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.5);
    }}
    
    /* Diamond Avatar at right end of plate */
    .avatar-diamond-frame {{
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%) rotate(45deg);
      width: 58px;
      height: 58px;
      background: #ffffff;
      padding: 2px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.4), 0 0 0 2px rgba(255, 230, 240, 0.8);
      border-radius: 4px;
      overflow: hidden;
      z-index: 20;
    }}
    .avatar-diamond-inner {{
      position: relative;
      width: 100%;
      height: 100%;
      background: #0f1124;
      overflow: hidden;
      border-radius: 2px;
    }}
    .avatar-img {{
      position: absolute;
      inset: -25%;
      width: 150%;
      height: 150%;
      object-fit: cover;
      transform: rotate(-45deg);
    }}
    
    /* Potential & Star Pill under Avatar */
    .ptt-badge-group {{
      position: absolute;
      top: 158px;
      left: calc(50% + 220px);
      transform: translateX(-50%);
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 16;
    }}
    .ptt-value {{
      font-size: 27px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      text-shadow: 0 2px 4px rgba(0,0,0,0.6);
      letter-spacing: -0.02em;
    }}
    .star-pill {{
      margin-top: 3px;
      background: linear-gradient(90deg, #6b2259 0%, #88246d 100%);
      border: 1px solid #d8459e;
      border-radius: 9999px;
      padding: 1px 9px;
      font-size: 11px;
      color: #ffd76a;
      line-height: 1.2;
      box-shadow: 0 2px 6px rgba(0,0,0,0.4);
    }}
    
    /* Stats line below nameplate: ID, B50, B10 */
    .stats-line {{
      position: absolute;
      top: 162px;
      left: 50%;
      transform: translateX(-50%);
      display: flex;
      align-items: center;
      gap: 16px;
      color: #b9aed4;
      font-size: 13.5px;
      font-weight: 500;
      letter-spacing: 0.04em;
      z-index: 14;
      white-space: nowrap;
    }}
    .stat-sep {{
      opacity: 0.4;
    }}
    
    /* Top Right Timestamp */
    .timestamp-wrap {{
      position: absolute;
      top: 42px;
      right: 65px;
      text-align: right;
      z-index: 12;
    }}
    .timestamp-label {{
      font-size: 12px;
      color: rgba(255, 255, 255, 0.75);
      letter-spacing: 0.08em;
      text-transform: uppercase;
      font-weight: 600;
    }}
    .timestamp-val {{
      font-size: 21px;
      font-weight: 800;
      color: #ffffff;
      letter-spacing: -0.01em;
      margin-top: 2px;
      text-shadow: 0 2px 4px rgba(0,0,0,0.4);
    }}

    /* GRID CONTAINER (5 columns, 230px card width, 38px gap, 65px margin) */
    .grid-container {{
      position: relative;
      z-index: 10;
      width: 1302px; /* 5 * 230 + 4 * 38 = 1302px */
      margin: 15px auto 0 auto;
      display: grid;
      grid-template-columns: repeat(5, 230px);
      column-gap: 38px;
      row-gap: 33px;
    }}

    /* CARD ANATOMY (~230w x 185h) */
    .card {{
      position: relative;
      width: 230px;
      height: 185px;
      /* 4-corner chamfer cut */
      clip-path: polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px);
      background: linear-gradient(135deg, rgba(98, 85, 152, 0.72) 0%, rgba(58, 48, 102, 0.82) 100%);
      backdrop-filter: blur(8px);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.22), inset 1px 1px 2px rgba(255, 255, 255, 0.35);
      overflow: visible;
    }}
    
    /* Sheen overlay on card */
    .card::before {{
      content: "";
      position: absolute;
      inset: 0;
      background: linear-gradient(115deg, rgba(255, 255, 255, 0.12) 0%, transparent 45%, rgba(255, 255, 255, 0.04) 100%);
      pointer-events: none;
    }}

    /* Empty Card */
    .card.empty-card {{
      opacity: 0.35;
      background: linear-gradient(135deg, rgba(80, 70, 125, 0.5) 0%, rgba(45, 38, 75, 0.6) 100%);
    }}
    .empty-dashes {{
      position: absolute;
      top: 55px;
      left: 50%;
      transform: translateX(-50%);
      font-size: 36px;
      color: rgba(255, 255, 255, 0.5);
    }}

    /* Left Area (width: 83px, height: 147px) */
    .left-col {{
      position: absolute;
      top: 0;
      left: 0;
      width: 83px;
      height: 147px;
    }}

    /* Rank Tag: Chevron ribbon pointing right */
    .rank-tag {{
      position: absolute;
      top: 6px;
      left: 0;
      width: 50px;
      height: 21px;
      clip-path: polygon(0 0, calc(100% - 7px) 0, 100% 50%, calc(100% - 7px) 100%, 0 100%);
      background: linear-gradient(90deg, #64589c 0%, #7c6ebc 100%);
      box-shadow: inset 0 1px 0 rgba(255,255,255,0.3);
      display: flex;
      align-items: center;
      padding-left: 8px;
    }}
    .rank-num {{
      font-size: 11px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      letter-spacing: -0.02em;
    }}

    /* Potential in Card */
    .pot-label {{
      position: absolute;
      top: 30px;
      left: 10px;
      font-size: 7.5px;
      font-weight: 700;
      color: rgba(255, 255, 255, 0.7);
      letter-spacing: 0.1em;
      text-transform: uppercase;
    }}
    .pot-num {{
      position: absolute;
      top: 41px;
      left: 10px;
      font-size: 21px;
      font-weight: 800;
      color: #ffd76a;
      letter-spacing: -0.03em;
      line-height: 1;
    }}
    .pot-dots {{
      position: absolute;
      top: 64px;
      left: 10px;
      font-size: 10px;
      color: rgba(255, 255, 255, 0.35);
      line-height: 1;
    }}

    /* Grade Text */
    .grade-text {{
      position: absolute;
      top: 75px;
      left: 8px;
      font-size: 34px;
      font-weight: 900;
      font-style: italic;
      letter-spacing: -0.04em;
      line-height: 1;
      background: linear-gradient(180deg, #ffffff 0%, #eddcf2 45%, #c5b0db 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.5));
    }}

    /* Right Area: Square Jacket (145x145) */
    .jacket-wrap {{
      position: absolute;
      top: 2px;
      right: 2px;
      width: 145px;
      height: 145px;
      background: #111428;
      overflow: hidden;
    }}
    .jacket-img {{
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }}
    .jacket-shade {{
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgba(0, 0, 0, 0.9) 0%, rgba(0, 0, 0, 0.45) 45%, transparent 100%);
    }}
    .score-text {{
      position: absolute;
      bottom: 5px;
      left: 8px;
      font-size: 14.5px;
      font-weight: 700;
      color: #ffffff;
      letter-spacing: -0.02em;
      filter: drop-shadow(0 1px 2px rgba(0,0,0,0.95));
    }}

    /* Diamond Level Badge */
    .lvl-diamond {{
      position: absolute;
      top: -5px;
      right: -5px;
      width: 25px;
      height: 25px;
      transform: rotate(45deg);
      border-radius: 3px;
      border: 1px solid rgba(255,255,255,0.4);
      box-shadow: 0 2px 5px rgba(0,0,0,0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10;
    }}
    .lvl-text {{
      transform: rotate(-45deg);
      font-size: 12px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      text-align: center;
    }}

    /* Hexagon Clear Lamp Badge */
    .lamp-badge {{
      position: absolute;
      bottom: -5px;
      right: -5px;
      width: 23px;
      height: 26px;
      clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: 800;
      color: #ffffff;
      line-height: 1;
      z-index: 10;
    }}

    /* Bottom Title Strip */
    .title-strip {{
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 36px;
      background: rgba(88, 76, 136, 0.88);
      border-top: 1px solid rgba(255, 255, 255, 0.22);
      display: flex;
      align-items: center;
      padding: 0 10px 0 12px;
      overflow: hidden;
    }}
    .title-text {{
      font-family: 'Noto Sans JP', sans-serif;
      font-size: 11.5px;
      font-weight: 500;
      color: #ffffff;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: clip; /* Clipped without ellipsis */
      line-height: 36px;
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
    }}

    /* FOOTER (~100px) */
    .footer {{
      position: relative;
      z-index: 10;
      width: 1302px;
      margin: 35px auto 40px auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: rgba(255, 255, 255, 0.65);
      font-size: 13px;
      font-weight: 500;
      padding-top: 15px;
      border-top: 1px solid rgba(255, 255, 255, 0.15);
    }}
    .footer-left {{
      letter-spacing: 0.02em;
    }}
    .footer-center {{
      color: #ffd76a;
      font-weight: 700;
      letter-spacing: 0.05em;
    }}
    .footer-right {{
      font-weight: 800;
      letter-spacing: 0.08em;
      color: rgba(255, 255, 255, 0.8);
    }}
  </style>
</head>
<body>
  <div id="b50-export-canvas">
    <!-- Background layer -->
    <div class="bg-layer">
      <img src="http://localhost:3000/storage/backgrounds/base_light.jpg" class="bg-img" onerror="this.src='http://localhost:3000/storage/backgrounds/base_conflict.jpg'" />
      <div class="bg-overlay"></div>
      <div class="bg-vignette"></div>
    </div>
    
    <!-- Glass bokeh bubbles -->
    <div class="glass-sphere sphere-1"></div>
    <div class="glass-sphere sphere-2"></div>
    <div class="glass-sphere sphere-3"></div>
    <div class="glass-sphere sphere-4"></div>
    
    <!-- Side Gold Corner Brackets -->
    <svg class="edge-bracket edge-bracket-left" viewBox="0 0 18 50">
      <path d="M16,2 L4,25 L16,48" stroke="#e0d3b6" stroke-width="1.8" fill="none" />
    </svg>
    <svg class="edge-bracket edge-bracket-right" viewBox="0 0 18 50">
      <path d="M2,2 L14,25 L2,48" stroke="#e0d3b6" stroke-width="1.8" fill="none" />
    </svg>

    <!-- Header Section -->
    <div class="header">
      <!-- Top Left Logo -->
      <div class="logo-wrap">
        <img src="http://localhost:3000/img/arcaea_logo.png" class="arcaea-logo" />
      </div>

      <!-- Thin Gold Lines SVG extending to center -->
      <svg class="gold-lines" viewBox="0 0 1445 270">
        <path d="M65,112 L430,112 L485,138" stroke="#e0d3b6" stroke-width="1.5" fill="none" opacity="0.75" />
        <path d="M1380,112 L1015,112 L960,138" stroke="#e0d3b6" stroke-width="1.5" fill="none" opacity="0.75" />
      </svg>

      <!-- Center Nameplate -->
      <div class="nameplate-container">
        <div class="nameplate-parallelogram">
          <div class="nameplate-stripes"></div>
          <div class="player-name">{name}</div>
          
          <!-- Diamond Avatar -->
          <div class="avatar-diamond-frame">
            <div class="avatar-diamond-inner">
              <img src="http://localhost:3000/storage/characters/0_icon.png" class="avatar-img" />
            </div>
          </div>
        </div>
      </div>

      <!-- Rating & Star Pill under Avatar -->
      <div class="ptt-badge-group">
        <div class="ptt-value">{ptt}</div>
        <div class="star-pill">★★</div>
      </div>

      <!-- Player Stats below nameplate -->
      <div class="stats-line">
        <span>ID: {user_code}</span>
        <span class="stat-sep">•</span>
        <span>B50: {b50}</span>
        <span class="stat-sep">•</span>
        <span>B10: {b10}</span>
      </div>

      <!-- Generated Timestamp -->
      <div class="timestamp-wrap">
        <div class="timestamp-label">Generated on:</div>
        <div class="timestamp-val">{date_str}</div>
      </div>
    </div>

    <!-- Cards Grid -->
    <div class="grid-container">
      {all_cards}
    </div>

    <!-- Footer -->
    <div class="footer">
      <div class="footer-left">Celest Arcaea Server • Arcaea by lowiro</div>
      <div class="footer-center">50 Records • Modern B50 (+0.2 Clear)</div>
      <div class="footer-right">moe.cel.arc</div>
    </div>
  </div>
</body>
</html>"""
    return html

def main():
    con = sqlite3.connect('ArcaeaServerFork/database/arcaea_database.db')
    cur = con.cursor()
    cur.execute('''
        SELECT b.song_id, b.difficulty, b.score, b.shiny_perfect_count, b.perfect_count, b.near_count, b.miss_count, b.clear_type, u.name, u.user_code, u.rating_ptt
        FROM best_score b
        JOIN user u ON b.user_id = u.user_id
        ORDER BY b.score DESC
    ''')
    rows = cur.fetchall()

    with open('ArcaeaServerFork/database/songs/songlist', 'r', encoding='utf-8') as f:
        songlist_data = json.load(f)
    songs_map = {s['id']: s for s in songlist_data['songs']}

    items = []
    # Test items: 35 real songs + 15 empty slots (as required: 35 slot dengan 5 kosong or test 50 slots)
    for i, row in enumerate(rows):
        if i >= 35:
            break
        song_id, diff, score, shiny, pure, far, lost, clear_type, u_name, u_code, u_ptt = row
        song_meta = songs_map.get(song_id, {})
        title = song_meta.get('title_localized', {}).get('en') or song_meta.get('title_localized', {}).get('ja') or song_id
        
        diff_data = next((d for d in song_meta.get('difficulties', []) if d.get('ratingClass') == diff), {})
        rating = diff_data.get('rating', 10)
        rating_plus = diff_data.get('ratingPlus', False)
        display_diff = f"{rating}+" if rating_plus else str(rating)
        chart_const = diff_data.get('chartConst', rating * 1.0)
        
        if score >= 10000000:
            single_rating = chart_const + 2.0
        elif score >= 9800000:
            single_rating = chart_const + 1.0 + (score - 9800000) / 200000
        else:
            single_rating = max(0.0, chart_const + (score - 9500000) / 300000)
        if clear_type != 0:
            single_rating += 0.2
            
        if score >= 10000000 and far == 0 and lost == 0:
            grade = "PM"
        elif score >= 9900000:
            grade = "EX+"
        elif score >= 9800000:
            grade = "EX"
        elif score >= 9500000:
            grade = "AA"
        elif score >= 9200000:
            grade = "A"
        elif score >= 8900000:
            grade = "B"
        else:
            grade = "C"
            
        lamp_map = {0: "L", 1: "C", 2: "F", 3: "P", 4: "E", 5: "H"}
        lamp = lamp_map.get(clear_type, "C")
        
        s_str = str(score).zfill(8)
        formatted_score = f"{s_str[:2]}'{s_str[2:5]}'{s_str[5:]}"
        jacket_url = f"http://localhost:3000/storage/jackets/{song_id}.jpg"
        
        items.append({
            "rank": i + 1,
            "title": title,
            "score": formatted_score,
            "potential": f"{single_rating:.3f}",
            "grade": grade,
            "diff": display_diff,
            "rc": diff,
            "lamp": lamp,
            "jacket": jacket_url
        })

    # Test edge cases:
    if items:
        # Edge case 1: Very long title
        items[0]["title"] = "Extradimensional Cosmic (Rayark Cytus II Collaboration)"
        # Edge case 2: Japanese / special characters
        items[1]["title"] = "夜桜吹雪 〜 散りゆく千の記憶"
        # Edge case 3: 10'0xx'xxx PM score
        items[2]["score"] = "10'001'149"
        items[2]["grade"] = "PM"
        items[2]["lamp"] = "P"
        items[2]["potential"] = "13.001"
        items[2]["diff"] = "11"
        items[3]["lamp"] = "F"
        items[3]["diff"] = "11+"
        items[3]["rc"] = 3

    for r in range(len(items) + 1, 51):
        items.append({
            "rank": r,
            "empty": True
        })

    player_info = {
        "name": "AnisphiaaaUwU",
        "userCode": "002000000",
        "ptt": "12.668",
        "b50": "12.668",
        "b10": "12.742"
    }

    html = build_html(items, player_info)
    html_path = "web_nuxt/public/b50_test.html"
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"Generated test HTML at {html_path}")

if __name__ == "__main__":
    main()
