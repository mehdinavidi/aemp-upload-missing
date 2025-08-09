function openPackModalV2(setObj, lines){
  const u = getUser(); if (!u){ requireLogin(); return; }
  modalTitle.textContent = `Packvorgang – ${setObj.code} (User: ${u.username})`;
  modalBackdrop.classList.remove("hidden"); modalBackdrop.classList.add("show");

  if (!lines || !Array.isArray(lines) || !lines.length) { lines = getSetLines(selectedSetId); }

  const head = `<div class="muted" id="counters"></div>`;
  const bodyRows = lines.map((l, idx)=>`
    <tr data-idx="${idx}" data-req="${l.qty_required}">
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td class="qty">
        <div class="qtyctrl">
          <button type="button" class="minus">−</button>
          <input type="number" min="0" step="1" value="${l.qty_required}" class="qtyInput"/>
          <button type="button" class="plus">+</button>
        </div>
      </td>
      <td class="status-cell"><span class="status-badge status-ok" title="vollständig">✔</span></td>
      <td>
        <select class="reasonSel" disabled>
          <option value="">— Grund wählen —</option>
          ${MISSING_REASONS.map(r => `<option value="${r}">${r}</option>`).join("")}
        </select>
      </td>
      <td><input class="note" placeholder="Notiz (optional)" /></td>
    </tr>`).join("");

  modalBody.innerHTML = `${head}
    <table class="table">
      <thead><tr><th>Instrument</th><th class="qty">Soll</th><th class="qty">Ist</th><th>Status</th><th>Grund</th><th>Notiz</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;

  const countersEl = modalBody.querySelector("#counters");
  function rowStatus(tr){
    const req = parseInt(tr.dataset.req,10);
    const val = parseInt(tr.querySelector(".qtyInput").value || "0", 10);
    const badge = tr.querySelector(".status-badge");
    const reason = tr.querySelector(".reasonSel");
    badge.classList.remove("status-ok","status-warn","status-bad");
    if (val>=req){ badge.textContent="✔"; badge.title="vollständig"; badge.classList.add("status-ok"); reason.disabled=true; reason.value=""; }
    else if (val===0){ badge.textContent="✖"; badge.title="komplett fehlt"; badge.classList.add("status-bad"); reason.disabled=false; }
    else { badge.textContent="❗"; badge.title="teilweise fehlt"; badge.classList.add("status-warn"); reason.disabled=false; }
  }
  function renderCounts(){
    const rows = Array.from(modalBody.querySelectorAll("tbody tr"));
    let ok=0,warn=0,bad=0;
    rows.forEach(tr=>{
      const req = parseInt(tr.dataset.req,10);
      const val = parseInt(tr.querySelector(".qtyInput").value || "0", 10);
      if (val>=req) ok++; else if (val===0) bad++; else warn++;
    });
    countersEl.textContent = `✔ Vollständig: ${ok} • ❗ Teil-Fehlt: ${warn} • ✖ Komplett-Fehlt: ${bad}`;
  }

  modalBody.querySelectorAll("tbody tr").forEach(tr=>{
    const input = tr.querySelector(".qtyInput");
    const minus = tr.querySelector(".minus");
    const plus = tr.querySelector(".plus");
    function sync(){ rowStatus(tr); renderCounts(); }
    input.addEventListener("input", sync);
    minus.addEventListener("click", ()=>{ input.value = Math.max(0, (parseInt(input.value||"0",10)-1)); sync(); });
    plus.addEventListener("click", ()=>{ input.value = (parseInt(input.value||"0",10)+1); sync(); });
    sync();
  });
}

function closeModal(){ modalBackdrop.classList.remove("show"); modalBackdrop.classList.add("hidden"); }

savePack.onclick = ()=>{
  const u = getUser(); if (!selectedSetId || !u) return;

function editExistingPack(setId){
  const sess = loadSessions()[setId]; if (!sess){ alert("Kein Packvorgang vorhanden."); return; }
  const s = getSetById(setId); const lines = getSetLines(setId);
  openPackModalV2(s, lines);
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

btnPackplatz.addEventListener("click", showWorkspace);
