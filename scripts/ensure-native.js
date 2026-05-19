'use strict'

const { execSync } = require('node:child_process')

function load () {
  require('better-sqlite3')
}

try {
  load()
  console.log('[ensure-native] better-sqlite3 OK for', process.version)
} catch (err) {
  console.log('[ensure-native] Rebuilding better-sqlite3 for', process.version, '...')
  execSync('npm rebuild better-sqlite3', { stdio: 'inherit', cwd: require('node:path').join(__dirname, '..') })
  load()
  console.log('[ensure-native] Rebuild successful')
}
