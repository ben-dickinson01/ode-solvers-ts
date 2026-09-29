export function addVect(a: number[], b: number[]): number[] {
    const out: number[] = [];
    for (const [i, ai] of a.entries()) {
        const bi = b[i];
        if (bi === undefined) throw new Error("addVect : length mismatch");
        out.push(ai + bi);
    }
    return out;
}

export function scaleVect(k: number, a: number[]): number[] {
    return a.map((ai) => k * ai);
}

/** Squared Euclidean norm. */
export function norm2(v: number[]): number {
    return v.reduce((sum, x) => sum + x * x, 0);
}
