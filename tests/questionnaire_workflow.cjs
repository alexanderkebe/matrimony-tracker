/* Real questionnaire → planning → service configuration → agreement, on a synthetic DB. */
const testSchema=require('./test_schema.cjs');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {spawn}=require('node:child_process');
const {createHmac,randomUUID}=require('node:crypto');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const port=Number(process.env.MATRIMONY_QUESTIONNAIRE_TEST_PORT||4192);
const base=`http://127.0.0.1:${port}`,output=path.resolve('tmp/questionnaire-qa');
const secret='synthetic-questionnaire-session-secret-123456789';
const payload=Buffer.from(JSON.stringify({userId:'qa-lead',organizationId:'qa-org',roles:['admin','planner'],exp:Math.floor(Date.now()/1000)+3600})).toString('base64url');
const token=payload+'.'+createHmac('sha256',secret).update(payload).digest('hex');
let server,browser,page;
fs.mkdirSync(output,{recursive:true});
async function startServer(){
  server=spawn(testSchema.python, ['-u','server.py','--port',String(port)],{cwd:path.resolve('.'),env:{...process.env,MATRIMONY_DB_SCHEMA:testSchema.name, MATRIMONY_SESSION_SECRET:secret,MATRIMONY_LEGACY_ORGANIZATION_ID:'qa-org',MATRIMONY_WEDDINGS_ENABLED:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  server.stderr.on('data',()=>{});
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Test server did not start')),120000);server.stdout.on('data',chunk=>{if(String(chunk).includes('Matrimony planner:')){clearTimeout(timeout);resolve();}});server.on('error',reject);server.on('exit',code=>reject(new Error('Test server exited '+code)));});
}
async function request(route,method='GET',body){
  const response=await fetch(base+route,{method,headers:{Authorization:'Bearer '+token,'Content-Type':'application/json','Idempotency-Key':randomUUID()},body:body===undefined?undefined:JSON.stringify(body)});
  const value=await response.json();assert.ok(response.ok,`${method} ${route}: ${JSON.stringify(value)}`);return value;
}
async function action(page,name,id){const selector=`[data-wp-action="${name}"]${id?`[data-id="${id}"]`:''}:visible`;let target=page.locator(selector);if(await page.locator('#wpDialog').isVisible())target=page.locator('#wpDialog').locator(selector);await target.first().click();}
async function settled(page){await page.locator('#wpTabContent').waitFor();await page.waitForFunction(()=>!document.getElementById('wpDialog')?.open);}
async function step(page,index){await page.locator(`.workflow-nav [data-step-target="${index}"]`).click();await page.locator(`.step-panel.is-active[data-step="${index}"]`).waitFor();}
async function layout(page){assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'The connected flow fits the viewport');}

(async()=>{
  await startServer();browser=await chromium.launch({channel:'msedge',headless:true});
  const context=await browser.newContext({viewport:{width:1440,height:1000}});
  // Neon is remote: planner handoffs run many statements, so allow slow steps.
  context.setDefaultTimeout(180000);
  await context.addCookies([{name:'matrimony_session',value:token,url:base,sameSite:'Strict'}]);
  await context.route('**/api/places?**',route=>{const name=new URL(route.request().url()).searchParams.get('q');return route.fulfill({json:{places:[{name,address:'Addis Ababa',lat:9.03,lon:38.76}]}});});
  page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base);await page.locator('[data-continue-planning]:not([hidden])').waitFor({state:'attached'});
  await page.locator('#brideName').fill('QA Hanna Alemu');await page.locator('#groomName').fill('QA Samuel Bekele');
  await page.locator('#bridePhone').fill('+251911000001');await page.locator('#groomPhone').fill('+251911000002');
  await page.locator('#eventDays').fill('3');await page.locator('#totalFee').evaluate(input=>{input.value='50000.50';input.dispatchEvent(new Event('input',{bubbles:true}));});await page.locator('#generalNotes').fill('QA family celebration from the questionnaire.');
  await page.evaluate(()=>{const input=document.getElementById('weddingDate');input.value='2027-05-16';input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));});
  await page.locator('label:has([data-meal-program="breakfast"])').click();await page.locator('label:has([data-meal-program="lunch"])').click();
  for(const [id,value] of [['brideAddress','QA Bole address'],['groomAddress','QA Kazanchis address']]){await page.locator(`#${id}-search`).fill(value);await page.locator(`#${id}-search`).press('Enter');await page.locator(`#${id}-results .place-result`).first().click();}
  for(const [type,value] of [['church','QA Trinity'],['hotel','QA Reception Hotel']]){await page.locator(`label:has([data-event-venue-type="${type}"])`).click();await page.locator(`#venue-${type}-search`).fill(value);await page.locator(`#venue-${type}-search`).press('Enter');await page.locator(`#venue-${type}-results .place-result`).first().click();}
  await step(page,1);
  const before=await page.locator('[data-service-card="choir"]').boundingBox();
  const selected=['church-systems','choir','food-drinks','cars-flowers','photo-video','hosts','invitation'];
  for(const id of selected)await page.locator(`[data-service-toggle="${id}"]`).click();
  const after=await page.locator('[data-service-card="choir"]').boundingBox();
  assert.equal(before.height,after.height,'Selecting a service never expands its card');
  assert.equal(await page.locator('#servicesGrid .service-options, #servicesGrid textarea, #servicesGrid select').count(),0,'The questionnaire services tab is a picker only');
  assert.equal(await page.locator('#selectedCount').innerText(),'7');
  await page.screenshot({path:path.join(output,'service-picker-desktop.png'),fullPage:true});
  await page.setViewportSize({width:320,height:844});await layout(page);await page.setViewportSize({width:1440,height:1000});
  await page.locator('[data-continue-planning]').click();await page.waitForURL(/\/weddings\/.+\/overview/);await settled(page);
  const weddingId=new URL(page.url()).pathname.split('/')[2];
  let dashboard=await request(`/api/v1/weddings/${weddingId}/dashboard`),wedding=dashboard.wedding;
  const recordId=wedding.clientId;
  assert.deepEqual(new Set(dashboard.services.map(s=>s.code)),new Set(['CHURCH','PERFORMERS','CAKE','CATERING','TRANSPORT','EQUIPMENT','INVITATIONS']));
  assert.equal(wedding.weddingDate,'2027-05-16');assert.equal(wedding.churchLocation,'QA Trinity, Addis Ababa');assert.equal(wedding.venueLocation,'QA Reception Hotel, Addis Ababa');assert.equal(wedding.budgetMinor,0);
  assert.equal(wedding.questionnaire.details.totalFee,'50000.50');assert.deepEqual(wedding.questionnaire.details.mealProgram,['breakfast','lunch']);
  assert.ok((await page.locator('#wpQuestionnaireSummary').innerText()).includes('+251911000001'));
  assert.ok((await page.locator('#wpQuestionnaireSummary').innerText()).includes('QA family celebration'));
  const tasks=await request(`/api/v1/weddings/${weddingId}/tasks?limit=100`);assert.equal(tasks.items.length,21);
  const progressTask=tasks.items.find(t=>t.templateSnapshot.code==='brief'&&dashboard.services.find(s=>s.id===t.serviceId)?.code==='TRANSPORT');
  await request(`/api/v1/weddings/${weddingId}/tasks/${progressTask.id}`,'PATCH',{version:progressTask.version,status:'done'});
  await page.reload();await page.locator('#wpQuestionnaireSummary').waitFor();await step(page,0);
  assert.equal(await page.locator('#bridePhone').inputValue(),'+251911000001');assert.equal(await page.locator('#eventDays').inputValue(),'3');assert.equal(await page.locator('#totalFee').inputValue(),'50000.50');
  await step(page,1);assert.equal(await page.locator('[data-service-toggle][aria-pressed=true]').count(),7);
  await page.locator('[data-service-toggle="choir"]').click();await page.locator('[data-service-toggle="venue"]').click();
  await page.locator('[data-continue-planning]').click();await page.waitForURL(base+`/weddings/${weddingId}/overview`);await settled(page);
  dashboard=await request(`/api/v1/weddings/${weddingId}/dashboard`);assert.equal(dashboard.services.filter(s=>s.enabled).length,7);assert.equal(dashboard.services.length,8);
  assert.equal((await request(`/api/v1/weddings/${weddingId}/tasks/${progressTask.id}`)).status,'done');
  await action(page,'tab','services');await page.locator('.wp-service-card').first().waitFor();assert.equal(await page.locator('.wp-service-card').count(),7,'Removed services are not shown as selected');
  const transport=dashboard.services.find(s=>s.code==='TRANSPORT');await action(page,'service',transport.id);await action(page,'service-details');
  await page.locator('#wp-detail-vehicle').fill('SUV');await page.locator('#wp-detail-cars').fill('3');await page.locator('[data-wp-detail-choice="riders"][value="family"]').check();await page.locator('#wp-serviceNotes').fill('QA transporter note for agreement.');
  await page.locator('[form="wpServiceDetailsForm"]').click();await page.locator('#wpDialog [data-wp-action=service-details]').waitFor();await page.keyboard.press('Escape');
  const saved=await request(`/api/records/${recordId}`);assert.equal(saved.plan.services['cars-flowers'].options.cars,'3');assert.deepEqual(saved.plan.services['cars-flowers'].options.riders,['family']);assert.equal(saved.plan.services['cars-flowers'].notes,'QA transporter note for agreement.');
  await step(page,2);await page.waitForFunction(()=>document.querySelector('#agreementDocument .letterhead-sheet')&&document.getElementById('agreementDocument').getAttribute('aria-busy')!=='true');
  assert.ok((await page.locator('#agreementDocument').innerText()).includes('QA transporter note for agreement.'));
  await step(page,5);await settled(page);assert.equal(new URL(page.url()).pathname,`/weddings/${weddingId}/overview`);
  assert.equal((await request('/api/v1/weddings')).total,1,'Continuing never creates duplicate weddings');
  await page.setViewportSize({width:390,height:844});await layout(page);await page.screenshot({path:path.join(output,'connected-overview-mobile.png'),fullPage:true});
  // Create wedding now starts an empty couple instead of the planner pop-up.
  await action(page,'all');await page.locator('[data-wp-action=create]').waitFor();await action(page,'create');await page.waitForFunction(()=>state.currentStep===0&&!state.recordId&&!state.details.brideName);
  await page.evaluate(id=>openRecord(id),recordId);await page.waitForFunction(id=>state.recordId===id,recordId);await step(page,5);await settled(page);assert.equal(new URL(page.url()).pathname,`/weddings/${weddingId}/overview`);assert.equal((await request('/api/v1/weddings')).total,1);
  const earlierPlan={lang:'en',details:{brideName:'QA Earlier',groomName:'QA Linked',weddingDate:'2027-05-16',eventDays:'1',totalFee:'1000',mealProgram:['dinner']},services:{decor:{selected:true}}};
  const earlierRecord=await request('/api/records','POST',earlierPlan);
  const earlier=await request('/api/v1/weddings','POST',{title:'Earlier linked plan',clientId:earlierRecord.id,weddingDate:'2027-05-16',selectedServiceCodes:['SOUND','DECOR']});
  await request(`/api/v1/weddings/${earlier.id}/activate`,'POST',{version:earlier.version});
  await page.goto(base+`/weddings/${earlier.id}/services`);await page.locator('.wp-service-card').first().waitFor();assert.equal(await page.locator('.wp-service-card').count(),1,'Opening an older linked plan imports its saved selection');
  const updated=await request(`/api/v1/weddings/${earlier.id}/dashboard`);assert.equal(updated.wedding.clientId,earlierRecord.id);assert.deepEqual(updated.services.filter(s=>s.enabled).map(s=>s.code),['DECOR']);
  assert.deepEqual(errors,[]);
  console.log('Questionnaire browser acceptance passed: picker only, exact service handoff, full couple context, record reuse, preserved task progress, later service configuration, agreement round trip, saved-client continuation and mobile layout.');
})().catch(async error=>{console.error(error);if(page)await page.screenshot({path:path.join(output,'failure.png'),fullPage:true}).catch(()=>{});process.exitCode=1;}).finally(async()=>{if(browser)await browser.close();if(server)server.kill(); testSchema.drop();});
