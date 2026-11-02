# Charged item stacking verification

## What changed

Matching pickups now show a distinct collect, upgrade or MAX cash receipt. The held slot shows one, two or three level marks, layered icon art and a steady MAX READY badge. Consumption clears its level marks immediately. Higher levels play rising chimes. Each of the seven item kinds has a different small pattern around or behind the kart. The effects reuse one 24-instance pool. Circuit Breaker's expanding pulse is reserved for actual use.

The HUD uses tactile surfaces and restrained foil shading inspired by ThreeUI. There is no ThreeUI package, Pro source, extra renderer, dependency or new runtime network request. The shared existing game state and item rules remain authoritative. Trump construction and podium hopping are unchanged.

## Design and review

Two isolated design candidates explored explicit receipts and snapshot-derived transitions. The independent cross-judge chose explicit receipts. Persistent badges still derive from inventory, and scalar levels are copied before in-place upgrades. One implementation owner handled the coupled source. Browser verification and final integration remained separate.

Independent source review found two receipt lifecycle defects. Changing reduced motion erased the receipt, and finish ticks erased the prize. Both were reproduced by failing tests and fixed. A fresh follow-up review confirmed both fixes. Full browser acceptance then found drift release still called the removed effect API. That caller now sends an explicit turbo receipt; acceptance checks that the effect appears without consuming an item. The old effect API has no retained compatibility shim.

Visual inspection found crowded level marks. Dedicated rows now separate badges, names, actions and level marks. A new 320x568 check also caught conservative kart bounds extending below the health strip. Compact portrait camera aim now keeps the bounds above that strip. Desktop and normal portrait keep their established camera settings. Short landscape uses the wider camera even below a 1.8 aspect ratio. A final source review also caught the 600–720-pixel landscape grid cascade; explicit compact row and column ownership fixes it.

## Results

The standalone build and 43 Node tests passed. All nine browser scripts passed, including the new stacking and actual-touch cases. The source review findings were fixed and checked independently. Preview capture also uses a test-only preserved WebGL drawing buffer and schedules the final frame explicitly; the production renderer keeps its normal buffer behavior.

## Reproduce

Run `npm run build`, `npm test`, and `npm run test:browser`. The item script is `tests/item-stacking.cjs`. Tests execute the generated standalone HTML. `PLAYWRIGHT_MODULE` can identify an existing Playwright installation.

Coverage includes all seven items through LV1, LV2, LV3 and MAX cash conversion, keyboard consumption, actual touch consumption, refused shield/repair, full-rack rejection, two matching contacts in one simulation step, pause/resume, same-position reset, reduced-motion changes, finish prize text, and repeated-event resource bounds. Layout checks cover 1440x900, 390x844, 320x568, 844x390 and 640x360. Static screenshots stop the test page's animation scheduler and advance it explicitly; keyboard/touch and race tests retain the actual scheduler.

The existing suites cover collision rules, replay, a protected three-sector race, news placement, shader compilation, graphics settings, object cleanup and Speedway/Circuit Breaker ticker stalls. Protection in the full-race fixture checks progression rather than competitive difficulty.

## Limits

Headless tests use software WebGL. Resource bounds and behavior are checked; no device FPS or universal smoothness claim is made. Effects are short and localized, and at most 24 instances exist. Broader environment and speedometer redesigns remain separate follow-ups.

[Desktop preview](../images/bull-run-3d-preview.png) · [Phone preview](../images/kart-mobile-preview.png) · [Upgrade effect](../images/kart-item-upgrade-preview.png)
