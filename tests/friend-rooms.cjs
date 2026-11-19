const assert=require('node:assert/strict');
const {createRoomServer}=require('../server/rooms.cjs');
const pw=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const server=createRoomServer();
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url=process.env.FRIEND_TEST_URL||'http://127.0.0.1:'+server.address().port;
 const browser=await pw.chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-background-timer-throttling','--disable-renderer-backgrounding']});
 const errors=[];
 try{
  const pages=[];
  for(const driver of ['bull','bear']){
   const p=await browser.newPage({viewport:{width:780,height:560}});
   p.on('pageerror',e=>errors.push(e.message));
   await p.addInitScript(()=>localStorage.setItem('bullrun.graphics','low'));
   await p.goto(url);await p.locator('#driverChoice').selectOption(driver);
   await p.locator('#friendOpen').click();pages.push(p);
  }
  const [a,b]=pages;
  await a.locator('#friendCreate').click();
  await a.waitForFunction(()=>document.querySelector('#inviteCode').textContent.length===6);
  const code=await a.locator('#inviteCode').innerText();
  await b.locator('#friendCode').fill(code);await b.locator('#friendForm button').click();
  await Promise.all(pages.map(p=>p.waitForFunction(()=>JSON.parse(render_game_to_text()).mode==='play')));
  await a.keyboard.down('ArrowRight');await a.keyboard.down('Shift');
  await a.waitForFunction(()=>JSON.parse(render_game_to_text()).player.x>.2);
  await a.keyboard.up('Shift');await a.keyboard.up('ArrowRight');
  const snapshot=p=>p.evaluate(()=>JSON.parse(render_game_to_text()));
  const host=await snapshot(a),guest=await snapshot(b);
  assert(host.rivals.some(r=>r.name==='FRIEND'));
  assert(guest.rivals.some(r=>r.name==='FRIEND'&&r.x>-.4));
  assert(host.place>=1&&host.place<=6);
  console.log('PASS room creation, code join, countdown, steering and remote kart replication');
  if(process.env.FULL_FRIEND_RACE==='1'){
   await Promise.all(pages.map(p=>p.waitForFunction(()=>document.querySelector('#friendClose').textContent==='Return to setup',null,{timeout:360000})));
   const result=await Promise.all(pages.map(p=>p.locator('#friendStatus').innerText()));
   console.log(result);assert(result.every(s=>s.includes('Your place')));
   await a.locator('#friendClose').click();
  }else{
   await a.locator('#friendLeave').click();
   await b.waitForFunction(()=>document.querySelector('#friendLobby').open && /friend left/.test(document.querySelector('#friendStatus').textContent));
  }
  assert.deepEqual(errors,[]);
 }finally{await browser.close();await new Promise(resolve=>server.close(resolve));}
})().catch(e=>{console.error(e);process.exitCode=1;});
