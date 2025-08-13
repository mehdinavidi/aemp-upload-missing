window.Packplatz = window.Packplatz || {};
(function(ns){
  function getSetById(id){ return (AEMP.state.getData().sets||[]).find(s=>s.id===id); }
  function getInstById(id){ return (AEMP.state.getData().instruments||[]).find(i=>i.id===id); }
  function getSetLines(setId){
    return (AEMP.state.getData().setInstruments||[]).filter(x=>x.set_id===setId).map(x=>({qty_required:x.qty_required, instrument:getInstById(x.instrument_id)}));
  }
  function ensureFab(){
    let fab = document.getElementById('fabActions');
    if (!fab){
      fab = document.createElement('div');
      fab.id='fabActions'; fab.className='fab-fixed hidden';
      fab.innerHTML = '<a href="'+location.origin+'{p}index.html" class="btn ghost">Home</a>'.replace('{p}','/aemp-upload-missing/') +
                      '<button id="reportBtn" class="btn ghost">Packformular</button>'+
                      '<button id="cancelBtn" class="btn danger">Stornieren</button>'+
                      '<button id="startPack" class="btn primary">Packen</button>';
      document.body.appendChild(fab);
    }
    return fab;
  }
  function galleryHtml(entity, id){
    const pics = (typeof AEMP_IMAGES!=='undefined' ? AEMP_IMAGES.listImages(entity,id) : []);
    const thumbs = pics.map((p,idx)=>`<img class="ithumb" data-entity="${entity}" data-id="${id}" data-idx="${idx}" src="${p.thumb}" alt="">`).join('') || '<div class="subtle">kein Bild</div>';
    return `<div class="gallery">${thumbs}</div>
            <label class="btn small">
              <input type="file" accept="image/*" multiple hidden data-upload="${entity}:${id}">
              Bilder hinzufügen
            </label>`;
  }
  function wireUploads(scope){
    scope.querySelectorAll('input[type=file][data-upload]').forEach(inp=>{
      inp.onchange = async ()=>{
        if (typeof AEMP_IMAGES==='undefined'){ alert('Bildspeicher nicht geladen'); return; }
        const [entity,id] = inp.dataset.upload.split(':');
        await AEMP_IMAGES.addImages(entity, id, Array.from(inp.files||[]));
        ns.renderDetails();
      };
    });
  }

  ns.renderDetails = function(){
    const detailsEl = document.getElementById('details');
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
        <td><div>${l.instrument?.name||'-'}<div class="subtle">${l.instrument?.code||''}</div></div></td>
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
    document.getElementById('startPack').onclick = ()=> window.Packplatz.startPack();
    document.getElementById('cancelBtn').onclick = ()=> alert('Stornieren (Platzhalter)');
    document.getElementById('reportBtn').onclick = ()=> alert('Packformular (Platzhalter)');
  };
})(window.Packplatz);
