const assert = require('node:assert/strict');
const {openGame} = require('./browser-lib.cjs');

(async () => {
 const {browser,page,errors} = await openGame();
 try {
  for (const lane of [1,-1,0]) {
   const result = await page.evaluate(lane => {
    const {P,S,clean,step} = raceQA;
    clean(229);
    while (P.s < 231) step(1/120);
    const pickups = S.ents.filter(e => e.cat === 'item' && e.s === 300);
    if (pickups.length !== 1 || pickups[0].x !== -1) throw Error('Expected one outside pickup');
    S.slots = [{k:pickups[0].kind,lv:1},null,null];
    P.s = 297;
    P.x = lane;
    let firstBoost = 0;
    while (P.s < 304) {
     step(1/120);
     if (P.boost && !firstBoost) firstBoost = P.boost;
    }
    return {boost:P.openingBoostUsed,elapsed:firstBoost-P.boost,level:S.slots[0].lv};
   },lane);
   assert.equal(result.boost,lane === 1);
   assert.equal(result.level,lane === -1 ? 2 : 1);
   if (lane === 1) assert.ok(result.elapsed > .1,'boost duration should count down across the strip');
  }
  assert.deepEqual(errors,[]);
  console.log('Opening corner passed: inside boost, outside stack, center miss and replay reset.');
 } finally { await browser.close(); }
})().catch(error => {console.error(error);process.exitCode=1;});
