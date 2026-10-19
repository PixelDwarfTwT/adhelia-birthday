# Adhelia Birthday Three-Act Implementation Plan

> Scope supersedes the earlier six-chapter scrapbook plan.

- [x] Define the three-act design contract in `docs/superpowers/specs/2026-10-19-adhelia-three-act-design.md`.
- [x] Reduce typed content and admin fields to opening, cake, and letter only.
- [x] Remove unused public feature components and their tests.
- [x] Refine the opening, page shell, cake, letter, and audio controls for the stationery direction.
- [x] Add tests for the final two-page journey and letter fallback.
- [x] Run tests, typecheck, lint, and production build.
- [x] Inspect the static build routes and confirm the generated home/admin pages respond.

## Verification

- `npm test`: 5 files, 16 tests passed.
- `npm run typecheck`: passed.
- `npm run lint`: passed.
- `npm run build`: passed.
- Static output responds at `/` and `/admin/` when served from `out/`.
