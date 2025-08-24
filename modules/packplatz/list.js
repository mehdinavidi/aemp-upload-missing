window.Packplatz = window.Packplatz || {};
(function(ns){
  function q(v=''){ return (v||'').toLowerCase().trim(); }
  ns.renderSetList = function(term){
    const el = document.getElementById('setList');
    if (!el){ console.warn('setList fehlt'); return; }
    const s = q(term);
    const sets = (AEMP.state.getData().sets||[]).filter(x=>!s || x.name.toLowerCase().includes(s) || x.code.toLowerCase().includes(s));
    el.innerHTML = sets.map(set=>{
      const thumb = (typeof AEMP_IMAGES!=='undefined' && AEMP_IMAGES.listImages('sets', set.id)[0]?.thumb) || '';
      const imgHtml = thumb ? `<img class="set-thumb" src="${thumb}" alt="">` : '<div class="set-thumb ph"></div>';
      return `<div class="card set-item" data-id="${set.id}">
        <div class="hstack" style="gap:12px;align-items:center">
          ${imgHtml}
          <div class="grow">
            <div class="title">${set.code} – ${set.name}</div>
            <div class="subtle">${set.department||''}</div>
          </div>
          <span class="chip chip-ok">${set.status||'Freigegeben'}</span>
        </div>
      </div>`;
    }).join('') || '<div class="placeholder">Keine Sets</div>';

    el.querySelectorAll('.set-item').forEach(card=>{
      card.addEventListener('click', ()=>{
        window.selectedSetId = parseInt(card.getAttribute('data-id'),10);
        if (typeof ns.renderDetails==='function') ns.renderDetails();
      });
    });
  };
})(window.Packplatz);
