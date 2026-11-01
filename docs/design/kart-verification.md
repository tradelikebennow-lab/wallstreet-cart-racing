# Kart upgrade verification

## Scope

The 3D edition gained handling momentum, a shared bank/ramp surface, a damped chase camera, local effects, buffered jumps, continuous contacts, bounded world cues, scenery LOD and graphics controls. The two earlier 2D editions are unchanged.

## Automated evidence

- Python standalone build succeeds. New integration hooks assert expected replacement counts.
- `npm test` passes 36 numerical behavior tests for handling, course continuity and launches, camera bounds, relative-motion contacts and fixed stepping.
- `npm run test:browser` drives the generated artifact through eight browser scripts. Checks cover keyboard and actual two-finger touch drift, all seven items and 13 hazard models, jump buffering, collision protection and clearance rules, pause/blur, results/replay, a protected three-sector race, portrait/landscape control bounds, top-strip news, shader compilation, effect limits, world-cue orientation, graphics controls and resource stability.
- The protected full race uses test-only centering and protection. It verifies race progression, not difficulty or competitive balance.
- Desktop, 390x844 portrait and 844x390 landscape screenshots were inspected. Camera framing was corrected after actual projected kart bounds showed HUD overlap.
- The graphics control was checked through native keyboard typeahead and a real-origin persistence reload.

## Independent review

Two fresh reviewers examined the code and ran focused tests. One reported no findings. The other reproduced a spent shield ripple persisting through the finish/results screens. That issue was reproduced by a failing browser regression, fixed in commit 22785a5, and rechecked successfully. Pause still freezes the effect.

## Decisions and limits

Keep P/S as authoritative gameplay state and use small pure numerical helpers instead of a second motion engine. Shared course sampling aligns rendered surfaces with gameplay coordinates while retaining road-relative obstacle clearance. Presentation and simulation have separate owners; browser verification ran independently of implementation.

The simulation runs at 120 Hz. Browser catch-up accepts at most 250 ms. Explicit manual advances retain countdown remainder into play; pause and terminal mode transitions discard old-mode debt. Buffered jump takes precedence over queued slide on landing.

Scene detail and resource counts were checked. No device FPS improvement is claimed from software-rendered browser tests. Arcade handling and the new course section still benefit from human playtesting for taste and balance.

## Delivery

Feature branch `kart-feel-upgrade` is available in [PR 1](https://github.com/tradelikebennow-lab/wallstreet-cart-racing/pull/1). The updated HTML and desktop/phone/ramp previews are in `outputs/`.

## Playtest follow-up

Speedway/Circuit Breaker stalls were traced to unbounded hidden ticker growth. The fix suspends unmeasurable tickers and caps the queue. A separate source review found no actionable issue. See [the investigation and measurements](../performance/2026-11-01-stalls.md).
