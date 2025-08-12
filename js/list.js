
// js/list.js – robust list rendering
(function(){
  function el(){ return document.getElementById('setList'); }
  function q(value=''){ return (value||'').toLowerCase().trim(); }

  window.renderSetList = function(term){
    const setListEl = el();
    if (!setListEl){ console.warn('setListEl missing – skipping renderSetList'); return; }
    const s = q(term);
    const sets = (window.DATA?.sets||[]).filter(x=>!s || x.name.toLowerCase().includes(s) || x.code.toLowerCase().includes(s));
    setListEl.innerHTML = sets.map(set=>`
      <div class="card set-item" data-id="${set.id}">
        <div class="hstack" style="gap:10px; align-items:center">
          <img src="${set.image_url||''}" class="set-thumb" alt="">
          <div class="grow">
            <div class="title">${set.code} – ${set.name}</div>
            <div class="subtle">${set.department||''}</div>
          </div>
          <span class="chip chip-ok">${set.status||'Freigegeben'}</span>
        </div>
      </div>`).join('') || '<div class="placeholder">Keine Sets</div>';

    setListEl.querySelectorAll('.set-item').forEach(card=>{
      card.addEventListener('click', ()=>{
        window.selectedSetId = parseInt(card.getAttribute('data-id'),10);
        if (typeof window.renderDetails==='function') window.renderDetails();
      });
    });
  };
})();
