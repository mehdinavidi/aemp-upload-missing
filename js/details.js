// details.js – Details + FAB + Galerie & Mehrfach-Upload
(function(){
  const detailsEl = document.getElementById('details');

  function getSetById(id){ return (window.DATA?.sets||[]).find(s=>s.id===id); }
  function getInstById(id){ return (window.DATA?.instruments||[]).find(i=>i.id===id); }
  function getSetLines(setId){
    return (window.DATA?.setInstruments||[]).filter(x=>x.set_id===setId).map(x=>({qty_required:x.qty_required, instrument:getInstById(x.instrument_id)}));
  }
  function ensureFab(){
    let fab = document.getElementById('fabActions');
    if (!fab){
      fab = document.createElement('div');
      fab.id='fabActions'; fab.className='fab-fixed hidden';
      fab.innerHTML = '<button id="reportBtn" class="ghost">Packformular</button><button id="cancelBtn" class="danger">Stornieren</button><button id="startPack" class="primary">Packen</button>';
      document.body.appendChild(fab);
    }
    return fab;
  }
  function galleryHtml(entity, id){
    const pics = (window.AEMP_IMAGES ? AEMP_IMAGES.listImages(entity,id) : []);
    const thumbs = pics.map((p,idx)=>`<img class="ithumb" data-entity="${entity}" data-id="${id}" data-idx="${idx}" src="${p.thumb}" alt="">`).join('') || '<div class="subtle">kein Bild</div>';
    return `<div class="gallery">${thumbs}</div>
            <label class="btn small">
              <input type="file" accept="image/*" multiple hidden data-upload="${entity}:${id}">
              Bilder hinzufügen
            </label>`;
  }

  function wireUploads(scope){
    scope.querySelectorAll('input[type=file][data-upload]').forEach(inp=>{
      inp.onchange = async (e)=>{
        const [entity,id] = inp.dataset.upload.split(':');
        if (typeof AEMP_IMAGES==="undefined") { alert("Bildspeicher nicht geladen."); return; }
        await AEMP_IMAGES.addImages(entity, id, Array.from(inp.files||[]));
        window.renderDetails(); // re-render to show new thumbs
      };
    });
    scope.querySelectorAll('.ithumb').forEach(img=>{
      img.onclick = ()=>{
        const ent = img.dataset.entity, id = img.dataset.id, idx = +img.dataset.idx;
        if (typeof AEMP_IMAGES==="undefined") return;
        const pics = AEMP_IMAGES.listImages(ent, id);
        const p = pics[idx];
        if (!p) return;
        const box = document.createElement('div');
        box.className='lightbox';
        box.innerHTML = `<div class="lightbox-inner"><img src="${p.full}" alt=""><button class="danger small" id="delPic">Löschen</button><button class="ghost small" id="closePic">Schließen</button></div>`;
        document.body.appendChild(box);
        box.querySelector('#closePic').onclick=()=>box.remove();
        box.querySelector('#delPic').onclick=()=>{ AEMP_IMAGES.deleteImage(ent,id,idx); box.remove(); window.renderDetails(); };
      };
    });
  }

  window.renderDetails = function(){
    if (!detailsEl) return;
    const sid = window.selectedSetId;
    const s = getSetById(sid);
    const fab = ensureFab();
    if (!s){
      detailsEl.innerHTML = '<div class="placeholder center" style="padding:32px"><h3>Wähle links ein Set aus</h3><p class="subtle">Dann siehst du hier die Details und kannst packen.</p></div>';
      if (fab) fab.classList.add('hidden');
      return;
    }
    const lines = getSetLines(s.id);
    const rows = lines.map(l=>`
      <tr>
        <td>
          <div>${l.instrument?.name||'-'}<div class="subtle">${l.instrument?.code||''}</div></div>
        </td>
        <td class="qty">${l.qty_required}</td>
        <td>${l.instrument?.category||'-'}</td>
        <td>${galleryHtml('instruments', l.instrument?.id||0)}</td>
      </tr>`).join('');

    detailsEl.innerHTML = `
      <div class="vstack" style="gap:10px">
        <div class="hstack" style="justify-content:space-between;align-items:center">
          <h2>${s.code} – ${s.name}</h2>
          <div>${galleryHtml('sets', s.id)}</div>
        </div>
        <table class="table">
          <thead><tr><th>Instrument</th><th>Soll</th><th>Kategorie</th><th>Bilder</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
    if (fab) fab.classList.remove('hidden');

    wireUploads(detailsEl);

    const startBtn=document.getElementById('startPack');
    const cancelBtn=document.getElementById('cancelBtn');
    const reportBtn=document.getElementById('reportBtn');
    if (startBtn) startBtn.onclick=()=> console.log('Packen clicked');
    if (cancelBtn) cancelBtn.onclick=()=> console.log('Stornieren clicked');
    if (reportBtn) reportBtn.onclick=()=> console.log('Packformular clicked');
  };
})();
