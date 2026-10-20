/* Runs the existing browser suites with a dedicated local test server. */
const testSchema=require('./test_schema.cjs');
const {spawn}=require('node:child_process');
const path=require('node:path');
const fs=require('node:fs');
const {randomUUID}=require('node:crypto');
const port=Number(process.env.MATRIMONY_LEGACY_TEST_PORT||4191);
const output=path.resolve('tmp/legacy-regressions');
fs.mkdirSync(output,{recursive:true});
let server;
async function run(script){
  await new Promise((resolve,reject)=>{
    const child=spawn(process.execPath,[script],{cwd:path.resolve('.'),env:{...process.env,MATRIMONY_DB_SCHEMA:testSchema.name, MATRIMONY_URL:`http://127.0.0.1:${port}`},windowsHide:true,stdio:'inherit'});
    child.on('error',reject);child.on('exit',code=>code===0?resolve():reject(new Error(`${script} exited ${code}`)));
  });
}
(async()=>{
  server=spawn(testSchema.python, ['-u','server.py','--port',String(port)],{cwd:path.resolve('.'),env:{...process.env,MATRIMONY_SESSION_SECRET:'',MATRIMONY_WEDDINGS_ENABLED:'1'},windowsHide:true,stdio:['ignore','pipe','pipe']});
  server.stderr.on('data',()=>{});
  await new Promise((resolve,reject)=>{const timeout=setTimeout(()=>reject(new Error('Test server did not start')),120000);server.stdout.on('data',chunk=>{if(String(chunk).includes('Matrimony planner:')){clearTimeout(timeout);resolve();}});server.on('error',reject);server.on('exit',code=>reject(new Error('Test server exited '+code)));});
  // Both suites share this HTTP server and repeatedly load large PDF/font assets.
  await run('tests/ui_workflow.cjs');
  await run('tests/venue_picker.cjs');
  await run('tests/record_search.cjs');
  console.log('Legacy agreement, proforma, records and venue regressions passed.');
})().catch(error=>{console.error(error);process.exitCode=1;}).finally(()=>{if(server)server.kill(); testSchema.drop();});
