
// modules/packplatz/details.js
// Renders details of a selected set on the right pane, including instrument table.

export function createSetDetails(container, options={}){
  const cfg = {
    getItemsForSet: async (code)=>[], // provider
  };
  Object.assign(cfg, options||{});

  const el = document.createElement('div');
  el.className = 'card pane';
  el.innerHTML = `
    <header>
      <div class="detail-head">
        <strong id="pp-d-title">Details</strong>
        <span id="pp-d-status" class="badge muted">—</span>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn ghost" id="pp-d-home">Home</button>
        <button class="btn" id="pp-d-packform">Packformular</button>
        <button class="btn ghost" id="pp-d-cancel">Stornieren</button>
        <button class="btn" id="pp-d-pack">Packen</button>
      </div>
    </header>
    <div class="body">
      <div id="pp-d-meta" style="display:flex;gap:12px;align-items:flex-start;margin-bottom:10px">
        <div><img id="pp-d-img" alt="" style="width:140px;height:88px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,.12)"></div>
        <div>
          <div class="muted">Kürzel</div><div id="pp-d-code" style="font-weight:600">—</div>
          <div class="muted" style="margin-top:6px">Lagerort</div><div id="pp-d-storage">—</div>
        </div>
      </div>
      <div class="table-wrap">
        <table>
          <thead><tr><th>Instrument</th><th>Soll</th><th>Kategorie</th></tr></thead>
          <tbody id="pp-d-tbody"></tbody>
        </table>
      </div>
    </div>
  `;
  container.appendChild(el);

  const $ = (s)=> el.querySelector(s);

  async function loadItems(code){
    const items = await cfg.getItemsForSet(code);
    const tb = $('#pp-d-tbody'); tb.innerHTML='';
    for(const it of items){
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${it.name}</td><td>${it.req ?? '—'}</td><td>${it.cat ?? '—'}</td>`;
      tb.appendChild(tr);
    }
  }

  const api = {
    async showSet(set){
      $('#pp-d-title').textContent = `${set.name||'—'}`;
      $('#pp-d-status').textContent = set.status || '—';
      $('#pp-d-code').textContent = set.code || '—';
      $('#pp-d-storage').textContent = set.storage || '—';
      const img = $('#pp-d-img');
      if(set.img) { img.src = set.img; img.style.display='block'; } else { img.removeAttribute('src'); img.style.display='none'; }
      await loadItems(set.code);
    },
    element: el
  };
  return api;
}
