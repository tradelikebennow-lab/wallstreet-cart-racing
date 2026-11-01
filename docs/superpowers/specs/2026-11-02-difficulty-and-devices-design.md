# Difficulty and mobile/PC support

The next two priorities are competitive Easy/Medium/Hard opponents and deliberate mobile/PC rendering budgets. Complete both, verify the standalone artifact, push the current feature branch to PR #1, then stop unmerged. Broader track art and speedometer redesign remain in the follow-up queue.

## Difficulty

Show Easy, Medium and Hard before starting, with Medium as the default. Persist a validated preference. Freeze the chosen policy for each race and show the active mode during play, pause and results. Native keyboard and touch selection must work. Changing a future selection must not change an underway race or its score category.

Use one immutable table of pace, acceleration, lateral speed, reaction horizon/delay, avoidance probability and attack cooldowns. Keep rival personalities. Remove the existing gap-based rubber-band multiplier rather than compound it. Rivals accelerate and steer normally, can be stunned, and use actual projectiles and traps. Do not change player handling, event damage, item rules, course geometry or starting grid. A successful avoidance plan must not grant immunity; actual position, height and ducking determine hazard hits. No teleportation, forced rank correction or synthetic offscreen stuns.

Store bests separately by difficulty. Validate finite P&L and place 1–6. Import the old single best into Medium once, without deleting it or overwriting newer records. Handle denied/malformed storage. Rank and result estimates use the active race policy.

## Devices and rendering

Keep Auto, Standard and Economy choices. Preserve saved manual Standard/Economy choices. Auto chooses a conservative device profile from pointer capability and viewport workload, without a UA string or timing governor. Graphics changes never affect simulation or difficulty.

Use a pure graphics table for backing-pixel budgets, DPR caps, shadows, scenery LOD and crowd density. Auto phones should start with reduced visual work. Explicit profiles must also cap oversized desktop backing buffers. Economy must measurably reduce new decorative work, beyond the already shipped DPR/shadow-map-size changes. Keep the road, Trump podium, rival karts, hazard tells, pickups, projectiles, shields and stack feedback visible. No new dependency, renderer context or per-event allocation.

Skip crowd updates for invisible stands and reduce Economy decoration density/near detail. Preserve refreshed instance bounds. Retain explicit quality persistence and explain effective Auto mode briefly in settings. Avoid speculative simulation refactors.

Audit actual edge steering, simultaneous drift, jump tap/swipe, slide swipe, item taps, pointer cancellation, blur, pause/resume and rotation while held. Fix stale input ownership at cancellation boundaries. Check title/difficulty/settings fit short portrait and landscape, safe-area spacing, at least 44-pixel touch targets and a visible full kart above the HUD. Preserve PC keyboard controls and native select behavior.

## Architecture and alternatives

Choose fixed race rules captured on reset, with pure policy helpers and thin browser integration. Use explicit renderer profiles with a stateless Auto resolver. Reject contextual player-damage pressure and frame-time governance for this scope because they add hidden balance/timing state. Two design candidates informed this choice; the independent judge's recommendation is recorded with verification.

Maintain S/P as authoritative race state. Difficulty code owns its policy, storage and selector integration. Rendering owns quality budgets and decoration. One owner writes each source area; root alone wires the final builder and runs GPU tests serially.

## Evidence

Before edits, save the current standalone HTML. Compare exact fixed-seed race and scene fixtures. Tests must show Easy < Medium < Hard pace, ordered reaction/attack policies, bounded motion at extreme gaps, real hazard consequences, retained stuns, immutable active selection and separate bests. Drive start/replay and full progression for all levels in the emitted game.

Measure Standard/Economy scene triangles, backing pixels, crowd updates, near/far detail and object/geometry bounds at identical states on baseline and head. Report resource work rather than device FPS. Software WebGL cannot establish real-phone smoothness or battery life. Keep that limit explicit.

Run all current unit/browser regressions, plus difficulty, storage, graphics and actual touch cases. Inspect five device layouts and DPR 1/2/3. Check blocked-network boot and reproducible output. Fix review findings before pushing. No merge or deployment.
