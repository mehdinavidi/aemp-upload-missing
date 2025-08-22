
// modules/packplatz/pack.js
// Orchestrates the set list (left), details (right), barcode input, and the pack dialog.

import { createSetList } from './list.js';
import { createSetDetails } from './details.js';

export function createPackplatz(mount, providers={}, callbacks={}){
  const cfg = {
    getSets: async ()=>[],
    getSetByCode: async (code)=> null,
    getItemsForSet: async (code)=> [],
    storageColsKey: 'aemp.packplatz.columns.v2',
    storageSessKey: 'aemp.pack.session.v2'
  };
  Object.assign(cfg, providers||{});
  const cb = Object.assign({
    onOpen: ()=>{}, onSave: ()=>{}, onComplete: ()=>{}, onCancel: ()=>{}
  }, callbacks||{});

  const root = document.createElement('div');
  root.className = 'aemp-pp';
  root.innerHTML = `
    <div class="card pane" style="grid-column:1/-1">
      <header>
        <div style="display:flex;gap:8px;align-items:center">
          <span class="pill">Packplatz • Modul</span>
          <span class="pill">v1.2</span>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <label class="pill" for="pp-scan">🔎 Barcode/Kürzel</label>
          <input id="pp-scan" type="text" placeholder="z. B. SET-OR-123" style="min-width:320px">
          <button class="btn" id="pp-open">Öffnen</button>
        </div>
      </header>
    </div>
  `;
  mount.appendChild(root);

  // panes
  const leftPane = document.createElement('div');
  const rightPane = document.createElement('div');
  leftPane.className = 'pane'; rightPane.className = 'pane';
  root.appendChild(leftPane); root.appendChild(rightPane);

  // components
  const list = createSetList(leftPane, {
    storeKey: cfg.storageColsKey,
    getSets: cfg.getSets,
    onSelect: (set)=> openSet(set.code)
  });
  const details = createSetDetails(rightPane, {
    getItemsForSet: cfg.getItemsForSet
  });

  // scan focus behavior
  const scan = root.querySelector('#pp-scan');
  function focusScan(){ scan.focus({preventScroll:true}); scan.select(); }
  window.addEventListener('load', focusScan);
  window.addEventListener('focus', focusScan);
  document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) focusScan(); });
  const keep = setInterval(()=>{ if(document.activeElement!==scan) focusScan(); }, 5000);

  root.querySelector('#pp-open').addEventListener('click', ()=> openByScan());
  scan.addEventListener('keydown', (e)=>{ if(e.key==='Enter'){ e.preventDefault(); openByScan(); }});

  async function openByScan(){
    const code = (scan.value||'').trim();
    if(!code) return;
    let set = await cfg.getSetByCode(code);
    if(!set){
      // fallback: load all and find client-side
      const all = await cfg.getSets();
      set = all.find(s => (s.code||'').toLowerCase() === code.toLowerCase());
    }
    if(set) await openSet(set.code);
  }

  // sessions
  function loadSession(code){
    try{
      const all = JSON.parse(localStorage.getItem(cfg.storageSessKey)) || {};
      return all[code] || null;
    }catch{ return null }
  }
  function saveSession(code, data){
    const all = (function(){ try{ return JSON.parse(localStorage.getItem(cfg.storageSessKey)) || {} }catch{ return {} } })();
    all[code] = data;
    localStorage.setItem(cfg.storageSessKey, JSON.stringify(all));
  }

  // pack dialog
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `
    <div class="modal-head">
      <strong id="pp-title">Packvorgang</strong>
      <div>
        <span class="pill">✔ <b id="pp-c-ok">0</b></span>
        <span class="pill">❗ <b id="pp-c-part">0</b></span>
        <span class="pill">✖ <b id="pp-c-miss">0</b></span>
        <button class="btn ghost" id="pp-close">✕</button>
      </div>
    </div>
    <div style="padding:12px 14px">
      <table style="width:100%;border-collapse:collapse">
        <thead><tr><th style="text-align:left">Instrument</th><th>Soll</th><th>Ist</th><th>Status</th><th>Grund</th><th>Aktion</th></tr></thead>
        <tbody id="pp-body"></tbody>
      </table>
    </div>
    <div class="modal-foot">
      <button class="btn ghost" id="pp-cancel">Stornieren</button>
      <button class="btn" id="pp-save">Speichern</button>
      <button class="btn" id="pp-complete">Fertig packen</button>
    </div>
  `;
  root.appendChild(dlg);

  const $ = (s,rootEl=root)=>rootEl.querySelector(s);

  async function openSet(code){
    const set = await cfg.getSetByCode(code) || (await cfg.getSets()).find(s=>s.code===code);
    if(!set) return;
    cb.onOpen(set);
    await details.showSet(set);
    // open pack dialog immediately (behaves like scanner workflow)
    openPackDialog(set);
  }

  async function openPackDialog(set){
    $('#pp-title', dlg).textContent = `Packvorgang – ${set.name} (${set.code})`;
    let sess = loadSession(set.code);
    if(!sess){
      const items = (await cfg.getItemsForSet(set.code) || []).map(x=>({ id:x.id, name:x.name, req:x.req, qty:x.req, state:'OK', reason:'' }));
      sess = { code:set.code, status:'DRAFT', items };
      saveSession(set.code, sess);
    }
    renderPack(sess);
    dlg.showModal();
    setTimeout(focusScan,0);
  }

  function renderState(state){
    if(state==='OK') return '✔';
    if(state==='PARTIAL') return '❗';
    if(state==='MISSING') return '✖';
    return '—';
  }
  function updateCounters(sess){
    let ok=0, part=0, miss=0;
    for(const it of sess.items){
      if(it.state==='OK') ok++;
      else if(it.state==='PARTIAL') part++;
      else if(it.state==='MISSING') miss++;
    }
    $('#pp-c-ok', dlg).textContent = ok;
    $('#pp-c-part', dlg).textContent = part;
    $('#pp-c-miss', dlg).textContent = miss;
  }
  function recalcStates(sess){
    for(const it of sess.items){
      if(it.qty===it.req) it.state='OK';
      else if(it.qty===0) it.state='MISSING';
      else it.state='PARTIAL';
    }
  }

  function renderPack(sess){
    const body = $('#pp-body', dlg);
    body.innerHTML='';
    for(const it of sess.items){
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>${it.name}</td>
        <td style="text-align:center">${it.req}</td>
        <td style="text-align:center">
          <button class="btn ghost" data-act="minus" data-id="${it.id}">−</button>
          <span class="qty" data-id="${it.id}" style="display:inline-block;min-width:2ch;text-align:center">${it.qty}</span>
          <button class="btn ghost" data-act="plus" data-id="${it.id}">+</button>
        </td>
        <td class="st" data-id="${it.id}" style="text-align:center"></td>
        <td>
          <select class="reason" data-id="${it.id}">
            <option value="">—</option>
            <option value="verloren">verloren</option>
            <option value="defekt">defekt</option>
            <option value="in Reparatur">in Reparatur</option>
            <option value="nicht vorhanden">nicht vorhanden</option>
          </select>
        </td>
        <td><button class="btn ghost" data-act="missing" data-id="${it.id}">als fehlend markieren</button></td>
      `;
      body.appendChild(tr);
      tr.querySelector('.reason').value = it.reason || '';
    }
    body.querySelectorAll('button[data-act]').forEach(btn=>{
      btn.addEventListener('click', ()=>{
        const id = btn.dataset.id;
        const act = btn.dataset.act;
        const it = sess.items.find(x=>x.id===id);
        if(!it) return;
        if(act==='minus'){ it.qty=Math.max(0,Math.min(it.req,(it.qty||0)-1)); }
        if(act==='plus'){ it.qty=Math.max(0,Math.min(it.req,(it.qty||0)+1)); }
        if(act==='missing'){ it.qty=0; it.state='MISSING'; }
        recalcStates(sess);
        saveSession(sess.code, sess);
        renderPack(sess);
      });
    });
    body.querySelectorAll('.reason').forEach(sel=>{
      sel.addEventListener('change', (e)=>{
        const id = sel.dataset.id;
        const it = sess.items.find(x=>x.id===id); if(!it) return;
        it.reason = sel.value;
        saveSession(sess.code, sess);
      });
    });
    // update states & counters
    recalcStates(sess);
    body.querySelectorAll('.st').forEach(cell=>{
      const id = cell.dataset.id;
      const it = sess.items.find(x=>x.id===id);
      cell.innerHTML = renderState(it.state);
    });
    updateCounters(sess);
  }

  $('#pp-close', dlg).addEventListener('click', ()=> dlg.close());
  $('#pp-save', dlg).addEventListener('click', ()=>{
    const title = $('#pp-title', dlg).textContent;
    const code = (title.match(/\(([^)]+)\)$/)||[])[1];
    if(code){
      const sess = loadSession(code);
      if(sess){ cb.onSave(sess); }
    }
    dlg.close(); focusScan();
  });
  $('#pp-cancel', dlg).addEventListener('click', ()=>{
    const title = $('#pp-title', dlg).textContent;
    const code = (title.match(/\(([^)]+)\)$/)||[])[1];
    if(code){
      const sess = loadSession(code);
      if(sess){ sess.status='CANCELLED'; saveSession(code, sess); cb.onCancel(sess); }
    }
    dlg.close(); focusScan();
  });
  $('#pp-complete', dlg).addEventListener('click', ()=>{
    const title = $('#pp-title', dlg).textContent;
    const code = (title.match(/\(([^)]+)\)$/)||[])[1];
    if(code){
      const sess = loadSession(code);
      if(sess){ sess.status='PACKED'; saveSession(code, sess); cb.onComplete(sess); }
    }
    dlg.close(); focusScan();
  });

  // expose api
  return {
    element: root,
    openByCode: (code)=> openSet(code),
    destroy(){
      clearInterval(keep);
      root.remove();
    }
  };
}
