# Charged item stacking

Players should feel an item become stronger as matching pickups upgrade it. Preserve the trading rules, Trump podium, clear forward road, keyboard and touch controls, and standalone offline HTML.

## Experience

Keep the three current item buttons and their size. Show three level segments and a readable level badge. LV1 is collected, LV2 upgrades with a brief pulse, LV3 upgrades with a stronger pulse and then retains a steady MAX READY edge. A fourth matching pickup shows its actual cash bonus, without implying a fourth level. Consuming an item immediately clears its held/charged appearance. Refused uses and full-rack pickups retain the truthful existing message.

Use item-colored, recognizable local effects. Short uses directed red sparks; Hedge uses blue arcs; Moon uses pink trailing comets; Diamond uses cyan facets; Rug uses orange low spirals; Bailout uses green bill-like flecks; Circuit Breaker uses amber zigzag sparks. Tier controls intensity. Keep effects below the driver's head and close to or behind the kart. A pickup must not look like a fired weapon. Circuit Breaker's actual use keeps its existing expanding track pulse.

Use tactile, layered slot surfaces, a restrained foil edge at MAX, visible key hints, and touch press feedback. Do not add HUD height, center-screen messages, continuous MAX particles, global bloom, new WebGL contexts or dependencies. Upgrade sound rises by level and respects master mute. Keep existing item-action sounds.

## Approaches

A uses explicit collect, upgrade, max-bonus and use receipts captured at mutation boundaries. B derives transitions from copied before/after inventory snapshots with a receipt for unchanged MAX pickups. Choose A for its smaller interface and direct mapping to feedback. Graft B's rule that persistent level visuals derive only from S.slots. Both reject frame-only inventory observation because it misses same-frame transitions and MAX bonuses.

## Data and ownership

S.slots remains authoritative. ItemFeedback is a tagged record with type, slot, kind, fromLevel, level and bonus. At most three transient HUD records and one renderer record exist. Copy numeric levels before pickupBase mutates them. Use a pure outcome classifier with a small public surface. The existing wrappers own dispatch. Drift release uses the same renderer with a separate turbo receipt containing kind MOON and the drift tier; it never enters slot classification or consumes inventory. The renderer reuses its 24-instance pool and updates all shapes through a kind registry; no allocations or new scene nodes per event. Slot paint derives labels/segments from S.slots.

Explicitly clear feedback on reset and leaving play except pause. Pause freezes its clock and CSS animation. Reduced motion preserves badges and text while suppressing movement. Toggling it must not revive old effects. Use a local playing-time effect clock instead of the decorative ambient clock. Remove duplicate inherited pickup flashes/bursts and layout-forcing slot bumps only in the 3D build. Use exact-once generator hooks. Leave the 2D editions unchanged.

## References and limits

ThreeUI's [Spark Badge](https://threeui.com/backgrounds/spark-badge), [Holographic Glitter Card](https://threeui.com/three-js/holographic-glitter-card), and [Shader Buttons](https://threeui.com/buttons/star-portal) inform material and feedback ideas. These are original lightweight game effects, not copied Pro source or embedded site components. Broader environment and speedometer changes are separate follow-ups after this item upgrade is verified.

## Verification

Exercise all seven kinds through acquire, LV2, LV3, MAX bonus and use. Check failed use, full-rack refusal, same-frame pickups, pause/resume, reset at the same distance, finish/results, reduced-motion toggles and graphics quality. Inspect desktop, portrait and short landscape for button bounds and a full kart above the HUD. Check actual touch and keyboard use, stable object/geometry counts during repeated events, and the existing Speedway/Breaker stall regression. Browser timing on software WebGL is not device FPS evidence.
