# Wallstreet Cart Racing

A browser trading kart racer with three playable editions.

## Play locally

Open `outputs/index.html` to choose an edition, or open `outputs/bull-run-3d.html` directly for the latest 3D game. The 3D edition requires a WebGL-capable browser and includes Three.js inline.

Alternatively, from the repository root:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Editions

- **Bull Run 3D:** the latest version, with momentum and tire grip, drift turbo tiers, a banked corner and launch ramp, a damped chase camera, animated Trump podium hazards, 3D power-ups, charged item stacking, effects, and arcade audio.
- **Bull Run Grand Prix:** the earlier colorful 2D racing edition.
- **Midnight Exchange:** the alternative visual edition.

## Controls

- Left/right arrows or A/D: steer.
- Hold Shift while steering, then release Shift: drift turbo.
- Up arrow or Space: jump; down arrow: slide.
- 1, 2, 3: use items; P: pause.
- Matching pickups upgrade a held item to level 3. MAX READY shows its strongest version. Another matching pickup awards cash. Using the item consumes the slot at any level.
- Mobile: hold a screen edge to steer. Hold DRIFT with another finger, then release it to boost.
- Pause menu: arcade music and Standard/Economy graphics. SND button: mute music and effects.
- The opening course includes a banked corner and an automatic launch ramp with warning signs.
- Jump input is buffered for 100 ms before landing. Fixed simulation steps and swept collision checks handle fast contacts.

See the in-game guide for the complete rules and touch controls.

## Rebuild the 3D edition

Python 3 is required. Run from the repository root:

```sh
python3 work/3d/build.py
```

The builder combines `outputs/bull-run-grand-prix.html` with the renderer and enhancements in `work/3d/`, and writes `outputs/bull-run-3d.html`. The earlier 2D HTML files are standalone source editions.

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

`PLAYWRIGHT_MODULE` can point to an existing Playwright installation when dependencies are provided by a development environment.

## Third-party code

Three.js is distributed under the MIT license; see `outputs/THREE-LICENSE.txt`. This repository does not assign a license to the original game code.
