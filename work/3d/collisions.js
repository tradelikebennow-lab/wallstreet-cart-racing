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
 return {sweepAabb,heightAtContact};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Collision;
