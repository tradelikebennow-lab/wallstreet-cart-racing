from pathlib import Path
from upgrade import replace_once

def replace_fn(s,name,body):
 a=s.index('function '+name+'(');b=s.index('\n}',a)+2
 return s[:a]+body+s[b:]

def enhance(s):
 meta="""const ITEM_META={
 SHORT:{name:'Short missile',action:'FIRE',effect:'Shoot ahead'},HEDGE:{name:'Hedge shield',action:'BLOCK',effect:'Absorb a hit'},MOON:{name:'Moon rocket',action:'BOOST',effect:'Burst of speed'},DIAMOND:{name:'Diamond',action:'INVINCIBLE',effect:'Smash through'},RUG:{name:'Rug trap',action:'DROP TRAP',effect:'Spin rivals'},BAILOUT:{name:'Bailout',action:'REPAIR',effect:'Restore margin'},BREAKER:{name:'Circuit bolt',action:'CLEAR',effect:'Clear + freeze'}
};
const reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
"""
 s=s.replace('const wname =',meta+'const wname =')
 s=s.replace('function drawIcon(g, type, x, y, s, t = 0) {','function drawIcon(g, type, x, y, s, t = 0) {\n  if(G3?.icons?.[type]){g.drawImage(G3.icons[type],x-s/2,y-s/2,s,s);return;}')
 s=s.replace('function use(i) {','function useBase(i) {').replace('function pickup(e) {','function pickupBase(e) {')
 s=s.replace('  buildUI(); updateBest(); init3D(); resize();','  buildUI(); initRaceUX(); updateBest(); init3D(); paintIcons(); resize();')
 s=s.replace('function step(dt) {','function step(dt) {\n  updateRaceUX(dt);')
 s=s.replace('    raceT: 0, pnl: 0,','    radioLog: [], feedbackT: 0, raceT: 0, pnl: 0,')
 s=s.replace("  el2.nm.textContent = wname(s.k, s.lv);", "  el2.nm.textContent = ITEM_META[s.k].name;\n  el2.b.querySelector('.item-action').textContent=ITEM_META[s.k].action+' · LV'+s.lv;\n  el2.b.title=ITEM_META[s.k].effect+' — '+WPN[s.k].descs[s.lv-1];")
 s=s.replace("el2.nm.textContent = 'Empty';", "el2.nm.textContent = 'Empty'; if(el2.b.querySelector('.item-action'))el2.b.querySelector('.item-action').textContent='COLLECT AN ITEM';")
 s=s.replace("<span class=\"nm\">Empty</span><span class=\"pips\">", "<span class=\"nm\">Empty</span><span class=\"item-action\">COLLECT AN ITEM</span><span class=\"pips\">")
 s=replace_fn(s,'showBreaking',"""function showBreaking(title,hint,hist='',tag='BREAKING',secs=3){
 el.bkTag.textContent=tag;el.bkTitle.textContent=title;
 const h=hint.toLowerCase();const cue=/jump/.test(h)?'↑ JUMP':/slide|duck/.test(h)?'↓ SLIDE':/hedge|diamond|breaker|defend/.test(h)?'USE DEFENSE':/time|beat|while.*up/.test(h)?'TIME IT':/avoid|dodge|lane|steer/.test(h)?'← → STEER':tag==='HALT'?'TRACK CLEARED':'RACE RADIO';
 el.bkHint.textContent=cue;el.bkHist.textContent=hist;el.bkHist.hidden=true;el.bk.hidden=false;S.bkT=secs;
 (S.radioLog||=[]).unshift({title,hint,hist});S.radioLog.length=Math.min(S.radioLog.length,8);renderRadioLog();
}""")
 # Replacement is one line in original; avoid replacing a whole following function.
 old="function floatText(text, x, y, col = '#eef1f6', size = 22) { S.texts.push({ text, x, y, col, size, life: 1.1 }); }"
 s=s.replace(old,"""function floatText(text,x,y,col='#eef1f6',size=22){if(text==='GO!'){S.texts.push({text,x:W/2,y:H*.3,col,size:Math.min(64,W*.15),life:.55});return;}setRaceFeedback(text,col);} """)
 s=replace_once(s,'// Real WebGL scene.',Path('work/3d/item-feedback.js').read_text()+'\n'+Path('work/3d/race-ux.js').read_text()+'\n// Real WebGL scene.')
 s=s.replace('</style>',Path('work/3d/race-ux.css').read_text()+'\n</style>')
 s=s.replace('<div class="fx" id="fx"></div>','<div class="race-feedback" id="raceFeedback" hidden role="status" aria-live="polite"></div><div class="fx" id="fx"></div>')
 s=s.replace('<button class="go" id="bResume">Back to the race</button>', '<button class="go" id="bResume">Back to the race</button><section class="radio-history"><h3>Race radio · recent events</h3><ol id="radioHistory"></ol></section>')
 s=s.replace('aria-label="Slot', 'aria-label="Slot')
 return enhance_item_stacking(s)

def enhance_item_stacking(s):
 s=replace_once(s, '<span class="item-action">COLLECT AN ITEM</span><span class="pips">', '<span class="item-action">COLLECT AN ITEM</span><span class="stack-badge" hidden aria-hidden="true"></span><span class="pips" aria-hidden="true">')
 s=replace_once(s, "pips: [...b.querySelectorAll('.pips i')]", "badge:b.querySelector('.stack-badge'), action:b.querySelector('.item-action'), pips: [...b.querySelectorAll('.pips i')]")
 s=replace_once(s, "  if (!s) { el2.nm.textContent = 'Empty';", "  el2.pips.forEach((p,j)=>p.classList.toggle('on',!!s&&j<s.lv));\n  el2.badge.hidden=!s;el2.badge.textContent=s?(s.lv===3?'MAX READY':'LV'+s.lv+' / 3'):'';\n  el2.b.dataset.level=s?s.lv:0;\n  if (!s) { el2.b.style.removeProperty('--c'); el2.b.removeAttribute('title'); el2.nm.textContent = 'Empty';")
 s=replace_once(s, "  drawIcon(g, s.k, 40, 40, 66 + s.lv * 3, 0.3);", "  for(let layer=s.lv-1;layer>0;layer--){g.globalAlpha=.18;drawIcon(g,s.k,40-layer*5,40-layer*4,59,.3);}\n  g.globalAlpha=1;drawIcon(g,s.k,43,42,63,.3);")
 s=replace_once(s, "ITEM_META[s.k].action+' · LV'+s.lv", "ITEM_META[s.k].action")
 s=replace_once(s, "function bumpSlot(i) { const b = slotEl[i].b; b.classList.remove('got'); void b.offsetWidth; b.classList.add('got'); }", '')
 s=replace_once(s, 'function reset() {', 'function reset() {\n  if(typeof itemFeedbackReady!==\'undefined\'&&itemFeedbackReady)clearItemFeedback();')
 s=replace_once(s, "  S.mode = m; game.dataset.mode = m;", "  S.mode = m; game.dataset.mode = m;\n  if(m!=='play'&&m!=='paused')clearItemFeedback();")
 s=replace_once(s, '      s.lv++; sfx.lev(); sfx.crate();', '      s.lv++; playStackSound(s.lv);')
 s=replace_once(s, "      floatText(`LV${s.lv} ${wname(k, s.lv).toUpperCase()}!`, p.x, p.y - 50, wd.col, 28);\n      burst(p.x, p.y - 20, 30, { cols: [wd.col, '#ffffff', '#ffd23f'], speed: 320, g: 60, life: 0.8, size: 6 });\n      S.flash = 0.3; S.flashCol = '255,255,255';", '')
 s=replace_once(s, "      floatText(`MAXED · ${fmt(v)}`, p.x, p.y - 44, wd.col, 20);", '')
 s=replace_once(s, '    bumpSlot(i); return true;', '    return true;')
 s=replace_once(s, "  floatText(`+ ${wname(k, 1).toUpperCase()}`, p.x, p.y - 44, wd.col, 22);\n  burst(p.x, p.y - 20, 18, { cols: [wd.col, '#ffffff'], speed: 240, g: 100, life: 0.6, size: 5 });\n  bumpSlot(i); return true;", '  return true;')
 return s
