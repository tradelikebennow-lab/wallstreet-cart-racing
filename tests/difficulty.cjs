const assert=require('node:assert/strict');
const fs=require('node:fs');
const {openGame}=require('./browser-lib.cjs');
(async()=>{
 const {browser,page:p,errors}=await openGame();
 const report={pace:[],contacts:{},storage:{},lifecycle:{},protectedProgression:[],note:'Protected player progression checks lifecycle and all sectors. It does not measure race balance.'};
 const url='http://difficulty.test/';
 const hooks='window.difficultyQA={P,S,reset,step,updateAI,finish,showResults,setMode,Competition};\n';
 const html=fs.readFileSync('outputs/bull-run-3d.html','utf8').replace('// deterministic hooks',hooks+'// deterministic hooks').replace('function step(dt) {','function step(dt) {if(window.QA_PROTECTED&&S.mode==="play"){P.x*=.5;if(P.vx)P.vx*=.5;S.inv0=999;P.diamond=999;}');
 try{
  assert.equal(await p.locator('#bChangeDifficulty').count(),1,'results offers a path to change difficulty');
  await p.addInitScript(()=>{window.requestAnimationFrame=()=>0;});
  await p.route(url+'**',route=>route.fulfill({contentType:'text/html',body:route.request().url().endsWith('/seed')?'<!doctype html><title>Storage setup</title>':html}));
  await p.goto(url+'seed');
  await p.evaluate(()=>{localStorage.clear();localStorage.setItem('bull-run-3d-best',JSON.stringify({pnl:840,place:3}));});
  await p.goto(url);await p.waitForFunction(()=>window.difficultyQA&&window.get3DInfo);
  assert.equal(await p.locator('#difficultyMode').inputValue(),'medium');
  report.storage.import=await p.evaluate(()=>JSON.parse(localStorage.getItem('bull-run-3d-bests')));
  assert.deepEqual(report.storage.import.byDifficulty.medium,{pnl:840,place:3});
  assert.equal(await p.evaluate(()=>localStorage.getItem('bull-run-3d-best')),JSON.stringify({pnl:840,place:3}));
  await p.locator('#difficultyMode').focus();
  await p.evaluate(()=>document.querySelector('#difficultyMode').addEventListener('keydown',e=>queueMicrotask(()=>window.selectPrevented=e.defaultPrevented),{once:true}));
  await p.keyboard.press('ArrowDown');await p.keyboard.press('Enter');
  assert.equal(await p.evaluate(()=>window.selectPrevented),false,'native difficulty arrows retain browser behavior');
  assert.equal(await p.evaluate(()=>difficultyQA.S.mode),'title','native select Enter must not start the race');
  await p.locator('#difficultyMode').selectOption('hard');await p.locator('#bStart').click();await p.evaluate(()=>advanceTime(4000));
  assert.equal(await p.evaluate(()=>difficultyQA.S.mode),'play');
  await p.locator('#difficultyMode').selectOption('easy',{force:true});
  report.lifecycle.active=await p.evaluate(()=>({active:difficultyQA.S.difficulty,profile:difficultyQA.S.profile.id,frozen:Object.isFrozen(difficultyQA.S.profile),future:JSON.parse(render_game_to_text()).selectedDifficulty,hud:document.querySelector('#hDifficulty').textContent}));
  assert.deepEqual(report.lifecycle.active,{active:'hard',profile:'hard',frozen:true,future:'easy',hud:'Hard · RACE'});
  await p.evaluate(()=>difficultyQA.setMode('paused'));assert.equal(await p.locator('#pauseDifficulty').textContent(),'Hard · RACE');
  await p.evaluate(()=>{
   const q=difficultyQA;q.S.raceT=100;q.P.s=4200;q.S.pnl=300-15000;
   q.S.rivals.forEach((a,i)=>{a.finished=i===0;a.time=90+i;a.s=i===0?4300:4100-i;});q.finish();q.showResults();
  });
  assert.equal(await p.locator('#resultDifficulty').textContent(),'Hard · RACE');
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('bull-run-3d-bests')).byDifficulty.hard),{pnl:300,place:2});
  await p.locator('#bChangeDifficulty').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>difficultyQA.S.mode),'title','change difficulty returns to setup through native keyboard click');await p.locator('#difficultyMode').selectOption('easy');await p.locator('#bStart').click();await p.evaluate(()=>advanceTime(4000));
  assert.equal(await p.evaluate(()=>difficultyQA.S.difficulty),'easy','setup captures the new selection');
  await p.evaluate(()=>{
   const q=difficultyQA;q.S.raceT=120;q.P.s=4200;q.S.pnl=100-25000;q.S.rivals.forEach(a=>{a.finished=false;a.s=4100;});q.finish();q.showResults();
  });
  const records=await p.evaluate(()=>JSON.parse(localStorage.getItem('bull-run-3d-bests')));
  assert.deepEqual(records.byDifficulty.easy,{pnl:100,place:1});assert.deepEqual(records.byDifficulty.hard,{pnl:300,place:2});assert.deepEqual(records.byDifficulty.medium,{pnl:840,place:3});
  await p.reload();await p.waitForFunction(()=>window.difficultyQA);assert.equal(await p.locator('#difficultyMode').inputValue(),'easy');
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('bull-run-3d-bests'))),records,'difficulty records survive reload');
  await p.evaluate(()=>localStorage.setItem('bull-run-3d-best',JSON.stringify({pnl:99999,place:1})));await p.reload();await p.waitForFunction(()=>window.difficultyQA);
  assert.deepEqual(await p.evaluate(()=>JSON.parse(localStorage.getItem('bull-run-3d-bests')).byDifficulty.medium),{pnl:840,place:3},'legacy imports once');
  for(const id of ['easy','medium','hard']){
   await p.locator('#difficultyMode').selectOption(id,{force:true});
   const data=await p.evaluate(()=>{
    const q=difficultyQA;q.reset();q.S.mode='play';q.S.ents=[];q.P.s=-100000;
    q.S.rivals.forEach(a=>Object.assign(a,{s:0,x:0,tx:0,v:0,laneT:9999,atk:9999}));
    const random=Math.random;Math.random=()=>.999;
    try{for(let frame=0;frame<30000&&!q.S.rivals.every(a=>a.finished);frame++){q.S.raceT=frame/120;for(const a of q.S.rivals)q.updateAI(a,1/120);}}
    finally{Math.random=random;}
    return {id:q.S.difficulty,times:q.S.rivals.map(a=>a.time),names:q.S.rivals.map(a=>a.short),finished:q.S.rivals.every(a=>a.finished)};
   });
   assert(data.finished);assert.equal(data.names.length,5);report.pace.push(data);
  }
  for(let rival=0;rival<5;rival++)assert(report.pace[0].times[rival]>report.pace[1].times[rival]&&report.pace[1].times[rival]>report.pace[2].times[rival],'every personality keeps ordered complete-course pace');
  report.contacts=await p.evaluate(()=>{
   const q=difficultyQA,results={};
   const fresh=()=>{q.reset();q.S.mode='play';q.S.ents=[];const a=q.S.rivals[0];Object.assign(a,{s:999,x:0,tx:0,y:0,vy:0,v:36,stun:0,laneT:999,atk:999});return a;};
   for(const type of ['CPI','NFP','DEPEG','FROZEN','FOMC']){const a=fresh();q.S.ents=[{cat:'obs',type,s:1000,x:0,span:3,plans:[true],armed:true}];q.updateAI(a,.05);results[type]=a.stun>0;}
   for(const fixture of [{s:-.61,oldPhase:.9179166667,newPhase:.925,hit:true},{s:.4,oldPhase:.5149166667,newPhase:.522,hit:false}]){
    const a=fresh();a.s=fixture.s;const e={cat:'obs',type:'GAVEL',s:0,x:0,span:1,plans:[true],armed:true,t:fixture.newPhase/.85,ph0:0};q.S.ents=[e];q.updateAI(a,1/120,()=>({...e,t:fixture.oldPhase/.85}));results['gavel'+fixture.hit]=(a.stun>0)===fixture.hit;
   }
   const a=fresh();q.P.s=1012;q.P.x=0;a.atk=0;const random=Math.random;Math.random=()=>0;try{q.updateAI(a,.01);}finally{Math.random=random;}
   const shot=q.S.aiShots[0];results.realShot=!!shot&&shot.s===a.s+.6&&shot.x===a.x&&shot.owner===a&&shot.v===a.v+18;
   const rugger=fresh();q.P.s=985;rugger.atk=0;Math.random=()=>0;try{q.updateAI(rugger,.01);}finally{Math.random=random;}
   const rug=q.S.rugs[0];results.realRug=!!rug&&rug.s===rugger.s-1.2&&rug.x===rugger.x&&rug.owner===rugger.i;
   const distant=fresh();q.P.s=100000;distant.atk=0;Math.random=()=>0;try{q.updateAI(distant,.01);}finally{Math.random=random;}results.noRemoteAttack=q.S.aiShots.length===0&&q.S.rugs.length===0;
   return results;
  });
  for(const [name,passed] of Object.entries(report.contacts))assert(passed,name);
  for(const id of ['easy','medium','hard']){
   await p.evaluate(()=>{window.QA_PROTECTED=true;difficultyQA.setMode('title');});
   await p.locator('#difficultyMode').selectOption(id);await p.locator('#bStart').click();await p.evaluate(()=>advanceTime(4000));
   const sectors=new Set([await p.evaluate(()=>JSON.parse(render_game_to_text()).sector)]),samples=[];
   for(let chunk=0;chunk<30;chunk++){
    const progress=await p.evaluate(()=>{advanceTime(10000);const q=difficultyQA;return {mode:q.S.mode,active:q.S.difficulty,sector:JSON.parse(render_game_to_text()).sector,s:q.P.s,finished:q.P.finished,dnf:q.S.dnf};});
    sectors.add(progress.sector);samples.push(progress);assert.equal(progress.active,id);
    if(progress.mode==='results')break;
   }
   const last=samples.at(-1);assert.equal(last.mode,'results',id+' full player race reaches results');assert(last.finished&&!last.dnf,id+' protected player finishes');assert.equal(sectors.size,3,id+' visits all sectors');
   assert.equal(await p.locator('#resultDifficulty').textContent(),id[0].toUpperCase()+id.slice(1)+' · RACE');
   await p.locator('#bAgain').click();await p.evaluate(()=>advanceTime(4000));
   assert.equal(await p.evaluate(()=>difficultyQA.S.difficulty),id);assert.equal(await p.evaluate(()=>difficultyQA.S.mode),'play');assert(await p.evaluate(()=>difficultyQA.P.s<100),'replay resets progress');
   report.protectedProgression.push({difficulty:id,sectors:[...sectors],finishStation:last.s,finished:true,replay:true,samples});
  }
  await p.evaluate(()=>{window.QA_PROTECTED=false;});
  await p.goto(url+'seed');await p.evaluate(()=>{localStorage.setItem('bull-run-3d-difficulty','impossible');localStorage.setItem('bull-run-3d-bests','{malformed');localStorage.setItem('bull-run-3d-best',JSON.stringify({pnl:null,place:8}));});
  await p.goto(url);await p.waitForFunction(()=>window.difficultyQA);assert.equal(await p.locator('#difficultyMode').inputValue(),'medium');assert.equal(await p.evaluate(()=>JSON.parse(localStorage.getItem('bull-run-3d-bests')).byDifficulty.medium),null);
  await p.addInitScript(()=>{Object.defineProperty(window,'localStorage',{configurable:true,get(){throw new DOMException('Storage denied','SecurityError');}});});
  await p.reload();await p.waitForFunction(()=>window.difficultyQA&&window.get3DInfo);assert.equal(await p.locator('#difficultyMode').inputValue(),'medium');
  await p.locator('#difficultyMode').selectOption('hard');await p.locator('#bStart').click();await p.evaluate(()=>advanceTime(4000));assert.equal(await p.evaluate(()=>difficultyQA.S.difficulty),'hard');
  assert.deepEqual(errors,[]);report.storage={...report.storage,records,deniedStorageBoot:true};
  fs.mkdirSync('.work/overnight',{recursive:true});fs.writeFileSync('.work/overnight/difficulty.json',JSON.stringify(report,null,2));
  console.log('PASS difficulty lifecycle, native selector keys, five-rival pace, actual hazard phases, physical attacks, categorized records, denied storage and protected three-sector player progression/replay in all modes');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
