// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

export const PROTOCOL_VERSION = 2
export const PROTOCOL_MIN_SUPPORTED = 2

export const RUN_OUTCOME = {
  OK: 0,
  STOPPED: 1,
  ERROR: 2,
}

export const LAN_ROUTES = {
  RUN: "/api/run",
  STOP: "/api/stop",
  STATUS: "/api/status",
}

export const CLOUD_ROUTES = {
  REGISTER: "/api/device/register",
  SESSION: "/api/device/session",
  CLAIM_CODE: "/api/device/claim-code",
  CLAIM: "/api/device/claim",
  PROGRAM: "/api/device/program",
  TELEMETRY: "/api/device/telemetry",
}

export const MAX_SCRIPT_BYTES = 16384
export const DEVICE_HEARTBEAT_SECONDS = 15
export const DEVICE_OFFLINE_AFTER_SECONDS = 45
export const CLAIM_CODE_TTL_SECONDS = 300

export const LUA_API = ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp"]

export const LUA_SIGNATURES = {
  forward: { args: 1, returns: "void" },
  backward: { args: 1, returns: "void" },
  turnLeft: { args: 1, returns: "void" },
  turnRight: { args: 1, returns: "void" },
  wait: { args: 1, returns: "void" },
  readDistance: { args: 0, returns: "number" },
  eyelashesDown: { args: 0, returns: "void" },
  eyelashesUp: { args: 0, returns: "void" },
}

export const LUA_STDLIB_ALLOWED = ["base", "math", "string", "table"]
