import { describe, it, expect } from "vitest";
import { eulerSolver, rk4Solver, addVect, norm2 } from "./solvers.js";
import type { DerivVec, Solver } from "./solvers.js";

const decay: DerivVec = (_t, y) => [-2 * (y[0] ?? 0)];
const exact = Math.exp(-2);
const timetest: DerivVec = (t) => [t];
const oscil: DerivVec = (t, [x, v]) => [v ?? 0, -(x ?? 0)];

const solvers: [string, Solver][] = [
    ["euler", eulerSolver],
    ["rk4", rk4Solver],
];

describe("addVect", () => {
    it("adds componentwise", () => {
        expect(addVect([1, 2], [3, 4])).toEqual([4, 6]);
    });
    it("throws on length mismatch", () => {
        expect(() => addVect([1, 2, 3], [1, 2])).toThrow("addVect : length mismatch");
    });
});

describe.each(solvers)("%s bookkeeping", (_name, solver) => {
    const n = 4;
    const sol = solver(decay, [1], 0, 1, n);

    it("has n+1 times", () => {
        expect(sol.times.length).toBe(n + 1);
    });
    it("has n+1 states", () => {
        expect(sol.states.length).toBe(n + 1);
    });
    it("first time is t0", () => {
        expect(sol.times[0]).toBe(0);
    });
    it("last time is near t1", () => {
        expect(sol.times.at(-1)).toBeCloseTo(1, 10);
    });
    it("initial state is y0", () => {
        expect(sol.states[0]).toEqual([1]);
    });
});

describe("decay, n = 4", () => {
    it("euler final state is 0.0625", () => {
        expect(eulerSolver(decay, [1], 0, 1, 4).states.at(-1)?.[0]).toEqual(0.0625);
    });
    it("rk4 final state is close to 0.13555", () => {
        expect(rk4Solver(decay, [1], 0, 1, 4).states.at(-1)?.[0]).toBeCloseTo(0.13555, 4);
    });
});

describe("convergence order", () => {
    const errorAt = (solver: Solver, n: number): number => {
        const est = solver(decay, [1], 0, 1, n).states.at(-1)?.[0] ?? NaN;
        return Math.abs(est - exact);
    };
    it("euler first order", () => {
        const ratio = errorAt(eulerSolver, 100) / errorAt(eulerSolver, 200);
        expect(ratio).toBeGreaterThan(1.9);
        expect(ratio).toBeLessThan(2.1);
    });
    it("rk4 fourth order", () => {
        const ratio = errorAt(rk4Solver, 160) / errorAt(rk4Solver, 320);
        expect(ratio).toBeGreaterThan(14);
        expect(ratio).toBeLessThan(18);
    });
});

describe("time-dependent derivative", () => {
    it("rk4 works to 12 digits", () => {
        expect(rk4Solver(timetest, [0], 0, 1, 16).states.at(-1)?.[0]).toBeCloseTo(0.5, 12);
    });
    it("euler at n=4 gives 0.375", () => {
        expect(eulerSolver(timetest, [0], 0, 1, 4).states.at(-1)?.[0]).toEqual(0.375);
    });
});

describe("oscillator, n = 10", () => {
    it("euler energy grows to about 1.1046", () => {
        expect(norm2(eulerSolver(oscil, [1, 0], 0, 1, 10).states.at(-1) ?? [])).toBeCloseTo(
            1.1046,
            3,
        );
    });
    it("rk4 energy remains within 1e-6 of 1", () => {
        expect(norm2(rk4Solver(oscil, [1, 0], 0, 1, 10).states.at(-1) ?? [])).toBeCloseTo(1, 6);
    });
});

describe.each(solvers)("%s oscillator dimension", (_name, solver) => {
    const y0 = [0, 1];
    const sol = solver(oscil, y0, 0, 1, 10);
    it("keeps state dimension equal to y0", () => {
        expect(sol.states.every((s) => s.length === y0.length)).toBe(true);
    });
});
