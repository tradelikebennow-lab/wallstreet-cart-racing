// Real WebGL scene. Original race simulation remains authoritative.
let G3 = null;
function init3D(){
 const T=THREE, scene=new T.Scene();
 const surface=document.createElement('canvas');surface.id='world3d';surface.setAttribute('aria-hidden','true');game.prepend(surface);
 let renderer;
 try{renderer=new T.WebGLRenderer({canvas:surface,antialias:true,alpha:false,powerPreference:'high-performance'});}catch(err){
   const msg=document.createElement('div');msg.className='webgl-error';msg.innerHTML='<h2>3D graphics are unavailable</h2><p>This edition needs WebGL. Try a browser with hardware acceleration enabled.</p><a href="bull-run-grand-prix.html">Open the 2D edition</a>';game.append(msg);$('bStart').disabled=true;return;
 }
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;
 let quality='standard';try{if(localStorage.getItem('bullrun.graphics')==='economy')quality='economy';}catch{}
 const camera=new T.PerspectiveCamera(53,innerWidth/innerHeight,.1,500);scene.add(camera);
 scene.background=new T.Color('#8ad9f2');scene.fog=new T.Fog('#b3e4eb',65,240);
 const hemi=new T.HemisphereLight('#d9f7ff','#8a8655',2.15);scene.add(hemi);
 const sun=new T.DirectionalLight('#fff0cb',3.1);sun.position.set(-28,48,20);sun.castShadow=true;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-35,right:35,top:48,bottom:-38,near:1,far:135});sun.shadow.bias=-.0003;sun.shadow.normalBias=.055;sun.target.position.set(0,0,-25);scene.add(sun,sun.target);
 function applyQuality(){renderer.setPixelRatio(Math.min(devicePixelRatio,quality==='economy'?1:1.6));const size=quality==='economy'?512:2048;if(sun.shadow.mapSize.x!==size){sun.shadow.mapSize.set(size,size);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}sun.shadow.needsUpdate=true;}renderer.setSize(W,H,false);}
 const qualityLabel=document.createElement('label');qualityLabel.textContent='Graphics ';const qualitySelect=document.createElement('select');qualitySelect.id='graphicsQuality';qualitySelect.setAttribute('aria-label','Graphics quality');qualitySelect.innerHTML='<option value="standard">Standard</option><option value="economy">Economy</option>';qualitySelect.value=quality;qualitySelect.addEventListener('keydown',e=>e.stopPropagation());qualityLabel.append(qualitySelect);const audioOptions=document.querySelector('.audio-options');if(audioOptions)audioOptions.append(qualityLabel);qualitySelect.addEventListener('change',()=>{quality=qualitySelect.value;try{localStorage.setItem('bullrun.graphics',quality);}catch{}applyQuality();render3D(0);});applyQuality();
 const rim=new T.DirectionalLight('#c4e9ff',1);rim.position.set(20,8,-20);scene.add(rim);
 const materials=new Map(),geos=new Map();
 function mat(color,rough=.6,metal=0){const key=color+':'+rough+':'+metal;if(!materials.has(key))materials.set(key,new T.MeshStandardMaterial({color,roughness:rough,metalness:metal}));return materials.get(key);}
 const white=mat('#fff9dd',.35),rubber=mat('#1b2330',.86),chrome=mat('#c5d5d9',.22,.7),dark=mat('#293846',.6),gold=mat('#ffcb36',.25,.5);
 const sphere=new T.SphereGeometry(1,20,14),boxgeo=new T.BoxGeometry(1,1,1),cylgeo=new T.CylinderGeometry(1,1,1,20),conegeom=new T.ConeGeometry(1,1,7);
 function mesh(parent,geo,material,x,y,z,sx=1,sy=1,sz=1){const m=new T.Mesh(geo,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
 function orb(p,m,x,y,z,sx,sy=sx,sz=sx){return mesh(p,sphere,m,x,y,z,sx,sy,sz);}
 function box(p,m,x,y,z,sx,sy,sz){return mesh(p,boxgeo,m,x,y,z,sx,sy,sz);}
 function cylinder(p,m,x,y,z,r,h){return mesh(p,cylgeo,m,x,y,z,r,h,r);}
 function roundedGeo(w,h,d,r){const k=[w,h,d,r].join(',');if(geos.has(k))return geos.get(k);const shape=new T.Shape();shape.moveTo(-w/2+r,-h/2);shape.lineTo(w/2-r,-h/2);shape.quadraticCurveTo(w/2,-h/2,w/2,-h/2+r);shape.lineTo(w/2,h/2-r);shape.quadraticCurveTo(w/2,h/2,w/2-r,h/2);shape.lineTo(-w/2+r,h/2);shape.quadraticCurveTo(-w/2,h/2,-w/2,h/2-r);shape.lineTo(-w/2,-h/2+r);shape.quadraticCurveTo(-w/2,-h/2,-w/2+r,-h/2);const geo=new T.ExtrudeGeometry(shape,{depth:Math.max(.01,d-r*2),bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r*.5,bevelThickness:r,curveSegments:6});geo.center();geos.set(k,geo);return geo;}
 function round(p,m,x,y,z,w,h,d,r=.12){return mesh(p,roundedGeo(w,h,d,r),m,x,y,z);}
 function textTexture(txt,fg='#ffffff',bg='#1c566d',w=512,h=128){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');g.fillStyle=bg;g.fillRect(0,0,w,h);g.strokeStyle='#ffffff55';g.lineWidth=8;g.strokeRect(5,5,w-10,h-10);g.fillStyle=fg;g.font='900 '+Math.min(h*.58,w/(txt.length*.65))+'px Arial';g.textAlign='center';g.textBaseline='middle';g.fillText(txt,w/2,h*.53);const t=new T.CanvasTexture(c);t.colorSpace=T.SRGBColorSpace;return t;}
 function sign(p,txt,x,y,z,w=3,h=.65,bg='#194e65',fg='#fff7de'){const t=textTexture(txt,fg,bg,1024,Math.max(64,Math.round(1024*h/w)));const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:t,side:T.DoubleSide,transparent:bg.endsWith("00")}));m.position.set(x,y,z);p.add(m);return m;}
 function noiseTexture(base,scatter){const c=document.createElement('canvas');c.width=c.height=128;const g=c.getContext('2d');g.fillStyle=base;g.fillRect(0,0,128,128);for(let i=0;i<6000;i++){g.fillStyle=i%2?'#ffffff'+scatter:'#000000'+scatter;g.fillRect(hash(i+2)*128,hash(i+999)*128,1,1);}const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.colorSpace=T.SRGBColorSpace;t.anisotropy=renderer.capabilities.getMaxAnisotropy();return t;}
 const groundMat=new T.MeshStandardMaterial({color:'#8ac657',map:noiseTexture('#aebf91','14'),roughness:1});groundMat.map.repeat.set(120,120);
 const ground=new T.Mesh(new T.PlaneGeometry(2000,2000),groundMat);ground.rotation.x=-Math.PI/2;ground.position.y=-.16;ground.receiveShadow=true;scene.add(ground);
 const asphalt=new T.MeshStandardMaterial({color:'#828c94',map:noiseTexture('#9fa5aa','19'),roughness:.95});
 const edgeMat=mat('#f1d19b',.95),redMat=mat('#f56b58',.65),lineMat=mat('#fff7dd',.85);
 const roadSegments=100,roadStart=-15,roadEnd=135;
 function ribbon(l,r,material,height){const a=new Float32Array((roadSegments+1)*6),uv=new Float32Array((roadSegments+1)*4),ix=[];for(let i=0;i<=roadSegments;i++){uv[i*4]=0;uv[i*4+2]=1;uv[i*4+1]=uv[i*4+3]=i*.3;if(i<roadSegments){const j=i*2;ix.push(j,j+1,j+2,j+1,j+3,j+2);}}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.BufferAttribute(a,3).setUsage(T.DynamicDrawUsage));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.setIndex(ix);const m=new T.Mesh(geo,material);m.receiveShadow=true;m.frustumCulled=false;scene.add(m);return {m,l,r,height,a};}
 const ribbons=[ribbon(-5.3,5.3,edgeMat,-.035),ribbon(-4.25,4.25,asphalt,0)];
 let ambientTime=0;
 const lavaMat=new T.ShaderMaterial({uniforms:{flowTime:{value:0}},vertexShader:`varying vec2 flowUV;void main(){flowUV=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,fragmentShader:`uniform float flowTime;varying vec2 flowUV;void main(){vec2 p=flowUV*vec2(15.,7.);p.y+=flowTime*.7;float channel=sin(p.x+sin(p.y*.8)*1.7)+sin(p.y+p.x*.7);float crust=smoothstep(.2,1.1,channel);vec3 col=mix(vec3(1.,.50,.075),vec3(.38,.055,.035),crust);gl_FragColor=vec4(col,1.);}`});const lavaRibbons=[ribbon(-27,-6.4,lavaMat,-.08),ribbon(6.4,27,lavaMat,-.08)];ribbons.push(...lavaRibbons);
 const dummy=new T.Object3D(),dynamicBatches=[];
 function batch(geo,material,n,shadows=true){const m=new T.InstancedMesh(geo,material,n);m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.frustumCulled=false;m.castShadow=shadows;m.receiveShadow=true;scene.add(m);dynamicBatches.push(m);return m;}
 function inst(m,i,x,y,z,sx,sy,sz,ry=0,rz=0,rx=0){dummy.position.set(x,y,z);dummy.scale.set(sx,sy,sz);dummy.rotation.set(rx,ry,rz);dummy.updateMatrix();m.setMatrixAt(i,dummy.matrix);}
 const curbs=batch(boxgeo,white,160,false),redcurbs=batch(boxgeo,redMat,160,false),dashes=batch(boxgeo,lineMat,70,false),fence=batch(boxgeo,white,100),fenceposts=batch(cylgeo,gold,100);
 const trunkMat=mat('#91663d'),leafMat=mat('#4baf68',.85),leafLight=mat('#83ca65',.85),flowerMat=mat('#ffdf60');
 const trunks=batch(cylgeo,trunkMat,48),leaves=batch(sphere,leafMat,96),leafTops=batch(sphere,leafLight,48),flowers=batch(sphere,flowerMat,96,false);
 leaves.userData.sceneryLOD='near';
 const farTrees=batch(new T.ConeGeometry(1,1,5),leafMat,48,false),farCrystals=batch(new T.TetrahedronGeometry(1),mat('#79ebdd',.25,.2),48,false),farTowers=batch(new T.CylinderGeometry(1,1,1,5),mat('#6d6484'),48,false);for(const m of [farTrees,farCrystals,farTowers])m.userData.sceneryLOD='far';const sceneryNear=Array(48).fill(false);let lodNear=0,lodFar=0;
 const crystals=batch(new T.OctahedronGeometry(1),mat('#79ebdd',.25,.2),48),towers=batch(cylgeo,mat('#6d6484'),48),roofs=batch(conegeom,mat('#e69872'),48),towerWindows=batch(boxgeo,mat('#ffd680'),48,false);
 // Rounded distant landforms have volume, lighting and parallax.
 const hills=[];for(let i=0;i<22;i++){const m=orb(scene,mat(i%2?'#67ba76':'#79c381',.95),0,0,0,1);m.castShadow=false;hills.push(m);}
 const clouds=[];for(let i=0;i<9;i++){const g=new T.Group();for(let j=0;j<4;j++)orb(g,mat('#fffdf4',1),(j-1.5)*2,Math.sin(j)*.6,hash(j+i)*1.4,2.7,1.3+hash(j)*.6,1.4).castShadow=false;scene.add(g);clouds.push(g);}
 // Mushroom-like parasols and grandstand buildings add a toy-world scale.
 const buildings=[];for(let i=0;i<8;i++){const g=new T.Group();round(g,mat(['#fff0cf','#ffd9b5','#b9e3eb'][i%3]),0,1.2,0,4,2.4,3,.2);const roof=mesh(g,new T.ConeGeometry(3.1,1.4,4),mat(i%2?'#ee785e':'#60a9bb'),0,3.05,0);roof.rotation.y=Math.PI/4;box(g,mat('#376b81'),0,1.35,1.56,2.5,1,.04);box(g,white,0,1.35,1.59,.09,1,.04);box(g,white,0,1.35,1.6,2.5,.09,.04);sign(g,i%2?'BULL RUN':'PIT STOP',0,2.15,1.6,3,.45);scene.add(g);buildings.push(g);}
 const stands=[];for(let i=0;i<6;i++){const g=new T.Group();for(let row=0;row<3;row++)box(g,mat('#e8d5af'),0,.2+row*.32,-row*.7,5,.3,.8);for(const x of [-2.4,2.4])cylinder(g,white,x,1.7,-1,.07,3.4);round(g,mat(i%2?'#ec705d':'#70b7c8'),0,3.3,-.8,5.5,.15,2.8,.08);sign(g,['BULLS ON PARADE','BUY THE DIP','BEARS USE BRAKES'][i%3],0,2.65,.1,4.8,.5,'#fff4d6','#274d61');scene.add(g);stands.push(g);}
 const crowd=batch(sphere,mat('#ffffff'),72,false);for(let i=0;i<72;i++)crowd.setColorAt(i,new T.Color(['#f07564','#6ca8e4','#a895d5','#eecc63','#79bb92'][i%5]));
 const flags=[];for(let i=0;i<16;i++){const g=new T.Group();cylinder(g,white,0,1.7,0,.045,3.4);orb(g,gold,0,3.45,0,.09);const flag=box(g,mat(i%2?'#ed6d57':'#67bace'),.46,3.05,0,.9,.5,.025);g.userData.flag=flag;scene.add(g);flags.push(g);}
 function makeKart(color,number,skin='#efbc91'){
  const g=new T.Group(),body=new T.Group();g.add(body);const paint=new T.MeshPhysicalMaterial({color,roughness:.27,metalness:.12,clearcoat:1,clearcoatRoughness:.18});
  round(body,dark,0,.34,0,1.4,.24,2.15,.12);round(body,paint,0,.58,-.08,1.6,.48,2.0,.22);orb(body,paint,0,.73,-.84,.77,.36,.62);
  round(body,white,0,.65,-1.25,1.45,.16,.2,.07);round(body,chrome,0,.37,1.11,1.58,.17,.22,.06);
  // Body stripe, raised rear wing and brake lights.
  round(body,white,0,.90,-.93,.19,.04,.7,.03);
  for(const x of [-.56,.56]){box(body,chrome,x,.94,.96,.075,.6,.09);round(body,mat('#f93835',.22),x,.57,1.09,.22,.12,.05,.03);const pipe=cylinder(body,chrome,x,.38,1.15,.115,.3);pipe.rotation.x=Math.PI/2;const hole=cylinder(body,dark,x,.38,1.32,.081,.015);hole.rotation.x=Math.PI/2;}
  round(body,paint,0,1.26,1.00,1.84,.13,.42,.07);round(body,dark,0,.88,.12,.72,.65,.66,.16);
  const wheels=[];for(const x of [-.91,.91])for(const z of [-.69,.70]){
   const pivot=new T.Group();pivot.position.set(x,.37,z);body.add(pivot);const spin=new T.Group();pivot.add(spin);
   const tire=mesh(spin,new T.CylinderGeometry(.37,.37,.33,24,1),rubber,0,0,0);tire.rotation.z=Math.PI/2;
   const rim=cylinder(spin,chrome,Math.sign(x)*.18,0,0,.22,.025);rim.rotation.z=Math.PI/2;
   const hub=cylinder(spin,gold,Math.sign(x)*.20,0,0,.09,.04);hub.rotation.z=Math.PI/2;
   for(let j=0;j<6;j++){const a=j*Math.PI/3;orb(spin,dark,Math.sign(x)*.202,Math.sin(a)*.145,Math.cos(a)*.145,.028);}
   wheels.push({pivot,spin,front:z<0});
  }
  const driver=new T.Group();body.add(driver);const suit=mat(color,.65),skinMat=mat(skin,.8);
  orb(driver,suit,0,1.22,.1,.38,.43,.30);orb(driver,skinMat,0,1.83,.04,.37,.40,.34);
  const helmet=orb(driver,paint,0,1.99,.09,.405,.30,.38);orb(driver,paint,0,1.8,.22,.39,.27,.25);
  round(driver,white,0,2.22,.08,.11,.028,.42,.03);
  orb(driver,mat('#2d5c6e',.15,.35),0,1.96,-.245,.30,.15,.065);
  for(const x of [-.37,.37]){const arm=orb(driver,suit,x,1.29,-.15,.14,.30,.13);arm.rotation.x=-.65;orb(driver,white,x,1.22,-.40,.15,.13,.14);}
  const wheel=new T.Mesh(new T.TorusGeometry(.28,.045,8,20),rubber);wheel.position.set(0,1.25,-.44);wheel.rotation.x=-.5;driver.add(wheel);
  sign(body,String(number).padStart(2,'0'),0,.68,1.025,.4,.22,'#fff4cc','#243d55');
  const shadowTex=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),gr=x.createRadialGradient(32,32,1,32,32,30);gr.addColorStop(0,'#172c4180');gr.addColorStop(1,'#172c4100');x.fillStyle=gr;x.fillRect(0,0,64,64);return new T.CanvasTexture(c);})();
  const shadow=new T.Mesh(new T.PlaneGeometry(2.6,3.2),new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false}));shadow.rotation.x=-Math.PI/2;shadow.position.y=.025;g.add(shadow);
  const bubble=orb(g,new T.MeshPhysicalMaterial({color:'#77dfff',transparent:true,opacity:.20,roughness:.1,metalness:.1,depthWrite:false,side:T.FrontSide}),0,1,0,1.48,1.65,1.65);bubble.visible=false;bubble.castShadow=false;
  const flames=[];for(const x of [-.56,.56]){const flame=orb(body,new T.MeshBasicMaterial({color:'#ffcc58'}),x,.38,1.6,.12,.12,.46);flame.visible=false;flames.push(flame);}
  scene.add(g);return {g,body,driver,wheels,bubble,shadow,flames};
 }
 const player=makeKart('#ef534b',7),racers=RIVALS.map((a,i)=>makeKart(a.jacket,i+1,a.skin));
 player.body.userData.playerBody=true;player.bubble.material.dispose();
 const shieldMat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.FrontSide,uniforms:{flowTime:{value:0},impact:{value:99},shieldOn:{value:0},tint:{value:new T.Color('#77dfff')}},vertexShader:`varying vec3 surfaceNormal;varying vec3 eyeDirection;varying vec2 shieldUV;void main(){vec4 p=modelViewMatrix*vec4(position,1.);surfaceNormal=normalize(normalMatrix*normal);eyeDirection=normalize(-p.xyz);shieldUV=uv;gl_Position=projectionMatrix*p;}`,fragmentShader:`uniform float flowTime;uniform float impact;uniform float shieldOn;uniform vec3 tint;varying vec3 surfaceNormal;varying vec3 eyeDirection;varying vec2 shieldUV;void main(){float rim=pow(1.-abs(dot(normalize(surfaceNormal),normalize(eyeDirection))),2.);float ripple=exp(-pow((distance(shieldUV,vec2(.25,.5))-impact*.9)*20.,2.))*max(0.,1.-impact/.65);float lines=pow(.5+.5*sin(shieldUV.y*65.-flowTime*3.),12.);float alpha=shieldOn*(.06+rim*.3+lines*.055)+ripple*.85+max(0.,1.-impact/.65)*(.12+rim*.35);gl_FragColor=vec4(tint+vec3(ripple*.5),alpha);}`});
 player.bubble.material=shieldMat;

 function extrudeSymbol(parent,points,material,depth=.24){const sh=new T.Shape();sh.moveTo(points[0][0],points[0][1]);points.slice(1).forEach(p=>sh.lineTo(p[0],p[1]));sh.closePath();const geo=new T.ExtrudeGeometry(sh,{depth,bevelEnabled:true,bevelSize:.045,bevelThickness:.04,bevelSegments:2,steps:1});geo.translate(0,0,-depth/2);return mesh(parent,geo,material,0,0,0);}
 function powerup(kind){
  const g=new T.Group(),red=mat('#ef3348',.25,.2),blue=mat('#178cfa',.22,.25),pink=mat('#f04abd',.25,.15),green=mat('#22bf74',.3,.1),orange=mat('#f89731',.35),ink=mat('#193952',.4);
  if(kind==='SHORT'){
   const missile=new T.Group();g.add(missile);missile.rotation.z=-.68;orb(missile,red,0,.13,0,.31,.69,.31);const nose=mesh(missile,new T.ConeGeometry(.30,.45,24),red,0,.84,0);cylinder(missile,chrome,0,-.48,0,.23,.15);
   for(const x of [-1,1]){const fin=extrudeSymbol(missile,[[x*.14,-.2],[x*.58,-.65],[x*.17,-.6]],white,.09);}
   orb(missile,gold,0,-.80,0,.16,.3,.16);round(missile,white,0,.2,.30,.17,.32,.05,.035);
  }else if(kind==='HEDGE'){
   const p=[[-.67,.57],[0,.86],[.67,.57],[.57,-.19],[0,-.86],[-.57,-.19]];
   extrudeSymbol(g,p,white,.30);const inner=extrudeSymbol(g,p,blue,.32);inner.scale.set(.82,.82,1);inner.position.z=.08;
   extrudeSymbol(g,[[-.32,.08],[-.11,-.15],[.34,.32],[.43,.17],[-.10,-.40],[-.43,-.06]],white,.06).position.z=.31;
  }else if(kind==='MOON'){
   orb(g,white,0,.08,0,.30,.65,.30);mesh(g,new T.ConeGeometry(.3,.43,24),pink,0,.77,0);orb(g,blue,0,.25,.265,.14,.14,.07);
   for(const x of [-1,1]){extrudeSymbol(g,[[x*.17,-.1],[x*.51,-.53],[x*.17,-.47]],pink,.18);}
   const flame=orb(g,gold,0,-.78,0,.22,.42,.18);orb(g,mat('#fff5c0'),0,-.64,.09,.11,.25,.09);
  }else if(kind==='DIAMOND'){
   mesh(g,new T.OctahedronGeometry(.77),mat('#62e9fb',.12,.38),0,0,0,1,1.2,.75).rotation.y=.35;
   const shine=extrudeSymbol(g,[[0,.17],[.05,.04],[.18,0],[.05,-.04],[0,-.17],[-.05,-.04],[-.18,0],[-.05,.04]],white,.025);shine.position.set(.34,.45,.54);
  }else if(kind==='RUG'){
   orb(g,ink,0,-.55,0,.74,.12,.50);const cone=mesh(g,new T.ConeGeometry(.44,1.25,24),orange,0,.03,0);cylinder(g,white,0,.00,0,.255,.17);round(g,orange,0,-.53,0,1.12,.14,.9,.09);
   orb(g,ink,.60,-.59,.21,.3,.06,.23);orb(g,ink,-.53,-.59,-.28,.3,.07,.24);
  }else if(kind==='BAILOUT'){
   const ring=new T.Mesh(new T.TorusGeometry(.50,.22,12,32),green);g.add(ring);
   for(const a of [0,Math.PI/2,Math.PI,Math.PI*1.5]){const band=box(g,white,Math.cos(a)*.5,Math.sin(a)*.5,.14,.27,.27,.18);band.rotation.z=a;}
   round(g,white,0,0,.2,.16,.64,.12,.045);round(g,white,0,0,.2,.64,.16,.12,.045);
  }else{
   extrudeSymbol(g,[[.03,.92],[-.58,-.08],[-.10,-.08],[-.29,-.91],[.64,.27],[.14,.27],[.39,.92]],gold,.28);
   const ring=new T.Mesh(new T.TorusGeometry(.69,.04,6,32),blue);ring.rotation.x=.55;ring.position.z=-.24;g.add(ring);
  }
  g.userData.kind=kind;return g;
 }
 function pickupModel(e){const g=new T.Group(),art=powerup(e.kind);art.position.y=1.35;art.scale.setScalar(1.12);g.add(art);g.userData.art=art;
  const color=WPN[e.kind].col;const ring=new T.Mesh(new T.TorusGeometry(.55,.035,6,32),new T.MeshBasicMaterial({color}));ring.rotation.x=Math.PI/2;ring.position.y=.10;g.add(ring);
  g.userData.isPickup=true;return g;}
 function bakeItemIcons(){
  const icons={},iconScene=new T.Scene(),ic=new T.OrthographicCamera(-1.25,1.25,1.25,-1.25,.1,20);ic.position.set(0,.2,6);ic.lookAt(0,0,0);iconScene.add(new T.HemisphereLight('#ffffff','#b1b9d4',2.8));const light=new T.DirectionalLight('#fff2db',3);light.position.set(-3,4,5);iconScene.add(light);
  const target=new T.WebGLRenderTarget(128,128,{format:T.RGBAFormat}),pixels=new Uint8Array(128*128*4),oldColor=renderer.getClearColor(new T.Color()),oldAlpha=renderer.getClearAlpha(),oldTarget=renderer.getRenderTarget();
  renderer.setClearColor(0,0);renderer.setRenderTarget(target);
  for(const kind of ORDER){const model=powerup(kind);model.rotation.y=-.17;iconScene.add(model);renderer.render(iconScene,ic);renderer.readRenderTargetPixels(target,0,0,128,128,pixels);const cv=document.createElement('canvas');cv.width=cv.height=128;const cx=cv.getContext('2d'),id=cx.createImageData(128,128);for(let y=0;y<128;y++)id.data.set(pixels.subarray((127-y)*512,(128-y)*512),y*512);cx.putImageData(id,0,0);icons[kind]=cv;iconScene.remove(model);disposeEntity(model);}
  renderer.setRenderTarget(oldTarget);renderer.setClearColor(oldColor,oldAlpha);target.dispose();return icons;
 }

 const courseSigns=[];
 for(const [distance,label]of [[160,'BANKED CORNER >>>'],[390,'RAMP AHEAD >>>'],[425,'LAUNCH >>>']])for(const side of [-1,1]){const g=new T.Group();cylinder(g,chrome,0,.9,0,.06,1.8);sign(g,label,0,1.7,0,2.6,.6,'#ffcc4b','#263f53');scene.add(g);courseSigns.push({g,s:distance,x:side*2.2});}
 const cueTextures=new Map();for(const [key,text]of [...RIVALS.map((r,i)=>['r'+i,r.short]),...ORDER.map(k=>[k,ITEM_META[k].action])])cueTextures.set(key,textTexture(text,'#ffffff','#173b50',256,64));
 const cueGeometry=new T.PlaneGeometry(1,.25),cues=Array.from({length:3},()=>{const m=new T.Mesh(cueGeometry,new T.MeshBasicMaterial({transparent:true,depthWrite:false}));m.userData.worldCue=true;m.visible=false;m.renderOrder=5;scene.add(m);return m;});let visibleCues=0;
 const entityModels=new Map();
 function obstacle(e){const g=new T.Group(),span=(e.span||1)*2.8,type=e.type;const color=WPN[e.kind]?.col||'#ffb950';
  if(e.cat==='coin'){
   const coin=cylinder(g,gold,0,.75,0,.34,.09);coin.rotation.x=Math.PI/2;const face=sign(g,'$',0,.75,.055,.43,.43,'#edb02a','#fff4ac');g.userData.spin=true;
  }else if(e.cat==='item'){
   const model=pickupModel(e);scene.add(model);return model;
  }else if(type==='DEPEG'||type==='FROZEN'){
   const ice=type==='FROZEN';box(g,mat(ice?'#9aeeff':'#291f51',ice?.15:.9),0,.035,0,span,.07,ice?5.1:2.55);
   if(ice){for(let i=0;i<4;i++){const shard=mesh(g,new T.OctahedronGeometry(1),mat('#d9faff',.18),-span/2+.3+i*(span-.6)/3,.27,hash(i)*3-1.5,.12,.4,.14);}}
   else{for(const x of [-span/2,span/2])box(g,gold,x,.07,0,.1,.07,2.55);}
   sign(g,ice?'ICE / FROZEN':'DEPEG / JUMP',0,.6,-1.2,Math.min(span,3),.45,ice?'#4289b8':'#503582');
  }else if(type==='NFP'||type==='CEILING'){
   for(const x of [-span/2,span/2])cylinder(g,chrome,x,1.45,0,.10,2.9);
   round(g,mat(type==='NFP'?'#599ada':'#b88fe4'),0,2.25,0,span,.6,.44,.12);sign(g,type==='NFP'?'JOBS / SLIDE':'DEBT CEILING / SLIDE',0,2.26,.24,span*.9,.4);
  }else if(type==='CPI'||type==='WHALE'){
   round(g,mat(type==='CPI'?'#f6a13e':'#608fcd',.4),0,.44,0,span,.88,1.1,.16);
   for(let x=-span/2+.15;x<span/2;x+=.45){const stripe=box(g,white,x,.47,.57,.13,.75,.025);stripe.rotation.z=-.4;}
   sign(g,type==='CPI'?'CPI ↑ / JUMP':'WHALE / JUMP',0,.46,.60,span*.8,.33,'#e58832');
  }else if(type==='TRUMP'){
   // Satirical toy caricature on a wheeled market podium; simulation still owns lane hopping.
   const navy=mat('#233d72',.42),skin=mat('#efaf79',.65),hair=mat('#f2c451',.48),redTie=mat('#df3348',.35);
   for(const x of [-.72,.72])for(const z of [-.35,.35]){const w=cylinder(g,rubber,x,.18,z,.18,.16);w.rotation.z=Math.PI/2;}
   round(g,navy,0,.88,0,1.65,1.45,.95,.12);round(g,gold,0,1.66,.02,1.95,.12,1.1,.045);
   const seal=cylinder(g,gold,0,.95,.50,.35,.06);seal.rotation.x=Math.PI/2;sign(g,'$',0,.95,.55,.37,.39,'#eab537','#fff5d3');sign(g,'TRUMP',0,.36,.51,1.18,.23,'#233d72');
   round(g,navy,0,1.95,-.14,1.05,.85,.66,.16);
   extrudeSymbol(g,[[-.26,2.27],[.26,2.27],[0,1.64]],white,.04).position.z=.23;
   extrudeSymbol(g,[[-.075,2.21],[.075,2.21],[.11,1.69],[0,1.54],[-.11,1.69]],redTie,.045).position.z=.28;
   cylinder(g,skin,0,2.43,-.10,.17,.27);
   const head=new T.Group();head.position.set(0,2.85,-.07);g.add(head);orb(head,skin,0,0,0,.47,.53,.40);orb(head,skin,0,-.04,.41,.14,.105,.15);
   for(const x of [-.48,.48])orb(head,skin,x,-.04,0,.11,.17,.12);
   for(const x of [-.18,.18]){orb(head,white,x,.08,.36,.115,.065,.033);orb(head,mat('#41677f'),x,.08,.396,.043,.046,.021);const brow=round(head,hair,x,.19,.38,.25,.055,.07,.02);brow.rotation.z=x<0?-.15:.15;}
   round(head,mat('#ac634c'),0,-.24,.365,.21,.045,.045,.02);
   orb(head,hair,0,.43,-.02,.48,.22,.38);const sweep=orb(head,hair,-.12,.45,.20,.49,.17,.24);sweep.rotation.z=.20;const forelock=orb(head,hair,.27,.35,.27,.24,.10,.13);forelock.rotation.z=-.35;
   for(let i=0;i<4;i++){const strand=orb(head,mat('#ffe29a'),-.30+i*.13,.52-i*.018,.20,.17,.025,.10);strand.rotation.z=.2;}
   const arms=[];for(const side of [-1,1]){const arm=new T.Group();arm.position.set(side*.49,2.20,-.03);g.add(arm);const sleeve=orb(arm,navy,side*.19,-.04,.02,.30,.14,.17);orb(arm,white,side*.40,-.04,.03,.10,.13,.13);orb(arm,skin,side*.52,.01,.05,.17,.14,.12);for(let j=0;j<3;j++)orb(arm,skin,side*(.51+j*.035),.12,.06,.036,.085,.035);arms.push(arm);}
   for(const x of [-.24,.24]){const stem=cylinder(g,chrome,x,1.98,.38,.024,.61);stem.rotation.z=x<0?-.12:.12;orb(g,dark,x*1.1,2.28,.38,.065,.065,.12);}
   const quote=sign(g,e.quote||'TARIFFS!',0,3.80,0,3.15,.62,'#fff9e3','#233b5b');
   const tail=extrudeSymbol(g,[[-.12,3.51],[.12,3.51],[.02,3.32]],white,.025);tail.position.z=.01;
   const papers=[];for(let i=0;i<5;i++){const paper=box(g,white,0,0,0,.20,.015,.28);paper.castShadow=false;papers.push(paper);}
   g.userData.trump={head,arms,quote,papers,lastQuote:e.quote};

  }else if(type==='GAVEL'){
   const swing=new T.Group();g.add(swing);cylinder(swing,mat('#875d3e'),0,.7,0,.09,1.4);const head=cylinder(swing,gold,0,1.3,0,.4,1.3);head.rotation.z=Math.PI/2;g.userData.swing=swing;sign(g,'SEC / TIME IT',0,3,0,2.5,.5);
  }else if(type==='WAR'){
   const target=new T.Mesh(new T.RingGeometry(.35,span*.45,28),new T.MeshBasicMaterial({color:'#ff623f',side:T.DoubleSide,transparent:true,opacity:.7}));target.rotation.x=-Math.PI/2;target.position.y=.04;g.add(target);const blast=orb(g,mat('#ff7c37',.3),0,.7,0,span*.42,1.3,span*.4);g.userData.blast=blast;sign(g,'DANGER / LEAVE LANE',0,2.3,0,Math.max(span,3),.5,'#b6442d');
  }else if(type==='SWAN'){
   const body=orb(g,mat('#2d2946',.4),0,1.3,0,span*.27,.9,.7);for(const side of [-1,1]){const wing=orb(g,mat('#433960'),side*span*.26,1.5,0,span*.25,.22,.75);wing.rotation.z=side*.25;}
   const neck=mesh(g,new T.TorusGeometry(.7,.19,12,20,Math.PI*1.4),mat('#2d2946'),.2,2.2,0);orb(g,dark,.7,2.7,0,.32);orb(g,mat('#ffd156'),.99,2.62,.08,.28,.09,.12);sign(g,'BLACK SWAN / DEFEND',0,3.65,0,6,.6,'#453855');
  }else if(type==='BANKRUN'){
   for(let i=0;i<3;i++){orb(g,mat(['#74b49b','#db986b','#8a90be'][i]),(i-1)*.65,.7,0,.29,.5,.3);orb(g,mat('#ebbc93'),(i-1)*.65,1.4,0,.26);}
   sign(g,'BANK RUN',0,2,0,2.5,.5,'#ad655d');
  }else{
   const c=type==='FOMC'?'#b596df':type==='HACK'?'#56a5ad':'#ef8b70';
   round(g,mat(c,.4),0,2.1,0,span,4.2,1.1,.18);round(g,white,0,4.33,0,span+.15,.2,1.2,.06);sign(g,type==='FOMC'?'RATE HIKE':type==='HACK'?'EXCHANGE HACK':'TARIFFS!',0,2.6,.59,span*.88,.55,'#344d70');
   for(const x of [-span*.30,span*.30])cylinder(g,white,x,.60,.59,.10,.8);
  }
  scene.add(g);return g;
 }
 function disposeEntity(g){const sharedGeo=new Set([sphere,boxgeo,cylgeo,conegeom,...geos.values()]),sharedMat=new Set(materials.values());g.traverse(o=>{if(!o.isMesh)return;if(!sharedGeo.has(o.geometry))o.geometry.dispose();for(const m of (Array.isArray(o.material)?o.material:[o.material]))if(!sharedMat.has(m)){if(m.map)m.map.dispose();m.dispose();}});scene.remove(g);}
 const shotModels=[];for(let i=0;i<28;i++){const g=powerup('SHORT');g.scale.setScalar(.45);scene.add(g);g.visible=false;shotModels.push(g);}
 const oilMat=new T.MeshPhysicalMaterial({color:'#111323',roughness:.12,metalness:.5,clearcoat:1,clearcoatRoughness:.06});
 const rugModels=[];for(let i=0;i<16;i++){const g=new T.Group();orb(g,oilMat,0,.025,0,.92,.035,1.55);orb(g,oilMat,.65,.02,.45,.46,.03,.70);orb(g,oilMat,-.58,.02,-.5,.5,.03,.65);g.visible=false;scene.add(g);rugModels.push(g);}
 const arrowShape=new T.Shape();arrowShape.moveTo(-.55,-.4);arrowShape.lineTo(0,.45);arrowShape.lineTo(.55,-.4);arrowShape.lineTo(.24,-.4);arrowShape.lineTo(0,-.04);arrowShape.lineTo(-.24,-.4);arrowShape.closePath();
 const arrowGeo=new T.ShapeGeometry(arrowShape);arrowGeo.rotateX(-Math.PI/2);
 const arrowMat=new T.MeshBasicMaterial({color:'#ffeb84',transparent:true,opacity:.85,side:T.DoubleSide,depthWrite:false});
 const rampArrows=[];for(let i=0;i<12;i++){const g=new T.Mesh(arrowGeo,arrowMat);g.castShadow=false;scene.add(g);rampArrows.push(g);}
 const exhaust=batch(sphere,new T.MeshBasicMaterial({color:'#ffc76b',transparent:true,opacity:.8,depthWrite:false}),140,false);exhaust.count=0;
 const gates=[];for(let i=0;i<4;i++){const g=new T.Group();for(const x of [-5,5]){round(g,mat(['#6bbbc7','#9b87d7','#e9957c','#6bbbc7'][i]),x,2.8,0,.5,5.6,.6,.13);orb(g,gold,x,5.6,0,.33);}round(g,mat('#f9e9bc'),0,5.05,0,10.6,1,.7,.2);sign(g,['OPENING BELL CUP','CRYPTO SPEEDWAY','MELTDOWN CASTLE','CLOSING BELL'][i],0,5.15,.38,9,.54,'#fff0cf','#234b64');for(let j=0;j<20;j++)box(g,j%2?white:dark,-4.75+j*.5,4.67,.37,.5,.2,.025);scene.add(g);gates.push(g);}

 const burstMat=new T.MeshBasicMaterial({color:'#fff1a1'}),burstMesh=batch(sphere,burstMat,24,false);
 const pulse=new T.Mesh(new T.TorusGeometry(1,.045,6,64),new T.MeshBasicMaterial({color:'#ffd955',transparent:true,opacity:0,depthWrite:false}));pulse.rotation.x=-Math.PI/2;scene.add(pulse);
 const confetti=batch(boxgeo,new T.MeshBasicMaterial({color:'#ffffff',side:T.DoubleSide}),64,false);for(let i=0;i<64;i++)confetti.setColorAt(i,new T.Color(['#ffd56c','#ed746d','#6ecbe9','#ba8ae4'][i%4]));
 const sparkMesh=batch(sphere,new T.MeshBasicMaterial({color:'#8eeaff'}),16,false);
 let fxStart=-99,fxKind='',fxType='';
 function emit(type,kind){fxStart=ambientTime;fxKind=kind;fxType=type;burstMat.color.set(WPN[kind].col);}
 let effectInfo={},previousSector=-1, cameraState=null, cameraMode=null, cameraDistance=0;
 const centerline=new Map();
 function updateCenterline(){centerline.clear();centerline.set(0,0);for(const direction of [-1,1]){let slope=0,x=0;for(let d=direction;Math.abs(d)<=220;d+=direction){slope+=curvAt(P.s+d-direction*.5)*direction;x+=slope*direction;centerline.set(d,x);}}}
 function roadOffset(d){const lo=Math.floor(Math.max(-220,Math.min(219,d)));return centerline.get(lo)+(centerline.get(lo+1)-centerline.get(lo))*(d-lo);}
 const coord=(lane,d,y=0)=>new T.Vector3((lane+roadOffset(d))*2.8,Course.worldHeight(P.s+d,lane,0,P.s)+y,-d*1.6);
 function place(g,lane,d,y=0){const surface=Course.sampleCourse(P.s+d,lane);g.position.copy(coord(lane,d,y));g.rotation.set(surface.pitch,-Math.atan2((roadOffset(d+.5)-roadOffset(d-.5))*2.8,1.6),surface.bank);}
 function update(frameDt=1/60){
  updateCenterline();
  ground.position.y=-.16-2*Course.sampleCourse(P.s,0).height;
  const sec=sectorOf(P.s),showroom=S.mode==='title';
  if(!reducedMotion.matches&&S.mode!=='paused')ambientTime+=Math.min(.1,Math.max(0,frameDt));
  if(P.s<cameraDistance-.01){ambientTime=0;fxStart=-99;}
  const time=ambientTime;
  if(sec!==previousSector){previousSector=sec;const sky=['#8ed8ed','#9d9bdc','#dca69e'][sec],fog=['#b1e2df','#bab1e3','#e1b4a4'][sec];scene.background.set(sky);scene.fog.color.set(fog);groundMat.color.set(['#95c95c','#9693c6','#b37b70'][sec]);asphalt.color.set(['#8b969d','#8b84a4','#877d8e'][sec]);redMat.color.set(['#f36b56','#85d8d4','#f6bf66'][sec]);}
  lavaRibbons.forEach(r=>r.m.visible=sec===2);lavaMat.uniforms.flowTime.value=time;
  for(const r of ribbons){if(!r.m.visible)continue;for(let i=0;i<=roadSegments;i++){const d=roadStart+(roadEnd-roadStart)*i/roadSegments,x=roadOffset(d)*2.8,j=i*6;r.a[j]=x+r.l;r.a[j+1]=Course.worldHeight(P.s+d,r.l/2.8,0,P.s)+r.height;r.a[j+2]=-d*1.6;r.a[j+3]=x+r.r;r.a[j+4]=Course.worldHeight(P.s+d,r.r/2.8,0,P.s)+r.height;r.a[j+5]=-d*1.6;}r.m.geometry.attributes.position.needsUpdate=true;if(!r.m.material.isShaderMaterial)r.m.geometry.computeVertexNormals();}
  const base=Math.floor(P.s/2)*2-P.s;
  let ci=0,ri=0;for(let i=-7;i<73;i++){const d=base+i*2,c=roadOffset(d)*2.8,ry=-Math.atan2((roadOffset(d+1)-roadOffset(d-1))*2.8,3.2);for(const side of [-1,1]){const target=(Math.floor(P.s/2)+i)%2?curbs:redcurbs,idx=target===curbs?ci++:ri++;inst(target,idx,c+side*4.49,Course.worldHeight(P.s+d,side*4.49/2.8,0,P.s)+.035,-d*1.6,.48,.09,3.23,ry,Course.sampleCourse(P.s+d,0).bank,Course.sampleCourse(P.s+d,0).pitch);}}
  curbs.count=ci;redcurbs.count=ri;curbs.instanceMatrix.needsUpdate=redcurbs.instanceMatrix.needsUpdate=true;
  let di=0;const b4=Math.floor(P.s/6)*6-P.s;for(let i=-2;i<32;i++){const d=b4+i*6,ry=-Math.atan2((roadOffset(d+.5)-roadOffset(d-.5))*2.8,1.6);for(const l of [-.5,.5])inst(dashes,di++,(l+roadOffset(d))*2.8,Course.worldHeight(P.s+d,l,0,P.s)+.012,-d*1.6,.055,.02,2.1,ry,Course.sampleCourse(P.s+d,0).bank,Course.sampleCourse(P.s+d,l).pitch);}dashes.count=di;dashes.instanceMatrix.needsUpdate=true;
  const bs=Math.floor(P.s/8)*8-P.s;let fi=0;for(let i=-2;i<23;i++){const d=bs+i*8,c=roadOffset(d)*2.8;for(const side of [-1,1]){inst(fence,fi,c+side*5.4,.55,-d*1.6,.10,.11,8);inst(fenceposts,fi,c+side*5.4,.46,-d*1.6,.10,.92,.10);fi++;}}fence.count=fenceposts.count=fi;fence.instanceMatrix.needsUpdate=fenceposts.instanceMatrix.needsUpdate=true;
  const bt=Math.floor(P.s/12)*12-P.s;let nearCount=0,farCount=0;
  for(let i=0;i<48;i++){const d=bt+Math.floor(i/2)*12-12,side=i%2?1:-1,x=roadOffset(d)*2.8+side*(8+hash(i+27)*9),z=-d*1.6,size=.8+hash(i)*.7;
   sceneryNear[i]=sceneryNear[i]?d<75:d<60;
   if(!sceneryNear[i]){const target=[farTrees,farCrystals,farTowers][sec];inst(target,farCount++,x,2.3*size,z,sec===0?1.8*size:size,4.6*size,sec===0?1.5*size:size);continue;}
   const n=nearCount++;
   if(sec===0){inst(trunks,n,x,1.05*size,z,.20*size,2.1*size,.20*size);inst(leaves,n*2,x-.6*size,2.75*size,z,1.22*size,1.48*size,1.10*size);inst(leaves,n*2+1,x+.55*size,2.9*size,z-.3,1.05*size,1.55*size,1.05*size);inst(leafTops,n,x,3.65*size,z,1.02*size,1.20*size,1.05*size);for(let k=0;k<2;k++)inst(flowers,n*2+k,x-side*1.4+k*.3,.22,z+.4,.14,.18,.14);}
   else if(sec===1)inst(crystals,n,x,1.8*size,z,.85*size,2.8*size,.85*size,i*.8);
   else{inst(towers,n,x,1.65*size,z,.95*size,3.3*size,.95*size);inst(roofs,n,x,3.85*size,z,1.2*size,1.4*size,1.2*size);inst(towerWindows,n,x,2.1*size,z+size,.27,.6,.04);}
  }
  lodNear=nearCount;lodFar=farCount;
  for(const m of [trunks,leaves,leafTops,flowers]){m.visible=sec===0;m.count=nearCount*(m===leaves||m===flowers?2:1);}
  crystals.visible=sec===1;crystals.count=nearCount;for(const m of [towers,roofs,towerWindows]){m.visible=sec===2;m.count=nearCount;}
  [farTrees,farCrystals,farTowers].forEach((m,i)=>{m.visible=sec===i;m.count=farCount;});
  hills.forEach((m,i)=>{const d=35+i*7,x=(i%2?1:-1)*(32+hash(i+1)*40)+roadOffset(Math.min(d,80))*1.8;m.position.set(x,-4,-d*1.6);m.scale.set(12+hash(i)*15,10+hash(i+7)*25,16+hash(i+99)*14);m.material.color.set(sec===0?(i%2?'#77bd78':'#8eca8b'):sec===1?'#9a8bc3':'#9c7783');});
  clouds.forEach((g,i)=>{g.position.set((i-4)*22+Math.sin(time*.02+i)*4,24+hash(i)*10,-60-hash(i+9)*130);g.scale.setScalar(1+hash(i+5));});
  buildings.forEach((g,i)=>{const d=((i*31-P.s)%250+250)%250-20;place(g,(i%2?1:-1)*7,d);g.rotation.y+=(i%2?-1:1)*.28;g.visible=sec===0;});
  let crowdIndex=0;stands.forEach((g,i)=>{const d=((i*43-P.s)%258+258)%258-18;place(g,(i%2?1:-1)*4.3,d);g.rotation.y=(i%2?-1:1)*.25;g.visible=d<125;g.updateMatrixWorld(true);
   for(let j=0;j<12;j++){const row=Math.floor(j/4),x=(j%4-1.5)*1.05,y=.8+row*.32+Math.sin(time*3+j+i)*.06;dummy.position.set(x,y,-row*.7);g.localToWorld(dummy.position);inst(crowd,crowdIndex++,dummy.position.x,dummy.position.y,dummy.position.z,.19,.32,.19);}
  });crowd.instanceMatrix.needsUpdate=true;
  flags.forEach((g,i)=>{const d=((Math.floor(i/2)*17-P.s)%136+136)%136-10;place(g,(i%2?1:-1)*2.2,d);g.userData.flag.rotation.y=Math.sin(time*3+i)*.2;g.userData.flag.rotation.z=Math.sin(time*4+i)*.05;});
  function drive(k,a,isPlayer){const d=isPlayer?0:a.s-P.s;k.g.visible=isPlayer||(d>-12&&d<110);if(!k.g.visible)return;place(k.g,a.x,d,0);k.body.position.y=(a.y||0)*2+(a.y?0:Math.sin(a.run*1.4)*.025);k.body.scale.y=isPlayer?1-P.land*1.0:1;k.body.rotation.z=isPlayer?-P.steer*(P.drifting?.17:.10):Math.sin(a.run*.3)*.025;k.body.rotation.y=(isPlayer?-(P.heading||0):0)+(isPlayer?P.spin>0?P.spinPh:0:a.stun>0?a.spinPh:0);k.driver.scale.y=(isPlayer?P.slide:a.duck)>0?.58:1;
    if(isPlayer&&(S.mode==='dying'||S.dnf))k.body.rotation.z=Math.min(1.35,S.deadT*2);
    k.wheels.forEach(w=>{w.spin.rotation.x=-a.run*1.7;w.pivot.rotation.y=w.front?(isPlayer?-P.steer*.3:0):0;});k.bubble.visible=isPlayer&&S.shield>0;k.shadow.material.opacity=1-Math.min(.7,(a.y||0)*.3);k.flames.forEach(f=>{f.visible=isPlayer&&P.boost>0;f.scale.z=reducedMotion.matches?.58:.55+Math.sin(time*32)*.2;});
  }
  drive(player,P,true);S.rivals.forEach((a,i)=>drive(racers[i],a,false));
  const live=new Set();for(const e of S.ents){const d=e.s-P.s;if(e.dead||d< -9||d>125)continue;live.add(e.id);let g=entityModels.get(e.id);if(!g){g=obstacle(e);entityModels.set(e.id,g);}place(g,e.x,d);if(g.userData.spin){g.rotation.y=e.t*1.5;g.position.y+=Math.sin(e.t*3)*.13;}if(g.userData.art){g.userData.art.rotation.y=Math.sin(e.t*1.8)*.32;g.userData.art.rotation.z=Math.sin(e.t*2)*.06;g.userData.art.position.y=1.4+Math.sin(e.t*3)*.14;}if(g.userData.trump){const tr=g.userData.trump,moving=Math.abs(e.tx-e.x)>.03;g.position.y+=moving?Math.abs(Math.sin(e.t*10))*.14:0;tr.head.rotation.y=Math.sin(e.t*2)*.20;tr.arms[0].rotation.z=-.20-Math.sin(e.t*3)*.23;tr.arms[1].rotation.z=.55+Math.sin(e.t*4)*.32;
    tr.papers.forEach((p,i)=>{const age=(e.t*.7+i*.2)%1;p.position.set((i%2?1:-1)*(.6+age*.7),2.2-age*1.8,.3+age*.9);p.rotation.set(age*5,i,age*7);});
    if(tr.lastQuote!==e.quote){tr.quote.material.map.dispose();tr.quote.material.map=textTexture(e.quote,'#233b5b','#fff9e3',1024,202);tr.quote.material.needsUpdate=true;tr.lastQuote=e.quote;}
   }
   if(g.userData.swing)g.userData.swing.position.y=isActive(e)?-.3:1.6;if(g.userData.blast){g.userData.blast.visible=e.armed;g.userData.blast.scale.y=e.armed?1+Math.sin(e.t*16)*.2:.01;}g.visible=!e.hit||Math.floor(e.t*12)%2===0;}
  for(const [id,g]of entityModels)if(!live.has(id)){disposeEntity(g);entityModels.delete(id);}
  const shots=[...S.shots,...S.aiShots];shotModels.forEach((g,i)=>{const a=shots[i],d=a?a.s-P.s:0;g.visible=!!a&&d>-12&&d<110;if(g.visible){place(g,a.x,d,1.1);g.rotation.set(-Math.PI/2,0,.68);}});rugModels.forEach((g,i)=>{const a=S.rugs[i];g.visible=!!a&&a.s-P.s>-12&&a.s-P.s<110;if(g.visible)place(g,a.x,a.s-P.s,.045);});
  let trailCount=0;
  if(!reducedMotion.matches)shotModels.forEach((g,i)=>{if(!g.visible)return;const a=shots[i];for(let j=0;j<5;j++){const age=(j+(time*9)%1)/5,d=a.s-P.s-.6-age*3.4,p=coord(a.x,d,1.1);inst(exhaust,trailCount++,p.x,p.y,p.z,.12*(1-age)+.025,.12*(1-age)+.025,.28*(1-age)+.035);}});
  exhaust.count=trailCount;exhaust.visible=trailCount>0;exhaust.instanceMatrix.needsUpdate=true;
  let arrowCount=0;rampArrows.forEach((g,i)=>{const s=410+i*2.4+(time*3)%2.4,d=s-P.s;g.visible=d>-8&&d<100;if(g.visible){place(g,0,d,.055);arrowCount++;}});
  courseSigns.forEach(({g,s,x})=>{const d=s-P.s;g.visible=d>-12&&d<125;if(g.visible)place(g,x,d);});
  gates.forEach((g,i)=>{const d=[4,1400,2800,4200][i]-P.s;g.visible=d>-16&&d<125;if(g.visible)place(g,0,d);});
  if(showroom){camera.position.set(7+Math.sin(time*.15)*.6,4.0,8.4);camera.lookAt(-2.6,1.3,-1);camera.fov=46;cameraState=null;}
  else{
   const ahead=coord(P.x*.35,16+Math.min(5,P.v*.1)),at=coord(P.x,0);
   const target=ChaseCamera.cameraTarget({x:at.x,y:at.y,jump:P.y*2,speed:P.v,vx:P.vx,steer:P.steer,boost:P.boost>0},Course.sampleCourse(P.s,P.x),ahead,{width:W,height:H},{reducedMotion:reducedMotion.matches});
   if(cameraMode!==S.mode||P.s<cameraDistance-.01)cameraState=null;
   cameraState=ChaseCamera.stepCamera(cameraState,target,frameDt);
   if(reducedMotion.matches){cameraState.roll=0;cameraState.fov=target.fov;}
   camera.position.set(cameraState.position.x,cameraState.position.y,cameraState.position.z);camera.lookAt(cameraState.lookAt.x,cameraState.lookAt.y,cameraState.lookAt.z);camera.fov=cameraState.fov;camera.rotateZ(cameraState.roll);
  }
  cameraMode=S.mode;cameraDistance=P.s;
  camera.aspect=W/H;camera.updateProjectionMatrix();if(S.shake>0&&!reducedMotion.matches){camera.position.x+=Math.sin(time*70)*S.shake*.008;camera.position.y+=Math.cos(time*90)*S.shake*.005;}
  const age=time-fxStart,fxOn=age>=0&&age<.65&&S.mode==='play'&&!reducedMotion.matches;
  burstMesh.visible=fxOn;
  if(fxOn){for(let i=0;i<24;i++){const a=i*2.399,r=.5+age*(fxType==='pickup'?3:4);inst(burstMesh,i,coord(P.x,0).x+Math.cos(a)*r,coord(P.x,0).y+1.1+Math.sin(a*2)*age+age*1.4,-Math.sin(a)*r,.07*(1-age),.07*(1-age),.07*(1-age));}burstMesh.instanceMatrix.needsUpdate=true;}
  pulse.visible=fxOn&&fxKind==='BREAKER';if(pulse.visible){place(pulse,P.x,0,.15);pulse.rotation.x-=Math.PI/2;pulse.scale.setScalar(1+age*24);pulse.material.opacity=(1-age/.65)*.8;}
  const drift=S.mode==='play'&&P.v>18&&(P.drifting||Math.abs(P.steer)>.55)&&P.y<.05&&!reducedMotion.matches;
  sparkMesh.visible=drift;if(drift){sparkMesh.material.color.set(P.drifting?['#a7d9ff','#55c7ff','#ffb448','#ef7ce3'][P.driftTier]:'#fff4b7');for(let i=0;i<16;i++){const age=(time*3+i/16)%1,side=i%2?1:-1;const p=coord(P.x+side*(.8+age*.35)/2.8,-(1+age*3)/1.6,.15+Math.sin(age*Math.PI)*.35);inst(sparkMesh,i,p.x,p.y,p.z,.025,.035,.12*(1-age));}sparkMesh.instanceMatrix.needsUpdate=true;}
  player.bubble.visible=(S.shield>0||P.diamond>0||S.shieldImpact<.65);player.bubble.position.y=1+P.y*2;shieldMat.uniforms.flowTime.value=time;shieldMat.uniforms.impact.value=S.shieldImpact;shieldMat.uniforms.shieldOn.value=S.shield>0||P.diamond>0?1:0;shieldMat.uniforms.tint.value.set(P.diamond>0?'#ffd98b':'#77dfff');
  confetti.visible=S.mode==='finish'&&!reducedMotion.matches;if(confetti.visible){for(let i=0;i<64;i++){const age=(S.finT*.45+hash(i))%1;inst(confetti,i,P.x*2.8+(hash(i+99)-.5)*16,8-age*9,-hash(i+31)*18,.075,.19,.01,time+i,time*.7+i);}confetti.instanceMatrix.needsUpdate=true;}
  visibleCues=0;cues.forEach(m=>m.visible=false);
  const candidates=[...S.rivals.map((a,i)=>({s:a.s,x:a.x,y:3+(a.y||0)*2,key:'r'+i})),...S.ents.filter(e=>e.cat==='item'&&!e.dead).map(e=>({s:e.s,x:e.x,y:2.8,key:e.kind}))].filter(a=>a.s-P.s>2&&a.s-P.s<38).sort((a,b)=>a.s-b.s);
  for(const a of candidates){if(visibleCues===cues.length)break;const point=coord(a.x,a.s-P.s,a.y),projected=point.clone().project(camera);if(Math.abs(projected.x)>.83||projected.y<-.65||projected.y>.68)continue;const m=cues[visibleCues++];m.visible=true;m.position.copy(point);m.quaternion.copy(camera.quaternion);const size=Math.max(2,Math.min(4.2,point.distanceTo(camera.position)*.105));m.scale.setScalar(size);m.material.map=cueTextures.get(a.key);}
  for(const m of dynamicBatches){if(!m.visible||!m.count)continue;m.instanceMatrix.needsUpdate=true;m.computeBoundingSphere();m.frustumCulled=true;}
  renderer.render(scene,camera);
  effectInfo={shieldVisible:player.bubble.visible,shieldImpact:S.shieldImpact,trailCount,trailCapacity:140,rampArrows:arrowCount,ambientTime,shadersReady:renderer.info.programs.every(p=>p.diagnostics?.runnable!==false)};
 }
 const screenVec=new T.Vector3();
 const icons=bakeItemIcons();
 G3={icons,emit,renderer,scene,camera,update,course:Course,resetCamera(){cameraState=null;},worldPoint:(s,x,y=0)=>coord(x,s-P.s,y*2),resize(){renderer.setSize(W,H,false);camera.aspect=W/H;camera.updateProjectionMatrix();requestAnimationFrame(()=>render3D(0));},project(lane,z,h){const d=z-PZ;screenVec.copy(coord(lane,d,h*2)).project(camera);return {x:(screenVec.x*.5+.5)*W,y:(-.5*screenVec.y+.5)*H,u:laneUnitPx*4/(4+Math.max(z,-2)),s:4/(4+Math.max(z,-2))};}};
 window.get3DInfo=()=>({webgl:!!renderer.getContext(),triangles:renderer.info.render.triangles,drawCalls:renderer.info.render.calls,objects:scene.children.length,geometries:renderer.info.memory.geometries,effects:effectInfo,presentation:{labelCount:visibleCues,labelCapacity:3,labelDistance:38,lodNear,lodFar,quality,pixelRatio:renderer.getPixelRatio(),shadowSize:sun.shadow.mapSize.x,culling:dynamicBatches.every(m=>!m.visible||!m.count||m.frustumCulled)},renderer:'Three.js WebGL',revision:T.REVISION,camera:{position:camera.position.toArray(),fov:camera.fov,roll:cameraState?.roll||0}});
 surface.addEventListener('webglcontextlost',e=>{e.preventDefault();if(S.mode==='play')setMode('paused');});
}
function render3D(frameDt=1/60){
 if(!G3)return;
 computeOff();G3.update(frameDt);ctx.clearRect(0,0,W,H);
 drawParticles();if(!reducedMotion.matches)drawSpeedLines();
 if(S.mode==='count'){const n=Math.ceil(S.countT);text(n>0?String(n):'GO!',W/2,H*.43,Math.min(W*.22,145),'#ffffff',DISP,'900');}
 if(S.mode==='dying')stamp('MARGIN CALL','#ff5b60','DID NOT FINISH');
 if(S.mode==='finish')stamp(ord(S.finalPlace)+' PLACE','#ffe076','CLOSING BELL');
 if(S.margin<25&&S.mode==='play'){ctx.strokeStyle='rgba(255,74,82,.6)';ctx.lineWidth=12;ctx.strokeRect(6,6,W-12,H-12);}
 if(S.swanWarn>0){ctx.strokeStyle='rgba(155,90,210,.6)';ctx.lineWidth=12;ctx.strokeRect(6,6,W-12,H-12);}
}
