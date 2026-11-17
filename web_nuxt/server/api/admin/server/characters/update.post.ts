import { defineEventHandler, readBody, createError } from 'h3';
// @ts-ignore: better-sqlite3 uses export = Database CommonJS syntax
import Database from 'better-sqlite3';
import { getServerDbPath } from '../../../../utils/server-paths.ts';

interface UpdateCharacterBody {
    characterId: number;
    maxLevel: number;
    isUncapped: boolean;
    frag1: number;
    prog1: number;
    overdrive1: number;
    frag20: number;
    prog20: number;
    overdrive20: number;
    frag30: number;
    prog30: number;
    overdrive30: number;
}

export default defineEventHandler(async (event) => {
    const body = await readBody<UpdateCharacterBody>(event);
    if (!body || typeof body.characterId !== 'number') {
        throw createError({ statusCode: 400, statusMessage: 'Invalid characterId parameter' });
    }

    const dbPath = getServerDbPath();
    if (!dbPath) {
        throw createError({ statusCode: 500, statusMessage: 'Server database not found' });
    }

    try {
        const db = new Database(dbPath);

        const exists = db.prepare('SELECT character_id, name FROM character WHERE character_id = ?').get(body.characterId) as any;
        if (!exists) {
            db.close();
            throw createError({ statusCode: 404, statusMessage: 'Character not found' });
        }

        db.prepare(`
            UPDATE character 
            SET max_level = ?,
                is_uncapped = ?,
                frag1 = ?, prog1 = ?, overdrive1 = ?,
                frag20 = ?, prog20 = ?, overdrive20 = ?,
                frag30 = ?, prog30 = ?, overdrive30 = ?
            WHERE character_id = ?
        `).run(
            body.maxLevel,
            body.isUncapped ? 1 : 0,
            body.frag1, body.prog1, body.overdrive1,
            body.frag20, body.prog20, body.overdrive20,
            body.frag30, body.prog30, body.overdrive30,
            body.characterId
        );

        db.close();

        return {
            success: true,
            characterId: body.characterId,
            message: `Partner "${exists.name}" (ID ${body.characterId}) stats updated successfully.`,
        };
    } catch (err: any) {
        if (err.statusCode) throw err;
        throw createError({ statusCode: 500, statusMessage: err.message || 'Failed to update character' });
    }
});

