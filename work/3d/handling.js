const Handling = (() => {
 function stepHandling(state,input,surface,dt){
  let {x=0,vx=0,steer=0}=state;
  const limit=(v,a,b)=>Math.max(a,Math.min(b,v));
  const command=limit(input.steer||0,-1,1),drift=!!input.drifting;
  const grip=limit((surface.grip??1)*(surface.offroad?.55:1)*(surface.airborne?.23:1)*(drift?.46:1),.08,1);
  const n=Math.max(1,Math.ceil(dt*240)),h=dt/n;
  for(let i=0;i<n;i++){
   steer+=(command-steer)*(1-Math.exp(-14*h));
   const target=limit(steer*(drift?1.05:3.3)-(surface.curvature||0)*(state.v||0)*2.6,-3.7,3.7);
   const rate=(command*vx<0?13:9)*grip;
   const decay=Math.exp(-rate*h),old=vx;
   vx=target+(vx-target)*decay;
   x+=target*h+(old-target)*(1-decay)/rate;
   if(x>=2.7){x=2.7;if(vx>0)vx=0;}if(x<=-2.7){x=-2.7;if(vx<0)vx=0;}
  }
  return {x,vx,steer,heading:limit(Math.atan2(vx*2.8,Math.max(14,(state.v||0)*1.6))+(drift?steer*.25:steer*.08),-.48,.48)};
 }
 return {stepHandling};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Handling;
