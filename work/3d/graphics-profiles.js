(function(root,factory){
 if(typeof module==='object'&&module.exports)module.exports=factory();
 else root.GraphicsProfiles=factory();
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const PROFILES=Object.freeze({
  standard:Object.freeze({maxBackingPixels:2400000,dprCap:1.6,shadowSize:2048,shadowEnabled:true,nearEnter:60,nearExit:75,sceneryStride:1,crowdStride:1}),
  // Phones draw at up to 2x for sharp edges; shadows and dense scenery stay off, which is where phone frame time goes.
  economy:Object.freeze({maxBackingPixels:1400000,dprCap:2,shadowSize:512,shadowEnabled:false,nearEnter:36,nearExit:48,sceneryStride:2,crowdStride:2})
 });
 function parsePreference(value){return value==='standard'||value==='economy'?value:'auto';}
 function positive(value,fallback){return Number.isFinite(value)&&value>0?value:fallback;}
 function resolve(preference,environment={}){
  const requestedQuality=parsePreference(preference),width=positive(environment.width,1),height=positive(environment.height,1),dpr=positive(environment.dpr,1);
  const compact=width<720||height<500;
  const quality=requestedQuality==='auto'?(environment.coarsePointer||compact?'economy':'standard'):requestedQuality;
  const profile=PROFILES[quality],pixelRatio=Math.min(dpr,profile.dprCap,Math.sqrt(profile.maxBackingPixels/(width*height)));
  const reason=requestedQuality!=='auto'?'manual':environment.coarsePointer?'touch':compact?'compact':'desktop';
  return Object.freeze({...profile,requestedQuality,quality,reason,pixelRatio,backingWidth:Math.max(1,Math.floor(width*pixelRatio)),backingHeight:Math.max(1,Math.floor(height*pixelRatio))});
 }
 return Object.freeze({PROFILES,parsePreference,resolve});
});
