const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createStepper}=require('../work/3d/reliability.js');
function clock(){let elapsed=0,mode='play';const stepper=createStepper(dt=>elapsed+=dt,()=>mode);return {stepper,get elapsed(){return elapsed;},setMode(m){mode=m;}};}
test('frame partitions advance the same fixed simulation duration',()=>{
 const clocks=[30,60,144].map(fps=>{const c=clock();for(let t=0;t<.4-1e-10;t+=1/fps)c.stepper.advance(Math.min(1/fps,.4-t));return c.elapsed;});
 clocks.forEach(t=>assert(Math.abs(t-.4)<1e-10));
});
test('browser stalls are bounded and old backlog is dropped',()=>{
 const c=clock();c.stepper.advance(8);assert(Math.abs(c.elapsed-.25)<1e-10);c.stepper.advance(1/120);assert(Math.abs(c.elapsed-(.25+1/120))<1e-10);
});
test('manual advances retain fractions and process the full requested duration',()=>{
 const c=clock();c.stepper.advance(4.003,true);assert(Math.abs(c.elapsed-4)<1e-10);c.stepper.advance(.006,true);assert(Math.abs(c.elapsed-(4+1/120))<1e-10);
});
test('reset discards fractional simulation debt',()=>{
 const c=clock();c.stepper.advance(.007);c.stepper.reset();c.stepper.advance(.002);assert.equal(c.elapsed,0);
});
test('browser mode boundaries discard old-mode catch-up',()=>{
 let mode='count',n=0;const c=createStepper(()=>{n++;mode='play';},()=>mode);c.advance(.2);assert.equal(n,1);c.advance(1/120);assert.equal(n,2);
});
test('manual countdown completion preserves the rest of the explicit advance',()=>{
 let mode='count',n=0;const c=createStepper(()=>{n++;mode='play';},()=>mode);c.advance(.2,true);assert.equal(n,24);
});
test('manual pause transitions cancel remaining old-mode time',()=>{
 let mode='play',n=0;const c=createStepper(()=>{n++;mode='paused';},()=>mode);c.advance(.2,true);assert.equal(n,1);
});
