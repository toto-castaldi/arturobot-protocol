// TypeScript emitter: what the portal imports from @arturobot/protocol.
import { at, banner } from './lib.mjs'

const q = (s) => JSON.stringify(s)
const constName = (s) => s.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase()

export function emitTs({ meta, lua, lan, cloud }) {
  const v = meta.current
  const out = [banner('//'), '']

  out.push(`export const PROTOCOL_VERSION = ${v} as const`)
  out.push(`export const PROTOCOL_MIN_SUPPORTED = 1 as const`, '')

  out.push('// A robot that does not declare a protocol is speaking version 1.')
  out.push('export function protocolOf(status: { protocol?: number }): number {')
  out.push('  return status.protocol ?? 1')
  out.push('}', '')

  const outcomes = at(lan.outcomes, v)
  out.push('export const RUN_OUTCOME = {')
  for (const o of outcomes) out.push(`  /** ${o.description} */`, `  ${o.name}: ${o.value},`)
  out.push('} as const')
  out.push('export type RunOutcome = (typeof RUN_OUTCOME)[keyof typeof RUN_OUTCOME]', '')

  out.push('export const LAN_ROUTES = {')
  for (const r of at(lan.routes, v)) {
    out.push(`  /** ${r.method} — ${r.description} */`)
    out.push(`  ${constName(r.path.replace(/^\/api\//, ''))}: ${q(r.path)},`)
  }
  out.push('} as const', '')

  out.push('export const CLOUD_ROUTES = {')
  for (const r of at(cloud.routes, v)) {
    out.push(`  /** ${r.method} — ${r.description} */`)
    out.push(`  ${constName(r.path.replace(/^\/api\/device\//, ''))}: ${q(r.path)},`)
  }
  out.push('} as const', '')

  for (const l of at(lan.limits, v)) {
    out.push(`/** ${l.description} */`, `export const ${l.name} = ${l.value}`)
  }
  out.push('')

  out.push('/** The only globals a generated Lua program may call. */')
  const fns = at(lua.functions, v)
  out.push(`export const LUA_API = [${fns.map((f) => q(f.name)).join(', ')}] as const`)
  out.push('export type LuaApiFunction = (typeof LUA_API)[number]', '')

  out.push('export const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }> = {')
  for (const f of fns) out.push(`  ${f.name}: { args: ${f.args.length}, returns: ${q(f.returns)} },`)
  out.push('}', '')

  out.push(`export const LUA_STDLIB_ALLOWED = [${at([lua.stdlib], v)[0]?.allowed.map(q).join(', ') ?? ''}] as const`, '')

  const status = lan.schemas.RobotStatus
  out.push('// Shape of GET /api/status at this protocol version.')
  out.push('export interface RobotStatus {')
  for (const f of at(status.fields, v)) {
    if (f.name.includes('.')) continue
    out.push(`  /** ${f.description} */`, `  ${f.name}${(f.since ?? 1) > 1 ? '?' : ''}: ${tsType(f.type)}`)
  }
  out.push('  sensors: { distance: number }')
  out.push('}', '')

  return out.join('\n')
}

function tsType(t) {
  if (t === 'outcome') return 'RunOutcome'
  if (t === 'integer' || t === 'number') return 'number'
  if (t.startsWith('enum:')) return t.slice(5).split('|').map(q).join(' | ')
  return t
}
