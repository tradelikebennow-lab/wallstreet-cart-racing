from pathlib import Path
import base64
from patching import read, sub

# Inlined as data URIs so the game still works when opened straight from disk, where browsers block loading separate files.
def sector_music():
 uris=["'data:audio/mpeg;base64,"+base64.b64encode(Path(f'work/3d/music/{t}.mp3').read_bytes()).decode()+"'" for t in ['circuit','speedway','castle']]
 return 'const SECTOR_MUSIC=['+','.join(uris)+'];\n'

def stages(s):
 s=sub(s,'    radioLog: [], feedbackT: 0,','    podiumSeen: false, drifts: 0, radioLog: [], feedbackT: 0,')
 s=sub(s,'  Object.assign(P, { s: 0,', '  Object.assign(P, { drifting:false, driftHeld:false, driftReleased:false, driftTier:0, driftCharge:0, s: 0,')
 s=sub(s,'  // ----- player -----','  updateDriving(w);\n  // ----- player -----')
 s=sub(s,'P.x += P.steer * 3.3 * w', 'P.x += P.steer * (P.drifting ? .85 : 3.3) * w')
 s=sub(s,'  S.mode = m; game.dataset.mode = m;', "  S.mode = m; game.dataset.mode = m; if(m!=='play')cancelDrift();")
 s=sub(s,"  const type = P.s < 160 ?", "  if(!S.podiumSeen&&sec===0&&P.s>130){addObs('TRUMP',pick([-1,1]),1);return;}\n  const type = P.s < 160 ?")
 s=sub(s,'function addObs(type, x, span, extra = 0) {', "function addObs(type, x, span, extra = 0) {\n  if(type==='TRUMP')S.podiumSeen=true;")
 s=sub(s,'function initRaceUX(){','function initRaceUX(){\n initDrivingControls();')
 s=sub(s,'let engineVoice=null;',read('work/3d/driving.js')+'\nlet engineVoice=null;')
 s=sub(s,'</style>',read('work/3d/driving.css')+'\n</style>')
 s=sub(s,'<div class="race-feedback"', '<div id="driftMeter" class="drift-meter" hidden><span id="driftText">HOLD + STEER TO CHARGE</span><div><i id="driftFill"></i></div></div><div class="race-feedback"')
 s=sub(s,'  <section class="ovl" id="title">', '<div class="drive-tools"><div class="speed-readout"><b id="speedValue">0</b>KM/H</div><button type="button" class="drift-button" id="bDrift" aria-pressed="false">DRIFT<small>HOLD SHIFT + STEER</small></button></div>\n  <section class="ovl" id="title">')
 s=sub(s,'Steer ← → or A D (curves push you wide)', 'Steer ← → or A D · Hold Shift + steer to drift; release Shift for a charged boost (blue → orange → pink)')
 s=sub(s,'Phone: hold the left or right edge to steer,', 'Phone: hold DRIFT with one finger and either screen edge with another; release DRIFT to boost. Hold the left or right edge to steer,')
 s=sub(s,'player: { s: +P.s.toFixed(1),','drift: {active:!!P.drifting,tier:P.driftTier,charge:+P.driftCharge.toFixed(2)}, player: { s: +P.s.toFixed(1),')
 s=sub(s,' initDrivingControls();',' initDrivingControls(); initArcadeAudio();')
 s=sub(s,'function updateRaceUX(dt){','function updateRaceUX(dt){\n updateArcadeAudio();')
 s=sub(s,'let engineVoice=null;',sector_music()+read('work/3d/arcade-sound.js')+'\nlet engineVoice=null;')
 s=sub(s,'<section class="radio-history">','<div class="audio-options"><label><input type="checkbox" id="musicEnabled" checked> Music</label><small>The SND button mutes music and effects.</small></div><section class="radio-history">')
 s=sub(s,'</style>',' .audio-options{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-top:22px;font-size:13px}.audio-options label{display:flex;align-items:center;gap:8px;cursor:pointer}.audio-options input{width:18px;height:18px;accent-color:#ec654a}.audio-options small{color:#557182;font-size:11px}\n</style>')
 return s
