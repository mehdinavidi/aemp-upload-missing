// js/image_store.js – Mehrfachbilder lokal speichern (per-entity "Ordner")

(function(){
  const KEY = 'aemp_images_v1'; // { sets: { [setId]: [imgObj...] }, instruments:{...} }
  const THUMB_MAX = 220;
  const FULL_MAX = 1400;

  function loadStore(){
    try { return JSON.parse(localStorage.getItem(KEY) || '{"sets":{},"instruments":{}}'); }
    catch(e){ return {sets:{}, instruments:{}}; }
  }
  function saveStore(s){
    try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch(e){ return false; }
  }

  async function toDataUrl(file, max){
    const img = new Image();
    const url = await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); });
    return await new Promise(resolve=>{
      img.onload = ()=>{
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        let w = img.width, h = img.height;
        if (w>h && w>max){ h = Math.round(h*max/w); w=max; }
        else if (h>max){ w = Math.round(w*max/h); h=max; }
        canvas.width=w; canvas.height=h;
        ctx.drawImage(img,0,0,w,h);
        resolve(canvas.toDataURL('image/jpeg',0.85));
      };
      img.src = url;
    });
  }

  async function addImages(entity, id, files){
    const store = loadStore();
    if (!store[entity]) store[entity] = {};
    if (!store[entity][id]) store[entity][id] = [];
    for (const f of files){
      const full = await toDataUrl(f, FULL_MAX);
      const thumb = await toDataUrl(f, THUMB_MAX);
      store[entity][id].push({ name:f.name, mime:f.type, ts:Date.now(), full, thumb });
    }
    saveStore(store);
    return store[entity][id];
  }

  function listImages(entity, id){
    const s = loadStore();
    return (s[entity] && s[entity][id]) ? s[entity][id] : [];
  }

  function deleteImage(entity, id, index){
    const s = loadStore();
    if (s[entity] && s[entity][id]){
      s[entity][id].splice(index,1);
      saveStore(s);
    }
  }

  window.AEMP_IMAGES = {
    addImages, listImages, deleteImage
  };
})();
