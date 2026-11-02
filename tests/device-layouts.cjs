const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
let playwright;
try{playwright=require('playwright');}catch(error){if(process.env.PLAYWRIGHT_MODULE)playwright=require(process.env.PLAYWRIGHT_MODULE);else throw error;}

const fixtures=[
 {width:320,height:568,dpr:1,touch:true},
 {width:390,height:844,dpr:3,touch:true},
 {width:640,height:360,dpr:2,touch:true},
 {width:844,height:390,dpr:3,touch:true},
 {width:1440,height:900,dpr:2,touch:false},
 {width:390,height:844,dpr:3,touch:true,safe:{top:44,right:0,bottom:34,left:0},simulation:'simulated safe-area portrait'},
 {width:844,height:390,dpr:3,touch:true,safe:{top:0,right:44,bottom:21,left:44},simulation:'simulated safe-area landscape'}
];
const hooks=`window.layoutQA={P,S,setMode,finish,render3D,scene(){return G3.scene;},
 staticRace(){reset();setMode('play');P.s=185;P.x=0;P.v=27;P.y=P.vy=0;S.ents=[];S.shots=[];S.aiShots=[];S.rugs=[];S.swanMarks=[];S.rivals.forEach((a,i)=>{a.s=197+i*5;a.x=i%2?1:-1;});S.slots=[{k:'SHORT',lv:3},{k:'HEDGE',lv:2},{k:'BREAKER',lv:1}];S.shield=5;showBreaking('CPI surprise','Jump the low barrier.','Full news context');render3D(2);render3D(0);hud();drawEq();}
};\n`;
const source=fs.readFileSync(path.resolve(process.env.LAYOUT_HTML||'outputs/index.html'),'utf8');
assert(source.includes('// deterministic hooks'),'emitted artifact exposes deterministic test insertion');
function fixtureHTML(fixture){
 const simulated=fixture.safe?source.replace(/env\(safe-area-inset-(top|right|bottom|left)(?:\s*,[^)]*)?\)/g,(_,edge)=>fixture.safe[edge]+'px'):source;
 if(fixture.safe)assert(!/env\(safe-area-inset-/.test(simulated),'all safe-area env values replaced in test-only simulation');
 return simulated.replace('// deterministic hooks',hooks+'// deterministic hooks').replace('canvas:surface,antialias:true,alpha:false,','canvas:surface,antialias:true,alpha:false,preserveDrawingBuffer:true,');
}
const output='.work/overnight';
fs.mkdirSync(output,{recursive:true});
const inside=(r,width,height)=>r&&r.x>=-.5&&r.y>=-.5&&r.x+r.width<=width+.5&&r.y+r.height<=height+.5;
const safeInside=(r,fixture)=>{const safe=fixture.safe||{top:0,right:0,bottom:0,left:0};return r&&r.x>=safe.left-.5&&r.y>=safe.top-.5&&r.x+r.width<=fixture.width-safe.right+.5&&r.y+r.height<=fixture.height-safe.bottom+.5;};
const overlaps=(a,b)=>a.x<b.x+b.width-.5&&a.x+a.width>b.x+.5&&a.y<b.y+b.height-.5&&a.y+a.height>b.y+.5;
async function reachable(page,selector,fixture){
 const locator=page.locator(selector);await locator.scrollIntoViewIfNeeded();
 const r=await locator.boundingBox();
 assert(inside(r,fixture.width,fixture.height),`Reachable ${selector} at ${fixture.width}x${fixture.height}: ${JSON.stringify(r)}`);
 assert(safeInside(r,fixture),`Safe-area exclusion ${selector} in ${fixture.simulation||'viewport'}: ${JSON.stringify(r)}`);
 assert(r.width>=44&&r.height>=44,`44px target ${selector}: ${JSON.stringify(r)}`);
 assert(await locator.evaluate(element=>{const r=element.getBoundingClientRect(),hit=document.elementFromPoint(r.x+r.width/2,r.y+r.height/2);return hit===element||element.contains(hit);}),`Unobstructed ${selector}`);
 return r;
}
async function backing(page,label){
 const p=await page.evaluate(()=>get3DInfo().presentation);
 assert.equal(p.backingWidth,p.overlayWidth,label+' backing widths align');
 assert.equal(p.backingHeight,p.overlayHeight,label+' backing heights align');
 assert(p.backingWidth*p.backingHeight<=p.maxBackingPixels,label+' pixel budget');
 return p;
}
(async()=>{
 const browser=await playwright.chromium.launch({args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report=[];
 try{
  for(const fixture of process.env.LAYOUT_SAFE_ONLY?fixtures.filter(f=>f.safe):fixtures){
   const html=fixtureHTML(fixture);
   const context=await browser.newContext({viewport:{width:fixture.width,height:fixture.height},deviceScaleFactor:fixture.dpr,hasTouch:fixture.touch,isMobile:fixture.touch});
   const page=await context.newPage(),errors=[],external=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
   await context.route('**/*',route=>{if(route.request().url()==='http://kart-layout.test/')return route.fulfill({contentType:'text/html',body:html});external.push(route.request().url());return route.abort();});
   await context.setOffline(true);
   try{
    await page.goto('http://kart-layout.test/',{waitUntil:'domcontentloaded'});
    await page.waitForFunction(()=>window.layoutQA&&window.get3DInfo);
    await page.evaluate(()=>{window.requestAnimationFrame=()=>0;});await page.waitForTimeout(30);
    assert.equal(await page.locator('#title').isVisible(),true,'boot reaches title offline');
    const titleDifficulty=await reachable(page,'#difficultyMode',fixture);
    await page.locator('#difficultyMode').selectOption('hard');
    assert.equal(await page.locator('#difficultyMode').inputValue(),'hard');
    const titleStart=await reachable(page,'#bStart',fixture);
    const titleScroll=await page.locator('#title').evaluate(e=>({top:e.scrollTop,height:e.scrollHeight,client:e.clientHeight}));
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no title horizontal overflow');
    await page.locator('#bStart').click();await page.evaluate(()=>advanceTime(4000));
    await page.evaluate(()=>layoutQA.staticRace());
    if(fixture.safe)await page.screenshot({path:`${output}/device-${fixture.width}x${fixture.height}-dpr${fixture.dpr}-safe.png`});
    let p=await backing(page,'initial');
    assert.equal(p.requestedQuality,'auto');assert.equal(p.quality,fixture.touch?'medium':'high','Auto profile matches device capabilities');
    const controls={};for(const selector of ['#bDrift','#slot0','#slot1','#slot2','#bPause','#bMute'])controls[selector]=await reachable(page,selector,fixture);
    const driftHint=await page.locator('#bDrift').innerText();assert.equal(driftHint.includes('SHIFT'),!fixture.touch,'drift instruction matches pointer capability');
    if(fixture.touch)assert.equal(await page.locator('.touch-hint').isVisible(),false,'desktop hint hidden for touch');
    assert(!overlaps(controls['#bDrift'],controls['#slot0']),'drift and item controls do not overlap');
    const news=await page.locator('#breaking').boundingBox(),ticker=await page.locator('.ticker').boundingBox();
    assert(news&&news.y+news.height<=ticker.y+ticker.height+1&&news.y+news.height<70+(fixture.safe?.top||0),'news stays inside radio strip: '+JSON.stringify({simulation:fixture.simulation,news,ticker}));
    if(fixture.safe){
     const label=await page.locator('.tk-label').boundingBox();
     for(const [name,rect]of [['radio label',label],['news',news],['pause',controls['#bPause']],['sound',controls['#bMute']]]){
      assert(safeInside(rect,fixture),`${fixture.simulation} ${name} avoids inset: ${JSON.stringify(rect)}`);
      assert(rect.y>=fixture.safe.top-.5&&rect.y+rect.height<=ticker.y+ticker.height+.5,`${fixture.simulation} ${name} fits ticker content: ${JSON.stringify({rect,ticker})}`);
     }
     assert(label.height>=44,`${fixture.simulation} ticker keeps readable content height`);
    }
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no gameplay horizontal overflow');
    const framing=await page.evaluate(()=>{
     const camera=layoutQA.scene().children.find(o=>o.isCamera);let body;layoutQA.scene().traverse(o=>{if(o.userData.playerBody)body=o;});
     const points=[];
     body.traverse(mesh=>{const positions=mesh.geometry?.attributes.position;if(!positions||!mesh.visible)return;for(let i=0;i<positions.count;i++)points.push(new THREE.Vector3().fromBufferAttribute(positions,i).applyMatrix4(mesh.matrixWorld).project(camera));});
     const rect=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return{x:r.x,y:r.y,width:r.width,height:r.height};};
     return{left:Math.min(...points.map(p=>(p.x+1)*innerWidth/2)),right:Math.max(...points.map(p=>(p.x+1)*innerWidth/2)),top:Math.min(...points.map(p=>(1-p.y)*innerHeight/2)),bottom:Math.max(...points.map(p=>(1-p.y)*innerHeight/2)),health:rect('#health'),hud:rect('.hud'),hudLeft:rect('.hud-l'),hudRight:rect('.hud-r'),hudCenter:rect('.hud-c')};
    });
    const screenshot=`${output}/device-${fixture.width}x${fixture.height}-dpr${fixture.dpr}${fixture.safe?'-safe':''}.png`;
    await page.screenshot({path:screenshot});
    assert(!overlaps(controls['#bDrift'],framing.health),'drift control does not overlap health HUD');
    if(fixture.safe)for(const name of ['health','hudLeft','hudRight','hudCenter'])assert(safeInside(framing[name],fixture),`${fixture.simulation} ${name} stays inside safe rectangle: ${JSON.stringify(framing[name])}`);
    assert(framing.bottom<framing.health.y,'whole kart stays above health/items HUD');
    assert(framing.left>=0&&framing.right<=fixture.width,'whole kart fits horizontally');
    assert(framing.top>framing.hud.y+framing.hud.height,'whole kart below top HUD: '+JSON.stringify(framing));
    assert(!overlaps(framing.hudLeft,framing.hudRight),'top HUD panels do not overlap: '+JSON.stringify(framing));
    await page.locator('#bPause').click();assert.equal(await page.locator('#paused').isVisible(),true);
    const pauseGraphics=await reachable(page,'#graphicsQuality',fixture);
    await page.locator('#graphicsQualityHint').scrollIntoViewIfNeeded();
    const hint=await page.locator('#graphicsQualityHint').boundingBox();assert(inside(hint,fixture.width,fixture.height)&&safeInside(hint,fixture),'effective Auto hint reachable outside safe insets');
    assert.match(await page.locator('#graphicsQualityHint').textContent(),fixture.touch?/Auto uses Medium/:/Auto uses High/);
    await page.locator('#graphicsQuality').focus();
    await page.evaluate(()=>document.querySelector('#graphicsQuality').addEventListener('keydown',e=>queueMicrotask(()=>window.layoutKeyPrevented=e.defaultPrevented),{once:true}));
    await page.keyboard.press('ArrowDown');assert.equal(await page.evaluate(()=>window.layoutKeyPrevented),false,'native graphics arrow key preserved');
    await page.keyboard.press('l');assert.equal(await page.locator('#graphicsQuality').inputValue(),'low');
    p=await backing(page,'native Low');assert.equal(p.quality,'low');assert.equal(p.shadowEnabled,false);
    await page.waitForTimeout(1200);await page.keyboard.press('h');assert.equal(await page.locator('#graphicsQuality').inputValue(),'high');
    p=await backing(page,'native High');assert.equal(p.quality,'high','manual High overrides touch Auto');
    assert.equal(await page.locator('#graphicsQualityHint').isVisible(),false,'Auto explanation hides for explicit profile');
    await page.waitForTimeout(1200);await page.keyboard.press('a');assert.equal(await page.locator('#graphicsQuality').inputValue(),'auto');
    p=await backing(page,'native Auto');assert.equal(p.requestedQuality,'auto');assert.equal(p.quality,fixture.touch?'medium':'high');
    assert.equal(await page.locator('#graphicsQualityHint').isVisible(),true,'native Auto restores effective explanation');
    await page.waitForTimeout(1200);await page.keyboard.press('h');assert.equal(await page.locator('#graphicsQuality').inputValue(),'high');
    assert.equal(await page.evaluate(()=>localStorage.getItem('bullrun.graphics')),'high');
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'no paused horizontal overflow');
    await reachable(page,'#bResume',fixture);await page.locator('#bResume').click();
    assert.equal(await page.locator('#paused').isVisible(),false,'resume reachable after settings');
    await page.evaluate(()=>{layoutQA.P.s=4200;layoutQA.S.rivals.forEach(a=>{a.finished=false;a.s=4100;});layoutQA.finish();advanceTime(3500);});
    assert.equal(await page.locator('#results').isVisible(),true);const resultOptions=await reachable(page,'#bChangeDifficulty',fixture);
    if(fixture.touch)await page.touchscreen.tap(resultOptions.x+resultOptions.width/2,resultOptions.y+resultOptions.height/2);else await page.locator('#bChangeDifficulty').click();
    assert.equal(await page.locator('#title').isVisible(),true,'results returns to difficulty setup');await page.locator('#difficultyMode').selectOption('easy');await reachable(page,'#bStart',fixture);await page.locator('#bStart').click();await page.evaluate(()=>advanceTime(4000));assert.equal(await page.evaluate(()=>layoutQA.S.difficulty),'easy','next race uses newly selected mode');
    await page.reload({waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.get3DInfo);
    p=await backing(page,'reload');assert.equal(p.requestedQuality,'high');assert.equal(p.quality,'high','explicit profile survives real-origin reload');
    assert.equal(await page.locator('#graphicsQuality').inputValue(),'high');
    assert.deepEqual(external,[],'offline artifact makes no external requests');assert.deepEqual(errors,[],'no browser errors');
    report.push({fixture,titleDifficulty,titleStart,titleScroll,pauseGraphics,resultOptions,framing,backing:p,screenshot,externalRequests:external.length});
    fs.writeFileSync(`${output}/device-layouts${process.env.LAYOUT_SAFE_ONLY?'-safe':''}.json`,JSON.stringify(report,null,2));
    console.log(`PASS ${fixture.simulation||'native viewport'} ${fixture.width}x${fixture.height} DPR${fixture.dpr} title/pause/native settings/framing/budgets/offline`);
   }finally{await context.close();}
  }
  fs.writeFileSync(`${output}/device-layouts${process.env.LAYOUT_SAFE_ONLY?'-safe':''}.json`,JSON.stringify(report,null,2));
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
