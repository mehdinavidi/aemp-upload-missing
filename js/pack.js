
function generateLabel(setObj){ const d=new Date(); const y=d.getFullYear().toString().slice(2); const m=("0"+(d.getMonth()+1)).slice(-2); const day=("0"+d.getDate()).slice(-2); const rnd=Math.random().toString(36).slice(2,7).toUpperCase(); return `ETK-${setObj.code}-${y}${m}${day}-${rnd}`; }

function openPackModalV2(setObj, lines){
  const u = getUser(); if(!u){ requireLogin(); return; }
  modalTitle.textContent = `Packvorgang – ${setObj.code} (User: ${u.username})`;
  modalBackdrop.classList.remove("hidden"); modalBackdrop.classList.add("show");
  if (!lines || !Array.isArray(lines) || !lines.length) lines = getSetLines(selectedSetId);

  const bodyRows = lines.map(l=>`
    <tr data-req="${l.qty_required}" data-id="${l.instrument.id}">
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td class="qty">
        <div class="qtyctrl">
          <button type="button" class="minus">−</button>
          <input type="number" min="0" step="1" value="${l.qty_required}" class="qtyInput" />
          <button type="button" class="plus">+</button>
        </div>
      </td>
      <td class="status-cell"><span class="status-badge status-ok" title="vollständig">✔</span></td>
      <td>
        <select class="reasonSel" disabled>
          <option value="">— Grund wählen —</option>
          ${MISSING_REASONS.map(r=>`<option value="${r}">${r}</option>`).join("")}
        </select>
      </td>
      <td><input class="note" placeholder="Notiz (optional)" /></td>
    </tr>`).join("");

  modalBody.innerHTML = `
    <div class="muted" id="counters"></div>
    <table class="table">
      <thead><tr><th>Instrument</th><th class="qty">Soll</th><th class="qty">Ist</th><th>Status</th><th>Grund</th><th>Notiz</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>`;

  const countersEl = document.getElementById("counters");
  function updateRow(tr){
    const req = parseInt(tr.dataset.req,10);
    const val = parseInt(tr.querySelector(".qtyInput").value||"0",10);
    const badge = tr.querySelector(".status-badge");
    const reason = tr.querySelector(".reasonSel");
    badge.classList.remove("status-ok","status-warn","status-bad");
    if (val>=req){ badge.textContent="✔"; badge.classList.add("status-ok"); badge.title="vollständig"; reason.disabled=true; reason.value=""; }
    else if (val===0){ badge.textContent="✖"; badge.classList.add("status-bad"); badge.title="komplett fehlt"; reason.disabled=false; }
    else { badge.textContent="❗"; badge.classList.add("status-warn"); badge.title="teilweise fehlt"; reason.disabled=false; }
  }
  function renderCounts(){
    const rows = Array.from(modalBody.querySelectorAll("tbody tr"));
    let ok=0,warn=0,bad=0;
    rows.forEach(tr=>{
      const req = parseInt(tr.dataset.req,10);
      const val = parseInt(tr.querySelector(".qtyInput").value||"0",10);
      if (val>=req) ok++; else if (val===0) bad++; else warn++;
    });
    countersEl.textContent = `✔ Vollständig: ${ok} • ❗ Teil-Fehlt: ${warn} • ✖ Komplett-Fehlt: ${bad}`;
  }

  modalBody.querySelectorAll("tbody tr").forEach(tr=>{
    const input = tr.querySelector(".qtyInput");
    const minus = tr.querySelector(".minus");
    const plus = tr.querySelector(".plus");
    function sync(){ updateRow(tr); renderCounts(); }
    input.addEventListener("input", sync);
    minus.addEventListener("click", ()=>{ input.value=Math.max(0,parseInt(input.value||"0",10)-1); sync(); });
    plus.addEventListener("click", ()=>{ input.value=(parseInt(input.value||"0",10)+1); sync(); });
    sync();
  });
}
function closeModal(){ modalBackdrop.classList.remove("show"); modalBackdrop.classList.add("hidden"); }

modalClose.addEventListener("click", closeModal);
cancelPack.addEventListener("click", closeModal);


savePack.addEventListener("click", ()=>{
  if (!selectedSetId) return;
  const u = getUser(); if (!u){ requireLogin(); return; }
  const lines = getSetLines(selectedSetId);
  const rows = Array.from(modalBody.querySelectorAll("tbody tr"));
  const captured = rows.map((tr, idx)=>{
    const req = lines[idx].qty_required;
    const qty_found = parseInt(tr.querySelector(".qtyInput").value||"0",10);
    const missing = qty_found < req;
    const reason = tr.querySelector(".reasonSel").value || null;
    const note = tr.querySelector(".note").value || null;
    return { instrument_id: lines[idx].instrument_id, instrument_name: lines[idx].instrument.name, qty_required:req, qty_found, missing, reason, note };
  });
  const hasMissing = captured.some(l=> (l.qty_required-l.qty_found)>0 || l.missing );
  const sessions = loadSessions();
  const prev = sessions[selectedSetId] || {};
  const label = prev.label || generateLabel(getSetById(selectedSetId));
  sessions[selectedSetId] = {
    set_id: selectedSetId,
    label,
    started_by: prev.started_by || u.username,
    started_at: prev.started_at || new Date().toISOString(),
    closed_by: u.username,
    closed_at: new Date().toISOString(),
    released_at: prev.released_at || null,
    steri_by: prev.steri_by || null,
    status: hasMissing ? "closed_with_missing" : "closed_ok",
    lines: captured
  };
  saveSessions(sessions);
  closeModal(); renderSetList(searchEl.value); renderDetails();
  alert("Packvorgang gespeichert. Etikett: " + label);
});
  const rows = Array.from(modalBody.querySelectorAll("tbody tr"));
  const captured = rows.map((tr, idx)=>{
    const req = lines[idx].qty_required;
    const qty_found = parseInt(tr.querySelector(".qtyInput").value||"0",10);
    const missing = qty_found < req;
    const reason = tr.querySelector(".reasonSel").value || null;
    const note = tr.querySelector(".note").value || null;
    return { instrument_id: lines[idx].instrument_id, instrument_name: lines[idx].instrument.name, qty_required:req, qty_found, missing, reason, note };
  });
  const hasMissing = captured.some(l=> (l.qty_required-l.qty_found)>0 || l.missing );
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
  closeModal(); renderSetList(searchEl.value); renderDetails();
  alert("Packvorgang gespeichert.");
});

function editExistingPack(setId){ alert("Bearbeiten folgt später."); }
function releaseCurrentPack(setId){ alert("Freigabe folgt später."); }

function cancelCurrentPack(setId){
  const s = loadSessions();
  const sess = s[setId];
  if (!sess){ alert("Kein Packvorgang vorhanden."); return; }
  // Pflichtfeld: Hinweis
  let reason = "";
  while (true){
    reason = prompt("Bitte einen Hinweis zur Stornierung eingeben (Pflichtfeld):", "");
    if (reason === null) { return; } // Abbruch
    if ((reason||"").trim().length >= 3) break;
    alert("Hinweis ist Pflicht (mind. 3 Zeichen).");
  }
  if (!confirm("Diesen Packvorgang wirklich stornieren?\nHinweis: " + reason.trim())) return;
  // Optional: du kannst den Hinweis z.B. in der Console sehen oder später speichern
  console.log("Packvorgang storniert. Hinweis:", reason.trim());
  delete s[setId];
  saveSessions(s);
  renderSetList(searchEl.value);
  renderDetails();
  alert("Packvorgang storniert.");
}

