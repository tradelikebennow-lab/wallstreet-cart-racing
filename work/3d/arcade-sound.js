let musicEnabled=true,musicVoice=null,skidVoice=null,musicBeat=0,nextMusicBeat=0,musicTarget=-1,skidTarget=-1,musicConnected=false;
function initArcadeAudio(){const control=$('musicEnabled');control.addEventListener('change',()=>{musicEnabled=control.checked;nextMusicBeat=0;});}
function arcadeNote(midi,duration,type,level){if(!AC||!musicVoice)return;const now=AC.currentTime,o=AC.createOscillator(),g=AC.createGain();o.type=type;o.frequency.value=440*Math.pow(2,(midi-69)/12);g.gain.setValueAtTime(.0001,now);g.gain.exponentialRampToValueAtTime(level,now+.008);g.gain.exponentialRampToValueAtTime(.0001,now+duration);o.connect(g);g.connect(musicVoice);o.start(now);o.stop(now+duration+.015);}
function updateArcadeAudio(){
 if(!AC)return;
 if(!musicVoice){musicVoice=AC.createGain();musicVoice.gain.value=0;const source=AC.createBufferSource(),filter=AC.createBiquadFilter(),gain=AC.createGain();source.buffer=noiseBuf;source.loop=true;filter.type='bandpass';filter.frequency.value=1500;filter.Q.value=.8;gain.gain.value=0;source.connect(filter);filter.connect(gain);gain.connect(master);source.start();skidVoice={source,filter,gain};}
 const active=S.mode==='play'&&!muted,now=AC.currentTime;
 const musicLevel=active&&musicEnabled?.18:0,skidLevel=active&&P.drifting?.025:0;
 if(musicLevel!==musicTarget){if(musicLevel===0&&musicConnected){musicVoice.disconnect();musicConnected=false;}else if(musicLevel>0&&!musicConnected){musicVoice.connect(master);musicConnected=true;}const gain=musicVoice.gain;gain.cancelScheduledValues(now);gain.setValueAtTime(musicLevel===0?0:gain.value,now);if(musicLevel>0)gain.setTargetAtTime(musicLevel,now,.04);musicTarget=musicLevel;}
 if(skidLevel!==skidTarget){const gain=skidVoice.gain.gain;gain.cancelScheduledValues(now);gain.setValueAtTime(gain.value,now);gain.setTargetAtTime(skidLevel,now,.055);skidTarget=skidLevel;}skidVoice.filter.frequency.setTargetAtTime(1100+P.v*18,now,.06);
 if(active)for(const e of S.ents){if(e.type==='TRUMP'&&!e.podiumSting&&e.s-P.s>0&&e.s-P.s<30){e.podiumSting=true;tone(196,.09,'triangle',.05,40);tone(247,.09,'triangle',.05,30,.10);tone(294,.20,'triangle',.05,-55,.20);}}
 if(!active||!musicEnabled){nextMusicBeat=0;return;}
 if(now>=nextMusicBeat){
  const melody=[72,76,79,81,79,76,74,76,72,76,79,84,81,79,76,74,77,81,84,81,79,77,76,72,74,77,79,83,81,79,74,71];
  if(musicBeat%2===0)arcadeNote(melody[(musicBeat/2)%melody.length|0],.13,'triangle',.12);
  if(musicBeat%4===0)arcadeNote([48,53,55,48][Math.floor(musicBeat/16)%4],.17,'triangle',.13);
  if(musicBeat%4===2)arcadeNote(43,.055,'sine',.075);
  musicBeat=(musicBeat+1)%128;nextMusicBeat=now+60/132/2;
 }

}
