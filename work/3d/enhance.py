from patching import read, sub

def replace_fn(s,name,body):
 a=s.index('function '+name+'(');b=s.index('\n}',a)+2
 return s[:a]+body+s[b:]

def enhance(s):
 meta="""const ITEM_META={
 SHORT:{name:'Short missile',action:'FIRE',effect:'Shoot ahead'},HEDGE:{name:'Hedge shield',action:'BLOCK',effect:'Absorb a hit'},MOON:{name:'Moon rocket',action:'BOOST',effect:'Burst of speed'},DIAMOND:{name:'Diamond',action:'INVINCIBLE',effect:'Smash through'},RUG:{name:'Rug trap',action:'DROP TRAP',effect:'Spin rivals'},BAILOUT:{name:'Bailout',action:'REPAIR',effect:'Restore margin'},BREAKER:{name:'Circuit bolt',action:'CLEAR',effect:'Clear + freeze'}
};
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
"""
 s=sub(s,'const wname =',meta+'const wname =')
 s=sub(s,'function drawIcon(g, type, x, y, s, t = 0) {','function drawIcon(g, type, x, y, s, t = 0) {\n  if(G3?.icons?.[type]){g.drawImage(G3.icons[type],x-s/2,y-s/2,s,s);return;}')
 s=sub(s,'function use(i) {','function useBase(i) {')
 s=sub(s,'function pickup(e) {','function pickupBase(e) {')
 s=sub(s,'  buildUI(); updateBest(); init3D(); resize();','  buildUI(); initRaceUX(); updateBest(); init3D(); paintIcons(); resize();')
 s=sub(s,'function step(dt) {','function step(dt) {\n  updateRaceUX(dt);')
 s=sub(s,'    raceT: 0, pnl: 0,','    radioLog: [], feedbackT: 0, raceT: 0, pnl: 0,')
 s=sub(s,"  el2.nm.textContent = wname(s.k, s.lv);", "  el2.nm.textContent = ITEM_META[s.k].name;\n  el2.b.querySelector('.item-action').textContent=ITEM_META[s.k].action+' · LV'+s.lv;\n  el2.b.title=ITEM_META[s.k].effect+' — '+WPN[s.k].descs[s.lv-1];")
 s=sub(s,"el2.nm.textContent = 'Empty';", "el2.nm.textContent = 'Empty'; if(el2.b.querySelector('.item-action'))el2.b.querySelector('.item-action').textContent='COLLECT AN ITEM';")
 s=sub(s,"<span class=\"nm\">Empty</span><span class=\"pips\">", "<span class=\"nm\">Empty</span><span class=\"item-action\">COLLECT AN ITEM</span><span class=\"pips\">")
 s=replace_fn(s,'showBreaking',"""function showBreaking(title,hint,hist='',tag='BREAKING',secs=3){
 el.bkTag.textContent=tag;el.bkTitle.textContent=title;
 const h=hint.toLowerCase();const cue=/jump/.test(h)?'↑ JUMP':/slide|duck/.test(h)?'↓ SLIDE':/hedge|diamond|breaker|defend/.test(h)?'USE DEFENSE':/time|beat|while.*up/.test(h)?'TIME IT':/avoid|dodge|lane|steer/.test(h)?'← → STEER':tag==='HALT'?'TRACK CLEARED':'RACE RADIO';
 el.bkHint.textContent=cue;el.bkHist.textContent=hist;el.bkHist.hidden=true;el.bk.hidden=false;S.bkT=secs;
 (S.radioLog||=[]).unshift({title,hint,hist});S.radioLog.length=Math.min(S.radioLog.length,8);renderRadioLog();
}""")
 # Replacement is one line in original; avoid replacing a whole following function.
 old="function floatText(text, x, y, col = '#eef1f6', size = 22) { S.texts.push({ text, x, y, col, size, life: 1.1 }); }"
 s=sub(s,old,"""function floatText(text,x,y,col='#eef1f6',size=22){if(text==='GO!'){S.texts.push({text,x:W/2,y:H*.3,col,size:Math.min(64,W*.15),life:.55});return;}setRaceFeedback(text,col);} """)
 s=sub(s,'// Real WebGL scene.',read('work/3d/race-ux.js')+'\n// Real WebGL scene.')
 s=sub(s,'</style>',read('work/3d/race-ux.css')+'\n</style>')
 s=sub(s,'<div class="fx" id="fx"></div>','<div class="race-feedback" id="raceFeedback" hidden role="status" aria-live="polite"></div><div class="fx" id="fx"></div>')
 s=sub(s,'<button class="go" id="bResume">Back to the race</button>', '<button class="go" id="bResume">Back to the race</button><section class="radio-history"><h3>Race radio · recent events</h3><ol id="radioHistory"></ol></section>')
 return s
