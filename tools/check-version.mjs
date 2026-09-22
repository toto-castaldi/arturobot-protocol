// Fails when the contract changed against a base ref and the release did not
// go up. "The contract" is what a tag hands to the two sides: the source in
// protocol/ and the artifacts in generated/, so an emitter change that alters
// the header counts as much as an edited route.
//
//   node tools/check-version.mjs origin/main
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT } from './lib.mjs'

const base = process.argv[2]
if (!base) {
  console.error('Uso: node tools/check-version.mjs <ref di base>')
  process.exit(2)
}

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' })

const mergeBase = git('merge-base', base, 'HEAD').trim()
const changed = git('diff', '--name-only', mergeBase, 'HEAD', '--', 'protocol', 'generated')
  .split('\n')
  .filter(Boolean)

if (!changed.length) {
  console.log('Il contratto non cambia: la version puo\' restare dov\'e\'')
  process.exit(0)
}

const parse = (v) => {
  const m = /^(\d+)\.(\d+)\.(\d+)$/.exec(v)
  if (!m) throw new Error(`version non valida: ${v}`)
  return m.slice(1).map(Number)
}

const greater = (a, b) => {
  for (let i = 0; i < 3; i++) if (a[i] !== b[i]) return a[i] > b[i]
  return false
}

const before = JSON.parse(git('show', `${mergeBase}:package.json`)).version
const after = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')).version

if (!greater(parse(after), parse(before))) {
  console.error(`Il contratto cambia ma la version resta ${after} (su ${base} e' ${before}).`)
  console.error('File cambiati:')
  for (const f of changed) console.error(`  ${f}`)
  console.error('\nAlza la version in package.json e rigenera: node tools/generate.mjs')
  process.exit(1)
}

console.log(`Il contratto cambia e la version sale: ${before} -> ${after}`)
