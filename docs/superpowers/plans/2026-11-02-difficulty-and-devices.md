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

- [x] Add pure immutable rules, difficulty parsing, best-record validation/migration and meaningful failing tests first.
- [x] Add the title selector, per-race frozen policy, active labels and difficulty-specific records through asserted 3D builder patches.
- [x] Implement bounded rival pace/reactions/attacks; remove compounded catch-up and plan-based immunity. Retain actual stun and projectile rules.
- [x] Build and drive all three modes, replay, malformed/denied storage, native keyboard selection, same-input race ordering, extreme gaps and actual hazard contacts.
- [x] Review the unit and generated-browser evidence; commit this unit.

## Priority 2. Device rendering and touch

- [x] Add failing tests for pure Auto/manual graphics resolution and pixel budgets.
- [x] Add Auto/Standard/Economy, retain valid manual preferences, apply budgets to rendering and overlay canvas, and reduce Economy scenery/crowd work.
- [x] Audit held-pointer cancellation, blur and orientation; fix proven stale input paths with regressions. Retain keyboard and two-finger drift.
- [x] Check title/settings/control reachability on 320x568, 390x844, 640x360, 844x390 and 1440x900 at DPR1/2/3.
- [x] Compare baseline/head matched scenes and report backing pixels, triangles, decoration updates, shadows and resource bounds. Do not infer device FPS.
- [x] Review, verify and commit this unit.

## Final gates and delivery

- [x] Run the full unit and browser suites, all-difficulty protected progression, offline boot and reproducibility checks.
- [x] Independently review source and evidence. Fix material findings and rerun affected checks.
- [x] Inspect/copy user previews, game and verification report.
- [ ] Push the current branch, update PR #1, verify remote head and leave it unmerged.
- [ ] Stop and report completed work, evidence, remaining art backlog and real-device limits.

## Follow-up queue after this run

- [ ] Next feature. Prototype sector art and lighting for Sunshine, Crypto and Meltdown. Compare two visual candidates, retain hazard silhouettes, and keep the recorded Economy budgets.
- [ ] Then improve speedometer and boost instruments. Show speed and turbo charge at a glance, preserve touch target sizes and the clear racing corridor, and inspect portrait/landscape before replacing the current readout.
- [ ] Hardware validation before claiming production readiness. Play Easy/Medium/Hard on physical Android, iOS Safari and a desktop GPU. Check smoothness, heat, battery, notch/browser-toolbar changes, and human race balance. This host cannot substitute for those devices. Use the results to tune the existing profiles before adding more effects.

## Decision trail

The installed pstack leaves figure-it-out, show-me-your-work, benchmark-checklist, technical-writing, unslop and selected principle leaves are absent. Preserve the decision trail locally and verification in the repository; use available Node/Playwright and explicit resource metrics. No unrelated skill installation or automatic merges.

## Integration notes

Both owners verified their units before integration. The final builder emits one artifact, so the difficulty and device source changes are committed together after the combined gates. Additional review regressions cover GAVEL phase boundaries, stale drift ownership, narrow/short HUDs, results-to-setup navigation and notch/home-indicator spacing. Five native viewport fixtures and two explicitly simulated safe-area fixtures are covered.
