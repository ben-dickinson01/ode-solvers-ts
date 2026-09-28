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

export type DerivVec = (t: number, y: number[]) => number[];
export interface Solution {
    times: number[];
    states: number[][];
}
export type Solver = (f: DerivVec, y0: number[], t0: number, t1: number, n: number) => Solution;

export const eulerSolver: Solver = (f, y0, t0, t1, n) => {
    let yi = y0;
    const h = (t1 - t0) / n;
    const vals = [y0];
    const times: number[] = [t0];
    for (let i = 0; i < n; i++) {
        yi = addVect(yi, scaleVect(h, f(t0 + i * h, yi)));
        vals.push(yi);
        times.push(t0 + (i + 1) * h);
    }
    return { times: times, states: vals };
};

export const rk4Solver: Solver = (f: DerivVec, y0: number[], t0: number, t1: number, n: number) => {
    let yi = y0;
    const h = (t1 - t0) / n;
    const vals = [y0];
    const times: number[] = [t0];
    for (let i = 0; i < n; i++) {
        const t = t0 + i * h;
        const k1 = f(t, yi);
        const k2 = f(t + h / 2, addVect(yi, scaleVect(h / 2, k1)));
        const k3 = f(t + h / 2, addVect(yi, scaleVect(h / 2, k2)));
        const k4 = f(t + h, addVect(yi, scaleVect(h, k3)));
        yi = addVect(
            yi,
            scaleVect(h / 6, addVect(k1, addVect(scaleVect(2, k2), addVect(scaleVect(2, k3), k4)))),
        );
        vals.push(yi);
        times.push(t + h);
    }
    return { times: times, states: vals };
};

export function norm2(v: number[]): number {
    return v.reduce((sum, x) => sum + x * x, 0);
}
