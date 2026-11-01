const {test}=require('node:test');const assert=require('node:assert/strict');
const {stepHandling}=require('../work/3d/handling.js');
const initial=()=>({x:0,vx:0,steer:0,v:30});
function run(state,steer,seconds,surface={},dt=1/120){for(let t=0;t<seconds-1e-8;t+=dt)state={...state,...stepHandling(state,{steer},surface,Math.min(dt,seconds-t))};return state;}
test('steering builds bounded momentum and neutral tires settle',()=>{const tap=run(initial(),1,.15);assert(tap.vx>0&&tap.vx<3.7);const end=run(tap,0,1);assert(Math.abs(end.vx)<.05);assert(end.x>tap.x);});
test('countersteer arrests momentum and reduced grip retains slip',()=>{const tap=run(initial(),1,.2);assert(run(tap,-1,.3).vx<0);assert(run(tap,0,.3,{grip:.2}).vx>run(tap,0,.3).vx);});
test('edge clears outward velocity and all surfaces stay bounded',()=>{for(const surface of [{},{grip:.1},{airborne:true},{offroad:true}]){const end=run(initial(),1,4,surface);assert(end.x<=2.7);assert(Math.abs(end.vx)<=3.8);}assert.equal(stepHandling({x:2.7,vx:3,steer:1,v:30},{steer:1},{},.1).vx,0);});
test('time partition preserves response',()=>{const a=run(initial(),.6,.4,{},1/30),b=run(initial(),.6,.4,{},1/144);assert(Math.abs(a.x-b.x)<.012);assert(Math.abs(a.vx-b.vx)<.015);});
