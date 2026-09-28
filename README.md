# README

[![CI](https://github.com/ben-dickinson01/ode-solvers-ts/actions/workflows/ci.yml/badge.svg)](https://github.com/ben-dickinson01/ode-solvers-ts/actions/workflows/ci.yml)

ODE solvers written in TypeScript. This is my first project in TypeScript, so it doubles as a
way to learn the language and its tooling.

Currently implements forward Euler and classical Runge-Kutta 4. Both share a single `Solver`
type, so adding another method is just writing a function of that type and adding it to the
list at the top of the tests — the shared tests then cover it automatically.

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

Strict settings are on, including `noUncheckedIndexedAccess`, which types `arr[i]` as
`T | undefined` and is most of the reason the code avoids bare indexing.

`typescript@6` is used rather than 7 because `typescript-eslint` needs the JavaScript compiler
API that 7 no longer ships. `@typescript/native-preview` provides `tsgo` for fast typechecking
alongside it.

Tested with Node 24 and TypeScript 6.0.3.
