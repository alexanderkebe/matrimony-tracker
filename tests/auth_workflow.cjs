/* Staff sign-in: pages and couple data need an account, the first account becomes the owner,
   others join by invite link, reset links, removal and sign-out.
   Run with the app served (npm run dev). Every account it makes uses @matrimony.test and is
   deleted at the end; if the real owner already exists, an admin test account stands in. */
const assert = require('node:assert/strict');
const path = require('node:path');
const fs = require('node:fs');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const testAccount = require('./test_account.cjs');
const base = process.env.MATRIMONY_URL || 'http://127.0.0.1:4173';
const output = path.resolve('tmp/auth-qa');
fs.mkdirSync(output, {recursive:true});
const password = 'correct horse battery';

let browser;
(async () => {
  browser = await chromium.launch({channel:'msedge', headless:true});
  const errors = [];
  const watch = page => { page.on('pageerror', error => errors.push(error.message)); return page; };

  // Signed out: pages go to sign-in, couple data and the planner refuse.
  const visitor = await browser.newContext({viewport:{width:1280, height:860}});
  const page = watch(await visitor.newPage());
  await page.goto(`${base}/weddings`, {waitUntil:'domcontentloaded'});
  assert.equal(new URL(page.url()).pathname, '/signin');
  assert.equal(new URL(page.url()).searchParams.get('next'), '/weddings');
  for (const api of ['/api/records', '/api/portal', '/api/team']) assert.equal((await visitor.request.get(base + api)).status(), 401, api);
  assert.equal((await visitor.request.get(`${base}/api/v1/weddings`)).status(), 401, 'The Python planner needs the same sign-in');
  assert.equal((await visitor.request.get(`${base}/portal`)).status(), 200, 'The couple portal stays public');
  // Without an invite, only the first (owner) account can sign up.
  const ownerFree = (await visitor.request.get(`${base}/api/auth/me`).then(r => r.json())).needsOwner;
  const stranger = await visitor.request.post(`${base}/api/auth/signup`, {data:{name:'Stranger', email:'stranger@matrimony.test', password}, headers:{Origin:base}});
  assert.equal(stranger.status(), ownerFree ? 201 : 403);
  if (ownerFree) {
    const second = await browser.newContext().then(other => other.request.post(`${base}/api/auth/signup`, {data:{name:'Second', email:'second@matrimony.test', password}, headers:{Origin:base}}));
    assert.equal(second.status(), 403, 'Once an owner exists, sign-up needs an invite');
  }
  await visitor.clearCookies();
  await testAccount.removeTestAccounts();

  // The owner (or an admin test account when the real owner exists) signs in.
  const {needsOwner} = await visitor.request.get(`${base}/api/auth/me`).then(r => r.json());
  let managerEmail = 'owner@matrimony.test';
  await page.goto(`${base}/signin?next=%2Fweddings`, {waitUntil:'domcontentloaded'});
  if (needsOwner) {
    await page.locator('.auth-form h1', {hasText:'Create your owner account'}).waitFor();
    await page.screenshot({path:path.join(output, 'owner-signup.png')});
    await page.getByLabel('Full name').fill('Hanna Test');
    await page.getByLabel('Email').fill(managerEmail);
    await page.locator('input[name="password"]').fill('short');
    await page.getByRole('button', {name:'Create account'}).click();
    assert.match(await page.locator('.auth-error').innerText(), /at least 10 characters/);
    await page.locator('input[name="password"]').fill(password);
    await page.getByRole('button', {name:'Create account'}).click();
  } else {
    const admin = await testAccount.create('admin', 'Hanna Test');
    managerEmail = admin.email;
    await page.locator('.auth-form h1', {hasText:'Welcome back'}).waitFor();
    await page.getByLabel('Email').fill(managerEmail);
    await page.locator('input[name="password"]').fill('wrong password!');
    await page.getByRole('button', {name:'Sign in'}).click();
    assert.match(await page.locator('.auth-error').innerText(), /don't match/);
    await page.locator('input[name="password"]').fill(admin.password);
    await page.getByRole('button', {name:'Sign in'}).click();
  }
  await page.waitForURL(`${base}/weddings`);
  await page.locator('#sidebarUserName', {hasText:'Hanna Test'}).waitFor();
  assert.equal(await page.locator('#teamButton').isVisible(), true);
  const capabilities = await page.evaluate(() => fetch('/api/v1/weddings/capabilities').then(r => r.json()));
  assert.deepEqual([capabilities.authenticated, capabilities.local, capabilities.canAccessClients], [true, false, true], 'The planner trusts the signed-in session');
  assert.equal(await page.evaluate(() => fetch('/api/records').then(r => r.status)), 200);

  // Invite a planner, who joins with the link.
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.locator('#teamButton').click();
  const team = page.locator('#teamDialog');
  await team.locator('.team-member').first().waitFor();
  await team.locator('[data-team-invite]').click();
  await team.locator('#teamLink:not([hidden])').waitFor();
  const inviteLink = await page.locator('#teamLinkUrl').inputValue();
  assert.match(inviteLink, /\/signin\?invite=[\w-]{32}$/);
  assert.match(decodeURIComponent(await team.locator('.share-channel-whatsapp').getAttribute('href')), /invited to Matrimony By Hanna/);
  await page.screenshot({path:path.join(output, 'team-invite.png')});

  const plannerContext = await browser.newContext({viewport:{width:390, height:800}});
  const planner = watch(await plannerContext.newPage());
  await planner.goto(inviteLink, {waitUntil:'domcontentloaded'});
  await planner.locator('.auth-form h1', {hasText:'Join the team'}).waitFor();
  assert.match(await planner.locator('.auth-lead').innerText(), /as a planner/);
  await planner.screenshot({path:path.join(output, 'invite-signup-mobile.png')});
  await planner.getByLabel('Full name').fill('Selam Planner');
  await planner.getByLabel('Email').fill('planner@matrimony.test');
  await planner.locator('input[name="password"]').fill(password);
  await planner.getByRole('button', {name:'Create account'}).click();
  await planner.waitForURL(`${base}/`);
  await planner.locator('#sidebarUserName', {hasText:'Selam Planner'}).waitFor({state:'attached'});
  assert.equal(await planner.locator('#teamButton').isHidden(), true, 'Planners do not manage the team');
  assert.equal(await planner.evaluate(() => fetch('/api/team').then(r => r.status)), 403);
  const reused = await plannerContext.request.post(`${base}/api/auth/signup`, {data:{name:'Again', email:'again@matrimony.test', password, invite:inviteLink.split('=')[1]}, headers:{Origin:base}});
  assert.equal(reused.status(), 403, 'An invite works once');

  // A reset link sets a new password; removal locks the planner out.
  await page.locator('#teamDialog [data-close-dialog]').click();
  await page.locator('#teamButton').click();
  const plannerRow = team.locator('.team-member', {hasText:'Selam Planner'});
  await plannerRow.waitFor();
  await plannerRow.locator('[data-team-reset]').click();
  await page.locator('#teamLinkText', {hasText:'reset link to Selam Planner'}).waitFor();
  const resetLink = await page.locator('#teamLinkUrl').inputValue();
  const resetContext = await browser.newContext();
  const reset = watch(await resetContext.newPage());
  await reset.goto(resetLink, {waitUntil:'domcontentloaded'});
  await reset.locator('.auth-form h1', {hasText:'Choose a new password'}).waitFor();
  await reset.locator('input[name="password"]').fill('a brand new password');
  await reset.getByRole('button', {name:'Save and sign in'}).click();
  await reset.waitForURL(`${base}/`);
  assert.equal((await plannerContext.request.get(`${base}/api/auth/me`)).status(), 401, 'A new password signs other devices out');

  page.once('dialog', dialog => dialog.accept());
  await plannerRow.locator('[data-team-remove]').click();
  await team.locator('.team-member', {hasText:'Selam Planner'}).waitFor({state:'detached'});
  assert.equal((await resetContext.request.get(`${base}/api/auth/me`)).status(), 401, 'Removed members are signed out');
  const removedSignIn = await resetContext.request.post(`${base}/api/auth/signin`, {data:{email:'planner@matrimony.test', password:'a brand new password'}, headers:{Origin:base}});
  assert.equal(removedSignIn.status(), 401);
  await page.locator('#teamDialog [data-close-dialog]').click();

  // Signing out clears couple drafts kept on this device.
  await page.evaluate(() => localStorage.setItem('matrimony-by-hanna-planning-draft-v1', '{"details":{"brideName":"Private"}}'));
  await page.locator('#signOutButton').click();
  await page.waitForURL(/\/signin$/);
  assert.equal(await page.evaluate(() => localStorage.getItem('matrimony-by-hanna-planning-draft-v1')), null);
  await page.goto(base, {waitUntil:'domcontentloaded'});
  assert.equal(new URL(page.url()).pathname, '/signin');
  assert.equal((await visitor.request.get(`${base}/api/records`)).status(), 401);

  assert.deepEqual(errors, []);
  console.log(`Auth workflow passed: ${needsOwner ? 'owner sign-up' : 'admin sign-in'}, protected pages and APIs (records, portal list, team, planner), public portal, invite once, planner limits, reset link signs other devices out, removal, sign-out clears local drafts.`);
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => {
  await browser?.close();
  await testAccount.removeTestAccounts();
});
