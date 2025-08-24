export function createContentsPanel(mount, opts={}){
  mount.innerHTML = `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px">
      <div id="pp-ct-title" style="font-weight:700">Inhalt</div>
      <button id="pp-ct-pack" class="primary">Packen</button></div>
    <div style="margin-top:10px;overflow:auto">
      <table class="table"><thead><tr><th>Instrument</th><th>Soll</th><th>Kategorie</th><th>Bilder</th></tr></thead><tbody id="pp-ct-body"></tbody></table>
    </div></div>`;
  const elTitle=mount.querySelector('#pp-ct-title'), elBody=mount.querySelector('#pp-ct-body'), btn=mount.querySelector('#pp-ct-pack'); let current=null;
  async function show(row){
    current=row; elTitle.textContent=`Inhalt – ${row.name} (${row.code})`; elBody.innerHTML='';
    let items=[]; if(typeof opts.loadItems==='function'){ items = await opts.loadItems(row); }
    for(const it of (items||[])){ const tr=document.createElement('tr'); const imgs=(it.images||[]).map(u=>`<img src="${u}" alt="" style="width:28px;height:28px;object-fit:cover;border-radius:6px;border:1px solid rgba(255,255,255,.1)">`).join(' ');
      tr.innerHTML = `<td>${it.name}</td><td>${it.req}</td><td>${it.cat||'—'}</td><td>${imgs||'—'}</td>`; elBody.appendChild(tr); }
  }
  btn.addEventListener('click', ()=>{ if(current && typeof opts.onPack==='function') opts.onPack(current); });
  return { show };
}