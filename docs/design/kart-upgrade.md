# Kart upgrade brief

## Approved outcome
Improve the 3D edition in priority order: handling, chase camera, effects, forgiving controls and reliable collisions, world readability, rendering efficiency. Preserve the trading rules, all seven items, Trump podium and its lane hopping, clear track corridor, keyboard and touch controls, replay, standalone offline HTML, and the two earlier editions.

## Existing architecture
`work/3d/build.py` reads the standalone 2D Grand Prix HTML, injects `renderer.js`, then applies `enhance.py` and `stages.py`. It emits `outputs/bull-run-3d.html`. The original IIFE owns P (player), S (race), keys and touchSteer. step(dt) advances a variable-delta simulation; tick(dt) calls step then renders. advanceTime provides manual deterministic steps. Lateral steering directly moves P.x. P.y is height over the road. Curvature pushes the player outward. Three.js draws the road relative to P.s using offAt; coord/place own projection. Mesh pools exist for shots and particles. Repeated scenery is instanced, but batches disable frustum culling. Models are simple lit toy meshes. No external runtime dependency is needed to play.

## Target shape
Keep simulation authoritative. Add small pure helpers for handling, course sampling, collision sweeps and camera targets that can be tested in Node. One shared course sampler owns bank and ramp heights used by road, kart and hazard placement. Add a banked corner and launch ramp early in sector one with warning chevrons and safe spawn clearance. Keep lateral momentum bounded and usable on touch. Camera follows smoothly with look-ahead; reduced motion limits roll and extra FOV. Effects use local shaders and bounded particle pools, never full-screen blur or news overlays. Jump buffering is 100 ms. Fixed simulation steps and swept collision checks prevent fast objects skipping contact. World labels face the camera, cap their count and disappear with distance. Performance work uses simpler distant props and correctly updated bounds; do not claim FPS gains from headless rendering.

## Verification
Node behavioral tests for control response, grip, step-rate consistency, course alignment, camera convergence and collision sweeps. Playwright tests against the generated HTML for keyboard and multi-touch, drift tiers, jumps, all items/hazards, podium, shield, pause/resume, results and replay, full protected race, portrait and landscape overlap, reduced motion, WebGL errors and stable geometry counts. Screenshots for actual visual review. Retain reproducible build and portable test instructions.

## Delivery
Work on `kart-feel-upgrade`. Commit ordered verified units. Copy final user-facing outputs to the chat outputs directory and open a preview. Push a feature branch and open a PR for review; do not merge main or publish hosting.
