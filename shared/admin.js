// shared/admin.js  (V1.1.9) – Admin: Tiles aktivieren/deaktivieren (10 pro Seite + Blättern)
(function(){
  const KEY = 'aemp_modules_enabled_v1';
  const DEFAULTS = {
    'stammdaten': false,
    'instr-management': false,
    'qm': false,
    'statistiken': false,
    'planungsmonitor': false,
    'planungsmonitor-op': false,
    'op-modul': false,
    'buchungsmodule': false,
    'packplatz': true,
    'fallwagen-menue': false,
    'dokumentenlenkung': false,
    'maschinen-alle': false,
    'maschinen-rdg': false,
    'maschinen-rdg-e': false,
    'maschinen-steri': false,
    'maschinen-trockner': false,
    'maschinen-siegelgeraete': false,
    'steri': true
  };
  const PAGE_SIZE = 10;

  function read(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null') || DEFAULTS; }catch(e){ return DEFAULTS; } }
  function save(cfg){ try{ localStorage.setItem(KEY, JSON.stringify(cfg)); }catch(e){} }

  function getRoleOfCurrentUser(){
    try{
      const user = (window.AEMP && AEMP.session && AEMP.session.getUser && AEMP.session.getUser()) || null;
      if(!user) return null;
      if(!window.AEMP_USERS || !AEMP_USERS.list) return null;
      const entry = AEMP_USERS.list().find(u=>u.username===user.username);
      return entry ? (entry.role||'') : null;
    } catch(e){ return null; }
  }

  function tileSlug(tile){
    if (!tile) return '';
    if (tile.dataset.slug) return tile.dataset.slug;
    const a = tile.querySelector('a[href]');
    let href = a ? a.getAttribute('href') : '';
    let m = href.match(/seiten\/([^/]+)\//);
    let s = (m && m[1]) ? m[1] : (href.includes('packplatz.html') ? 'packplatz' : (href.includes('steri.html') ? 'steri' : ''));
    if(!s){
      const txt = (tile.querySelector('.tile-footer')?.textContent || '').toLowerCase().trim();
      s = txt.replace(/[()]/g,'').replace(/\s+|\/+/g,'-').replace(/[^a-z0-9\-_.]/g,'');
    }
    tile.dataset.slug = s;
    return s;
  }

  function applyState(container, cfg){
    const tiles = Array.from(container.querySelectorAll('.tile'));
    tiles.forEach(t=>{
      const s = tileSlug(t);
      if(!s) return;
      const enabled = (s in cfg) ? !!cfg[s] : true;
      if(enabled){
        t.classList.remove('disabled');
        const badge = t.querySelector('.badge-soon');
        if(badge) badge.remove();
      } else {
        if(!t.classList.contains('disabled')) t.classList.add('disabled');
        if(!t.querySelector('.badge-soon')){
          const b = document.createElement('span');
          b.className='badge-soon'; b.textContent='in Arbeit';
          t.appendChild(b);
        }
      }
    });
  }

  function buildAdminPanel(container, cfg){
    if(!container) return;
    const role = getRoleOfCurrentUser();
    if((role||'').toLowerCase().indexOf('admin')===-1) return;

    const fab = document.createElement('div');
    fab.className='fab-fixed';
    const btn = document.createElement('button');
    btn.className='btn ghost'; btn.textContent='Menü bearbeiten';
    fab.appendChild(btn);
    document.body.appendChild(fab);

    // Lightbox container
    const lb = document.createElement('div');
    lb.className='lightbox'; lb.style.display='none';
    lb.innerHTML = '<div class="lightbox-inner" style="min-width:560px;max-width:95vw">\
      <h3>Hauptmenü konfigurieren</h3>\
      <div id="adminList" class="vstack" style="gap:6px;align-items:stretch"></div>\
      <div class="hstack" style="justify-content:space-between;align-items:center;margin-top:8px">\
        <div class="hstack" style="gap:6px">\
          <button id="aPrev" class="btn ghost">◀</button>\
          <span id="aPage" class="subtle">Seite 1/1</span>\
          <button id="aNext" class="btn ghost">▶</button>\
        </div>\
        <div class="hstack" style="gap:8px">\
          <button id="aCancel" class="btn ghost">Schließen</button>\
          <button id="aSave" class="btn primary">Speichern</button>\
        </div>\
      </div>\
    </div>';
    document.body.appendChild(lb);

    // Collect all tiles (with slug + title)
    const tiles = Array.from(container.querySelectorAll('.tile')).map(t=>{
      const slug = tileSlug(t);
      const title = t.querySelector('.tile-footer')?.textContent || slug;
      return { slug, title };
    }).filter(x=>x.slug);

    let page = 0;
    const maxPage = Math.max(0, Math.ceil(tiles.length / PAGE_SIZE) - 1);

    function renderPage(){
      const list = lb.querySelector('#adminList'); list.innerHTML='';
      const start = page*PAGE_SIZE;
      const slice = tiles.slice(start, start + PAGE_SIZE);
      slice.forEach(it=>{
        const row = document.createElement('label');
        row.className='card'; row.style.display='flex'; row.style.alignItems='center'; row.style.gap='10px';
        const checked = (it.slug in cfg ? !!cfg[it.slug] : true) ? 'checked' : '';
        row.innerHTML = '<input type="checkbox" '+checked+' data-slug="'+it.slug+'">\
                         <div>'+it.title+'</div>\
                         <div class="subtle" style="margin-left:auto">('+it.slug+')</div>';
        list.appendChild(row);
      });
      lb.querySelector('#aPage').textContent = 'Seite ' + (page+1) + '/' + (maxPage+1);
      lb.querySelector('#aPrev').disabled = (page<=0);
      lb.querySelector('#aNext').disabled = (page>=maxPage);
    }

    function open(){ renderPage(); lb.style.display='flex'; }
    function close(){ lb.style.display='none'; }

    btn.onclick = open;
    lb.querySelector('#aCancel').onclick = close;
    lb.querySelector('#aPrev').onclick = function(){
      // merge current page changes into cfg before changing page
      lb.querySelectorAll('input[type=checkbox][data-slug]').forEach(cb=>{ cfg[cb.dataset.slug]=cb.checked; });
      if(page>0){ page--; renderPage(); }
    };
    lb.querySelector('#aNext').onclick = function(){
      lb.querySelectorAll('input[type=checkbox][data-slug]').forEach(cb=>{ cfg[cb.dataset.slug]=cb.checked; });
      if(page<maxPage){ page++; renderPage(); }
    };
    lb.querySelector('#aSave').onclick = function(){
      // capture current page
      lb.querySelectorAll('input[type=checkbox][data-slug]').forEach(cb=>{ cfg[cb.dataset.slug]=cb.checked; });
      save(cfg);
      applyState(container, cfg);
      close();
    };
  }

  window.AEMP_ADMIN = { read, save, applyState, buildAdminPanel };
})();
