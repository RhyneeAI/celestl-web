const PALETTE = ['#03A8E6', '#ACFF82', '#F768DD', '#4CAED1', '#7B5D85'];

export function jacketGradient(seed: string): string {
    let hash = 0;
    for (const char of seed) {
        hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
    }

    const a = hash % PALETTE.length;
    const b = (a + 1 + ((hash >>> 4) % (PALETTE.length - 1))) % PALETTE.length;

    return `linear-gradient(${hash % 360}deg, ${PALETTE[a]}, ${PALETTE[b]})`;
}

export function artworkBackground(url: string | null | undefined, seed: string): string {
    const trimmed = (url || '').trim();
    if (trimmed) {
        return `url("${trimmed}") center / cover no-repeat #16133e`;
    }
    return jacketGradient(seed);
}
