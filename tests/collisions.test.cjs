const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const {sweepAabb, heightAtContact} = require('../work/3d/collisions.js');
const pose = (s, x = 0) => ({s, x});
const close = (actual, expected) => assert(Math.abs(actual - expected) < 1e-12, `${actual} differs from ${expected}`);

test('fast shot crosses a target although neither endpoint overlaps', () => {
  const hit = sweepAabb(pose(0), pose(20), pose(10), pose(10), {s: .8, x: .5});
  close(hit.tEnter, .46);
  close(hit.tExit, .54);
});

test('diagonal crossing misses when station and lane overlap at different times', () => {
  assert.equal(sweepAabb(pose(-2, 0), pose(2, 4), pose(0), pose(0), {s: .5, x: .5}), null);
});

test('moving Trump and moving player meet between clear endpoints', () => {
  const hit = sweepAabb(pose(0, -1), pose(10, 1), pose(5, 1), pose(5, -1), {s: .6, x: .3});
  close(hit.tEnter, .44);
  close(hit.tExit, .56);
});

test('initial overlap reports immediate contact and the actual separation time', () => {
  const hit = sweepAabb(pose(0), pose(4), pose(.25), pose(.25), {s: .5, x: .5});
  assert.equal(hit.tEnter, 0);
  close(hit.tExit, .1875);
});

test('equal velocity preserves overlap or misses without dividing by zero', () => {
  assert.deepEqual(sweepAabb(pose(0), pose(10), pose(.2), pose(10.2), {s: .5, x: .5}), {tEnter: 0, tExit: 1});
  assert.equal(sweepAabb(pose(0), pose(10), pose(2), pose(12), {s: .5, x: .5}), null);
});

test('earliest contact ordering follows relative motion rather than target endpoint', () => {
  const targets = [
    {id: 'later', old: pose(8), next: pose(4)},
    {id: 'first', old: pose(2), next: pose(6)}
  ];
  const hits = targets.map(target => ({id: target.id, ...sweepAabb(pose(0), pose(10), target.old, target.next, {s: .5, x: .3})}));
  hits.sort((a, b) => a.tEnter - b.tEnter);
  assert.equal(hits[0].id, 'first');
  close(hits[0].tEnter, .25);
});

test('reverse travel and stationary targets give the same contact fraction', () => {
  const forward = sweepAabb(pose(0), pose(10), pose(5), pose(5), {s: 1, x: .5});
  assert.deepEqual(sweepAabb(pose(10), pose(0), pose(5), pose(5), {s: 1, x: .5}), forward);
  assert.equal(sweepAabb(pose(0, 2), pose(10, 2), pose(5), pose(5), {s: 1, x: .5}), null);
});

test('touching edges count as contact including the end of a step', () => {
  assert.deepEqual(sweepAabb(pose(0), pose(1), pose(2), pose(2), {s: 1, x: 0}), {tEnter: 1, tExit: 1});
  assert.deepEqual(sweepAabb(pose(0), pose(0), pose(0), pose(0), {s: 0, x: 0}), {tEnter: 0, tExit: 1});
});

test('height is interpolated at contact in road-relative units', () => {
  const contact = sweepAabb(pose(0), pose(10), pose(3), pose(3), {s: .5, x: .5});
  close(heightAtContact(.2, 1.2, contact.tEnter), .45);
  assert(heightAtContact(.2, 1.2, contact.tEnter) < .5);
  close(heightAtContact(1, 0, .8), .2);
});

test('helper also embeds directly into the standalone IIFE without CommonJS', () => {
  const source = fs.readFileSync(require.resolve('../work/3d/collisions.js'), 'utf8');
  const hit = vm.runInNewContext(`(() => { ${source}\nreturn Collision.sweepAabb({s:0,x:0},{s:10,x:0},{s:5,x:0},{s:5,x:0},{s:1,x:.5}); })()`);
  close(hit.tEnter, .4);
  close(hit.tExit, .6);
});

test('active hazard clipping retains only the GAVEL down interval',()=>{
 const {activeHazardContact}=require('../work/3d/collisions.js');
 const gavel=(phase)=>({type:'GAVEL',armed:true,t:phase/.85,ph0:0});
 const leaving=activeHazardContact(gavel(.925),gavel(.9179166667),{tEnter:1/30,tExit:1});
 close(leaving.tEnter,1/30);assert(leaving.tExit>.29&&leaving.tExit<.30);
 assert.equal(activeHazardContact(gavel(.522),gavel(.5149166667),{tEnter:0,tExit:2/3}),null);
 assert.equal(activeHazardContact(gavel(.6),gavel(.6),{tEnter:0,tExit:1}).tExit,1);
 assert.equal(activeHazardContact(gavel(.2),gavel(.2),{tEnter:0,tExit:1}),null);
 assert.equal(activeHazardContact({...gavel(.6),armed:false},gavel(.6),{tEnter:0,tExit:1}),null);
 const wrap=activeHazardContact(gavel(1.7),gavel(.95),{tEnter:0,tExit:1});
 assert(wrap.tEnter>0&&wrap.tExit===1);
});
