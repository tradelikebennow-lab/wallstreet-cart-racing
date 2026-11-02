const Course = (() => {
 const features=Object.freeze([{id:'opening-bank',kind:'bank',start:180,end:330},{id:'opening-ramp',kind:'ramp',start:410,exit:442,end:475,launchSpeed:9.2}]);
 const smooth=t=>t*t*(3-2*t),unit=t=>Math.max(0,Math.min(1,t));
 function sampleCourse(s,x=0){
  const bankFeature=features[0],ramp=features[1];
  const u=unit((s-bankFeature.start)/(bankFeature.end-bankFeature.start));
  const bank=s>bankFeature.start&&s<bankFeature.end?.15*Math.sin(Math.PI*u)**2:0;
  const bankHeight=Math.tan(bank)*x*1.4+bank*5;
  const bankSlope=s>180&&s<330?(1.4*x/(Math.cos(bank)**2)+5)*.15*Math.sin(2*Math.PI*u)*Math.PI/150:0;
  let height=0,slope=0;
  if(s>=ramp.start&&s<ramp.exit){const t=(s-ramp.start)/(ramp.exit-ramp.start);height=2.5*smooth(t);slope=2.5*6*t*(1-t)/(ramp.exit-ramp.start);}
  else if(s>=ramp.exit&&s<ramp.end){const t=(s-ramp.exit)/(ramp.end-ramp.exit);height=2.5*(1-smooth(t));slope=-2.5*6*t*(1-t)/(ramp.end-ramp.exit);}
  return {height:height+bankHeight,bank,pitch:Math.atan((slope+bankSlope)*2/1.6),grip:1,rampId:s>=410&&s<=475?ramp.id:null,launchSpeed:ramp.launchSpeed};
 }
 function crossedRampExit(s0,s1){return features.find(f=>f.kind==='ramp'&&s0<f.exit&&s1>=f.exit)||null;}
 function isSpawnClear(s,depth=0){return features.every(f=>s+depth/2<f.start-20||s-depth/2>f.end+30);}
 function worldHeight(s,x,y=0,originS=0){return 2*(sampleCourse(s,x).height-sampleCourse(originS,0).height+y);}
 return {features,sampleCourse,crossedRampExit,isSpawnClear,worldHeight};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Course;
