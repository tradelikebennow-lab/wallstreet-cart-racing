let engineVoice=null;
function initRaceUX(){
 const ticker=document.querySelector('.ticker');ticker.insertBefore(el.bk,$('tkWrap'));el.bk.setAttribute('role','status');el.bk.setAttribute('aria-live','polite');el.bk.setAttribute('aria-atomic','true');
 for(const node of document.querySelectorAll('.arm')){const k=ORDER[[...document.querySelectorAll('.arm')].indexOf(node)];node.querySelector('b').textContent=ITEM_META[k].name;}
}
function renderRadioLog(){const list=$('radioHistory');if(!list)return;list.replaceChildren();for(const e of S.radioLog||[]){const li=document.createElement('li'),b=document.createElement('b'),p=document.createElement('p');b.textContent=e.title;p.textContent=e.hint+(e.hist?' '+e.hist:'');li.append(b,p);list.append(li);}if(!list.children.length){const li=document.createElement('li');li.textContent='Market events will appear here during the race.';list.append(li);}}
function setRaceFeedback(message,color){const f=$('raceFeedback');if(!f)return;f.textContent=message;f.style.setProperty('--feedback',color);f.hidden=false;S.feedbackT=1.35;f.classList.remove('pop');if(!reducedMotion.matches){void f.offsetWidth;f.classList.add('pop');}}
function updateRaceUX(dt){
 if(S.mode!=='paused'&&S.feedbackT>0){S.feedbackT-=dt;if(S.feedbackT<=0)$('raceFeedback').hidden=true;}
 if(['title','count','results'].includes(S.mode)){$('raceFeedback').hidden=true;if(S.mode==='count')S.feedbackT=0;}
 if(AC&&!engineVoice){const o=AC.createOscillator(),g=AC.createGain(),filter=AC.createBiquadFilter();o.type='sawtooth';filter.type='lowpass';filter.frequency.value=330;g.gain.value=0;o.connect(filter);filter.connect(g);g.connect(master);o.start();engineVoice={o,g};}
 if(engineVoice){const active=!muted&&S.mode==='play';engineVoice.g.gain.setTargetAtTime(active?.018:0,AC.currentTime,.06);engineVoice.o.frequency.setTargetAtTime(55+P.v*2+(P.boost>0?35:0),AC.currentTime,.08);}
}
function use(i){const before=S.slots[i];useBase(i);if(before&&S.slots[i]===null){setRaceFeedback(ITEM_META[before.k].action+'! · '+ITEM_META[before.k].effect,WPN[before.k].col);G3?.emit('use',before.k);if(before.k==='MOON')S.shake=0;}}
function pickup(e){const ok=pickupBase(e);if(ok){const held=S.slots.find(s=>s&&s.k===e.kind);setRaceFeedback(ITEM_META[e.kind].name.toUpperCase()+' · '+ITEM_META[e.kind].action+' · LV'+(held?.lv||1),WPN[e.kind].col);G3?.emit('pickup',e.kind);}return ok;}
