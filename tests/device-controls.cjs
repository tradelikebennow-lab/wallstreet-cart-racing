const assert=require('node:assert/strict');
const {openGame}=require('./browser-lib.cjs');
(async()=>{
 const {browser,page:p,errors}=await openGame({viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true,htmlPath:process.env.CONTROL_HTML||'outputs/bull-run-3d.html'});
 try{
  const cdp=await p.context().newCDPSession(p);
  const touch=(type,touchPoints)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints});
  const left={x:30,y:350,id:1},center={x:195,y:350,id:2};
  const idle=async(label)=>{const s=await p.evaluate(()=>raceQA.input());assert.equal(s.ptr,null,label+' pointer');assert.equal(s.touchSteer,0,label+' steering');assert.equal(s.held,false,label+' drift');assert.equal(s.keys.l||s.keys.r,false,label+' keyboard');};
  await p.evaluate(()=>raceQA.clean());
  await touch('touchStart',[left]);assert.equal(await p.evaluate(()=>raceQA.input().touchSteer),-1);
  await touch('touchStart',[left,center]);assert.equal(await p.evaluate(()=>raceQA.input().touchSteer),-1,'Second canvas finger must not steal steering');
  await touch('touchCancel',[]);await idle('cancel');
  assert.equal(await p.evaluate(()=>raceQA.P.y),0,'Cancel must not jump');
  await touch('touchStart',[center]);await touch('touchEnd',[]);await p.evaluate(()=>advanceTime(20));assert(await p.evaluate(()=>raceQA.P.y>0),'Center tap jumps');
  await p.evaluate(()=>raceQA.clean());await touch('touchStart',[center]);await touch('touchMove',[{...center,y:280}]);await touch('touchEnd',[]);await p.evaluate(()=>advanceTime(20));assert(await p.evaluate(()=>raceQA.P.y>0),'Up swipe jumps');
  await p.evaluate(()=>raceQA.clean());await touch('touchStart',[center]);await touch('touchMove',[{...center,y:430}]);await touch('touchEnd',[]);assert(await p.evaluate(()=>raceQA.P.slide>0),'Down swipe slides');
  await p.evaluate(()=>raceQA.clean());await touch('touchStart',[left]);await p.keyboard.down('ArrowRight');await p.keyboard.press('p');await idle('pause');await touch('touchEnd',[]);await p.locator('#bResume').click();await idle('resume');await p.keyboard.up('ArrowRight');
  await touch('touchStart',[left]);await p.setViewportSize({width:844,height:390});await p.waitForTimeout(100);await idle('rotation');await touch('touchEnd',[]);
  await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);await touch('touchStart',[left]);await p.evaluate(()=>window.dispatchEvent(new Event('blur')));await idle('blur');await touch('touchEnd',[]);
  await touch('touchStart',[left]);await touch('touchMove',[{...left,y:351}]);await p.evaluate(()=>document.querySelector('#view').releasePointerCapture(raceQA.input().ptr.id));await touch('touchMove',[{...left,y:352}]);await idle('lost capture');await touch('touchEnd',[]);
  await p.evaluate(()=>raceQA.clean());const slot=await p.locator('#slot0').boundingBox();await p.touchscreen.tap(slot.x+slot.width/2,slot.y+slot.height/2);assert.equal(await p.evaluate(()=>raceQA.S.slots[0]),null,'Touch item activates');
  await p.evaluate(()=>raceQA.clean());const oldDrift=await p.locator('#bDrift').boundingBox();await touch('touchStart',[{x:oldDrift.x+oldDrift.width/2,y:oldDrift.y+oldDrift.height/2,id:6}]);await p.keyboard.press('p');await p.locator('#bResume').click();await p.keyboard.down('Shift');await touch('touchEnd',[]);assert.equal(await p.evaluate(()=>raceQA.P.driftHeld),true,'Stale drift finger cannot release new keyboard hold');await p.keyboard.up('Shift');
  await touch('touchStart',[left]);await p.setViewportSize({width:390,height:790});await p.waitForTimeout(100);assert.equal(await p.evaluate(()=>raceQA.input().touchSteer),-1,'Height-only toolbar resize retains steer');await touch('touchEnd',[]);await p.setViewportSize({width:390,height:844});await p.waitForTimeout(100);
  await p.evaluate(()=>raceQA.clean());const b=await p.locator('#bDrift').boundingBox();await touch('touchStart',[{x:b.x+b.width/2,y:b.y+b.height/2,id:3},{x:365,y:350,id:4}]);await p.evaluate(()=>advanceTime(850));assert((await p.evaluate(()=>raceQA.snapshot())).drift.tier>=1,'Two-finger drift charges');await touch('touchEnd',[]);await p.evaluate(()=>advanceTime(20));assert(await p.evaluate(()=>raceQA.P.boost>0),'Two-finger release boosts');
  await p.evaluate(()=>raceQA.clean());await p.keyboard.down('ArrowLeft');await p.evaluate(()=>advanceTime(200));assert(await p.evaluate(()=>raceQA.P.x<0),'Keyboard steering');await p.keyboard.up('ArrowLeft');await p.keyboard.press('ArrowUp');await p.evaluate(()=>advanceTime(20));assert(await p.evaluate(()=>raceQA.P.y>0),'Keyboard jump');
  assert.deepEqual(errors,[]);console.log('PASS device controls: pointer ownership, tap/swipes, cancel, pause/resume, rotation, blur, lost capture, two-finger drift, keyboard');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
