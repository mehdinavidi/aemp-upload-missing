export function createDetailsPanel(mount, opts={}){
  mount.innerHTML = `<div class="card"><div style="display:flex;justify-content:space-between;gap:8px"><div id="pp-title" style="font-weight:700">Details</div></div>
    <div style="display:grid;grid-template-columns:120px 1fr;gap:10px;margin-top:10px">
      <img id="pp-img" alt="" style="width:120px;height:auto;border-radius:8px;border:1px solid rgba(255,255,255,.1)">
      <div id="pp-meta" style="display:grid;grid-template-columns:repeat(2,1fr);gap:6px"></div>
    </div></div>`;
  const elTitle=mount.querySelector('#pp-title'), elImg=mount.querySelector('#pp-img'), elMeta=mount.querySelector('#pp-meta');
  async function show(row){
    if(!row) return;
    elTitle.textContent = `${row.name} (${row.code})`;
    elImg.src = row.img || 'https://via.placeholder.com/120x90?text=Set';
    elMeta.innerHTML='';
    let meta = { Status: row.status||'—', Lagerort: row.storage||'—' };
    if(typeof opts.loadDetails==='function'){ const det=await opts.loadDetails(row); if(det && det.meta) meta = det.meta; }
    for(const [k,v] of Object.entries(meta)){ const d=document.createElement('div'); d.innerHTML=`<div style="color:#9fb0c8;font-size:12px">${k}</div><div>${v||'—'}</div>`; elMeta.appendChild(d); }
  }
  return { show };
}