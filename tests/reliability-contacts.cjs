const assert=require('node:assert/strict');
const {openGame}=require('./browser-lib.cjs');
(async()=>{const {browser,page,errors}=await openGame();try{
 const outcomes=await page.evaluate(()=>{
  const q=raceQA,results={};
  q.clean();q.S.inv0=0;q.P.v=100;q.P.y=.8;q.P.vy=-3;
  let e=q.addObs('CPI',0,1);e.s=q.P.s+5;q.step(.1);results.descendingHit=q.S.margin<100;
  q.clean();q.S.inv0=0;q.P.v=100;q.P.y=.8;q.P.vy=-1;
  e=q.addObs('CPI',0,1);e.s=q.P.s+1;q.step(.1);results.clearAtContact=q.S.margin===100;
  q.clean();q.P.v=150;q.S.ents.push({cat:'coin',s:q.P.s+3,x:0,t:0,span:1});q.step(.05);results.pickup=q.P.candles===1;
  q.clean();q.P.x=-1;q.P.v=150;
  const first=q.addObs('CPI',0,1),second=q.addObs('CPI',0,1);first.s=q.P.s+2;second.s=q.P.s+5;
  q.S.shots=[{s:q.P.s+.4,x:0,homing:false,t:0}];q.step(.05);results.normalNearest=first.dead&&!second.dead;
  q.clean();q.S.inv0=0;q.P.v=150;q.S.rugs=[{s:q.P.s+3,x:0,owner:0,t:0,tried:[]}];q.step(.05);results.rivalRug=q.S.margin<100;
  q.clean();q.P.v=100;q.S.rugs=[{s:q.P.s+3,x:0,owner:-1,t:0,tried:[]}];
  const a=q.S.rivals[0];a.s=q.P.s+1;a.x=0;a.tx=0;a.v=150;a.laneT=999;a.atk=999;
  const random=Math.random;Math.random=()=>.9;try{q.step(.05);}finally{Math.random=random;}results.playerRug=a.stun>0;
  q.clean();q.P.y=.02;q.P.vy=-.5;q.jump();dispatchEvent(new Event('blur'));advanceTime(70);results.blurCancel=q.P.vy===0;
  return results;
 });
 for(const [name,ok] of Object.entries(outcomes))assert(ok,name);
 assert.deepEqual(errors,[]);console.log('PASS contact integration',Object.keys(outcomes).join(', '));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
