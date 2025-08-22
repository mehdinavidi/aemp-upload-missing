
/* Admin-Kontrollen für Tiles */
(function(global){
  const KEY='aemp.admin.flags.v1';
  function read(){ try{ return JSON.parse(localStorage.getItem(KEY)) || {} }catch{ return {} } }
  function save(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
  function applyState(grid, state){
    if(!grid) return;
    grid.querySelectorAll('.tile').forEach(t=>{
      const soon = t.classList.contains('disabled');
      if(soon && state.enableAll) t.classList.remove('disabled');
      if(!soon && state.disableAll) t.classList.add('disabled');
    });
  }
  function panelHTML(){
    return `<div class="admin-panel">
        <label><input id="adm-enable" type="checkbox"> Alles aktivieren</label>
        <label><input id="adm-disable" type="checkbox"> Alles deaktivieren</label>
      </div>`;
  }
  function buildAdminPanel(grid, state){
    if(!grid) return;
    const wrap = document.createElement('div');
    wrap.innerHTML = panelHTML();
    grid.parentElement.insertBefore(wrap, grid);
    const en=wrap.querySelector('#adm-enable'), dis=wrap.querySelector('#adm-disable');
    en.checked=!!state.enableAll; dis.checked=!!state.disableAll;
    en.addEventListener('change', ()=>{ const s=read(); s.enableAll=en.checked; save(s); location.reload(); });
    dis.addEventListener('change', ()=>{ const s=read(); s.disableAll=dis.checked; save(s); location.reload(); });
  }
  global.AEMP_ADMIN = { read, save, applyState, buildAdminPanel };
})(window);
