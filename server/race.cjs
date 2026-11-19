const Handling = require('../work/3d/handling');
const Course = require('../work/3d/course');
const {curveAt} = require('./track.cjs');
const LENGTH = 4200;
const STEP = 1 / 60;
const clamp = (v,min,max) => Math.max(min,Math.min(max,v));

function createRace(drivers) {
 const racers = [...drivers,'Hal','Dee','Betty','Quant'].map((driver,id) => ({
  id,driver,s:0,x:[-.65,.65,-1,1,-1,1][id],v:0,y:0,vy:0,heading:0,steer:0,vx:0,
  charge:0,tier:0,drifting:false,boost:0,mult:1,item:0,pad:false,finish:null
 }));
 return {elapsed:-3,racers,pickups:[300,800,1250,1670,2130,2590,2980,3440,3900].map((s,i)=>({id:i+1,s,x:i%2?1:-1})),done:false};
}
function tick(race,inputs,dt=STEP) {
 if(race.done)return;
 race.elapsed+=dt;
 if(race.elapsed<0)return;
 const claims=[];
 for(const a of race.racers){
  if(a.finish!==null)continue;
  const human=a.id<2, input=human?inputs[a.id]:null;
  const steer=human?input.steer:clamp((Math.sin(a.s/105+a.id)*.85-a.x)*2,-1,1);
  const oldS=a.s;
  if(human && input.jump){if(a.y<=0)a.vy=8.4;input.jump=false;}
  if(human && input.fire){if(a.item){a.boost=2+a.item*.5;a.mult=1.55;a.item=0;}input.fire=false;}
  const canDrift=a.v>12&&Math.abs(a.x)<1.5&&a.y<.06;
  if(a.drifting&&human&&!input.drift&&canDrift&&a.tier){
   const mult=[1,1.22,1.35,1.5][a.tier];
   if(!a.boost||mult>=a.mult){a.mult=mult;a.boost=Math.max(a.boost,[0,.7,1.15,1.6][a.tier]);}
   a.v=Math.max(a.v,27*mult);
  }
  a.drifting=!!(human&&input.drift&&Math.abs(steer)>.2&&canDrift);
  a.charge=a.drifting?Math.min(2.15,a.charge+dt):0;
  a.tier=a.charge>=1.85?3:a.charge>=1.2?2:a.charge>=.55?1:0;
  const surface=Course.sampleCourse(a.s,a.x);
  Object.assign(a,Handling.stepHandling(a,{steer,drifting:a.drifting},{...surface,curvature:curveAt(a.s),offroad:Math.abs(a.x)>1.62,airborne:a.y>.05},dt));
  const pace=human?27:24.8+(a.id-2)*.65;
  const target=pace*(a.boost>0?a.mult:Math.abs(a.x)>1.62?.55:1);
  a.v+=clamp(target-a.v,-16*dt,(a.boost>0?30:10)*dt);
  a.s+=a.v*dt;
  a.boost=Math.max(0,a.boost-dt);
  const pad=Course.openingChoice;
  if(!a.pad && Math.abs(a.s-pad.station)<=pad.halfLength && Math.abs(a.x-pad.inside)<=pad.halfWidth && a.y<.05){
   a.pad=true;if(!a.boost||a.mult<=1.35){a.boost=Math.max(a.boost,1.15);a.mult=1.35;}a.v=Math.max(a.v,27*1.35);
  }
  const ramp=Course.crossedRampExit(oldS,a.s);
  if(ramp && a.y===0 && Math.abs(a.x)<1.62)a.vy=ramp.launchSpeed;
  a.vy-=26*dt;a.y=Math.max(0,a.y+a.vy*dt);if(!a.y)a.vy=0;
  if(human)for(const p of race.pickups){
   if(Math.abs(a.s-p.s)<.75&&Math.abs(a.x-p.x)<.5&&a.y<1.3)
    claims.push({a,p,t:clamp((p.s-.75-oldS)/Math.max(.001,a.s-oldS),0,1),gap:Math.abs(a.x-p.x)});
  }
  if(a.s>=LENGTH){a.finish=race.elapsed-(a.s-LENGTH)/a.v;a.s=LENGTH;a.v=0;}
 }
 claims.sort((l,r)=>l.t-r.t||l.gap-r.gap||l.a.id-r.a.id);
 for(const {a,p} of claims){const i=race.pickups.indexOf(p);if(i>=0){race.pickups.splice(i,1);a.item=Math.min(3,a.item+1);}}
 race.done=race.racers.slice(0,2).every(a=>a.finish!==null);
}
module.exports={createRace,tick,LENGTH,STEP};
