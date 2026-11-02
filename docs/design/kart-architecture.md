# Kart architecture decision

The original HTML IIFE owns race state and consequences. A Python builder embeds the renderer and patches the simulation to produce offline HTML. The player steers directly across lanes; the renderer maps lane/station coordinates into a moving scene. Terrain is flat, collision checks are mostly endpoint comparisons, and camera position snaps each render. These are the seams this upgrade changes.

Two designs were explored independently. A keeps P/S as the sole gameplay state and adds pure handling, course, camera and collision calculations. B consolidates motion and input into one transition model, which would require migrating the current writers together. The independent comparison scored A higher for preserving rules, integration risk and scope fit. Both were testable.

Choose A. Each helper owns one calculation and exposes a small interface. The existing game owns damage, inventory, scores, AI and mode transitions. A course sample is the single authority for bank, slope and height. The renderer applies terrain height to model roots; animation adds local offsets without overwriting the root surface transform. P.y remains clearance above the road.

Graft B's explicit transform contract and its bounded labels, LOD hysteresis and refreshed instance bounds. Keep matched pre/post actor positions for collision sweeps and resolve a projectile's earliest valid target. Avoid a second mutable player model and an event-bus rewrite.

The cost of this choice is continued use of the existing Python injection pipeline. New replacements must assert expected anchors, and the generated HTML must be tested as well as the pure helpers. This preserves the two original editions and avoids a runtime bundler.
