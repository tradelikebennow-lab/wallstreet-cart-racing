let musicEnabled=true,musicEl=null,musicSector=-1,skidVoice=null,skidTarget=-1;
function initArcadeAudio(){
 const control=$('musicEnabled');control.addEventListener('change',()=>{musicEnabled=control.checked;syncMusic();});
 // iOS only lets an audio element start from a tap until it has played once, so each button that resumes the race also syncs the music inside its click.
 const restart=()=>{musicSector=-1;syncMusic();};
 $('bStart').addEventListener('click',restart);$('bAgain').addEventListener('click',restart);
 $('bResume').addEventListener('click',syncMusic);$('bMute').addEventListener('click',syncMusic);
 document.addEventListener('visibilitychange',syncMusic);
}
// Tracks are loudness-matched to -16 LUFS; .1 puts them about 6 dB under the shoot sound, where the old synth tune sat, so effects stay audible.
function syncMusic(){
 if(!AC)return;
 if(!musicEl){musicEl=new Audio();musicEl.loop=true;const gain=AC.createGain();gain.gain.value=.1;AC.createMediaElementSource(musicEl).connect(gain);gain.connect(master);}
 const want=musicEnabled&&!muted&&!document.hidden&&(S.mode==='count'||S.mode==='play');
 if(!want){if(!musicEl.paused)musicEl.pause();return;}
 const sec=sectorOf(P.s);
 if(sec!==musicSector){musicSector=sec;musicEl.src=SECTOR_MUSIC[sec];}
 if(musicEl.paused)musicEl.play().catch(()=>{});
}
function updateArcadeAudio(){
 if(!AC)return;
 if(!skidVoice){const source=AC.createBufferSource(),filter=AC.createBiquadFilter(),gain=AC.createGain();source.buffer=noiseBuf;source.loop=true;filter.type='bandpass';filter.frequency.value=1500;filter.Q.value=.8;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(master);source.start();skidVoice={source,filter,gain};}
 const active=S.mode==='play'&&!muted,now=AC.currentTime,skidLevel=active&&P.drifting?.025:0;
 if(skidLevel!==skidTarget){const gain=skidVoice.gain.gain;gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);gain.setTargetAtTime(skidLevel,now,.055);skidTarget=skidLevel;}skidVoice.filter.frequency.setTargetAtTime(1100+P.v*18,now,.06);
 if(active)for(const e of S.ents){if(e.type==='TRUMP'&&!e.podiumSting&&e.s-P.s>0&&e.s-P.s<30){e.podiumSting=true;tone(196,.09,'triangle',.05,40);tone(247,.09,'triangle',.05,30,.10);tone(294,.20,'triangle',.05,-55,.20);}}
 syncMusic();
}
