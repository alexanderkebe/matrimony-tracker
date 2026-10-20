/* Client portal + client requests + blank forms. Own server and temporary SQLite DB, synthetic data only. */
const testSchema=require('./test_schema.cjs');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {spawn} = require('node:child_process');
const {randomUUID} = require('node:crypto');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const port = Number(process.env.MATRIMONY_PORTAL_TEST_PORT || 4191);
const base = `http://127.0.0.1:${port}`;
const output = path.resolve('tmp/portal-qa');
fs.mkdirSync(output, {recursive:true});
let server, browser;

async function startServer() {
  server = spawn(testSchema.python, ['-u', 'server.py', '--port', String(port)], {cwd:path.resolve('.'), env:{...process.env, MATRIMONY_DB_SCHEMA:testSchema.name, MATRIMONY_SESSION_SECRET:''}});
  server.stderr.on('data', () => {});
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Test server did not start')), 120000);
    server.stdout.on('data', chunk => { if (String(chunk).includes('Matrimony planner:')) { clearTimeout(timeout); resolve(); } });
    server.on('exit', code => reject(new Error(`Test server exited with ${code}`)));
  });
}

async function download(page, trigger) {
  const [file] = await Promise.all([page.waitForEvent('download', {timeout:120000}), trigger()]);
  const target = path.join(output, file.suggestedFilename());
  await file.saveAs(target);
  assert.equal(fs.readFileSync(target).subarray(0, 4).toString(), '%PDF');
  return file.suggestedFilename();
}

(async () => {
  await startServer();
  browser = await chromium.launch({channel:'msedge', headless:true});
  const errors = [];

  // A couple fills in the portal on a phone.
  const client = await browser.newContext({viewport:{width:390, height:844}});
  const portal = await client.newPage();
  portal.on('pageerror', error => errors.push(error.message));
  const clientCalls = [];
  portal.on('request', request => { if (request.url().includes('/api/records') || request.url().includes('/api/v1/')) clientCalls.push(request.url()); });
  await portal.goto(`${base}/portal`, {waitUntil:'domcontentloaded'});
  await portal.waitForFunction(() => document.body.classList.contains('portal-mode'));
  assert.equal(await portal.locator('.sidebar').isVisible(), false, 'Couples do not see the planner sidebar');
  assert.deepEqual(await portal.locator('.workflow-nav [data-step-target]:visible strong').allInnerTexts(), ['Couple & event', 'Services'], 'Only the couple-facing steps are shown');
  assert.equal(await portal.locator('#workflowStepCount').innerText(), 'Step 01 of 02');
  assert.equal(await portal.locator('.workflow-title .workspace-label').innerText(), 'Your wedding details');
  // Phone layout: no sideways scrolling, no planner menu, and the next action is always on screen.
  assert.equal(await portal.evaluate(() => document.documentElement.scrollWidth), 390, 'The portal never scrolls sideways on a phone');
  assert.equal(await portal.locator('#sidebarToggle').isVisible(), false, 'Couples see no planner menu');
  assert.equal(await portal.locator('h1:visible').first().innerText(), 'Tell us about your wedding.');
  await portal.waitForTimeout(400); // let the step's fade-in settle
  const footer = await portal.locator('#step-details .step-footer').boundingBox();
  assert.ok(footer.y + footer.height <= 844 && footer.y > 600, 'Continue stays pinned to the bottom of the screen');

  await portal.locator('.workflow-nav [data-step-target="1"]').click();
  assert.equal(await portal.locator('#step-services [data-next-step="6"]').isVisible(), false, 'Couples never reach pricing');
  await portal.locator('[data-portal-submit]').click();
  assert.equal(await portal.locator('.step-panel.is-active').getAttribute('data-step'), '0', 'Missing names and phone send the couple back');
  assert.match(await portal.locator('#validationSummary').innerText(), /phone number/);

  await portal.locator('#brideName').fill('Selam Haile');
  await portal.locator('#groomName').fill('Dawit Mekonnen');
  await portal.locator('#bridePhone').fill('0911 45 67 89');
  await portal.evaluate(() => { const input = document.getElementById('weddingDate'); input.value = '2027-03-20'; input.dispatchEvent(new Event('input', {bubbles:true})); input.dispatchEvent(new Event('change', {bubbles:true})); });
  for (const meal of ['breakfast', 'lunch', 'dinner']) await portal.locator(`label:has([data-meal-program="${meal}"])`).click();
  await portal.locator('#generalNotes').fill('Garden ceremony, about 300 guests');
  await portal.locator('.workflow-nav [data-step-target="1"]').click();
  await portal.locator('[data-service-toggle="venue"]').click();
  await portal.locator('[data-portal-submit]').click();
  await portal.locator('#portalDone.is-active').waitFor();
  assert.equal(await portal.locator('.portal-reference').innerText(), 'MBH-RQ-1');
  assert.equal(await portal.locator('#workflowStepCount').innerText(), 'Sent');
  await portal.screenshot({path:path.join(output, 'portal-sent-mobile.png'), fullPage:false});
  assert.deepEqual(clientCalls, [], 'The portal never touches planner records or the planning API');
  await client.close();

  // The planner sees the request on the dashboard and opens it as a plan.
  const planner = await browser.newContext({viewport:{width:1440, height:1000}, acceptDownloads:true});
  // File sharing is recorded instead of opening the system share sheet.
  await planner.addInitScript(() => {
    window.sharedFiles = [];
    navigator.canShare = data => Boolean(data?.files);
    navigator.share = async data => { window.sharedFiles.push({name:data.files?.[0]?.name, text:data.text}); };
  });
  const page = await planner.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.locator('#portalRequestsCount:visible').waitFor();
  assert.equal(await page.locator('#portalRequestsCount').innerText(), '1', 'The sidebar counts new client requests');
  await page.locator('[data-open-requests]').click();
  const card = page.locator('[data-portal-request="1"]');
  await card.waitFor();
  assert.match(await card.innerText(), /Selam Haile & Dawit Mekonnen/);
  assert.match(await card.innerText(), /0911 45 67 89/);
  assert.match(await card.innerText(), /3 Course Full Day Program/);
  assert.equal(await page.locator('.portal-link code').innerText(), `${base}/portal?lang=en`);

  // Create link: a personal message for the couple, ready for WhatsApp, Telegram, Facebook, SMS or email.
  await page.locator('.sidebar-create-link').click();
  const linkDialog = page.locator('#portalLinkDialog');
  assert.equal(await linkDialog.evaluate(dialog => dialog.open), true);
  await page.locator('#linkClientName').fill('Selam & Dawit');
  await page.locator('#linkClientPhone').fill('0911 45 67 89');
  const whatsapp = decodeURIComponent(await linkDialog.locator('.share-channel-whatsapp').getAttribute('href'));
  assert.ok(whatsapp.startsWith('https://wa.me/251911456789?text=Hello Selam & Dawit'), whatsapp);
  assert.ok(whatsapp.endsWith(`${base}/portal?lang=en`), whatsapp);
  await linkDialog.locator('[data-link-lang="am"]').click();
  assert.equal(await page.locator('#portalLinkUrl').inputValue(), `${base}/portal?lang=am`);
  assert.match(decodeURIComponent(await linkDialog.locator('.share-channel-telegram').getAttribute('href')), /ሰላም Selam & Dawit/);
  assert.match(await linkDialog.locator('.share-channel-sms').getAttribute('href'), /^sms:\+251911456789\?&body=/);
  assert.equal(await page.locator('#portalLinkLocal').isVisible(), true, 'Links to this computer carry a warning');
  await page.screenshot({path:path.join(output, 'create-link.png'), fullPage:false});
  await linkDialog.locator('[data-close-dialog]').click();
  // The couple's portal opens in the language the link was made for.
  const amPortal = await planner.newPage();
  await amPortal.goto(`${base}/portal?lang=am`, {waitUntil:'domcontentloaded'});
  await amPortal.waitForFunction(() => state.lang === 'am');
  await amPortal.close();

  await page.screenshot({path:path.join(output, 'requests-dashboard.png'), fullPage:false});
  await card.locator('[data-portal-action="import"]').click();
  await page.waitForFunction(() => state.currentStep === 0 && state.recordId);
  assert.equal(await page.locator('#brideName').inputValue(), 'Selam Haile');
  assert.equal(await page.locator('#totalFee').inputValue(), '', 'The planner adds the price');
  assert.equal(await page.evaluate(() => state.services.venue?.selected), true);

  // Blank forms from the sidebar, in the chosen language, without disturbing the open plan.
  await page.locator('[data-blank-doc="agreement"]').click();
  assert.equal(await page.locator('#blankDocHeading').innerText(), 'Download blank agreement');
  assert.equal(await download(page, () => page.locator('[data-blank-lang="en"]').click()), 'Matrimony-Blank-Agreement-EN.pdf');
  // After the download, the share options open for the same PDF.
  await page.locator('.blank-doc-share:visible').waitFor();
  await page.waitForFunction(() => window.sharedFiles.length === 1);
  assert.deepEqual(await page.evaluate(() => window.sharedFiles[0]), {name:'Matrimony-Blank-Agreement-EN.pdf', text:'Blank wedding agreement from Matrimony By Hanna.'});
  await page.locator('[data-share-blank]').click();
  await page.waitForFunction(() => window.sharedFiles.length === 2);
  await page.locator('.blank-doc-share [data-close-dialog]').click();
  await page.locator('[data-blank-doc="proforma"]').click();
  assert.equal(await page.locator('#blankDocDialog form').isVisible(), true, 'Reopening starts at the language choice');
  assert.equal(await download(page, () => page.locator('[data-blank-lang="am"]').click()), 'Matrimony-Blank-Proposal-AM.pdf');
  await page.waitForFunction(() => window.sharedFiles.length === 3);
  await page.locator('.blank-doc-share [data-close-dialog]').click();
  assert.equal(await page.locator('#blankDocDialog').evaluate(dialog => dialog.open), false);
  assert.deepEqual(await page.evaluate(() => [state.lang, state.details.brideName, state.blankDocument, document.documentElement.lang]), ['en', 'Selam Haile', false, 'en'], 'The open plan is restored after a blank download');
  // A blank document shows write-in lines instead of the open plan's details.
  const openPlan = await page.evaluate(() => ({lang:state.lang, details:state.details, services:state.services, recordId:state.recordId}));
  await page.evaluate(async () => { Object.assign(state, blankDocumentState('am')); document.documentElement.lang = 'am'; await prepareDocument('agreement'); });
  const blankText = await page.locator('#agreementDocument').innerText();
  assert.doesNotMatch(blankText, /Selam/);
  assert.match(blankText, /____________________/);
  assert.match(blankText, /ቀን/);
  await page.evaluate(plan => { Object.assign(state, plan, {blankDocument:false}); document.documentElement.lang = plan.lang; }, openPlan);

  // Once handled, the request can be dismissed.
  await page.locator('[data-open-requests]').click();
  await page.locator('[data-portal-request="1"] [data-portal-action="dismiss"]').click();
  await page.locator('.portal-requests-empty').waitFor();
  assert.deepEqual(errors, []);
  console.log('Portal workflow passed: couple-only portal, validation, submission without records access, dashboard request, open as plan, create link with WhatsApp/Telegram/SMS and language, blank EN agreement and AM proposal with share, state restored, dismiss.');
})().catch(error => { console.error(error); process.exitCode = 1; }).finally(async () => { await browser?.close(); server?.kill(); testSchema.drop(); });
