# Kart upgrade implementation plan

> For agentic workers: use the installed Feature workflow. Implement in priority order, prove each unit, then obtain an independent whole-branch review.

**Goal:** Make the existing 3D trading racer feel like a kart race while retaining its humor and clear track view.

**Architecture:** Keep P/S as the authoritative race state. Embed dependency-free numerical helpers for handling, course sampling, camera and swept contacts. The renderer alone converts course coordinates into Three.js coordinates. The builder asserts each new integration replacement.

**Tech stack:** Existing Three.js r160, JavaScript, Python 3 builder, Node behavioral tests, Playwright Chromium.

**Spec:** `docs/design/kart-upgrade.md`.

## Global constraints
- Standalone offline game and two existing 2D editions.
- Preserve all seven items, damage/trading rules, podium caricature and lane hopping.
- Keyboard and simultaneous multi-touch controls.
- Top-strip news, no gameplay-blocking banners.
- Reduced-motion support, bounded particles and labels.
- No new game runtime dependencies and no hosting publish or merge to main.

## Throughput checkpoint
- [x] Blocking first steps. Baseline browser checks, shared coordinate and state ownership, two design candidates.
- [x] Independent workstreams. Root owns browser harness and review; one implementation owner writes coupled simulation/renderer files at a time.
- [x] Shared mutable state. P/S remain single owners. Renderer reads race state and owns presentation state. Sequential stages avoid concurrent renderer writes.
- [x] Smallest safe decomposition. Six ordered priority units, each with a focused behavioral gate and commit. Numerical helpers enable fast tests; the generated HTML receives browser verification.

## Review focus
- Pause/blur/replay must clear held drift, buffered input and camera debt without a free turbo.
- Ramp and bank use one elevation source for road, karts, hazards and decals; obstacle clearance stays road-relative.
- Fast and moving contacts choose the first physical target and preserve invulnerability and jump/slide rules.
- Portrait and landscape keep steering, drift and item controls usable; labels do not fill the racing corridor.
- Dynamic instance bounds must not hide visible geometry; effects and geometry counts stay bounded over replay.

## 1. Handling and shared course
Files: new `work/3d/handling.js`, `course.js`, `upgrade.py`; modify builder, renderer and state hooks. Tests: `tests/handling.test.cjs`, `course.test.cjs`.
- [x] Write and run failing tests for momentum, neutral settling, countersteer, reduced grip, edge clamp and time partition consistency.
- [x] Implement `stepHandling(state,input,surface,dt)` with returned x/vx/steer/heading. Consume effective steer after existing freeze/reverse rules.
- [x] Implement `sampleCourse(s,x)`, `crossedRampExit(s0,s1)`, `isSpawnClear(s,depth)` from one early-sector bank/ramp descriptor table. Keep P.y road-relative and launch once at the ramp lip. Add warning chevrons and spawn clearance.
- [x] Renderer uses shared course elevation/bank/pitch for road, edge marks, kart and hazards. Builder replacement misses fail loudly.
- [x] Run numerical tests, generated-game keyboard/drift and actual bank/ramp screenshot checks. Commit verified unit.

## 2. Chase camera
Files: new `work/3d/camera.js`; modify renderer. Test: `tests/camera.test.cjs`.
- [x] Write and run failing tests for damping/convergence, viewport targets, bounded jump following and reduced-motion roll/FOV.
- [x] Add stable damped follow and look-ahead. Camera follows course slope, bank and speed without snapping on normal steering. Reset presentation state on mode transition or replay.
- [x] Test in browser with manual steering, bank, ramp, boost, pause and phone viewport. Commit.

## 3. Effects and audio feedback
Files: renderer, new focused effect helper if needed, arcade audio hooks. Tests: generated-game effect checks.
- [x] Add failing checks for shield hit pulse and bounded visible trail effects.
- [x] Add localized animated shield, directional boost/ramp material, flowing lava, distinct missile exhaust and glossy oil. Reuse bounded pools. Retain current music/mute controls and add landing/launch cues if absent.
- [x] Check all item paths, reduced motion and shader compile errors, then inspect screenshots. Commit.

## 4. Input and collision reliability
Files: new `collisions.js`, control/simulation integration in upgrade.py; test helpers and browser.
- [x] Write and run failing tests for fast pass-through, moving-vs-moving contact, earliest target and diagonal miss.
- [x] Add fixed-step accumulator shared by browser/manual stepping, bounded catch-up, and 100 ms jump buffer consumed once on landing.
- [x] Capture previous poses before movement; sweep hazards, pickups, missile variants and rival missiles without changing game consequences. Check road-relative height at contact and retain slide rules.
- [x] Test 30/60/144 Hz partitions, early/expired jump input, freeze, shield, invulnerability and pause/reset. Commit.

## 5. World readability
Files: renderer and guide copy. Tests: browser label bounds and screenshots.
- [x] Add camera-facing compact rival and pickup/action cues with distance and count limits. Keep physical signage and Trump speech intact.
- [x] Show corner/ramp warnings in world and guide. Keep all news in the top ticker.
- [x] Inspect desktop, 390x844 portrait, 844x390 landscape and reduced motion. Commit.

## 6. Rendering efficiency and quality
Files: renderer and pause options. Tests: renderer introspection and repeat-race browser checks.
- [x] Add simpler distant scenery and correct refreshed instance bounds before enabling culling. Keep near gameplay objects recognizable.
- [x] Avoid recomputing hidden geometry. Add a low/standard graphics choice if needed to bound mobile shadow and pixel costs.
- [x] Validate visible bounds and near/far detail, no shader errors, and stable geometry counts. Report scene counts only, not unsupported FPS gains. Commit.

## Delivery gate
- [x] Run Node suite, repeatable build, complete protected race, all hazards/items, touch and keyboard, pause/results/replay, mobile bounds and news strip checks.
- [x] Independent review of final diff. Fix important findings with regression tests.
- [x] Update README and final screenshots, copy outputs to chat deliverables, open preview.
- [x] Push feature branch and open ready PR. Verify remote head and PR URL. Do not merge.
