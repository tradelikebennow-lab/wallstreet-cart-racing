const test = require('node:test');
const assert = require('node:assert/strict');
const GraphicsProfiles = require('../work/3d/graphics-profiles.js');

test('Auto chooses conservative touch and compact viewport budgets and Standard for desktop', () => {
  const desktop = { width: 1440, height: 900, dpr: 2, coarsePointer: false };
  assert.equal(GraphicsProfiles.resolve(undefined, desktop).requestedQuality, 'auto');
  assert.equal(GraphicsProfiles.resolve('auto', desktop).quality, 'standard');
  assert.equal(GraphicsProfiles.resolve('auto', { ...desktop, coarsePointer: true }).quality, 'economy');
  assert.equal(GraphicsProfiles.resolve('auto', { width: 390, height: 844, dpr: 3 }).quality, 'economy');
  assert.equal(GraphicsProfiles.resolve('auto', { width: 844, height: 390, dpr: 3 }).quality, 'economy');
});

test('valid explicit preferences survive environment changes and malformed preferences return to Auto', () => {
  assert.equal(GraphicsProfiles.parsePreference('standard'), 'standard');
  assert.equal(GraphicsProfiles.parsePreference('economy'), 'economy');
  for (const invalid of [null, undefined, '', 'STANDARD', {}, 'fast']) assert.equal(GraphicsProfiles.parsePreference(invalid), 'auto');
  assert.equal(GraphicsProfiles.resolve('standard', { width: 320, height: 568, dpr: 3, coarsePointer: true }).quality, 'standard');
  assert.equal(GraphicsProfiles.resolve('economy', { width: 2560, height: 1440, dpr: 1 }).quality, 'economy');
});

test('both profiles cap backing pixels and native DPR across viewport sizes', () => {
  for (const quality of ['auto', 'standard', 'economy']) {
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

test('Economy reduces decorative work and actual shadow work with immutable profiles', () => {
  const standard = GraphicsProfiles.resolve('standard', { width: 1440, height: 900, dpr: 2 });
  const economy = GraphicsProfiles.resolve('economy', { width: 1440, height: 900, dpr: 2 });
  assert.ok(economy.nearEnter < standard.nearEnter);
  assert.ok(economy.nearExit < standard.nearExit);
  assert.ok(economy.crowdStride > standard.crowdStride);
  assert.ok(economy.sceneryStride > standard.sceneryStride);
  assert.equal(standard.shadowEnabled, true);
  assert.equal(economy.shadowEnabled, false);
  assert.equal(standard.shadowSize, 2048);
  assert.equal(economy.shadowSize, 512);
  assert.ok(Object.isFrozen(GraphicsProfiles.PROFILES));
  assert.ok(Object.isFrozen(GraphicsProfiles.PROFILES.economy));
  assert.ok(Object.isFrozen(economy));
});

test('invalid boundary dimensions still produce finite positive rendering dimensions', () => {
  for (const environment of [{}, { width: NaN, height: Infinity, dpr: 0 }, { width: -10, height: 0, dpr: NaN }]) {
    const result = GraphicsProfiles.resolve('auto', environment);
    assert.ok(Number.isFinite(result.pixelRatio) && result.pixelRatio > 0);
    assert.ok(result.backingWidth >= 1 && result.backingHeight >= 1);
  }
});
