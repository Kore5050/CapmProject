'use strict'

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const root = path.join(__dirname, '..')
const major = Number(process.versions.node.split('.')[0])

if (major === 23) {
  console.warn('')
  console.warn('Warning: Node.js 23 is not officially supported by SAP CAP.')
  console.warn('If SQLite fails, switch to Node 22 LTS:  nvm use 22')
  console.warn('')
}

require('./ensure-native.js')

const cdsBin = path.join(root, 'node_modules', '@sap', 'cds-dk', 'bin', 'cds.js')
const args = ['watch', ...process.argv.slice(2)]
const result = spawnSync(process.execPath, [cdsBin, ...args], {
  cwd: root,
  stdio: 'inherit',
  env: process.env,
})

process.exit(result.status ?? 1)
