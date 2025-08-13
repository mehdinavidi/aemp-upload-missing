// shared/menu_order.js  (V1.1.6)
(function () {
  const NS = (window.AEMP_MENU = {});
  function getUserName() { try { return (window.AEMP?.session?.getUser?.() || {}).username || "anon"; } catch (e) { return "anon"; } }
  function storageKey() { return "aemp_menu_order_" + getUserName(); }
  function slugify(str) { return String(str).trim().toLowerCase().replace(/[()]/g, "").replace(/\s+|\/+/g, "-").replace(/[^a-z0-9\-_.]/g, ""); }
  function tileSlug(tile) {
    if (!tile) return ""; if (tile.dataset.slug) return tile.dataset.slug;
    const a = tile.querySelector("a[href]"); let href = a ? a.getAttribute("href") : "";
    let m = href.match(/seiten\/([^/]+)\//);
    let s = (m && m[1]) ? m[1] : href.includes("packplatz.html") ? "packplatz" : href.includes("steri.html") ? "steri" : slugify(tile.querySelector(".tile-footer")?.textContent || "tile");
    tile.dataset.slug = s; return s;
  }
  function readOrder() { try { const raw = localStorage.getItem(storageKey()); return raw ? JSON.parse(raw) : []; } catch(e){ return []; } }
  function saveOrder(slugs){ try { localStorage.setItem(storageKey(), JSON.stringify(slugs||[])); } catch(e){} }
  function applySavedOrder(container){
    const tiles = Array.from(container.children).filter(el=>el.classList.contains("tile"));
    const current = tiles.map(tileSlug); const saved = readOrder(); if (!saved.length) return;
    const setSaved = new Set(saved);
    const orderedSlugs = [...saved.filter(s=>current.includes(s)), ...current.filter(s=>!setSaved.has(s))];
    const map = new Map(tiles.map(t=>[tileSlug(t),t])); orderedSlugs.forEach(s=>{ const el = map.get(s); if (el) container.appendChild(el); });
  }
  function currentOrder(container){ return Array.from(container.children).filter(el=>el.classList.contains("tile")).map(tileSlug); }
  function enableDrag(container){
    let dragged=null;
    Array.from(container.children).filter(el=>el.classList.contains("tile")).forEach(tile=>{
      tile.setAttribute("draggable","true");
      tile.addEventListener("dragstart", e=>{ dragged=tile; tile.classList.add("dragging"); e.dataTransfer.effectAllowed="move"; try{e.dataTransfer.setData("text/plain", tileSlug(tile));}catch(_){} });
      tile.addEventListener("dragend", ()=>{ tile.classList.remove("dragging"); Array.from(container.children).forEach(c=>c.classList.remove("drag-over")); saveOrder(currentOrder(container)); });
      tile.addEventListener("dragover", e=>{ e.preventDefault(); if(!dragged||dragged===tile) return; const rect=tile.getBoundingClientRect(); const midpoint=rect.left+rect.width/2; const insertBefore=e.clientX<midpoint; tile.classList.add("drag-over"); if(insertBefore) container.insertBefore(dragged,tile); else container.insertBefore(dragged,tile.nextSibling); });
      tile.addEventListener("dragleave", ()=>tile.classList.remove("drag-over"));
      tile.addEventListener("drop", e=>{ e.preventDefault(); tile.classList.remove("drag-over"); });
    });
  }
  NS.enable = function(selector){ const container=document.querySelector(selector); if(!container) return; applySavedOrder(container); enableDrag(container); if(!readOrder().length) saveOrder(currentOrder(container)); };
})();
