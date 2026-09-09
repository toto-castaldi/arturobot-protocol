// C++ emitter: the header the firmware includes. Kept to constants only —
// no allocation, no String, nothing that costs RAM on an ESP32.
import { at, banner } from './lib.mjs'

const q = (s) => JSON.stringify(s)
const constName = (s) => s.replace(/[^a-zA-Z0-9]+/g, '_').toUpperCase().replace(/^_+/, '')

export function emitCpp({ meta, lua, lan, cloud }) {
  const v = meta.current
  const out = [banner('//'), '', '#pragma once', '', '#include <stddef.h>', '']

  out.push(`#define ARTUROBOT_PROTOCOL_VERSION ${v}`)
  // What the firmware repeats in /api/status as "protocolRelease": the number
  // alone cannot tell two firmwares built against different shapes apart.
  out.push(`#define ARTUROBOT_PROTOCOL_RELEASE ${q(meta.release)}`, '')
  out.push('namespace arturobot {', '')

  out.push('// Outcome of the last run, reported in /api/status as "result".')
  out.push('enum RunOutcome {')
  for (const o of at(lan.outcomes, v)) out.push(`  RUN_${o.name} = ${o.value},  // ${o.description}`)
  out.push('};', '')

  for (const l of [...at(lan.limits, v), ...at(cloud.limits, v)]) {
    out.push(`// ${l.description}`, `static const size_t ${l.name} = ${l.value};`, '')
  }

  out.push('// Local HTTP API served by the robot.')
  for (const r of at(lan.routes, v)) {
    out.push(`static const char *ROUTE_${constName(r.path.replace(/^\/api\//, ''))} = ${q(r.path)};  // ${r.method}`)
  }
  out.push('')

  const cloudRoutes = at(cloud.routes, v)
  if (cloudRoutes.length) {
    out.push('// Cloud API the robot calls when in STA mode.')
    for (const r of cloudRoutes) {
      out.push(`static const char *CLOUD_${constName(r.path.replace(/^\/api\/device\//, ''))} = ${q(r.path)};  // ${r.method}`)
    }
    out.push('')
  }

  const fns = at(lua.functions, v)
  out.push('// Globals the firmware must register in every lua_State. The list is')
  out.push('// generated: a function added here but not implemented fails to link.')
  out.push(`static const size_t LUA_API_COUNT = ${fns.length};`)
  out.push(`static const char *LUA_API_NAMES[LUA_API_COUNT] = {`)
  for (const f of fns) out.push(`  ${q(f.name)},  // ${f.description}`)
  out.push('};', '')

  out.push('}  // namespace arturobot', '')
  return out.join('\n')
}
