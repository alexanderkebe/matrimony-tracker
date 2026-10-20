/* Real API + browser acceptance test. Own temporary SQLite DB, synthetic data only. */
const testSchema=require('./test_schema.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {createHmac,randomUUID}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const port=Number(process.env.MATRIMONY_TEST_PORT||4189);
const base=`http://127.0.0.1:${port}`;
const secret='synthetic-browser-test-session-secret-123456789';
const output=path.resolve('tmp/planning-qa');
fs.mkdirSync(output,{recursive:true});
const token=(user,roles)=>{const payload=Buffer.from(JSON.stringify({userId:user,organizationId:'qa-org',roles,exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');return payload+'.'+createHmac('sha256',secret).update(payload).digest('hex');};
let server,browser;
const errors=[];
async function startServer(){
  server=spawn(testSchema.python, ['-u','server.py','--port',String(port)],{cwd:path.resolve('.'),env:{...process.env,MATRIMONY_DB_SCHEMA:testSchema.name, MATRIMONY_SESSION_SECRET:secret,MATRIMONY_LEGACY_ORGANIZATION_ID:'qa-org',MATRIMONY_WEDDINGS_ENABLED:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  server.stderr.on('data',()=>{});
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Test server did not start')),120000);server.stdout.on('data',chunk=>{if(String(chunk).includes('Matrimony planner:')){clearTimeout(timeout);resolve();}});server.on('exit',code=>reject(new Error('Test server exited: '+code)));});
}
async function request(method,route,body,user='qa-lead',roles=['admin','planner']){
  const response=await fetch(base+'/api/v1/'+route,{method,headers:{Authorization:'Bearer '+token(user,roles),'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:body===undefined?undefined:JSON.stringify(body)});
  const result=await response.json();assert.ok(response.ok,`${method} ${route}: ${JSON.stringify(result)}`);return result;
}
async function action(page,name,id){let locator=page.locator(`[data-wp-action="${name}"]${id?`[data-id="${id}"]`:''}`);if(await page.locator('#wpDialog').isVisible())locator=page.locator('#wpDialog').locator(`[data-wp-action="${name}"]${id?`[data-id="${id}"]`:''}`);await locator.first().click();}
async function submit(page,id='wpResourceForm'){await page.locator(`button[type=submit][form="${id}"]`).click();}
async function closed(page){await page.waitForFunction(()=>!document.getElementById('wpDialog')?.open);await page.locator('#wpTabContent').waitFor();}
async function checkLayout(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal page overflow');}

(async()=>{
  await startServer();
  browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000},acceptDownloads:true});
  // Neon is remote: activating a wedding runs hundreds of statements, so allow slow steps.
  context.setDefaultTimeout(180000);
  await context.addCookies([{name:'matrimony_session',value:token('qa-lead',['admin','planner']),url:base,sameSite:'Strict'}]);
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base+'/weddings');await page.locator('[data-wp-action=create]').waitFor();
  await action(page,'create');await page.locator('#wp-title').fill('QA Sara & Daniel');
  await action(page,'wizard-next');await page.locator('#wp-weddingDate').fill('2027-05-16');await page.locator('#wp-guestEstimate').fill('250');await page.locator('#wp-budgetMinor').fill('1500000.50');
  await action(page,'wizard-next');await page.locator('#wp-churchLocation').fill('QA ceremony');await page.locator('#wp-venueLocation').fill('QA reception');
  await action(page,'wizard-next');assert.equal(await page.locator('[data-wp-service-code]').count(),21);await action(page,'select-services','none');
  for(const code of ['CHURCH','VENUE','DECOR','COUNSELING'])await page.locator(`[data-wp-service-code="${code}"]`).check();
  await action(page,'wizard-next');assert.ok((await page.locator('#wpWizardForm').innerText()).includes('Church'));await action(page,'wizard-next');await action(page,'wizard-finish');await closed(page);
  await page.waitForURL(/\/weddings\/.+\/overview/);const weddingId=new URL(page.url()).pathname.split('/')[2];
  const dashboard=await request('GET',`weddings/${weddingId}/dashboard`);assert.equal(dashboard.services.length,4);assert.equal(dashboard.readiness.activeServices,3);assert.equal(dashboard.readiness.aftercareServices,1);assert.equal(dashboard.wedding.budgetMinor,150000050);
  await checkLayout(page);await page.screenshot({path:path.join(output,'overview-desktop.png'),fullPage:true});
  await action(page,'tab','services');await page.locator('.wp-service-card').first().waitFor();const serviceId=dashboard.services.find(s=>s.code==='CHURCH').id;
  await action(page,'service',serviceId);await action(page,'service-tab','Tasks');await page.locator('#wpDialog [data-wp-action=edit-task]').first().waitFor();assert.equal(await page.locator('#wpDialog [data-wp-action=edit-task]').count(),3);await page.keyboard.press('Escape');
  await action(page,'tab','tasks');await page.locator('#wpTabContent .wp-task-row').first().waitFor();await action(page,'edit-task');await page.locator('#wp-status').selectOption('in_progress');await submit(page);await closed(page);
  await page.locator('[data-wp-filter=q]').fill('scope');await page.waitForTimeout(600);assert.ok(await page.locator('#wpTabContent .wp-task-row').count()>=1);assert.equal(await page.locator('[data-wp-filter=q]').inputValue(),'scope');
  await action(page,'tab','budget');await page.locator('[data-wp-action=new-budget]').waitFor();await action(page,'new-budget');await page.locator('#wp-label').fill('QA venue commitment');await page.locator('#wp-estimatedMinor').fill('85000.50');await page.locator('#wp-committedMinor').fill('100000');await page.locator('#wp-actualMinor').fill('100000');await submit(page);await closed(page);
  await action(page,'new-payment');await page.locator('#wp-label').fill('QA deposit');const line=(await request('GET',`weddings/${weddingId}/budget-lines`)).items[0];await page.locator('#wp-budgetLineId').selectOption(line.id);await page.locator('#wp-amountMinor').fill('40000');await page.locator('#wp-dueOn').fill('2027-04-01');await submit(page);await closed(page);
  await action(page,'edit-payment');await page.locator('#wp-status').selectOption('paid');await page.locator('#wp-externalTransactionId').fill('qa-transaction-1');await page.locator('#wp-evidence').fill('Synthetic receipt reconciled');await page.locator('#wp-reason').fill('QA receipt');await submit(page);await closed(page);
  const financial=(await request('GET',`weddings/${weddingId}/dashboard`)).budget;assert.equal(financial.paidMinor,4000000);assert.equal(financial.outstandingMinor,6000000);
  await action(page,'tab','documents');await page.locator('.wp-document-grid').waitFor();await action(page,'upload');await page.locator('#wpUploadFile').setInputFiles({name:'qa-design.txt',mimeType:'text/plain',buffer:Buffer.from('QA first design')});await submit(page,'wpUploadForm');await page.locator('#wpDialog [data-wp-action=review-document]').waitFor();await action(page,'review-document');await page.locator('#wp-decision').selectOption('changes_requested');await page.locator('#wp-comment').fill('Please use ivory.');await submit(page,'wpReviewForm');await page.locator('#wpDialog .wp-review').waitFor();
  await action(page,'upload');await page.locator('#wpUploadFile').setInputFiles({name:'qa-design-v2.txt',mimeType:'text/plain',buffer:Buffer.from('QA ivory design')});await submit(page,'wpUploadForm');await page.locator('#wpDialog [data-wp-action=review-document]').waitFor();await action(page,'review-document');await submit(page,'wpReviewForm');await page.locator('#wpDialog .wp-state-approved').first().waitFor();assert.equal(await page.locator('#wpDialog tbody tr').count(),2);await page.keyboard.press('Escape');
  await action(page,'tab','calendar');await page.locator('.wp-calendar').waitFor();await action(page,'new-event');await page.locator('#wp-title').fill('QA shared appointment');await page.locator('#wp-startAt').fill('2027-05-16T14:00');await page.locator('#wp-endAt').fill('2027-05-16T15:00');await submit(page);await closed(page);assert.ok((await page.locator('.wp-calendar').innerText()).includes('QA shared appointment'));
  await action(page,'calendar-view','week');await page.locator('.wp-agenda-week').waitFor();assert.ok((await page.locator('.wp-agenda-week').innerText()).includes('QA shared appointment'));await action(page,'calendar-view','day');await page.locator('.wp-agenda:not(.wp-agenda-week)').waitFor();assert.ok((await page.locator('.wp-agenda').innerText()).includes('QA shared appointment'));await action(page,'calendar-view','month');await page.locator('.wp-calendar').waitFor();
  await action(page,'tab','guests');await page.locator('[data-wp-action=new-guest]').waitFor();await action(page,'new-guest');await page.locator('#wp-displayName').fill('QA household');await page.locator('#wp-partySize').fill('3');await page.locator('#wp-rsvpStatus').selectOption('accepted');await page.locator('#wp-table').fill('4');await submit(page);await closed(page);assert.ok((await page.locator('#wpTabContent').innerText()).includes('QA household'));
  await action(page,'tab','day');await page.locator('[data-wp-action=new-cue]').waitFor();await action(page,'new-cue');await page.locator('#wp-title').fill('QA ceremony entrance');await page.locator('#wp-startAt').fill('2027-05-16T08:00');await page.locator('#wp-endAt').fill('2027-05-16T08:30');await page.locator('#wp-cue').fill('Coordinate entrance with church liaison.');await submit(page);await closed(page);assert.ok((await page.locator('.wp-run-row').innerText()).includes('08:00'));
  const download=page.waitForEvent('download');await action(page,'export');const exported=await download;const exportPath=path.join(output,'offline-plan.html');await exported.saveAs(exportPath);const html=fs.readFileSync(exportPath,'utf8');assert.ok(html.includes('QA ceremony entrance'));assert.ok(!html.includes('contentBase64'));assert.ok(!html.includes('transaction-1'));assert.ok(!html.includes('100000'));
  await action(page,'date-change');await page.locator('#wp-weddingDate').fill('2027-06-16');await page.locator('#wp-reason').fill('QA preview only');await submit(page,'wpDateForm');await page.locator('#wpDatePreview .wp-preview').waitFor();assert.ok((await page.locator('#wpDatePreview').innerText()).includes('Review this impact'));assert.equal((await request('GET',`weddings/${weddingId}`)).weddingDate,'2027-05-16');await page.keyboard.press('Escape');
  await action(page,'tab','overview');await page.locator('.wp-stats').waitFor();await page.setViewportSize({width:390,height:844});await checkLayout(page);await page.screenshot({path:path.join(output,'overview-mobile.png'),fullPage:true});
  await page.locator('[data-language=am]').click();await page.waitForFunction(()=>document.documentElement.lang==='am');assert.ok((await page.locator('#weddingWorkspace').innerText()).includes('አጠቃላይ'));await checkLayout(page);await page.screenshot({path:path.join(output,'overview-amharic.png'),fullPage:true});
  await action(page,'edit-wedding');await page.locator('#wp-calendarPreference').selectOption('ethiopian');await submit(page,'wpWeddingForm');await closed(page);const isoWedding=await request('GET',`weddings/${weddingId}`);assert.equal(isoWedding.weddingDate,'2027-05-16');assert.equal(isoWedding.calendarPreference,'ethiopian');const renderedDate=await page.locator('time[datetime="2027-05-16"]').first().innerText();const expectedDate=await page.evaluate(()=>new Intl.DateTimeFormat('am-ET',{calendar:'ethiopic',timeZone:'UTC',day:'numeric',month:'short',year:'numeric'}).format(new Date('2027-05-16T12:00:00Z')));assert.equal(renderedDate,expectedDate);
  await request('POST',`weddings/${weddingId}/members`,{userId:'qa-client',name:'QA client',roles:['couple'],serviceIds:[]});
  await request('POST',`weddings/${weddingId}/budget-lines`,{label:'Shared fee',clientAmountMinor:1200000,committedMinor:987654,visibility:'client'});
  const clientContext=await browser.newContext({viewport:{width:390,height:844}});clientContext.setDefaultTimeout(180000);await clientContext.addCookies([{name:'matrimony_session',value:token('qa-client',['couple']),url:base,sameSite:'Strict'}]);const clientPage=await clientContext.newPage();clientPage.on('pageerror',e=>errors.push(e.message));await clientPage.goto(base+`/weddings/${weddingId}/budget`);await clientPage.locator('.wp-table').waitFor();const clientText=await clientPage.locator('#weddingWorkspace').innerText();assert.ok(clientText.includes('Shared fee'));assert.ok(!clientText.includes('9,876.54'));assert.equal(await clientPage.locator('.workflow-nav [data-step-target="4"]').isVisible(),false);await checkLayout(clientPage);
  const denied=await clientPage.request.get(base+'/api/records');assert.equal(denied.status(),403);
  await clientContext.close();assert.deepEqual(errors,[]);
  console.log('Wedding browser acceptance passed: wizard, service details, tasks, budgets, payments, revisions, approvals, calendar, guests, run sheet, offline export, date preview, mobile, Amharic and client permissions.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill(); testSchema.drop();});
