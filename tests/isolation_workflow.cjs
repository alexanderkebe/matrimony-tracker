/* Couples are shared with the whole team but only their creator (or the owner) changes or deletes them;
   client-portal requests reach the planner who sent the link; planner weddings stay with their members.
   Run with the app served (npm run dev). Uses two temporary @matrimony.test accounts and
   deletes them, and everything they created, at the end. */
const assert = require('node:assert/strict');
const {randomUUID} = require('node:crypto');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const testAccount = require('./test_account.cjs');
const base = process.env.MATRIMONY_URL || 'http://127.0.0.1:4173';

let browser;
(async () => {
  browser = await chromium.launch({channel:'msedge', headless:true});
  const plannerA = await testAccount.create('planner', 'Planner A');
  const adminB = await testAccount.create('admin', 'Admin B');
  const contextA = await browser.newContext(), contextB = await browser.newContext(), visitor = await browser.newContext();
  await plannerA.signIn(contextA, base);
  await adminB.signIn(contextB, base);
  const a = contextA.request, b = contextB.request;
  const write = {headers:{Origin:base}};

  // Couple records.
  const plan = {lang:'en', details:{brideName:'Isolation Bride', groomName:'Isolation Groom', weddingDate:'2027-04-10', bridePhone:'0911 00 00 01'}, services:{venue:{selected:true}}};
  const created = await a.post(`${base}/api/records`, {...write, data:plan});
  assert.equal(created.status(), 201);
  const recordId = (await created.json()).id;
  const ids = async request => (await (await request.get(`${base}/api/records`)).json()).records.map(record => record.id);
  assert.ok((await ids(a)).includes(recordId), 'The account that registered the couple sees it');
  const seenByB = (await (await b.get(`${base}/api/records`)).json()).records.find(record => record.id === recordId);
  assert.ok(seenByB, 'The whole team sees every couple');
  assert.deepEqual([seenByB.can_edit, seenByB.owner_name], [false, 'Planner A'], 'with who created it, and no edit rights for others');
  assert.equal((await (await b.get(`${base}/api/records/${recordId}`)).json()).can_edit, false);
  assert.equal((await b.put(`${base}/api/records/${recordId}`, {...write, data:plan})).status(), 403, 'Others cannot change it');
  assert.equal((await b.delete(`${base}/api/records/${recordId}`, write)).status(), 403, 'or delete it');
  assert.equal((await a.put(`${base}/api/records/${recordId}`, {...write, data:plan})).status(), 200, 'Its creator can');
  // Pins belong to each person.
  assert.equal((await b.post(`${base}/api/records/${recordId}/pin`, {...write, data:{pinned:true}})).status(), 200);
  assert.equal((await (await b.get(`${base}/api/records`)).json()).records[0].id, recordId, 'Pinned couples come first');
  assert.equal((await (await a.get(`${base}/api/records`)).json()).records.find(record => record.id === recordId).pinned, false, 'A pin is private to who set it');

  // Client-portal requests reach only the planner whose link the couple used.
  const {user:meA} = await (await a.get(`${base}/api/auth/me`)).json();
  assert.match(meA.portalCode, /^\d+-[\w-]{12}$/);
  const submit = planner => visitor.request.post(`${base}/api/portal`, {...write, data:{lang:'en', planner, details:{brideName:'Portal Bride', groomName:'Portal Groom', bridePhone:'0911 00 00 02'}, services:{}}});
  const sent = await submit(meA.portalCode);
  assert.equal(sent.status(), 201);
  const requestId = (await sent.json()).id;
  const requestIds = async request => (await (await request.get(`${base}/api/portal`)).json()).requests.map(item => item.id);
  assert.ok((await requestIds(a)).includes(requestId));
  assert.ok(!(await requestIds(b)).includes(requestId));
  assert.equal((await b.post(`${base}/api/portal/${requestId}`, {...write, data:{action:'import'}})).status(), 404);
  // A forged code does not deliver to that planner.
  const forged = await submit(`${meA.id}-AAAAAAAAAAAA`);
  assert.ok(!(await requestIds(a)).includes((await forged.json()).id));

  // Planner weddings.
  const wedding = await a.post(`${base}/api/v1/weddings`, {headers:{Origin:base, 'Idempotency-Key':randomUUID()},
    data:{title:'Isolation wedding', weddingDate:'2027-04-10', selectedServiceCodes:['VENUE']}});
  assert.equal(wedding.status(), 201, await wedding.text());
  const weddingId = (await wedding.json()).id;
  const weddingIds = async request => (await (await request.get(`${base}/api/v1/weddings`)).json()).items.map(item => item.id);
  assert.ok((await weddingIds(a)).includes(weddingId));
  assert.ok(!(await weddingIds(b)).includes(weddingId), 'Admins do not see other accounts’ weddings');
  assert.equal((await b.get(`${base}/api/v1/weddings/${weddingId}`)).status(), 404);
  assert.equal((await b.get(`${base}/api/v1/weddings/${weddingId}/tasks`)).status(), 404);
  // The planner's couple picker lists only your own couples.
  const clients = async request => (await (await request.get(`${base}/api/v1/weddings/clients`)).json()).items.map(item => item.id);
  assert.ok((await clients(a)).includes(recordId));
  assert.ok((await clients(b)).includes(recordId), 'The couple picker lists the shared couples');
  const planForOthers = await b.post(`${base}/api/v1/weddings/clients/${recordId}/plan`, {headers:{Origin:base, 'Idempotency-Key':randomUUID()}, data:{}});
  assert.equal(planForOthers.status(), 403, 'Only the creator or the owner turns a couple into a plan');

  // In the app, B sees A's couple as view only, with Delete disabled in its menu.
  const page = await contextB.newPage();
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.locator('#sidebarUserName', {hasText:'Admin B'}).waitFor();
  await page.waitForFunction(id => state.records?.some(record => record.id === id), recordId);
  await page.locator(`[data-couple-menu="${recordId}"]`).first().click({force:true});
  await page.locator('#coupleMenu:not([hidden])').waitFor();
  assert.equal(await page.locator('#coupleMenu [data-couple-action="delete"]').isDisabled(), true);
  assert.match(await page.locator('#coupleMenu').innerText(), /Created by Planner A/);
  await page.locator('#coupleMenu [data-couple-action="open"]').click();
  await page.waitForFunction(id => state.recordId === id, recordId);
  assert.match(await page.locator('#readonlyBanner').innerText(), /View only — Planner A/);
  assert.equal(await page.evaluate(() => document.querySelector('#step-details .form-card')?.closest('[inert]') !== null), true, 'Its details cannot be edited');
  // A deletes it from the menu.
  const pageA = await contextA.newPage();
  pageA.on('dialog', dialog => dialog.accept());
  await pageA.goto(base, {waitUntil:'domcontentloaded'});
  await pageA.waitForFunction(id => state.records?.some(record => record.id === id), recordId);
  await pageA.locator(`[data-couple-menu="${recordId}"]`).first().click({force:true});
  await pageA.locator('#coupleMenu [data-couple-action="delete"]').click();
  await pageA.waitForFunction(id => !state.records.some(record => record.id === id), recordId);
  assert.equal((await a.get(`${base}/api/records/${recordId}`)).status(), 404, 'Deleted for everyone');
  console.log('Couples passed: shared list with creator and edit rights, view-only for others (banner, locked fields, no delete), private pins sorted first, delete by the creator, client requests by link code (forged codes ignored), planner weddings and plan creation limited to members/creator.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  await testAccount.removeTestAccounts();
});
