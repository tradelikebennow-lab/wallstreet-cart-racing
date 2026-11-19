let engineVoice=null;
var itemFeedbackReady=true;
const slotFeedback=Array.from({length:3},()=>({remaining:0,sequence:0}));
let feedbackSequence=0;
function clearItemFeedback(preserveReceipt=false){
 for(let i=0;i<3;i++){slotFeedback[i].remaining=0;slotEl[i]?.b.removeAttribute('data-item-cue');}
 if(!preserveReceipt){S.feedbackT=0;const f=$('raceFeedback');if(f)f.hidden=true;}
 G3?.clearItemFeedback();
}
function playStackSound(level){
 const base=level===3?880:660;
 tone(base,.09,'triangle',.065);tone(base*1.5,.13,'triangle',.065,0,.08);
 if(level===3)tone(base*2,.2,'triangle',.06,0,.17);
}
function presentItemFeedback(event){
 if(!event)return;
 const {type,slot,kind,level,bonus}=event,meta=ITEM_META[kind],cue=slotFeedback[slot],button=slotEl[slot].b;
 paintSlot(slot);hc['sl'+slot]=S.slots[slot]?S.slots[slot].k+S.slots[slot].lv:'-';
 cue.remaining=.48;cue.sequence++;button.dataset.itemCue=type;button.dataset.cuePhase=cue.sequence%2?'a':'b';
 button.style.setProperty('--stack-strength',level);
 const message=type==='max-bonus'?'MAX BONUS '+fmt(bonus)+' · '+meta.name.toUpperCase():type==='upgrade'?(level===3?'MAX READY':'STACK UP · LV2 / 3')+' · '+meta.name.toUpperCase():type==='collect'?meta.name.toUpperCase()+' · LV1 / 3':meta.action+'! · '+meta.effect;
 setRaceFeedback(message,WPN[kind].col);G3?.emitItemFeedback(event);
}
reducedMotion.addEventListener('change',()=>{if(itemFeedbackReady)clearItemFeedback(true);});
function initRaceUX(){
 const route=el.rt;
 route.setAttribute('role','group');
 route.setAttribute('aria-label','Race progress from start to finish');
 for(const [row,dot] of dots.entries()){
  dot.style.setProperty('--racer-row',row);
  dot.setAttribute('role','img');
  dot.setAttribute('aria-label',dot.title);
 }
 const playerKey=document.createElement('span');
 playerKey.className='player-key';
 playerKey.textContent='You';
 el.prog.before(playerKey);
 const ticker=document.querySelector('.ticker');ticker.insertBefore(el.bk,$('tkWrap'));el.bk.setAttribute('role','status');el.bk.setAttribute('aria-live','polite');el.bk.setAttribute('aria-atomic','true');
 for(const node of document.querySelectorAll('.arm')){const k=ORDER[[...document.querySelectorAll('.arm')].indexOf(node)];node.querySelector('b').textContent=ITEM_META[k].name;}
}
function renderRadioLog(){const list=$('radioHistory');if(!list)return;list.replaceChildren();for(const e of S.radioLog||[]){const li=document.createElement('li'),b=document.createElement('b'),p=document.createElement('p');b.textContent=e.title;p.textContent=e.hint+(e.hist?' '+e.hist:'');li.append(b,p);list.append(li);}if(!list.children.length){const li=document.createElement('li');li.textContent='Market events will appear here during the race.';list.append(li);}}
function setRaceFeedback(message,color){const f=$('raceFeedback');if(!f)return;f.textContent=message;f.style.setProperty('--feedback',color);f.hidden=false;S.feedbackT=1.35;f.classList.remove('pop');f.dataset.pop=++feedbackSequence%2?'a':'b';}

function updateRaceUX(dt){
 G3?.advanceItemFeedback(dt);
 if(S.mode==='play')for(let i=0;i<3;i++){const cue=slotFeedback[i];if(cue.remaining>0){cue.remaining-=dt;if(cue.remaining<=0)slotEl[i].b.removeAttribute('data-item-cue');}}
 if(S.mode!=='paused'&&S.feedbackT>0){S.feedbackT-=dt;if(S.feedbackT<=0)$('raceFeedback').hidden=true;}
 if(['title','count','results'].includes(S.mode)){$('raceFeedback').hidden=true;if(S.mode==='count')S.feedbackT=0;}
 if(AC&&!engineVoice){const o=AC.createOscillator(),g=AC.createGain(),filter=AC.createBiquadFilter();o.type='sawtooth';filter.type='lowpass';filter.frequency.value=330;g.gain.value=0;o.connect(filter);filter.connect(g);g.connect(master);o.start();engineVoice={o,g};}
 if(engineVoice){const active=!muted&&S.mode==='play';engineVoice.g.gain.setTargetAtTime(active?.018:0,AC.currentTime,.06);engineVoice.o.frequency.setTargetAtTime(55+P.v*2+(P.boost>0?35:0),AC.currentTime,.08);}
}
function use(i){
 if(S.mode!=='play')return;
 const held=S.slots[i],before=held?{k:held.k,lv:held.lv}:null;
 useBase(i);presentItemFeedback(ItemFeedback.use(i,before,S.slots[i]));
 if(before?.k==='MOON'&&S.slots[i]===null)S.shake=0;
}
function pickup(e){
 if(S.mode!=='play')return false;
 const before=ItemFeedback.beforePickup(S.slots,e.kind,S.pnl),ok=pickupBase(e);
 presentItemFeedback(ItemFeedback.pickup(before,S.slots,S.pnl,ok));return ok;
}
