// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

#pragma once

#include <stddef.h>

#define ARTUROBOT_PROTOCOL_VERSION 2

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

// Dopo quanto silenzio il portale considera spento un robot. Sono tre battiti mancati: uno solo trasformerebbe ogni pacchetto perso in uno spegnimento.
static const size_t DEVICE_OFFLINE_AFTER_SECONDS = 45;

// Quanto vive un codice di associazione. Breve per costruzione: e' una prova di possesso, non una credenziale.
static const size_t CLAIM_CODE_TTL_SECONDS = 300;

// Local HTTP API served by the robot.
static const char *ROUTE_RUN = "/api/run";  // POST
static const char *ROUTE_STOP = "/api/stop";  // POST
static const char *ROUTE_STATUS = "/api/status";  // GET

// Cloud API the robot calls when in STA mode.
static const char *CLOUD_REGISTER = "/api/device/register";  // POST
static const char *CLOUD_SESSION = "/api/device/session";  // POST
static const char *CLOUD_CLAIM_CODE = "/api/device/claim-code";  // POST
static const char *CLOUD_CLAIM = "/api/device/claim";  // POST
static const char *CLOUD_PROGRAM = "/api/device/program";  // GET
static const char *CLOUD_TELEMETRY = "/api/device/telemetry";  // POST

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
