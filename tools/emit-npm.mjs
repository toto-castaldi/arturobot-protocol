// The npm package the portal consumes. Emitted as JavaScript plus a separate
// declaration file, not as TypeScript source: the portal pins this repository
// as a git dependency, and Vite does not pre-bundle raw .ts inside node_modules.
// Nothing here has a runtime dependency, so no compiler is involved.
import { at, banner } from './lib.mjs'

const q = (s) => JSON.stringify(s)
const constName = (s) => s.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()
const lanKey = (p) => constName(p.replace(/^\/api\//, ''))
const cloudKey = (p) => constName(p.replace(/^\/api\/device\//, ''))

const tsType = (t) => {
  if (t === 'outcome') return 'RunOutcome'
  if (t === 'integer' || t === 'number') return 'number'
  if (t.startsWith('enum:')) return t.slice(5).split('|').map(q).join(' | ')
  return t
}

// --- runtime -----------------------------------------------------------------

export function emitJs({ meta, lua, lan, cloud }) {
  const v = meta.current
  const out = [banner('//'), '']

  out.push(`export const PROTOCOL_VERSION = ${v}`)
  out.push(`export const PROTOCOL_MIN_SUPPORTED = ${meta.min_supported}`)
  out.push(`export const PROTOCOL_RELEASE = ${q(meta.release)}`, '')

  out.push('export const RUN_OUTCOME = {')
  for (const o of at(lan.outcomes, v)) out.push(`  ${o.name}: ${o.value},`)
  out.push('}', '')

  out.push('export const LAN_ROUTES = {')
  for (const r of at(lan.routes, v)) out.push(`  ${lanKey(r.path)}: ${q(r.path)},`)
  out.push('}', '')

  out.push('export const CLOUD_ROUTES = {')
  for (const r of at(cloud.routes, v)) out.push(`  ${cloudKey(r.path)}: ${q(r.path)},`)
  out.push('}', '')

  for (const l of at(lan.limits, v)) out.push(`export const ${l.name} = ${l.value}`)
  for (const l of at(cloud.limits, v)) out.push(`export const ${l.name} = ${l.value}`)
  out.push('')

  const fns = at(lua.functions, v)
  out.push(`export const LUA_API = [${fns.map((f) => q(f.name)).join(', ')}]`, '')

  out.push('export const LUA_SIGNATURES = {')
  for (const f of fns) out.push(`  ${f.name}: { args: ${f.args.length}, returns: ${q(f.returns)} },`)
  out.push('}', '')

  const stdlib = at([lua.stdlib], v)[0]
  out.push(`export const LUA_STDLIB_ALLOWED = [${(stdlib?.allowed ?? []).map(q).join(', ')}]`, '')

  return out.join('\n')
}

// --- declarations ------------------------------------------------------------

export function emitDts({ meta, lua, lan, cloud }) {
  const v = meta.current
  const out = [banner('//'), '']
  const doc = (text) => out.push(`/** ${text} */`)

  doc('Versione di protocollo parlata da questo pacchetto.')
  out.push(`export declare const PROTOCOL_VERSION: ${v}`)
  doc("La versione piu' vecchia con cui il portale parla: sotto di questa rifiuta, invece di degradare.")
  out.push(`export declare const PROTOCOL_MIN_SUPPORTED: ${meta.min_supported}`)
  doc("Il rilascio di questo contratto: il tag git e' la stessa stringa con una v davanti. E' cio' che un robot dichiara in protocolRelease.")
  out.push(`export declare const PROTOCOL_RELEASE: ${q(meta.release)}`, '')

  out.push('export declare const RUN_OUTCOME: {')
  for (const o of at(lan.outcomes, v)) {
    out.push(`  /** ${o.description} */`, `  readonly ${o.name}: ${o.value}`)
  }
  out.push('}')
  out.push('export type RunOutcome = (typeof RUN_OUTCOME)[keyof typeof RUN_OUTCOME]', '')

  out.push('export declare const LAN_ROUTES: {')
  for (const r of at(lan.routes, v)) {
    out.push(`  /** ${r.method} — ${r.description} */`, `  readonly ${lanKey(r.path)}: ${q(r.path)}`)
  }
  out.push('}', '')

  out.push('export declare const CLOUD_ROUTES: {')
  for (const r of at(cloud.routes, v)) {
    out.push(`  /** ${r.method} — ${r.description} */`, `  readonly ${cloudKey(r.path)}: ${q(r.path)}`)
  }
  out.push('}', '')

  for (const l of [...at(lan.limits, v), ...at(cloud.limits, v)]) {
    doc(l.description)
    out.push(`export declare const ${l.name}: ${l.value}`)
  }
  out.push('')

  const fns = at(lua.functions, v)
  doc('Le sole globali che un programma Lua generato puo' + "'" + ' chiamare.')
  out.push(`export declare const LUA_API: readonly [${fns.map((f) => q(f.name)).join(', ')}]`)
  out.push('export type LuaApiFunction = (typeof LUA_API)[number]', '')

  out.push('export declare const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }>', '')

  const stdlib = at([lua.stdlib], v)[0]
  doc(stdlib?.description ?? '')
  out.push(`export declare const LUA_STDLIB_ALLOWED: readonly [${(stdlib?.allowed ?? []).map(q).join(', ')}]`, '')

  // The cloud schemas are born whole at the version that introduces them, so
  // every field is required: there is no older robot that could omit one.
  for (const [name, schema] of Object.entries(cloud.schemas ?? {})) {
    const fields = at(schema.fields, v)
    if (!fields.length) continue
    out.push(`export interface ${name} {`)
    for (const f of fields) {
      out.push(`  /** ${f.description} */`, `  ${f.name}: ${tsType(f.type)}`)
    }
    out.push('}', '')
  }

  doc('La forma di `GET /api/status` a questa versione di protocollo.')
  out.push('export interface RobotStatus {')
  for (const f of at(lan.schemas.RobotStatus.fields, v)) {
    if (f.name.includes('.')) continue
    out.push(`  /** ${f.description} */`, `  ${f.name}${f.optional ? '?' : ''}: ${tsType(f.type)}`)
  }
  out.push('  sensors: { distance: number }')
  out.push('}', '')

  return out.join('\n')
}
