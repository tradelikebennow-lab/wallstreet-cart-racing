const ChaseCamera = (() => {
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 function cameraTarget(player,surface,ahead,viewport,options={}){
  const portrait=viewport.width/viewport.height<.85,wide=viewport.width/viewport.height>1.8||(viewport.height<500&&viewport.width>viewport.height),reduced=!!options.reducedMotion;
  const jump=clamp(player.jump||0,0,1.6),height=player.y||0;
  return {position:{x:player.x*.55+clamp(player.vx||0,-3.7,3.7)*.12,y:(portrait?6.9:wide?6.2:5.1)+height+jump*.45+clamp(ahead.y-height,-1.5,1.5)*.12,z:portrait?13.5:wide?14:10.5},lookAt:{x:player.x*.55+ahead.x*.45,y:1.15+height+jump*.28+clamp(ahead.y-height,-3,3)*.4,z:portrait?(viewport.height<650?Math.max(-5,ahead.z*.2):Math.max(-18,ahead.z*.55)):wide?-1:-6},fov:(portrait||wide?62:55)+(player.boost&&!reduced?Math.min(8,Math.max(0,(player.speed||0)/5)):0),roll:reduced?0:clamp(-(surface.bank||0)*.16-(player.steer||0)*.012,-.045,.045)};
 }
 function stepCamera(previous,target,dt){
  if(!previous)return {position:{...target.position},lookAt:{...target.lookAt},fov:target.fov,roll:target.roll};
  const a=1-Math.exp(-6*Math.max(0,dt)),mix=(p,t)=>p+(t-p)*a;
  const vector=(p,t)=>({x:mix(p.x,t.x),y:mix(p.y,t.y),z:mix(p.z,t.z)});
  return {position:vector(previous.position,target.position),lookAt:vector(previous.lookAt,target.lookAt),fov:mix(previous.fov,target.fov),roll:mix(previous.roll,target.roll)};
 }
 return {cameraTarget,stepCamera};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=ChaseCamera;
