// Source of truth loading and the version filter every emitter shares.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

const read = (...p) => JSON.parse(readFileSync(join(ROOT, ...p), 'utf8'))

export function load() {
  const meta = read('protocol', 'meta.json')
  const pkg = read('package.json')

  // Two files name the same release, so they are checked against each other
  // here rather than trusted: a tag cut on a mismatch would ship a contract
  // that lies about which release it is.
  if (meta.release !== pkg.version) {
    throw new Error(
      `protocol/meta.json dice release ${meta.release}, package.json dice ${pkg.version}`,
    )
  }

  const model = {
    meta,
    lua: read('protocol', 'lua-api.json'),
    lan: read('protocol', 'lan-api.json'),
    cloud: read('protocol', 'cloud-api.json'),
    compatibility: read('compatibility.json'),
  }

  checkLimitReferences(model)
  checkSchemaReferences(model)
  checkAnswersAreDeclared(model)

  return model
}

// An entry belongs to protocol version `v` when it was introduced at or before
// `v` and has not been withdrawn yet. This is the only place the rule lives.
export const liveAt = (v) => (e) =>
  (e.since ?? 1) <= v && (e.until === undefined || e.until > v)

export const at = (list, v) => (list ?? []).filter(liveAt(v))

/** Every route of a contract whose client is `who`, at version `v`. */
export const routesFor = (contract, v, who) =>
  at(contract.routes, v).filter((r) => r.client === who)

/** Every limit of a contract that `who` has to know about, at version `v`. */
export const limitsFor = (contract, v, who) =>
  at(contract.limits, v).filter((l) => (l.audience ?? ['firmware', 'portal']).includes(who))

/**
 * The error codes a contract can answer with, at version `v`.
 *
 * Collected from the responses rather than listed a second time: a code means
 * something on the route that produces it, and that is where it is written.
 * Emitting them is what stopped both sides from copying the strings by hand,
 * which is how `empty_body` ended up typed out in the firmware sketch and
 * again in the portal. With `who` it narrows to the routes that client
 * actually calls: the firmware has no use for the refusals of a route only a
 * browser ever reaches.
 */
export function errorsOf(contract, v, who) {
  const seen = new Map()

  for (const route of at(contract.routes, v)) {
    if (who !== undefined && route.client !== who) continue

    for (const response of at(route.responses, v)) {
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
 * It is the check this repository did not have, and the one that would have
 * caught the worst hour of the protocol 3 work: `POST /api/run` declared the
 * body it takes and said nothing about the body it gives. The firmware
 * answered the word `avviato`, the portal had written down that nothing came
 * back, and a program that started reached the screen as a refusal. Neither
 * side was wrong about the contract, because the contract had not said.
 *
 * `body: null` is an answer. A missing `body` is not.
 */
function checkAnswersAreDeclared({ meta, lan, cloud }) {
  // Only what is live at the current version. A route that has left the
  // contract is history, and history is not asked to obey a rule written
  // after it went.
  for (const contract of [lan, cloud]) {
    for (const route of at(contract.routes, meta.current)) {
      for (const response of at(route.responses, meta.current)) {
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

export const banner = (comment) =>
  [
    `${comment} Generato da arturobot-protocol. Non modificare a mano.`,
    `${comment} La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs`,
  ].join('\n')
