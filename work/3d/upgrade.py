from patching import read, sub


def upgrade(s):
    helpers = '\n'.join(read('work/3d/' + name + '.js') for name in ['handling', 'course', 'camera', 'collisions', 'reliability'])
    s = sub(s, '// Real WebGL scene.', helpers + '\n// Real WebGL scene.')
    s = sub(s, 'Object.assign(P, { drifting:false,', 'Object.assign(P, { vx:0, heading:0, rampLaunchId:null, drifting:false,')
    old = '''  P.steer += (st - P.steer) * Math.min(1, w * 14);
  if (S.mode !== 'dying') P.x += P.steer * (P.drifting ? .85 : 3.3) * w - curvAt(P.s) * P.v * 2.6 * w;
  P.x = clamp(P.x, -2.7, 2.7);'''
    new = '''  const roadSurface=Course.sampleCourse(P.s,P.x);
  if(S.mode!=='dying')Object.assign(P,Handling.stepHandling(P,{steer:st,drifting:P.drifting},{...roadSurface,curvature:curvAt(P.s),offroad:Math.abs(P.x)>1.62,airborne:P.y>.05,grip:P.freeze>0?.13:roadSurface.grip},w));'''
    s = sub(s, old, new)
    s = sub(s, '  P.s += dz;', '''  const ramp=Course.crossedRampExit(P.s,P.s+dz);
  P.s += dz;
  if(ramp&&P.rampLaunchId!==ramp.id){P.rampLaunchId=ramp.id;if(P.y<=.001&&P.vy<=0&&P.freeze<=0&&Math.abs(P.x)<=1.62){P.vy=ramp.launchSpeed;P.slide=0;sfx.jump();}}''')
    s = sub(s, 'const curvAt = s => { const i = s | 0;', 'const curvAt = s => { if(s>180&&s<330)return .006*Math.sin(Math.PI*(s-180)/150)**2; const i = s | 0;')
    s = sub(s, 'function addObs(type, x, span, extra = 0) {', '''function addObs(type, x, span, extra = 0) {
  if(!Course.isSpawnClear(P.s+FAR+extra,EV[type].depth||1.6))return null;''')
    s = sub(s, 'function spawnRow() {', '''function spawnRow() {
  if(!Course.isSpawnClear(P.s+FAR,12)){addCoins(0,0,5);return;}''')
    s = sub(s, 'player: { s: +P.s.toFixed(1),', 'player: { vx:+(P.vx||0).toFixed(3), heading:+(P.heading||0).toFixed(3), rampLaunchId:P.rampLaunchId, s: +P.s.toFixed(1),')
    s = sub(s, '  render3D();\n  if (S.mode', '  render3D(dt);\n  if (S.mode')
    s = sub(s, 'step(1 / 60); render3D(); hud();', 'step(1 / 60); render3D(ms/1000); hud();')
    s = sub(s, 'shield: 0, shieldHits: 0,', 'shieldImpact: 99, shield: 0, shieldHits: 0,')
    s = sub(s, "  if (S.shield > 0) {\n    if (!S.shieldAll", "  if (S.shield > 0) {\n    S.shieldImpact=0;\n    if (!S.shieldAll")
    s = sub(s, 'function step(dt) {', "function step(dt) {\n  if(S.mode!=='paused')S.shieldImpact=Math.min(99,S.shieldImpact+dt);")
    s = sub(s, "function tickerPush(html, cls) { const s = document.createElement('span'); s.className = 'tk' + (cls ? ' ' + cls : ''); s.innerHTML = html; tkTrack.appendChild(s); }", """const TICKER_LIMIT = 96;
function tickerPush(html, cls) {
  if (tkTrack.childElementCount >= TICKER_LIMIT) {
    tkTrack.firstElementChild.remove();
    tkX = 0;
  }
  const s = document.createElement('span');
  s.className = 'tk' + (cls ? ' ' + cls : '');
  s.innerHTML = html;
  tkTrack.appendChild(s);
}""")
    s = sub(s, """function tickerUpdate(dt) {
  // A hidden strip measures 0 wide, so the fill loop below would keep adding quotes forever and slow every frame.
  if (!tkWrap.clientWidth) return;
  tkX -= dt * 64;
  const first = tkTrack.firstElementChild;
  if (first) { const w = first.offsetWidth; if (-tkX > w) { tkX += w; first.remove(); } }
  let guard = 0;
  while (tkTrack.scrollWidth + tkX < tkWrap.clientWidth * 1.5 && guard++ < 8) tickerPush(quote());
  tkTrack.style.transform = `translateX(${tkX.toFixed(1)}px)`;
}""", """function tickerUpdate(dt) {
  const width = tkWrap.clientWidth;
  if (width <= 0) return;
  const first = tkTrack.firstElementChild;
  const firstWidth = first ? first.offsetWidth : 0;
  if (first && firstWidth <= 0) return;
  tkX -= dt * 64;
  if (first && -tkX > firstWidth) { tkX += firstWidth; first.remove(); }
  let guard = 0;
  while (tkTrack.childElementCount < TICKER_LIMIT && tkTrack.scrollWidth + tkX < width * 1.5 && guard++ < 8) tickerPush(quote());
  tkTrack.style.transform = `translateX(${tkX.toFixed(1)}px)`;
}""")
    from reliability import integrate
    s = integrate(s, sub)
    return s
