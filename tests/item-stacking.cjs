const assert = require('node:assert/strict');
const {openGame} = require('./browser-lib.cjs');

(async () => {
 const {browser, page:p, errors} = await openGame({viewport:{width:1000,height:700},captureWebGL:true});
 try {
  const kinds = await p.evaluate(() => raceQA.ORDER);
  for (const kind of kinds) {
   const stages = await p.evaluate(kind => {
    raceQA.clean(45); raceQA.S.slots = [null,null,null]; raceQA.S.margin = 40;
    const stages = [];
    for (let n=0; n<4; n++) {
     const pnl = raceQA.S.pnl;
     const accepted = raceQA.pickup({kind,x:0});
     const delta = raceQA.S.pnl-pnl;
     advanceTime(20);
     const slot = document.querySelector('#slot0');
     const pips = [...slot.querySelectorAll('.pips i.on')];
     stages.push({accepted,level:raceQA.S.slots[0].lv,pips:pips.length,
      pipsVisible:pips.every(i=>getComputedStyle(i).display!=='none') && getComputedStyle(slot.querySelector('.pips')).display!=='none',
      badge:slot.querySelector('.stack-badge')?.textContent || '',
      feedback:document.querySelector('#raceFeedback').textContent,
      delta,fx:get3DInfo().effects.itemFeedback});
    }
    return stages;
   },kind);
   assert.deepEqual(stages.map(s=>s.level),[1,2,3,3],kind+' inventory levels');
   assert.deepEqual(stages.map(s=>s.pips),[1,2,3,3],kind+' visible tier marks');
   assert(stages.every(s=>s.accepted && s.pipsVisible),kind+' tier marks must be visible');
   assert.match(stages[1].badge,/LV\s*2|2\/3/i,kind+' LV2 badge');
   assert.match(stages[2].badge,/MAX|READY/i,kind+' charged badge');
   assert.match(stages[1].feedback,/UPGRADE|STACK|LV\s*2/i,kind+' upgrade receipt');
   assert.match(stages[2].feedback,/MAX|READY|LV\s*3/i,kind+' max receipt');
   assert.match(stages[3].feedback,/MAX.*\$|BONUS.*\$/i,kind+' max cash receipt');
   assert.equal(stages[3].delta,1000,kind+' actual bonus');
   assert.equal(stages[1].fx?.type,'upgrade');
   assert.equal(stages[2].fx?.level,3);
   assert(stages.every(s=>!s.fx || s.fx.particleCount<=24),'bounded world effect');
   console.log('CHECK tiers and receipts '+kind);
   await p.keyboard.press('1');
   assert.equal(await p.evaluate(()=>raceQA.S.slots[0]),null,kind+' keyboard use');
   assert.equal(await p.locator('#slot0 .pips i.on').count(),0,kind+' consumed level marks clear');
   assert.doesNotMatch(await p.locator('#slot0 .stack-badge').innerText(),/MAX|READY/i,kind+' consumed charge clears');
  }
  await p.evaluate(()=>{raceQA.clean();raceQA.S.slots=[{k:'BAILOUT',lv:2},{k:'HEDGE',lv:2},{k:'SHORT',lv:1}];raceQA.S.margin=100;advanceTime(20);raceQA.use(0);});
  assert.equal(await p.evaluate(()=>raceQA.S.slots[0].lv),2,'failed repair preserves item');
  assert.match(await p.locator('#raceFeedback').innerText(),/FULL/i,'failed repair explains why');
  await p.evaluate(()=>{raceQA.S.shield=5;raceQA.S.shieldHits=2;raceQA.S.shieldAll=true;raceQA.use(1);});
  assert.equal(await p.evaluate(()=>raceQA.S.slots[1].lv),2,'failed shield preserves item');
  const full = await p.evaluate(()=>({accepted:raceQA.pickup({kind:'MOON',x:0}),slots:raceQA.S.slots.map(s=>s.k),message:document.querySelector('#raceFeedback').textContent}));
  assert.equal(full.accepted,false);assert.deepEqual(full.slots,['BAILOUT','HEDGE','SHORT']);assert.match(full.message,/FULL/i);

  const contacts=await p.evaluate(()=>{raceQA.clean(45);raceQA.S.slots=[{k:'SHORT',lv:1},{k:'HEDGE',lv:1},{k:'MOON',lv:1}];for(let i=0;i<2;i++){raceQA.addItem(0,'SHORT');raceQA.S.ents.at(-1).s=raceQA.P.s+.1+i*.1;}advanceTime(20);return{level:raceQA.S.slots[0].lv,remaining:raceQA.S.ents.filter(e=>e.cat==='item'&&!e.dead).length,feedback:document.querySelector('#raceFeedback').textContent};});
  assert.equal(contacts.level,3,'two matching contacts stack even with a full rack');assert.equal(contacts.remaining,0,'accepted matching contacts remove both pickups');assert.match(contacts.feedback,/MAX|READY/i,'same-step MAX receipt');

  await p.evaluate(()=>{raceQA.clean(45);raceQA.S.slots=[{k:'DIAMOND',lv:1},null,null];raceQA.pickup({kind:'DIAMOND',x:0});raceQA.pickup({kind:'DIAMOND',x:0});raceQA.render3D(0);raceQA.setMode('paused');});
  const paused = await p.evaluate(()=>get3DInfo().effects.itemFeedback);
  await p.evaluate(()=>advanceTime(500));
  assert.deepEqual(await p.evaluate(()=>get3DInfo().effects.itemFeedback),paused,'pause freezes stack burst');
  await p.evaluate(()=>{raceQA.setMode('play');advanceTime(1000);});
  assert.equal(await p.evaluate(()=>get3DInfo().effects.itemFeedback?.particleCount || 0),0,'burst expires');
  assert.match(await p.locator('#slot0 .stack-badge').innerText(),/MAX|READY/i,'charged badge persists after burst');

  await p.evaluate(()=>{raceQA.pickup({kind:'HEDGE',x:0});raceQA.pickup({kind:'HEDGE',x:0});raceQA.render3D(0);});
  await p.emulateMedia({reducedMotion:'reduce'});await p.evaluate(()=>raceQA.render3D(.1));
  assert.equal(await p.evaluate(()=>get3DInfo().effects.itemFeedback?.particleCount || 0),0,'reduced motion suppresses stack particles');
  assert.equal(await p.evaluate(()=>document.querySelector('#raceFeedback').hidden),false,'reduced motion retains the readable receipt');
  await p.emulateMedia({reducedMotion:'no-preference'});await p.evaluate(()=>raceQA.render3D(.1));
  assert.equal(await p.evaluate(()=>get3DInfo().effects.itemFeedback?.particleCount || 0),0,'motion toggle never revives stale burst');

  await p.evaluate(()=>{raceQA.clean(4199);raceQA.S.rivals.forEach(a=>a.s=4100);raceQA.finish();advanceTime(100);});
  assert.equal(await p.evaluate(()=>document.querySelector('#raceFeedback').hidden),false,'finish prize receipt survives simulation updates');
  assert.match(await p.locator('#raceFeedback').innerText(),/PRIZE/i,'finish prize remains readable');
  await p.evaluate(()=>{raceQA.clean(45);raceQA.pickup({kind:'HEDGE',x:0});raceQA.render3D(0);raceQA.clean(45);raceQA.render3D(0);});
  assert.equal(await p.evaluate(()=>get3DInfo().effects.itemFeedback?.particleCount || 0),0,'same-position reset clears transient effect');
  await p.evaluate(()=>{raceQA.S.slots=[{k:'SHORT',lv:3},{k:'HEDGE',lv:3},{k:'BREAKER',lv:3}];advanceTime(20);raceQA.render3D(0);});
  const base = await p.evaluate(()=>({objects:get3DInfo().objects,geometries:get3DInfo().geometries,nodes:document.querySelectorAll('*').length}));
  await p.evaluate(()=>{for(let i=0;i<100;i++){raceQA.pickup({kind:['SHORT','HEDGE','BREAKER'][i%3],x:0});if(i%20===19)raceQA.render3D(0);}});
  const repeated = await p.evaluate(()=>({objects:get3DInfo().objects,geometries:get3DInfo().geometries,nodes:document.querySelectorAll('*').length}));
  assert.equal(repeated.objects,base.objects,'stack events never add scene nodes');
  assert.equal(repeated.geometries,base.geometries,'stack events never add geometry');
  assert(repeated.nodes<=base.nodes+3,'stack feedback DOM remains bounded');

  await p.evaluate(()=>{window.captureFrame=requestAnimationFrame.bind(window);window.requestAnimationFrame=()=>0;});
  for(const size of [{width:1440,height:900},{width:390,height:844},{width:320,height:568},{width:844,height:390},{width:640,height:360}]){
   await p.setViewportSize(size);await p.waitForTimeout(100);
   await p.evaluate(()=>{raceQA.clean(45);raceQA.S.slots=[{k:'SHORT',lv:3},{k:'HEDGE',lv:3},{k:'BREAKER',lv:3}];const e=raceQA.addObs('TRUMP',1,1);e.s=raceQA.P.s+28;raceQA.showBreaking('Trump takes the podium','Steer around the speech.');advanceTime(20);raceQA.render3D(2);});
   for(const selector of ['#slot0','#slot1','#slot2','#bDrift']){
    const r=await p.locator(selector).boundingBox();assert(r&&r.width>=44&&r.height>=44&&r.x>=0&&r.y>=0&&r.x+r.width<=size.width+1&&r.y+r.height<=size.height+1,'charged control fits '+selector+' at '+size.width);
   }
   const news=await p.locator('#breaking').boundingBox();assert(news.y+news.height<70,'news stays off track');
   assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no mobile overflow');
   const framing=await p.evaluate(()=>{const camera=raceQA.scene().children.find(o=>o.isCamera);let body;raceQA.scene().traverse(o=>{if(o.userData.playerBody)body=o;});const b=new THREE.Box3().setFromObject(body);let bottom=0;for(const x of [b.min.x,b.max.x])for(const y of [b.min.y,b.max.y])for(const z of [b.min.z,b.max.z])bottom=Math.max(bottom,(1-new THREE.Vector3(x,y,z).project(camera).y)*innerHeight/2);return{bottom,hud:document.querySelector('#health').getBoundingClientRect().top};});
   assert(framing.bottom<framing.hud,'charged HUD leaves whole kart visible '+size.width+' '+JSON.stringify(framing));
   assert(await p.evaluate(()=>raceQA.scene().children.some(g=>g.userData.trump&&g.visible)),'podium remains visible');
   console.log('CHECK charged layout '+size.width);
   await p.evaluate(()=>new Promise(resolve=>captureFrame(()=>{raceQA.render3D(0);resolve();})));
   await p.screenshot({path:'.work/stacked-'+size.width+'.png',timeout:60000});
  }
  await p.setViewportSize({width:1000,height:700});
  await p.evaluate(()=>{raceQA.clean(45);raceQA.S.slots=[{k:'SHORT',lv:2},{k:'HEDGE',lv:2},{k:'BREAKER',lv:3}];const e=raceQA.addObs('TRUMP',1,1);e.s=raceQA.P.s+24;raceQA.pickup({kind:'HEDGE',x:0});advanceTime(80);raceQA.render3D(2);});
  await p.evaluate(()=>new Promise(resolve=>captureFrame(()=>{raceQA.render3D(0);resolve();})));
  await p.screenshot({path:'.work/stacked-effect.png',timeout:60000});
  assert.deepEqual(errors,[]);
  console.log('PASS item stacks: seven kinds, tier badges, MAX bonuses, failed use/full rack, keyboard use, pause/reset, reduced motion, bounded resources and five layouts');
 } finally {await browser.close();}
 const touch=await openGame({viewport:{width:390,height:844},hasTouch:true,isMobile:true});
 try{
  await touch.page.evaluate(()=>{raceQA.clean();raceQA.S.slots=[{k:'MOON',lv:3},null,null];advanceTime(20);});
  await touch.page.locator('#slot0').tap();
  assert.equal(await touch.page.evaluate(()=>raceQA.S.slots[0]),null,'touch consumes charged item');
  assert((await touch.page.evaluate(()=>raceQA.P.boost))>0,'touch activates boost');
  assert.deepEqual(touch.errors,[]);console.log('PASS actual touch on charged item');
 }finally{await touch.browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
