import { describe, it, expect, vi } from "vitest";
import { newtonRaphson, bisectionFinder } from "./rootfinders.js";
import type { RootFindOptions } from "./rootfinders.js";

describe("newtonRaphson on x^2-2, maxIterations = 100, tolerance = 1e-12", () => {
    const options: RootFindOptions = {
        tolerance: 1e-12,
        maxIterations: 100,
    };
    const g = (x: number) => x ** 2 - 2;
    const dgdx = (x: number) => 2 * x;

    // the starting guess selects which root is found
    const cases: [number, number][] = [
        [1, Math.SQRT2],
        [-1, -Math.SQRT2],
        [10, Math.SQRT2],
        [-1e-10, -Math.SQRT2],
    ];
    it.each(cases)("x0 = %s converges to %s", (x0, expected) => {
        expect(newtonRaphson(g, dgdx, x0, options)).toBeCloseTo(expected, 12);
    });
    it("x0 = 0 throws error for zero derivative", () => {
        expect(() => newtonRaphson(g, dgdx, 0, options)).toThrow(
            `newtonRaphson: zero derivative at x = 0 after 0 iterations`,
        );
    });
});
/** Pairs each element with the one after it: [a,b,c] -> [[a,b],[b,c]]. */
function consecutive(xs: number[]): [number, number][] {
    return xs.slice(0, -1).map((x, i) => [x, xs[i + 1] ?? NaN]);
}

describe("newtonRaphson iteration counts", () => {
    const g = (x: number) => x ** 2 - 2;
    const root = Math.SQRT2;
    // for x^2 - 2 the asymptotic error constant is |f''/(2f')| = 1/(2*sqrt2)
    const C = 1 / (2 * Math.SQRT2);

    // dgdx is called once per iteration, so its call count is the iteration count
    const iterationsFor = (x0: number, tolerance: number) => {
        const dgdx = vi.fn((x: number) => 2 * x);
        newtonRaphson(g, dgdx, x0, { tolerance, maxIterations: 200 });
        return dgdx.mock.calls.length;
    };

    // dgdx also receives the current iterate, so recording its argument
    // recovers the whole sequence without changing newtonRaphson's API
    const errorSequence = (x0: number) => {
        const iterates: number[] = [];
        newtonRaphson(
            g,
            (x) => {
                iterates.push(x);
                return 2 * x;
            },
            x0,
            { tolerance: 1e-15, maxIterations: 50 },
        );
        return iterates.map((x) => Math.abs(x - root));
    };

    it("converges quickly for nearby guess", () => {
        expect(iterationsFor(1, 1e-12)).toBeLessThanOrEqual(10);
    });

    it("tightening the tolerance costs only a couple of iterations", () => {
        expect(iterationsFor(1, 1e-12) - iterationsFor(1, 1e-3)).toBeLessThanOrEqual(3);
    });

    it("converges from a distant guess in logarithmically more steps", () => {
        expect(iterationsFor(1e6, 1e-12)).toBeLessThanOrEqual(30);
        expect(iterationsFor(1e6, 1e-12)).toBeGreaterThan(iterationsFor(1, 1e-12));
    });

    it("has e_{n+1} bounded by C * e_n^2", () => {
        const e = errorSequence(1);
        // ignore the tail, where the errors are at the noise floor
        const steps = e
            .map((en, n) => ({ en, next: e[n + 1] }))
            .filter((s): s is { en: number; next: number } => s.next !== undefined && s.en > 1e-8);

        expect(steps.length).toBeGreaterThanOrEqual(3);
        for (const { en, next } of steps) {
            expect(next).toBeLessThanOrEqual(2 * C * en ** 2);
        }
    });

    it("has e_{n+1}/e_n^2 approaching |f''/(2f')|", () => {
        const steps = consecutive(errorSequence(1)).filter(([en]) => en > 1e-8);
        const last = steps.at(-1);
        expect(last).toBeDefined();
        const [en, next] = last ?? [NaN, NaN];
        expect(next / en ** 2).toBeCloseTo(C, 3);
    });

    it("is not merely linear: e_{n+1}/e_n keeps shrinking", () => {
        const ratios = consecutive(errorSequence(1))
            .filter(([en]) => en > 1e-8)
            .map(([en, next]) => next / en);
        expect(ratios.length).toBeGreaterThanOrEqual(3);
        for (const [previous, current] of consecutive(ratios)) {
            expect(current).toBeLessThan(previous);
        }
    });
});

describe("newtonRaphson on linear takes 2 iterations", () => {
    const g = (x: number) => 2 * x - 4;
    const iterationsFor = (x0: number) => {
        const dgdx = vi.fn(() => 2);
        newtonRaphson(g, dgdx, x0);
        return dgdx.mock.calls.length;
    };

    it("2x - 4, x0 = 1", () => {
        expect(iterationsFor(1)).toBe(2);
    });
    it("2x - 4, x0 = 1e6", () => {
        expect(iterationsFor(1e6)).toBe(2);
    });
    it("2x - 4, x0 = -1e12", () => {
        expect(iterationsFor(-1e12)).toBe(2);
    });
    it("2x - 4, x0 = 0", () => {
        expect(iterationsFor(0)).toBe(2);
    });
});

describe("newtonRaphson cycles", () => {
    it("does not converge on x^3-2x+2, x0 = 0", () => {
        expect(() =>
            newtonRaphson(
                (x) => x ** 3 - 2 * x + 2,
                (x) => 3 * x ** 2 - 2,
                0,
            ),
        ).toThrow("newtonRaphson: no convergence in 100 iterations");
    });
});

describe(`bisection on x^2 - 2, maxIterations = 100, tolerance = 1e-12`, () => {
    const cases: [number, number, number][] = [
        [0, 4, Math.SQRT2],
        [1, 2, Math.SQRT2],
        [-2, 0, -Math.SQRT2],
    ];
    const g = (x: number) => x ** 2 - 2;
    const options = { tolerance: 1e-12, maxIterations: 100 };
    it.each(cases)(`interval %s to %s converging to %s`, (a, b, expected) => {
        expect(bisectionFinder(g, a, b, options)).toBeCloseTo(expected, 12);
    });
    it(`reverse interval throws error`, () => {
        expect(() => bisectionFinder(g, 2, 0, options)).toThrow(
            "Bisection: invalid interval, 2 greater than or equal to 0",
        );
    });
    it(`interval with no roots [2,3] throws error`, () => {
        expect(() => bisectionFinder(g, 2, 3, options)).toThrow(
            "Bisection: invalid interval, g(2) and g(3) have same sign",
        );
    });
    it(`interval with two roots [-5,5] throws error`, () => {
        expect(() => bisectionFinder(g, -5, 5, options)).toThrow(
            "Bisection: invalid interval, g(-5) and g(5) have same sign",
        );
    });
});

describe("bisection: exact endpoint immediately returns", () => {
    // x^2 - 4 has roots at +-2, both exactly representable, so g(a) or g(b) is
    // exactly 0 and the loop never runs
    const iteratesFor = (a: number, b: number) => {
        const options = { tolerance: 1e-12, maxIterations: 100 };
        const g = vi.fn((x: number) => x ** 2 - 4);
        bisectionFinder(g, a, b, options);
        return g.mock.calls.length - 2; // subtract the two endpoint evaluations
    };
    const cases: [number, number][] = [
        [2, 5],
        [1, 2],
        [-2, -1],
        [-2, 2],
    ];
    it.each(cases)("a=%s, b=%s", (a, b) => {
        expect(iteratesFor(a, b)).toBe(0);
    });
});

describe("bisection: works on non-differentiable function, |x| - 1", () => {
    // |x| - 1 has roots at +-1; Newton cannot handle the kink at 0
    const g = (x: number) => Math.abs(x) - 1;
    const options = { tolerance: 1e-12, maxIterations: 100 };

    it("finds the positive root on [0, 5]", () => {
        expect(bisectionFinder(g, 0, 5, options)).toBeCloseTo(1, 10);
    });

    it("finds the negative root on [-5, 0]", () => {
        expect(bisectionFinder(g, -5, 0, options)).toBeCloseTo(-1, 10);
    });
});

describe("bisection: iteration count is about log2((b - a) / tolerance)", () => {
    const g = (x: number) => x ** 2 - 2;
    const evaluationsFor = (a: number, b: number, tolerance: number) => {
        const counted = vi.fn((x: number) => g(x));
        bisectionFinder(counted, a, b, { tolerance, maxIterations: 200 });
        return counted.mock.calls.length - 2; // subtract the two endpoint evaluations
    };
    const cases: [number, number, number][] = [
        [0, 2, 1e-12],
        [1, 2, 1e-12],
        [0, 2, 1e-6],
    ];
    it.each(cases)("interval %s to %s, tolerance %s", (a, b, tolerance) => {
        const bound = Math.ceil(Math.log2((b - a) / tolerance));
        // the residual check can stop a little early or late, so allow slack
        expect(evaluationsFor(a, b, tolerance)).toBeLessThanOrEqual(bound + 5);
        expect(evaluationsFor(a, b, tolerance)).toBeGreaterThan(bound - 5);
    });

    it("a looser tolerance needs fewer evaluations", () => {
        expect(evaluationsFor(0, 2, 1e-3)).toBeLessThan(evaluationsFor(0, 2, 1e-12));
    });
});

describe("bisection: converges linearly", () => {
    const g = (x: number) => x ** 2 - 2;

    // g is called with a, then b, then each midpoint in turn, so dropping the
    // first two recovers the sequence of midpoints
    const midpoints = (a: number, b: number) => {
        const seen: number[] = [];
        bisectionFinder(
            (x) => {
                seen.push(x);
                return g(x);
            },
            a,
            b,
            { tolerance: 1e-12, maxIterations: 100 },
        );
        return seen.slice(2);
    };

    it("halves the step exactly each iteration", () => {
        const m = midpoints(0, 2);
        const steps = consecutive(m).map(([x, next]) => Math.abs(next - x));
        expect(steps.length).toBeGreaterThanOrEqual(10);
        for (const [previous, current] of consecutive(steps)) {
            expect(current / previous).toBeCloseTo(0.5, 12);
        }
    });

    it("is linear, unlike newtonRaphson which is quadratic", () => {
        // bisection gains one bit per iteration; Newton doubles its digits
        const steps = consecutive(midpoints(0, 2)).map(([x, next]) => Math.abs(next - x));
        const ratios = consecutive(steps).map(([previous, current]) => current / previous);
        const spread = Math.max(...ratios) - Math.min(...ratios);
        expect(spread).toBeLessThan(1e-9); // constant ratio => linear
    });
});

describe("bisection: a residual stopping test can stop early on a flat function", () => {
    // 1e-9 * (x - sqrt2) is tiny near the root, so |g(m)| < tolerance fires
    // while m is still far from sqrt2. The residual is small; the root is not accurate.
    const flat = (x: number) => 1e-9 * (x - Math.SQRT2);
    const options = { tolerance: 1e-12, maxIterations: 100 };

    it("satisfies the residual it tests", () => {
        const root = bisectionFinder(flat, 0, 2, options);
        expect(Math.abs(flat(root))).toBeLessThan(options.tolerance);
    });

    it("does not reach the same accuracy in x", () => {
        const root = bisectionFinder(flat, 0, 2, options);
        expect(Math.abs(root - Math.SQRT2)).toBeGreaterThan(options.tolerance);
    });
});
