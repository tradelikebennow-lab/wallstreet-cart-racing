# Charged Item Stacking Implementation Plan

> **For agentic workers:** Use the approved pstack Feature playbook with one implementation owner and an independent review. Steps use checkbox tracking.

**Goal:** Make matching item upgrades exciting and legible while retaining game rules and track visibility.

**Architecture:** Mutation-boundary ItemFeedback receipts drive one pooled renderer event and three bounded HUD cues. S.slots alone determines persistent level visuals. The builder embeds all new code in the standalone HTML.

**Tech Stack:** Vanilla JavaScript, CSS, Canvas, existing Three.js r160, Python builder, Node and Playwright checks.

**Spec:** docs/superpowers/specs/2026-11-01-item-stacking-design.md

## Global Constraints

- Preserve Trump podium, gameplay rules, track visibility, keyboard and touch controls.
- Keep the existing three-button footprint, 24-instance pool, offline HTML and no new dependencies.
- Explicit reset, pause and reduced-motion lifecycle. No growing queues, per-event timers or forced slot layout reads.
- Change 3D source and generated HTML only; preserve earlier editions.

## Throughput checkpoint

- Blocking first steps. Source grounding and two competing sketches precede code.
- Independent workstreams. One owner implements the coupled UX/renderer. Root writes browser verification and docs in disjoint files.
- Shared mutable state. Only the implementation owner writes source and generated HTML until handoff. Root serializes rebuild and delivery after handoff.
- Smallest safe decomposition. Keep classification, HUD and world receipt integration together; split independent browser QA and review.

## Review Focus

- Multiple matching pickups before a render still give the right final level and bonus.
- Refused full-margin repair and already-active shield must not emit successful-use feedback.
- Same-position reset and reduced-motion toggles must not resurrect old effects.
- Simultaneous fully charged slots remain readable and inside narrow/short viewports.
- Repeated feedback must not grow DOM, meshes or geometry or reintroduce hidden ticker growth.

### Task 1: Implement bounded item feedback and HUD

Files: new work/3d/item-feedback.js and tests/item-feedback.test.cjs; modify work/3d/race-ux.js, race-ux.css, renderer.js, enhance.py or upgrade.py; regenerate outputs/bull-run-3d.html.

Interfaces: ItemFeedback record {type,slot,kind,fromLevel,level,bonus}, types collect/upgrade/max-bonus/use. G3.emitItemFeedback(event) replaces G3.emit at all callers. Renderer diagnostics effects.itemFeedback includes type,kind,level,age,particleCount for bounded lifetime verification. Persistent slot badge and pips reflect inventory.

- [x] Write behavioral unit tests for collect, in-place upgrade snapshots, MAX cash receipt, failed pickup/use and consumption. Run to confirm missing behavior.
- [x] Implement pure classification, boundary dispatch, truthful receipts, tiered sound, slot paint and bounded cues. Replace inherited cosmetic duplicates using asserted build hooks.
- [x] Reuse the renderer pool with kind-specific patterns and level intensity. Explicitly clear on reset/mode/reduced-motion and freeze during pause.
- [x] Run unit tests and builder. Confirm generated HTML uses the new path and no extra network dependency.
- [x] Commit this verified unit after browser integration passes.

### Task 2: Verify the built game and deliver

Files: tests/browser-lib.cjs, new tests/item-stacking.cjs, package.json, docs/design and outputs previews.

- [x] Add real-game browser cases for the Review Focus and seven item progressions. Run the feature assertion before implementation to observe failure.
- [x] Run the feature check after implementation, inspect screenshots and fix findings at their source.
- [x] Run npm test and all browser scripts including Speedway/Circuit Breaker stalls; check build reproducibility and git diff --check.
- [x] Obtain independent source review, address material findings with regression checks.
- [x] Commit, copy the user-facing game/screenshots, push the current feature branch and update PR #1 without merging.

## Design synthesis

Root selected A's explicit receipt interface for fewer moving parts, with B's inventory-derived persistent presentation and mutation-boundary copies. Both agree on fixed pools and explicit lifecycle. Independent cross-judge result is recorded with verification.

## Verification outcome

The build is reproducible. All 43 Node tests and nine browser scripts passed. The final stacking script covers five viewports and actual touch use. Root inspected all final screenshots. Reviews found receipt lifecycle and compact-landscape issues, which were fixed and rechecked. Full race acceptance caught an old drift effect caller; it is migrated and covered.
