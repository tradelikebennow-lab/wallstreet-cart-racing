def integrate(s, replace_once):
    s = replace_once(s, 'let ptr = null;', '''let ptr = null;
function clearSteering(){
 const pointer=ptr;ptr=null;touchSteer=0;keys.l=keys.r=false;
 if(pointer){try{cvs.releasePointerCapture(pointer.id);}catch{}}
}''')
    s = replace_once(s, "cvs.addEventListener('pointerdown', e => {\n  audio();", "cvs.addEventListener('pointerdown', e => {\n  if(S.mode!=='play'||ptr)return;\n  audio();")
    s = replace_once(s, "cvs.addEventListener('pointerup', endPtr); cvs.addEventListener('pointercancel', endPtr);", """cvs.addEventListener('pointerup', endPtr); cvs.addEventListener('pointercancel', endPtr);
cvs.addEventListener('lostpointercapture',e=>{if(ptr&&ptr.id===e.pointerId){clearSteering();cancelJump();}});""")
    s = replace_once(s, '  const r = cvs.getBoundingClientRect();\n  W =', '''  const r = cvs.getBoundingClientRect();
  if(W&&Math.abs(r.width-W)>1){clearSteering();cancelJump();cancelDrift();}
  W =''')
    s = replace_once(s, "if(m!=='play')cancelDrift();", "if(m!=='play'){clearSteering();cancelDrift();}")
    s = replace_once(s, "window.addEventListener('blur', () => { keys.l = keys.r = false; touchSteer = 0; cancelJump(); simulationStepper.reset(); });", "window.addEventListener('blur', () => { clearSteering(); cancelJump(); simulationStepper.reset(); });")
    s = replace_once(s, "document.addEventListener('visibilitychange', () => { cancelJump(); simulationStepper.reset(); if (document.hidden && S.mode === 'play') setMode('paused'); });", "document.addEventListener('visibilitychange', () => { cancelJump(); simulationStepper.reset(); if(document.hidden){clearSteering();cancelDrift();if(S.mode==='play')setMode('paused');} });")
    s = replace_once(s, "  if (k === 'arrowleft' || k === 'a') keys.l = true;", "  if (S.mode==='play'&&(k === 'arrowleft' || k === 'a')) keys.l = true;")
    s = replace_once(s, "  if (k === 'arrowright' || k === 'd') keys.r = true;", "  if (S.mode==='play'&&(k === 'arrowright' || k === 'd')) keys.r = true;")
    return s
