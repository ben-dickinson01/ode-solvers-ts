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

export type Stepper = (f: DerivVec, yi: number[], t: number, step: number) => number[];

export const eulerStep: Stepper = (f, yi, t, step) => {
    const ynew = addVect(yi, scaleVect(step, f(t, yi)));
    return ynew;
};

export type Integrate = (stepper: Stepper) => Solver;

export const integrate: Integrate = (stepper) => (f, y0, t0, t1, n) => {
    let yi = y0;
    const step = (t1 - t0) / n;
    const vals = [y0];
    const times = [t0];
    let t = t0;
    for (let i = 0; i < n; i++) {
        yi = stepper(f, yi, t, step);
        vals.push(yi);
        t += step;
        times.push(t);
    }
    return { times, states: vals };
};

export const eulerSolver: Solver = integrate(eulerStep);

export const rk4Step: Stepper = (f, yi, t, step) => {
    const k1 = f(t, yi);
    const k2 = f(t + step / 2, addVect(yi, scaleVect(step / 2, k1)));
    const k3 = f(t + step / 2, addVect(yi, scaleVect(step / 2, k2)));
    const k4 = f(t + step, addVect(yi, scaleVect(step, k3)));
    const ynew = addVect(
        yi,
        scaleVect(step / 6, addVect(k1, addVect(scaleVect(2, k2), addVect(scaleVect(2, k3), k4)))),
    );
    return ynew;
};

export const rk4Solver: Solver = integrate(rk4Step);

export function norm2(v: number[]): number {
    return v.reduce((sum, x) => sum + x * x, 0);
}
