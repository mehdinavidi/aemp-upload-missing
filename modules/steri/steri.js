window.Steri = (function(){
  const q = s=>document.querySelector(s);
  function render(){
    const list = AEMP.state.getSessions();
    const d = AEMP.state.getData();
    const tbody = q('#table tbody');
    if (!tbody) return;
    tbody.innerHTML = list.map(s=>{
      const setCode = d.sets.find(x=>x.id===s.setId)?.code || '';
      return `<tr data-label="${s.label}">
        <td><input type="checkbox" class="mark"> ${s.label}</td>
        <td>${setCode}</td>
        <td>${s.status||'-'}</td>
        <td>${s.status==='freigegeben' ? '—' : 'wartet'}</td>
      </tr>`;
    }).join('') || '<tr><td colspan="4" class="subtle">Keine Sessions</td></tr>';
  }
  function init(){
    const u = AEMP.session.getUser()||{};
    const role = (AEMP_USERS.list().find(x=>x.username===u.username)||{}).role||'';
    const canScan = AEMP_PERMS.can(u.username, role, 'steri', 'scan');
    const canFree = AEMP_PERMS.can(u.username, role, 'steri', 'freigeben');
    const scan = q('#scan');
    if(canScan){ scan?.addEventListener('keydown', e=>{
      if (e.key!=='Enter') return;
      const label = scan.value.trim();
      if(!label) return;
      const sess = AEMP.state.findByLabel(label);
      if (sess){ sess.status='eingescannt'; AEMP.state.saveSessions(AEMP.state.getSessions()); }
      scan.value=''; render();
    }); } else { if(scan) { scan.disabled = true; scan.placeholder='Kein Recht zum Scannen'; } }
    if(canFree){ q('#btnFreigeben')?.addEventListener('click', ()=>{
      const list = AEMP.state.getSessions();
      document.querySelectorAll('tbody .mark:checked').forEach(cb=>{
        const label = cb.closest('tr').dataset.label;
        const s = list.find(x=>x.label===label);
        if (s) s.status='freigegeben';
      });
      AEMP.state.saveSessions(list); render();
    }); } else { const b=q('#btnFreigeben'); if(b) { b.disabled=true; b.title='Kein Recht zur Freigabe'; } }
    render();
  }
  return { init, render };
})();
