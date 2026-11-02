const fs=require('node:fs');
const {openGame}=require('./browser-lib.cjs');
(async()=>{
 const report={tag:process.env.BUDGET_TAG||'head',scenarios:[],errors:[],note:'Render-work counters on headless software WebGL. These do not measure physical phone FPS or battery use.'};
 for(const device of [{name:'desktop',viewport:{width:1440,height:900},deviceScaleFactor:2},{name:'phone',viewport:{width:390,height:844},deviceScaleFactor:3,hasTouch:true,isMobile:true}]){
  const {browser,page:p,errors}=await openGame({...device,htmlPath:process.env.BUDGET_HTML||'outputs/bull-run-3d.html'});
  try{
   await p.evaluate(()=>{window.requestAnimationFrame=()=>0;});
   for(const quality of ['high','medium','low']){
    await p.locator('#graphicsQuality').selectOption(quality,{force:true});
    for(const s of [60,1450,2850]){
     const data=await p.evaluate(s=>{raceQA.clean(s);raceQA.S.rivals.forEach((a,i)=>{a.s=s+12+i*6;a.x=i%3-1;});const t=raceQA.addObs('TRUMP',1,1);t.s=s+25;raceQA.S.slots=[{k:'SHORT',lv:3},{k:'HEDGE',lv:3},{k:'BREAKER',lv:3}];raceQA.S.shield=5;raceQA.render3D(2);raceQA.render3D(0);const i=get3DInfo(),r=raceQA.renderer(),size=r.getDrawingBufferSize(new THREE.Vector2()),gl=r.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return{...i,backingPixels:size.x*size.y,backing:[size.x,size.y],overlay:[document.querySelector('#view').width,document.querySelector('#view').height],crowdInstances:raceQA.scene().children.find(o=>o.isInstancedMesh&&o.instanceMatrix.count===72)?.count,gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER)};},s);
     report.scenarios.push({device:device.name,quality,station:s,...data});
    }
   }
   report.errors.push(...errors);
  }finally{await browser.close();}
 }
 fs.mkdirSync('.work/overnight',{recursive:true});const out='.work/overnight/budgets-'+report.tag+'.json';fs.writeFileSync(out,JSON.stringify(report,null,2));
 console.log(JSON.stringify(report.scenarios.map(s=>({device:s.device,quality:s.quality,station:s.station,triangles:s.triangles,backingPixels:s.backingPixels,crowd:s.presentation.crowdUpdates??s.crowdInstances,shadow:s.presentation.shadowEnabled??true})),null,2));
 if(report.errors.length)throw Error(report.errors.join('\n'));
})().catch(e=>{console.error(e);process.exitCode=1;});
