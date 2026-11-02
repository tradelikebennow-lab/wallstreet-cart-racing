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

- **Bull Run 3D:** the latest version, with drift turbo tiers, animated Trump podium hazards, 3D power-ups, spectators, effects, arcade audio, and a music track for each sector.
- **Bull Run Grand Prix:** the earlier colorful 2D racing edition.
- **Midnight Exchange:** the alternative visual edition.

## Controls

- Left/right arrows or A/D: steer.
- Hold Shift while steering, then release Shift: drift turbo.
- Up arrow or Space: jump; down arrow: slide.
- 1, 2, 3: use items; P: pause.
- Mobile: hold a screen edge to steer. Hold DRIFT with another finger, then release it to boost.
- Pause menu: music toggle. SND button: mute music and effects.

See the in-game guide for the complete rules and touch controls.

## Rebuild the 3D edition

Python 3 is required. Run from the repository root:

```sh
python3 work/3d/build.py
```

The builder combines `outputs/bull-run-grand-prix.html` with the renderer and enhancements in `work/3d/`, and writes `outputs/bull-run-3d.html`. Every patch states how many times its anchor must appear in the source; if an edit to the 2D file moves one, the build stops and names the anchor instead of writing a game with a feature missing. The earlier 2D HTML files are standalone source editions.

The sector music lives in `work/3d/music/` as 96 kbps MP3s (`circuit.mp3`, `speedway.mp3`, `castle.mp3`). The build embeds them in the HTML, so the 3D edition still plays music when opened straight from disk.

## Third-party code and music

Three.js is distributed under the MIT license; see `outputs/THREE-LICENSE.txt`. This repository does not assign a license to the original game code.

Music by MintoDog, released under CC0 on OpenGameArt and re-encoded at a lower bitrate:

- Circuit: [Sunny City](https://opengameart.org/content/sunny-city)
- Crypto Speedway: [Blossom Mountain (Remake)](https://opengameart.org/content/blossom-mountainremake)
- Meltdown Castle: [Sky Blue Street](https://opengameart.org/content/sky-blue-street)
