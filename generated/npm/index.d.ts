// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

/** Il rilascio di questo contratto: il tag git e' la stessa stringa con una v davanti. E' cio' che un robot dichiara in protocolRelease e il portale in serverRelease. */
export declare const PROTOCOL_RELEASE: "4.0.0"

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
  /** POST — Carica ed esegue un programma. Sostituisce il programma precedente, che il robot conserva su filesystem e riesegue con il tasto play fisico. E' il solo modo in cui un programma raggiunge il robot, e chi lo chiama e' il browser di chi ha premuto «esegui». */
  readonly RUN: "/api/run"
  /** POST — Alza il flag di stop e ferma subito i motori. */
  readonly STOP: "/api/stop"
  /** GET — Stato di esecuzione, esito dell'ultima run e ultime letture dei sensori. E' anche l'handshake: il robot vi dichiara chi e' e contro quale rilascio del contratto e' stato compilato. */
  readonly STATUS: "/api/status"
}

export declare const CLOUD_ROUTES: {
  /** POST — Un robot in stato di reset chiede la propria identita'. Il portale genera deviceId e deviceSecret e li restituisce una volta sola: il robot li scrive in NVS e non li richiede mai piu'. E' l'unica rotta non autenticata del contratto, perche' un robot che non ha ancora un segreto non puo' presentarne uno. */
  readonly REGISTER: "/api/device/register"
  /** POST — Il robot si autentica e ottiene un token di sessione a scadenza. E' l'unico punto in cui il secret viaggia. */
  readonly SESSION: "/api/device/session"
  /** POST — Un robot non ancora associato chiede un codice di associazione a vita breve e lo mostra nella propria pagina di configurazione. Il codice non dice al portale quale robot sia — l'id gliel'ha dato lui — ma dimostra che chi associa ha il robot davanti. */
  readonly CLAIM_CODE: "/api/device/claim-code"
  /** POST — Un tutore autenticato associa il robot al proprio account presentando il codice. E' l'unica rotta di questo contratto che il robot non chiama: la chiama il browser di una persona, con la sua sessione, e per questo e' anche l'unica che sta dentro la protezione CSRF del portale. Un learner non puo' associare un robot: vale la stessa regola per cui non puo' registrarsi da solo. */
  readonly CLAIM: "/api/device/claim"
  /** POST — Il robot riferisce l'esito dell'ultima esecuzione e lo stato dei sensori, ogni DEVICE_HEARTBEAT_SECONDS. E' insieme telemetria e battito: il portale non ha un altro modo per sapere che il robot e' acceso. Il corpo e' DeviceTelemetry, una forma sua e non il RobotStatus della API locale: se il robot e' associato, e quale id gli e' stato dato, sono fatti del portale e il robot non glieli riferisce. */
  readonly TELEMETRY: "/api/device/telemetry"
}

/** Una risposta d'errore e' un oggetto JSON con un campo solo, 'code', preso dalla tabella della rotta che l'ha prodotta. La busta e' una sola per tutti i contratti HTTP: il messaggio da mostrare e' una scelta di chi ha le traduzioni, e nessuna delle due parti ne ha due modi di dire la stessa cosa. */
export declare const ERROR_FIELD: "code"

/** I codici che lan-api puo' rispondere, nel campo code. */
export declare const LAN_ERRORS: readonly ["empty_body", "script_too_long", "busy", "out_of_memory"]
export type LanError = (typeof LAN_ERRORS)[number]

/** I codici che cloud-api puo' rispondere, nel campo code. */
export declare const CLOUD_ERRORS: readonly ["rate_limited", "invalid_request", "bad_device_credentials", "bad_device_token", "unknown_claim_code", "already_paired"]
export type CloudError = (typeof CLOUD_ERRORS)[number]

/** Come viaggia il deviceToken: intestazione Authorization con schema Bearer. Un cookie sarebbe l'altra strada ed e' quella sbagliata: il robot non e' un browser e non ha una dispensa di cookie che valga il nome. */
export declare const DEVICE_AUTH_HEADER: "Authorization"
export declare const DEVICE_AUTH_SCHEME: "Bearer"

/** Dimensione massima in byte del corpo di POST /api/run. */
export declare const MAX_SCRIPT_BYTES: 16384
/** Ogni quanto il robot si fa vivo con POST /api/device/telemetry. E' il battito da cui il portale deduce che il robot e' acceso: non esiste un altro modo per saperlo. */
export declare const DEVICE_HEARTBEAT_SECONDS: 15
/** Dopo quanto silenzio il portale considera spento un robot. Sono tre battiti mancati: uno solo trasformerebbe ogni pacchetto perso in uno spegnimento. E' una regola di chi ascolta e non di chi batte, quindi non entra nell'header del firmware. */
export declare const DEVICE_OFFLINE_AFTER_SECONDS: 45
/** Quanto vive un codice di associazione. Breve per costruzione: e' una prova di possesso, non una credenziale. La scadenza vera la tiene il portale, che il codice lo emette, e al robot arriva come expiresAt; ma il robot ha bisogno lo stesso del numero, perche' e' cio' a cui ricade quando quella data non si legge o e' gia' passata. Una data illeggibile dice che i due orologi non vanno d'accordo, non che il portale ha emesso un codice nato morto. */
export declare const CLAIM_CODE_TTL_SECONDS: 300

/** Le sole globali che un programma Lua generato puo' chiamare. */
export declare const LUA_API: readonly ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp"]
export type LuaApiFunction = (typeof LUA_API)[number]

export declare const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }>

/** Solo i sottoinsiemi sicuri della libreria standard. Il generatore Lua ufficiale di Blockly copre cicli, logica, matematica, variabili e funzioni usando esclusivamente questi moduli. */
export declare const LUA_STDLIB_ALLOWED: readonly ["base", "math", "string", "table"]

/** La forma di GET /api/status: e' insieme lo stato di esecuzione e l'handshake con cui il robot dice chi e'. */
export interface RobotStatus {
  /** Un programma e' in esecuzione. */
  running: boolean
  /** Esito dell'ultima esecuzione conclusa. */
  result: RunOutcome
  /** Messaggio d'errore, valorizzato solo quando result vale ERROR. */
  error: string
  sensors: {
    /** Ultima lettura del sonar in centimetri, dalla cache: l'handler non tocca l'hardware. */
    distance: number
  }
  /** Rilascio del contratto contro cui questo firmware e' stato compilato: la costante PROTOCOL_RELEASE dell'header generato, ripetuta e non scritta a mano. Il tag git e' la stessa stringa con una v davanti. Il portale rifiuta un robot che non porti il proprio stesso rilascio. */
  protocolRelease: string
  /** Versione del firmware, in forma semver. */
  firmware: string
  /** Identificativo assegnato dal portale alla prima connessione a una rete e conservato in NVS. Un robot in stato di reset non ne ha ancora uno, e il campo e' assente: e' l'unico campo facoltativo dello stato. */
  deviceId?: string
  /** Access Point, collegato a una rete, oppure le due cose insieme. Il codice di associazione arriva dal cloud sulla STA e va mostrato sulla pagina servita dall'AP, quindi fra la prima connessione e l'associazione il robot sta in entrambe. */
  mode: "ap" | "sta" | "ap_sta"
  /** Indirizzo del robot sulla rete a cui e' collegato, come URL completo di schema e porta, nella forma che un browser puo' chiamare senza doverci aggiungere niente. E' il campo su cui poggia tutta la consegna: dall'esterno il portale vede l'indirizzo pubblico della rete e non quello del robot dentro di essa. */
  localAddress: string
  /** Il robot e' gia' associato a un account del portale. */
  paired: boolean
}

/** Cio' che POST /api/device/register restituisce una volta sola: e' la sola copia del segreto, e il robot deve scriverla in NVS subito. */
export interface DeviceIdentity {
  /** Identificativo assegnato dal portale. Da questo momento e' l'identita' del robot. */
  deviceId: string
  /** Segreto assegnato insieme all'id. Viaggia una volta sola, in questa risposta. */
  deviceSecret: string
}

/** Cio' che il robot presenta a POST /api/device/session per aprire una sessione. */
export interface DeviceCredentials {
  /** L'identificativo ricevuto da POST /api/device/register e conservato in NVS. */
  deviceId: string
  /** Il segreto ricevuto insieme all'id. E' il solo punto del contratto in cui lascia il robot. */
  deviceSecret: string
}

/** Cio' che il portale risponde: il token, la sua scadenza, se il robot e' di qualcuno, e il rilascio del contratto che il portale parla. */
export interface DeviceSession {
  /** Token opaco di sessione del dispositivo. Viaggia nell'intestazione Authorization con schema Bearer. */
  deviceToken: string
  /** Scadenza, in ISO 8601. */
  expiresAt: string
  /** Il robot e' gia' associato a un account. E' il portale a dirlo al robot, e non il contrario: e' un fatto del registro, e la proprieta' si rilegge a ogni sessione invece di essere incisa nel token. */
  paired: boolean
  /** Rilascio del contratto contro cui il portale e' stato compilato, ed e' l'altra meta' di protocolRelease: il robot rifiuta un portale che non porti il proprio stesso rilascio, come il portale fa con lui. */
  serverRelease: string
}

/** Il codice di associazione a vita breve che il robot mostra sulla propria pagina. */
export interface ClaimCode {
  /** Codice breve, leggibile da un adulto. */
  code: string
  /** Scadenza, in ISO 8601. Breve per costruzione. */
  expiresAt: string
}

/** Cio' che il browser di un adulto presenta a POST /api/device/claim. */
export interface ClaimRequest {
  /** Il codice che il robot mostra sulla propria pagina, digitato da un adulto. E' una prova di possesso e non una credenziale: non dice quale robot sia, dice che chi lo digita ce l'ha davanti. */
  code: string
}

/** Il battito, che e' anche la telemetria. */
export interface DeviceTelemetry {
  /** Un programma e' in esecuzione. */
  running: boolean
  /** Esito dell'ultima esecuzione conclusa. */
  result: RunOutcome
  /** Messaggio d'errore, valorizzato solo quando result vale ERROR. */
  error: string
  sensors: {
    /** Ultima lettura del sonar in centimetri. */
    distance: number
  }
  /** Dove il robot sta sulla propria rete, come URL completo. E' il campo per cui questa rotta esiste al di la' del battito: da fuori il portale vede l'indirizzo pubblico della rete, che non serve a raggiungere il robot, e questo e' il solo punto in cui puo' venire a sapere l'altro. Lo impara qui e lo passa al browser, che consegna. */
  localAddress: string
  /** Versione del firmware, in forma semver. */
  firmware: string
  /** Rilascio del contratto contro cui il firmware e' stato compilato, ripetuto qui perche' il portale che riceve il battito puo' non aver mai visto lo stato locale. E' cio' che gli permette di rifiutare un battito invece di crederlo. */
  protocolRelease: string
}
