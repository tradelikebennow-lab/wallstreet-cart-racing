const fs=require('node:fs');
const path=require('node:path');
function playwright(){
 try{return require('playwright');}catch(e){
  if(process.env.PLAYWRIGHT_MODULE)return require(process.env.PLAYWRIGHT_MODULE);
  throw Error('Run npm install and npx playwright install chromium, or set PLAYWRIGHT_MODULE to an existing Playwright installation.');
 }
}
async function openGame(options={}){
 const {captureWebGL=false,htmlPath="outputs/bull-run-3d.html",...pageOptions}=options;
 const browser=await playwright().chromium.launch({args:['--enable-webgl','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1440,height:900},...pageOptions});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const hooks=`window.raceQA={P,S,keys,reset,step,tick,jump,slide,holdDrift,cancelDrift,addObs,addItem,pickup,use,updateAI,hurt,finish,die,setMode,curvAt,render3D,showBreaking,ORDER,EV,
 clean(s=30){reset();keys.l=keys.r=false;touchSteer=0;setMode('play');P.s=s;P.v=27;P.x=0;P.y=0;P.vy=0;S.ents=[];S.shots=[];S.aiShots=[];S.rugs=[];S.swanMarks=[];S.gapLeft=9999;S.crateCd=999;S.itemRowCd=999;S.inv0=999;S.rivals.forEach((a,i)=>{a.s=s+90+i*4;a.x=i%2?-1:1;a.atk=999;});},
 input(){return {ptrs:ptrs.size,steerBtns:{...steerBtns},touchSteer,held:P.driftHeld,drifting:P.drifting,x:P.x,keys};},renderer(){return G3.renderer;},scene(){return G3.scene;},audio(){return {musicEnabled,musicPlaying:!!musicEl&&!musicEl.paused,muted};},snapshot(){return JSON.parse(render_game_to_text());}};\n`;
 let html=fs.readFileSync(path.resolve(htmlPath),'utf8').replace('// deterministic hooks',hooks+'// deterministic hooks').replace('function step(dt) {', 'function step(dt) {if(window.QA_PROTECTED&&S.mode==="play"){P.x*=.5;if(P.vx)P.vx*=.5;S.inv0=999;P.diamond=999;}');
 if(captureWebGL)html=html.replace('canvas:surface,antialias:true,alpha:false,','canvas:surface,antialias:true,alpha:false,preserveDrawingBuffer:true,');
 try{await page.setContent(html,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.raceQA&&window.get3DInfo);}catch(e){await browser.close();throw Error(e.message+'\nBrowser errors: '+errors.join('\n'));}
 await page.locator('#bStart').click();await page.evaluate(()=>advanceTime(4000));
 fs.mkdirSync('.work',{recursive:true});
 return {browser,page,errors};
}
module.exports={openGame};
