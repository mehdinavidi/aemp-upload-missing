// shared/admin.js  (V1.1.10)
// Admin: feste Fenstergröße, scrollbare Liste, Drag & Drop Sortierung (per Benutzer), Aktiv/Deaktiv
(function(){
  const KEY_ENABLED = 'aemp_modules_enabled_v1';

  // Dashboard-Defaults (aktiv/inaktiv)
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

  // ---- Helpers: enabled-config (global, browserweit) ----
  function readEnabled(){ try{ return JSON.parse(localStorage.getItem(KEY_ENABLED)||'null') || DEFAULTS; }catch(e){ return DEFAULTS; } }
  function saveEnabled(cfg){ try{ localStorage.setItem(KEY_ENABLED, JSON.stringify(cfg)); }catch(e){} }

  // ---- Helpers: order per user (wie menu_order.js) ----
  function getUserName(){ try{ return (window.AEMP?.session?.getUser?.() || {}).username || 'anon'; }catch(e){ return 'anon'; } }
  function orderKey(){ return 'aemp_menu_order_' + getUserName(); }
  function readOrder(){
    try{ const raw = localStorage.getItem(orderKey()); return raw? JSON.parse(raw): []; }catch(e){ return []; }
  }
  function saveOrder(slugs){
    try{ localStorage.setItem(orderKey(), JSON.stringify(slugs||[])); }catch(e){}
  }

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

  // ----- Admin Panel -----
  function buildAdminPanel(container, cfgEnabled){
    if(!container) return;
    const role = getRoleOfCurrentUser();
    if((role||'').toLowerCase().indexOf('admin')===-1) return;

    const fab = document.createElement('div');
    fab.className='fab-fixed';
    const btn = document.createElement('button');
    btn.className='btn ghost'; btn.textContent='Menü bearbeiten';
    fab.appendChild(btn);
    document.body.appendChild(fab);

    // Lightbox (fixed size, scrollable list)
    const lb = document.createElement('div');
    lb.className='lightbox'; lb.style.display='none';
    lb.innerHTML = ''+
      '<div class="lightbox-inner" style="width:720px;max-width:95vw;height:560px;max-height:95vh;display:flex;flex-direction:column">'+
        '<h3>Hauptmenü konfigurieren</h3>'+
        '<div id="adminList" style="flex:1; overflow:auto; margin:6px 0; padding-right:4px"></div>'+
        '<div class="hstack" style="gap:8px; justify-content:space-between">'+
          '<div class="subtle">Tipp: Reihenfolge mit der Maus verschieben (Drag & Drop)</div>'+
          '<div class="hstack" style="gap:8px">'+
            '<button id="aCancel" class="btn ghost">Schließen</button>'+
            '<button id="aSave" class="btn primary">Speichern</button>'+
          '</div>'+
        '</div>'+
      '</div>';
    document.body.appendChild(lb);

    // Collect tile list
    const tiles = Array.from(container.querySelectorAll('.tile')).map(t=>{
      const slug = tileSlug(t);
      const title = t.querySelector('.tile-footer')?.textContent || slug;
      return { slug, title };
    }).filter(x=>x.slug);

    // Build rows with drag handles
    const list = lb.querySelector('#adminList');

    function renderRows(order){
      list.innerHTML='';
      // decide order: if order (saved) not empty, respect that
      const bySlug = new Map(tiles.map(x=>[x.slug,x]));
      const used = new Set();
      const final = [];
      if(order && order.length){
        order.forEach(s=>{ if(bySlug.has(s)){ final.append?final.append(bySlug.get(s)):final.push(bySlug.get(s)); used.add(s);} });
      }
      tiles.forEach(x=>{ if(!used.has(x.slug)) final.push(x); });

      final.forEach(it=>{
        const row = document.createElement('div');
        row.className='card';
        row.style.display='grid';
        row.style.gridTemplateColumns='28px 1fr auto';
        row.style.alignItems='center';
        row.style.gap='10px';
        row.draggable = true;
        row.dataset.slug = it.slug;
        row.innerHTML = ''+
          '<div class="dragHandle" title="Ziehen" style="cursor:grab">⋮⋮</div>'+
          '<div><div>'+it.title+'</div><div class="subtle">('+it.slug+')</div></div>'+
          '<label style="display:flex;align-items:center;gap:6px"><input type="checkbox" data-slug="'+it.slug+'"> aktiv</label>';
        list.appendChild(row);
      });

      // set checkbox states
      final.forEach(it=>{
        const cb = list.querySelector('input[type=checkbox][data-slug="'+it.slug+'"]');
        const enabled = (it.slug in cfgEnabled) ? !!cfgEnabled[it.slug] : true;
        if(cb) cb.checked = enabled;
      });

      // wire drag & drop
      let dragging = null;
      Array.from(list.children).forEach(row=>{
        row.addEventListener('dragstart', e=>{
          dragging = row;
          row.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
          try{ e.dataTransfer.setData('text/plain', row.dataset.slug); }catch(_){}
        });
        row.addEventListener('dragend', ()=>{
          if(dragging){ dragging.classList.remove('dragging'); dragging=null; }
        });
        row.addEventListener('dragover', e=>{
          e.preventDefault();
          if(!dragging || dragging===row) return;
          const rect = row.getBoundingClientRect();
          const midpoint = rect.top + rect.height/2;
          const before = e.clientY < midpoint;
          if(before) list.insertBefore(dragging, row);
          else list.insertBefore(dragging, row.nextSibling);
        });
        row.addEventListener('drop', e=>{ e.preventDefault(); });
      });
    }

    // initial render with saved order
    renderRows(readOrder());

    function close(){ lb.style.display='none'; }
    function open(){ lb.style.display='flex'; }

    btn.onclick = open;
    lb.querySelector('#aCancel').onclick = close;
    lb.querySelector('#aSave').onclick = function(){
      // collect order
      const slugs = Array.from(list.children).map(el=>el.dataset.slug).filter(Boolean);
      saveOrder(slugs);
      // collect enable-state
      const newCfg = Object.assign({}, readEnabled());
      list.querySelectorAll('input[type=checkbox][data-slug]').forEach(cb=>{
        newCfg[cb.dataset.slug] = cb.checked;
      });
      saveEnabled(newCfg);
      // apply both
      if(window.AEMP_MENU){ AEMP_MENU.enable('.grid-tiles'); } // reapply current DOM order baseline
      if(window.AEMP_ADMIN){ AEMP_ADMIN.applyState(container, newCfg); }
      close();
    };
  }

  window.AEMP_ADMIN = { read: readEnabled, save: saveEnabled, applyState, buildAdminPanel };
})();
