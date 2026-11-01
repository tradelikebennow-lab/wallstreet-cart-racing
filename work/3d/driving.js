let driftInput=null;
function clearDriftInput(){
 const input=driftInput;driftInput=null;
 if(input?.kind==='pointer'){try{$('bDrift').releasePointerCapture(input.id);}catch{}}
}
function holdDrift(on,release=true){
 if(on){if(S.mode!=='play')return;P.driftHeld=true;P.driftReleased=false;}
 else{P.driftHeld=false;P.driftReleased=release&&S.mode==='play';if(!release)cancelDrift();}
 $('bDrift')?.setAttribute('aria-pressed',String(P.driftHeld));
}
function cancelDrift(){clearDriftInput();P.drifting=false;P.driftCharge=0;P.driftTier=0;P.driftReleased=false;P.driftHeld=false;const meter=$('driftMeter');if(meter)meter.hidden=true;$('bDrift')?.setAttribute('aria-pressed','false');}
function updateDriving(dt){
 const steer=clamp((keys.r?1:0)-(keys.l?1:0)+touchSteer,-1,1);
 const safe=S.mode==='play'&&Math.abs(P.x)<1.50&&P.y<.06&&P.v>12&&P.spin<=0&&P.freeze<=0&&P.reverse<=0;
 if(P.driftReleased){
  const tier=P.driftTier;
  if(safe&&P.drifting&&tier>0){const duration=[0,.7,1.15,1.6][tier],mult=[1,1.22,1.35,1.5][tier];
   if(P.boost<=0){P.boost=duration;P.boostMult=mult;}else if(P.boostMult<=mult){P.boost=Math.max(P.boost,duration);P.boostMult=mult;}
   P.v=Math.max(P.v,VMAX*mult);S.drifts=(S.drifts||0)+1;sfx.boost();setRaceFeedback(['','MINI TURBO!','SUPER TURBO!','ULTRA TURBO!'][tier],['','#5dc8ff','#ffb046','#f27bdf'][tier]);G3?.emitItemFeedback({type:'turbo',kind:'MOON',level:tier});
  }
  cancelDrift();
 }
 const held=P.driftHeld;
 if(held&&safe&&Math.abs(steer)>.2){P.drifting=true;P.driftCharge=Math.min(2.15,P.driftCharge+dt);const tier=P.driftCharge>=1.85?3:P.driftCharge>=1.2?2:P.driftCharge>=.55?1:0;
  if(tier>P.driftTier)tone(560+tier*220,.12,'triangle',.055,100);P.driftTier=tier;
 }else if(P.drifting){cancelDrift();}
}
function updateDrivingHUD(){
 const meter=$('driftMeter');if(meter){meter.hidden=!P.drifting;if(P.drifting){meter.dataset.tier=P.driftTier;$('driftFill').style.width=Math.round(P.driftCharge/2.15*100)+'%';$('driftText').textContent=P.driftTier?['','MINI TURBO','SUPER TURBO','ULTRA TURBO'][P.driftTier]+' · RELEASE TO BOOST':'HOLD + STEER TO CHARGE';}}
 const speed=$('speedValue');if(speed){const v=Math.round(P.v*5.76).toString();if(speed.textContent!==v)speed.textContent=v;}
}
function initDrivingControls(){
 const begin=input=>{if(S.mode!=='play'||driftInput||P.driftHeld)return false;driftInput=input;holdDrift(true);return true;};
 const end=(kind,id,release)=>{if(driftInput?.kind!==kind||driftInput.id!==id)return;driftInput=null;holdDrift(false,release);};
 window.addEventListener('keydown',e=>{if(e.key==='Shift'){e.preventDefault();if(!e.repeat)begin({kind:'key',id:e.key});}});
 window.addEventListener('keyup',e=>{if(e.key==='Shift'){e.preventDefault();end('key',e.key,true);}});
 window.addEventListener('blur',cancelDrift);
 const b=$('bDrift');b.addEventListener('pointerdown',e=>{e.preventDefault();if(begin({kind:'pointer',id:e.pointerId})){audio();b.setPointerCapture(e.pointerId);}});
 const release=e=>{e.preventDefault();end('pointer',e.pointerId,e.type==='pointerup');};for(const event of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(event,release);
 b.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();if(!e.repeat)begin({kind:'key',id:e.key});}});b.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();e.stopPropagation();end('key',e.key,true);}});
}
