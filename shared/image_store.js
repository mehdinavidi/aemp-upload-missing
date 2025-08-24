(function(){
  const KEY = 'aemp_images_v1';
  const THUMB_MAX = 220;
  const FULL_MAX = 1400;
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '{"sets":{},"instruments":{}}'); } catch(e){ return {sets:{}, instruments:{}}; } }
  function save(s){ try { localStorage.setItem(KEY, JSON.stringify(s)); return true; } catch(e){ return false; } }
  async function fileToDataURL(file){ return await new Promise(res=>{ const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); }); }
  async function resize(dataUrl, max){
    const img = new Image(); img.src = dataUrl;
    await new Promise(r=>{ img.onload=r; });
    let {width:w, height:h} = img; if (w>h && w>max){ h=Math.round(h*max/w); w=max;} else if (h>max){ w=Math.round(w*max/h); h=max; }
    const c=document.createElement('canvas'); c.width=w; c.height=h;
    c.getContext('2d').drawImage(img,0,0,w,h);
    return c.toDataURL('image/jpeg',0.85);
  }
  async function addImages(entity,id,files){
    const s=load(); if(!s[entity]) s[entity]={}; if(!s[entity][id]) s[entity][id]=[];
    for(const f of files){ const data=await fileToDataURL(f); const full=await resize(data, FULL_MAX); const thumb=await resize(data, THUMB_MAX); s[entity][id].push({name:f.name,mime:f.type,ts:Date.now(),full,thumb}); }
    save(s); return s[entity][id];
  }
  function listImages(entity,id){ const s=load(); return (s[entity]&&s[entity][id])?s[entity][id]:[]; }
  function deleteImage(entity,id,idx){ const s=load(); if(s[entity]&&s[entity][id]){ s[entity][id].splice(idx,1); save(s);} }
  window.AEMP_IMAGES = { addImages, listImages, deleteImage };
})();
