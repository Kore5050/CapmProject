'use strict'

const { execSync } = require('node:child_process')
const path = require('node:path')
const fs = require('node:fs')

const root = path.join(__dirname, '..')
const binding = path.join(root, 'node_modules', 'better-sqlite3', 'build', 'Release', 'better_sqlite3.node')

function tryLoad () {
  require('better-sqlite3')
}

function rebuild () {
  console.log('[ensure-native] Rebuilding native module for', process.version, '...')
  execSync('npm rebuild better-sqlite3 --foreground-scripts', {
    stdio: 'inherit',
    cwd: root,
    env: process.env,
  })
}

if (!fs.existsSync(path.join(root, 'node_modules', 'better-sqlite3'))) {
  console.log('[ensure-native] better-sqlite3 not installed yet (installed by @cap-js/sqlite)')
  process.exit(0)
}

try {
  tryLoad()
  console.log('[ensure-native] SQLite ready for', process.version)
} catch (err) {
  if (!fs.existsSync(binding)) {
    console.log('[ensure-native] Missing bindings:', binding)
  }
  try {
    rebuild()
    tryLoad()
    console.log('[ensure-native] SQLite ready after rebuild')
  } catch (rebuildErr) {
    console.error('')
    console.error('[ensure-native] Could not build better-sqlite3 on', process.version)
    console.error('On Windows, install build tools, then run:  npm run rebuild:sqlite')
    console.error('Or use Node.js 22 LTS:  nvm install 22 && nvm use 22')
    console.error('')
    throw rebuildErr
  }
}
