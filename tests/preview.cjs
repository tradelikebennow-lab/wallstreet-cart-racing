const {openGame}=require('./browser-lib.cjs');
(async()=>{const{browser,page:p,errors}=await openGame();try{
 await p.evaluate(()=>{raceQA.clean(80);raceQA.P.x=-.35;raceQA.S.rivals.forEach((a,i)=>{a.s=80+22+i*5;a.x=i%2?1:-1;});const e=raceQA.addObs('TRUMP',.8,1);e.s=89;e.tx=.8;e.hopT=99;e.quote='TARIFFS!';raceQA.addItem(-1,'MOON',-62);raceQA.S.slots=[{k:'SHORT',lv:1},{k:'HEDGE',lv:1},{k:'MOON',lv:1}];raceQA.showBreaking('Podium panic','Dodge the moving podium!');raceQA.render3D(2);raceQA.tick(0);});
 await p.waitForTimeout(350);await p.screenshot({path:'outputs/bull-run-3d-preview.png'});
 await p.setViewportSize({width:390,height:844});await p.waitForTimeout(200);await p.evaluate(()=>{raceQA.render3D(2);raceQA.tick(0)});await p.screenshot({path:'outputs/kart-mobile-preview.png'});
 await p.setViewportSize({width:1440,height:900});await p.waitForTimeout(200);await p.evaluate(()=>{raceQA.clean(400);raceQA.S.shield=8;raceQA.render3D(2);raceQA.tick(0)});await p.waitForTimeout(150);await p.screenshot({path:'outputs/kart-ramp-preview.png'});
 if(errors.length)throw Error(errors.join('\n'));console.log('Preview images captured from the generated game');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
