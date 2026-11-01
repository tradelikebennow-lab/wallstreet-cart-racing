const assert=require('node:assert/strict');const{openGame}=require('./browser-lib.cjs');
(async()=>{const{browser,page:p,errors}=await openGame();try{
 await p.evaluate(()=>{raceQA.clean();raceQA.P.y=.025;raceQA.P.vy=-.6;raceQA.jump();advanceTime(70)});
 assert(await p.evaluate(()=>raceQA.P.vy>0&&raceQA.P.y>0),'Jump pressed just before landing must fire from the buffer');
 await p.evaluate(()=>{raceQA.clean();raceQA.P.y=.55;raceQA.P.vy=-.1;raceQA.jump();advanceTime(350)});
 assert.equal(await p.evaluate(()=>raceQA.P.vy),0,'An expired jump press must not fire on a late landing');
 await p.evaluate(()=>{raceQA.clean();raceQA.P.y=.02;raceQA.P.vy=-.5;raceQA.jump();raceQA.setMode('paused');raceQA.setMode('play');advanceTime(70)});
 assert.equal(await p.evaluate(()=>raceQA.P.vy),0,'Pause must cancel a queued jump');
 await p.evaluate(()=>{raceQA.clean();raceQA.P.v=150;raceQA.S.inv0=0;raceQA.S.shield=0;const e=raceQA.addObs('CPI',0,1);e.s=raceQA.P.s+3.5;raceQA.step(.05)});
 assert(await p.evaluate(()=>raceQA.S.margin<100),'A boosted kart must not skip through a low hazard');
 await p.evaluate(()=>{raceQA.clean();raceQA.S.inv0=0;raceQA.S.shield=0;raceQA.S.aiShots=[{s:raceQA.P.s-2,x:0,v:160,owner:raceQA.S.rivals[0]}];raceQA.step(.05)});
 assert(await p.evaluate(()=>raceQA.S.margin<100),'A rival missile must hit while crossing between endpoints');
 await p.evaluate(()=>{raceQA.clean();raceQA.P.v=150;const a=raceQA.S.rivals[0];a.s=raceQA.P.s+3.5;a.x=0;a.tx=0;a.v=0;a.laneT=999;raceQA.S.shots=[{s:raceQA.P.s+.4,x:0,homing:true,t:0}];raceQA.step(.05)});
 assert(await p.evaluate(()=>raceQA.S.rivals[0].stun>0),'Homing missile must not skip the nearest rival');
 const rates=[];for(const fps of [30,60,144])rates.push(await p.evaluate(fps=>{raceQA.clean();raceQA.keys.r=true;for(let t=0;t<.4-1e-8;t+=1/fps)raceQA.tick(Math.min(1/fps,.4-t));raceQA.keys.r=false;return {s:raceQA.P.s,x:raceQA.P.x,vx:raceQA.P.vx}},fps));
 for(const r of rates){assert(Math.abs(r.s-rates[0].s)<.02,'Frame rate changed forward distance');assert(Math.abs(r.x-rates[0].x)<.02,'Frame rate changed steering');}
 assert.deepEqual(errors,[]);console.log('PASS reliability: jump buffer/expiry/pause, boosted hazard, rival and homing missile sweeps, frame partitions');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
