// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

#pragma once

#include <stddef.h>

#define ARTUROBOT_PROTOCOL_RELEASE "5.3.0"

namespace arturobot {

// Outcome of the last run, reported in /api/status as "result".
enum RunOutcome {
  RUN_OK = 0,  // Programma completato senza errori.
  RUN_STOPPED = 1,  // Interrotto dall'utente con POST /api/stop.
  RUN_ERROR = 2,  // Fallito: il messaggio e' in 'error'.
};

// Dimensione massima in byte del corpo di POST /api/run.
static const size_t MAX_SCRIPT_BYTES = 16384;

// Quante righe di output il robot tiene, e quindi il massimo di output.lines in GET /api/status. Le piu' vecchie si perdono per prime.
static const size_t MAX_OUTPUT_LINES = 20;

// Lunghezza massima in byte di una riga di output. Una riga piu' lunga il robot la tronca, senza spezzarla a meta' di un carattere UTF-8.
static const size_t MAX_OUTPUT_LINE_BYTES = 120;

// Ogni quanto il robot si fa vivo con POST /api/device/heartbeat. E' il battito da cui il portale deduce che il robot e' acceso: non esiste un altro modo per saperlo.
static const size_t DEVICE_HEARTBEAT_SECONDS = 15;

// Quanto vive un codice di associazione. Breve per costruzione: e' una prova di possesso, non una credenziale. La scadenza vera la tiene il portale, che il codice lo emette, e al robot arriva come expiresAt; ma il robot ha bisogno lo stesso del numero, perche' e' cio' a cui ricade quando quella data non si legge o e' gia' passata. Una data illeggibile dice che i due orologi non vanno d'accordo, non che il portale ha emesso un codice nato morto.
static const size_t CLAIM_CODE_TTL_SECONDS = 300;

// Local HTTP API served by the robot.
static const char *ROUTE_RUN = "/api/run";  // POST
static const char *ROUTE_STOP = "/api/stop";  // POST
static const char *ROUTE_STATUS = "/api/status";  // GET

// CORS headers the robot answers with on every route above. The caller is
// a public HTTPS page, on another origin.
static const char *CORS_ALLOW_ORIGIN = "*";
static const char *CORS_ALLOW_METHODS = "GET, POST, OPTIONS";
static const char *CORS_ALLOW_HEADERS = "Content-Type";

// Cloud API the robot calls when in STA mode. Routes of the same contract
// whose client is a browser are not here: they are not the robot's to call.
static const char *CLOUD_REGISTER = "/api/device/register";  // POST
static const char *CLOUD_SESSION = "/api/device/session";  // POST
static const char *CLOUD_CLAIM_CODE = "/api/device/claim-code";  // POST
static const char *CLOUD_HEARTBEAT = "/api/device/heartbeat";  // POST

// How the deviceToken travels on the routes above: "Bearer <token>".
static const char *DEVICE_AUTH_HEADER = "Authorization";
static const char *DEVICE_AUTH_SCHEME = "Bearer";

// Error bodies are {"code": "..."} with one of these.
// The ones the robot answers with, on its own API:
static const char *LAN_ERROR_EMPTY_BODY = "empty_body";  // 400
static const char *LAN_ERROR_SCRIPT_TOO_LONG = "script_too_long";  // 400
static const char *LAN_ERROR_BUSY = "busy";  // 409
static const char *LAN_ERROR_OUT_OF_MEMORY = "out_of_memory";  // 500
// The ones the robot has to recognise, coming back from the cloud:
static const char *CLOUD_ERROR_RATE_LIMITED = "rate_limited";  // 429
static const char *CLOUD_ERROR_INVALID_REQUEST = "invalid_request";  // 400
static const char *CLOUD_ERROR_BAD_DEVICE_CREDENTIALS = "bad_device_credentials";  // 401
static const char *CLOUD_ERROR_BAD_DEVICE_TOKEN = "bad_device_token";  // 401

// Globals the firmware must register in every lua_State. The list is
// generated: a function added here but not implemented fails to link.
static const size_t LUA_API_COUNT = 29;
static const char *LUA_API_NAMES[LUA_API_COUNT] = {
  "forward",  // Avanza per la distanza indicata in centimetri. Se il robot e' in moto continuo, il passo ne prende il posto; quando il passo finisce il robot e' fermo.
  "backward",  // Indietreggia per la distanza indicata in centimetri. Se il robot e' in moto continuo, il passo ne prende il posto; quando il passo finisce il robot e' fermo.
  "turnLeft",  // Ruota a sinistra dei gradi indicati. Se il robot e' in moto continuo, il passo ne prende il posto; quando il passo finisce il robot e' fermo.
  "turnRight",  // Ruota a destra dei gradi indicati. Se il robot e' in moto continuo, il passo ne prende il posto; quando il passo finisce il robot e' fermo.
  "wait",  // Attende il numero di secondi indicato.
  "readDistance",  // Legge il sonar e restituisce la distanza in centimetri.
  "eyelashesDown",  // Abbassa le ciglia.
  "eyelashesUp",  // Alza le ciglia.
  "readTemperature",  // Restituisce la temperatura dell'aria in gradi Celsius: l'ultima lettura valida del sensore, dalla cache, senza aspettare il sensore. Restituisce nil finche' il robot, appena acceso, non ne ha ancora fatta una.
  "readHumidity",  // Restituisce l'umidita' relativa dell'aria in percentuale, da 0 a 100: l'ultima lettura valida del sensore, dalla cache, senza aspettare il sensore. Restituisce nil finche' il robot, appena acceso, non ne ha ancora fatta una.
  "isBumped",  // Vero se in questo momento almeno uno dei tre contatti del paraurti e' premuto. E' lo stato istantaneo: un urto gia' finito non viene ricordato.
  "isBumpedLeft",  // Vero se in questo momento e' premuto il contatto sinistro del paraurti.
  "isBumpedCenter",  // Vero se in questo momento e' premuto il contatto centrale del paraurti.
  "isBumpedRight",  // Vero se in questo momento e' premuto il contatto destro del paraurti.
  "driveForward",  // Parte in avanti, in linea retta, alla velocita' indicata, e torna subito al programma: il robot continua ad avanzare finche' un altro comando di moto non cambia il moto o stop() non lo ferma.
  "driveBackward",  // Parte all'indietro, in linea retta, alla velocita' indicata, e torna subito al programma. Dura come driveForward().
  "curveLeft",  // Avanza curvando a sinistra alla velocita' indicata, e torna subito al programma: le due ruote girano in avanti, la sinistra piu' piano. Quanto stretta sia la curva lo sceglie il firmware, ed e' la stessa a ogni velocita'. Dura come driveForward().
  "curveRight",  // Avanza curvando a destra alla velocita' indicata, e torna subito al programma: come curveLeft(), con la destra piu' piano.
  "spinLeft",  // Gira su se stesso verso sinistra alla velocita' indicata, e torna subito al programma: le ruote girano in versi opposti. Dura come driveForward().
  "spinRight",  // Gira su se stesso verso destra alla velocita' indicata, e torna subito al programma. Dura come driveForward().
  "stop",  // Ferma le ruote. Il programma prosegue: e' il moto che si ferma, non l'esecuzione. Chiamata a robot fermo non fa niente.
  "seesLine",  // Vero se in questo momento almeno uno dei tre sensori seguilinea vede la linea. E' lo stato istantaneo, come il paraurti. Restituisce nil mentre il paraurti e' premuto, perche' in quel momento il seguilinea non si legge.
  "seesLineLeft",  // Vero se in questo momento il sensore seguilinea sinistro vede la linea. Sinistra e' quella del robot visto da dietro, come per il paraurti. nil nelle stesse condizioni di seesLine().
  "seesLineCenter",  // Vero se in questo momento il sensore seguilinea centrale vede la linea. nil nelle stesse condizioni di seesLine().
  "seesLineRight",  // Vero se in questo momento il sensore seguilinea destro vede la linea. nil nelle stesse condizioni di seesLine().
  "playSound",  // Fa partire il suono indicato e torna subito al programma. Il suono dura quello che dura e poi tace da solo; un altro suono o una nota ne prendono il posto.
  "playNote",  // Fa partire la nota indicata e torna subito al programma. La nota suona finche' il programma non la cambia con un'altra nota o un suono, o non la spegne con silence().
  "silence",  // Spegne lo speaker, qualunque cosa stia suonando. Il programma prosegue. Chiamata a speaker muto non fa niente.
  "setVolume",  // Imposta il volume dello speaker, da 0 a 100: un valore fuori dall'intervallo si porta al limite piu' vicino, e 0 e' muto. Vale per quello che suona adesso e per quello che suonera' dopo, fino alla fine dell'esecuzione. Ogni esecuzione parte dal volume predefinito, che sceglie il firmware.
};

// Le velocita' del moto continuo: tre livelli con un nome, perche' il blocco si legga anche a icone. Quanto valga ciascuno lo sceglie il firmware; l'ordine e' quello crescente.
static const size_t LUA_SPEED_COUNT = 3;
static const char *LUA_SPEED_VALUES[LUA_SPEED_COUNT] = {"slow", "normal", "fast"};

// I suoni con un nome, per chi non legge: il portale ne mostra l'icona, il firmware ne decide il timbro e la durata, che resta breve.
static const size_t LUA_SOUND_COUNT = 4;
static const char *LUA_SOUND_VALUES[LUA_SOUND_COUNT] = {"beep", "happy", "sad", "alarm"};

// Le note che playNote() suona: le naturali dal do centrale al do due ottave sopra, nella notazione scientifica. C4 e' il do centrale, a circa 261,6 Hz, e le frequenze sono quelle del temperamento equabile con A4 a 440 Hz.
static const size_t LUA_NOTE_COUNT = 15;
static const char *LUA_NOTE_VALUES[LUA_NOTE_COUNT] = {"C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"};

}  // namespace arturobot
