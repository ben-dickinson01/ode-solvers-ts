export interface RootFindOptions {
    tolerance?: number;
    maxIterations?: number;
}

/**
 * Solve g(x) = 0 by Newton-Raphson, using the supplied analytic derivative.
 * Throws if the derivative vanishes or the iteration does not converge.
 */
export function newtonRaphson(
    g: (x: number) => number,
    dgdx: (x: number) => number,
    x0: number,
    options: RootFindOptions = {},
): number {
    const { tolerance = 1e-12, maxIterations = 100 } = options;
    let xi = x0;
    for (let i = 0; i < maxIterations; i++) {
        const slope = dgdx(xi);
        if (slope === 0)
            throw new Error(`newtonRaphson: zero derivative at x = ${xi} after ${i} iterations`);
        const dx = g(xi) / slope;
        xi -= dx;
        if (Math.abs(dx) < tolerance) return xi;
    }
    throw new Error(`newtonRaphson: no convergence in ${maxIterations} iterations`);
}

export function bisectionFinder(
    g: (x: number) => number,
    a: number,
    b: number,
    options: RootFindOptions = {},
): number {
    const { tolerance = 1e-12, maxIterations = 100 } = options;
    if (a >= b) throw new Error(`Bisection: invalid interval, ${a} greater than or equal to ${b}`);
    let midpoint = (a + b) / 2;
    let ga = g(a);
    const gb = g(b);
    if (ga === 0) return a;
    if (gb === 0) return b;
    if (ga * gb >= 0)
        throw new Error(`Bisection: invalid interval, g(${a}) and g(${b}) have same sign`);
    for (let i = 0; i < maxIterations; i++) {
        midpoint = (a + b) / 2;
        const gm = g(midpoint);
        if (b - a < tolerance || Math.abs(gm) < tolerance) return midpoint;
        if (ga * gm < 0) {
            b = midpoint;
        } else {
            a = midpoint;
            ga = gm;
        }
    }
    throw new Error(`bisection: no convergence in ${maxIterations} iterations`);
}
