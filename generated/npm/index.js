// Generato da arturobot-protocol. Non modificare a mano.
// La sorgente sta in protocol/*.json; rigenera con: node tools/generate.mjs

export const PROTOCOL_RELEASE = "5.4.1"

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
  HEARTBEAT: "/api/device/heartbeat",
}

export const ERROR_FIELD = "code"
export const LAN_ERRORS = ["empty_body", "script_too_long", "busy", "out_of_memory"]
export const CLOUD_ERRORS = ["rate_limited", "invalid_request", "bad_device_credentials", "bad_device_token", "unknown_claim_code", "already_paired"]

export const DEVICE_AUTH_HEADER = "Authorization"
export const DEVICE_AUTH_SCHEME = "Bearer"

export const MAX_SCRIPT_BYTES = 16384
export const MAX_OUTPUT_LINES = 20
export const MAX_OUTPUT_LINE_BYTES = 120
export const DEVICE_HEARTBEAT_SECONDS = 15
export const DEVICE_OFFLINE_AFTER_SECONDS = 45
export const CLAIM_CODE_TTL_SECONDS = 300

export const LUA_API = ["forward", "backward", "turnLeft", "turnRight", "wait", "readDistance", "eyelashesDown", "eyelashesUp", "readTemperature", "readHumidity", "isBumped", "isBumpedLeft", "isBumpedCenter", "isBumpedRight", "driveForward", "driveBackward", "curveLeft", "curveRight", "spinLeft", "spinRight", "stop", "seesLine", "seesLineLeft", "seesLineCenter", "seesLineRight", "playSound", "playNote", "silence", "setVolume"]

export const LUA_SIGNATURES = {
  forward: { args: 1, argTypes: ["number"], returns: "void", nullable: false },
  backward: { args: 1, argTypes: ["number"], returns: "void", nullable: false },
  turnLeft: { args: 1, argTypes: ["number"], returns: "void", nullable: false },
  turnRight: { args: 1, argTypes: ["number"], returns: "void", nullable: false },
  wait: { args: 1, argTypes: ["number"], returns: "void", nullable: false },
  readDistance: { args: 0, argTypes: [], returns: "number", nullable: false },
  eyelashesDown: { args: 0, argTypes: [], returns: "void", nullable: false },
  eyelashesUp: { args: 0, argTypes: [], returns: "void", nullable: false },
  readTemperature: { args: 0, argTypes: [], returns: "number", nullable: false },
  readHumidity: { args: 0, argTypes: [], returns: "number", nullable: false },
  isBumped: { args: 0, argTypes: [], returns: "boolean", nullable: false },
  isBumpedLeft: { args: 0, argTypes: [], returns: "boolean", nullable: false },
  isBumpedCenter: { args: 0, argTypes: [], returns: "boolean", nullable: false },
  isBumpedRight: { args: 0, argTypes: [], returns: "boolean", nullable: false },
  driveForward: { args: 1, argTypes: ["speed"], returns: "void", nullable: false },
  driveBackward: { args: 1, argTypes: ["speed"], returns: "void", nullable: false },
  curveLeft: { args: 1, argTypes: ["speed"], returns: "void", nullable: false },
  curveRight: { args: 1, argTypes: ["speed"], returns: "void", nullable: false },
  spinLeft: { args: 1, argTypes: ["speed"], returns: "void", nullable: false },
  spinRight: { args: 1, argTypes: ["speed"], returns: "void", nullable: false },
  stop: { args: 0, argTypes: [], returns: "void", nullable: false },
  seesLine: { args: 0, argTypes: [], returns: "boolean", nullable: true },
  seesLineLeft: { args: 0, argTypes: [], returns: "boolean", nullable: true },
  seesLineCenter: { args: 0, argTypes: [], returns: "boolean", nullable: true },
  seesLineRight: { args: 0, argTypes: [], returns: "boolean", nullable: true },
  playSound: { args: 1, argTypes: ["sound"], returns: "void", nullable: false },
  playNote: { args: 1, argTypes: ["note"], returns: "void", nullable: false },
  silence: { args: 0, argTypes: [], returns: "void", nullable: false },
  setVolume: { args: 1, argTypes: ["number"], returns: "void", nullable: false },
}

export const LUA_VALUES = {
  speed: ["slow", "normal", "fast"],
  sound: ["beep", "happy", "sad", "alarm"],
  note: ["C4", "D4", "E4", "F4", "G4", "A4", "B4", "C5", "D5", "E5", "F5", "G5", "A5", "B5", "C6"],
}

export const LUA_STDLIB_ALLOWED = ["base", "math", "string", "table"]
