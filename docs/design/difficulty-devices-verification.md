# Difficulty and device verification

The 3D edition now offers Easy, Medium and Hard opponents before the race. Each race captures its policy, shows it in the HUD, pause menu and results, and records its bests separately. Results offer a keyboard/touch Change difficulty action to return to setup. Rival pace, reaction delays and weapon timing change. Player handling, course and item consequences stay the same. Gap-based catch-up and avoidance-plan immunity were removed.

Auto graphics chooses Economy for touch or compact screens and Standard for larger desktop screens. Players can override it in pause settings. Both canvases share pixel budgets; Economy reduces decorative scenery and crowds and disables dynamic shadows. Local font fallbacks remove external boot requests. Earlier 2D editions are unchanged.

## Verification gates

Run from the repository root with Python 3, Node.js and Playwright Chromium:

```sh
npm run build
npm test
npm run test:browser
npm run profile:devices
```

The standalone HTML rebuilds byte-for-byte. Its SHA-256 is `b3f55163c56d281eb0dd07581702a71ec42c8dba2a59e6dc51b18b1b58695f5c`.

The unit suite contains 66 behavior tests. The twelve serial browser scripts cover keyboard steering/jumping/drift/items, real simultaneous touch steering/drift, tap/swipe actions and item activation, actual swept collisions, all item upgrades, camera framing, pause and replay, settings and resource cleanup. Speedway and Circuit Breaker ticker-stall regressions remain included.

New difficulty checks run the emitted HTML, rather than only the policy helper. They exercise native selector keys, immutable active rules, replay, mode-specific records, one-time legacy Medium import, malformed/denied storage, physical projectiles and rugs, actual hazard hits and GAVEL phase boundaries. Protected player runs visit all three sectors, finish and replay in every mode. Protection and centering are test-only. Those runs prove progression, not human race balance.

The layout harness checks 320×568 at DPR1, 390×844 at DPR3, 640×360 at DPR2, 844×390 at DPR3 and 1440×900 at DPR2. It checks scrollable title/settings reachability, 44px controls, native graphics selection, persistence, backing alignment, no horizontal overflow or overlapping top panels, full kart clearance and news within the top radio strip. Network requests are blocked and the final artifact makes zero external requests. Two additional fixtures simulate notch/home-indicator insets by replacing CSS env values in the test-only artifact. They check 390×844 with top44/bottom34 and 844×390 with left44/right44/bottom21. Radio content, HUD panels, controls and scrolled overlay actions must remain in the usable rectangle. These simulations do not claim iOS Safari coverage. Short landscape uses one row of top panels to expose more road. Tall portrait framing leaves clearance above the lower HUD, and drift instructions match pointer capability.

Actual touch tests reproduce and cover first-finger steering ownership, cancellation, pause/resume, width-changing rotation, blur and lost capture. A canceled drift touch cannot release a newer keyboard drift. Height-only viewport changes retain steering so a mobile browser toolbar resize does not interrupt the player.

## Rival calibration

The emitted-game clear-track fixture starts all five rivals at rest, uses the same input/random conditions and runs the actual updateAI over the full 4,200-unit course. Completion times in seconds are:

| Rival | Easy | Medium | Hard |
| --- | ---: | ---: | ---: |
| HAL | 175.81 | 161.82 | 151.97 |
| DEE | 170.63 | 157.05 | 147.49 |
| BETTY | 179.45 | 165.16 | 155.11 |
| Q9K | 168.97 | 155.53 | 146.06 |
| RICK | 189.26 | 174.18 | 163.58 |

Every personality keeps the intended order. Additional tests bound acceleration/lateral movement at extreme gaps and retain stuns. This isolated fixture measures policy separation; it does not include hazards or establish human difficulty balance.

## Rendering work comparison

Baseline is commit `372d9e0`, saved before edits. `tests/device-budgets.cjs` uses identical static states at stations 60, 1450 and 2850, with rivals, Trump, held items and a shield present. The host uses ANGLE/SwiftShader software WebGL. Counters measure work, not physical phone FPS, latency, battery or temperature. Full values are in [the comparison JSON](../performance/2026-11-02-device-budgets.json).

| Viewport/profile | WebGL pixels before → after | Overlay pixels before → after | Triangles reduced across sectors |
| --- | ---: | ---: | ---: |
| Desktop 1440×900 DPR2, Standard | 3,317,760 → 2,397,816 | 5,184,000 → 2,397,816 | 5.1–7.6% |
| Desktop, Economy | 1,296,000 → 748,980 | 5,184,000 → 748,980 | 10.2–17.4% |
| Phone 390×844 DPR3, Standard | 842,400 → 842,400 | 1,316,640 → 842,400 | 5.5–7.8% |
| Phone, Economy | 329,160 → 329,160 | 1,316,640 → 329,160 | 11.0–17.9% |

The existing phone WebGL DPR reductions are not claimed as new savings. New work reductions come from skipping invisible crowds, reducing Economy scenery/detail and crowd density, and disabling its shadow pass. Crowd transforms fall from 72 per frame to 36–48 on Standard and 18–24 on Economy in these scenes. Both profiles cap oversized desktop buffers. All gameplay entities, road and podium remain present.

## Review and remaining work

Independent review reproduced two defects before fixing them. GAVEL contacts previously used end-of-step activity for rivals; both players and rivals now clip swept contacts to the same active interval. Canceled drift touches previously retained release authority; input ownership now clears before capture release. Targeted regressions and source re-review cover both fixes.

Pstack's Migrate Callers Then Delete Legacy APIs principle shaped the GAVEL fix. Both callers use the shared contact helper and the duplicate player implementation is removed. The build and twelve browser checks remain rerunnable artifacts for the next maintainer. Optional pstack leaves absent from this installation were recorded in the plan; no unrelated skills were installed.

Physical Android/iOS and desktop-GPU playtesting remains necessary for smoothness, heat, battery use and race balance. Emulated touch and viewport tests do not replace hardware testing. The next feature priorities are sector environment art/lighting and the speedometer/boost styling pass. The [remaining-work plan](../superpowers/plans/2026-11-02-difficulty-and-devices.md) records these separately from the completed run.

## Delivery evidence

Final checks completed on 2026-11-02. `npm test` passed 66/66; `npm run test:browser` exited 0 after all twelve scripts and all seven layout fixtures. The repeated build is byte-identical at the SHA-256 above. Independent source review has no outstanding actionable findings.

[Desktop preview](../../outputs/bull-run-3d-preview.png) · [Phone preview](../../outputs/kart-mobile-preview.png).
