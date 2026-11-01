# Difficulty and Device Support Implementation Plan

**Goal.** Add selectable fair opponents and measured mobile/PC rendering profiles, verify and push to GitHub, then stop.
**Spec.** docs/superpowers/specs/2026-11-02-difficulty-and-devices-design.md
**Execution.** Pstack Autonomous run with Feature ownership and independent review. User authorized autonomous completion before bed. Reuse the active feature checkout and PR #1. No merge.
**Exit predicate.** Both priorities implemented; build reproducible; unit and browser gates green; work budgets recorded; previews inspected; independent findings fixed; remote matches local; no work left running.

## Throughput checkpoint

- [x] Blocking first steps. Inspect existing AI, graphics and controls; save baseline; compare two design sketches before code.
- [x] Independent workstreams. One owner handles difficulty and scores. Another handles renderer/device budgets. Root handles builder wiring, browser QA, input corrections and delivery.
- [x] Shared mutable state. Owners use disjoint files. Only root writes build.py and generated HTML. GPU tests run serially. S/P and current input ownership stay authoritative.
- [x] Smallest safe decomposition. Keep each policy/controller together; avoid a new game engine or global event system.

## Priority 1. Difficulty and fair opponents

- [ ] Add pure immutable rules, difficulty parsing, best-record validation/migration and meaningful failing tests first.
- [ ] Add the title selector, per-race frozen policy, active labels and difficulty-specific records through asserted 3D builder patches.
- [ ] Implement bounded rival pace/reactions/attacks; remove compounded catch-up and plan-based immunity. Retain actual stun and projectile rules.
- [ ] Build and drive all three modes, replay, malformed/denied storage, native keyboard selection, same-input race ordering, extreme gaps and actual hazard contacts.
- [ ] Review the unit and generated-browser evidence; commit this unit.

## Priority 2. Device rendering and touch

- [ ] Add failing tests for pure Auto/manual graphics resolution and pixel budgets.
- [ ] Add Auto/Standard/Economy, retain valid manual preferences, apply budgets to rendering and overlay canvas, and reduce Economy scenery/crowd work.
- [ ] Audit held-pointer cancellation, blur and orientation; fix proven stale input paths with regressions. Retain keyboard and two-finger drift.
- [ ] Check title/settings/control reachability on 320x568, 390x844, 640x360, 844x390 and 1440x900 at DPR1/2/3.
- [ ] Compare baseline/head matched scenes and report backing pixels, triangles, decoration updates, shadows and resource bounds. Do not infer device FPS.
- [ ] Review, verify and commit this unit.

## Final gates and delivery

- [ ] Run the full unit and browser suites, all-difficulty protected progression, offline boot and reproducibility checks.
- [ ] Independently review source and evidence. Fix material findings and rerun affected checks.
- [ ] Inspect/copy user previews, game and verification report.
- [ ] Push the current branch, update PR #1, verify remote head and leave it unmerged.
- [ ] Stop and report completed work, evidence, remaining art backlog and real-device limits.

## Follow-up queue after this run

- Environment art and lighting pass by sector, with measured render budgets.
- Speedometer/boost instrument styling inspired by ThreeUI.
- Physical Android/iOS and desktop-GPU playtesting for smoothness, heat, battery and balance. This host cannot substitute for those devices.

## Decision trail

The installed pstack leaves figure-it-out, show-me-your-work, benchmark-checklist, technical-writing, unslop and selected principle leaves are absent. Preserve the decision trail locally and verification in the repository; use available Node/Playwright and explicit resource metrics. No unrelated skill installation or automatic merges.
