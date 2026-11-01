const assert=require('node:assert/strict');
const {openGame}=require('./browser-lib.cjs');
(async()=>{
 const {browser,page:p,errors}=await openGame();
 try{
  await p.evaluate(()=>{raceQA.clean();raceQA.P.x=-.8;});
  await p.keyboard.down('Shift');await p.keyboard.down('ArrowRight');await p.evaluate(()=>advanceTime(2000));
  assert.equal((await p.evaluate(()=>raceQA.snapshot())).drift.tier,3,'A full drift must reach tier three');
  await p.keyboard.up('Shift');await p.keyboard.up('ArrowRight');await p.evaluate(()=>advanceTime(20));
  assert.equal(await p.evaluate(()=>raceQA.P.boostMult),1.5);
  const turbo=await p.evaluate(()=>({fx:get3DInfo().effects.itemFeedback,held:raceQA.S.slots[0]}));assert.equal(turbo.fx?.type,'turbo','drift release still emits its world cue');assert.equal(turbo.fx.level,3);assert.equal(turbo.held.k,'SHORT','drift turbo does not consume a held item');
  await p.evaluate(()=>{raceQA.clean();raceQA.holdDrift(true);raceQA.keys.r=true;advanceTime(800)});
  await p.keyboard.press('p');await p.locator('#bResume').click();await p.evaluate(()=>{raceQA.keys.r=false;advanceTime(20)});
  assert.equal(await p.evaluate(()=>raceQA.P.boost),0,'Pause must cancel drift without a boost');
  await p.evaluate(()=>{raceQA.clean(30);const e=raceQA.addObs('TRUMP',.6,1);e.s=raceQA.P.s+24;e.t=0;e.tx=.6;e.hopT=0;advanceTime(150)});
  assert(await p.evaluate(()=>raceQA.scene().children.some(g=>g.userData.trump)),'Trump model missing');
  assert.notEqual(await p.evaluate(()=>raceQA.S.ents[0].x),.6,'Trump stopped moving between lanes');
  for(const kind of await p.evaluate(()=>raceQA.ORDER)){
   await p.evaluate(k=>{raceQA.clean();raceQA.S.slots=[{k,lv:1},null,null];raceQA.S.margin=50;raceQA.S.shield=0},kind);
   await p.keyboard.press('1');assert.equal((await p.evaluate(()=>raceQA.snapshot())).slots[0],null,'Item not used: '+kind);
  }
  const types=await p.evaluate(()=>Object.keys(raceQA.EV));
  for(const type of types)await p.evaluate(type=>{raceQA.clean(30);const e=raceQA.addObs(type,1,type==='SWAN'?3:1);e.s=raceQA.P.s+12;advanceTime(20)},type);
  await p.evaluate(()=>{raceQA.clean(30);raceQA.addObs('WAR',1,1);advanceTime(20)});
  const before=await p.evaluate(()=>get3DInfo());
  for(let i=0;i<12;i++)await p.evaluate(()=>{raceQA.S.ents=[];const e=raceQA.addObs('WAR',1,1);e.s=raceQA.P.s+10;advanceTime(20)});
  await p.evaluate(()=>{raceQA.S.ents=[];advanceTime(20)});
  const after=await p.evaluate(()=>get3DInfo());assert(after.geometries<=before.geometries+5,'Entity geometry grew without cleanup');
  for(const size of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
   await p.setViewportSize(size);await p.waitForTimeout(150);
   await p.evaluate(()=>{raceQA.clean(30);raceQA.showBreaking('CPI surprise','Jump the low barrier.','Full news context');advanceTime(20)});
   const r=await p.locator('#breaking').boundingBox(),t=await p.locator('.ticker').boundingBox();
   assert(r.y+r.height<=t.y+t.height+1&&r.y+r.height<70,'News obscures track');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
   for(const selector of ['#bDrift','#slot0','#slot1','#slot2']){
    const r=await p.locator(selector).boundingBox();assert(r&&r.x>=0&&r.x+r.width<=size.width+1&&r.y>=0&&r.y+r.height<=size.height+1,'Control outside viewport '+selector);
   }
   await p.screenshot({path:'.work/layout-'+size.width+'.png'});
  }
  await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(100);
  await p.evaluate(()=>{raceQA.clean();raceQA.finish();advanceTime(3500)});
  assert.equal((await p.evaluate(()=>raceQA.snapshot())).mode,'results');assert.equal(await p.locator('#rTable li').count(),6);
  await p.locator('#bAgain').click();await p.evaluate(()=>advanceTime(4000));assert.equal((await p.evaluate(()=>raceQA.snapshot())).mode,'play');
  assert.equal((await p.evaluate(()=>raceQA.snapshot())).drift.charge,0);
  await p.evaluate(()=>{raceQA.clean();window.QA_PROTECTED=true});
  const sectors=new Set();
  for(let i=0;i<24;i++){await p.evaluate(()=>advanceTime(10000));const s=await p.evaluate(()=>raceQA.snapshot());sectors.add(s.sector);if(s.mode==='results')break;}
  assert.equal((await p.evaluate(()=>raceQA.snapshot())).mode,'results','Complete race failed');assert.equal(sectors.size,3);
  assert.deepEqual(errors,[]);console.log('PASS acceptance: tier-3 drift, pause cancellation, Trump hopping, seven items, 13 hazards, cleanup, three layouts, news, results/replay, protected full race');
 }finally{await browser.close();}
 const touch=await openGame({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  const p=touch.page;await p.evaluate(()=>raceQA.clean());
  const cdp=await p.context().newCDPSession(p),r=await p.locator('#bDrift').boundingBox();
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2,id:1},{x:365,y:350,id:2}]});
  await p.evaluate(()=>advanceTime(850));assert((await p.evaluate(()=>raceQA.snapshot())).drift.tier>=1);
  await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await p.evaluate(()=>advanceTime(20));assert((await p.evaluate(()=>raceQA.snapshot())).player.boost>0);
  await p.keyboard.press('p');await p.locator('#musicEnabled').uncheck();await p.locator('#bResume').click();
  await p.evaluate(()=>advanceTime(20));assert.equal(await p.evaluate(()=>raceQA.audio().musicEnabled),false);assert.equal(await p.evaluate(()=>raceQA.audio().musicConnected),false);
  await p.locator('#bMute').click();await p.evaluate(()=>advanceTime(20));assert.equal(await p.evaluate(()=>raceQA.audio().muted),true);
  assert.deepEqual(touch.errors,[]);console.log('PASS touch/audio: actual two-finger drift and release, independent music toggle, master mute');
 }finally{await touch.browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
