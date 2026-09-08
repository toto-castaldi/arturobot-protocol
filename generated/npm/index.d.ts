// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

/** Versione di protocollo parlata da questo pacchetto. */
export declare const PROTOCOL_VERSION: 2
/** La versione piu' vecchia che il portale deve ancora saper trattare. */
export declare const PROTOCOL_MIN_SUPPORTED: 1

/** Un robot che non dichiara il campo `protocol` sta parlando la versione 1. */
export declare function protocolOf(status: { protocol?: number }): number

export declare const RUN_OUTCOME: {
  /** Programma completato senza errori. */
  readonly OK: 0
  /** Interrotto dall'utente con POST /api/stop. */
  readonly STOPPED: 1
  /** Fallito: il messaggio e' in 'error'. */
  readonly ERROR: 2
}
export type RunOutcome = (typeof RUN_OUTCOME)[keyof typeof RUN_OUTCOME]

export declare const LAN_ROUTES: {
  /** POST — Carica ed esegue un programma. Sostituisce il programma precedente, che il robot conserva su filesystem e rieseque con il tasto play fisico. */
  readonly RUN: "/api/run"
  /** POST — Alza il flag di stop e ferma subito i motori. */
  readonly STOP: "/api/stop"
  /** GET — Stato di esecuzione, esito dell'ultima run e ultime letture dei sensori. Dal protocollo 2 e' anche l'handshake: il robot vi dichiara chi e' e quale protocollo parla. */
  readonly STATUS: "/api/status"
}

export declare const CLOUD_ROUTES: {
  /** POST — Il robot si autentica e ottiene un token di sessione a scadenza. E' l'unico punto in cui il secret viaggia. */
  readonly SESSION: "/api/device/session"
  /** POST — Un robot non ancora associato chiede un codice di associazione a vita breve. E' il robot a chiederlo, non il portale: cosi' solo un robot davvero acceso e in rete puo' essere associato. */
  readonly CLAIM_CODE: "/api/device/claim-code"
  /** POST — Un tutore autenticato associa il robot al proprio account presentando il codice. Un learner non puo' associare un robot: vale la stessa regola per cui non puo' registrarsi da solo. */
  readonly CLAIM: "/api/device/claim"
  /** GET — Il robot chiede il programma da eseguire. Il corpo della risposta e' sorgente Lua, esattamente come per POST /api/run in locale: il robot non deve conoscere due formati. */
  readonly PROGRAM: "/api/device/program"
  /** POST — Il robot riferisce l'esito dell'ultima esecuzione e lo stato dei sensori. Stessa forma di RobotStatus della API locale. */
  readonly TELEMETRY: "/api/device/telemetry"
}

/** Dimensione massima in byte del corpo di POST /api/run. */
export declare const MAX_SCRIPT_BYTES: 16384

/** Le sole globali che un programma Lua generato puo' chiamare. */
export declare const LUA_API: readonly ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp"]
export type LuaApiFunction = (typeof LUA_API)[number]

export declare const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }>

/** Solo i sottoinsiemi sicuri della libreria standard. Il generatore Lua ufficiale di Blockly copre cicli, logica, matematica, variabili e funzioni usando esclusivamente questi moduli. */
export declare const LUA_STDLIB_ALLOWED: readonly ["base", "math", "string", "table"]

/** La forma di `GET /api/status` a questa versione di protocollo. */
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
