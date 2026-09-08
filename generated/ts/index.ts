// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

export const PROTOCOL_VERSION = 2 as const
export const PROTOCOL_MIN_SUPPORTED = 1 as const

// A robot that does not declare a protocol is speaking version 1.
export function protocolOf(status: { protocol?: number }): number {
  return status.protocol ?? 1
}

export const RUN_OUTCOME = {
  /** Programma completato senza errori. */
  OK: 0,
  /** Interrotto dall'utente con POST /api/stop. */
  STOPPED: 1,
  /** Fallito: il messaggio e' in 'error'. */
  ERROR: 2,
} as const
export type RunOutcome = (typeof RUN_OUTCOME)[keyof typeof RUN_OUTCOME]

export const LAN_ROUTES = {
  /** POST — Carica ed esegue un programma. Sostituisce il programma precedente, che il robot conserva su filesystem e rieseque con il tasto play fisico. */
  RUN: "/api/run",
  /** POST — Alza il flag di stop e ferma subito i motori. */
  STOP: "/api/stop",
  /** GET — Stato di esecuzione, esito dell'ultima run e ultime letture dei sensori. Dal protocollo 2 e' anche l'handshake: il robot vi dichiara chi e' e quale protocollo parla. */
  STATUS: "/api/status",
} as const

export const CLOUD_ROUTES = {
  /** POST — Il robot si autentica e ottiene un token di sessione a scadenza. E' l'unico punto in cui il secret viaggia. */
  SESSION: "/api/device/session",
  /** POST — Un robot non ancora associato chiede un codice di associazione a vita breve. E' il robot a chiederlo, non il portale: cosi' solo un robot davvero acceso e in rete puo' essere associato. */
  CLAIM_CODE: "/api/device/claim-code",
  /** POST — Un tutore autenticato associa il robot al proprio account presentando il codice. Un learner non puo' associare un robot: vale la stessa regola per cui non puo' registrarsi da solo. */
  CLAIM: "/api/device/claim",
  /** GET — Il robot chiede il programma da eseguire. Il corpo della risposta e' sorgente Lua, esattamente come per POST /api/run in locale: il robot non deve conoscere due formati. */
  PROGRAM: "/api/device/program",
  /** POST — Il robot riferisce l'esito dell'ultima esecuzione e lo stato dei sensori. Stessa forma di RobotStatus della API locale. */
  TELEMETRY: "/api/device/telemetry",
} as const

/** Dimensione massima in byte del corpo di POST /api/run. */
export const MAX_SCRIPT_BYTES = 16384

/** The only globals a generated Lua program may call. */
export const LUA_API = ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp"] as const
export type LuaApiFunction = (typeof LUA_API)[number]

export const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }> = {
  forward: { args: 1, returns: "void" },
  backward: { args: 1, returns: "void" },
  turnLeft: { args: 1, returns: "void" },
  turnRight: { args: 1, returns: "void" },
  wait: { args: 1, returns: "void" },
  readDistance: { args: 0, returns: "number" },
  eyelashesDown: { args: 0, returns: "void" },
  eyelashesUp: { args: 0, returns: "void" },
}

export const LUA_STDLIB_ALLOWED = ["base", "math", "string", "table"] as const

// Shape of GET /api/status at this protocol version.
export interface RobotStatus {
  /** Un programma e' in esecuzione. */
  running: boolean
  /** Esito dell'ultima esecuzione conclusa. */
  result: RunOutcome
  /** Messaggio d'errore, valorizzato solo quando result vale ERROR. */
  error: string
  /** Versione di protocollo parlata dal robot. E' il campo che permette al portale di sapere con chi sta parlando invece di sperarlo. */
  protocol?: number
  /** Versione del firmware, in forma semver. */
  firmware?: string
  /** Identificativo stabile del dispositivo, immutabile per tutta la vita della scheda. */
  deviceId?: string
  /** Access Point oppure collegato a una rete. */
  mode?: "ap" | "sta"
  /** Il robot e' gia' associato a un account del portale. */
  paired?: boolean
  sensors: { distance: number }
}
