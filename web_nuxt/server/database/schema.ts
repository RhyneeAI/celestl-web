import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

// ============================================================================
// 1. OFFICIAL ARCAEA CATALOG SCHEMA (Strictly separated from unofficial/server)
// ============================================================================

export const officialGames = sqliteTable('official_games', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
});

export const officialPacks = sqliteTable('official_packs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    gameId: integer('game_id').references(() => officialGames.id),
    slug: text('slug').notNull().unique(),
    name: text('name').notNull(),
    section: text('section'), // Main, Side, Memory Archive, Collaboration, Extend
    parentId: integer('parent_id'), // Self-reference for chapter/append packs
    smallPackImage: integer('small_pack_image', { mode: 'boolean' }).default(false),
    imagePath: text('image_path'),
    imageThumbPath: text('image_thumb_path'),
    imageTrimWidth: integer('image_trim_width'),
    imageTrimHeight: integer('image_trim_height'),
});

export const officialSongs = sqliteTable('official_songs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    gameId: integer('game_id').references(() => officialGames.id),
    packId: integer('pack_id').references(() => officialPacks.id),
    slug: text('slug').notNull().unique(),
    title: text('title').notNull(),
    titleLocalized: text('title_localized'), // JSON string: { en, ja, ko, zh }
    artist: text('artist').notNull(),
    composer: text('composer'),
    jacketDesigner: text('jacket_designer'),
    side: text('side'), // light, conflict, colorless
    bpm: text('bpm'),
    length: integer('length'), // in seconds
    version: text('version'),
    releasedAt: text('released_at'), // ISO date
    jacketPath: text('jacket_path'),
    jacketThumbPath: text('jacket_thumb_path'),
});

export const officialCharts = sqliteTable('official_charts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    songId: integer('song_id').notNull().references(() => officialSongs.id),
    difficulty: text('difficulty').notNull(), // PST, PRS, FTR, BYD, ETR, INS
    level: text('level').notNull(), // 1..12, ?, 10+
    constant: real('constant'), // float: 10.9, 11.3
    ratingPlus: integer('rating_plus', { mode: 'boolean' }).default(false),
    chartDesigner: text('chart_designer'),
    jacketDesigner: text('jacket_designer'),
    noteCount: integer('note_count'),
    jacketPath: text('jacket_path'), // for chart jacket override (54 songs)
    gameVersion: text('game_version'),
});

// ============================================================================
// 2. UNOFFICIAL / PRIVATE SERVER CATALOG SCHEMA (Custom charts & Server Sync)
// ============================================================================

export const unofficialSongs = sqliteTable('unofficial_songs', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    songId: text('song_id').notNull().unique(), // e.g. "abyssgazer", "younithm"
    title: text('title').notNull(),
    artist: text('artist').notNull(),
    bpm: text('bpm'),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const unofficialCharts = sqliteTable('unofficial_charts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    songId: integer('song_id').notNull().references(() => unofficialSongs.id),
    difficulty: text('difficulty').notNull(), // PST=0, PRS=1, FTR=2, BYD=3, ETR=4
    rating: integer('rating').notNull(), // level number
    constant: real('constant'), // float e.g. 10.9
    chartDesigner: text('chart_designer'),
    affPath: text('aff_path'),
    audioOverride: integer('audio_override', { mode: 'boolean' }).default(false),
    pushedAt: integer('pushed_at', { mode: 'timestamp' }),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

// ============================================================================
// 3. ADMIN GATE & AUTHENTICATION (TOTP Single Admin)
// ============================================================================

export const adminAccounts = sqliteTable('admin_accounts', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    totpSecret: text('totp_secret').notNull(),
    confirmedAt: integer('confirmed_at', { mode: 'timestamp' }),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    singleton: integer('singleton').notNull().unique().default(1), // Enforce single admin
});

// ============================================================================
// 4. USER ACCOUNTS & PLAY HISTORY
// ============================================================================

export const users = sqliteTable('users', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    playerId: text('player_id').notNull().unique(), // 9-digit Arcaea player ID
    nickname: text('nickname').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
    updatedAt: integer('updated_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});

export const gameIdentities = sqliteTable('game_identities', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').notNull().references(() => users.id),
    gameId: integer('game_id').references(() => officialGames.id),
    playerId: text('player_id').notNull(),
    nickname: text('nickname').notNull(),
});

export const plays = sqliteTable('plays', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id').references(() => users.id), // Nullable for guest plays
    chartId: integer('chart_id').references(() => officialCharts.id),
    score: integer('score').notNull(),
    shinyPure: integer('shiny_pure').default(0),
    pure: integer('pure').notNull(),
    far: integer('far').notNull(),
    lost: integer('lost').notNull(),
    clearType: text('clear_type').notNull(), // lost, easy_clear, normal_clear, hard_clear, full_recall, pure_memory
    playRating: real('play_rating').notNull(),
    playedAt: integer('played_at', { mode: 'timestamp' }).$defaultFn(() => new Date()),
});
