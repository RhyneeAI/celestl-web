import type { Lamp } from '~/utils/arcaea-rating';

export interface LeaderboardEntry {
    rank: number;
    userId: number;
    name: string;
    userCode: string;
    characterId: number;
    characterAvatar: string;
    ratingPtt: number;
    totalScore: number;
    totalScoreFormatted: string;
    playCount: number;
    topRating: number;
    topSongTitle: string;
    topSongId: string;
    topGrade: string;
    topLamp: Lamp;
}

export interface PlayerScoreItem {
    songId: string;
    songTitle: string;
    artist: string;
    difficulty: string;
    ratingClass: number;
    score: number;
    scoreFormatted: string;
    grade: string;
    lamp: Lamp;
    lampShort: string;
    constant: number;
    recalculatedRating: number;
    playedAt: number;
    dateObtained: string;
    jacketUrl: string;
    shinyPerfectCount: number;
    perfectCount: number;
    nearCount: number;
    missCount: number;
    playsThisYear: number;
}

export interface PlayerProfile {
    userId: number;
    name: string;
    userCode: string;
    characterId: number;
    characterAvatar: string;
    ratingPtt: number;
    totalScores: number;
}

