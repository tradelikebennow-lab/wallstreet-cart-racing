var ItemFeedback = (() => {
 function beforePickup(slots,kind,pnl){
  const matching=slots.findIndex(s=>s&&s.k===kind),slot=matching<0?slots.findIndex(s=>!s):matching;
  return {slot,kind,fromLevel:matching<0?0:slots[matching].lv,pnl};
 }
 function pickup(before,slots,pnl,accepted){
  if(!accepted||before.slot<0)return null;
  const held=slots[before.slot];
  if(!held||held.k!==before.kind)return null;
  const {slot,kind,fromLevel}=before,level=held.lv;
  const type=fromLevel===0&&level===1?'collect':level===fromLevel+1&&level<=3?'upgrade':fromLevel===3&&level===3&&pnl>before.pnl?'max-bonus':null;
  return type?{type,slot,kind,fromLevel,level,bonus:type==='max-bonus'?pnl-before.pnl:0}:null;
 }
 function use(slot,before,after){
  return before&&after===null?{type:'use',slot,kind:before.k,fromLevel:before.lv,level:before.lv,bonus:0}:null;
 }
 return {beforePickup,pickup,use};
})();
