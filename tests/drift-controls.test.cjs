const test=require('node:test');
const assert=require('node:assert/strict');
const vm=require('node:vm');
const fs=require('node:fs');
function controls(){
 const surface=()=>{const handlers={};return{handlers,hidden:false,setAttribute(){},setPointerCapture(){},releasePointerCapture(){},addEventListener(type,f){(handlers[type]??=[]).push(f);},fire(type,extra={}){for(const f of handlers[type]||[])f({type,preventDefault(){},stopPropagation(){},...extra});}};};
 const button=surface(),window=surface(),P={},S={mode:'play'},context=vm.createContext({window,P,S,$:id=>id==='bDrift'?button:surface(),audio(){}});
 vm.runInContext(fs.readFileSync('work/3d/driving.js','utf8'),context);vm.runInContext('initDrivingControls()',context);
 return{button,window,P,S,cancel(){vm.runInContext('cancelDrift()',context);}};
}
test('canceled drift finger cannot release or cancel a new keyboard drift',()=>{
 const c=controls();c.button.fire('pointerdown',{pointerId:1});c.S.mode='paused';c.cancel();c.S.mode='play';c.window.fire('keydown',{key:'Shift'});
 for(const type of ['pointerup','pointercancel','lostpointercapture']){c.button.fire(type,{pointerId:1});assert.equal(c.P.driftHeld,true,type);assert.equal(c.P.driftReleased,false,type);}
 c.window.fire('keyup',{key:'Shift'});assert.equal(c.P.driftHeld,false);assert.equal(c.P.driftReleased,true);
});
test('only the owned finger can release a drift and cancellation grants no turbo',()=>{
 const c=controls();c.button.fire('pointerdown',{pointerId:1});c.button.fire('pointerdown',{pointerId:2});c.button.fire('pointerup',{pointerId:2});assert.equal(c.P.driftHeld,true);
 c.button.fire('pointerup',{pointerId:1});assert.equal(c.P.driftReleased,true);
 c.button.fire('pointerdown',{pointerId:3});c.button.fire('lostpointercapture',{pointerId:3});assert.equal(c.P.driftHeld,false);assert.equal(c.P.driftReleased,false);
});
test('keyboard release cannot interrupt an owned touch drift',()=>{
 const c=controls();c.button.fire('pointerdown',{pointerId:1});c.window.fire('keydown',{key:'Shift'});c.window.fire('keyup',{key:'Shift'});assert.equal(c.P.driftHeld,true);
 c.button.fire('pointerup',{pointerId:1});assert.equal(c.P.driftReleased,true);
});
