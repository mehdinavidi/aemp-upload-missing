const USERS = new Set(["ips-1","ips-2","ips-3","ips-4","ips-5"]);
const PASS = "bilder";

// Demo-Daten (statisch als Seed)
const DATA = {
  sets: [
    { id: 1, code: "ACH-101", name: "Standard-OP Set", department: "Chirurgie" },
    { id: 2, code: "ACH-102", name: "Laparoskopie Set", department: "Chirurgie" },
    { id: 3, code: "ACH-103", name: "Orthopädie Standard", department: "Ortho" }
  ],
  instruments: [
    { id: 1, code: "INST-1", name: "Skalpellgriff Nr. 4", category: "Schneiden" },
    { id: 2, code: "INST-2", name: "Schere Metzenbaum 14 cm", category: "Schneiden" },
    { id: 3, code: "INST-3", name: "Pinzette anatomisch 14 cm", category: "Greifen" },
    { id: 4, code: "INST-4", name: "Klemme Kocher gebogen", category: "Klemmen" },
    { id: 5, code: "INST-5", name: "Nadelhalter Mayo-Hegar 16 cm", category: "Halten/Nähen" },
    { id: 6, code: "INST-6", name: "Tuchklemme", category: "Fixieren" }
  ],
  setInstruments: [
    { set_id: 1, instrument_id: 1, qty_required: 2 },
    { set_id: 1, instrument_id: 2, qty_required: 1 },
    { set_id: 1, instrument_id: 3, qty_required: 2 },
    { set_id: 1, instrument_id: 4, qty_required: 2 },
    { set_id: 1, instrument_id: 5, qty_required: 1 },
    { set_id: 2, instrument_id: 1, qty_required: 1 },
    { set_id: 2, instrument_id: 3, qty_required: 2 },
    { set_id: 2, instrument_id: 4, qty_required: 2 },
    { set_id: 2, instrument_id: 6, qty_required: 4 },
    { set_id: 3, instrument_id: 1, qty_required: 1 },
    { set_id: 3, instrument_id: 2, qty_required: 2 },
    { set_id: 3, instrument_id: 4, qty_required: 3 },
    { set_id: 3, instrument_id: 5, qty_required: 1 }
  ]
};

const MISSING_REASONS = ["Reparatur", "Verlust", "in Steri", "Sonstiges"];

// Storage keys
const KEY_SESSIONS = "aemp_demo_sessions_v6";
const KEY_USER = "aemp_demo_user_v4";
const KEY_ARCHIVE = "aemp_demo_archive_v3";
const KEY_IMG_SETS = "aemp_demo_img_sets";
const KEY_IMG_INST = "aemp_demo_img_inst";

// Helpers: storage
function loadJSON(key, fallback){ try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function saveJSON(key, val){ try { localStorage.setItem(key, JSON.stringify(val)); } catch(e){} }
function loadSessions(){ return loadJSON(KEY_SESSIONS, {}); }
function saveSessions(s){ saveJSON(KEY_SESSIONS, s); }
function resetSessions(){ localStorage.removeItem(KEY_SESSIONS); localStorage.removeItem(KEY_USER); }
function getUser(){ return loadJSON(KEY_USER, null); }
function setUser(u){ saveJSON(KEY_USER, u); }
function logoutUser(){ localStorage.removeItem(KEY_USER); }
function loadArchive(){ return loadJSON(KEY_ARCHIVE, []); }
function saveArchive(a){ saveJSON(KEY_ARCHIVE, a); }
function archiveSession(sess){ const a = loadArchive(); a.unshift(sess); saveArchive(a); }
function loadImgOverrides(){ return { sets: loadJSON(KEY_IMG_SETS, {}), inst: loadJSON(KEY_IMG_INST, {}) }; }
function saveImgOverrides(ov){ saveJSON(KEY_IMG_SETS, ov.sets); saveJSON(KEY_IMG_INST, ov.inst); }

// DOM refs
const setListEl = document.getElementById("setList");
const detailsEl = document.getElementById("details");
const searchEl = document.getElementById("search");
const resetBtn = document.getElementById("resetData");
const userBox = document.getElementById("userBox");
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const homeBtn = document.getElementById("homeBtn");
const menuView = document.getElementById("menu");
const archiveView = document.getElementById("archiveView");
const appTitle = document.getElementById("appTitle");
const btnPackplatz = document.getElementById("btnPackplatz");

let selectedSetId = null;

window.selectedSetId = selectedSetId;
