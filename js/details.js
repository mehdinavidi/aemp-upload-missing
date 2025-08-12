
function openLightbox(src, caption=""){ if(!src) return; lightboxImg.src=src; lightboxCaption.textContent=caption; lightboxBackdrop.classList.remove("hidden"); lightboxBackdrop.classList.add("show"); }
function closeLightbox(){ lightboxBackdrop.classList.remove("show"); lightboxBackdrop.classList.add("hidden"); lightboxImg.src=""; lightboxCaption.textContent=""; }
lightboxBackdrop.addEventListener("click",(e)=>{ if(e.target===lightboxBackdrop) closeLightbox(); });
lightboxClose.addEventListener("click", closeLightbox);

let currentUploadTarget=null;
function openUpload(target){ currentUploadTarget=target; uploadFile.value=""; uploadSave.disabled=true; uploadBackdrop.classList.add("show"); }
function closeUpload(){ uploadBackdrop.classList.remove("show"); }
function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
uploadClose.addEventListener("click", closeUpload);
uploadCancel.addEventListener("click", closeUpload);
uploadFile.addEventListener("change", ()=> uploadSave.disabled = !uploadFile.files?.length );
uploadSave.addEventListener("click", async ()=>{
  if(!currentUploadTarget || !uploadFile.files?.length) return;
  const file=uploadFile.files[0];
  let thumb, full, ghPath=null, ghSha=null;
  if (window.UPLOAD_ENDPOINT && window.GithubUpload){
    try{ const r=await GithubUpload.upload(currentUploadTarget.kind, currentUploadTarget.id, file); full=r.url; thumb=r.url; ghPath=r.path; ghSha=r.sha||null; }
    catch(e){ const d=await fileToDataURL(file); full=thumb=d; }
  } else { const d=await fileToDataURL(file); full=thumb=d; }
  const ov=loadImgOverrides();
  if(currentUploadTarget.kind==='set') ov.sets[currentUploadTarget.id]={thumb,full,ghPath,ghSha};
  else ov.inst[currentUploadTarget.id]={thumb,full,ghPath,ghSha};
  saveImgOverrides(ov); closeUpload(); renderSetList(searchEl.value); renderDetails();
});

function deleteImage(target){
  const ov=loadImgOverrides();
  let item=null;
  if(target.kind==='set'){ item=ov.sets[target.id]; delete ov.sets[target.id]; }
  else { item=ov.inst[target.id]; delete ov.inst[target.id]; }
  saveImgOverrides(ov);
  if (window.UPLOAD_ENDPOINT && item?.ghPath && window.GithubUpload){
    GithubUpload.remove(item.ghPath, item.ghSha||null).catch(console.warn);
  }
  renderSetList(searchEl.value); renderDetails();
}


// Feste Aktionsleiste unten rechts erzeugen/aktualisieren
(function ensureFab(){
  let fab = document.getElementById("fabActions");
  if (!fab){
    fab = document.createElement("div");
    fab.id = "fabActions";
    fab.className = "fab-fixed";
    fab.innerHTML =
      '<button id="reportBtn" class="ghost">Packformular</button>' +
      '<button id="cancelBtn" class="danger">Stornieren</button>' +
      '<button id="startPack" class="primary">Packen</button>';
    document.body.appendChild(fab);
  } else {
    fab.querySelector("#reportBtn").textContent = "Packformular";
    fab.querySelector("#cancelBtn").textContent = "Stornieren";
    fab.querySelector("#startPack").textContent = "Packen";
  }
})();

function renderDetails(){
  if (!selectedSetId){ detailsEl.innerHTML='<div class="placeholder"><h2>Wähle links ein Set aus</h2><p>Dann siehst du hier die Details und kannst den Packvorgang starten.</p></div>'; return; }
  const s=getSetById(selectedSetId);
  const lines=getSetLines(selectedSetId);
  const status=computeSetStatus(selectedSetId);
  const sess=loadSessions()[selectedSetId];
  const ovSet=loadImgOverrides().sets[s.code];

  const rows = lines.map(l=>{
    const instOv=loadImgOverrides().inst[l.instrument.id];
    return `<tr>
      <td>${instOv?`<img class="ithumb" src="${instOv.thumb}" data-zoom-src="${instOv.full}" data-caption="${l.instrument.name}">`:'<span class="subtle">kein Bild</span>'}</td>
      <td>${l.instrument.name}<br><span class="subtle">${l.instrument.code}</span></td>
      <td class="qty">${l.qty_required}</td>
      <td>${l.instrument.category}</td>
      <td>
        <button class="ghost" data-action="inst-upload" data-id="${l.instrument.id}">Bild ändern</button>
        <button class="ghost" data-action="inst-delete" data-id="${l.instrument.id}">Löschen</button>
      </td>
    </tr>`;
  }).join("");

  detailsEl.innerHTML = `
    <h2>${s.code} – ${s.name}</h2>
    <p class="subtle">${s.department} • Status: <span class="badge ${status.cls}">${status.label}</span> ${sess?.label ? "• Etikett: <b>"+sess.label+"</b>" : ""}</p>
    <div class="vstack" style="flex-direction:row; align-items:center; gap:12px; margin:8px 0 14px 0;">
      ${ovSet ? `<img class="ithumb" src="${ovSet.thumb}" data-zoom-src="${ovSet.full}" data-caption="${s.code} – ${s.name}">` : '<span class="subtle">Kein Set-Bild</span>'}
      <button id="btnSetImgUpload" class="ghost">Bild hochladen/ändern</button>
      <button id="btnSetImgDelete" class="ghost">Bild löschen</button>
    </div>
    <table class="table">
      <thead><tr><th></th><th>Instrument</th><th class="qty">Soll</th><th>Kategorie</th><th>Bild</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>


</div>

  <div class="center">
    <button id="cancelBtn" class="ghost">Stornieren</button>
  </div>
  <div class="right">
    <button id="startPack" class="primary">Packen</button>
  </div>
</div>

    `;

  detailsEl.querySelectorAll("[data-zoom-src]").forEach(el=> el.addEventListener("click", ()=> openLightbox(el.getAttribute("data-zoom-src"), el.getAttribute("data-caption")||"")));
  document.getElementById("btnSetImgUpload").onclick = ()=> openUpload({kind:'set', id:s.code});
  document.getElementById("btnSetImgDelete").onclick = ()=> { if (confirm("Set-Bild löschen?")) deleteImage({kind:'set', id:s.code}); };
  detailsEl.querySelectorAll("button[data-action='inst-upload']").forEach(b=> b.addEventListener("click", ()=> openUpload({kind:'inst', id:parseInt(b.dataset.id,10)})));
  detailsEl.querySelectorAll("button[data-action='inst-delete']").forEach(b=> b.addEventListener("click", ()=> { if (confirm("Instrument-Bild löschen?")) deleteImage({kind:'inst', id:parseInt(b.dataset.id,10)}); }));
  

// "__FAB_INJECT__" Fixed bottom-right action bar
(function ensureFab(){
  let fab = document.getElementById("fabActions");
  if (!fab){
    fab = document.createElement("div");
    fab.id = "fabActions";
    fab.className = "fab-fixed";
    fab.innerHTML = '<button id="reportBtn" class="ghost">Packformular</button>' +
                    '<button id="cancelBtn" class="danger">Stornieren</button>' +
                    '<button id="startPack" class="primary">Packen</button>';
    document.body.appendChild(fab);
  } else {
    const r=fab.querySelector("#reportBtn"); if(r) r.textContent="Packformular";
    const c=fab.querySelector("#cancelBtn"); if(c) c.textContent="Stornieren";
    const s=fab.querySelector("#startPack"); if(s) s.textContent="Packen";
  }
})();
/*__FAB_INJECT__*/

      document.getElementById("startPack").addEventListener("click", ()=> openPackModalV2(s, lines));
  const rb=document.getElementById("reportBtn"); if (rb) rb.addEventListener("click", ()=> openReport(selectedSetId));
  const cb=document.getElementById("cancelBtn"); if (cb) cb.addEventListener("click", ()=> cancelCurrentPack(selectedSetId));
}
