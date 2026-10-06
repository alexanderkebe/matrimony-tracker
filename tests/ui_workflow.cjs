/* Run with Playwright installed, or set PLAYWRIGHT_MODULE to its package path. */
const assert = require('node:assert/strict');
const fs = require('node:fs');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MATRIMONY_URL || 'http://127.0.0.1:4173';
const output = 'tmp/pdfs/workflow';
fs.mkdirSync(output, {recursive:true});

(async () => {
  const browser = await chromium.launch({channel:'msedge',headless:true});
  const context = await browser.newContext({viewport:{width:1440,height:1000}, acceptDownloads:true});
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const records = new Map();
  let nextId = 1;
  let offlineRecords = false;
  const place = {name:'Holy Trinity Cathedral',address:'Addis Ababa, Ethiopia',lat:9.0303,lon:38.7612};
  await context.route('**/api/places?**', route => route.fulfill({json:{places:[place]}}));
  await context.route('**/api/records**', async route => {
    if (offlineRecords) return route.fulfill({status:503,json:{error:'Records unavailable'}});
    const request = route.request(), id = Number(new URL(request.url()).pathname.split('/')[3]);
    if (request.method() === 'POST' || request.method() === 'PUT') {
      const savedId = id || nextId++;
      records.set(savedId,request.postDataJSON());
      return route.fulfill({json:{id:savedId}});
    }
    if (id) return route.fulfill({json:{id,plan:records.get(id)}});
    return route.fulfill({json:{records:[...records].map(([id,plan]) => ({id,bride_first_name:plan.details.brideName.trim().split(/\s+/)[0],groom_first_name:plan.details.groomName.trim().split(/\s+/)[0],wedding_date:plan.details.weddingDate}))}});
  });
  async function nav(step) {await page.locator(`.workflow-nav [data-step-target="${step}"]`).click();}
  async function ready(kind) {await page.waitForFunction(kind => document.querySelector(`#${kind}Document .letterhead-sheet`) && document.querySelector(`#${kind}Document`).getAttribute('aria-busy') !== 'true',kind);}
  async function download(kind, filename) {
    await ready(kind);
    const expectedPages = await page.locator(`#${kind}Document .letterhead-sheet`).count();
    await page.evaluate(() => window.letterheadDraws = 0);
    const event = page.waitForEvent('download',{timeout:60000});
    await page.locator(`[data-download-pdf="${kind}"]`).click();
    const result = await event;
    await result.saveAs(`${output}/${filename}.pdf`);
    assert.equal(await result.failure(),null);
    await page.waitForFunction(() => !document.querySelector('[data-download-pdf]:disabled'));
    assert.ok(result.suggestedFilename().endsWith('.pdf'));
    assert.equal(fs.readFileSync(`${output}/${filename}.pdf`).subarray(0,4).toString(),'%PDF');
    assert.equal(await page.evaluate(() => window.letterheadDraws), expectedPages, 'Original letterhead must be embedded on every PDF page');
  }
  try {
    await page.goto(base);
    assert.equal(await page.locator('.workflow-nav [data-step-target]').count(),6,'All six destinations share one navigation bar');
    assert.equal(await page.locator('#workflowStepCount').innerText(),'01 / 06');
    for (const width of [1548,1440,1126,1024,768,390,320]) {
      await page.setViewportSize({width,height:900});
      const layout = await page.evaluate(() => {
        const nav = document.querySelector('.workflow-nav');
        const navRect = nav.getBoundingClientRect();
        const items = [...nav.querySelectorAll('.step-link')].map(button => {
          const buttonRect = button.getBoundingClientRect();
          const title = button.querySelector('strong').getBoundingClientRect();
          return {left:buttonRect.left,right:buttonRect.right,top:buttonRect.top,bottom:buttonRect.bottom,titleLeft:title.left,titleRight:title.right,hasSubtitle:Boolean(button.querySelector('small'))};
        });
        return {navLeft:navRect.left,navRight:navRect.right,scrollWidth:document.documentElement.scrollWidth,items};
      });
      assert.ok(layout.navLeft >= 0 && layout.navRight <= width, `Navigation stays inside the viewport at ${width}px`);
      assert.ok(layout.scrollWidth <= width, `Navigation adds no horizontal page overflow at ${width}px`);
      assert.ok(layout.items.every(item => item.left >= layout.navLeft && item.right <= layout.navRight));
      assert.ok(layout.items.every(item => item.titleLeft >= item.left && item.titleRight <= item.right && !item.hasSubtitle), `Navigation step labels are contained and subtitle-free at ${width}px`);
      assert.ok(layout.items.every((item, index) => layout.items.slice(index + 1).every(other => item.right <= other.left || other.right <= item.left || item.bottom <= other.top || other.bottom <= item.top)), `Navigation buttons do not overlap at ${width}px`);
      if (width === 1126) await page.screenshot({path:`${output}/workflow-nav-1126.png`,fullPage:false});
    }
    await page.setViewportSize({width:1440,height:1000});
    await page.evaluate(() => {
      const OriginalPDF = window.jspdf.jsPDF;
      window.jspdf.jsPDF = function(...args) {
        const pdf = new OriginalPDF(...args);
        const addImage = pdf.addImage.bind(pdf);
        pdf.addImage = (...imageArgs) => { if (imageArgs[6] === 'matrimony-letterhead') window.letterheadDraws++; return addImage(...imageArgs); };
        return pdf;
      };
    });
    await nav(3);
    assert.equal(await page.locator('.step-panel.is-active').getAttribute('data-step'),'0');
    assert.match(await page.locator('#validationSummary').innerText(),/Enter a name/);
    await page.locator('#brideName').fill('  Hanna   Alemu');
    await page.locator('#groomName').fill('Samuel Bekele');
    assert.equal(await page.locator('#sidebarCoupleName').innerText(),'Hanna & Samuel');
    await page.locator('#weddingDate').locator('..').locator('.picker-trigger').click();
    await page.locator('[data-calendar="year"]').selectOption('2026');
    await page.locator('[data-calendar="month"]').selectOption('11');
    await page.locator('[data-date="2026-12-12"]').click();
    assert.equal(await page.locator('#weddingDate').inputValue(),'2026-12-12');
    await page.locator('#weddingTime').locator('..').locator('.picker-trigger').click();
    await page.locator('[data-time="hour"]').selectOption('11');
    await page.locator('[data-time="minute"]').selectOption('45');
    await page.locator('[data-period="PM"]').click();
    await page.locator('[data-picker="apply"]').click();
    assert.equal(await page.locator('#weddingTime').inputValue(),'23:45');
    await page.locator('#weddingTime').locator('..').locator('.picker-trigger').click();
    await page.locator('[data-time="hour"]').selectOption('12');
    await page.locator('[data-time="minute"]').selectOption('0');
    await page.locator('[data-period="AM"]').click();
    await page.locator('[data-picker="apply"]').click();
    assert.equal(await page.locator('#weddingTime').inputValue(),'00:00');
    await page.locator('#eventDays').fill('3');
    assert.equal(await page.locator('#eventLocation').count(),0,'The redundant city field is removed for Addis-only planning');
    await page.locator('#brideAddress-search').fill('Bole Addis Ababa');
    await page.locator('#brideAddress-search').press('Enter');
    await page.locator('#brideAddress-results .place-result').click();
    await page.locator('#groomAddress-search').fill('Kazanchis Addis Ababa');
    await page.locator('#groomAddress-search').press('Enter');
    await page.locator('#groomAddress-results .place-result').click();
    await page.locator('.event-venue-type-grid label').filter({has:page.locator('[data-event-venue-type="church"]')}).click();
    await page.locator('.event-venue-type-grid label').filter({has:page.locator('[data-event-venue-type="hall"]')}).click();
    await page.locator('#venue-church-search').fill('Holy Trinity');
    await page.locator('#venue-church-search').press('Enter');
    await page.locator('#venue-church-results .place-result').click();
    assert.equal(await page.evaluate(() => state.details.locations['venue-church'].lat),9.0303);
    assert.match(await page.locator('[data-map-kind="event-venue"] iframe').first().getAttribute('src'),/google\.com\/maps\?q=9.0303%2C38.7612/);
    await page.locator('#venue-hall-search').fill('Sheraton Addis');
    await page.locator('#venue-hall-search').press('Enter');
    await page.locator('#venue-hall-results .place-result').click();
    assert.equal(await page.evaluate(() => state.details.eventVenueTypes.join(',')),'church,hall');
    await nav(3);
    assert.equal(await page.locator('.step-panel.is-active').getAttribute('data-step'),'0','Documents require the overall agreed fee');
    assert.equal(await page.locator('#totalFee').getAttribute('aria-invalid'),'true');
    await page.locator('#totalFee').fill('35000');
    await page.locator('.media-consent-field label').first().click();
    await page.locator('[data-next-step="1"]').click();
    await page.locator('[data-service-toggle="premarital"]').click();
    await page.locator('[data-service-toggle="venue"]').click();
    await page.locator('#scopeFullPlanning').check();
    await nav(4);
    assert.equal(await page.locator('.step-panel.is-active').getAttribute('data-step'),'4');
    await ready('proforma');
    assert.equal(await page.locator('#proformaDocument .proforma-totals > div').count(),1);
    assert.equal(await page.locator('#proformaDocument .proforma-item b').count(),0,'Proforma must not show per-service prices');
    assert.match(await page.locator('#proformaDocument').innerText(),/35,000 ETB/);
    assert.equal(await page.locator('#proformaDocument .proforma-item').count(),2);
    await nav(0);
    await page.evaluate(() => window.scrollTo(0,0));
    await page.waitForTimeout(250);
    await page.screenshot({path:`${output}/planner-desktop.png`,fullPage:true});
    await nav(3);
    await ready('agreement');
    assert.equal(await page.locator('#agreementDocument .event-venue-document-row').count(),2);
    assert.match(await page.locator('#agreementDocument').innerText(),/Wedding & Premarital Service Agreement/);
    assert.match(await page.locator('#agreementDocument').innerText(),/Full wedding planning & coordination/);
    assert.match(await page.locator('#agreementDocument').innerText(),/40% advance payment/);
    assert.match(await page.locator('#agreementDocument').innerText(),/We consent to promotional use of wedding photos and videos/);
    await page.waitForFunction(() => document.querySelector('#recentCouples').textContent.includes('Hanna'));
    assert.equal(records.size,1);
    await download('agreement','agreement-en');
    await nav(4);
    await ready('proforma');
    assert.match(await page.locator('#proformaDocument').innerText(),/Thank you for choosing Matrimony By Hanna/);
    await download('proforma','proforma-en');
    assert.equal(records.size,1,'Proforma should update the same record');
    await nav(0);
    await page.locator('#bridePhone').fill('+251 900 000 001');
    assert.match(await page.locator('#sidebarCoupleMeta').innerText(),/Unsaved changes/);
    await page.locator('.couple-context [data-save-record]').click();
    await page.waitForFunction(() => document.querySelector('#sidebarCoupleMeta').textContent.includes('Saved record'));
    await page.locator('.recent-couple').click();
    await page.waitForFunction(() => !openingRecord && !document.querySelector('.app-shell').inert);
    assert.equal(await page.locator('#bridePhone').inputValue(),'+251 900 000 001');
    assert.equal(await page.evaluate(() => state.details.locations['venue-church'].lon),38.7612);
    assert.equal(await page.evaluate(() => state.details.locations.brideAddress.lat),9.0303);
    assert.equal(await page.evaluate(() => state.details.locations.groomAddress.lat),9.0303);
    // Long, bilingual document and real download verification. Records are mocked, never live.
    await page.evaluate(() => { services.forEach(service => {getServiceState(service.id).selected=true;});state.details.totalFee='210000';state.details.brideName='ሀና አለሙ';state.details.groomName='ሳሙኤል በቀለ';state.details.mediaConsent='no';document.getElementById('totalFee').value='210000';document.getElementById('brideName').value=state.details.brideName;document.getElementById('groomName').value=state.details.groomName;syncContractChoicesToForm();state.lang='am';applyLocalization();saveDraft(); });
    await nav(3);
    assert.equal(await page.locator('#agreementDocument .agreed-services-list li').count(),20,'Every selected add-on must appear once across agreement pages');
    await download('agreement','agreement-am-all-services');
    await nav(4);
    await download('proforma','proforma-am-all-services');
    assert.equal(await page.locator('#proformaDocument .proforma-item').count(),21);
    assert.equal(await page.locator('#proformaDocument .proforma-totals > div').count(),1);
    assert.equal(await page.locator('#proformaDocument .proforma-item b').count(),0);
    assert.ok(await page.evaluate(() => document.querySelector('#proformaDocument .proforma-totals').closest('.letterhead-sheet') === document.querySelector('#proformaDocument .proforma-gratitude').closest('.letterhead-sheet')), 'Quote totals and gratitude must stay together');
    const pageCount = await page.locator('#proformaDocument .letterhead-sheet').count();
    assert.ok(pageCount >= 2);
    // Record failure must not stop a document or PDF.
    offlineRecords=true;
    await page.evaluate(() => {state.lang='en';applyLocalization();});
    await nav(3);
    await download('agreement','agreement-records-offline');
    // Mobile navigation, popover bounds, and unchanged document layout.
    await page.setViewportSize({width:390,height:844});
    await page.evaluate(() => window.scrollTo(0,0));
    await page.screenshot({path:`${output}/workflow-mobile-nav.png`,fullPage:false});
    const navBoxes = await page.locator('.workflow-nav [data-step-target]').evaluateAll(buttons => buttons.map(button => {const r=button.getBoundingClientRect();return {left:r.left,right:r.right,top:r.top,bottom:r.bottom};}));
    assert.ok(navBoxes.every(box => box.left >= 0 && box.right <= 390));
    assert.ok(navBoxes[3].top > navBoxes[0].top,'Narrow navigation reflows into compact rows');
    await page.locator('.workflow-nav [data-step-target="0"]').click();
    await page.locator('#weddingDate').locator('..').locator('.picker-trigger').click();
    const bounds=await page.locator('#pickerPopover').boundingBox();
    assert.ok(bounds.x>=0 && bounds.x+bounds.width<=390);
    await page.screenshot({path:`${output}/calendar-mobile.png`,fullPage:false});
    await page.keyboard.press('Escape');
    await page.locator('.workflow-nav [data-step-target="4"]').click();
    await download('proforma','proforma-mobile');
    assert.equal(await page.locator('#proformaDocument .letterhead-sheet').count(),pageCount);
    // Printing remains available, targets the correct document, and restores the UI.
    await page.evaluate(() => {window.print = () => {window.printedTarget = document.querySelector('.is-print-target')?.id; window.dispatchEvent(new Event('afterprint'));};});
    await page.locator('#printProformaButton').click();
    await page.waitForFunction(() => window.printedTarget === 'step-proforma');
    assert.equal(await page.locator('body.print-mode').count(),0);
    await page.locator('.workflow-nav [data-step-target="3"]').click();
    await ready('agreement');
    await page.locator('#printAgreementButton').click();
    await page.waitForFunction(() => window.printedTarget === 'step-agreement');
    assert.equal(await page.locator('body.print-mode').count(),0);
    assert.deepEqual(errors,[]);
    console.log(JSON.stringify({passed:true,records:records.size,proformaPages:pageCount,downloads:6,pageErrors:errors}));
  } finally {await browser.close();}
})().catch(error => {console.error(error);process.exitCode=1;});
