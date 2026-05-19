'use strict'

const { spawnSync } = require('node:child_process')
const path = require('node:path')

const root = path.join(__dirname, '..')
const major = Number(process.versions.node.split('.')[0])

if (![20, 22, 24].includes(major)) {
  console.error('')
  console.error('Unsupported Node.js version:', process.version)
  console.error('SAP CAP requires Node.js 20, 22, or 24 LTS.')
  console.error('Your terminal is using Node 23, which breaks better-sqlite3.')
  console.error('')
  console.error('Fix:  nvm use 22   (or install Node 22 LTS)')
  console.error('Then: npm run watch')
  console.error('')
  process.exit(1)
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
