function updateDifficultyLabels(){
 const label=Competition.profile(S.difficulty).label;
 for(const id of ['hDifficulty','pauseDifficulty','resultDifficulty']){const element=$(id);if(element)element.textContent=label+' · RACE';}
}
function setupDifficultyUI(){
 const select=$('difficultyMode');select.value=selectedDifficulty;
 select.addEventListener('change',()=>{selectedDifficulty=Competition.parseDifficulty(select.value);Competition.writeDifficulty(competitionStorage,selectedDifficulty);updateBest();});
 for(const element of document.querySelectorAll('select'))for(const event of ['keydown','keyup'])element.addEventListener(event,e=>e.stopPropagation());
 updateDifficultyLabels();
}
function updateAI(a,w,previousPose){
 if(a.finished){a.v+=(6-a.v)*Math.min(1,w);a.s+=a.v*w;a.run+=w*(6+a.v*.36);return;}
 const rules=S.profile,old={s:a.s,x:a.x,y:a.y,duck:a.duck},stunned=a.stun>0;
 if(stunned){a.stun=Math.max(0,a.stun-w);a.spinPh+=w*20;}
 const target=stunned?VMAX*.3:Competition.targetSpeed(VMAX,a.skill,a.x,rules);
 a.v=Competition.nextSpeed(a.v,target,rules,w);
 if(!stunned){
  a.laneT-=w;
  if(a.laneT<=0){a.laneT=rand(2,5);if(Math.random()<.5)a.tx=pick([-1,0,1]);}
  for(const e of S.ents){
   if(e.cat!=='obs'||e.dead)continue;
   const d=e.s-a.s,def=EV[e.type],half=e.span*.5;
   if(d<=0||d>Math.max(a.v,12)*rules.lookAhead+(def.depth||.6)*.5)continue;
   if(Math.abs(a.x-e.x)>=half+.2&&Math.abs(a.tx-e.x)>=half+.2)continue;
   const plans=e.plans||(e.plans={});let plan=plans[a.i];
   if(plan===undefined){plan={delay:rules.reactionDelay,avoid:Math.random()<Math.min(.99,rules.avoidance*a.skill),acted:false,hit:false};plans[a.i]=plan;}
   if(!plan||typeof plan!=='object'||plan.hit)continue;
   plan.delay=Math.max(0,plan.delay-w);
   if(plan.delay>0||!plan.avoid)continue;
   if(!plan.acted&&def.kind!=='low'&&def.kind!=='high'&&e.span<3){
    const free=[-1,0,1].filter(l=>Math.abs(l-e.x)>=half+.45);
    if(free.length){a.tx=free.reduce((best,l)=>Math.abs(l-a.x)<Math.abs(best-a.x)?l:best);plan.acted=true;}
   }
   const timeToEntry=(d-(def.depth||.6)*.5-.3)/Math.max(a.v,1);
   if(!plan.acted&&timeToEntry<=.22){
    if((def.kind==='low'||def.kind==='pit'||def.kind==='ice')&&a.y<=0&&a.vy<=0){a.vy=8;plan.acted=true;}
    if(def.kind==='high'){a.duck=Math.max(.5,(d+(def.depth||.6)*.5+.3)/Math.max(a.v,1)+.12);plan.acted=true;}
   }
  }
  a.x=Competition.nextLane(a.x,a.tx,rules,w);
 }
 a.s+=a.v*w;
 if(a.y>0||a.vy>0){a.vy-=26*w;a.y+=a.vy*w;if(a.y<=0){a.y=0;a.vy=0;}}
 if(a.duck>0)a.duck=Math.max(0,a.duck-w);
 for(const e of S.ents){
  if(e.cat!=='obs'||e.dead)continue;
  const plan=e.plans?.[a.i];if(plan==='hit'||plan?.hit)continue;
  if(Competition.hazardHit(old,a,e,EV[e.type],Collision,previousPose?previousPose(e):e)){
   const plans=e.plans||(e.plans={});plans[a.i]={hit:true};stunAI(a,EV[e.type].kind==='ice'?.8:1.1,false);
  }
 }
 a.run+=w*(6+a.v*.36);
 if(a.s>=LEN){a.finished=true;a.time=S.raceT;tickerPush(`<b>CLOSE</b>${a.name} beats the closing bell`,'news');}
 if(S.mode==='play'&&!stunned&&a.stun<=0&&!a.finished){
  a.atk-=w;
  if(a.atk<=0){
   a.atk=rand(...rules.attackCooldown);
   if(Math.random()>=rules.attackChance)return;
   const gap=P.s-a.s;
   if(gap>2&&gap<18&&Math.abs(P.x-a.x)<1.3)S.aiShots.push({s:a.s+.6,x:a.x,v:a.v+18,owner:a});
   else if(gap< -3&&gap> -30)S.rugs.push({s:a.s-1.2,x:a.x,owner:a.i,t:0,tried:[]});
  }
 }
}
