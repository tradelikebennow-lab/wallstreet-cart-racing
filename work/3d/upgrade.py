from pathlib import Path


def replace_once(source, old, new):
    count = source.count(old)
    if count != 1:
        raise ValueError(f'Upgrade hook expected once, found {count}: {old[:100]}')
    return source.replace(old, new, 1)


def upgrade(s):
    helpers = '\n'.join(Path('work/3d/' + name + '.js').read_text() for name in ['handling', 'course', 'camera'])
    s = replace_once(s, '// Real WebGL scene.', helpers + '\n// Real WebGL scene.')
    s = replace_once(s, 'Object.assign(P, { drifting:false,', 'Object.assign(P, { vx:0, heading:0, rampLaunchId:null, drifting:false,')
    old = '''  P.steer += (st - P.steer) * Math.min(1, w * 14);
  if (S.mode !== 'dying') P.x += P.steer * (P.drifting ? .85 : 3.3) * w - curvAt(P.s) * P.v * 2.6 * w;
  P.x = clamp(P.x, -2.7, 2.7);'''
    new = '''  const roadSurface=Course.sampleCourse(P.s,P.x);
  if(S.mode!=='dying')Object.assign(P,Handling.stepHandling(P,{steer:st,drifting:P.drifting},{...roadSurface,curvature:curvAt(P.s),offroad:Math.abs(P.x)>1.62,airborne:P.y>.05,grip:P.freeze>0?.13:roadSurface.grip},w));'''
    s = replace_once(s, old, new)
    s = replace_once(s, '  P.s += dz;', '''  const ramp=Course.crossedRampExit(P.s,P.s+dz);
  P.s += dz;
  if(ramp&&P.rampLaunchId!==ramp.id){P.rampLaunchId=ramp.id;if(P.y<=.001&&P.vy<=0&&P.freeze<=0&&Math.abs(P.x)<=1.62){P.vy=ramp.launchSpeed;P.slide=0;sfx.jump();}}''')
    s = replace_once(s, 'const curvAt = s => { const i = s | 0;', 'const curvAt = s => { if(s>180&&s<330)return .006*Math.sin(Math.PI*(s-180)/150)**2; const i = s | 0;')
    s = replace_once(s, 'function addObs(type, x, span, extra = 0) {', '''function addObs(type, x, span, extra = 0) {
  if(!Course.isSpawnClear(P.s+FAR+extra,EV[type].depth||1.6))return null;''')
    s = replace_once(s, 'function spawnRow() {', '''function spawnRow() {
  if(!Course.isSpawnClear(P.s+FAR,12)){addCoins(0,0,5);return;}''')
    s = replace_once(s, 'player: { s: +P.s.toFixed(1),', 'player: { vx:+(P.vx||0).toFixed(3), heading:+(P.heading||0).toFixed(3), rampLaunchId:P.rampLaunchId, s: +P.s.toFixed(1),')
    s = replace_once(s, '  render3D();\n  if (S.mode', '  render3D(dt);\n  if (S.mode')
    s = replace_once(s, 'step(1 / 60); render3D(); hud();', 'step(1 / 60); render3D(ms/1000); hud();')
    return s
