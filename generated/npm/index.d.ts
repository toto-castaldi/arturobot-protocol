// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

/** Versione di protocollo parlata da questo pacchetto. */
export declare const PROTOCOL_VERSION: 2
/** La versione piu' vecchia con cui il portale parla: sotto di questa rifiuta, invece di degradare. */
export declare const PROTOCOL_MIN_SUPPORTED: 2

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
  /** POST — Un robot in stato di reset chiede la propria identita'. Il portale genera deviceId e deviceSecret e li restituisce una volta sola: il robot li scrive in NVS e non li richiede mai piu'. E' l'unica rotta non autenticata del contratto, perche' un robot che non ha ancora un segreto non puo' presentarne uno. */
  readonly REGISTER: "/api/device/register"
  /** POST — Il robot si autentica e ottiene un token di sessione a scadenza. E' l'unico punto in cui il secret viaggia. */
  readonly SESSION: "/api/device/session"
  /** POST — Un robot non ancora associato chiede un codice di associazione a vita breve e lo mostra nella propria pagina di configurazione. Il codice non dice al portale quale robot sia — l'id gliel'ha dato lui — ma dimostra che chi associa ha il robot davanti. */
  readonly CLAIM_CODE: "/api/device/claim-code"
  /** POST — Un tutore autenticato associa il robot al proprio account presentando il codice. Un learner non puo' associare un robot: vale la stessa regola per cui non puo' registrarsi da solo. */
  readonly CLAIM: "/api/device/claim"
  /** GET — Il robot chiede il programma da eseguire. Il corpo della risposta e' sorgente Lua, esattamente come per POST /api/run in locale: il robot non deve conoscere due formati. */
  readonly PROGRAM: "/api/device/program"
  /** POST — Il robot riferisce l'esito dell'ultima esecuzione e lo stato dei sensori, ogni DEVICE_HEARTBEAT_SECONDS. Stessa forma di RobotStatus della API locale. E' insieme telemetria e battito: il portale non ha un altro modo per sapere che il robot e' acceso. */
  readonly TELEMETRY: "/api/device/telemetry"
}

/** Dimensione massima in byte del corpo di POST /api/run. */
export declare const MAX_SCRIPT_BYTES: 16384
/** Ogni quanto il robot si fa vivo con POST /api/device/telemetry. E' il battito da cui il portale deduce che il robot e' acceso: non esiste un altro modo per saperlo. */
export declare const DEVICE_HEARTBEAT_SECONDS: 15
/** Dopo quanto silenzio il portale considera spento un robot. Sono tre battiti mancati: uno solo trasformerebbe ogni pacchetto perso in uno spegnimento. */
export declare const DEVICE_OFFLINE_AFTER_SECONDS: 45
/** Quanto vive un codice di associazione. Breve per costruzione: e' una prova di possesso, non una credenziale. */
export declare const CLAIM_CODE_TTL_SECONDS: 300

/** Le sole globali che un programma Lua generato puo' chiamare. */
export declare const LUA_API: readonly ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp"]
export type LuaApiFunction = (typeof LUA_API)[number]

export declare const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }>

/** Solo i sottoinsiemi sicuri della libreria standard. Il generatore Lua ufficiale di Blockly copre cicli, logica, matematica, variabili e funzioni usando esclusivamente questi moduli. */
export declare const LUA_STDLIB_ALLOWED: readonly ["base", "math", "string", "table"]

export interface DeviceIdentity {
  /** Identificativo assegnato dal portale. Da questo momento e' l'identita' del robot. */
  deviceId: string
  /** Segreto assegnato insieme all'id. Viaggia una volta sola, in questa risposta. */
  deviceSecret: string
}

export interface DeviceSession {
  /** Token opaco di sessione del dispositivo. */
  deviceToken: string
  /** Scadenza, in ISO 8601. */
  expiresAt: string
  /** Il robot e' gia' associato a un account. */
  paired: boolean
  /** Versione di protocollo parlata dal portale. La negoziazione e' reciproca: anche il robot deve sapere se sta parlando con un portale piu' vecchio di lui. */
  serverProtocol: number
}

export interface ClaimCode {
  /** Codice breve, leggibile da un adulto. */
  code: string
  /** Scadenza, in ISO 8601. Breve per costruzione. */
  expiresAt: string
}

/** La forma di `GET /api/status` a questa versione di protocollo. */
export interface RobotStatus {
  /** Un programma e' in esecuzione. */
  running: boolean
  /** Esito dell'ultima esecuzione conclusa. */
  result: RunOutcome
  /** Messaggio d'errore, valorizzato solo quando result vale ERROR. */
  error: string
  /** Versione di protocollo parlata dal robot. E' il campo che permette al portale di sapere con chi sta parlando invece di sperarlo. */
  protocol: number
  /** Versione del firmware, in forma semver. */
  firmware: string
  /** Identificativo assegnato dal portale alla prima connessione a una rete e conservato in NVS. Un robot in stato di reset non ne ha ancora uno, e il campo e' assente: e' l'unico campo facoltativo dello stato, e lo e' per una ragione sua e non per l'eta' di chi risponde. */
  deviceId?: string
  /** Access Point oppure collegato a una rete. */
  mode: "ap" | "sta"
  /** Il robot e' gia' associato a un account del portale. */
  paired: boolean
  sensors: { distance: number }
}
