from pathlib import Path

def stages(s):
 s=s.replace('    radioLog: [], feedbackT: 0,','    podiumSeen: false, drifts: 0, radioLog: [], feedbackT: 0,')
 s=s.replace('  Object.assign(P, { s: 0,', '  Object.assign(P, { drifting:false, driftHeld:false, driftReleased:false, driftTier:0, driftCharge:0, s: 0,')
 s=s.replace('  // ----- player -----','  updateDriving(w);\n  // ----- player -----')
 s=s.replace('P.x += P.steer * 3.3 * w', 'P.x += P.steer * (P.drifting ? .85 : 3.3) * w')
 s=s.replace('  S.mode = m; game.dataset.mode = m;', "  S.mode = m; game.dataset.mode = m; if(m!=='play')cancelDrift();")
 s=s.replace("  const type = P.s < 160 ?", "  if(!S.podiumSeen&&sec===0&&P.s>130){addObs('TRUMP',pick([-1,1]),1);return;}\n  const type = P.s < 160 ?")
 s=s.replace('function addObs(type, x, span, extra = 0) {', "function addObs(type, x, span, extra = 0) {\n  if(type==='TRUMP')S.podiumSeen=true;")
 s=s.replace('function initRaceUX(){','function initRaceUX(){\n initDrivingControls();')
 s=s.replace('let engineVoice=null;',Path('work/3d/driving.js').read_text()+'\nlet engineVoice=null;')
 s=s.replace('</style>',Path('work/3d/driving.css').read_text()+'\n</style>')
 s=s.replace('<div class="race-feedback"', '<div id="driftMeter" class="drift-meter" hidden><span id="driftText">HOLD + STEER TO CHARGE</span><div><i id="driftFill"></i></div></div><div class="race-feedback"',1)
 s=s.replace('  <section class="ovl" id="title">', '<div class="drive-tools"><div class="speed-readout"><b id="speedValue">0</b>KM/H</div><button type="button" class="drift-button" id="bDrift" aria-pressed="false">DRIFT<small>HOLD SHIFT + STEER</small></button></div>\n  <section class="ovl" id="title">')
 s=s.replace('Steer ← → or A D (curves push you wide)', 'Steer ← → or A D · Hold Shift + steer to drift; release Shift for a charged boost (blue → orange → pink)')
 s=s.replace('Phone: hold the left or right edge to steer,', 'Phone: hold DRIFT with one finger and either screen edge with another; release DRIFT to boost. Hold the left or right edge to steer,')
 s=s.replace('player: { s: +P.s.toFixed(1),','drift: {active:!!P.drifting,tier:P.driftTier,charge:+P.driftCharge.toFixed(2)}, player: { s: +P.s.toFixed(1),')
 s=s.replace(' initDrivingControls();',' initDrivingControls(); initArcadeAudio();')
 s=s.replace('function updateRaceUX(dt){','function updateRaceUX(dt){\n updateArcadeAudio();')
 s=s.replace('let engineVoice=null;',Path('work/3d/arcade-sound.js').read_text()+'\nlet engineVoice=null;')
 s=s.replace('<section class="radio-history">','<div class="audio-options"><label><input type="checkbox" id="musicEnabled" checked> Arcade music</label><small>The SND button mutes music and effects.</small></div><section class="radio-history">')
 s=s.replace('</style>',' .audio-options{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:22px;font-size:13px}.audio-options label{display:flex;align-items:center;gap:8px;cursor:pointer}.audio-options input{width:18px;height:18px;accent-color:#ec654a}.audio-options small{color:#557182;font-size:11px}\n</style>')
 return s
