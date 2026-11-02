const assert=require('node:assert/strict');const{openGame}=require('./browser-lib.cjs');
(async()=>{const{browser,page:p,errors}=await openGame();try{
 async function hit(type,options={}){return p.evaluate(({type,options})=>{raceQA.clean();raceQA.S.inv0=options.inv||0;raceQA.S.shield=options.shield?10:0;raceQA.S.shieldHits=1;raceQA.P.diamond=options.diamond?5:0;raceQA.P.y=options.y||0;raceQA.P.vy=options.vy||0;raceQA.P.slide=options.slide||0;const e=raceQA.addObs(type,0,1);e.s=raceQA.P.s+.4;e.t=.72;e.ph0=0;e.armed=true;advanceTime(20);return {margin:raceQA.S.margin,shield:raceQA.S.shield,freeze:raceQA.P.freeze,reverse:raceQA.P.reverse,hits:raceQA.S.stats.hits};},{type,options});}
 assert((await hit('CPI')).margin<100,'Grounded low-barrier contact must hurt');
 assert.equal((await hit('CPI',{y:.9})).margin,100,'Jump clears low barrier');
 assert((await hit('NFP')).margin<100,'High barrier needs slide');
 assert.equal((await hit('NFP',{slide:.6})).margin,100,'Slide clears high barrier');
 assert((await hit('DEPEG')).margin<100,'Grounded pit must hurt');
 assert.equal((await hit('DEPEG',{y:.6})).margin,100,'Jump clears pit');
 const shield=await hit('FOMC',{shield:true});assert.equal(shield.margin,100);assert.equal(shield.shield,0,'Last shield charge spent once');
 assert.equal((await hit('FOMC',{diamond:true})).margin,100,'Diamond protects full barrier');
 assert.equal((await hit('CPI',{inv:5})).margin,100,'Invulnerability protects margin');
 assert((await hit('FROZEN')).freeze>0,'Ice applies freeze');
 assert.equal((await hit('FROZEN',{diamond:true})).freeze,0,'Diamond protects from ice');
 assert((await hit('HACK')).reverse>0,'Hack reverses after unprotected hit');
 assert.equal((await hit('HACK',{shield:true})).reverse,0,'Shield blocks hack reversal');
 await p.evaluate(()=>{raceQA.clean();raceQA.S.inv0=0;raceQA.P.y=.6;raceQA.P.vy=-15;const e=raceQA.addObs('CPI',0,1);e.s=raceQA.P.s+.6;raceQA.step(.05)});
 assert(await p.evaluate(()=>raceQA.S.margin<100),'Descending into a barrier during overlap must collide');
 assert.deepEqual(errors,[]);console.log('PASS collision rules: jump/slide/pit clearance, shield, diamond, invulnerability, ice, hack, descending contact');
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
