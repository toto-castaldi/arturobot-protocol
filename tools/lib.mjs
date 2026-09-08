// Source of truth loading and the version filter every emitter shares.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const read = (...p) => JSON.parse(readFileSync(join(ROOT, ...p), 'utf8'))

export function load() {
  return {
    meta: read('protocol', 'meta.json'),
    lua: read('protocol', 'lua-api.json'),
    lan: read('protocol', 'lan-api.json'),
    cloud: read('protocol', 'cloud-api.json'),
    compatibility: read('compatibility.json'),
  }
}

// An entry belongs to protocol version `v` when it was introduced at or before
// `v` and has not been withdrawn yet. This is the only place the rule lives.
export const liveAt = (v) => (e) =>
  (e.since ?? 1) <= v && (e.until === undefined || e.until > v)

export const at = (list, v) => (list ?? []).filter(liveAt(v))

export const banner = (comment) =>
  [
    `${comment} Generato da arturobot-protocol. Non modificare a mano.`,
    `${comment} La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs`,
  ].join('\n')
