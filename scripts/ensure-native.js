'use strict'

const { execSync } = require('node:child_process')
const path = require('node:path')

const root = path.join(__dirname, '..')

function load() {
  const Database = require('better-sqlite3')
  const db = new Database(':memory:')
  db.close()
}

function rebuild() {
  const node = process.execPath
  const npmCli = path.join(path.dirname(node), 'node_modules', 'npm', 'bin', 'npm-cli.js')
  console.error('[ensure-native] Rebuilding better-sqlite3 for', process.version, '...')
  execSync(`"${node}" "${npmCli}" rebuild better-sqlite3`, { stdio: 'inherit', cwd: root })
}

try {
  load()
  console.error('[ensure-native] better-sqlite3 OK for', process.version)
} catch (err) {
  rebuild()
  load()
  console.error('[ensure-native] Rebuild successful for', process.version)
}
