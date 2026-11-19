from pathlib import Path
import re
from patching import read, sub
# The 2D game is the source the 3D edition is built from; only the built 3D game is published.
s=read('work/3d/bull-run-grand-prix.html')
# The 2D short-landscape layout squeezes the 3D edition's larger item rack, so it stays out of the 3D build.
s,n=re.subn(r'/\* Short landscape phones:[^\n]*\n@media\(orientation:landscape\) and \(max-height:500px\)\{[^\n]*\}\n','',s)
if n!=1:raise SystemExit(f'Build anchor matched {n} times, expected 1: 2D short-landscape rule')
s=sub(s,'<title>Bull Run Grand Prix · Trading Racer</title>','<title>Bull Run 3D · Opening Bell Cup</title>')
s=sub(s,'<script>','<script>\n'+read('work/3d/three.min.js')+'\n</script>\n<script>',count=1)
s=sub(s,"function render() {", "function renderLegacy() {")
s=sub(s,'  render();','  render3D();')
s=sub(s,'  buildUI(); updateBest(); resize();','  buildUI(); updateBest(); init3D(); resize();')
s=sub(s,'  buildWall();\n}', '  buildWall();\n  if(G3) G3.resize();\n}')
s=sub(s,'function proj(lane, z, h = 0) {','function proj(lane, z, h = 0) {\n  if(G3) return G3.project(lane,z,h);')
s=sub(s,'// ---------- loop ----------',read('work/3d/renderer.js')+'\n// ---------- loop ----------')
s=sub(s,"'bull-run-grand-prix-best'","'bull-run-3d-best'",found=2)
s=sub(s,'01 / The Grand Prix edition','THE OPENING BELL CUP / 3D EDITION')
s=sub(s,'Bull Run<span>Grand Prix</span>','Bull Run<span>Grand Prix</span><em class="badge3d">3D</em>')
s=sub(s,'Big trades. Tiny karts. Race five rival traders through a wild market adventure — from opening bell to the finish line.','A big little racing world. Take the wheel, chase the market, and race five rival traders all the way to the closing bell.')
s=sub(s,'<a class="switch-edition" href="midnight-exchange.html">Try Midnight ↗</a>','')
a=s.index('<svg class="hero-art"');b=s.index('</svg>',a)+6;s=s[:a]+s[b:]
s=sub(s,'</style>','''
#world3d{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:0}
#view{z-index:1;background:transparent}#game[data-mode="title"] #view{visibility:visible}
#title{background:linear-gradient(90deg,#f6f5e8fa 0%,#f6f5e8f5 28%,#f6f5e8c7 42%,#f6f5e800 66%);display:block;padding:7vh 5vw;pointer-events:none}
#title .sheet{display:block;margin:0;width:100%}#title .hero-copy{max-width:490px;pointer-events:auto}#title .logo{font-size:clamp(60px,6.4vw,94px);position:relative;line-height:.95}#title .logo span{font-size:.74em;white-space:nowrap}
.badge3d{display:inline-block;background:#28556c;color:#fff;border:3px solid white;border-radius:10px;font:900 19px Arial;padding:5px 10px;transform:rotate(-8deg);text-shadow:none;-webkit-text-stroke:0;vertical-align:middle;margin-top:15px;letter-spacing:.04em}
#title .track-cards{display:none}#title .guide{max-width:490px;pointer-events:auto;margin-top:24px;padding-top:12px;background:#fff8;border-radius:12px;padding-inline:16px}#title .guide[open]{background:#fffef5f7;max-height:50vh;overflow:auto}#title .guide .course,#title .guide .rules,#title .guide .arsenal{grid-template-columns:1fr}#title .hero-meta{margin-top:28px}.edition{font-size:10px;letter-spacing:.14em}
.hud .panel{box-shadow:0 5px 18px #23445620}.breaking{width:min(450px,calc(100% - 28px));padding:9px 12px}.breaking b{font-size:23px}.breaking .hist{font-size:10px}.breaking .hint{font-size:13px}
.bottom{width:min(455px,calc(100% - 28px))}.webgl-error{position:absolute;inset:20%;padding:35px;background:#fffdf2;z-index:99;color:#1a3650;border-radius:20px}.webgl-error a{color:#bf4936}
@media(max-width:800px){#title{padding:45px 22px;background:linear-gradient(180deg,#f6f5e8f7 0%,#f6f5e8eb 42%,#f6f5e866 70%,#f6f5e800)}#title .hero-copy{max-width:490px;margin:auto}.hero-copy .lede{font-size:15px}#title .logo{font-size:64px}#title .guide{margin:22px auto 0}#title .hero-meta{display:none}#title .edition{font-size:9px}.badge3d{font-size:14px;margin-top:12px}.breaking{top:245px}.breaking .hist{display:none}.breaking b{font-size:19px}.breaking .hint{font-size:12px}.hud-c{opacity:.95}.health{padding:6px 10px}.health .hl b{font-size:16px}.wpn{min-height:51px}}
</style>''')
s=sub(s,'for (let i = 0; i < n; i++) tick(1 / 60);','for (let i = 0; i < n; i++) step(1 / 60); render3D(); hud(); drawEq();')
# Restore the browser's display sizing while keeping canvas overlay resolution managed by resize.
s=sub(s,'Wall Street Circuit','Sunshine Circuit',found=2)
from enhance import enhance
s=enhance(s)
from stages import stages
s=stages(s)
from upgrade import upgrade
s=upgrade(s)
from competition import integrate as integrate_competition
s=integrate_competition(s,sub)
from devices import integrate as integrate_devices
s=integrate_devices(s,sub)
from controls import integrate as integrate_controls
s=integrate_controls(s,sub)
s=sub(s,'<label class="difficulty-choice" for="difficultyMode">','''<label class="difficulty-choice" for="driverChoice">Driver <select id="driverChoice" aria-label="Driver"><option value="bull">Bull</option><option value="bear">Bear</option></select></label><label class="difficulty-choice" for="difficultyMode">''')
s=sub(s,'<script>', '<!-- Three.js license\n'+read('work/3d/THREE-LICENSE.txt')+'\n-->\n<script>',found=2,count=1)
Path('outputs/index.html').write_text(s,encoding='utf-8')
Path('outputs/THREE-LICENSE.txt').write_text(read('work/3d/THREE-LICENSE.txt'),encoding='utf-8')
print('Built standalone 3D edition:',len(s),'bytes')
