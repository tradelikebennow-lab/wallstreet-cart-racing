const Competition = (() => {
 const DIFFICULTY_KEY='bull-run-3d-difficulty', BESTS_KEY='bull-run-3d-bests', LEGACY_KEY='bull-run-3d-best';
 const profiles={
  easy:{id:'easy',label:'Easy',pace:.92,acceleration:8,braking:14,steering:2.1,lookAhead:.6,reactionDelay:.32,avoidance:.62,attackChance:.55,attackCooldown:[12,18]},
  medium:{id:'medium',label:'Medium',pace:1,acceleration:9,braking:14,steering:2.6,lookAhead:1,reactionDelay:.18,avoidance:.82,attackChance:.8,attackCooldown:[8,14]},
  hard:{id:'hard',label:'Hard',pace:1.065,acceleration:10,braking:14,steering:3,lookAhead:1.45,reactionDelay:.07,avoidance:.96,attackChance:1,attackCooldown:[6,10]}
 };
 for(const p of Object.values(profiles)){Object.freeze(p.attackCooldown);Object.freeze(p);}Object.freeze(profiles);
 const parseDifficulty=value=>Object.hasOwn(profiles,value)?value:'medium';
 const profile=value=>profiles[parseDifficulty(value)];
 function readDifficulty(storage){try{return parseDifficulty(storage.getItem(DIFFICULTY_KEY));}catch{return 'medium';}}
 function writeDifficulty(storage,id){try{storage.setItem(DIFFICULTY_KEY,parseDifficulty(id));}catch{}}
 function validBest(value){return value&&Number.isFinite(value.pnl)&&Number.isInteger(value.place)&&value.place>=1&&value.place<=6?{pnl:value.pnl,place:value.place}:null;}
 function emptyBests(){return {version:1,legacyImported:false,byDifficulty:{easy:null,medium:null,hard:null}};}
 function saveBests(storage,records){try{storage.setItem(BESTS_KEY,JSON.stringify(records));}catch{}}
 function loadBests(storage){
  const records=emptyBests();let saved;
  try{saved=JSON.parse(storage.getItem(BESTS_KEY)||'null');}catch{}
  if(saved&&saved.version===1){for(const id of Object.keys(profiles))records.byDifficulty[id]=validBest(saved.byDifficulty?.[id]);records.legacyImported=saved.legacyImported===true;}
  if(!records.legacyImported){
   if(!records.byDifficulty.medium){try{records.byDifficulty.medium=validBest(JSON.parse(storage.getItem(LEGACY_KEY)||'null'));}catch{}}
   records.legacyImported=true;saveBests(storage,records);
  }
  return records;
 }
 function recordBest(records,id,score){
  const result={...records,byDifficulty:{...records.byDifficulty}},next=validBest(score);if(!next)return result;
  id=parseDifficulty(id);const old=validBest(result.byDifficulty[id]);
  result.byDifficulty[id]=old?{pnl:Math.max(old.pnl,next.pnl),place:Math.min(old.place,next.place)}:next;return result;
 }
 const clamp=(v,lo,hi)=>Math.max(lo,Math.min(hi,v));
 const targetSpeed=(maximum,skill,x,rules)=>maximum*skill*rules.pace*(Math.abs(x)>1.55?.6:1);
 const nextSpeed=(speed,target,rules,dt)=>speed+clamp(target-speed,-rules.braking*dt,rules.acceleration*dt);
 const nextLane=(x,target,rules,dt)=>x+clamp(target-x,-rules.steering*dt,rules.steering*dt);
 function hazardHit(old,rival,entity,definition,collision,oldEntity=entity){
  const overlap=collision.activeHazardContact(entity,oldEntity,collision.sweepAabb(old,rival,oldEntity,entity,{s:(definition.depth||.6)/2+.3,x:entity.span*.5+.12}));
  if(!overlap)return false;
  const y0=collision.heightAtContact(old.y||0,rival.y||0,overlap.tEnter),y1=collision.heightAtContact(old.y||0,rival.y||0,overlap.tExit);
  const clearance={low:.5,pit:.25,ice:.15}[definition.kind];
  if(clearance!==undefined)return Math.min(y0,y1)<clearance;
  if(definition.kind==='high'){
   const duck0=collision.heightAtContact(old.duck||0,rival.duck||0,overlap.tEnter),duck1=collision.heightAtContact(old.duck||0,rival.duck||0,overlap.tExit);
   return !(Math.min(duck0,duck1)>0&&Math.max(y0,y1)<.15);
  }
  return true;
 }
 return {profiles,parseDifficulty,profile,readDifficulty,writeDifficulty,validBest,loadBests,saveBests,recordBest,targetSpeed,nextSpeed,nextLane,hazardHit};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Competition;
