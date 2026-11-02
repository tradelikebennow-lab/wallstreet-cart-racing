def integrate(s, replace_once):
    def patch(old,new):
        nonlocal s
        s=replace_once(s,old,new)
    patch('function jump() { if (S.mode === \'play\' && P.y <= 0.001 && P.vy <= 0 && P.freeze <= 0) { P.vy = 8.4; P.slide = 0; sfx.jump(); } }', '''function cancelJump(){P.jumpUntil=null;}
function consumeJump(){
  if(P.jumpUntil==null)return false;
  if(simulationTime>P.jumpUntil){cancelJump();return false;}
  if(S.mode!=='play'||P.y>.001||P.vy>0||P.freeze>0)return false;
  cancelJump();P.vy=8.4;P.slide=0;P.slideQ=false;sfx.jump();return true;
}
function requestJump(){if(S.mode==='play'){P.jumpUntil=simulationTime+.1;consumeJump();}}
function jump(){requestJump();}''')
    patch('function reset() {', 'var simulationTime=0,simulationStepper;\nfunction reset() {\n  cancelJump(); simulationTime=0; if(simulationStepper)simulationStepper.reset();')
    patch("  S.mode = m; game.dataset.mode = m; if(m!=='play')cancelDrift();", "  S.mode = m; game.dataset.mode = m; cancelJump(); simulationStepper.reset(); if(m!=='play')cancelDrift();")
    patch("window.addEventListener('blur', () => { keys.l = keys.r = false; ptrs.clear(); setSteer('l', 0); setSteer('r', 0); });", "window.addEventListener('blur', () => { keys.l = keys.r = false; ptrs.clear(); setSteer('l', 0); setSteer('r', 0); cancelJump(); simulationStepper.reset(); });")
    patch("document.addEventListener('visibilitychange', () => {\n", "document.addEventListener('visibilitychange', () => {\n  cancelJump(); simulationStepper.reset();\n")
    patch("  if (!p.used && Math.hypot", "  if(e.type==='pointercancel')cancelJump();\n  if (e.type!=='pointercancel' && !p.used && Math.hypot")
    patch('function step(dt) {', '''function step(dt) {
  simulationTime+=dt;
  if(P.jumpUntil!=null&&simulationTime>P.jumpUntil)cancelJump();''')
    patch('  let w = dt;', '''  const poses=new Map();
  const remember=a=>{if(!poses.has(a))poses.set(a,{s:a.s,x:a.x,y:a.y||0,slide:a.slide||0,t:a.t||0});return poses.get(a);};
  for(const a of [P,...S.ents,...S.rivals,...S.shots,...S.aiShots,...S.rugs])remember(a);
  const contact=(a,b,ds,dx)=>Collision.sweepAabb(remember(a),a,remember(b),b,{s:ds,x:dx});
  const below=(a,overlap,height,inclusive=false)=>{
    if(!overlap)return null;
    const old=remember(a),y0=old.y,y1=a.y||0;
    let lo=overlap.tEnter,hi=overlap.tExit;
    const at=t=>Collision.heightAtContact(y0,y1,t);
    if(inclusive?Math.min(at(lo),at(hi))>height:Math.min(at(lo),at(hi))>=height)return null;
    if(y1<y0&&at(lo)>=height)lo=Math.max(lo,(height-y0)/(y1-y0));
    if(y1>y0&&at(hi)>=height)hi=Math.min(hi,(height-y0)/(y1-y0));
    return {tEnter:lo,tExit:hi};
  };
  const activeContact=(e,overlap)=>Collision.activeHazardContact(e,remember(e),overlap);
  consumeJump();
  let w = dt;''')
    patch('P.land = 0.14; if (P.slideQ)', 'P.land = 0.14; consumeJump(); if (P.slideQ)')
    patch('    e.t += w;', '    remember(e);e.t += w;')
    patch('        if (Math.abs(e.x) > 3.2 && Math.sign(e.x) === e.dir) e.dead = true;', '')
    patch('''        if (Math.abs(dzp) < (def.depth || 0.6) / 2 + 0.3 && Math.abs(P.x - e.x) < e.span * 0.5 + 0.12 && isActive(e)) {
          const k = def.kind, sliding = P.slide > 0 && P.y < 0.15;
          const hit = k === 'low' ? P.y < 0.5 : k === 'pit' ? P.y < 0.25 : k === 'ice' ? P.y < 0.15 : k === 'high' ? !sliding : true;''', '''        const overlap=activeContact(e,contact(P,e,(def.depth||.6)/2+.3,e.span*.5+.12));
        if (overlap) {
          const k=def.kind;
          const clearance=k==='low'?.5:k==='pit'?.25:k==='ice'?.15:null;
          const oldPlayer=remember(P);
          const sliding=Math.min(Collision.heightAtContact(oldPlayer.slide,P.slide,overlap.tEnter),Collision.heightAtContact(oldPlayer.slide,P.slide,overlap.tExit))>0&&Math.max(Collision.heightAtContact(oldPlayer.y,P.y,overlap.tEnter),Collision.heightAtContact(oldPlayer.y,P.y,overlap.tExit))<.15;
          const hit=clearance!==null?!!below(P,overlap,clearance):k==='high'?!sliding:true;''')
    patch('S.ents.filter(e => !e.dead && e.s - cam.s > -2)', "S.ents.filter(e => !e.dead && e.s - cam.s > -2 && !(e.type==='BANKRUN'&&Math.abs(e.x)>3.2&&Math.sign(e.x)===e.dir))")
    patch("} else if (playing && !e.dead && Math.abs(e.s - P.s) < 0.75 && Math.abs(P.x - e.x) < 0.5 && P.y < 1.3) {", "} else if (playing && !e.dead && below(P,contact(P,e,.75,.5),1.3)) {")
    patch('    if (Math.abs(dzr) < 0.8 && Math.abs(a.x - P.x) < 0.5 && a.y < 0.5 && P.y < 0.5) {','    if (below(a,below(P,contact(P,a,.8,.5),.5),.5)) {')
    patch('    s.s += (P.v + 40) * w;', '    remember(s);s.s += (P.v + 40) * w;')
    patch('a.s > s.s - 1 && (!prey || a.s < prey.s)', 'Math.max(remember(a).s,a.s)>remember(s).s-1 && (!prey || a.s < prey.s)')
    patch('if (Math.abs(s.x - e.x) < e.span * 0.5 + 0.1 && Math.abs(e.s - s.s) < 0.8)', 'if (contact(s,e,.8,e.span*.5+.1))')
    patch('      if (prey && Math.abs(prey.s - s.s) < 0.8 && Math.abs(prey.x - s.x) < 0.5) {', '''      const rivalContacts=S.rivals.filter(a=>!a.finished&&a.stun<=0&&Math.max(remember(a).s,a.s)>remember(s).s-1).map(a=>({a,hit:contact(s,a,.8,.5)})).filter(c=>c.hit).sort((a,b)=>a.hit.tEnter-b.hit.tEnter);
      if(rivalContacts.length)prey=rivalContacts[0].a;
      if (rivalContacts.length) {''')
    patch('      if (Math.abs(s.x - e.x) < e.span * 0.5 + 0.08 && e.s <= s.s + 0.5 && e.s > P.s - 0.3 && e.s < tz) { target = e; tz = e.s; }', '      const hit=contact(s,e,.5,e.span*.5+.08);if(hit&&hit.tEnter<tz){target=e;tz=hit.tEnter;}')
    patch('      if (Math.abs(s.x - a.x) < 0.45 && a.s <= s.s + 0.5 && a.s > P.s - 0.3 && a.s < tz) { target = a; tz = a.s; }', '      const hit=contact(s,a,.5,.45);if(hit&&hit.tEnter<tz){target=a;tz=hit.tEnter;}')
    patch('    q.s += q.v * w;', '    remember(q);q.s += q.v * w;')
    patch('if (playing && Math.abs(q.s - P.s) < 0.7 && Math.abs(q.x - P.x) < 0.42 && P.y < 0.55)', 'if (playing && below(P,contact(q,P,.7,.42),.55))')
    patch('    r.t += w;', '    remember(r);r.t += w;')
    patch('if (a.finished || r.dead || Math.abs(a.s - r.s) > 0.6 || Math.abs(a.x - r.x) > 0.5 || a.y > 0.3)', 'if (a.finished || r.dead || !below(a,contact(a,r,.6,.5),.3,true))')
    patch('playing && !r.dead && Math.abs(P.s - r.s) < 0.6 && Math.abs(P.x - r.x) < 0.45 && P.y < 0.3', 'playing && !r.dead && below(P,contact(P,r,.6,.45),.3)')
    patch('  const dt = Math.min(0.05, (now - last) / 1000);', '  const dt = Math.max(0, (now - last) / 1000);')
    patch('function tick(dt) {\n  // Sub-steps of 1/120s or less: one step per frame at 30fps moves a boosted kart further than an obstacle\'s hit window, so it passed straight through.\n  for (let n = Math.ceil(dt * 120), i = 0; i < n; i++) step(dt / n);', '''simulationStepper=Reliability.createStepper(step,()=>S.mode);
function advanceSimulation(dt,manualAdvance=false){simulationStepper.advance(dt,manualAdvance);}
function tick(dt,manualAdvance=false) {
  advanceSimulation(dt,manualAdvance);
  updateDrivingHUD();''')
    patch("window.advanceTime = ms => { manual = true; const n = Math.max(1, Math.round(ms / (1000 / 60))); for (let i = 0; i < n; i++) step(1 / 60); render3D(ms/1000); hud(); drawEq(); };", "window.advanceTime = ms => { manual = true; tick(ms/1000,true); };")
    return s
