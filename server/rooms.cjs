const http=require('node:http');
const fs=require('node:fs');
const path=require('node:path');
const {randomInt}=require('node:crypto');
const {WebSocketServer,WebSocket}=require('ws');
const {createRace,tick,STEP}=require('./race.cjs');

function createRoomServer(){
 const page=fs.readFileSync(path.join(__dirname,'../outputs/index.html'));
 const license=fs.readFileSync(path.join(__dirname,'../outputs/THREE-LICENSE.txt'));
 const server=http.createServer((req,res)=>{
  const pathname=req.url.split('?')[0];
  if(!['GET','HEAD'].includes(req.method)||!['/','/index.html','/THREE-LICENSE.txt','/healthz'].includes(pathname)){
   res.writeHead(404).end();return;
  }
  const html=pathname==='/'||pathname==='/index.html';
  res.writeHead(200,{'Content-Type':html?'text/html; charset=utf-8':'text/plain','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:html?page:pathname==='/healthz'?'ok':license);
 });
 const wss=new WebSocketServer({noServer:true,maxPayload:1024,perMessageDeflate:false});
 const rooms=new Map();
 server.on('upgrade',(req,socket,head)=>{
  let origin;try{origin=new URL(req.headers.origin);}catch{}
  if(req.url!=='/rooms'||origin?.host!==req.headers.host||wss.clients.size>=120){socket.destroy();return;}
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws));
 });
 const send=(ws,msg)=>{if(ws.readyState===WebSocket.OPEN){if(ws.bufferedAmount>65536)ws.terminate();else ws.send(JSON.stringify(msg));}};
 const broadcast=(room,msg)=>room.peers.forEach(peer=>send(peer.ws,msg));
 function closeRoom(room,reason){
  if(!rooms.delete(room.code))return;
  for(const peer of room.peers){send(peer.ws,{type:'ended',reason});peer.ws.close();}
 }
 wss.on('connection',ws=>{
  let room,peer,count=0,windowStart=Date.now();
  ws.alive=true;ws.on('pong',()=>ws.alive=true);
  const idle=setTimeout(()=>{if(!room)ws.close();},15000);idle.unref();
  ws.on('error',()=>ws.terminate());
  ws.on('close',()=>{clearTimeout(idle);if(room)closeRoom(room,'Your friend left the room.');});
  ws.on('message',raw=>{
   const now=Date.now();
   if(now-windowStart>=1000){count=0;windowStart=now;}
   if(++count>90){ws.close();return;}
   let m;try{m=JSON.parse(raw);}catch{ws.close();return;}
   if(!m||typeof m!=='object')return;
   if(!room){
    const driver=m.driver==='bear'?'bear':'bull';
    if(m.type==='create'){
     if(rooms.size>=50){send(ws,{type:'error',reason:'Rooms are busy. Try again soon.'});return;}
     const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code;
     do{code=Array.from({length:6},()=>alphabet[randomInt(alphabet.length)]).join('');}while(rooms.has(code));
     room={code,peers:[],created:now};rooms.set(code,room);
    }else if(m.type==='join'){
     const found=rooms.get(m.code);
     if(!found||found.peers.length!==1){send(ws,{type:'error',reason:'Room unavailable. Check the code or create a new room.'});return;}
     room=found;
    }else return;
    peer={ws,driver,input:{steer:0,drift:false}};
    room.peers.push(peer);send(ws,{type:'joined',code:room.code,id:room.peers.length-1});
    if(room.peers.length===2){room.race=createRace(room.peers.map(p=>p.driver));broadcast(room,{type:'state',race:room.race});}
   }else if(m.type==='input'&&room.race&&!room.race.done){
    peer.input.steer=[-1,0,1].includes(m.steer)?m.steer:0;
    peer.input.drift=m.drift===true;peer.input.jump||=m.jump===true;peer.input.fire||=m.fire===true;
   }
  });
 });
 let last=performance.now(),debt=0,frame=0;
 const loop=setInterval(()=>{
  const now=performance.now();debt+=Math.min(.25,(now-last)/1000);last=now;
  while(debt>=STEP){debt-=STEP;frame++;
   for(const room of rooms.values()){
    if(Date.now()-room.created>(room.race?15:10)*60000){closeRoom(room,'Room expired. Create a new one to race again.');continue;}
    if(!room.race||room.race.done)continue;
    tick(room.race,room.peers.map(p=>p.input));
    if(frame%3===0||room.race.done)broadcast(room,{type:'state',race:room.race});
   }
  }
 },10);
 const heartbeat=setInterval(()=>{for(const ws of wss.clients){if(!ws.alive)ws.terminate();else{ws.alive=false;ws.ping();}}},15000);
 server.on('close',()=>{clearInterval(loop);clearInterval(heartbeat);wss.close();});
 return server;
}
module.exports={createRoomServer};
if(require.main===module){
 const port=Number(process.env.PORT||18787);
 createRoomServer().listen(port,process.env.BIND_ADDRESS||'0.0.0.0',()=>console.log('Room server listening on port '+port));
}
