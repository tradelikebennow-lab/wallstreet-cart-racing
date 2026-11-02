const test = require('node:test');
const assert = require('node:assert/strict');
const GraphicsProfiles = require('../work/3d/graphics-profiles.js');

test('Auto chooses conservative touch and compact viewport budgets and High for desktop', () => {
  const desktop = { width: 1440, height: 900, dpr: 2, coarsePointer: false };
  assert.equal(GraphicsProfiles.resolve(undefined, desktop).requestedQuality, 'auto');
  assert.equal(GraphicsProfiles.resolve('auto', desktop).quality, 'high');
  assert.equal(GraphicsProfiles.resolve('auto', { ...desktop, coarsePointer: true }).quality, 'medium');
  assert.equal(GraphicsProfiles.resolve('auto', { width: 390, height: 844, dpr: 3 }).quality, 'medium');
  assert.equal(GraphicsProfiles.resolve('auto', { width: 844, height: 390, dpr: 3 }).quality, 'medium');
});

test('valid explicit preferences survive environment changes and malformed preferences return to Auto', () => {
  assert.equal(GraphicsProfiles.parsePreference('high'), 'high');
  assert.equal(GraphicsProfiles.parsePreference('medium'), 'medium');
  assert.equal(GraphicsProfiles.parsePreference('low'), 'low');
  for (const invalid of [null, undefined, '', 'HIGH', 'standard', 'economy', 'toString', {}, 'fast']) assert.equal(GraphicsProfiles.parsePreference(invalid), 'auto');
  assert.equal(GraphicsProfiles.resolve('high', { width: 320, height: 568, dpr: 3, coarsePointer: true }).quality, 'high');
  assert.equal(GraphicsProfiles.resolve('medium', { width: 2560, height: 1440, dpr: 1 }).quality, 'medium');
});

test('every profile caps backing pixels and native DPR across viewport sizes', () => {
  for (const quality of ['auto', 'high', 'medium', 'low']) {
    for (const [width, height] of [[320, 568], [390, 844], [640, 360], [844, 390], [1440, 900], [3840, 2160], [7680, 4320]]) {
      for (const dpr of [.75, 1, 2, 3]) {
        const result = GraphicsProfiles.resolve(quality, { width, height, dpr });
        assert.ok(result.backingWidth * result.backingHeight <= result.maxBackingPixels);
        assert.ok(result.pixelRatio <= Math.min(dpr, result.dprCap));
        assert.equal(result.backingWidth, Math.floor(width * result.pixelRatio));
        assert.equal(result.backingHeight, Math.floor(height * result.pixelRatio));
      }
    }
  }
});

test('Medium reduces decorative work and actual shadow work with immutable profiles', () => {
  const high = GraphicsProfiles.resolve('high', { width: 1440, height: 900, dpr: 2 });
  const medium = GraphicsProfiles.resolve('medium', { width: 1440, height: 900, dpr: 2 });
  assert.ok(medium.nearEnter < high.nearEnter);
  assert.ok(medium.nearExit < high.nearExit);
  assert.ok(medium.crowdStride > high.crowdStride);
  assert.ok(medium.sceneryStride > high.sceneryStride);
  assert.equal(high.shadowEnabled, true);
  assert.equal(medium.shadowEnabled, false);
  assert.equal(high.shadowSize, 2048);
  assert.equal(medium.shadowSize, 512);
  assert.ok(Object.isFrozen(GraphicsProfiles.PROFILES));
  assert.ok(Object.isFrozen(GraphicsProfiles.PROFILES.medium));
  assert.ok(Object.isFrozen(medium));
});

test('Low keeps Medium scenery at 1x pixels for older phones', () => {
  const phone = { width: 390, height: 844, dpr: 3, coarsePointer: true };
  const medium = GraphicsProfiles.resolve('medium', phone), low = GraphicsProfiles.resolve('low', phone);
  assert.equal(medium.pixelRatio, 2);
  assert.equal(low.pixelRatio, 1);
  assert.equal(low.shadowEnabled, false);
  assert.equal(low.sceneryStride, medium.sceneryStride);
  assert.equal(low.crowdStride, medium.crowdStride);
});

test('invalid boundary dimensions still produce finite positive rendering dimensions', () => {
  for (const environment of [{}, { width: NaN, height: Infinity, dpr: 0 }, { width: -10, height: 0, dpr: NaN }]) {
    const result = GraphicsProfiles.resolve('auto', environment);
    assert.ok(Number.isFinite(result.pixelRatio) && result.pixelRatio > 0);
    assert.ok(result.backingWidth >= 1 && result.backingHeight >= 1);
  }
});
