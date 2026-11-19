function initFriendRoom(){
 let ws=null,id=-1,latest=null,previous=null,received=0,code='',playing=false,complete=false;
 let lastInput='',jump=false,fire=false,session=0;
 const lobby=$('friendLobby'),status=$('friendStatus'),setup=$('friendSetup'),invite=$('friendInvite');
 game.append(lobby);
 const leave=document.createElement('button');leave.id='friendLeave';leave.textContent='Leave race';leave.hidden=true;game.append(leave);
 const friendDot=dots[4];
 const originalDot=()=>RIVALS[4];
 const dotAppearance=(name,color)=>{if(!friendDot)return;friendDot.title=name;friendDot.setAttribute('aria-label',name);friendDot.style.setProperty('--c',color);};
 function dialog(){if(!lobby.open)lobby.showModal();}
 function resetView(){
  session++;if(ws){ws.onclose=null;ws.onmessage=null;ws.close();ws=null;}
  if(playing){clearSteering();cancelDrift();game.classList.remove('friend-race');reset();setMode('title');syncMusic();}
  playing=false;complete=false;latest=previous=null;lastInput='';jump=fire=false;id=-1;code='';
  leave.hidden=true;dotAppearance(originalDot().name,originalDot().jacket);
  setup.hidden=false;invite.hidden=true;$('friendRules').hidden=false;$('friendClose').textContent='Back';
 }
 function message(text){resetView();dialog();status.textContent=text;}
 function close(){resetView();lobby.close();}
 function selectRoom(){
  message('Create a room or enter your friend’s code.');
  if(location.protocol==='file:'){
   setup.hidden=true;status.textContent='Open the multiplayer server to create or join a room.';
   const link=document.createElement('a');link.href='http://localhost:18787/';link.textContent='Open local room server';status.append(' ',link);
  }
 }
 function connect(type){
  if(ws)return;
  audio();setup.hidden=true;status.textContent='Connecting…';
  const generation=++session,socket=new WebSocket((location.protocol==='https:'?'wss://':'ws://')+location.host+'/rooms');ws=socket;
  const timer=setTimeout(()=>{if(generation===session&&!code)message('Could not reach the room server. Try again.');},9000);
  socket.onopen=()=>socket.send(JSON.stringify({type,code:$('friendCode').value.trim().toUpperCase(),driver:$('driverChoice').value}));
  socket.onclose=()=>{if(session===generation&&!complete)message('Connection closed. Create or join a new room.');};
  socket.onmessage=e=>{
   if(generation!==session)return;
   const data=JSON.parse(e.data);clearTimeout(timer);
   if(data.type==='error'||data.type==='ended'){if(!complete)message(data.reason);return;}
   if(data.type==='joined'){
    id=data.id;code=data.code;$('inviteCode').textContent=code;invite.hidden=false;
    status.textContent='Waiting for your friend. Share this code or copy the invite.';return;
   }
   if(data.type!=='state')return;
   if(!playing){
    reset();setMode('count');for(const k in hc)delete hc[k];
    game.classList.add('friend-race');playing=true;lobby.close();leave.hidden=false;
    el.bk.hidden=true;
    dotAppearance('Friend',data.race.racers[1-id].driver==='bear'?'#2869af':'#ef534b');
   }
   previous=latest;latest=data.race;received=performance.now();
   if(latest.elapsed>=0&&S.mode==='count'){setMode('play');sfx.bell();syncMusic();}
   if(latest.done&&!complete){
    frame(0);complete=true;
    const a=latest.racers[id],b=latest.racers[1-id];
    const place=[...latest.racers].filter(r=>r.finish!==null&&r.finish<a.finish).length+1;
    status.textContent=(a.finish===b.finish?'Dead heat!':a.finish<b.finish?'You beat your friend!':'Your friend finished first.')+' You '+tStr(a.finish)+' · Friend '+tStr(b.finish)+' · Your place '+ord(place)+'/6';
    setup.hidden=invite.hidden=$('friendRules').hidden=true;$('friendClose').textContent='Return to setup';dialog();
   }
  };
 }
 function sendInput(){
  if(!playing||complete||ws?.readyState!==1)return;
  const steer=clamp(Number(keys.r)-Number(keys.l)+touchSteer,-1,1),drift=P.driftHeld===true;
  const key=steer+':'+drift;
  if(key!==lastInput||jump||fire){
   ws.send(JSON.stringify({type:'input',steer,drift,jump,fire}));lastInput=key;jump=fire=false;
  }
 }
 function frame(dt){
  if(!playing||!latest)return;
  sendInput();
  const blend=clamp((performance.now()-received)/50,0,1);
  function pose(n,target){
   const a=latest.racers[n],b=previous?.racers[n]||a;
   for(const k of ['s','x','y','v','heading','steer'])target[k]=b[k]+(a[k]-b[k])*blend;
   target.run=target.s*.39;target.finished=a.finish!==null;target.time=a.finish||0;
  }
  const me=latest.racers[id],friend=latest.racers[1-id];
  pose(id,P);P.drifting=me.drifting;P.driftTier=me.tier;P.driftCharge=me.charge;P.boost=me.boost;
  for(let i=0;i<4;i++)pose(i+2,S.rivals[i]);
  const other=S.rivals[4];pose(1-id,other);other.friendDriver=friend.driver;other.short='FRIEND';
  S.raceT=Math.max(0,latest.elapsed);S.countT=Math.max(0,-latest.elapsed);
  S.finalPlace=1+latest.racers.filter(r=>r.finish!==null&&r.finish<me.finish).length;
  S.slots[0]=me.item?{k:'MOON',lv:me.item}:null;S.slots[1]=S.slots[2]=null;
  if(S.ents.length!==latest.pickups.length||!S.ents.length||S.ents[0].id!==latest.pickups[0]?.id){
   S.ents=latest.pickups.map(p=>({...p,cat:'item',kind:'MOON',span:1,t:0,dead:false}));
  }
  for(const pickup of S.ents)pickup.t=S.raceT;
  const sec=sectorOf(P.s);
  if(sec!==S.sector){S.sector=sec;syncMusic();}
  el.bk.hidden=true;cam.s=P.s-PZ;updateDrivingHUD();render3D(dt);hud();
  if(me.finish!==null&&!latest.done)leave.textContent='Finished · waiting for friend';
 }
 $('friendOpen').onclick=()=>{leave.textContent='Leave race';selectRoom();};
 $('friendForm').onsubmit=e=>{e.preventDefault();connect('join');};
 $('friendCreate').onclick=()=>connect('create');$('friendClose').onclick=close;
 leave.onclick=()=>message('You left the race.');
 lobby.oncancel=e=>{e.preventDefault();close();};
 for(const event of ['keydown','keyup'])lobby.addEventListener(event,e=>e.stopPropagation());
 $('copyInvite').onclick=async()=>{
  const url=new URL(location.href);url.searchParams.set('room',code);
  try{await navigator.clipboard.writeText(url.href);status.textContent='Invite link copied. Waiting for your friend.';}
  catch{status.textContent='Share this link: '+url.href;}
 };
 document.addEventListener('visibilitychange',()=>{if(document.hidden&&playing){clearSteering();cancelDrift();sendInput();}});
 window.addEventListener('blur',()=>{if(playing){clearSteering();cancelDrift();sendInput();}});
 const invited=new URLSearchParams(location.search).get('room');
 if(invited&&/^[A-Z2-9]{6}$/i.test(invited)){selectRoom();$('friendCode').value=invited.toUpperCase();}
 return {get active(){return playing;},frame,triggerJump(){jump=true;sendInput();},triggerItem(){fire=true;sendInput();}};
}
