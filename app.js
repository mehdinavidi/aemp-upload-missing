
/* AEMP Pack-Demo – V.1.0.02
   - Single Packplatz
   - Hauptmenü nach Login
   - Home-Button, Logout-Icon
   - Bildverwaltung per Button (hochladen/löschen)
   - Fix: kein Syntaxfehler, garantiertes Rendering & Auto-Select erstes Set
*/

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

// Modals
const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const cancelPack = document.getElementById("cancelPack");
const savePack = document.getElementById("savePack");
const lbBackdrop = document.getElementById("lightboxBackdrop");
const lbImg = document.getElementById("lightboxImg");
const lbCaption = document.getElementById("lightboxCaption");
const lbClose = document.getElementById("lightboxClose");
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

let currentUploadTarget = null; // {kind:'set'|'inst', id}

// View helpers
function showMainMenu(){
  menuView.classList.remove("hidden");
  document.getElementById("details").classList.add("hidden");
  archiveView.classList.add("hidden");
  setListEl.classList.add("hidden");
  searchEl.classList.add("hidden");
  homeBtn.classList.add("hidden"); userBox.classList.remove("hidden"); userBox.style.display='flex';
  appTitle.textContent = "AEMP • Hauptmenü";
}
function showWorkspace(){
  menuView.classList.add("hidden");
  archiveView.classList.add("hidden");
  document.getElementById("details").classList.remove("hidden");
  setListEl.classList.remove("hidden");
  searchEl.classList.remove("hidden");
  homeBtn.classList.remove("hidden"); userBox.classList.remove("hidden"); userBox.style.display='flex';
  appTitle.textContent = "AEMP Pack-Demo";

  renderSetList(searchEl.value || "");
  if (!selectedSetId && DATA.sets.length > 0) selectedSetId = DATA.sets[0].id;
  renderSetList(searchEl.value || ""); // set active class
  renderDetails();
}

// Auth
function requireLogin(){
  const u = getUser();
  if (!u){
    loginOverlay.classList.remove("hidden");
    userBox.classList.add("hidden");
  } else {
    loginOverlay.classList.add("hidden");
    userBox.classList.remove("hidden"); userBox.style.display='flex';
    userNameEl.textContent = u.username;
    showMainMenu(); // immer ins Menü
    // pre-render so Workspace später sofort da ist
    renderSetList(searchEl.value || "");
    renderDetails();
  }
}
loginForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const username = (loginUser.value || "").trim().toLowerCase();
  const pass = loginPass.value || "";
  if (!USERS.has(username) || pass !== PASS){ alert("Ungültige Zugangsdaten. Demo: ips-1 … ips-5 / bilder"); return; }
  setUser({ username });
  requireLogin();
});
logoutBtn.addEventListener("click", (e)=>{ e.preventDefault(); console.log('logout clicked'); logoutUser(); selectedSetId = null; requireLogin(); });
homeBtn.addEventListener("click", showMainMenu);

// Lightbox
function openLightbox(src, caption=""){
  if (!src) return;
  lbImg.src = src; lbCaption.textContent = caption;
  lbBackdrop.classList.remove("hidden"); lbBackdrop.classList.add("show");
}
function closeLightbox(){ lbBackdrop.classList.remove("show"); lbBackdrop.classList.add("hidden"); lbImg.src=""; lbCaption.textContent=""; }
lbBackdrop.addEventListener("click",(e)=>{ if (e.target===lbBackdrop) closeLightbox(); });
lbClose.addEventListener("click", closeLightbox);

// Data helpers
function getSetById(id){ return DATA.sets.find(s=>s.id===id); }
function getSetLines(setId){
  return DATA.setInstruments.filter(si=>si.set_id===setId)
    .map(si=>({ ...si, instrument: DATA.instruments.find(i=>i.id===si.instrument_id) }));
}
function imgThumb(obj){ const ov=loadImgOverrides(); if (obj.code && ov.sets[obj.code]) return ov.sets[obj.code].thumb; if (obj.id && ov.inst[obj.id]) return ov.inst[obj.id].thumb; return ""; }
function imgFull(obj){ const ov=loadImgOverrides(); if (obj.code && ov.sets[obj.code]) return ov.sets[obj.code].full; if (obj.id && ov.inst[obj.id]) return ov.inst[obj.id].full; return ""; }
function hasAnyImage(o){ return !!(imgThumb(o) || imgFull(o)); }

function computeSetStatus(setId){
  const sessions = loadSessions();
  const s = sessions[setId];
  if (!s) return { label:"neu", cls:"" };
  if (s.closed_at){
    const hasMissing = s.lines.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
    return { label: hasMissing ? "Abgeschlossen (Fehlteile)" : "Abgeschlossen", cls: hasMissing ? "bad" : "good" };
  }
  return { label:"in Arbeit", cls:"warn" };
}

// Render set list
function renderSetList(filter=""){
  const q = filter.trim().toLowerCase();
  setListEl.innerHTML = "";
  const results = DATA.sets.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  if (!results.length){
    const div = document.createElement("div");
    div.style.padding="12px"; div.innerHTML='<span class="meta">Keine Sets gefunden.</span>'; setListEl.appendChild(div);
    return;
  }
  results.forEach(s=>{
    const item = document.createElement("div");
    item.className = "item" + (s.id===selectedSetId ? " active": "");
    const status = computeSetStatus(s.id);
    const t = imgThumb(s);
    item.innerHTML = `
      <img class="thumb" src="${t || ''}" alt="${s.code} Bild" />
      <div><div class="title">${s.code} – ${s.name}</div><span class="meta">${s.department}</span></div>
      <div><span class="badge ${status.cls}">${status.label}</span></div>`;
    item.addEventListener("click", ()=>{ selectedSetId = s.id; renderSetList(q); renderDetails(); });
    const im = item.querySelector("img");
    if (imgFull(s)){ im.style.cursor="zoom-in"; im.addEventListener("click",(ev)=>{ ev.stopPropagation(); openLightbox(imgFull(s), `${s.code} – ${s.name}`); }); }
    setListEl.appendChild(item);
  });
}

// Upload (manual)
function openUpload(target){ currentUploadTarget = target; uploadFile.value=""; uploadSave.disabled=true; uploadBackdrop.classList.remove("hidden"); uploadBackdrop.classList.add("show"); }
function closeUpload(){ uploadBackdrop.classList.remove("show"); uploadBackdrop.classList.add("hidden"); currentUploadTarget=null; }
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
uploadClose.addEventListener("click", closeUpload);
uploadCancel.addEventListener("click", closeUpload);
uploadFile.addEventListener("change", ()=> uploadSave.disabled = !uploadFile.files?.length );
uploadSave.addEventListener("click", async ()=>{
  if (!currentUploadTarget || !uploadFile.files?.length) return;
  const dataUrl = await fileToDataURL(uploadFile.files[0]);
  const ov = loadImgOverrides();
  if (currentUploadTarget.kind === 'set'){ ov.sets[currentUploadTarget.id] = { thumb:dataUrl, full:dataUrl }; }
  else { ov.inst[currentUploadTarget.id] = { thumb:dataUrl, full:dataUrl }; }
  saveImgOverrides(ov);
  closeUpload(); renderSetList(searchEl.value); renderDetails();
});
function deleteImage(target){
  const ov = loadImgOverrides();
  if (target.kind==='set'){ delete ov.sets[target.id]; } else { delete ov.inst[target.id]; }
  saveImgOverrides(ov); renderSetList(searchEl.value); renderDetails();
}

// Details
function renderDetails(){
  if (!selectedSetId){
    detailsEl.innerHTML = '<div class="placeholder"><h2>Wähle links ein Set aus</h2><p>Dann siehst du hier die Details und kannst den Packvorgang starten.</p></div>';
    return;
  }
  const s = getSetById(selectedSetId);
  const lines = getSetLines(selectedSetId);
  const sessions = loadSessions();
  const cur = sessions[selectedSetId];
  const status = computeSetStatus(selectedSetId);

  const rows = lines.map(l => `
    <tr>
      <td>${ hasAnyImage(l.instrument)
        ? `<img class="ithumb" src="${imgThumb(l.instrument)}" alt="${l.instrument.name}" data-zoom-src="${imgFull(l.instrument)}" data-caption="${l.instrument.name}">`
        : '<span class="meta">kein Bild</span>' }</td>
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td>${l.instrument.category}</td>
      <td>
        <button class="btn-small" data-action="inst-upload" data-id="${l.instrument.id}">Bild ändern</button>
        <button class="btn-small" data-action="inst-delete" data-id="${l.instrument.id}">Löschen</button>
      </td>
    </tr>`).join("");

  detailsEl.innerHTML = `
    <h2>${s.code} – ${s.name}</h2>
    <p class="subtle">${s.department} • Status: <span class="badge ${status.cls}">${status.label}</span></p>
    <div class="toolbar">
      ${ hasAnyImage(s)
        ? `<img class="ithumb" src="${imgThumb(s)}" alt="${s.code}" style="width:120px;height:80px;cursor:${imgFull(s)?'zoom-in':'default'};border-radius:8px;border:1px solid var(--chip-border)" ${imgFull(s)?`data-zoom-src="${imgFull(s)}" data-caption="${s.code} – ${s.name}"`:''}>`
        : '<span class="meta">Kein Set-Bild</span>' }
      <button id="btnSetImgUpload">Bild hochladen/ändern</button>
      <button id="btnSetImgDelete">Bild löschen</button>
    </div>
    <table class="table">
      <thead><tr><th></th><th>Instrument</th><th class="qty">Soll</th><th>Kategorie</th><th>Bild</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <div class="toolbar">
      <button id="startPack" class="primary">Packvorgang starten</button>
      ${cur ? '<button id="reportBtn" class="secondary">Packreport</button>' : ''}
      ${cur ? '<button id="editPack" class="secondary">Bearbeiten</button>' : ''}
      ${cur ? '<button id="releasePack" class="secondary">Freigeben</button>' : ''}
      ${cur ? '<button id="cancelPackBtn" class="secondary">Stornieren</button>' : ''}
      ${cur && !cur.closed_at ? '<span class="badge warn">in Arbeit</span>' : ''}
    </div>`;

  // Lightbox
  detailsEl.querySelectorAll("[data-zoom-src]").forEach(el => {
    el.addEventListener("click", () => openLightbox(el.getAttribute("data-zoom-src"), el.getAttribute("data-caption") || ""));
  });
  // Set image buttons
  document.getElementById("btnSetImgUpload").onclick = () => openUpload({kind:'set', id: s.code});
  document.getElementById("btnSetImgDelete").onclick = () => { if (confirm("Set-Bild wirklich löschen?")) deleteImage({kind:'set', id: s.code}); };
  // Instrument buttons
  detailsEl.querySelectorAll("button[data-action='inst-upload']").forEach(b => b.addEventListener("click", ()=> openUpload({kind:'inst', id: parseInt(b.dataset.id,10)})));
  detailsEl.querySelectorAll("button[data-action='inst-delete']").forEach(b => b.addEventListener("click", ()=> { if (confirm("Instrument-Bild wirklich löschen?")) deleteImage({kind:'inst', id: parseInt(b.dataset.id,10)}); }));
  // Pack buttons
  const startBtn = document.getElementById("startPack"); if (startBtn){ startBtn.addEventListener("click", ()=>{ console.log("Start Pack clicked"); openPackModal(s, lines); }); }
  const rb = document.getElementById("reportBtn"); if (rb) rb.onclick = () => openReport(selectedSetId);
  const eb = document.getElementById("editPack"); if (eb) eb.onclick = () => editExistingPack(selectedSetId);
  const rel = document.getElementById("releasePack"); if (rel) rel.onclick = () => releaseCurrentPack(selectedSetId);
  const cb = document.getElementById("cancelPackBtn"); if (cb) cb.onclick = () => cancelCurrentPack(selectedSetId);
}

// Pack modal
function openPackModal(setObj, lines){
  const u = getUser(); if (!u){ requireLogin(); return; }
  modalTitle.textContent = `Packvorgang – ${setObj.code} (User: ${u.username})`;
  modalBackdrop.classList.remove('hidden'); modalBackdrop.style.display='flex';
  modalBackdrop.classList.remove("hidden"); modalBackdrop.classList.add("show");
  const rows = lines.map((l, idx)=>`
    <tr data-idx="${idx}">
      <td>${hasAnyImage(l.instrument) ? `<img class="ithumb" src="${imgThumb(l.instrument)}" alt="${l.instrument.name}" data-zoom-src="${imgFull(l.instrument)}" data-caption="${l.instrument.name}">` : '<span class="meta">kein Bild</span>'}</td>
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td class="qty"><div class="qtyctrl"><button type="button" class="minus">−</button><input type="number" min="0" step="1" value="${l.qty_required}" class="qtyInput"/><button type="button" class="plus">+</button></div></td>
      <td class="checkbox-center"><input class="missingCb" type="checkbox" /></td>
      <td><select class="reasonSel"><option value="">— Grund wählen —</option>${MISSING_REASONS.map(r=>`<option value="${r}">${r}</option>`).join("")}</select></td>
      <td><textarea class="note" rows="1" placeholder="Notiz (optional)"></textarea></td>
    </tr>`).join("");
  modalBody.innerHTML = `<table class="table"><thead><tr><th></th><th>Instrument</th><th class="qty">Soll</th><th class="qty">Ist</th><th>Fehlteil?</th><th>Grund</th><th>Notiz</th></tr></thead><tbody>${rows}</tbody></table>`;

  // wire
  modalBody.querySelectorAll("[data-zoom-src]").forEach(el => el.addEventListener("click", ()=> openLightbox(el.getAttribute("data-zoom-src"), el.getAttribute("data-caption") || "")));
  modalBody.querySelectorAll("tbody tr").forEach(tr => {
    const idx = parseInt(tr.dataset.idx,10);
    const req = lines[idx].qty_required;
    const input = tr.querySelector(".qtyInput");
    const minus = tr.querySelector(".minus");
    const plus  = tr.querySelector(".plus");
    const cb = tr.querySelector(".missingCb");
    const reason = tr.querySelector(".reasonSel");
    function syncMissing(){
      const val = parseInt(input.value || "0", 10);
      const missing = val < req;
      cb.checked = missing; reason.disabled = !missing; if (!missing) reason.value = "";
    }
    input.addEventListener("input", syncMissing);
    minus.addEventListener("click", ()=>{ input.value = Math.max(0, (parseInt(input.value||"0",10)-1)); syncMissing(); });
    plus.addEventListener("click", ()=>{ input.value = (parseInt(input.value||"0",10)+1); syncMissing(); });
    cb.addEventListener("change", ()=>{ reason.disabled = !cb.checked; if (!cb.checked) reason.value=""; });
    syncMissing();
  });
}
function closeModal(){ modalBackdrop.classList.remove("show"); modalBackdrop.classList.add("hidden"); }
modalClose.onclick = closeModal; cancelPack.onclick = closeModal;
savePack.onclick = ()=>{
  const u = getUser(); if (!selectedSetId || !u) return;
  const lines = getSetLines(selectedSetId);
  const rows = Array.from(modalBody.querySelectorAll("tbody tr"));
  const captured = rows.map((tr, idx)=>{
    const req = lines[idx].qty_required;
    const qty_found = parseInt(tr.querySelector(".qtyInput").value || "0", 10);
    const missing = tr.querySelector(".missingCb").checked || qty_found < req;
    const reason = tr.querySelector(".reasonSel").value || null;
    const note = tr.querySelector(".note").value || null;
    return { instrument_id: lines[idx].instrument_id, instrument_name: lines[idx].instrument.name, qty_required: req, qty_found, missing, reason, note };
  });
  const hasMissing = captured.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
  const sessions = loadSessions();
  sessions[selectedSetId] = { set_id: selectedSetId, started_by: sessions[selectedSetId]?.started_by || u.username, started_at: sessions[selectedSetId]?.started_at || new Date().toISOString(), closed_by: u.username, closed_at: new Date().toISOString(), status: hasMissing ? "closed_with_missing" : "closed_ok", lines: captured };
  saveSessions(sessions);
  closeModal(); renderSetList(searchEl.value); renderDetails(); alert("Packvorgang gespeichert.");
};

// Report
function openReport(setId){
  const s = getSetById(setId); const sess = loadSessions()[setId];
  if (!sess){ alert("Kein Packvorgang vorhanden."); return; }
  reportTitle.textContent = `Packreport – ${s.code} – ${s.name}`;
  const rows = sess.lines.map(l=>`<tr><td>${l.instrument_name}</td><td>${l.qty_required}</td><td>${l.qty_found}</td><td>${(l.qty_found<l.qty_required||l.missing) ? "Ja" : "Nein"}</td><td>${l.reason || ""}</td><td>${l.note || ""}</td></tr>`).join("");
  reportBody.innerHTML = `<div class="muted">Abgeschlossen: ${new Date(sess.closed_at).toLocaleString()}</div><div class="muted">Benutzer: ${sess.closed_by || sess.started_by || "-"}</div><table><thead><tr><th>Instrument</th><th>Soll</th><th>Ist</th><th>Fehlteil</th><th>Grund</th><th>Notiz</th></tr></thead><tbody>${rows}</tbody></table>`;
  reportBackdrop.classList.remove("hidden"); reportBackdrop.classList.add("show");
}
reportClose.addEventListener("click", ()=>{ reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden"); });
reportBackdrop.addEventListener("click", (e)=>{ if (e.target===reportBackdrop){ reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden"); } });
reportPrint.addEventListener("click", ()=> window.print());

// Edit / Release / Cancel
function editExistingPack(setId){
  const sess = loadSessions()[setId]; if (!sess){ alert("Kein Packvorgang vorhanden."); return; }
  const s = getSetById(setId); const lines = getSetLines(setId);
  openPackModal(s, lines);
  const rows = Array.from(modalBody.querySelectorAll("tbody tr"));
  rows.forEach((tr, idx)=>{
    const line = sess.lines[idx]; if(!line) return;
    tr.querySelector(".qtyInput").value = String(line.qty_found ?? line.qty_required);
    tr.querySelector(".missingCb").checked = !!line.missing;
    tr.querySelector(".reasonSel").value = line.reason || "";
    tr.querySelector(".note").value = line.note || "";
    const req = lines[idx].qty_required;
    const val = parseInt(tr.querySelector(".qtyInput").value||"0",10);
    tr.querySelector(".missingCb").checked = val < req;
    tr.querySelector(".reasonSel").disabled = !(val < req);
  });
}
function releaseCurrentPack(setId){
  const sessions = loadSessions(); const sess = sessions[setId];
  if(!sess){ alert("Kein Packvorgang vorhanden."); return; }
  if(!confirm("Diesen Packvorgang freigeben? Danach kann das Set erneut gepackt werden. (Vorgang wird ins Archiv verschoben)")) return;
  sess.released_at = new Date().toISOString(); sess.released_by = (getUser()||{}).username || null;
  sess.status = (sess.status||'closed_ok') + "_released"; archiveSession(sess);
  delete sessions[setId]; saveSessions(sessions); renderSetList(searchEl.value); renderDetails();
  alert("Freigegeben. Das Set kann erneut gepackt werden.");
}
function cancelCurrentPack(setId){
  const sessions = loadSessions(); const sess = sessions[setId];
  if(!sess){ alert("Kein Packvorgang vorhanden."); return; }
  if(!confirm("Diesen Packvorgang wirklich stornieren? (Wird nicht archiviert)")) return;
  delete sessions[setId]; saveSessions(sessions); renderSetList(searchEl.value); renderDetails();
  alert("Packvorgang storniert.");
}

// Menu actions
btnPackplatz.addEventListener("click", showWorkspace);

// Suche / Reset
searchEl.addEventListener("input", ()=> renderSetList(searchEl.value));
resetBtn.addEventListener("click", ()=>{
  if (confirm("Lokale Packdaten & Login zurücksetzen? (Bilder bleiben erhalten)")){
    resetSessions(); selectedSetId = null; requireLogin();
  }
});

// Mobile drawer
const drawer = document.getElementById("setList");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
function openDrawer(){ drawer.classList.remove("hidden"); drawer.classList.add("open"); drawerBackdrop.classList.add("show"); }
function closeDrawer(){ drawer.classList.remove("open"); drawerBackdrop.classList.remove("show"); }
if (toggleSidebarBtn) toggleSidebarBtn.addEventListener("click", openDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
function maybeCloseDrawerForMobile(){ if (window.matchMedia("(max-width: 900px)").matches) closeDrawer(); }
const _origRenderSetList = renderSetList;
renderSetList = function(filter=""){
  _origRenderSetList(filter);
  document.querySelectorAll("#setList .item").forEach(el => el.addEventListener("click", ()=> { maybeCloseDrawerForMobile(); }, { once:true }));
};

// Init
requireLogin();
