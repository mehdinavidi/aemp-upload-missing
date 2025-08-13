// shared/admin.js  (V1.1.8) – Admin: Tiles aktivieren/deaktivieren
(function(){
  const KEY = 'aemp_modules_enabled_v1';
  // Default-Status
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
    'steri': true // für die Kachel "Steri-Freigabe" die separat gerendert wird
  };

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
    // Fallback: Versuche den Footer-Text zu sluggen
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
    // Only show to Administrators
    const role = getRoleOfCurrentUser();
    if((role||'').toLowerCase().indexOf('admin')===-1) return;

    const fab = document.createElement('div');
    fab.className='fab-fixed';
    const btn = document.createElement('button');
    btn.className='btn ghost'; btn.textContent='Menü bearbeiten';
    fab.appendChild(btn);
    document.body.appendChild(fab);

    // Lightbox
    const lb = document.createElement('div');
    lb.className='lightbox'; lb.style.display='none';
    lb.innerHTML = '<div class="lightbox-inner" style="min-width:520px;max-width:90vw"><h3>Hauptmenü konfigurieren</h3><div id="adminList" class="vstack" style="gap:6px;align-items:stretch"></div><div class="hstack" style="gap:8px"><button id="aCancel" class="btn ghost">Schließen</button><button id="aSave" class="btn primary">Speichern</button></div></div>';
    document.body.appendChild(lb);

    function open(){
      const list = lb.querySelector('#adminList'); list.innerHTML='';
      const tiles = Array.from(container.querySelectorAll('.tile'));
      tiles.forEach(t=>{
        const slug = tileSlug(t); if(!slug) return;
        const title = t.querySelector('.tile-footer')?.textContent || slug;
        const row = document.createElement('label');
        row.className='card'; row.style.display='flex'; row.style.alignItems='center'; row.style.gap='10px';
        row.innerHTML = '<input type="checkbox" '+ ((slug in cfg? cfg[slug]:true)?'checked':'') +' data-slug="'+slug+'"> <div>'+title+'</div><div class="subtle" style="margin-left:auto">('+slug+')</div>';
        list.appendChild(row);
      });
      lb.style.display='flex';
    }
    function close(){ lb.style.display='none'; }

    btn.onclick = open;
    lb.querySelector('#aCancel').onclick = close;
    lb.querySelector('#aSave').onclick = function(){
      const newCfg = Object.assign({}, read());
      lb.querySelectorAll('input[type=checkbox][data-slug]').forEach(cb=>{
        newCfg[cb.dataset.slug] = cb.checked;
      });
      save(newCfg);
      applyState(container, newCfg);
      close();
    };
  }

  // Public API
  window.AEMP_ADMIN = {
    read, save, applyState, buildAdminPanel
  };
})();
