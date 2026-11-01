const assert=require('node:assert/strict');
const {openGame}=require('./browser-lib.cjs');
(async()=>{
 const {browser,page:p,errors}=await openGame();
 const shaderErrors=[];p.on('console',m=>{if(m.type()==='error')shaderErrors.push(m.text());});
 try{
  await p.evaluate(()=>{raceQA.clean(410);raceQA.S.inv0=0;raceQA.S.shield=10;raceQA.S.shieldHits=1;raceQA.hurt(10,'TEST',null);raceQA.render3D(0);});
  let fx=await p.evaluate(()=>get3DInfo().effects);assert(fx,'effect diagnostics available');assert(fx.shieldVisible&&fx.shieldImpact<.1,'final absorbed hit remains visible');
  await p.screenshot({path:'.work/effects-shield.png'});
  await p.evaluate(()=>advanceTime(120));assert((await p.evaluate(()=>get3DInfo().effects)).shieldVisible,'spent shield still shows expanding contact ripple');await p.screenshot({path:'.work/effects-shield-ripple.png'});
  await p.evaluate(()=>advanceTime(1000));fx=await p.evaluate(()=>get3DInfo().effects);assert(!fx.shieldVisible,'spent shield ripple expires');
  await p.evaluate(()=>{raceQA.clean(4199.9);raceQA.S.shield=5;raceQA.S.shieldHits=1;raceQA.hurt(1,'final contact',null);raceQA.setMode('paused');raceQA.render3D(0);});
  const pausedImpact=await p.evaluate(()=>get3DInfo().effects.shieldImpact);
  await p.evaluate(()=>advanceTime(1000));fx=await p.evaluate(()=>get3DInfo().effects);
  assert.equal(fx.shieldImpact,pausedImpact,'pause freezes shield ripple age');assert(fx.shieldVisible,'paused contact ripple remains visible');
  await p.evaluate(()=>{raceQA.setMode('play');advanceTime(20);});
  assert.equal(await p.evaluate(()=>raceQA.S.mode),'finish','last shield contact occurs immediately before finish');
  assert((await p.evaluate(()=>get3DInfo().effects)).shieldVisible,'last shield contact remains visible at finish');
  await p.evaluate(()=>advanceTime(700));fx=await p.evaluate(()=>get3DInfo().effects);
  assert(!fx.shieldVisible,'spent shield ripple expires during finish after resuming');
  await p.evaluate(()=>advanceTime(4000));
  assert.equal(await p.evaluate(()=>raceQA.S.mode),'results');assert(!(await p.evaluate(()=>get3DInfo().effects)).shieldVisible,'spent shield stays hidden in results');
  await p.evaluate(()=>{raceQA.clean(415);raceQA.S.shots=Array.from({length:100},(_,i)=>({s:420+i*.1,x:i%3-1}));raceQA.render3D(.1);});
  fx=await p.evaluate(()=>get3DInfo().effects);assert(fx.trailCount>0&&fx.trailCount<=fx.trailCapacity,'exhaust is visible and bounded');assert(fx.rampArrows>0,'ramp guides visible');
  await p.screenshot({path:'.work/effects-ramp.png'});
  await p.evaluate(()=>{raceQA.clean(2850);raceQA.S.rugs=[{s:2865,x:0}];raceQA.render3D(.1);});await p.screenshot({path:'.work/effects-lava-oil.png'});
  await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>raceQA.render3D(.1));const a=await p.evaluate(()=>get3DInfo().effects);await p.evaluate(()=>raceQA.render3D(.5));const b=await p.evaluate(()=>get3DInfo().effects);assert.equal(a.ambientTime,b.ambientTime,'ambient flow freezes with reduced motion');assert.equal(b.trailCount,0);
  await p.evaluate(()=>{raceQA.clean();raceQA.render3D(0);});assert.equal((await p.evaluate(()=>get3DInfo().effects)).shieldVisible,false);
  assert.deepEqual(errors,[]);assert.deepEqual(shaderErrors,[]);assert(await p.evaluate(()=>get3DInfo().effects.shadersReady),'shaders compile');console.log('PASS shield contact/expiry, pooled trails, surface arrows, reduced motion, shader compilation');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
