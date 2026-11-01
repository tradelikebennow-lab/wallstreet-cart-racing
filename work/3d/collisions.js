const Collision = (() => {
 function sweepAabb(a0,a1,b0,b1,halfExtents){
  let tEnter=0,tExit=1;
  for(const axis of ['s','x']){
   const start=a0[axis]-b0[axis];
   const motion=(a1[axis]-a0[axis])-(b1[axis]-b0[axis]);
   const extent=halfExtents[axis];
   if(motion===0){if(Math.abs(start)>extent)return null;continue;}
   const t0=(-extent-start)/motion,t1=(extent-start)/motion;
   tEnter=Math.max(tEnter,Math.min(t0,t1));
   tExit=Math.min(tExit,Math.max(t0,t1));
   if(tEnter>tExit)return null;
  }
  return {tEnter,tExit};
 }
 function heightAtContact(y0,y1,t){return y0+(y1-y0)*t;}
 function activeHazardContact(entity,oldEntity,overlap){
  if(!overlap||!entity.armed)return null;
  if(entity.type!=='GAVEL')return overlap;
  const start=(oldEntity.t||0)*.85+(entity.ph0||0),motion=((entity.t||0)-(oldEntity.t||0))*.85;
  if(motion===0){const phase=start%1;return phase>.52&&phase<.92?overlap:null;}
  for(let cycle=Math.floor(start+motion*overlap.tEnter);cycle<=Math.floor(start+motion*overlap.tExit);cycle++){
   const lo=Math.max(overlap.tEnter,(cycle+.52-start)/motion),hi=Math.min(overlap.tExit,(cycle+.92-start)/motion);
   if(lo<hi)return {tEnter:lo,tExit:hi};
  }
  return null;
 }
 return {sweepAabb,heightAtContact,activeHazardContact};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Collision;
