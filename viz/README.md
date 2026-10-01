# Visualization base

Generic building blocks for every math experiment.

## Primitives

- 2D canvas rendering
- Animation loop
- Interactive sliders
- Stateful simulations
- Basic 3D projection
- Range mapping
- Value clamping

Keep math-specific logic outside this layer.

A concept should use the primitives it needs:

problem
  ↓
math
  ↓
viz primitive
  ↓
experiment

No framework. No dependency. No global state.
