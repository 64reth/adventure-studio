# Puzzle engines
Five v1 registry entries generate seed-repeatable data, independently solve it, validate it and expose protected blueprints. The engines have no UI or provider dependencies.

Maze: randomized depth-first spanning tree, breadth-first independent route solving, full connectivity and adjacency checks. Route: five ordered symbol clues discriminate four gate codes with exactly one solution. Reveal: 5-row glyph masks for SUN or KEY, even-number camouflage; solver reconstructs the message from displayed cells. Word search: deterministic placement and rejection sampling; scans all eight directions to reject duplicate answer occurrences. Cipher: bijective 26-letter rune substitution; solver reverses the key and rejects missing symbols.

Difficulty currently changes maze dimensions; richer reasoning difficulty remains future work. Invalid sizes, blank seeds, duplicate words, overlong words and unknown reveal text are rejected. No secondary mechanics are represented as complete.
