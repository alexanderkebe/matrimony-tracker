/* Each account sees only the weddings it registered: couple records, client-portal requests
   and planner weddings stay invisible to every other account, admins included.
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
  assert.ok(!(await ids(b)).includes(recordId), 'Other accounts do not see it in the list');
  assert.equal((await b.get(`${base}/api/records/${recordId}`)).status(), 404, 'or open it by number');
  assert.equal((await b.put(`${base}/api/records/${recordId}`, {...write, data:plan})).status(), 404, 'or change it');
  assert.equal((await b.delete(`${base}/api/records/${recordId}`, write)).status(), 404, 'or delete it');
  assert.equal((await a.get(`${base}/api/records/${recordId}`)).status(), 200);

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
  assert.ok(!(await clients(b)).includes(recordId));
  assert.equal((await b.get(`${base}/api/v1/weddings/clients/${recordId}`)).status(), 404);

  // In the app, B's sidebar and search do not show A's couple.
  const page = await contextB.newPage();
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.locator('#sidebarUserName', {hasText:'Admin B'}).waitFor();
  await page.waitForFunction(() => Array.isArray(state.records));
  assert.ok(!(await page.locator('#recentCouples').innerText()).includes('Isolation'));
  console.log('Isolation passed: records (list, open, change, delete), client requests by link code (forged codes ignored), planner weddings, tasks and couple picker are private to the registering account, admins included.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  await testAccount.removeTestAccounts();
});
