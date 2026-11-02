const assert=require('node:assert/strict');
const {openGame}=require('./browser-lib.cjs');
(async()=>{
 const {browser,page:p,errors}=await openGame();
 try{
  assert.equal((await p.evaluate(()=>raceQA.snapshot())).mode,'play');
  assert((await p.evaluate(()=>get3DInfo())).triangles>1000);
  await p.evaluate(()=>raceQA.clean());
  await p.keyboard.down('ArrowRight');await p.evaluate(()=>advanceTime(200));await p.keyboard.up('ArrowRight');
  assert((await p.evaluate(()=>raceQA.snapshot())).player.x>0);
  await p.keyboard.press('Space');await p.evaluate(()=>advanceTime(150));assert((await p.evaluate(()=>raceQA.snapshot())).player.y>0);
  await p.keyboard.press('2');assert((await p.evaluate(()=>raceQA.snapshot())).player.shield>0);
  await p.keyboard.press('p');assert.equal((await p.evaluate(()=>raceQA.snapshot())).mode,'paused');await p.locator('#bResume').click();
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(150);await p.evaluate(()=>advanceTime(20));
  assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.screenshot({path:'.work/baseline-mobile.png'});
  assert.deepEqual(errors,[]);console.log('PASS browser baseline: WebGL, start, keyboard steering/jump/item, pause, mobile');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
