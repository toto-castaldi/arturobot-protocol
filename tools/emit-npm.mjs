// The npm package the portal consumes. Emitted as JavaScript plus a separate
// declaration file, not as TypeScript source: the portal pins this repository
// as a git dependency, and Vite does not pre-bundle raw .ts inside node_modules.
// Nothing here has a runtime dependency, so no compiler is involved.
import { banner, errorsOf, limitsFor } from './lib.mjs'

const q = (s) => JSON.stringify(s)
const constName = (s) => s.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()
const lanKey = (p) => constName(p.replace(/^\/api\//, ''))
const cloudKey = (p) => constName(p.replace(/^\/api\/device\//, ''))

const tsType = (t) => {
  if (t === 'outcome') return 'RunOutcome'
  if (t === 'integer' || t === 'number') return 'number'
  if (t === 'url') return 'string'
  if (t.startsWith('enum:')) return t.slice(5).split('|').map(q).join(' | ')
  return t
}

/**
 * Fields into the shape they describe, dots included.
 *
 * `sensors.distance` is one field of the source and a nested object of the
 * result. It used to be skipped here and the object written by hand at the
 * bottom of the interface, which meant a second sensor would have been
 * declared in the contract and missing from the type.
 */
function nest(fields) {
  const root = new Map()

  for (const field of fields) {
    const parts = field.name.split('.')
    let node = root

    for (const part of parts.slice(0, -1)) {
      if (!(node.get(part) instanceof Map)) node.set(part, new Map())
      node = node.get(part)
    }

    node.set(parts[parts.length - 1], field)
  }

  return root
}

function renderFields(node, pad) {
  const out = []

  for (const [key, value] of node) {
    if (value instanceof Map) {
      out.push(`${pad}${key}: {`, ...renderFields(value, `${pad}  `), `${pad}}`)
    } else {
      out.push(`${pad}/** ${value.description} */`)
      out.push(`${pad}${key}${value.optional ? '?' : ''}: ${tsType(value.type)}`)
    }
  }

  return out
}

// --- runtime -----------------------------------------------------------------

export function emitJs({ release, errors, lua, lan, cloud }) {
  const out = [banner('//'), '']

  out.push(`export const PROTOCOL_RELEASE = ${q(release)}`, '')

  out.push('export const RUN_OUTCOME = {')
  for (const o of lan.outcomes) out.push(`  ${o.name}: ${o.value},`)
  out.push('}', '')

  out.push('export const LAN_ROUTES = {')
  for (const r of lan.routes) out.push(`  ${lanKey(r.path)}: ${q(r.path)},`)
  out.push('}', '')

  out.push('export const CLOUD_ROUTES = {')
  for (const r of cloud.routes) out.push(`  ${cloudKey(r.path)}: ${q(r.path)},`)
  out.push('}', '')

  out.push(`export const ERROR_FIELD = ${q(errors.field)}`)
  out.push(`export const LAN_ERRORS = [${errorsOf(lan).map((e) => q(e.code)).join(', ')}]`)
  out.push(`export const CLOUD_ERRORS = [${errorsOf(cloud).map((e) => q(e.code)).join(', ')}]`, '')

  out.push(`export const DEVICE_AUTH_HEADER = ${q(cloud.auth.header)}`)
  out.push(`export const DEVICE_AUTH_SCHEME = ${q(cloud.auth.scheme)}`, '')

  for (const l of limitsFor(lan, 'portal')) out.push(`export const ${l.name} = ${l.value}`)
  for (const l of limitsFor(cloud, 'portal')) out.push(`export const ${l.name} = ${l.value}`)
  out.push('')

  const fns = lua.functions
  out.push(`export const LUA_API = [${fns.map((f) => q(f.name)).join(', ')}]`, '')

  out.push('export const LUA_SIGNATURES = {')
  for (const f of fns) out.push(`  ${f.name}: { args: ${f.args.length}, returns: ${q(f.returns)} },`)
  out.push('}', '')

  out.push(`export const LUA_STDLIB_ALLOWED = [${lua.stdlib.allowed.map(q).join(', ')}]`, '')

  return out.join('\n')
}

// --- declarations ------------------------------------------------------------

export function emitDts({ release, errors, lua, lan, cloud }) {
  const out = [banner('//'), '']
  const doc = (text) => out.push(`/** ${text} */`)

  doc("Il rilascio di questo contratto: il tag git e' la stessa stringa con una v davanti. E' cio' che un robot dichiara in protocolRelease e il portale in serverRelease.")
  out.push(`export declare const PROTOCOL_RELEASE: ${q(release)}`, '')

  out.push('export declare const RUN_OUTCOME: {')
  for (const o of lan.outcomes) {
    out.push(`  /** ${o.description} */`, `  readonly ${o.name}: ${o.value}`)
  }
  out.push('}')
  out.push('export type RunOutcome = (typeof RUN_OUTCOME)[keyof typeof RUN_OUTCOME]', '')

  out.push('export declare const LAN_ROUTES: {')
  for (const r of lan.routes) {
    out.push(`  /** ${r.method} — ${r.description} */`, `  readonly ${lanKey(r.path)}: ${q(r.path)}`)
  }
  out.push('}', '')

  out.push('export declare const CLOUD_ROUTES: {')
  for (const r of cloud.routes) {
    out.push(`  /** ${r.method} — ${r.description} */`, `  readonly ${cloudKey(r.path)}: ${q(r.path)}`)
  }
  out.push('}', '')

  doc(errors.description)
  out.push(`export declare const ERROR_FIELD: ${q(errors.field)}`, '')

  for (const [name, contract] of [['LAN_ERRORS', lan], ['CLOUD_ERRORS', cloud]]) {
    const codes = errorsOf(contract)
    doc(`I codici che ${contract.contract} puo' rispondere, nel campo ${errors.field}.`)
    out.push(`export declare const ${name}: readonly [${codes.map((e) => q(e.code)).join(', ')}]`)
    out.push(`export type ${name === 'LAN_ERRORS' ? 'LanError' : 'CloudError'} = (typeof ${name})[number]`, '')
  }

  doc(cloud.auth.description)
  out.push(`export declare const DEVICE_AUTH_HEADER: ${q(cloud.auth.header)}`)
  out.push(`export declare const DEVICE_AUTH_SCHEME: ${q(cloud.auth.scheme)}`, '')

  for (const l of [...limitsFor(lan, 'portal'), ...limitsFor(cloud, 'portal')]) {
    doc(l.description)
    out.push(`export declare const ${l.name}: ${l.value}`)
  }
  out.push('')

  const fns = lua.functions
  doc('Le sole globali che un programma Lua generato puo' + "'" + ' chiamare.')
  out.push(`export declare const LUA_API: readonly [${fns.map((f) => q(f.name)).join(', ')}]`)
  out.push('export type LuaApiFunction = (typeof LUA_API)[number]', '')

  out.push('export declare const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }>', '')

  doc(lua.stdlib.description)
  out.push(`export declare const LUA_STDLIB_ALLOWED: readonly [${lua.stdlib.allowed.map(q).join(', ')}]`, '')

  // Every field is required unless it says otherwise, and `optional` is a
  // reason of the field's own: there is no older robot that could omit one.
  for (const contract of [lan, cloud]) {
    for (const [name, schema] of Object.entries(contract.schemas ?? {})) {
      if (schema.description) doc(schema.description)
      out.push(`export interface ${name} {`, ...renderFields(nest(schema.fields), '  '), '}', '')
    }
  }

  return out.join('\n')
}
