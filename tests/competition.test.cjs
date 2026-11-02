const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const Competition=require('../work/3d/competition.js');
const Collision=require('../work/3d/collisions.js');
const memory=(data={})=>({data:{...data},getItem(k){return this.data[k]??null},setItem(k,v){this.data[k]=v}});
test('validated preference defaults to Medium and race profiles cannot change',()=>{
 for(const value of [null,'','Hard',{},'impossible'])assert.equal(Competition.parseDifficulty(value),'medium');
 for(const id of ['easy','medium','hard']){assert.equal(Competition.parseDifficulty(id),id);assert(Object.isFrozen(Competition.profile(id)));}
 const active=Competition.profile('easy');let selected='hard';assert.equal(active.id,'easy');assert.equal(Competition.profile(selected).id,'hard');
});
test('pace, reactions, steering and attacks form ordered fixed policies',()=>{
 const [easy,medium,hard]=['easy','medium','hard'].map(Competition.profile);
 for(const field of ['pace','acceleration','steering','lookAhead','avoidance','attackChance'])assert(easy[field]<medium[field]&&medium[field]<hard[field],field);
 assert(easy.reactionDelay>medium.reactionDelay&&medium.reactionDelay>hard.reactionDelay);
 for(let i=0;i<2;i++)assert(easy.attackCooldown[i]>medium.attackCooldown[i]&&medium.attackCooldown[i]>hard.attackCooldown[i]);
 for(const skill of [.9,.95,.97,1,1.01]){let previous=Infinity;for(const profile of [easy,medium,hard]){let s=0,v=0,t=0;while(s<4200){v=Competition.nextSpeed(v,Competition.targetSpeed(27,skill,0,profile),profile,1/120);s+=v/120;t+=1/120;}assert(t<previous);previous=t;}}
});
test('rival travel is bounded and has no player gap input',()=>{
 for(const id of ['easy','medium','hard']){const p=Competition.profile(id);assert.equal(Competition.targetSpeed(36,.97,0,p),36*.97*p.pace);assert.equal(Competition.targetSpeed(36,.97,2,p),36*.97*p.pace*.6);assert(Competition.nextSpeed(0,100,p,.1)<=p.acceleration*.1);assert(100-Competition.nextSpeed(100,0,p,.1)<=p.braking*.1+1e-9);assert(Math.abs(Competition.nextLane(-1,1,p,.1)+1)<=p.steering*.1+1e-9);}
});
test('best records reject corrupt fields and migrate old Medium record once',()=>{
 for(const invalid of [null,{}, {pnl:Infinity,place:1},{pnl:1,place:0},{pnl:1,place:7},{pnl:1,place:1.5},{pnl:'20',place:2}])assert.equal(Competition.validBest(invalid),null);
 const storage=memory({'bull-run-3d-best':JSON.stringify({pnl:840,place:3})});let records=Competition.loadBests(storage);assert.deepEqual(records.byDifficulty.medium,{pnl:840,place:3});assert(storage.data['bull-run-3d-best']);
 records=Competition.recordBest(records,'hard',{pnl:300,place:2});Competition.saveBests(storage,records);storage.data['bull-run-3d-best']=JSON.stringify({pnl:9000,place:1});records=Competition.loadBests(storage);assert.deepEqual(records.byDifficulty.medium,{pnl:840,place:3});assert.deepEqual(records.byDifficulty.hard,{pnl:300,place:2});assert.equal(records.byDifficulty.easy,null);
 records=Competition.recordBest(records,'hard',{pnl:-30,place:1});assert.deepEqual(records.byDifficulty.hard,{pnl:300,place:1});
});
test('newer Medium scores survive import, negative first scores work, storage denial is safe',()=>{
 const storage=memory({'bull-run-3d-bests':JSON.stringify({version:1,byDifficulty:{medium:{pnl:50,place:4}}}),'bull-run-3d-best':JSON.stringify({pnl:999,place:1})});assert.deepEqual(Competition.loadBests(storage).byDifficulty.medium,{pnl:50,place:4});
 assert.deepEqual(Competition.recordBest(Competition.loadBests(memory()),'easy',{pnl:-30,place:6}).byDifficulty.easy,{pnl:-30,place:6});
 const denied={getItem(){throw Error('denied')},setItem(){throw Error('denied')}};assert.doesNotThrow(()=>Competition.loadBests(denied));assert.equal(Competition.readDifficulty(denied),'medium');assert.doesNotThrow(()=>Competition.writeDifficulty(denied,'hard'));assert.doesNotThrow(()=>Competition.saveBests(denied,Competition.loadBests(denied)));
 assert.equal(Competition.loadBests(memory({'bull-run-3d-bests':'{broken'})).byDifficulty.hard,null);
});
test('actual swept height and duck decide hazards even after a successful plan',()=>{
 const a0={s:0,x:0,y:0,duck:0},a1={s:3,x:0,y:0,duck:0};const e={s:1.5,x:0,span:1,plans:[true],armed:true};
 for(const kind of ['low','pit','ice','full','high'])assert.equal(Competition.hazardHit(a0,a1,e,{kind},Collision),true,kind);
 for(const kind of ['low','pit','ice'])assert.equal(Competition.hazardHit({...a0,y:1},{...a1,y:1},e,{kind},Collision),false);
 assert.equal(Competition.hazardHit({...a0,duck:.5},{...a1,duck:.4},e,{kind:'high'},Collision),false);
 assert.equal(Competition.hazardHit({...a0,y:1,duck:.5},{...a1,y:1,duck:.4},e,{kind:'high'},Collision),true);
 assert.equal(Competition.hazardHit({...a0,x:2},{...a1,x:2},e,{kind:'full'},Collision),false);
 assert.equal(Competition.hazardHit({...a0,y:.8},{...a1,y:0},e,{kind:'low'},Collision),true);
});
function scenario(id='medium',random=.999){
 const S={mode:'play',profile:Competition.profile(id),raceT:12,ents:[],aiShots:[],rugs:[]};
 const P={s:0,x:0},math=Object.create(Math);math.random=()=>random;
 const context={S,P,Competition,Collision,VMAX:36,LEN:2400,Math:math,EV:{LOW:{kind:'low'},FULL:{kind:'full'},HIGH:{kind:'high'},PIT:{kind:'pit',depth:1.6},ICE:{kind:'ice',depth:3.2},GAVEL:{kind:'full'}},rand:(lo,hi)=>(lo+hi)/2,pick:xs=>xs[0],isActive:e=>e.armed!==false&&(e.type!=='GAVEL'||(e.t*.85+e.ph0)%1>.52&&(e.t*.85+e.ph0)%1<.92),tickerPush:()=>{},stunAI:(a,t)=>{if(a.stun>0||a.finished)return false;a.stun=t;return true}};
 vm.runInNewContext(fs.readFileSync(require.resolve('../work/3d/competition-ui.js'),'utf8')+'\nthis.move=updateAI;',context);
 return {...context,a:{i:0,name:'Hal',skill:.97,s:0,x:0,tx:0,y:0,vy:0,v:30,stun:0,spinPh:0,duck:0,laneT:10,atk:10,run:0,finished:false}};
}
test('the integrated AI takes physical hazards despite successful legacy plans outside the camera',()=>{
 for(const type of ['LOW','PIT','ICE','FULL','HIGH']){const t=scenario();t.a.s=999;t.S.ents=[{cat:'obs',type,s:1000,x:0,span:3,plans:[true],armed:true}];t.move(t.a,.05);assert(t.a.stun>0,type);assert.equal(t.S.ents[0].plans[0].hit,true);}
 const t=scenario();t.a.s=10000;for(let i=0;i<60;i++)t.move(t.a,1/120);assert.equal(t.a.stun,0);
});
test('active stun suppresses steering, avoidance jumps and attacks while still allowing gravity',()=>{
 const t=scenario('hard',0);t.a.stun=1;t.a.tx=1;t.a.atk=0;t.a.y=.5;t.S.ents=[{cat:'obs',type:'LOW',s:3,x:0,span:3,plans:[],armed:true}];t.P.s=10;t.move(t.a,.05);assert.equal(t.a.x,0);assert.equal(t.a.atk,0);assert.equal(t.S.aiShots.length,0);assert(t.a.y<.5);assert(t.a.stun>0);
});
test('rivals keep normal acceleration and steering at extreme player gaps',()=>{
 for(const id of ['easy','medium','hard']){const near=scenario(id),far=scenario(id);near.P.s=-100000;far.P.s=100000;for(const t of [near,far]){t.a.v=0;t.a.tx=1;t.move(t.a,.1);}assert.equal(near.a.s,far.a.s);assert.equal(near.a.x,far.a.x);assert(near.a.s<=near.S.profile.acceleration*.01+1e-9);assert(near.a.x<=near.S.profile.steering*.1+1e-9);}
});
test('attack policy launches real shorts and rugs only within existing geometry',()=>{
 const t=scenario('hard',0);t.a.atk=0;t.P.s=12;t.move(t.a,.01);assert.equal(t.S.aiShots.length,1);const shot=t.S.aiShots[0];assert.equal(shot.s,t.a.s+.6);assert.equal(shot.x,t.a.x);assert.equal(shot.owner,t.a);assert.equal(t.a.atk,8);
 const rug=scenario('hard',0);rug.a.s=12;rug.a.atk=0;rug.move(rug.a,.01);assert.equal(rug.S.rugs.length,1);assert.equal(rug.S.rugs[0].s,rug.a.s-1.2);
 const distant=scenario('hard',0);distant.P.s=1000;distant.a.atk=0;distant.move(distant.a,.01);assert.equal(distant.S.aiShots.length+distant.S.rugs.length,0);
 const easy=scenario('easy',.8);easy.P.s=12;easy.a.atk=0;easy.move(easy.a,.01);assert.equal(easy.S.aiShots.length,0);
});
test('earlier Hard reaction steers before Medium and Easy under the same hazard',()=>{
 const positions=[];for(const id of ['easy','medium','hard']){const t=scenario(id,0);t.S.ents=[{cat:'obs',type:'FULL',s:10,x:0,span:1,plans:[],armed:true}];for(let i=0;i<12;i++)t.move(t.a,1/120);positions.push(Math.abs(t.a.x));}assert.equal(positions[0],0);assert.equal(positions[1],0);assert(positions[2]>0);
});
test('finished rivals coast and cannot attack or receive new avoidance plans',()=>{
 const t=scenario('hard',0);t.a.finished=true;t.a.atk=0;t.a.time=8;t.P.s=12;t.move(t.a,.1);assert.equal(t.a.time,8);assert(t.a.s>0);assert.equal(t.S.aiShots.length+t.S.rugs.length,0);
});
for(const fixture of [{s:-.61,oldPhase:.9179166667,newPhase:.925,hit:true},{s:.4,oldPhase:.5149166667,newPhase:.522,hit:false}])test(`GAVEL normal-step phase ${fixture.oldPhase} to ${fixture.newPhase} requires hit=${fixture.hit}`,()=>{
 const t=scenario();t.a.s=fixture.s;t.a.v=36;
 const e={cat:'obs',type:'GAVEL',s:0,x:0,span:1,plans:[true],armed:true,t:fixture.newPhase/.85,ph0:0};
 t.S.ents=[e];t.move(t.a,1/120,()=>({...e,t:fixture.oldPhase/.85}));
 assert.equal(t.a.stun>0,fixture.hit,JSON.stringify(fixture));
});
