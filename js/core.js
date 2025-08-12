
// core.js
const USERS = new Set(["ips-1","ips-2","ips-3","ips-4","ips-5"]);
const PASS  = "bilder";

const DATA = {
  sets: [
    { id:1, code:"ACH-101", name:"Standard-OP Set", department:"Chirurgie" },
    { id:2, code:"ACH-102", name:"Laparoskopie Set", department:"Chirurgie" },
    { id:3, code:"ACH-103", name:"Orthopädie Standard", department:"Ortho" }
  ],
  instruments: [
    { id:1, code:"INST-1", name:"Skalpellgriff Nr. 4", category:"Schneiden" },
    { id:2, code:"INST-2", name:"Schere Metzenbaum 14 cm", category:"Schneiden" },
    { id:3, code:"INST-3", name:"Pinzette anatomisch 14 cm", category:"Greifen" },
    { id:4, code:"INST-4", name:"Klemme Kocher gebogen", category:"Klemmen" },
    { id:5, code:"INST-5", name:"Nadelhalter Mayo-Hegar 16 cm", category:"Halten/Nähen" },
    { id:6, code:"INST-6", name:"Tuchklemme", category:"Fixieren" }
  ],
  setInstruments: [
    { set_id:1, instrument_id:1, qty_required:2 },
    { set_id:1, instrument_id:2, qty_required:1 },
    { set_id:1, instrument_id:3, qty_required:2 },
    { set_id:1, instrument_id:4, qty_required:2 },
    { set_id:1, instrument_id:5, qty_required:1 },
    { set_id:2, instrument_id:1, qty_required:1 },
    { set_id:2, instrument_id:3, qty_required:2 },
    { set_id:2, instrument_id:4, qty_required:2 },
    { set_id:2, instrument_id:6, qty_required:4 },
    { set_id:3, instrument_id:1, qty_required:1 },
    { set_id:3, instrument_id:2, qty_required:2 },
    { set_id:3, instrument_id:4, qty_required:3 },
    { set_id:3, instrument_id:5, qty_required:1 }
  ]
};
const MISSING_REASONS = ["Reparatur","Verlust","in Steri","Sonstiges"];

const KEY_SESSIONS="aemp_sessions_v1"; const KEY_USER="aemp_user_v1";
const KEY_IMG_SETS="aemp_img_sets_v1"; const KEY_IMG_INST="aemp_img_inst_v1";

function loadJSON(k, fallback){
  try { return JSON.parse(localStorage.getItem(k) || JSON.stringify(fallback)); }
  catch(e){ return fallback; }
}
catch{return f} }
function saveJSON(k, v){
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch(e){ console.warn('localStorage save failed for', k, e); if (typeof notify==='function') notify('Speichern im Browser fehlgeschlagen (Speicher voll). Bitte Server-Upload aktivieren.'); return false; }
}
catch(e){ console.warn('localStorage save failed for',k,e); notify('Speichern im Browser fehlgeschlagen (Speicher voll). Bitte Server-Upload aktivieren.'); return false; } }catch(e){} }
function getUser(){ return loadJSON(KEY_USER, null); }
function setUser(u){ saveJSON(KEY_USER, u); }
function logoutUser(){ localStorage.removeItem(KEY_USER); }
function loadSessions(){ return loadJSON(KEY_SESSIONS, {}); }
function saveSessions(s){ saveJSON(KEY_SESSIONS, s); }
function resetSessions(){ localStorage.removeItem(KEY_SESSIONS); localStorage.removeItem(KEY_USER); }
function loadImgOverrides(){ return { sets: loadJSON(KEY_IMG_SETS, {}), inst: loadJSON(KEY_IMG_INST, {}) }; }
function saveImgOverrides(ov){ saveJSON(KEY_IMG_SETS, ov.sets); saveJSON(KEY_IMG_INST, ov.inst); }

function notify(msg){ try{ alert(msg); }catch(e){} }

// DOM
const setListEl = document.getElementById("setList");
const detailsEl = document.getElementById("details");
const searchEl = document.getElementById("search");
const resetBtn = document.getElementById("resetData");
const userBox = document.getElementById("userBox");
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");
const homeBtn = document.getElementById("homeBtn");
const menuView = document.getElementById("menu");
const appTitle = document.getElementById("appTitle");
const btnPackplatz = document.getElementById("btnPackplatz");
const btnSteri = document.getElementById("btnSteri");

let selectedSetId = null;

// Modals
const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const cancelPack = document.getElementById("cancelPack");
const savePack = document.getElementById("savePack");

const lightboxBackdrop = document.getElementById("lightboxBackdrop");
const lightboxImg = document.getElementById("lightboxImg");
const lightboxCaption = document.getElementById("lightboxCaption");
const lightboxClose = document.getElementById("lightboxClose");

const reportBackdrop = document.getElementById("reportBackdrop");
const reportBody = document.getElementById("reportBody");
const reportTitle = document.getElementById("reportTitle");
const reportClose = document.getElementById("reportClose");
const reportPrint = document.getElementById("reportPrint");

const uploadBackdrop = document.getElementById("uploadBackdrop");
const uploadTitle = document.getElementById("uploadTitle");
const uploadFile = document.getElementById("uploadFile");
const uploadClose = document.getElementById("uploadClose");
const uploadCancel = document.getElementById("uploadCancel");
const uploadSave = document.getElementById("uploadSave");

const loginOverlay = document.getElementById("loginOverlay");
const loginForm = document.getElementById("loginForm");
const loginUser = document.getElementById("loginUser");
const loginPass = document.getElementById("loginPass");

// Helpers
function getSetById(id){ return DATA.sets.find(s=>s.id===id); }
function getSetLines(setId){
  return DATA.setInstruments.filter(si=>si.set_id===setId)
    .map(si=>({ ...si, instrument: DATA.instruments.find(i=>i.id===si.instrument_id) }));
}
function computeSetStatus(setId){
  const sess = loadSessions()[setId];
  if (!sess) return { label:"neu", cls:"" };
  if (sess.released_at){
    return { label:"Freigegeben", cls:"good" };
  }
  if (sess.closed_at){
    const hasMissing = sess.lines.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
    return { label: hasMissing ? "Gepackt (Fehlteile)" : "Gepackt (wartet Steri)", cls: hasMissing ? "bad" : "warn" };
  }
  return { label:"in Arbeit", cls:"warn" };
}
