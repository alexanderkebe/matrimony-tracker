/* Couple search: names, phones, dates in both calendars, references, places, services, fee and notes.
   Run with the app served (npm run dev). Record responses are mocked; real records are untouched. */
const assert = require('node:assert/strict');
const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const base = process.env.MATRIMONY_URL || 'http://127.0.0.1:4173';
const testAccount = require('./test_account.cjs');

const records = [
  {id:12, bride_first_name:'Hanna', groom_first_name:'Samuel', wedding_date:'2026-12-12', updated_at:'2026-10-18T10:00:00+00:00',
    search:{bride_name:'Hanna Alemu', groom_name:'Samuel Bekele', phones:['+251 911 22 33 44', '0922 55 66 77'], places:['Sheraton Addis', 'Bole, Addis Ababa'],
      venue_types:['hall'], fee:'35000', event_days:'1', meals:['breakfast','lunch','dinner'], services:['venue'], notes:'Prefers ivory flowers', language:'en'}},
  {id:7, bride_first_name:'ሀና', groom_first_name:'ዳዊት', wedding_date:'2027-05-16', updated_at:'2026-10-17T10:00:00+00:00',
    search:{bride_name:'ሀና ተስፋዬ', groom_name:'ዳዊት ገብሩ', phones:['0933 44 55 66'], places:['Holy Trinity Cathedral'], venue_types:['church'],
      fee:'120000', event_days:'2', meals:['dinner'], services:[], notes:'', language:'am'}},
  {id:3, bride_first_name:'Marta', groom_first_name:'Yonas', wedding_date:'2027-01-20', updated_at:'2026-10-19T10:00:00+00:00',
    search:{bride_name:'Marta Girma', groom_name:'Yonas Tesfaye', phones:['0944 00 11 22'], places:['Hilton Addis Ababa'], venue_types:['hotel'],
      fee:'80000', event_days:'1', meals:['lunch'], services:[], notes:'Friend of Hanna from church', language:'en'}}
];

(async () => {
  const browser = await chromium.launch({channel:'msedge', headless:true});
  const context = await browser.newContext({viewport:{width:1280, height:900}});
  const account = await testAccount.create('planner');
  await account.signIn(context, base);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/api/records**', route => route.fulfill({json:{records}}));
  await page.goto(base, {waitUntil:'domcontentloaded'});
  await page.waitForFunction(() => typeof searchRecords === 'function');
  const ids = query => page.evaluate(([query, records]) => searchRecords(query, records).map(result => result.record.id), [query, records]);

  const cases = [
    ['Hanna', [12, 3], 'Name matches rank above a mention in notes'],
    ['hana', [12], 'A one-letter typo still finds the name'],
    ['samuel december', [12], 'Several words must all match'],
    ['0911223344', [12], 'Local phone format matches an international number'],
    ['+251 922 556677', [12], 'International format matches a local number'],
    ['911 22', [12], 'Partial phone numbers with spaces'],
    ['0933', [7], 'Phone prefix'],
    ['12/12/2026', [12], 'Gregorian day/month/year'],
    ['2026-12-12', [12], 'ISO date'],
    ['December 2026', [12], 'Month and year'],
    ['Tahsas', [12], 'Ethiopian month name in English'],
    ['ታኅሣሥ 3', [12], 'Ethiopian month name in Amharic'],
    ['3/4/2019', [12], 'Ethiopian calendar date as digits'],
    ['ሀና', [7], 'Amharic names'],
    ['sheraton', [12], 'Venue or address'],
    ['trinity cathedral', [7], 'Multi-word place'],
    ['MBH-PF-12-20261212', [12], 'Reference number printed on the proposal'],
    ['#7', [7], 'Record number'],
    ['35000', [12], 'Agreed fee'],
    ['full day', [12], 'Meal program'],
    ['hotel', [3], 'Venue type'],
    ['ivory', [12], 'Planning notes'],
    ['zzzz', [], 'Nothing matches unrelated text']
  ];
  for (const [query, expected, message] of cases) assert.deepEqual(await ids(query), expected, `${message}: "${query}"`);

  // The dialog shows why a couple matched, with the typed text highlighted.
  await page.evaluate(() => { state.records = null; });
  await page.locator('#openSearchButton').click();
  await page.locator('#weddingSearchInput').fill('0911 22');
  await page.waitForFunction(() => document.querySelectorAll('#weddingSearchResults [data-search-record]').length === 1);
  const result = page.locator('#weddingSearchResults [data-search-record="12"]');
  assert.match(await result.locator('.search-result-name').innerText(), /Hanna Alemu & Samuel Bekele/);
  assert.equal(await result.locator('.search-detail').textContent(), 'Phone+251 911 22 33 44');
  assert.equal(await result.locator('.search-detail mark').innerText(), '911 22', 'Typed phone digits are highlighted across spaces and prefixes');
  await page.locator('#weddingSearchInput').fill('sheraton');
  await page.waitForFunction(() => document.querySelector('#weddingSearchResults .search-detail mark')?.textContent === 'Sheraton');
  await page.locator('#closeSearchButton').click();
  await page.waitForFunction(() => !document.getElementById('searchDialog').open);

  // The Records page uses the same search.
  await page.locator('.recent-heading [data-step-target="4"]').click();
  await page.locator('#recordsSearch').fill('0944');
  await page.waitForFunction(() => document.querySelectorAll('#recordsList .record-card').length === 1);
  assert.match(await page.locator('#recordsList .record-card h2').innerText(), /Marta Girma/);
  assert.deepEqual(errors, []);
  await browser.close();
  await account.remove();
  console.log(`Record search passed: ${cases.length} queries across names, typos, phones, both calendars, references, places, services, fee, meals and notes, plus dialog and Records page.`);
})().catch(error => { console.error(error); process.exit(1); });
