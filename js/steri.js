
// js/steri.js – robust steri view (minimal)

(function(){
  const inputEl = document.getElementById('steriScan');
  const tableEl = document.getElementById('steriTable');

  function loadSessions(){
    try{ return JSON.parse(localStorage.getItem('aemp_sessions')||'[]'); }catch(e){ return []; }
  }
  function saveSessions(v){
    try{ localStorage.setItem('aemp_sessions', JSON.stringify(v)); }catch(e){}
  }

  function getPackedSessions(){
    return loadSessions();
  }

  function renderPacked(){
    if (!tableEl) return;
    const tbody = tableEl.querySelector('tbody');
    if (!tbody) return;
    const rows = getPackedSessions().map(it=>`
      <tr>
        <td>${it.label||''}</td>
        <td>${it.set||it.setCode||''}</td>
        <td>${it.status||'wartet Steri'}</td>
      </tr>`).join('');
    tbody.innerHTML = rows || '<tr><td colspan="3" class="subtle">Keine gescannten Etiketten</td></tr>';
  }

  window.wireSteri = function(){
    renderPacked();
    if (inputEl){
      inputEl.addEventListener('keydown', (e)=>{
        if (e.key === 'Enter'){
          const val = inputEl.value.trim();
          if (val){
            const list = loadSessions();
            list.push({ label: val, status:'neu' });
            saveSessions(list);
            inputEl.value='';
            renderPacked();
          }
        }
      });
    }
  };
})();
