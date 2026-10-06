/* Focused Teri-style venue regression. No live records or provider writes. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MATRIMONY_URL || 'http://127.0.0.1:4173';
const output = 'tmp/venue-qa';
fs.mkdirSync(output, {recursive:true});

(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1000},geolocation:{latitude:9.01234,longitude:38.76543}});
  const legacy = {name:'Holy Trinity Cathedral',address:'Addis Ababa, Ethiopia',lat:9.0303,lon:38.7612};
  const sheraton = {name:'Sheraton Addis',address:'Taitu Street, Addis Ababa, Ethiopia',lat:9.02031,lon:38.75743};
  await context.addInitScript(legacy => {
    if (!localStorage.getItem('matrimony-by-hanna-planning-draft-v1')) localStorage.setItem('matrimony-by-hanna-planning-draft-v1',JSON.stringify({lang:'en',details:{brideName:'Hanna Alemu',groomName:'Samuel Bekele',sacredVenue:`${legacy.name}, ${legacy.address}`,locations:{sacredVenue:legacy}},services:{}}));
  },legacy);
  const requests = [], errors = [];
  let searchUnavailable = false, reverseUnavailable = false;
  await context.route('**/api/records**', route => route.fulfill({json:{records:[]}}));
  // Unit UI tests do not depend on map connectivity. The actual Google embed is
  // checked separately with a live, read-only lookup and screenshot.
  await context.route('https://www.google.com/maps?**', route => route.fulfill({contentType:'text/html',body:'<html><body style="background:#eee;font:14px Arial;padding:24px">Google Maps preview (test fixture)</body></html>'}));
  await context.route('**/api/places**', async route => {
    const url = new URL(route.request().url());
    if (url.pathname.endsWith('/reverse')) return route.fulfill({status:reverseUnavailable ? 503 : 200,json:{place:{name:'Bole',address:'Addis Ababa, Ethiopia',lat:9.01234,lon:38.76543}}});
    const query = url.searchParams.get('q');
    requests.push(query);
    if (query === 'old query') await new Promise(resolve => setTimeout(resolve,1100));
    const places = query === 'nothing' ? [] : query === 'latest query' ? [{...sheraton,name:'Latest venue'}] : [sheraton,legacy];
    try {await route.fulfill({status:searchUnavailable ? 503 : 200,json:{places}});} catch { /* Request may have been cancelled by a later selection. */ }
  });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  const root = id => page.locator(`#${id}-search`).locator('..').locator('..');
  const query = id => page.locator(`#${id}-search`);
  async function pin(id) {return page.evaluate(id => state.details.locations?.[id],id);}
  try {
    await page.goto(base);
    await page.locator('.event-venue-type-grid label').filter({has:page.locator('[data-event-venue-type="hall"]')}).click();
    assert.deepEqual(await pin('venue-church'),legacy,'Existing saved coordinate format must remain compatible');
    assert.match(await root('venue-church').locator('iframe').getAttribute('src'),/google\.com\/maps\?q=9.0303%2C38.7612/);
    assert.equal(await root('venue-church').locator('iframe').isVisible(),true);
    await query('venue-church').fill('sh');
    await page.waitForTimeout(550);
    assert.equal(requests.length,0,'Short queries must not call the provider');
    await query('venue-church').pressSequentially('er');
    assert.equal(await query('venue-church').inputValue(),'sher');
    assert.deepEqual(await pin('venue-church'),legacy,'A replacement search must not erase the saved pin');
    await page.waitForSelector('#venue-church-results .place-result');
    assert.equal(requests.length,1,'Settled typing triggers one debounced request');
    assert.equal(requests[0],'sher','Partial names must autocomplete without pressing Enter');
    assert.match(await root('venue-church').locator('.place-results').innerText(),/Sheraton Addis/);
    assert.equal(await query('venue-church').getAttribute('aria-expanded'),'true');
    await query('venue-church').press('ArrowDown');
    assert.equal(await query('venue-church').getAttribute('aria-activedescendant'),'venue-church-result-0');
    await query('venue-church').press('Enter');
    assert.deepEqual(await pin('venue-church'),sheraton);
    assert.equal(await page.locator('#venue-church').inputValue(),`${sheraton.name}, ${sheraton.address}`);
    assert.equal(await query('venue-church').inputValue(),'');
    assert.equal(await query('venue-church').getAttribute('aria-expanded'),'false');
    assert.match(await root('venue-church').locator('.selected-venue-card').innerText(),/Sheraton Addis/);
    assert.match(await root('venue-church').locator('.selected-venue-tools a').first().getAttribute('href'),/query=9.02031%2C38.75743/);

    // Slow old responses cannot win over the latest query.
    await query('venue-church').fill('old query');
    await query('venue-church').press('Enter');
    await page.waitForFunction(() => document.querySelector('#venue-church-search').getAttribute('aria-busy') === 'true');
    await query('venue-church').fill('latest query');
    await page.waitForFunction(() => document.querySelector('#venue-church-results').textContent.includes('Latest venue'));
    assert.equal(await pin('venue-church').then(place => place.name),'Sheraton Addis');
    await query('venue-church').press('Escape');
    assert.equal(await query('venue-church').getAttribute('aria-expanded'),'false');

    searchUnavailable = true;
    await query('venue-hall').fill('unavailable venue');
    await query('venue-hall').press('Enter');
    await page.waitForFunction(() => document.querySelector('#venue-hall-search').closest('.location-picker').querySelector('.map-status').textContent.includes('unavailable'));
    await root('venue-hall').locator('.venue-manual summary').click();
    await page.locator('#venue-hall').fill('Family garden, Bole');
    assert.equal(await pin('venue-hall'),undefined);
    assert.match(await root('venue-hall').locator('.map-selection').innerText(),/Manual entry/);
    assert.match(await root('venue-hall').locator('.selected-venue-card').innerText(),/Family garden/);
    searchUnavailable = false;
    await query('venue-hall').fill('nothing');
    await query('venue-hall').press('Enter');
    await page.waitForFunction(() => document.querySelector('#venue-hall-search').closest('.location-picker').querySelector('.map-status').textContent.includes('No matching'));
    assert.equal(await page.locator('#venue-hall').inputValue(),'Family garden, Bole');

    // Explicit GPS selection, with a denied-permission and an offline fallback.
    await context.grantPermissions(['geolocation']);
    await root('brideAddress').locator('.near-me').click();
    await page.waitForFunction(() => state.details.locations?.brideAddress?.lat === 9.01234);
    assert.equal((await pin('brideAddress')).name,'Bole');
    await page.evaluate(() => {window.originalGeolocation = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);navigator.geolocation.getCurrentPosition = (_success,error) => error({code:1});});
    await root('brideAddress').locator('.near-me').click();
    assert.equal((await pin('brideAddress')).name,'Bole','Denied location must preserve the existing venue');
    assert.match(await root('brideAddress').locator('.map-status').innerText(),/declined/);
    await page.evaluate(() => {navigator.geolocation.getCurrentPosition = window.originalGeolocation;});
    reverseUnavailable = true;
    await root('brideAddress').locator('.near-me').click();
    await page.waitForFunction(() => state.details.locations?.brideAddress?.name === 'Current location');
    assert.equal((await pin('brideAddress')).lon,38.76543);
    await page.evaluate(() => {navigator.geolocation.getCurrentPosition = success => {window.delayedLocation = success;};});
    await root('brideAddress').locator('.near-me').click();
    await root('brideAddress').locator('.venue-manual summary').click();
    await page.locator('#brideAddress').fill('Manually chosen address');
    await page.evaluate(() => window.delayedLocation({coords:{latitude:10,longitude:40}}));
    assert.equal(await pin('brideAddress'),undefined,'A late GPS callback must not overwrite a manual edit');
    assert.equal(await page.locator('#brideAddress').inputValue(),'Manually chosen address');
    await page.evaluate(() => {navigator.geolocation.getCurrentPosition = window.originalGeolocation;});

    // Manual edits remove a stale pin, and remove controls clear the saved value.
    await root('venue-church').locator('.venue-manual summary').click();
    await page.locator('#venue-church').fill('Private chapel');
    assert.equal(await pin('venue-church'),undefined);
    await root('venue-church').locator('.remove-venue').click();
    assert.equal(await page.locator('#venue-church').inputValue(),'');
    assert.equal(await root('venue-church').locator('.selected-venue-card').isVisible(),false);
    await query('venue-church').fill('Sheraton');
    await query('venue-church').press('Enter');
    await page.locator('#venue-church-results .place-result').first().click();
    await page.waitForTimeout(350);
    await page.reload();
    assert.deepEqual(await pin('venue-church'),sheraton,'Saved selection survives reload');
    assert.equal(await page.locator('#venue-hall').inputValue(),'Family garden, Bole');

    await page.locator('[data-language="am"]').click();
    assert.match(await query('venue-church').getAttribute('placeholder'),/ቦታ/);
    assert.match(await root('venue-church').locator('.near-me').innerText(),/በአቅራቢያዬ/);
    assert.equal((await pin('venue-church')).name,'Sheraton Addis');
    await root('venue-church').screenshot({path:`${output}/venue-desktop-am.png`});
    await page.setViewportSize({width:390,height:844});
    await root('venue-church').scrollIntoViewIfNeeded();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),true,'Mobile must not overflow horizontally');
    const bounds = await root('venue-church').boundingBox();
    assert.ok(bounds.x >= 0 && bounds.x + bounds.width <= 390);
    await root('venue-church').screenshot({path:`${output}/venue-mobile-am.png`});
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,searchRequests:requests.length,pageErrors:errors}));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
