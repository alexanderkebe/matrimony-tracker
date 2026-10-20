/* Temporary Postgres schema for browser tests that start their own server.py.
   The server works only inside this schema (never the app's live tables); drop() removes it. */
const {spawnSync} = require('node:child_process');
const {randomUUID} = require('node:crypto');

const python = process.env.PYTHON || (process.platform === 'win32' ? 'py' : 'python3');
const name = `test_${randomUUID().replace(/-/g, '').slice(0, 16)}`;

function drop() {
  spawnSync(python, ['-c', 'import server, sys; server.drop_schema(sys.argv[1])', name], {stdio:'ignore', timeout:60000});
}

module.exports = {name, python, drop};
