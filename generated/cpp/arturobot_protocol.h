// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

#pragma once

#include <stddef.h>

#define ARTUROBOT_PROTOCOL_VERSION 3
#define ARTUROBOT_PROTOCOL_RELEASE "3.2.0"

namespace arturobot {

// Outcome of the last run, reported in /api/status as "result".
enum RunOutcome {
  RUN_OK = 0,  // Programma completato senza errori.
  RUN_STOPPED = 1,  // Interrotto dall'utente con POST /api/stop.
  RUN_ERROR = 2,  // Fallito: il messaggio e' in 'error'.
};

// Dimensione massima in byte del corpo di POST /api/run.
static const size_t MAX_SCRIPT_BYTES = 16384;

// Ogni quanto il robot si fa vivo con POST /api/device/telemetry. E' il battito da cui il portale deduce che il robot e' acceso: non esiste un altro modo per saperlo.
static const size_t DEVICE_HEARTBEAT_SECONDS = 15;

// Quanto vive un codice di associazione. Breve per costruzione: e' una prova di possesso, non una credenziale. La scadenza vera la tiene il portale, che il codice lo emette, e al robot arriva come expiresAt; ma il robot ha bisogno lo stesso del numero, perche' e' cio' a cui ricade quando quella data non si legge o e' gia' passata. Una data illeggibile dice che i due orologi non vanno d'accordo, non che il portale ha emesso un codice nato morto.
static const size_t CLAIM_CODE_TTL_SECONDS = 300;

// Local HTTP API served by the robot.
static const char *ROUTE_RUN = "/api/run";  // POST
static const char *ROUTE_STOP = "/api/stop";  // POST
static const char *ROUTE_STATUS = "/api/status";  // GET

// CORS headers the robot answers with on every route above. The caller is
// a page on another origin, and since protocol 3 an HTTPS one.
static const char *CORS_ALLOW_ORIGIN = "*";
static const char *CORS_ALLOW_METHODS = "GET, POST, OPTIONS";
static const char *CORS_ALLOW_HEADERS = "Content-Type";

// Cloud API the robot calls when in STA mode. Routes of the same contract
// whose client is a browser are not here: they are not the robot's to call.
static const char *CLOUD_REGISTER = "/api/device/register";  // POST
static const char *CLOUD_SESSION = "/api/device/session";  // POST
static const char *CLOUD_CLAIM_CODE = "/api/device/claim-code";  // POST
static const char *CLOUD_TELEMETRY = "/api/device/telemetry";  // POST

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
static const size_t LUA_API_COUNT = 8;
static const char *LUA_API_NAMES[LUA_API_COUNT] = {
  "forward",  // Avanza per la distanza indicata in centimetri.
  "backward",  // Indietreggia per la distanza indicata in centimetri.
  "turnLeft",  // Ruota a sinistra dei gradi indicati.
  "turnRight",  // Ruota a destra dei gradi indicati.
  "wait",  // Attende il numero di secondi indicato.
  "readDistance",  // Legge il sonar e restituisce la distanza in centimetri.
  "eyelashesDown",  // Abbassa le ciglia.
  "eyelashesUp",  // Alza le ciglia.
};

}  // namespace arturobot
