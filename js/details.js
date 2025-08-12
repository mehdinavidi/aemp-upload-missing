
// details.js – stabile Minimalversion
(function(){
  const detailsEl = document.getElementById('details');

  function getSetById(id){
    return (window.DATA?.sets||[]).find(s=>s.id===id);
  }
  function getInstById(id){
    return (window.DATA?.instruments||[]).find(i=>i.id===id);
  }
  function getSetLines(setId){
    return (window.DATA?.setInstruments||[]).filter(x=>x.set_id===setId).map(x=>({qty_required:x.qty_required, instrument:getInstById(x.instrument_id)}));
  }

  function ensureFab(){
    let fab = document.getElementById('fabActions');
    if (!fab){
      fab = document.createElement('div');
      fab.id = 'fabActions';
      fab.className = 'fab-fixed';
      fab.innerHTML = '<button id="reportBtn" class="ghost">Packformular</button>' +
                      '<button id="cancelBtn" class="danger">Stornieren</button>' +
                      '<button id="startPack" class="primary">Packen</button>';
      document.body.appendChild(fab);
    }
  }

  window.renderDetails = function(){
    if (!detailsEl){ return; }
    const sid = window.selectedSetId;
    const s = getSetById(sid);
    if (!s){
      detailsEl.innerHTML = '<div class="placeholder center" style="padding:32px"><h3>Wähle links ein Set aus</h3><p class="subtle">Dann siehst du hier die Details und kannst packen.</p></div>';
      return;
    }
    const lines = getSetLines(s.id);
    const rows = lines.map(l=>`
      <tr>
        <td>${l.instrument?.name||'-'}<br><span class="subtle">${l.instrument?.code||''}</span></td>
        <td class="qty">${l.qty_required}</td>
        <td>${l.instrument?.category||'-'}</td>
        <td></td>
      </tr>`).join('');

    detailsEl.innerHTML = `
      <div class="vstack" style="gap:10px">
        <h2>${s.code} – ${s.name}</h2>
        <table class="table">
          <thead><tr><th>Instrument</th><th>Soll</th><th>Kategorie</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;

    ensureFab();
    const startBtn = document.getElementById('startPack');
    const cancelBtn = document.getElementById('cancelBtn');
    const reportBtn = document.getElementById('reportBtn');
    if (startBtn)  startBtn.onclick  = ()=> (window.openPackModalV2 ? openPackModalV2(s, lines) : console.warn('openPackModalV2 fehlt'));
    if (cancelBtn) cancelBtn.onclick = ()=> (window.cancelCurrentPack ? cancelCurrentPack(s.id) : console.warn('cancelCurrentPack fehlt'));
    if (reportBtn) reportBtn.onclick = ()=> (window.openReport ? openReport(s.id) : console.warn('openReport fehlt'));
  };
})();
