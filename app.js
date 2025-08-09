
/* AEMP Pack-Demo – GitHub Pages + Upload-on-missing
   Login: ips-1..ips-5 / bilder
   Neu: Wenn ein Set/Instrument kein Bild hat, wirst du nach Login gefragt, ob du eins hochladen willst.
   Uploads werden lokal (localStorage) als Data-URL gespeichert (kein Server nötig).
*/

const USERS = new Set(["ips-1","ips-2","ips-3","ips-4","ips-5"]);
const PASS = "bilder";

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

// ----- Storage helpers -----
const KEY_SESSIONS = "aemp_demo_sessions_v4";
const KEY_USER = "aemp_demo_user_v2";
const KEY_IMG_SETS = "aemp_demo_img_sets";
const KEY_IMG_INST = "aemp_demo_img_inst";

function loadJSON(key, fallback) { try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); } catch { return fallback; } }
function saveJSON(key, val) { try { localStorage.setItem(key, JSON.stringify(val)); } catch(e) { console.warn(e); } }

function loadSessions() { return loadJSON(KEY_SESSIONS, {}); }
function saveSessions(s) { saveJSON(KEY_SESSIONS, s); }
function resetSessions() { localStorage.removeItem(KEY_SESSIONS); localStorage.removeItem(KEY_USER); }

function getUser() { return loadJSON(KEY_USER, null); }
function setUser(u) { saveJSON(KEY_USER, u); }
function logoutUser() { localStorage.removeItem(KEY_USER); }

function loadImgOverrides() { return { sets: loadJSON(KEY_IMG_SETS, {}), inst: loadJSON(KEY_IMG_INST, {}) }; }
function saveImgOverrides(ov) { saveJSON(KEY_IMG_SETS, ov.sets); saveJSON(KEY_IMG_INST, ov.inst); }

// ----- DOM refs -----
const setListEl = document.getElementById("setList");
const detailsEl = document.getElementById("details");
const searchEl = document.getElementById("search");
const resetBtn = document.getElementById("resetData");
const userBox = document.getElementById("userBox");
const userNameEl = document.getElementById("userName");
const logoutBtn = document.getElementById("logoutBtn");

// Pack Modal
const modalBackdrop = document.getElementById("modalBackdrop");
const modalBody = document.getElementById("modalBody");
const modalTitle = document.getElementById("modalTitle");
const modalClose = document.getElementById("modalClose");
const cancelPack = document.getElementById("cancelPack");
const savePack = document.getElementById("savePack");

// Lightbox
const lbBackdrop = document.getElementById("lightboxBackdrop");
const lbImg = document.getElementById("lightboxImg");
const lbCaption = document.getElementById("lightboxCaption");
const lbClose = document.getElementById("lightboxClose");

// Report
const reportBackdrop = document.getElementById("reportBackdrop");
const reportBody = document.getElementById("reportBody");
const reportTitle = document.getElementById("reportTitle");
const reportClose = document.getElementById("reportClose");
const reportPrint = document.getElementById("reportPrint");

// Upload-on-missing
const uploadBackdrop = document.getElementById("uploadBackdrop");
const uploadTitle = document.getElementById("uploadTitle");
const uploadBody = document.getElementById("uploadBody");
const uploadClose = document.getElementById("uploadClose");
const uploadFile = document.getElementById("uploadFile");
const uploadSkip = document.getElementById("uploadSkip");
const uploadSave = document.getElementById("uploadSave");

let selectedSetId = null;

// ----- Utils -----
function getSetById(id) { return DATA.sets.find(s => s.id === id); }
function getSetLines(setId) {
  return DATA.setInstruments
    .filter(si => si.set_id === setId)
    .map(si => ({ ...si, instrument: DATA.instruments.find(i => i.id === si.instrument_id) }));
}
function thumb(obj) { const ov = loadImgOverrides(); const id = obj.code || obj.id; const t = (obj.thumb_url || obj.image_url); if (obj.code && ov.sets[obj.code]?.thumb) return ov.sets[obj.code].thumb; if (obj.id && ov.inst[obj.id]?.thumb) return ov.inst[obj.id].thumb; return t || ""; }
function full(obj)  { const ov = loadImgOverrides(); const id = obj.code || obj.id; const f = (obj.full_url || obj.image_url); if (obj.code && ov.sets[obj.code]?.full) return ov.sets[obj.code].full; if (obj.id && ov.inst[obj.id]?.full) return ov.inst[obj.id].full; return f || ""; }
function hasAnyImage(obj) { return Boolean(thumb(obj) || full(obj)); }

// ----- Auth -----
function requireLogin() {
  const u = getUser();
  if (!u) {
    loginOverlay.classList.remove("hidden");
    userBox.classList.add("hidden");
  } else {
    loginOverlay.classList.add("hidden");
    userBox.classList.remove("hidden");
    userNameEl.textContent = u.username;
    // After login, run image-missing flow
    runUploadOnMissingQueue();
  }
  renderSetList(searchEl.value || "");
  renderDetails();
}

loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = (loginUser.value || "").trim().toLowerCase();
  const pass = loginPass.value || "";
  if (!USERS.has(username) || pass !== PASS) {
    alert("Ungültige Zugangsdaten. Demo: ips-1 … ips-5 / bilder");
    return;
  }
  setUser({ username });
  requireLogin();
});

logoutBtn.addEventListener("click", () => {
  logoutUser();
  selectedSetId = null;
  requireLogin();
});

// ----- Lightbox -----
function openLightbox(src, caption = "") {
  if (!src) return;
  lbImg.src = src;
  lbCaption.textContent = caption;
  lbBackdrop.classList.remove("hidden"); lbBackdrop.classList.add("show");
}
function closeLightbox() { lbBackdrop.classList.remove("show"); lbBackdrop.classList.add("hidden"); lbImg.src = ""; lbCaption.textContent = ""; }
lbBackdrop.addEventListener("click", (e) => { if (e.target === lbBackdrop) closeLightbox(); });
lbClose.addEventListener("click", closeLightbox);

// ----- Render: Set-Liste -----
function computeSetStatus(setId) {
  const sessions = loadSessions();
  const s = sessions[setId];
  if (!s) return { label: "neu", cls: "" };
  if (s.closed_at) {
    const hasMissing = s.lines.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
    return { label: hasMissing ? "Abgeschlossen (Fehlteile)" : "Abgeschlossen", cls: hasMissing ? "bad" : "good" };
  }
  return { label: "in Arbeit", cls: "warn" };
}

function renderSetList(filter = "") {
  const q = filter.trim().toLowerCase();
  setListEl.innerHTML = "";
  const results = DATA.sets.filter(s => s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  if (!results.length) {
    const div = document.createElement("div");
    div.style.padding = "12px"; div.innerHTML = '<span class="meta">Keine Sets gefunden.</span>';
    setListEl.appendChild(div);
    return;
  }
  results.forEach(s => {
    const item = document.createElement("div");
    item.className = "item" + (s.id === selectedSetId ? " active" : "");
    const status = computeSetStatus(s.id);
    const t = thumb(s);
    item.innerHTML = `
      <img class="thumb" src="${t || ''}" alt="${s.code} Bild" />
      <div>
        <div class="title">${s.code} – ${s.name}</div>
        <span class="meta">${s.department}</span>
      </div>
      <div><span class="badge ${status.cls}">${status.label}</span></div>
    `;
    item.addEventListener("click", () => { selectedSetId = s.id; renderSetList(q); renderDetails(); });
    // zoom only if we have a full image
    if (full(s)) {
      item.querySelector("img").style.cursor = "zoom-in";
      item.querySelector("img").addEventListener("click", (ev) => { ev.stopPropagation(); openLightbox(full(s), `${s.code} – ${s.name}`); });
    }
    setListEl.appendChild(item);
  });
}

// ----- Render: Details -----
function renderDetails() {
  if (!selectedSetId) {
    detailsEl.innerHTML = '<div class="placeholder"><h2>Wähle links ein Set aus</h2><p>Dann siehst du hier die Details und kannst den Packvorgang starten.</p></div>';
    return;
  }
  const s = getSetById(selectedSetId);
  const lines = getSetLines(selectedSetId);
  const sessions = loadSessions();
  const cur = sessions[selectedSetId];
  const status = computeSetStatus(selectedSetId);

  const tableRows = lines.map(l => `
    <tr>
      <td>${
        hasAnyImage(l.instrument)
        ? `<img class="ithumb" src="${thumb(l.instrument)}" alt="${l.instrument.name}" title="Zum Vergrößern anklicken" data-zoom-src="${full(l.instrument)}" data-caption="${l.instrument.name}" />`
        : '<span class="meta">kein Bild</span>'
      }</td>
      <td>${l.instrument.name}</td>
      <td class="qty">${l.qty_required}</td>
      <td>${l.instrument.code}</td>
      <td>${l.instrument.category}</td>
    </tr>
  `).join("");

  const setImgHtml = hasAnyImage(s)
    ? `<img class="thumb" src="${thumb(s)}" alt="${s.code}"
         style="width:160px;height:100px;${full(s)?'cursor:zoom-in;':''}border-radius:8px;border:1px solid var(--chip-border)"
         ${full(s)?`data-zoom-src="${full(s)}" data-caption="${s.code} – ${s.name}"`:''}/>`
    : `<div class="badge warn">Kein Set-Bild</div>`;

  detailsEl.innerHTML = `
    <h2>${s.code} – ${s.name}</h2>
    <p class="subtle">${s.department} • Status: <span class="badge ${status.cls}">${status.label}</span></p>

    <div class="row">
      <dl class="kv">
        <dt>Set-Code</dt><dd>${s.code}</dd>
        <dt>Fachbereich</dt><dd>${s.department}</dd>
      </dl>
      <dl class="kv">
        <dt>Packvorschrift</dt><dd>Version 1.0 (Demo)</dd>
        <dt>Instrumente</dt><dd>${lines.length} Positionen</dd>
      </dl>
    </div>

    <div class="toolbar">
      ${setImgHtml}
      <button id="btnAddSetImg">Bild für Set hinzufügen/ändern</button>
    </div>

    <table class="table">
      <thead><tr><th></th><th>Instrument</th><th class="qty">Soll</th><th>Code</th><th>Kategorie</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>

    <div class="toolbar">
      <button id="startPack" class="primary">Packvorgang starten</button>
      ${cur ? '<button id="reportBtn" class="report-link">Packreport anzeigen</button>' : ''}
      ${cur && !cur.closed_at ? '<span class="badge warn">in Arbeit</span>' : ''}
    </div>
  `;

  detailsEl.querySelectorAll("[data-zoom-src]").forEach(el => {
    el.addEventListener("click", () => openLightbox(el.getAttribute("data-zoom-src"), el.getAttribute("data-caption") || ""));
  });

  // Add/Change set image button
  document.getElementById("btnAddSetImg").onclick = () => openUploadModal({ kind:"set", id: s.code, label: `${s.code} – ${s.name}` });

  document.getElementById("startPack").onclick = () => openPackModal(s, lines);
  const rb = document.getElementById("reportBtn");
  if (rb) rb.onclick = () => openReport(selectedSetId);
}

// ----- Pack Modal -----
function openPackModal(setObj, lines) {
  const u = getUser();
  if (!u) { requireLogin(); return; }

  modalTitle.textContent = `Packvorgang – ${setObj.code} (User: ${u.username})`;
  modalBackdrop.classList.remove("hidden");

  const rows = lines.map((l, idx) => `
    <tr data-idx="${idx}">
      <td>${
        hasAnyImage(l.instrument)
        ? `<img class="ithumb" src="${thumb(l.instrument)}" alt="${l.instrument.name}"
             title="Zum Vergrößern anklicken" data-zoom-src="${full(l.instrument)}" data-caption="${l.instrument.name}" />`
        : '<span class="meta">kein Bild</span>'
      }</td>
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td class="qty">
        <div class="qtyctrl">
          <button type="button" class="minus">−</button>
          <input type="number" min="0" step="1" value="${l.qty_required}" class="qtyInput"/>
          <button type="button" class="plus">+</button>
        </div>
      </td>
      <td class="checkbox-center"><input class="missingCb" type="checkbox" /></td>
      <td>
        <select class="reasonSel">
          <option value="">— Grund wählen —</option>
          ${MISSING_REASONS.map(r => `<option value="${r}">${r}</option>`).join("")}
        </select>
      </td>
      <td><textarea class="note" rows="1" placeholder="Notiz (optional)"></textarea></td>
    </tr>
  `).join("");

  modalBody.innerHTML = `
    <table class="table">
      <thead>
        <tr>
          <th></th><th>Instrument</th><th class="qty">Soll</th><th class="qty">Ist</th>
          <th>Fehlteil?</th><th>Grund</th><th>Notiz</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;

  modalBody.querySelectorAll("[data-zoom-src]").forEach(el => {
    el.addEventListener("click", () => openLightbox(el.getAttribute("data-zoom-src"), el.getAttribute("data-caption") || ""));
  });

  modalBody.querySelectorAll("tr").forEach(tr => {
    const idx = parseInt(tr.dataset.idx,10);
    const req = lines[idx].qty_required;
    const input = tr.querySelector(".qtyInput");
    const minus = tr.querySelector(".minus");
    const plus  = tr.querySelector(".plus");
    const cb = tr.querySelector(".missingCb");
    const reason = tr.querySelector(".reasonSel");

    function syncMissing() {
      const val = parseInt(input.value || "0", 10);
      const missing = val < req;
      cb.checked = missing;
      reason.disabled = !missing;
      if (!missing) { reason.value = ""; }
    }
    input.addEventListener("input", syncMissing);
    minus.addEventListener("click", () => { input.value = Math.max(0, (parseInt(input.value||"0",10)-1)); syncMissing(); });
    plus.addEventListener("click",  () => { input.value = (parseInt(input.value||"0",10)+1); syncMissing(); });
    cb.addEventListener("change", () => { reason.disabled = !cb.checked; if (!cb.checked) reason.value=""; });
    syncMissing();
  });
}

function closeModal() { modalBackdrop.classList.add("hidden"); }
modalClose.onclick = closeModal;
cancelPack.onclick = closeModal;

savePack.onclick = () => {
  const u = getUser();
  if (!selectedSetId || !u) return;
  const lines = getSetLines(selectedSetId);
  const rows = Array.from(modalBody.querySelectorAll("tr"));
  const captured = rows.map((tr, idx) => {
    const req = lines[idx].qty_required;
    const qty_found = parseInt(tr.querySelector(".qtyInput").value || "0", 10);
    const missing = tr.querySelector(".missingCb").checked || qty_found < req;
    const reason = tr.querySelector(".reasonSel").value || null;
    const note = tr.querySelector(".note").value || null;
    return {
      instrument_id: lines[idx].instrument_id,
      instrument_name: lines[idx].instrument.name,
      qty_required: req,
      qty_found, missing, reason, note
    };
  });

  const hasMissing = captured.some(l => (l.qty_required - l.qty_found) > 0 || l.missing);
  const sessions = loadSessions();
  sessions[selectedSetId] = {
    set_id: selectedSetId,
    started_by: sessions[selectedSetId]?.started_by || u.username,
    started_at: sessions[selectedSetId]?.started_at || new Date().toISOString(),
    closed_by: u.username,
    closed_at: new Date().toISOString(),
    status: hasMissing ? "closed_with_missing" : "closed_ok",
    lines: captured
  };
  saveSessions(sessions);
  closeModal();
  renderSetList(searchEl.value);
  renderDetails();
  alert("Packvorgang gespeichert.");
};

// ----- Report Modal -----
function openReport(setId) {
  const s = getSetById(setId);
  const sess = loadSessions()[setId];
  if (!sess) { alert("Kein Packvorgang vorhanden."); return; }
  reportTitle.textContent = `Packreport – ${s.code} – ${s.name}`;
  const rows = sess.lines.map(l => `
    <tr>
      <td>${l.instrument_name}</td>
      <td>${l.qty_required}</td>
      <td>${l.qty_found}</td>
      <td>${(l.qty_found<l.qty_required||l.missing) ? "Ja" : "Nein"}</td>
      <td>${l.reason || ""}</td>
      <td>${l.note || ""}</td>
    </tr>
  `).join("");
  reportBody.innerHTML = `
    <div class="muted">Abgeschlossen: ${new Date(sess.closed_at).toLocaleString()}</div>
    <div class="muted">Benutzer: ${sess.closed_by || sess.started_by || "-"}</div>
    <table>
      <thead><tr><th>Instrument</th><th>Soll</th><th>Ist</th><th>Fehlteil</th><th>Grund</th><th>Notiz</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
  reportBackdrop.classList.remove("hidden"); reportBackdrop.classList.add("show");
}
reportClose.addEventListener("click", () => { reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden"); });
reportBackdrop.addEventListener("click", (e) => { if (e.target === reportBackdrop) { reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden"); } });
reportPrint.addEventListener("click", () => window.print());

// ----- Upload-on-missing flow -----
let uploadQueue = []; // array of {kind:'set'|'inst', id, label}
let currentUpload = null;
function findMissingImages() {
  const items = [];
  // sets
  DATA.sets.forEach(s => {
    if (!hasAnyImage(s)) items.push({ kind: "set", id: s.code, label: `${s.code} – ${s.name}` });
  });
  // instruments
  DATA.instruments.forEach(i => {
    if (!hasAnyImage(i)) items.push({ kind: "inst", id: i.id, label: `${i.code} – ${i.name}` });
  });
  return items;
}
function runUploadOnMissingQueue() {
  uploadQueue = findMissingImages();
  nextUploadItem();
}
function nextUploadItem() {
  if (!uploadQueue.length) { closeUploadModal(); renderSetList(searchEl.value); renderDetails(); return; }
  currentUpload = uploadQueue.shift();
  openUploadModal(currentUpload);
}
function openUploadModal(item) {
  uploadTitle.textContent = `Bild hinzufügen – ${item.label}`;
  document.getElementById("uploadQuestion").textContent = `Für "${item.label}" ist kein Bild hinterlegt. Möchtest du ein Bild hochladen?`;
  uploadFile.value = "";
  uploadSave.disabled = true;
  uploadBackdrop.classList.remove("hidden"); uploadBackdrop.classList.add("show");
}
function closeUploadModal() { uploadBackdrop.classList.remove("show"); uploadBackdrop.classList.add("hidden"); currentUpload = null; }
uploadClose.addEventListener("click", () => { closeUploadModal(); });
uploadSkip.addEventListener("click", () => { nextUploadItem(); });
uploadFile.addEventListener("change", () => { uploadSave.disabled = !uploadFile.files?.length; });

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

uploadSave.addEventListener("click", async () => {
  if (!currentUpload || !uploadFile.files?.length) return;
  const dataUrl = await fileToDataURL(uploadFile.files[0]);
  const ov = loadImgOverrides();
  if (currentUpload.kind === "set") {
    ov.sets[currentUpload.id] = { thumb: dataUrl, full: dataUrl };
  } else {
    ov.inst[currentUpload.id] = { thumb: dataUrl, full: dataUrl };
  }
  saveImgOverrides(ov);
  nextUploadItem();
});

// Search & reset
searchEl.addEventListener("input", () => renderSetList(searchEl.value));
resetBtn.addEventListener("click", () => {
  if (confirm("Lokale Packdaten & Login zurücksetzen? (Bilder bleiben erhalten)")) {
    resetSessions();
    selectedSetId = null;
    requireLogin();
  }
});

// Init
requireLogin();
