const test=require('node:test');
const assert=require('node:assert/strict');
const {createRace,tick,STEP,LENGTH}=require('../server/race.cjs');
const controls=()=>[{steer:0,drift:false},{steer:0,drift:false}];
test('the room countdown holds both karts; a contested pickup has one owner',()=>{
 const race=createRace(['bull','bear']),inputs=controls();
 tick(race,inputs);assert.equal(race.racers[0].s,0);
 race.elapsed=1;
 for(const r of race.racers.slice(0,2))Object.assign(r,{s:299.2,v:25,x:-1});
 tick(race,inputs);
 assert.equal(race.racers[0].item+race.racers[1].item,1);
 assert.equal(race.pickups.some(p=>p.s===300),false);
 const winner=race.racers.find(r=>r.item);inputs[winner.id].fire=true;tick(race,inputs);
 assert.equal(winner.item,0);assert(winner.boost>0);
});
test('finish order is based on crossing time within the shared tick',()=>{
 const race=createRace(['bull','bear']);race.elapsed=20;
 Object.assign(race.racers[0],{s:LENGTH-.25,v:27});Object.assign(race.racers[1],{s:LENGTH-.1,v:27});
 tick(race,controls(),STEP);assert(race.done);assert(race.racers[1].finish<race.racers[0].finish);
});
