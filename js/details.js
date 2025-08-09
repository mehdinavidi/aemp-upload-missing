function openLightbox(src, caption=""){
  if (!src) return;
  lbImg.src = src; lbCaption.textContent = caption;
  lbBackdrop.classList.remove("hidden"); lbBackdrop.classList.add("show");
}
function closeLightbox(){ lbBackdrop.classList.remove("show"); lbBackdrop.classList.add("hidden"); lbImg.src=""; lbCaption.textContent=""; }
lbBackdrop.addEventListener("click", (e) => { if (e.target === lbBackdrop) closeLightbox(); });
lbClose.addEventListener("click", closeLightbox);

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
  if (currentUploadTarget.kind === 'set') {
    ov.sets[currentUploadTarget.id] = { thumb: dataUrl, full: dataUrl };
  } else {
    ov.inst[currentUploadTarget.id] = { thumb: dataUrl, full: dataUrl };
  }
  saveImgOverrides(ov);
  closeUpload();
  renderSetList(searchEl.value);
  renderDetails();
});

function deleteImage(target){
  const ov = loadImgOverrides();
  if (target.kind==='set'){ delete ov.sets[target.id]; } else { delete ov.inst[target.id]; }
  saveImgOverrides(ov); renderSetList(searchEl.value); renderDetails();
}

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
  const startBtn = document.getElementById("startPack"); if (startBtn){ startBtn.addEventListener("click", ()=>{ console.log("Start Pack clicked"); openPackModalV2(s, lines); }); }
  const rb = document.getElementById("reportBtn"); if (rb) rb.onclick = () => openReport(selectedSetId);
  const eb = document.getElementById("editPack"); if (eb) eb.onclick = () => editExistingPack(selectedSetId);
  const rel = document.getElementById("releasePack"); if (rel) rel.onclick = () => releaseCurrentPack(selectedSetId);
  const cb = document.getElementById("cancelPackBtn"); if (cb) cb.onclick = () => cancelCurrentPack(selectedSetId);
}
