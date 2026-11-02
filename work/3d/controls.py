def integrate(s, sub):
    s = sub(s, 'const ptrs = new Map();', '''const ptrs = new Map();
function clearSteering(){keys.l=keys.r=false;ptrs.clear();setSteer('l',0);setSteer('r',0);}''')
    s = sub(s, '  const r = cvs.getBoundingClientRect();\n  W =', '''  const r = cvs.getBoundingClientRect();
  if(W&&Math.abs(r.width-W)>1){clearSteering();cancelJump();cancelDrift();}
  W =''')
    s = sub(s, "if(m!=='play')cancelDrift();", "if(m!=='play'){clearSteering();cancelDrift();}")
    s = sub(s, "window.addEventListener('blur', () => { keys.l = keys.r = false; ptrs.clear(); setSteer('l', 0); setSteer('r', 0); cancelJump(); simulationStepper.reset(); });", "window.addEventListener('blur', () => { clearSteering(); cancelJump(); simulationStepper.reset(); });")
    s = sub(s, "  if (document.hidden) { if (S.mode === 'play') setMode('paused'); AC?.suspend(); }", "  if (document.hidden) { clearSteering(); cancelDrift(); if (S.mode === 'play') setMode('paused'); AC?.suspend(); }")
    s = sub(s, "  if (k === 'arrowleft' || k === 'a') keys.l = true;", "  if (S.mode==='play'&&(k === 'arrowleft' || k === 'a')) keys.l = true;")
    s = sub(s, "  if (k === 'arrowright' || k === 'd') keys.r = true;", "  if (S.mode==='play'&&(k === 'arrowright' || k === 'd')) keys.r = true;")
    return s
