export function createSetList(mount, opts={}){
  const COLUMNS = opts.columns || [{key:'img',label:'Set Bild',fixed:true},{key:'code',label:'Kürzel',fixed:true},{key:'name',label:'Set Bezeichnung',fixed:true},{key:'status',label:'Status'},{key:'storage',label:'Lagerort'}];
  const STORE_COLS = opts.storageKey || 'aemp.packplatz.columns.v1';
  mount.innerHTML = `<div style="display:flex;gap:8px;align-items:center;justify-content:space-between;margin-bottom:8px">
      <div style="display:flex;gap:8px;align-items:center">
        <label class="pill" for="pp-scan">🔎 Barcode/Kürzel:</label>
        <input id="pp-scan" type="text" placeholder="z. B. SET-OR-123" style="min-width:260px">
        <button id="pp-scan-open">Öffnen</button>
      </div>
      <button id="pp-reset">Spalten zurücksetzen</button>
    </div>
    <div style="overflow:auto"><table class="table"><thead><tr id="pp-hdr"></tr></thead><tbody id="pp-body"></tbody></table></div>
    <div id="pp-menu" style="display:none;position:fixed;z-index:10;min-width:200px;background:#0b1020;border:1px solid rgba(255,255,255,.12);border-radius:10px;padding:8px"></div>`;
  const scan=mount.querySelector('#pp-scan'), btn=mount.querySelector('#pp-scan-open'), reset=mount.querySelector('#pp-reset'), hdr=mount.querySelector('#pp-hdr'), body=mount.querySelector('#pp-body'), menu=mount.querySelector('#pp-menu');
  hdr.innerHTML = COLUMNS.map(c=>`<th data-key="${'${'}c.key${'}'}">${'${'}c.label${'}'}</th>`).join('');
  function loadPrefs(){ try{ return JSON.parse(localStorage.getItem(STORE_COLS)) || {} }catch{ return {} } }
  function savePrefs(p){ localStorage.setItem(STORE_COLS, JSON.stringify(p)); }
  function setCol(key,on){ const th=hdr.querySelector(`th[data-key="${'${'}key${'}'}"]`); if(th) th.style.display=on?'':'none'; body.querySelectorAll(`td[data-key="${'${'}key${'}'}"]`).forEach(td=> td.style.display=on?'':'none'); }
  let rows=[];
  function setData(list){ rows=Array.isArray(list)?list:[]; body.innerHTML=''; for(const r of rows){ const tr=document.createElement('tr'); tr.innerHTML=`
      <td data-key="img">${'${'}r.img?`<img src="${'${'}r.img${'}'}" alt="" style="width:64px;height:40px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.1)">`:''${'}'}</td>
      <td data-key="code">${'${'}r.code||''${'}'}</td>
      <td data-key="name">${'${'}r.name||''${'}'}</td>
      <td data-key="status">${'${'}r.status||''${'}'}</td>
      <td data-key="storage">${'${'}r.storage||''${'}'}</td>`; tr.addEventListener('click', ()=> opts.onSelect && opts.onSelect(r)); tr.addEventListener('dblclick', ()=> opts.onSelect && opts.onSelect(r)); body.appendChild(tr); }
    const prefs=loadPrefs(); for(const c of COLUMNS){ if(c.fixed) continue; const visible=prefs[c.key]!==false; setCol(c.key,visible); } }
  async function reload(){ if(typeof opts.getSets==='function'){ setData(await opts.getSets('')); } }
  function buildMenu(){ const prefs=loadPrefs(); menu.innerHTML='<h4 style="margin:6px 8px 8px;font-size:12px;color:#9fb0c8">Spalten anzeigen</h4>'; for(const c of COLUMNS){ if(c.fixed) continue; const div=document.createElement('div'); const on=prefs[c.key]!==false; div.innerHTML = `<label style="display:flex;gap:8px;align-items:center;padding:6px 8px"><input type="checkbox" ${'${'}on?'checked':''${'}'}>${'${'}c.label${'}'}</label>`; div.querySelector('input').addEventListener('change', e=>{ const v=e.currentTarget.checked; const p=loadPrefs(); p[c.key]=v; savePrefs(p); setCol(c.key,v); }); menu.appendChild(div); } }
  hdr.addEventListener('contextmenu', e=>{ e.preventDefault(); buildMenu(); menu.style.display='block'; const rect=menu.getBoundingClientRect(); const x=Math.min(e.clientX, window.innerWidth-rect.width-8); const y=Math.min(e.clientY, window.innerHeight-rect.height-8); menu.style.left=x+'px'; menu.style.top=y+'px'; });
  document.addEventListener('click', e=>{ if(!menu.contains(e.target)) menu.style.display='none'; });
  function focusScan(){ scan.focus({preventScroll:true}); scan.select(); }
  window.addEventListener('load', focusScan); window.addEventListener('focus', focusScan); document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) focusScan(); });
  async function openByScan(){ const code=(scan.value||'').trim(); if(!code) return; let row=rows.find(r=>String(r.code||'').toLowerCase()===code.toLowerCase()); if(!row && typeof opts.getSets==='function'){ const list=await opts.getSets(code); row=list.find(r=>String(r.code||'').toLowerCase()===code.toLowerCase())||list[0]; } if(row && typeof opts.onSelect==='function') opts.onSelect(row); }
  btn.addEventListener('click', openByScan); scan.addEventListener('keydown', e=>{ if(e.key==='Enter'){ e.preventDefault(); openByScan(); }});
  reload(); return { setData, reload, focusScan };
}