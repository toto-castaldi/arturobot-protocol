// C++ emitter: the header the firmware includes. Kept to constants only —
// no allocation, no String, nothing that costs RAM on an ESP32.
//
// What it emits is what the *firmware* has to know, and not everything the
// contract says. Until protocol 3 it emitted the lot: the route an adult's
// browser calls, and the two timings that belong to whoever is listening.
// A header that hands the firmware a route it must never call is a header
// that invites it to be called.
import { at, banner, errorsOf, limitsFor, routesFor } from './lib.mjs'

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

  for (const l of [...limitsFor(lan, v, 'firmware'), ...limitsFor(cloud, v, 'firmware')]) {
    out.push(`// ${l.description}`, `static const size_t ${l.name} = ${l.value};`, '')
  }

  out.push('// Local HTTP API served by the robot.')
  for (const r of at(lan.routes, v)) {
    out.push(`static const char *ROUTE_${constName(r.path.replace(/^\/api\//, ''))} = ${q(r.path)};  // ${r.method}`)
  }
  out.push('')

  out.push('// CORS headers the robot answers with on every route above. The caller is')
  out.push('// a page on another origin, and since protocol 3 an HTTPS one.')
  out.push(`static const char *CORS_ALLOW_ORIGIN = ${q(lan.cors.allow_origin)};`)
  out.push(`static const char *CORS_ALLOW_METHODS = ${q(lan.cors.allow_methods.join(', '))};`)
  out.push(`static const char *CORS_ALLOW_HEADERS = ${q(lan.cors.allow_headers.join(', '))};`, '')

  const cloudRoutes = routesFor(cloud, v, 'robot')
  if (cloudRoutes.length) {
    out.push('// Cloud API the robot calls when in STA mode. Routes of the same contract')
    out.push("// whose client is a browser are not here: they are not the robot's to call.")
    for (const r of cloudRoutes) {
      out.push(`static const char *CLOUD_${constName(r.path.replace(/^\/api\/device\//, ''))} = ${q(r.path)};  // ${r.method}`)
    }
    out.push('')

    out.push(`// How the deviceToken travels on the routes above: "${cloud.auth.scheme} <token>".`)
    out.push(`static const char *DEVICE_AUTH_HEADER = ${q(cloud.auth.header)};`)
    out.push(`static const char *DEVICE_AUTH_SCHEME = ${q(cloud.auth.scheme)};`, '')
  }

  // The codes used to be typed out by hand on both sides, which is exactly the
  // drift this repository exists to turn into a build error.
  out.push(`// Error bodies are {"${meta.error_envelope.field}": "..."} with one of these.`)
  out.push('// The ones the robot answers with, on its own API:')
  for (const e of errorsOf(lan, v)) {
    out.push(`static const char *LAN_ERROR_${constName(e.code)} = ${q(e.code)};  // ${e.status}`)
  }
  out.push('// The ones the robot has to recognise, coming back from the cloud:')
  for (const e of errorsOf(cloud, v, 'robot')) {
    out.push(`static const char *CLOUD_ERROR_${constName(e.code)} = ${q(e.code)};  // ${e.status}`)
  }
  out.push('')

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
