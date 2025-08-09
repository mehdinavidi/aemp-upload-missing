
function renderSetList(filter=""){
  const q=(filter||"").toLowerCase();
  setListEl.innerHTML="";
  const res = DATA.sets.filter(s=> s.code.toLowerCase().includes(q) || s.name.toLowerCase().includes(q));
  if(!res.length){ setListEl.innerHTML='<div class="placeholder">Keine Sets gefunden.</div>'; return; }
  res.forEach(s=>{
    const status = computeSetStatus(s.id);
    const ov = loadImgOverrides().sets[s.code];
    const item = document.createElement("div");
    item.className="item"+(s.id===selectedSetId?" active":"");
    item.innerHTML = `
      <img class="thumb" src="${ov?ov.thumb:""}" alt="${s.code} Bild">
      <div><div class="title">${s.code} – ${s.name}</div><div class="subtle">${s.department}</div></div>
      <div><span class="badge ${status.cls}">${status.label}</span></div>`;
    item.addEventListener("click", ()=>{ selectedSetId=s.id; renderSetList(q); renderDetails(); });
    setListEl.appendChild(item);
  });
}
