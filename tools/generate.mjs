// Regenerates everything under generated/. With --check it regenerates in
// memory and fails when the committed output differs: that is the CI gate that
// makes "someone edited the generated file by hand" impossible to merge.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import { ROOT, load } from './lib.mjs'
import { emitJs, emitDts } from './emit-npm.mjs'
import { emitCpp } from './emit-cpp.mjs'
import { emitSite } from './emit-site.mjs'

const check = process.argv.includes('--check')
const model = load()

const artifacts = [
  ['generated/npm/index.js', emitJs(model)],
  ['generated/npm/index.d.ts', emitDts(model)],
  ['generated/cpp/arturobot_protocol.h', emitCpp(model)],
  ['generated/site/index.html', emitSite(model)],
]

let stale = []
for (const [rel, content] of artifacts) {
  const path = join(ROOT, rel)
  if (check) {
    let current = null
    try { current = readFileSync(path, 'utf8') } catch {}
    if (current !== content) stale.push(rel)
  } else {
    mkdirSync(join(path, '..'), { recursive: true })
    writeFileSync(path, content)
    console.log(`scritto  ${rel}`)
  }
}

if (check) {
  if (stale.length) {
    console.error('Artefatti non allineati alla sorgente:')
    for (const s of stale) console.error(`  ${s}`)
    console.error('\nEsegui: node tools/generate.mjs')
    process.exit(1)
  }
  console.log('generated/ e\' allineato alla sorgente')
}
