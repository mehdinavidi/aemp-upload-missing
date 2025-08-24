export function createPackDialog(opts={}){
  const STORE = opts.storageKey || 'aemp.pack.session.v1';
  const dlg = document.createElement('dialog');
  dlg.innerHTML = `<div class="card" style="min-width:70vw"><div style="display:flex;justify-content:space-between">
      <strong id="pp-title">Packvorgang</strong>
      <div><span class="pill">✔ <b id="pp-ok">0</b></span><span class="pill">❗ <b id="pp-part">0</b></span><span class="pill">✖ <b id="pp-miss">0</b></span>
      <button id="pp-close" class="ghost">✕</button></div></div>
      <div style="margin-top:10px"><table class="table"><thead><tr><th>Instrument</th><th>Soll</th><th>Ist</th><th>Status</th><th>Grund</th><th>Aktion</th></tr></thead><tbody id="pp-body"></tbody></table></div>
      <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px"><button id="pp-cancel" class="ghost">Stornieren</button><button id="pp-save">Speichern</button><button id="pp-complete" class="primary">Fertig packen</button></div></div>`;
  document.body.appendChild(dlg);
  const E=s=>dlg.querySelector(s); const elTitle=E('#pp-title'), elBody=E('#pp-body'), okE=E('#pp-ok'), partE=E('#pp-part'), missE=E('#pp-miss');
  function loadAll(){ try{ return JSON.parse(localStorage.getItem(STORE)) || {} }catch{ return {} } } function saveAll(all){ localStorage.setItem(STORE, JSON.stringify(all)); }
  function loadSession(code){ return loadAll()[code]||null } function saveSession(code,s){ const all=loadAll(); all[code]=s; saveAll(all); }
  let current=null; const icon=s=>s==='OK'?'✔':(s==='PARTIAL'?'❗':(s==='MISSING'?'✖':'—'));
  function counters(){ let ok=0,part=0,miss=0; for(const it of current.items){ if(it.state==='OK') ok++; else if(it.state==='PARTIAL') part++; else if(it.state==='MISSING') miss++; } okE.textContent=ok; partE.textContent=part; missE.textContent=miss; }
  function recalc(it){ if(it.qty===it.req) it.state='OK'; else if(it.qty===0) it.state='MISSING'; else it.state='PARTIAL'; }
  function redraw(){ elBody.innerHTML=''; for(const it of current.items){ const tr=document.createElement('tr'); tr.innerHTML=`<td>${it.name}</td><td style="text-align:center">${it.req}</td>
      <td style="text-align:center"><button class="ghost pp-minus" data-id="${it.id}">−</button><span class="pp-qty" data-id="${it.id}" style="display:inline-block;min-width:2ch;text-align:center">${it.qty}</span><button class="ghost pp-plus" data-id="${it.id}">+</button></td>
      <td class="pp-st" data-id="${it.id}" style="text-align:center">${icon(it.state)}</td>
      <td><select class="pp-reason" data-id="${it.id}"><option value="">—</option><option value="verloren">verloren</option><option value="defekt">defekt</option><option value="in Reparatur">in Reparatur</option><option value="nicht vorhanden">nicht vorhanden</option></select></td>
      <td><button class="ghost pp-missing" data-id="${it.id}">als fehlend markieren</button></td>`; elBody.appendChild(tr); const sel=tr.querySelector('.pp-reason'); sel.value=it.reason||''; sel.disabled=(it.state==='OK'); }
    elBody.querySelectorAll('.pp-minus').forEach(b=> b.addEventListener('click', ()=> inc(b.dataset.id,-1)));
    elBody.querySelectorAll('.pp-plus').forEach(b=> b.addEventListener('click', ()=> inc(b.dataset.id,+1)));
    elBody.querySelectorAll('.pp-missing').forEach(b=> b.addEventListener('click', ()=> miss(b.dataset.id)));
    elBody.querySelectorAll('.pp-reason').forEach(s=> s.addEventListener('change', e=> reason(e.target.dataset.id, e.target.value)));
    counters(); }
  function inc(id,d){ const it=current.items.find(x=>x.id===id); if(!it) return; it.qty=Math.max(0,Math.min(it.req,(it.qty||0)+d)); recalc(it); saveSession(current.code,current);
    dlg.querySelector(`.pp-qty[data-id="${id}"]`).textContent=it.qty; dlg.querySelector(`.pp-st[data-id="${id}"]`).textContent=icon(it.state); const sel=dlg.querySelector(`.pp-reason[data-id="${id}"]`); if(sel) sel.disabled=(it.state==='OK'); counters(); }
  function miss(id){ const it=current.items.find(x=>x.id===id); if(!it) return; it.qty=0; recalc(it); saveSession(current.code,current); redraw(); }
  function reason(id,val){ const it=current.items.find(x=>x.id===id); if(!it) return; it.reason=val; saveSession(current.code,current); }
  async function open(session){ current=session; elTitle.textContent=`Packvorgang – ${session.name||session.code} (${session.code})`; let s=loadSession(session.code);
    if(!s){ const items = typeof opts.getItemsForSet==='function' ? await opts.getItemsForSet(session.code) : []; current.items = items.map(x=>({id:x.id,name:x.name,req:x.req,qty:x.req,state:'OK',reason:''})); current.status='DRAFT'; saveSession(session.code,current); } else { current=s; }
    redraw(); dlg.showModal(); if(typeof opts.onOpen==='function') opts.onOpen(current); }
  function close(){ dlg.close(); }
  E('#pp-close').addEventListener('click', close);
  E('#pp-cancel').addEventListener('click', ()=>{ if(current){ current.status='CANCELLED'; saveSession(current.code,current);} if(opts.onCancel) opts.onCancel(current); close(); });
  E('#pp-save').addEventListener('click', ()=>{ if(current){ saveSession(current.code,current);} if(opts.onSave) opts.onSave(current); close(); });
  E('#pp-complete').addEventListener('click', ()=>{ if(current){ current.status='PACKED'; saveSession(current.code,current);} if(opts.onComplete) opts.onComplete(current); close(); });
  return { open, close };
}