// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

/** Versione di protocollo parlata da questo pacchetto. */
export declare const PROTOCOL_VERSION: 3
/** La versione piu' vecchia con cui il portale parla: sotto di questa rifiuta, invece di degradare. */
export declare const PROTOCOL_MIN_SUPPORTED: 3
/** Il rilascio di questo contratto: il tag git e' la stessa stringa con una v davanti. E' cio' che un robot dichiara in protocolRelease e il portale in serverRelease. */
export declare const PROTOCOL_RELEASE: "3.0.0"

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
  /** POST — Carica ed esegue un programma. Sostituisce il programma precedente, che il robot conserva su filesystem e rieseque con il tasto play fisico. Dal protocollo 3 e' il solo modo in cui un programma raggiunge il robot, e chi lo chiama e' il browser di chi ha premuto «esegui». */
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
  /** POST — Un tutore autenticato associa il robot al proprio account presentando il codice. E' l'unica rotta di questo contratto che il robot non chiama: la chiama il browser di una persona, con la sua sessione, e per questo e' anche l'unica che sta dentro la protezione CSRF del portale. Un learner non puo' associare un robot: vale la stessa regola per cui non puo' registrarsi da solo. */
  readonly CLAIM: "/api/device/claim"
  /** POST — Il robot riferisce l'esito dell'ultima esecuzione e lo stato dei sensori, ogni DEVICE_HEARTBEAT_SECONDS. E' insieme telemetria e battito: il portale non ha un altro modo per sapere che il robot e' acceso. Dal protocollo 3 il corpo e' DeviceTelemetry, che e' una forma sua e non piu' il RobotStatus della API locale: il robot smette di riferire al portale due fatti che sono del portale — se e' associato, e quale id gli e' stato dato — e che nessuno leggeva. */
  readonly TELEMETRY: "/api/device/telemetry"
}

/** Una risposta d'errore e' un oggetto JSON con un campo solo, 'code', preso dalla tabella della rotta che l'ha prodotta. La busta e' una sola per tutti e tre i contratti: il messaggio da mostrare e' una scelta di chi ha le traduzioni, e nessuna delle due parti ne ha due modi di dire la stessa cosa. Dal protocollo 3 e' dichiarata qui invece di essere descritta in una nota della sola lan-api, che e' il motivo per cui il portale aveva finito per rispondere 'error' dove il firmware rispondeva 'code'. */
export declare const ERROR_FIELD: "code"

/** I codici che lan-api puo' rispondere, nel campo code. */
export declare const LAN_ERRORS: readonly ["empty_body", "script_too_long", "busy", "out_of_memory"]
export type LanError = (typeof LAN_ERRORS)[number]

/** I codici che cloud-api puo' rispondere, nel campo code. */
export declare const CLOUD_ERRORS: readonly ["rate_limited", "invalid_request", "bad_device_credentials", "bad_device_token", "unknown_claim_code", "already_paired"]
export type CloudError = (typeof CLOUD_ERRORS)[number]

/** Come viaggia il deviceToken: intestazione Authorization con schema Bearer. Fino al protocollo 2 il contratto nominava il token e non la busta, e il portale aveva scelto per conto proprio: e' esattamente il genere di accordo che deve stare qui, perche' senza il firmware dovrebbe indovinarlo. Un cookie sarebbe stato l'altra strada ed e' quella sbagliata: il robot non e' un browser e non ha una dispensa di cookie che valga il nome. */
export declare const DEVICE_AUTH_HEADER: "Authorization"
export declare const DEVICE_AUTH_SCHEME: "Bearer"

/** Dimensione massima in byte del corpo di POST /api/run. */
export declare const MAX_SCRIPT_BYTES: 16384
/** Ogni quanto il robot si fa vivo con POST /api/device/telemetry. E' il battito da cui il portale deduce che il robot e' acceso: non esiste un altro modo per saperlo. */
export declare const DEVICE_HEARTBEAT_SECONDS: 15
/** Dopo quanto silenzio il portale considera spento un robot. Sono tre battiti mancati: uno solo trasformerebbe ogni pacchetto perso in uno spegnimento. E' una regola di chi ascolta e non di chi batte, quindi non entra nell'header del firmware. */
export declare const DEVICE_OFFLINE_AFTER_SECONDS: 45
/** Quanto vive un codice di associazione. Breve per costruzione: e' una prova di possesso, non una credenziale. La scadenza la tiene il portale, che il codice lo emette: al robot arriva gia' come expiresAt. */
export declare const CLAIM_CODE_TTL_SECONDS: 300

/** Le sole globali che un programma Lua generato puo' chiamare. */
export declare const LUA_API: readonly ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp"]
export type LuaApiFunction = (typeof LUA_API)[number]

export declare const LUA_SIGNATURES: Record<LuaApiFunction, { args: number; returns: string }>

/** Solo i sottoinsiemi sicuri della libreria standard. Il generatore Lua ufficiale di Blockly copre cicli, logica, matematica, variabili e funzioni usando esclusivamente questi moduli. */
export declare const LUA_STDLIB_ALLOWED: readonly ["base", "math", "string", "table"]

/** La forma di GET /api/status a questa versione di protocollo: e' insieme lo stato di esecuzione e l'handshake con cui il robot dice chi e'. */
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
  /** Versione di protocollo parlata dal robot. E' il campo che permette al portale di sapere con chi sta parlando invece di sperarlo, ma non basta da solo: quale forma del protocollo sia lo dice protocolRelease. */
  protocol: number
  /** Rilascio del contratto contro cui questo firmware e' stato compilato: la costante PROTOCOL_RELEASE dell'header generato, ripetuta e non scritta a mano. Il tag git e' la stessa stringa con una v davanti. Esiste perche' il numero di protocollo non basta a dire chi sei: due firmware che dichiarano lo stesso numero possono essere stati compilati contro forme diverse, e questo campo e' l'unico posto in cui la differenza si vede. */
  protocolRelease: string
  /** Versione del firmware, in forma semver. */
  firmware: string
  /** Identificativo assegnato dal portale alla prima connessione a una rete e conservato in NVS. Un robot in stato di reset non ne ha ancora uno, e il campo e' assente: e' l'unico campo facoltativo dello stato, e lo e' per una ragione sua e non per l'eta' di chi risponde. */
  deviceId?: string
  /** Access Point, collegato a una rete, oppure le due cose insieme. Il terzo valore entra con il protocollo 3 e non e' una novita' del comportamento ma della sua descrizione: il codice di associazione arriva dal cloud sulla STA e va mostrato sulla pagina servita dall'AP, quindi fra la prima connessione e l'associazione il robot sta in entrambe, e fino al protocollo 2 non aveva un modo di dirlo. */
  mode: "ap" | "sta" | "ap_sta"
  /** Indirizzo del robot sulla rete a cui e' collegato, come URL completo di schema e porta, nella forma che un browser puo' chiamare senza doverci aggiungere niente. Dal protocollo 3 e' il campo su cui poggia tutta la consegna: e' l'unico modo in cui il portale sa dove sta un robot, perche' dall'esterno vede l'indirizzo pubblico della rete e non quello del robot dentro di essa, ed e' quello che passa al browser che consegna. Obbligatorio, e non c'e' uno stato in cui manchi per una ragione sua. */
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

/** Cio' che il portale risponde: il token, la sua scadenza, se il robot e' di qualcuno, e la meta' di negoziazione che appartiene al portale. */
export interface DeviceSession {
  /** Token opaco di sessione del dispositivo. Viaggia nell'intestazione Authorization con schema Bearer. */
  deviceToken: string
  /** Scadenza, in ISO 8601. */
  expiresAt: string
  /** Il robot e' gia' associato a un account. E' il portale a dirlo al robot, e non il contrario: e' un fatto del registro, e la proprieta' si rilegge a ogni sessione invece di essere incisa nel token. */
  paired: boolean
  /** Versione di protocollo parlata dal portale. La negoziazione e' reciproca: anche il robot deve sapere se sta parlando con un portale piu' vecchio di lui. */
  serverProtocol: number
  /** Rilascio del contratto contro cui il portale e' stato compilato, ed e' l'altra meta' di protocolRelease. Fino al protocollo 2 la negoziazione si diceva reciproca e non lo era: il portale pretendeva dal robot il rilascio esatto e al robot arrivava un intero, con cui puo' solo scoprire di parlare con un portale piu' vecchio e mai di parlare con una forma diversa della stessa versione. Finche' non ci sono robot in campo il robot rifiuta un portale che non porti il proprio stesso rilascio, come il portale gia' fa con lui. */
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

/** Il battito, che e' anche la telemetria. Dal protocollo 3 e' una forma sua e non piu' il RobotStatus della API locale. */
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
  /** Versione di protocollo parlata dal robot, ripetuta qui perche' un battito non arriva mai dopo un GET /api/status: il portale che riceve il battito puo' non aver mai visto lo stato locale. */
  protocol: number
  /** Rilascio del contratto contro cui il firmware e' stato compilato. Come sopra: e' cio' che permette al portale di rifiutare un battito invece di crederlo. */
  protocolRelease: string
}
