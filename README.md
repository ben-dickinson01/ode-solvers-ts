# README

[![CI](https://github.com/ben-dickinson01/ode-solvers-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/ben-dickinson01/ode-solvers-ts/actions/workflows/ci.yml)

ODE solvers written in TypeScript. This is my first project in TypeScript, so it doubles as a
way to learn the language and its tooling.

Currently implements forward Euler and classical Runge-Kutta 4. The step-by-step bookkeeping
lives in one place: `integrate` takes a `Stepper` — a function that advances the state by one
step — and returns a full `Solver`. So `eulerSolver` is just `integrate(eulerStep)`, and adding
a new method means writing its update formula and nothing else:

```ts
type Stepper = (f: DerivVec, yi: number[], t: number, step: number) => number[];

const eulerStep: Stepper = (f, yi, t, step) => addVect(yi, scaleVect(step, f(t, yi)));
const eulerSolver: Solver = integrate(eulerStep);
```

Add the new solver to the list at the top of the tests and the shared tests cover it
automatically.

`rootfinders.ts` has Newton-Raphson and bisection. They are there for implicit methods like
backward Euler, which has to solve `y - yn - h*f(t+h, y) = 0` at every step, but neither is
wired into a solver yet. Newton takes the derivative explicitly and converges quadratically;
bisection only needs a bracket where the sign changes, so it also works on functions Newton
cannot touch, like `|x| - 1`.

`vector-methods.ts` has the componentwise helpers the solvers are built from: `addVect`,
`scaleVect` and `norm2`.

Generative AI (Claude) was used to set up the tooling (ESLint, Prettier, vitest) and to get an initial project idea. The solvers and tests are mine.

## Running it

```bash
npm install
npm run test:run      # lint, then run the tests
npx tsx src/demo.ts   # worked examples
npm run check         # typecheck, lint, format and tests
```

## Notes

The tests check mathematical facts as well as checking if the code runs. The convergence
tests confirm that halving the step size cuts Euler's error by about 2x and RK4's by about 16x,
which is what first- and fourth-order accuracy predict. There are also tests that Euler's
energy drifts on the harmonic oscillator while RK4's does not.

The root finders get the same treatment. Newton's error ratio `e(n+1)/e(n)^2` is checked
against `|f''/(2f')|` at the root, which is what quadratic convergence predicts, and
bisection's bracket is checked to halve exactly each step. The iterates are recovered by
passing in a derivative that records what it is called with, so neither function needed
changing to be measured.

Strict settings are on, including `noUncheckedIndexedAccess`, which types `arr[i]` as
`T | undefined` and is most of the reason the code avoids bare indexing.

`typescript@6` is used rather than 7 because `typescript-eslint` needs the JavaScript compiler
API that 7 no longer ships. `@typescript/native-preview` provides `tsgo` for fast typechecking
alongside it.

Tested with Node 24 and TypeScript 6.0.3.
