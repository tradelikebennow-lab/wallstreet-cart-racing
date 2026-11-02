const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
function fixture(){
 const receipt={hidden:true,textContent:'',dataset:{},style:{setProperty(){}},classList:{remove(){}}};
 let change;
 const context={S:{mode:'play',feedbackT:0},slotEl:Array.from({length:3},()=>({b:{removeAttribute(){}}})),
  $:()=>receipt,G3:{clearItemFeedback(){},advanceItemFeedback(){}},AC:null,
  reducedMotion:{addEventListener(name,callback){if(name==='change')change=callback;}}};
 vm.createContext(context);vm.runInContext(fs.readFileSync('work/3d/race-ux.js','utf8'),context);
 return{context,receipt,change:()=>change()};
}
test('motion preference changes retain the current readable receipt',()=>{
 const {context,receipt,change}=fixture();context.setRaceFeedback('MAX BONUS +$1,000','#f00');change();
 assert.equal(receipt.hidden,false,'changing motion must not erase item result');
 assert(context.S.feedbackT>0,'receipt keeps its remaining lifetime');
});
test('finish updates let the prize receipt expire normally',()=>{
 const {context,receipt}=fixture();context.S.mode='finish';context.setRaceFeedback('PRIZE +$25,000','#fc0');context.updateRaceUX(1/120);
 assert.equal(receipt.hidden,false,'finish ticks must not erase the prize');
 assert(context.S.feedbackT>1,'prize retains a readable duration');
 context.updateRaceUX(1.4);assert.equal(receipt.hidden,true,'prize still expires');
});
