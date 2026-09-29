import { eulerSolver, rk4Solver } from "./solvers.js";
import type { DerivVec } from "./solvers.js";
import { addVect, scaleVect, norm2 } from "./vector-methods.js";

console.log(addVect([1, 2], [3, 4])); // [ 4, 6 ]
console.log(scaleVect(2, [1, 2, 3])); // [ 2, 4, 6 ]
try {
    console.log(addVect([1, 2], [1, 2, 3])); // throws an Error
} catch (e) {
    console.log("caught:", e instanceof Error ? e.message : String(e));
}

const oscillator: DerivVec = (_t, [x = 0, v = 0]) => [v, -x];

const osc = eulerSolver(oscillator, [1, 0], 0, 1, 10);
console.log(osc.states[0]); // [ 1, 0 ]
console.log(osc.states[1]); // [ 1, -0.1 ]
console.log(osc.states[2]); // [ 0.99, -0.2 ]

console.log(norm2(osc.states.at(-1) ?? [])); // ≈ 1.1046

const decay: DerivVec = (_t, y) => [-2 * (y[0] ?? 0)];
const rkDecay = rk4Solver(decay, [1], 0, 1, 4);
console.log(rkDecay.states.at(-1));

const rkOscillator = rk4Solver(oscillator, [1, 0], 0, 1, 10);
console.log(norm2(rkOscillator.states.at(-1) ?? []));
