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
  if (!s) return { label:"neu", cls:"" }

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
