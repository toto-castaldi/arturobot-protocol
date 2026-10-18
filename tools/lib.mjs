// Source of truth loading and the checks every emitter relies on.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const read = (...p) => JSON.parse(readFileSync(join(ROOT, ...p), 'utf8'))

export function load() {
  const model = {
    // The release is the package version, and the git tag is the same string
    // with a v in front: one place names it, so nothing has to compare two.
    release: read('package.json').version,
    errors: read('protocol', 'errors.json'),
    lua: read('protocol', 'lua-api.json'),
    lan: read('protocol', 'lan-api.json'),
    cloud: read('protocol', 'cloud-api.json'),
  }

  checkLimitReferences(model)
  checkSchemaReferences(model)
  checkAnswersAreDeclared(model)
  checkLuaArgTypes(model)

  return model
}

/** Every route of a contract whose client is `who`. */
export const routesFor = (contract, who) => contract.routes.filter((r) => r.client === who)

/** Every limit of a contract that `who` has to know about. */
export const limitsFor = (contract, who) =>
  (contract.limits ?? []).filter((l) => (l.audience ?? ['firmware', 'portal']).includes(who))

/**
 * The error codes a contract can answer with.
 *
 * Collected from the responses rather than listed a second time: a code means
 * something on the route that produces it, and that is where it is written.
 * Emitting them is what stopped both sides from copying the strings by hand,
 * which is how `empty_body` ended up typed out in the firmware sketch and
 * again in the portal. With `who` it narrows to the routes that client
 * actually calls: the firmware has no use for the refusals of a route only a
 * browser ever reaches.
 */
export function errorsOf(contract, who) {
  const seen = new Map()

  for (const route of contract.routes) {
    if (who !== undefined && route.client !== who) continue

    for (const response of route.responses) {
      if (response.code && !seen.has(response.code)) {
        seen.set(response.code, { code: response.code, status: response.status })
      }
    }
  }

  return [...seen.values()]
}

/**
 * A `max_bytes` that names a limit must name one that exists.
 *
 * The size of a program used to be written twice in lan-api.json, in the
 * limit and again in the route, with nothing comparing them. Now the route
 * names the limit, and this is what makes the name mean something.
 */
function checkLimitReferences({ lan, cloud }) {
  const names = new Set([...(lan.limits ?? []), ...(cloud.limits ?? [])].map((l) => l.name))

  for (const contract of [lan, cloud]) {
    for (const route of contract.routes ?? []) {
      const ref = route.request?.max_bytes
      if (typeof ref === 'string' && !names.has(ref)) {
        throw new Error(`${contract.contract}: ${route.path} cita il limite ${ref}, che non esiste`)
      }
    }
  }
}

/**
 * Every route says what a call that works answers with.
 *
 * The firmware once answered the word `avviato` to `POST /api/run` while the
 * portal expected nothing, and a program that started reached the screen as a
 * refusal. Neither side was wrong about the contract, because it had not said.
 *
 * `body: null` is an answer. A missing `body` is not.
 */
function checkAnswersAreDeclared({ lan, cloud }) {
  for (const contract of [lan, cloud]) {
    for (const route of contract.routes) {
      for (const response of route.responses) {
        const isSuccess = response.status >= 200 && response.status < 300
        const declared =
          response.schema !== undefined ||
          response.body !== undefined ||
          response.content_type !== undefined

        if (isSuccess && !declared) {
          throw new Error(
            `${contract.contract}: ${route.method} ${route.path} non dice che cosa porta il ${response.status}. ` +
              'Uno schema, oppure body e content_type a null: «niente» va dichiarato come tutto il resto.',
          )
        }
      }
    }
  }
}

/** A request or a response that names a schema must name one that exists. */
function checkSchemaReferences({ lan, cloud }) {
  for (const contract of [lan, cloud]) {
    const names = new Set(Object.keys(contract.schemas ?? {}))
    const check = (where, name) => {
      if (name !== undefined && !names.has(name)) {
        throw new Error(`${contract.contract}: ${where} cita lo schema ${name}, che non esiste`)
      }
    }

    for (const route of contract.routes ?? []) {
      check(`${route.method} ${route.path} (richiesta)`, route.request?.schema)
      for (const response of route.responses ?? []) {
        check(`${route.method} ${route.path} (${response.status})`, response.schema)
      }
    }
  }
}

/**
 * Every Lua argument has a type both sides know.
 *
 * A speed, a sound or a note travels as a string, and which strings are
 * allowed is a list the firmware and the portal have to share. The list lives
 * once in `values`, and an argument names it: a typo in the name would leave
 * the argument with no list at all, which is the drift this check exists to
 * stop.
 */
const LUA_SCALARS = new Set(['number', 'boolean', 'string'])

function checkLuaArgTypes({ lua }) {
  const sets = lua.values ?? {}

  for (const [name, set] of Object.entries(sets)) {
    if (LUA_SCALARS.has(name)) throw new Error(`lua-api: l'insieme ${name} ha il nome di un tipo`)
    const seen = new Set()
    for (const v of set.values) {
      if (seen.has(v.name)) throw new Error(`lua-api: l'insieme ${name} ripete il valore ${v.name}`)
      seen.add(v.name)
    }
  }

  for (const fn of lua.functions) {
    for (const arg of fn.args) {
      if (!LUA_SCALARS.has(arg.type) && !(arg.type in sets)) {
        throw new Error(`lua-api: ${fn.name}(${arg.name}) ha il tipo ${arg.type}, che non e' un tipo ne' un insieme di values`)
      }
    }
  }
}

/** The named value sets of lua-api, as [name, values] pairs. */
export const luaValueSets = (lua) =>
  Object.entries(lua.values ?? {}).map(([name, set]) => [name, set.values.map((v) => v.name), set.description])

export const banner = (comment) =>
  [
    `${comment} Generato da arturobot-protocol. Non modificare a mano.`,
    `${comment} La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs`,
  ].join('\n')
