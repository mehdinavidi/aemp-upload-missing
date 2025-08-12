
function openLightbox(src, caption=""){ if(!src) return; lightboxImg.src=src; lightboxCaption.textContent=caption; lightboxBackdrop.classList.remove("hidden"); lightboxBackdrop.classList.add("show"); }
function closeLightbox(){ lightboxBackdrop.classList.remove("show"); lightboxBackdrop.classList.add("hidden"); lightboxImg.src=""; lightboxCaption.textContent=""; }
lightboxBackdrop.addEventListener("click",(e)=>{ if(e.target===lightboxBackdrop) closeLightbox(); });
lightboxClose.addEventListener("click", closeLightbox);

let currentUploadTarget=null;
function normalizeImgStore(){
  const ov=loadImgOverrides();
  // convert old single objects to arrays
  for(const [k,v] of Object.entries(ov.sets)){
    if(v && !Array.isArray(v)) ov.sets[k]=[v];
  }
  for(const [k,v] of Object.entries(ov.inst)){
    if(v && !Array.isArray(v)) ov.inst[k]=[v];
  }
  saveImgOverrides(ov);
  return ov;
}

function openUpload(target){ currentUploadTarget=target; uploadFile.value=""; uploadSave.disabled=true; uploadBackdrop.classList.add("show"); }
function closeUpload(){ uploadBackdrop.classList.remove("show"); }

function fileToDataURL(file){ return new Promise((res,rej)=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.onerror=rej; r.readAsDataURL(file); }); }
async function downscaleDataURL(dataUrl, maxSize=1200, quality=0.8){
  return new Promise((resolve)=>{
    const img=new Image(); img.onload=()=>{
      let {width:w,height:h}=img;
      const scale=Math.min(1, maxSize/Math.max(w,h));
      const cw=Math.round(w*scale), ch=Math.round(h*scale);
      const c=document.createElement('canvas'); c.width=cw; c.height=ch;
      const ctx=c.getContext('2d'); ctx.drawImage(img,0,0,cw,ch);
      resolve(c.toDataURL('image/jpeg', quality));
    };
    img.src=dataUrl;
  });
}

uploadClose.addEventListener("click", closeUpload);
uploadCancel.addEventListener("click", closeUpload);
uploadFile.addEventListener("change", ()=> uploadSave.disabled = !uploadFile.files?.length );

uploadSave.addEventListener("click", async ()=>{
  if(!currentUploadTarget || !uploadFile.files?.length) return;
  const files = Array.from(uploadFile.files);
  const ov = normalizeImgStore();
  for (const file of files){
    let thumb, full, ghPath=null, ghSha=null;
    if (window.UPLOAD_ENDPOINT && window.GithubUpload){
      try{ const r=await GithubUpload.upload(currentUploadTarget.kind, currentUploadTarget.id, file); full=r.url; thumb=r.url; ghPath=r.path; ghSha=r.sha||null; }
      catch(e){ const d=await fileToDataURL(file); full=thumb=d; }
    } else { const d=await fileToDataURL(file); const ds=await downscaleDataURL(d, 1200, 0.8); const th=await downscaleDataURL(d, 220, 0.8); full=ds; thumb=th; }
    if(currentUploadTarget.kind==='set'){ ov.sets[currentUploadTarget.id] = ov.sets[currentUploadTarget.id]||[]; ov.sets[currentUploadTarget.id].push({thumb,full,ghPath,ghSha}); }
    else { ov.inst[currentUploadTarget.id] = ov.inst[currentUploadTarget.id]||[]; ov.inst[currentUploadTarget.id].push({thumb,full,ghPath,ghSha}); }
  }
  saveImgOverrides(ov); closeUpload(); renderSetList(searchEl.value); renderDetails();
});



function deleteImage(target){
  const ov = normalizeImgStore();
  if (target.kind==='set'){
    const arr = ov.sets[target.id]||[];
    const item = (typeof target.idx==='number') ? arr[target.idx] : null;
    if (typeof target.idx==='number'){ arr.splice(target.idx,1); }
    if ((ov.sets[target.id]||[]).length===0) delete ov.sets[target.id];
    saveImgOverrides(ov);
    if (window.UPLOAD_ENDPOINT && item?.ghPath && window.GithubUpload){
      GithubUpload.remove(item.ghPath, item.ghSha||null).catch(console.warn);
    }
  } else {
    const arr = ov.inst[target.id]||[];
    const item = (typeof target.idx==='number') ? arr[target.idx] : null;
    if (typeof target.idx==='number'){ arr.splice(target.idx,1); }
    if ((ov.inst[target.id]||[]).length===0) delete ov.inst[target.id];
    saveImgOverrides(ov);
    if (window.UPLOAD_ENDPOINT && item?.ghPath && window.GithubUpload){
      GithubUpload.remove(item.ghPath, item.ghSha||null).catch(console.warn);
    }
  }
  renderSetList(searchEl.value); renderDetails();
}
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
    
<div class="vstack" style="gap:8px; margin:8px 0 14px 0;">
  <div class="gallery" id="setGallery"></div>
  <div>
    <button id="btnSetImgUpload" class="ghost">Bilder hinzufügen</button>
    <button id="btnSetImgDeleteAll" class="ghost">Alle löschen</button>
  </div>
</div>
<table
 class="table">
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

// Render set gallery
(function renderSetGallery(){
  const wrap=document.getElementById("setGallery");
  const arr=(normalizeImgStore().sets[s.code]||[]);
  wrap.innerHTML = arr.map((img,idx)=>`<span class="gitem"><img src="${img.thumb}" data-zoom-src="${img.full}" data-caption="${s.code} – ${s.name}" data-kind="set" data-id="${s.code}" data-idx="${idx}"><button class="del" title="Löschen" data-del data-kind="set" data-id="${s.code}" data-idx="${idx}">×</button></span>`).join("") || '<span class="subtle">Kein Set-Bild</span>';
})();
// Delete buttons in galleries
detailsEl.querySelectorAll("[data-del]").forEach(btn=>{
  btn.addEventListener("click", (e)=>{
    e.stopPropagation();
    const kind = btn.getAttribute("data-kind");
    const id = btn.getAttribute("data-id");
    const idx = parseInt(btn.getAttribute("data-idx"),10);
    if (confirm("Dieses Bild löschen?")) deleteImage({kind, id: (kind==='set'?id:parseInt(id,10)), idx});
  });
});

  document.getElementById("btnSetImgUpload").onclick = ()=> openUpload({kind:'set', id:s.code});
  const delAllSet = document.getElementById("btnSetImgDeleteAll"); if (delAllSet) delAllSet.onclick = ()=> { if (confirm("Alle Set-Bilder löschen?")) deleteImage({kind:'set', id:s.code, idx:0/0}); };
  detailsEl.querySelectorAll("button[data-action='inst-upload']").forEach(b=> b.addEventListener("click", ()=> openUpload({kind:'inst', id:parseInt(b.dataset.id,10)})));
  detailsEl.querySelectorAll("button[data-action='inst-delete-all']").forEach(b=> b.addEventListener("click", ()=> { if (confirm("Instrument-Bild löschen?")) deleteImage({kind:'inst', id:parseInt(b.dataset.id,10)}); }));
  

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
