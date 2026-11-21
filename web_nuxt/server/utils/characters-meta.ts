import fs from 'fs';
import path from 'path';

export interface CharacterSkillInfo {
    id: string;
    name: string;
    description: string;
    category: 'gauge' | 'frag' | 'step' | 'visual' | 'challenge' | 'special';
}

export interface CharacterTypeInfo {
    typeId: number;
    label: string;
    color: string;
    bgClass: string;
    textClass: string;
    borderClass: string;
}

export interface UncapCoreInfo {
    coreType: string;
    coreName: string;
    amount: number;
}

const SKILL_MAP: Record<string, { name: string; description: string; category: CharacterSkillInfo['category'] }> = {
    'gauge_easy': {
        name: 'Easy Gauge',
        description: 'Lost notes deplete less recollection gauge, and recovery is easier.',
        category: 'gauge',
    },
    'gauge_hard': {
        name: 'Hard Gauge',
        description: 'Starts at 100% gauge. Lost notes heavily drain gauge. Track LOST on 0%.',
        category: 'gauge',
    },
    'note_mirror': {
        name: 'Mirror',
        description: 'All ground lanes and sky notes are horizontally mirrored.',
        category: 'special',
    },
    'visual_ink': {
        name: 'Ink Stain',
        description: 'Dark ink splatters partially obscure notes and judgement lines.',
        category: 'visual',
    },
    'skill_reunion': {
        name: 'Reunion of Light & Conflict',
        description: 'Gauge dynamically switches between Light and Conflict properties based on song side.',
        category: 'gauge',
    },
    'frag_plus_10_pack_stellights': {
        name: 'Stellights Harmony',
        description: 'Earn +10 bonus fragments when playing songs from the Stellights pack.',
        category: 'frag',
    },
    'gauge_easy|frag_plus_15_pst&prs': {
        name: 'Novice Blessing',
        description: 'Easy gauge; gain +15 bonus fragments on Past and Present difficulties.',
        category: 'frag',
    },
    'gauge_hard|fail_frag_minus_100': {
        name: 'High Stakes Hard Gauge',
        description: 'Hard gauge; failing a track penalizes 100 fragments.',
        category: 'gauge',
    },
    'ilith_awakened_skill': {
        name: 'Tetrastep Awakening',
        description: 'Massive Step boost (+0.5/Lv) when playing Level 10 and above charts.',
        category: 'step',
    },
    'frag_plus_5_side_light': {
        name: 'Light Blessing',
        description: 'Earn +5 bonus fragments when playing Light side songs.',
        category: 'frag',
    },
    'eto_uncap': {
        name: 'Awakened Light',
        description: 'Step progression increased by 20% on all Light side songs.',
        category: 'step',
    },
    'visual_hide_hp': {
        name: 'Concealed Gauge',
        description: 'Recollection rate bar and percentage are completely hidden during play.',
        category: 'visual',
    },
    'luna_uncap': {
        name: 'Awakened Void',
        description: 'Recollection gauge is hidden; massive Overdrive bonus on Conflict songs.',
        category: 'step',
    },
    'frag_plus_5_side_conflict': {
        name: 'Conflict Bounty',
        description: 'Earn +5 bonus fragments when playing Conflict side songs.',
        category: 'frag',
    },
    'shirabe_entry_fee': {
        name: 'Double Stakes',
        description: 'Costs 5 fragments to play; triples fragment yield on successful track clear.',
        category: 'frag',
    },
    'challenge_fullcombo_0gauge': {
        name: 'Zero Recollection',
        description: 'Gauge starts at 0% and does not increase; only awards Clear on Full Recall.',
        category: 'challenge',
    },
    'gauge_overflow': {
        name: 'Overflow Gauge',
        description: 'Gauge can exceed 100% up to 200%, scaling step progress in World Mode.',
        category: 'gauge',
    },
    'gauge_easy|note_mirror': {
        name: 'Easy Mirror',
        description: 'Easy recollection gauge combined with horizontally mirrored notes.',
        category: 'gauge',
    },
    'visual_tomato_pack_tonesphere': {
        name: 'Tone Sphere Mode',
        description: 'Changes note track and hit effects into vivid Tone Sphere style.',
        category: 'visual',
    },
    'frag_rng_ayu': {
        name: 'Ayu Roulette',
        description: 'Awards a random fragment multiplier between 0x and 3x on clear.',
        category: 'frag',
    },
    'ayu_uncap': {
        name: 'Awakened Trickster',
        description: 'Step stat fluctuates randomly each play, granting up to 2.5x step bonus.',
        category: 'step',
    },
    'gaugestart_30|gaugegain_70': {
        name: 'Dual Harmony',
        description: 'Gauge begins at 30% and caps at 70% required clear threshold.',
        category: 'gauge',
    },
    'combo_100-frag_1': {
        name: 'Combo Harvester',
        description: 'Awards 1 extra fragment for every 100 combo achieved.',
        category: 'frag',
    },
    'frags_yume': {
        name: 'Dream Harvest',
        description: 'Substantially boosts fragment multiplier upon achieving EX or EX+ grade.',
        category: 'frag',
    },
    'audio_gcemptyhit_pack_groovecoaster': {
        name: 'Groove Coaster SFX',
        description: 'Replaces standard tap hit sounds with authentic Groove Coaster SFX.',
        category: 'special',
    },
    'gauge_saya': {
        name: "Saya's Edge",
        description: 'Hard gauge where consecutive lost notes drain the gauge much faster.',
        category: 'gauge',
    },
    'skill_saya_uncap': {
        name: 'Awakened Carnage',
        description: 'Enhances Step by +25 on Level 10 and above songs.',
        category: 'step',
    },
    'gauge_chuni': {
        name: 'CHUNITHM Gauge',
        description: 'Track begins with 0% gauge; clear threshold is 80% with custom gauge scaling.',
        category: 'gauge',
    },
    'kantandeshou': {
        name: 'Strict Judgment',
        description: 'Hard gauge where all Far notes count as Lost notes (Full Recall required).',
        category: 'challenge',
    },
    'gauge_haruna': {
        name: "Haruna's Resolve",
        description: 'Hard gauge with accelerated recovery on Shiny Pure notes.',
        category: 'gauge',
    },
    'frags_nono': {
        name: 'Nono Fortune',
        description: 'Awards a random fragment reward upon clearing a song.',
        category: 'frag',
    },
    'gauge_pandora': {
        name: 'Pandora Nemesis',
        description: 'Extreme Hard gauge variant with strict survival requirements.',
        category: 'gauge',
    },
    'gauge_regulus': {
        name: 'Regulus Aegis',
        description: 'Tone Sphere specialized defensive recollection gauge.',
        category: 'gauge',
    },
    'omatsuri_daynight': {
        name: 'Day & Night Festival',
        description: 'Partner background shifts dynamically based on local device time.',
        category: 'visual',
    },
    'skill_kanae_uncap': {
        name: 'Awakened Festival',
        description: 'Earns 25% extra fragments on Memory Archive tracks.',
        category: 'frag',
    },
    'sometimes(note_mirror|frag_plus_5)': {
        name: 'Mirror Gamble',
        description: '50% chance to mirror chart; awards +5 fragments on clear.',
        category: 'special',
    },
    'scoreclear_aa|visual_scoregauge': {
        name: 'AA Clear Trial',
        description: 'Recollection bar tracks score progress; must reach AA (9,500,000) to clear.',
        category: 'challenge',
    },
    'skill_doroc_uncap': {
        name: 'Awakened Groove',
        description: 'Massive Overdrive boost when playing Conflict side songs.',
        category: 'step',
    },
    'gauge_tempest': {
        name: 'Tempest Gauge',
        description: 'Dynamic gauge drain rate scaled continuously by player potential.',
        category: 'gauge',
    },
    'gauge_ilith_summer': {
        name: 'Summer Breeze',
        description: 'Recollection rate recovers faster during long combo chains.',
        category: 'gauge',
    },
    'note_mirror|visual_hide_far': {
        name: 'Farless Mirror',
        description: 'Mirror chart; Far notes do not display visual hit feedback.',
        category: 'special',
    },
    'frags_ongeki': {
        name: 'O.N.G.E.K.I. Bell',
        description: 'Extra fragment drop based on high accuracy performance.',
        category: 'frag',
    },
    'gauge_areus': {
        name: 'Areus Gauge',
        description: 'Recollection gauge recovers only on Shiny Pure notes.',
        category: 'gauge',
    },
    'gauge_seele': {
        name: 'Seele Resonance',
        description: 'Overgauge mechanic rewarding consistent high accuracy.',
        category: 'gauge',
    },
    'gauge_isabelle': {
        name: 'Isabelle Gauge',
        description: 'Hard gauge with dynamic loss penalties depending on combo count.',
        category: 'gauge',
    },
    'gauge_exhaustion': {
        name: 'Exhaustion Gauge',
        description: 'Recollection gauge continuously drains slowly over time during play.',
        category: 'gauge',
    },
    'skill_lagrange': {
        name: 'Lagrange Continuum',
        description: 'Step progression scales dynamically based on play streak and player PTT.',
        category: 'step',
    },
    'gauge_safe_10': {
        name: 'Ten Safeguards',
        description: 'Converts the first 10 Lost notes to Far notes.',
        category: 'gauge',
    },
    'frags_nami': {
        name: 'Nami Bounty',
        description: 'Substantially increases base fragment earnings across all plays.',
        category: 'frag',
    },
    'skill_elizabeth': {
        name: "Elizabeth's Overture",
        description: 'Groove Coaster visual cues and fragment bonus multiplier.',
        category: 'frag',
    },
    'skill_lily': {
        name: "Lily's Resonance",
        description: 'WACCA collaboration gauge with vibrant circular lane glows.',
        category: 'visual',
    },
    'skill_kanae_midsummer': {
        name: 'Midsummer Splash',
        description: 'Light Side tracks yield extra fragments and soothing water splash visuals.',
        category: 'frag',
    },
    'visual_ghost_skynotes': {
        name: 'Ghost Notes',
        description: 'Sky notes and trace ribbons fade out halfway before reaching judgement line.',
        category: 'visual',
    },
    'skill_vita': {
        name: "Vita's Distortion",
        description: 'Distorts chart perspective slightly and multiplies step yield in World Mode.',
        category: 'step',
    },
    'skill_fatalis': {
        name: 'Fatalis End',
        description: 'Extreme Hard gauge; Far notes count as half lost; ends immediately on Track Lost.',
        category: 'challenge',
    },
    'frags_ongeki_slash': {
        name: 'O.N.G.E.K.I. Slash',
        description: 'High Overdrive boost when playing boss songs.',
        category: 'step',
    },
    'frags_ongeki_hard': {
        name: 'O.N.G.E.K.I. Lunatic',
        description: 'Hard gauge with maximum fragment drop multipliers.',
        category: 'gauge',
    },
    'skill_amane': {
        name: "Amane's Melody",
        description: 'Step bonus on CHUNITHM crossover tracks.',
        category: 'step',
    },
    'skill_kou_winter': {
        name: 'Winter Carol',
        description: 'Enhanced Frag and Step multiplier during winter.',
        category: 'frag',
    },
    'gauge_hard|note_mirror': {
        name: 'Hard Mirror',
        description: 'Hard gauge combined with horizontally mirrored notes.',
        category: 'gauge',
    },
    'skill_shama': {
        name: "Shama's Delight",
        description: 'High Frag multiplier with occasional double fragment procs.',
        category: 'frag',
    },
    'skill_milk': {
        name: "Milk's Energy",
        description: 'CHUNITHM collaboration partner with generous fragment bonuses.',
        category: 'frag',
    },
    'skill_shikoku': {
        name: 'Shikoku Pilgrimage',
        description: 'Bonus fragments on songs from the Memory Archive.',
        category: 'frag',
    },
    'skill_mika': {
        name: "Mika's Guidance",
        description: 'Blue Archive collaboration partner with specialized gauge recovery.',
        category: 'gauge',
    },
    'skill_mithra': {
        name: "Mithra's Trial",
        description: 'Hard gauge; Far notes count as Lost notes on Beyond difficulty.',
        category: 'challenge',
    },
    'skill_toa': {
        name: 'Toa Synchrony',
        description: 'Cytus II collaboration partner with custom tap sound effects.',
        category: 'special',
    },
    'skill_nami_twilight': {
        name: 'Twilight Glow',
        description: 'Increases fragment earnings during evening hours (18:00 - 06:00).',
        category: 'frag',
    },
    'skill_ilith_ivy': {
        name: "Ivy's Resolve",
        description: 'Cytus II collaboration skill with aggressive hard gauge.',
        category: 'gauge',
    },
    'skill_hikari_vanessa': {
        name: "Vanessa's Harmony",
        description: 'Cytus II collaboration skill with unique visual gauge.',
        category: 'gauge',
    },
    'skill_maya': {
        name: "Maya's Starlight",
        description: 'Increases recollection rate gain for sky notes and trace arcs.',
        category: 'gauge',
    },
    'skill_maya_uncap': {
        name: 'Awakened Starlight',
        description: 'Enhanced Step and Overdrive multiplier on Conflict charts.',
        category: 'step',
    },
    'skill_intruder': {
        name: 'Intruder Subversion',
        description: 'Steals fragment bonuses and converts them into world step boost.',
        category: 'step',
    },
    'skill_luin': {
        name: "Luin's Valor",
        description: 'Hard gauge with Overdrive scaling on Conflict charts.',
        category: 'gauge',
    },
    'skill_luin_uncap': {
        name: 'Awakened Luin',
        description: 'High Overdrive multiplier when playing boss songs.',
        category: 'step',
    },
    'skill_aichan': {
        name: 'Ai-chan Cheerful',
        description: 'Kizuna AI collaboration partner with cheerful gauge animations.',
        category: 'special',
    },
    'skill_luna_ilot': {
        name: 'Luna & Ilot Mist',
        description: 'Visual fog effect with boosted step progression.',
        category: 'visual',
    },
    'skill_eto_hoppe': {
        name: 'Eto & Hoppe Bloom',
        description: 'Earn extra fragments and step based on Pure Memory progress.',
        category: 'frag',
    },
    'skill_nell': {
        name: "Nell's Aegis",
        description: 'Overdrive amplification in World Mode.',
        category: 'step',
    },
    'skill_chinatsu': {
        name: 'Chinatsu Discipline',
        description: 'Hard gauge with increased fragment drops on EX+ grades.',
        category: 'gauge',
    },
    'skill_tsumugi': {
        name: 'Tsumugi Arcana',
        description: 'Extra gauge recovery for hold and arc notes.',
        category: 'gauge',
    },
    'skill_nai': {
        name: 'Nai Cues',
        description: 'Lowiro collaboration character with custom sound cues.',
        category: 'special',
    },
    'skill_selene': {
        name: 'Selene Orbit',
        description: 'Visual starlight effects and balanced stat curve.',
        category: 'special',
    },
    'skill_salt': {
        name: 'Salt Resonance',
        description: 'Recollection rate fluctuates unpredictably.',
        category: 'special',
    },
    'skill_acid': {
        name: 'Acid Pulse',
        description: 'Lanota collaboration skill with energetic visual lane glow.',
        category: 'visual',
    },
    'skill_hikari_selene': {
        name: 'Hikari & Selene Equilibrium',
        description: 'Dynamically balances gauge recovery across difficulties.',
        category: 'gauge',
    },
    'skill_hikari_clear': {
        name: 'Hikari Clear Barrier',
        description: 'Gauge does not drop below 70% once reached.',
        category: 'gauge',
    },
    'skill_tairitsu_fail': {
        name: 'Tairitsu Fail Protocol',
        description: 'Extreme Hard gauge for testing player stamina.',
        category: 'challenge',
    },
    'skill_nami_sui': {
        name: 'Nami & Sui Harmonize',
        description: 'Frag and Step boost when playing Partner theme songs.',
        category: 'frag',
    },
    'skill_nonoka': {
        name: 'Nonoka Velocity',
        description: 'High Step progression on Level 9+ songs.',
        category: 'step',
    },
    'skill_nonoka_uncap': {
        name: 'Awakened Nonoka',
        description: 'Maximum Step and Overdrive scaling on Level 11+ songs.',
        category: 'step',
    },
    'skill_vita_arc': {
        name: 'Vita Arc Weaver',
        description: 'Enhances step progression when playing Arc-heavy charts.',
        category: 'step',
    },
    'skill_hikari_tairitsu_debut': {
        name: 'Debut Overture',
        description: 'Beginner friendly gauge with boosted fragment earnings.',
        category: 'frag',
    },
    'skill_hp_slow_drain': {
        name: 'Slow Drain',
        description: 'Recollection gauge continuously drains at 1% per second.',
        category: 'gauge',
    },
    'skill_hprate_based_on_hp': {
        name: 'Dynamic Recovery',
        description: 'Gauge gain increases as recollection rate drops.',
        category: 'gauge',
    },
    'skill_lost_to_85': {
        name: 'Ceiling Gauge',
        description: 'Gauge drops to 85% on any Lost note when above 85%.',
        category: 'gauge',
    },
    'skill_frag_doubled_after_earning_X': {
        name: 'Double Bounty',
        description: 'Fragment gains double after reaching daily target.',
        category: 'frag',
    },
    'skill_saya_konzetsu': {
        name: 'Saya Konzetsu',
        description: 'Gauge drops rapidly; high risk, high step reward.',
        category: 'challenge',
    },
    'skill_insight_konzetsu': {
        name: 'Insight / Konzetsu',
        description: 'Hard gauge with increased step rate upon PM/FR.',
        category: 'challenge',
    },
    'frags_preferred_song': {
        name: 'Affection Bonus',
        description: 'Bonus fragments when playing favorite songs.',
        category: 'frag',
    },
};

const CORE_NAMES: Record<string, string> = {
    'core_hollow': 'Hollow Core',
    'core_desolate': 'Desolate Core',
    'core_crimson': 'Crimson Core',
    'core_ambivalent': 'Ambivalent Core',
    'core_umbral': 'Umbral Core',
    'core_chuni': 'CHUNITHM Core',
};

let cachedMetaList: any[] | null = null;

function loadMetadata(): any[] {
    if (cachedMetaList) return cachedMetaList;
    try {
        const filePath = path.resolve(process.cwd(), 'server/data/characters_meta.json');
        if (fs.existsSync(filePath)) {
            const raw = fs.readFileSync(filePath, 'utf-8');
            cachedMetaList = JSON.parse(raw);
            return cachedMetaList || [];
        }
    } catch {}
    return [];
}

export function getCharacterSkillInfo(skillId: string): CharacterSkillInfo {
    const rawId = (skillId || '').trim();
    if (!rawId || rawId === 'none') {
        return {
            id: 'none',
            name: 'No Skill',
            description: 'Standard gauge mechanics with default recollection rates.',
            category: 'special',
        };
    }

    if (SKILL_MAP[rawId]) {
        return {
            id: rawId,
            ...SKILL_MAP[rawId],
        };
    }

    // Dynamic fallback formatting for unmapped or compound skills
    const parts = rawId.split('|').map(p => p.trim());
    const names = parts.map(p => {
        if (SKILL_MAP[p]) return SKILL_MAP[p].name;
        return p.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    });

    const category: CharacterSkillInfo['category'] = rawId.includes('gauge')
        ? 'gauge'
        : rawId.includes('frag')
        ? 'frag'
        : rawId.includes('step') || rawId.includes('prog')
        ? 'step'
        : rawId.includes('visual')
        ? 'visual'
        : 'special';

    return {
        id: rawId,
        name: names.join(' & '),
        description: `Custom partner skill (${rawId.replace(/_/g, ' ')}).`,
        category,
    };
}

export function getCharacterTypeInfo(charType: number): CharacterTypeInfo {
    switch (charType) {
        case 1:
            return {
                typeId: 1,
                label: 'Light',
                color: '#38bdf8',
                bgClass: 'bg-[#38bdf8]/15',
                textClass: 'text-[#38bdf8]',
                borderClass: 'border-[#38bdf8]/30',
            };
        case 2:
            return {
                typeId: 2,
                label: 'Special',
                color: '#f43f5e',
                bgClass: 'bg-[#f43f5e]/15',
                textClass: 'text-[#f43f5e]',
                borderClass: 'border-[#f43f5e]/30',
            };
        case 3:
            return {
                typeId: 3,
                label: 'Fracture',
                color: '#e0e7ff',
                bgClass: 'bg-indigo-400/15',
                textClass: 'text-indigo-200',
                borderClass: 'border-indigo-400/30',
            };
        case 4:
            return {
                typeId: 4,
                label: 'Beyond',
                color: '#34d399',
                bgClass: 'bg-emerald-400/15',
                textClass: 'text-emerald-300',
                borderClass: 'border-emerald-400/30',
            };
        case 0:
        default:
            return {
                typeId: 0,
                label: 'Conflict',
                color: '#c084fc',
                bgClass: 'bg-[#c084fc]/15',
                textClass: 'text-[#c084fc]',
                borderClass: 'border-[#c084fc]/30',
            };
    }
}

export function formatCharacterDisplayName(name: string, characterId: number): string {
    if (!name) return `Partner ${characterId}`;
    // Preserve parentheses and special symbols
    return name
        .replace(/_/g, ' ')
        .replace(/\b([a-z])/g, (_, m) => m.toUpperCase());
}

export function getCharacterMeta(characterId: number): {
    searchStrings: string[];
    uncapCores: UncapCoreInfo[];
    versionFrom: string;
} {
    const list = loadMetadata();
    const item = list.find((c: any) => c.character_id === characterId);
    if (!item) {
        return {
            searchStrings: [],
            uncapCores: [],
            versionFrom: '0.0.0',
        };
    }

    const cores: UncapCoreInfo[] = (item.uncap_cores || []).map((c: any) => ({
        coreType: c.core_type,
        coreName: CORE_NAMES[c.core_type] || c.core_type.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
        amount: Number(c.amount || 0),
    }));

    return {
        searchStrings: item.search_strings || [],
        uncapCores: cores,
        versionFrom: item.version_from || '0.0.0',
    };
}

export function getCharacterPortraits(characterId: number): {
    portraitNormal: string;
    portraitUncapped: string;
    hasUncappedPortrait: boolean;
    portraitAlt: string;
    hasAltPortrait: boolean;
    iconNormal: string;
    iconUncapped: string;
    hasUncappedIcon: boolean;
} {
    const publicStorage = path.resolve(process.cwd(), 'public/storage/characters');
    const p1080 = path.join(publicStorage, '1080');
    const pmp = path.join(publicStorage, 'mp');

    // Normal portrait
    let norm = `/storage/characters/1080/${characterId}.png`;
    if (!fs.existsSync(path.join(p1080, `${characterId}.png`))) {
        if (fs.existsSync(path.join(pmp, `${characterId}_mp.png`))) {
            norm = `/storage/characters/mp/${characterId}_mp.png`;
        } else {
            norm = `/storage/characters/${characterId}_icon.png`;
        }
    }

    // Uncapped portrait
    const hasUncap = fs.existsSync(path.join(p1080, `${characterId}u.png`)) || fs.existsSync(path.join(pmp, `${characterId}u_mp.png`));
    let uncap = `/storage/characters/1080/${characterId}u.png`;
    if (!fs.existsSync(path.join(p1080, `${characterId}u.png`))) {
        uncap = `/storage/characters/mp/${characterId}u_mp.png`;
    }

    // Alt portrait
    const hasAlt = fs.existsSync(path.join(p1080, `${characterId}o.png`)) || fs.existsSync(path.join(pmp, `${characterId}o_mp.png`));
    let alt = `/storage/characters/1080/${characterId}o.png`;
    if (!fs.existsSync(path.join(p1080, `${characterId}o.png`))) {
        alt = `/storage/characters/mp/${characterId}o_mp.png`;
    }

    const hasUncapIcon = fs.existsSync(path.join(publicStorage, `${characterId}u_icon.png`));

    return {
        portraitNormal: norm,
        portraitUncapped: hasUncap ? uncap : norm,
        hasUncappedPortrait: hasUncap,
        portraitAlt: hasAlt ? alt : norm,
        hasAltPortrait: hasAlt,
        iconNormal: `/storage/characters/${characterId}_icon.png`,
        iconUncapped: hasUncapIcon ? `/storage/characters/${characterId}u_icon.png` : `/storage/characters/${characterId}_icon.png`,
        hasUncappedIcon: hasUncapIcon,
    };
}

