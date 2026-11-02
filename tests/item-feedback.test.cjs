const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const filename=require('node:path').join(__dirname,'../work/3d/item-feedback.js');
const context={};vm.createContext(context);vm.runInContext(fs.existsSync(filename)?fs.readFileSync(filename,'utf8'):'',context);
const api=context.ItemFeedback;
const plain=value=>JSON.parse(JSON.stringify(value));

test('collect reports the actual free slot at level one',()=>{
 assert.ok(api,'ItemFeedback classifier is available');
 const slots=[{k:'SHORT',lv:1},null,{k:'HEDGE',lv:1}],before=api.beforePickup(slots,'MOON',0);
 slots[1]={k:'MOON',lv:1};
 assert.deepEqual(plain(api.pickup(before,slots,0,true)),{type:'collect',slot:1,kind:'MOON',fromLevel:0,level:1,bonus:0});
});
test('in-place upgrades retain the copied numeric previous level',()=>{
 assert.ok(api,'ItemFeedback classifier is available');
 const slots=[{k:'SHORT',lv:1},null,null];
 for(let level=2;level<=3;level++){
  const before=api.beforePickup(slots,'SHORT',40);slots[0].lv++;
  assert.deepEqual(plain(api.pickup(before,slots,40,true)),{type:'upgrade',slot:0,kind:'SHORT',fromLevel:level-1,level,bonus:0});
 }
});
test('MAX duplicate reports actual cash delta without a fourth level',()=>{
 assert.ok(api,'ItemFeedback classifier is available');
 const slots=[null,{k:'BAILOUT',lv:3},null],before=api.beforePickup(slots,'BAILOUT',250);
 assert.deepEqual(plain(api.pickup(before,slots,7250,true)),{type:'max-bonus',slot:1,kind:'BAILOUT',fromLevel:3,level:3,bonus:7000});
});
test('refused pickups and invalid unchanged pickups emit no event',()=>{
 assert.ok(api,'ItemFeedback classifier is available');
 const slots=[{k:'SHORT',lv:1},{k:'HEDGE',lv:1},{k:'MOON',lv:1}];
 assert.equal(api.pickup(api.beforePickup(slots,'RUG',0),slots,0,false),null);
 assert.equal(api.pickup(api.beforePickup(slots,'SHORT',0),slots,0,true),null);
});
test('only consumed held items produce use feedback',()=>{
 assert.ok(api,'ItemFeedback classifier is available');
 const held={k:'HEDGE',lv:3};
 assert.deepEqual(plain(api.use(2,held,null)),{type:'use',slot:2,kind:'HEDGE',fromLevel:3,level:3,bonus:0});
 assert.equal(api.use(2,held,held),null);
 assert.equal(api.use(2,null,null),null);
});
