// js/list.js – robuste Setliste
(function(){
  function el(){ return document.getElementById('setList'); }
  function q(v=''){ return (v||'').toLowerCase().trim(); }

  window.renderSetList = function(term){
    if (typeof AEMP_IMAGES === "undefined") { console.warn("AEMP_IMAGES fehlt (image_store.js nicht geladen)"); return; }
    const target = el();
    if (!target){ console.warn('setList not in DOM'); return; }
    const s = q(term);
    const sets = (window.DATA?.sets||[]).filter(x=>!s || x.name.toLowerCase().includes(s) || x.code.toLowerCase().includes(s));
    target.innerHTML = sets.map(set=>`
      <div class="card set-item" data-id="${set.id}">
        <div class="hstack" style="gap:12px;align-items:center">
          <div class="set-thumb-wrap">${(AEMP_IMAGES.listImages('sets', set.id)[0]?.thumb ? `<img class="set-thumb" src="${AEMP_IMAGES.listImages('sets', set.id)[0].thumb}">` : '<div class="set-thumb ph"></div>')}</div>
          <div class="grow">
            <div class="title">${set.code} – ${set.name}</div>
            <div class="subtle">${set.department||''}</div>
          </div>
          <span class="chip chip-ok">${set.status||'Freigegeben'}</span>
        </div>
      </div>`).join('') || '<div class="placeholder">Keine Sets</div>';

    target.querySelectorAll('.set-item').forEach(card=>{
      card.addEventListener('click', ()=>{
        window.selectedSetId = parseInt(card.getAttribute('data-id'),10);
        if (typeof window.renderDetails==='function') window.renderDetails();
      });
    });
  };
})();
