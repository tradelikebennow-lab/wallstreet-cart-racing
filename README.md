# Wallstreet Cart Racing

A browser trading kart racer with three playable editions.

## Play locally

Open `outputs/index.html` to choose an edition, or open `outputs/bull-run-3d.html` directly for the latest 3D game. The 3D edition requires a WebGL-capable browser and includes Three.js inline. It uses local font fallbacks and boots without network requests.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Editions

- **Bull Run 3D:** the latest version, with momentum and tire grip, drift turbo tiers, a banked corner and launch ramp, a damped chase camera, animated Trump podium hazards, 3D power-ups, charged item stacking, effects, arcade audio, a music track for each sector, and Easy/Medium/Hard opponents.
- **Bull Run Grand Prix:** the earlier colorful 2D racing edition.
- **Midnight Exchange:** the alternative visual edition.

## Controls

- Left/right arrows or A/D: steer.
- Hold Shift while steering, then release Shift: drift turbo.
- Up arrow or Space: jump; down arrow: slide.
- 1, 2, 3: use items; P: pause.
- Matching pickups upgrade a held item to level 3. MAX READY shows its strongest version. Another matching pickup awards cash. Using the item consumes the slot at any level.
- Mobile: hold the ◀ ▶ corner buttons to steer, tap the road to jump, swipe down to slide, tap a slot to fire. In 3D, drift by holding ◀ or ▶ with one thumb and the DRIFT button on the other side with the other thumb; release DRIFT to boost. Pause and rotation clear held controls.
- Choose Easy, Medium or Hard on the title screen. Rival pace, reactions and weapon timing change; player handling stays the same. The chosen mode is fixed for that race. Results include Change difficulty to return to setup. Best records are separate, and an existing record imports into Medium once.
- Pause menu: music toggle and Auto/Standard/Economy graphics. Auto uses Economy for touch or compact screens and Standard for larger desktop screens. Manual choices persist. Economy reduces scenery, crowds and shadows. SND button: mute music and effects.
- The opening course includes a banked corner and an automatic launch ramp with warning signs.
- Jump input is buffered for 100 ms before landing. Fixed simulation steps and swept collision checks handle fast contacts.

See the in-game guide for the complete rules and touch controls.

## Rebuild the 3D edition

Python 3 is required. Run from the repository root:

```sh
python3 work/3d/build.py
```

The builder combines `outputs/bull-run-grand-prix.html` with the renderer and enhancements in `work/3d/`, and writes `outputs/bull-run-3d.html`. Every patch states how many times its anchor must appear in the source; if an edit to the 2D file moves one, the build stops and names the anchor instead of writing a game with a feature missing. The earlier 2D HTML files are standalone source editions.

## Verify changes

The build uses Python 3. Tests use Node.js and Playwright Chromium. Install test dependencies once:

```sh
npm install
npx playwright install chromium
```

Run the numerical behavior tests and generated-game browser checks:

```sh
npm run build
npm test
npm run test:browser
```

Browser checks cover keyboard and simultaneous touch drifting, items and hazards, jump buffering, collision protection rules, pause, replay, a protected full race, mobile layouts, news placement, shader compilation, labels, graphics settings, and resource cleanup. The protected race uses test-only invulnerability and centering to exercise progression; it is not a difficulty or balance test. Screenshots go to the ignored `.work/` directory. Scene counts are diagnostics, not an FPS benchmark. Hidden-news ticker growth is covered by the Speedway/Circuit Breaker regression. See [the stall investigation](docs/performance/2026-11-01-stalls.md).

Difficulty, storage, full progression/replay in every mode, five responsive layouts, DPR budgets and touch cancellation have dedicated browser checks. See [difficulty and device verification](docs/design/difficulty-devices-verification.md) for evidence and the remaining real-device testing.

Run `npm run profile:devices` for matched scene work counters. `BUDGET_HTML` can select an earlier standalone artifact and `BUDGET_TAG` names its JSON report under `.work/overnight/`.

`PLAYWRIGHT_MODULE` can point to an existing Playwright installation when dependencies are provided by a development environment.

## Music files

The sector music lives in `work/3d/music/` as 96 kbps MP3s (`circuit.mp3`, `speedway.mp3`, `castle.mp3`). The build embeds them in the HTML, so the 3D edition still plays music when opened straight from disk.

## Third-party code and music

Three.js is distributed under the MIT license; see `outputs/THREE-LICENSE.txt`. This repository does not assign a license to the original game code.

Music by MintoDog, released under CC0 on OpenGameArt and re-encoded at a lower bitrate and matched in loudness:

- Circuit: [Sunny City](https://opengameart.org/content/sunny-city)
- Crypto Speedway: [Blossom Mountain (Remake)](https://opengameart.org/content/blossom-mountainremake)
- Meltdown Castle: [Sky Blue Street](https://opengameart.org/content/sky-blue-street)
