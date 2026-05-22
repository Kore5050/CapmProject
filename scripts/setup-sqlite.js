'use strict'

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const root = path.join(__dirname, '..')
const prebuild = path.join(root, 'node_modules', 'prebuild-install', 'bin.js')
const sqliteDir = path.join(root, 'node_modules', 'better-sqlite3')

const result = spawnSync(process.execPath, [prebuild], {
  cwd: sqliteDir,
  stdio: 'inherit',
})

if (result.status !== 0) {
  console.error('[setup:sqlite] prebuild-install failed')
  process.exit(result.status ?? 1)
}

require(path.join(sqliteDir, 'lib', 'index.js'))
console.log('[setup:sqlite] better-sqlite3 ready for', process.version)
