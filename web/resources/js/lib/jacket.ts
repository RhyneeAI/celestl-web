// Ported from design/admin-dashboard.html's jacket() — a deterministic gradient placeholder for
// songs/packs that don't have (or, in this app, never ship) real jacket/pack art. Real art is
// never committed to this repo (copyright, see CLAUDE.md § Data dan hak cipta); if it exists
// locally on the public disk, callers should layer a real <img>/background-image on top and let
// it fall back to this gradient on 404.
const PALETTE = ['#03A8E6', '#ACFF82', '#F768DD', '#4CAED1', '#7B5D85'];

export function jacketGradient(seed: string): string {
    let hash = 0;
    for (const char of seed) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }

    const a = hash % PALETTE.length;
    // Unsigned shift (>>>), not signed (>>) -- a signed shift can go negative for large hashes,
    // and JS's % doesn't wrap negatives back to positive like Python does. See CLAUDE.md's writeup
    // of this exact bug in the original mockup (it silently broke the background on ~half the
    // songs/packs it was tried on).
    const b = (a + 1 + ((hash >>> 4) % (PALETTE.length - 1))) % PALETTE.length;

    return `linear-gradient(${hash % 360}deg, ${PALETTE[a]}, ${PALETTE[b]})`;
}
