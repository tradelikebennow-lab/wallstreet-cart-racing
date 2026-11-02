const fs=require('node:fs');
const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 fs.mkdirSync('.work',{recursive:true});
 const browser=await chromium.launch({headless:true,args:['--enable-webgl','--enable-unsafe-swiftshader']});
 const page=await browser.newPage({viewport:{width:1000,height:700}});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
 const hooks=`window.stallQA={P,S,reset,setMode,addObs,use,render3D,step,clean(s){reset();setMode('play');P.s=s;P.v=27;P.x=0;P.y=0;P.vy=0;S.ents=[];S.swanMarks=[];S.gapLeft=9999;S.crateCd=999;S.itemRowCd=999;S.inv0=999;S.rivals.forEach((a,i)=>{a.s=s+30+i*5;a.x=i%2?1:-1;a.atk=999;});},populate(){for(let i=0;i<12;i++){const e=addObs(['CPI','FOMC','GAVEL','NFP'][i%4],i%3-1,1);if(e)e.s=P.s+6+i*3;}},breaker(){S.slots[0]={k:'BREAKER',lv:3};use(0);},info(){const gl=G3.renderer.getContext(),ext=gl.getExtension('WEBGL_debug_renderer_info');return {...get3DInfo(),gpu:ext?gl.getParameter(ext.UNMASKED_RENDERER_WEBGL):gl.getParameter(gl.RENDERER),parts:S.parts.length,ents:S.ents.length,mode:S.mode};}};\n`;
 let html=fs.readFileSync(process.env.PROFILE_HTML||'outputs/index.html','utf8').replace('// deterministic hooks',hooks+'// deterministic hooks');
 await page.setContent(html,{waitUntil:'domcontentloaded'});await page.waitForFunction(()=>window.stallQA&&window.get3DInfo);await page.locator('#bStart').click();await page.evaluate(()=>advanceTime(4000));
 const cdp=await page.context().newCDPSession(page);await cdp.send('Profiler.enable');await cdp.send('Profiler.setSamplingInterval',{interval:1000});await cdp.send('Profiler.start');
 async function frames(label,n=45,trigger=null){return page.evaluate(async({label,n,trigger})=>{const data=[];let last=performance.now();for(let i=0;i<n;i++){await new Promise(requestAnimationFrame);const now=performance.now(),t0=now;if(i===0&&trigger==='sector'){stallQA.P.s=1401;}if(i===0&&trigger==='breaker')stallQA.breaker();const t1=performance.now();stallQA.step(1/60);const t2=performance.now();stallQA.render3D(1/60);const t3=performance.now();data.push({frame:i,interval:now-last,action:t1-t0,step:t2-t1,render:t3-t2});last=now;}return {label,data,info:stallQA.info()};},{label,n,trigger});}
 const scenarios=[];
 await page.evaluate(()=>{stallQA.clean(1300);stallQA.render3D(0)});await frames('warmup',15);
 scenarios.push(await frames('sunshine-steady'));
 await page.evaluate(()=>{stallQA.clean(1399);stallQA.populate();stallQA.render3D(0)});
 scenarios.push(await frames('speedway-cold-entry',45,'sector'));
 scenarios.push(await frames('speedway-warm-steady'));
 await page.evaluate(()=>{stallQA.populate();stallQA.render3D(0)});await frames('breaker-warmup',5);
 scenarios.push(await frames('speedway-breaker',60,'breaker'));
 const profile=(await cdp.send('Profiler.stop')).profile;
 fs.writeFileSync('.work/stalls-'+(process.env.PROFILE_TAG||'before')+'.cpuprofile',JSON.stringify(profile));
 const percentile=(v,p)=>v.sort((a,b)=>a-b)[Math.min(v.length-1,Math.floor(v.length*p))];
 for(const s of scenarios){s.summary={};for(const k of ['interval','action','step','render']){const v=s.data.map(d=>d[k]);s.summary[k]={p50:percentile([...v],.5),p95:percentile([...v],.95),max:Math.max(...v),first:v[0]};}}
 const report={environment:{viewport:{width:1000,height:700},gpu:scenarios[0].info.gpu,software:/SwiftShader|llvmpipe/i.test(scenarios[0].info.gpu),note:'Chromium headless RAF intervals are diagnostic on this host, not the user device FPS.'},scenarios,errors};
 const out='.work/stalls-'+(process.env.PROFILE_TAG||'before')+'.json';fs.writeFileSync(out,JSON.stringify(report,null,2));
 console.log(JSON.stringify({environment:report.environment,scenarios:scenarios.map(s=>({label:s.label,summary:s.summary,triangles:s.info.triangles,drawCalls:s.info.drawCalls,geometries:s.info.geometries,parts:s.info.parts,programs:s.info.effects.shadersReady})),errors},null,2));await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1;});
