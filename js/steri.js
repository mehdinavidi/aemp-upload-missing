
function showSteri(){
  menuView.classList.add("hidden");
  document.querySelector("main.grid").classList.add("hidden");
  document.getElementById("steriView").classList.remove("hidden");
  appTitle.textContent = "AEMP • Steri-Freigabe";
  homeBtn.classList.remove("hidden");
  wireSteri();
}

document.getElementById("btnSteri").addEventListener("click", showSteri);

function wireSteri(){
  const input = document.getElementById("scanInput");
  const tbody = document.getElementById("scanTbody");
  const btnClear = document.getElementById("clearScans");
  const btnRelease = document.getElementById("steriRelease");

  function renderRow(label){
    // find by label in sessions
    const sessions = loadSessions();
    let setId = null, sess=null;
    for (const [k,v] of Object.entries(sessions)){
      if (v && v.label === label){ setId=parseInt(k,10); sess=v; break; }
    }
    const tr = document.createElement("tr");
    if (!sess){
      tr.innerHTML = `<td>${label}</td><td class="subtle">-</td><td class="badge bad">Unbekannt</td><td></td>`;
    } else {
      const s = getSetById(setId);
      const st = sess.released_at ? '<span class="badge good">Bereits freigegeben</span>' : '<span class="badge warn">bereit</span>';
      tr.dataset.setId = setId;
      tr.dataset.label = label;
      tr.innerHTML = `<td>${label}</td><td>${s.code} – ${s.name}</td><td>${st}</td><td><button class="ghost" data-remove>Entfernen</button></td>`;
    }
    tbody.prepend(tr);
  }

  input.onkeydown = (e)=>{
    if (e.key === "Enter"){
      e.preventDefault();
      const raw = (input.value||"").trim();
      if (!raw) return;
      raw.split(/[\s,;]+/).forEach(code => { if (code) renderRow(code); });
      input.value="";
    }
  };

  tbody.addEventListener("click", (e)=>{
    const btn = e.target.closest("[data-remove]");
    if (btn){ btn.closest("tr").remove(); }
  });

  btnClear.onclick = ()=> tbody.innerHTML="";
  btnRelease.onclick = ()=>{
    const rows = Array.from(tbody.querySelectorAll("tr"));
    if (!rows.length){ alert("Keine Etiketten in der Liste."); return; }
    const sessions = loadSessions();
    let count=0;
    rows.forEach(tr=>{
      const setId = parseInt(tr.dataset.setId||"0",10);
      const label = tr.dataset.label;
      if (!setId || !label) return;
      const sess = sessions[setId];
      if (!sess) return;
      sess.released_at = new Date().toISOString();
      sess.steri_by = (getUser()?.username)||"steri";
      count++;
    });
    saveSessions(sessions);
    alert(count + " Set(s) freigegeben.");
    tbody.innerHTML="";
    renderSetList(searchEl.value); renderDetails();
  };
}
