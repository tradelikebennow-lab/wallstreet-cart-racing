const assert=require('node:assert/strict');
const {openGame}=require('./browser-lib.cjs');
(async()=>{const {browser,page:p,errors}=await openGame();try{
 await p.evaluate(()=>{raceQA.clean(185);raceQA.S.rivals.forEach((a,i)=>{a.s=192+i*5;a.x=i%2?1:-1;});raceQA.addItem(0,'HEDGE');raceQA.S.ents[0].s=198;raceQA.render3D(0);});
 assert((await p.evaluate(()=>get3DInfo().presentation)),'presentation diagnostics');
 for(const viewport of [{width:1440,height:900},{width:390,height:844},{width:844,height:390}]){
  await p.setViewportSize(viewport);await p.waitForTimeout(180);await p.evaluate(()=>raceQA.render3D(2));
  const labels=await p.evaluate(()=>{const c=raceQA.scene().children.filter(o=>o.userData.worldCue&&o.visible);const camera=raceQA.scene().children.find(o=>o.isCamera);return c.map(o=>{const q=o.getWorldQuaternion(new THREE.Quaternion());const v=o.position.clone().project(camera);return {dot:Math.abs(q.dot(camera.quaternion)),x:v.x,y:v.y};});});
  assert(labels.length>0&&labels.length<=3,'bounded nearby cues');labels.forEach(l=>{assert(l.dot>.9999,'cue faces camera');assert(Math.abs(l.x)<.95&&Math.abs(l.y)<.9,'cue inside viewport');});
  const framing=await p.evaluate(()=>{const camera=raceQA.scene().children.find(o=>o.isCamera);let body;raceQA.scene().traverse(o=>{if(o.userData.playerBody)body=o;});const box=new THREE.Box3().setFromObject(body),points=[];for(const x of [box.min.x,box.max.x])for(const y of [box.min.y,box.max.y])for(const z of [box.min.z,box.max.z])points.push(new THREE.Vector3(x,y,z).project(camera));return {bottom:Math.max(...points.map(p=>(1-p.y)*innerHeight/2)),hud:document.querySelector('#health').getBoundingClientRect().top};});assert(framing.bottom<framing.hud,`whole kart above HUD at ${viewport.width}: ${JSON.stringify(framing)}`);
  await p.screenshot({path:`.work/presentation-${viewport.width}.png`});
 }
 assert.deepEqual(errors,[]);console.log('PASS camera-facing bounded cues and kart framing');
 }finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
