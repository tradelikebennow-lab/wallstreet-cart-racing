const Reliability = (() => {
 function createStepper(step,mode){
  const h=1/120;let debt=0;
  return {reset(){debt=0;},advance(elapsed,manual=false){
   if(!Number.isFinite(elapsed)||elapsed<0)return;
   debt+=manual?elapsed:Math.min(.25,elapsed);
   let n=0;
   while(debt+1e-10>=h){
    if(!manual&&n>=30){debt=0;break;}
    debt=Math.max(0,debt-h);const before=mode();step(h);n++;
    if(mode()!==before&&!(manual&&before==='count'&&mode()==='play')){debt=0;break;}
   }
  }};
 }
 return {createStepper};
})();
if(typeof module!=='undefined'&&module.exports)module.exports=Reliability;
