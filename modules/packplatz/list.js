
// modules/packplatz/list.js
// Renders table of sets with sticky first 3 columns and a right-click column menu.
// Saves visibility in localStorage (key: aemp.packplatz.columns.v2)

export function createSetList(container, options={}){
  const cfg = {
    columns: [
      { key:'img',    label:'Set Bild', fixed:true },
      { key:'code',   label:'Kürzel', fixed:true },
      { key:'name',   label:'Set Bezeichnung', fixed:true },
      { key:'kind',   label:'Set/Einzel Instrument' },
      { key:'status', label:'Status' },
      { key:'priority', label:'Priorität' },
      { key:'indv',   label:'Individualnummern' },
      { key:'cc_owner', label:'Kostenstelle (Eigentümer)' },
      { key:'cc_issue', label:'Kostenstelle (Ausgabe an)' },
      { key:'storage', label:'Lagerort' },
      { key:'loan',     label:'Leih-Set' },
      { key:'disinf',   label:'Nur Desinfektion' },
      { key:'risk',     label:'Risikogruppe' },
      { key:'type',     label:'Typ' }
    ],
    storeKey: 'aemp.packplatz.columns.v2',
    getSets: async ()=>[],   // provider
    onSelect: (set)=>{}      // click/dblclick selection
  };
  Object.assign(cfg, options||{});

  const el = document.createElement('div');
  el.className = 'card pane';
  el.innerHTML = `
    <header>
      <strong>Setliste</strong>
      <input id="pp-search" type="text" placeholder="Suche: Kürzel, Bezeichnung, Status …" style="min-width:280px">
    </header>
    <div class="body">
      <div class="table-wrap">
        <table id="pp-table">
          <thead>
            <tr id="pp-hdr"></tr>
          </thead>
          <tbody id="pp-tbody"></tbody>
        </table>
      </div>
    </div>

    <div class="ctx" id="pp-colmenu">
      <h4>Spalten anzeigen</h4>
      <div id="pp-colList"></div>
    </div>
  `;
  container.appendChild(el);

  const $ = (s,root=el)=>root.querySelector(s);
  const $$ = (s,root=el)=>Array.from(root.querySelectorAll(s));

  function loadPrefs(){ try{ return JSON.parse(localStorage.getItem(cfg.storeKey)) || {} }catch{ return {} } }
  function savePrefs(p){ localStorage.setItem(cfg.storeKey, JSON.stringify(p)); }

  function setColVisibility(key, visible){
    const th = $(`th[data-key="${key}"]`);
    if(th) th.style.display = visible ? '' : 'none';
    $$(`td[data-key="${key}"]`).forEach(td => td.style.display = visible ? '' : 'none');
  }

  function badgeStatus(s){
    const c = String(s||'').toLowerCase();
    if(c.includes('bereit')) return `<span class="badge ok">bereit</span>`;
    if(c.includes('arbeit')||c.includes('offen')) return `<span class="badge warn">${s}</span>`;
    return `<span class="badge">${s||'—'}</span>`;
  }
  function badgePriority(p){
    const c = String(p||'').toLowerCase();
    if(c.includes('hoch')) return `<span class="badge ok">hoch</span>`;
    if(c.includes('mittel')) return `<span class="badge">mittel</span>`;
    if(c.includes('niedrig')) return `<span class="badge muted">niedrig</span>`;
    return `<span class="badge">${p||'—'}</span>`;
  }

  function buildHeader(){
    const hdr = $('#pp-hdr');
    hdr.innerHTML = '';
    for(let i=0;i<cfg.columns.length;i++){
      const col = cfg.columns[i];
      const th = document.createElement('th');
      th.dataset.key = col.key;
      th.textContent = col.label;
      if(i===0) th.classList.add('sticky-0','col-img');
      if(i===1) th.classList.add('sticky-1','col-code');
      if(i===2) th.classList.add('sticky-2','col-name');
      hdr.appendChild(th);
    }
  }

  let _rows = [];
  async function render(filter=''){
    const tbody = $('#pp-tbody');
    tbody.innerHTML = '';
    const rows = _rows
      .filter(r => (r.code+' '+r.name+' '+(r.status||'')+' '+(r.priority||'')).toLowerCase().includes(filter.toLowerCase()));
    for(const row of rows){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="sticky-0 col-img">${row.img?`<img src="${row.img}" alt="" style="width:64px;height:40px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.1)">`:''}</td>
        <td class="sticky-1 col-code mono">${row.code}</td>
        <td class="sticky-2 col-name">${row.name}</td>
        <td data-key="kind">${row.kind||'—'}</td>
        <td data-key="status">${badgeStatus(row.status)}</td>
        <td data-key="priority">${badgePriority(row.priority)}</td>
        <td data-key="indv">${row.indv||'—'}</td>
        <td data-key="cc_owner">${row.cc_owner||'—'}</td>
        <td data-key="cc_issue">${row.cc_issue||'—'}</td>
        <td data-key="storage">${row.storage||'—'}</td>
        <td data-key="loan">${row.loan||'—'}</td>
        <td data-key="disinf">${row.disinf||'—'}</td>
        <td data-key="risk">${row.risk||'—'}</td>
        <td data-key="type">${row.type||'—'}</td>
      `;
      tr.addEventListener('click', ()=> cfg.onSelect(row));
      tr.addEventListener('dblclick', ()=> cfg.onSelect(row));
      tbody.appendChild(tr);
    }
    // apply visibility
    const prefs = loadPrefs();
    for(const col of cfg.columns){
      if(col.fixed) continue;
      const visible = prefs[col.key] !== false;
      setColVisibility(col.key, visible);
    }
  }

  function buildMenu(){
    const prefs = loadPrefs();
    const list = $('#pp-colList'); list.innerHTML='';
    for(const col of cfg.columns){
      if(col.fixed) continue;
      const visible = prefs[col.key] !== false;
      const div = document.createElement('div');
      div.className = 'item';
      div.innerHTML = `<input type="checkbox" id="pp-chk-${col.key}" ${visible?'checked':''}> <label for="pp-chk-${col.key}">${col.label}</label>`;
      list.appendChild(div);
      div.querySelector('input').addEventListener('change', (ev)=>{
        const on = ev.currentTarget.checked;
        const p = loadPrefs(); p[col.key] = on; savePrefs(p);
        setColVisibility(col.key, on);
      });
    }
  }
  const menu = $('#pp-colmenu');
  function showMenu(x,y){
    buildMenu();
    menu.style.display='block';
    const vw=window.innerWidth, vh=window.innerHeight;
    const rect=menu.getBoundingClientRect();
    menu.style.left=Math.min(x, vw-rect.width-8)+'px';
    menu.style.top=Math.min(y, vh-rect.height-8)+'px';
  }
  function hideMenu(){ menu.style.display='none'; }

  $('#pp-hdr').addEventListener('contextmenu', (e)=>{ e.preventDefault(); showMenu(e.clientX, e.clientY); });
  document.addEventListener('click', (e)=>{ if(!menu.contains(e.target)) hideMenu(); });
  $('#pp-search').addEventListener('input', (e)=> render(e.target.value));

  // public api
  const api = {
    async reload(){
      _rows = await cfg.getSets();
      buildHeader();
      await render('');
      return _rows;
    },
    filter: (q)=> render(q||''),
    element: el
  };
  api.reload();
  return api;
}
