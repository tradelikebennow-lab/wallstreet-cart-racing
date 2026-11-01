const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

function ticker(){
  const items=[];
  const wrap={clientWidth:600};
  const track={
    style:{},
    get firstElementChild(){return items[0];},
    get childElementCount(){return items.length;},
    get scrollWidth(){return items.reduce((total,item)=>total+item.offsetWidth,0);},
    appendChild(item){items.push(item);},
  };
  const document={createElement(){return {offsetWidth:200,remove(){items.splice(items.indexOf(this),1);}};}};
  const source=fs.readFileSync('outputs/bull-run-3d.html','utf8');
  const start=source.indexOf("const tkTrack = $('tkTrack')");
  const end=source.indexOf('// ---------- icons',start);
  const context=vm.createContext({document,$:id=>id==='tkTrack'?track:wrap,S:{mood:0},pick:values=>values[0]});
  vm.runInContext(source.slice(start,end),context);
  return {items,wrap,track,push:(html='quote',cls)=>context.tickerPush(html,cls),update:dt=>context.tickerUpdate(dt),offset:()=>vm.runInContext('tkX',context)};
}

test('hidden ticker retains its queue and scroll position until it returns',()=>{
  const t=ticker();t.update(0);t.update(.25);
  const count=t.items.length,offset=t.offset(),transform=t.track.style.transform;
  t.wrap.clientWidth=0;
  for(let i=0;i<1200;i++)t.update(1/120);
  assert.equal(t.items.length,count);assert.equal(t.offset(),offset);assert.equal(t.track.style.transform,transform);
  t.wrap.clientWidth=600;t.update(.25);
  assert.equal(t.offset(),offset-16);assert(t.items.length>0);
});

test('unmeasurable first item does not cause removal or refill churn',()=>{
  const t=ticker();t.push();t.items[0].offsetWidth=0;
  for(let i=0;i<120;i++)t.update(1/120);
  assert.equal(t.items.length,1);assert.equal(t.offset(),0);
  t.items[0].offsetWidth=200;t.update(1/60);
  assert(t.offset()<0);assert(t.items.length>1);
});

test('all pushes share the queue bound and keep recent news',()=>{
  const t=ticker();t.wrap.clientWidth=0;
  for(let i=0;i<1000;i++)t.push('news '+i,'news');
  assert.equal(t.items.length,96);assert.equal(t.items[0].innerHTML,'news 904');assert.equal(t.items.at(-1).innerHTML,'news 999');
  t.wrap.clientWidth=600;t.update(1/60);assert(t.offset()<0);
});

test('ticker refills after viewport growth without exceeding the queue bound',()=>{
  const t=ticker();t.update(0);assert.equal(t.items.length,5);
  t.wrap.clientWidth=1600;t.update(0);assert.equal(t.items.length,12);
  t.wrap.clientWidth=100000;
  for(let i=0;i<30;i++)t.update(0);
  assert.equal(t.items.length,96);assert.equal(t.offset(),0);
});

test('zero elapsed time preserves scrolling and visible items leave after their width',()=>{
  const t=ticker();t.update(0);const first=t.items[0];
  t.update(0);assert.equal(t.offset(),0);assert.equal(t.items[0],first);
  t.update(3);assert.equal(t.items[0],first);
  t.update(.25);assert.notEqual(t.items[0],first);assert.equal(t.offset(),-8);
});
