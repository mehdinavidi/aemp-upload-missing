(function(){
  const KEY='aemp_users_v1';
  const defaults=[
    {id:1, username:'ips-1', short:'IPS1', name:'ips-1', role:'Administrator', active:true},
    {id:2, username:'ips-2', short:'IPS2', name:'ips-2', role:'Anforderung', active:true},
    {id:3, username:'ips-3', short:'IPS3', name:'ips-3', role:'Ausgabe', active:true},
    {id:4, username:'ips-4', short:'IPS4', name:'ips-4', role:'OP', active:true},
    {id:5, username:'ips-5', short:'IPS5', name:'ips-5', role:'Packplatz', active:true}
  ];
  function load(){ try{ return JSON.parse(localStorage.getItem(KEY)||'null') || defaults.slice(); } catch(e){ return defaults.slice(); } }
  function save(list){ try{ localStorage.setItem(KEY, JSON.stringify(list)); }catch(e){} }
  function nextId(list){ return list.reduce((m,x)=>Math.max(m,x.id||0),0)+1; }
  function list(){ return load(); }
  function create(user){ const list=load(); user.id=nextId(list); list.push(user); save(list); return user; }
  function update(id,patch){ const list=load(); const i=list.findIndex(x=>x.id==id); if(i>=0){ list[i]=Object.assign({}, list[i], patch); save(list); return list[i]; } return null; }
  function remove(id){ const list=load().filter(x=>x.id!=id); save(list); }
  function toggle(id){ const list=load(); const u=list.find(x=>x.id==id); if(u){ u.active=!u.active; save(list);} }
  window.AEMP_USERS = { list, create, update, remove, toggle };
})();

(function(){
  async function sha256(input){
    if (window.crypto && window.crypto.subtle){
      const enc = new TextEncoder().encode(input);
      const buf = await crypto.subtle.digest('SHA-256', enc);
      const arr = Array.from(new Uint8Array(buf));
      return arr.map(b => b.toString(16).padStart(2,'0')).join('');
    } else {
      let h = 5381; for (let i=0;i<input.length;i++){ h = ((h<<5)+h) ^ input.charCodeAt(i); }
      return String(h>>>0);
    }
  }
  async function validate(username, password){
    try{
      const list = AEMP_USERS.list();
      const u = list.find(x=>String(x.username).toLowerCase()===String(username).toLowerCase());
      if(!u){ return ['ips-1','ips-2','ips-3','ips-4','ips-5'].includes(username) && password==='bilder'; }
      if(u.password_hash){
        const hash = await sha256(password);
        return hash === u.password_hash;
      } else {
        return password==='bilder';
      }
    }catch(e){ return false; }
  }
  async function setPassword(username, newPlain){
    const list = AEMP_USERS.list();
    const i = list.findIndex(x=>String(x.username).toLowerCase()===String(username).toLowerCase());
    if(i<0) return false;
    list[i].password_hash = await sha256(newPlain);
    try{ localStorage.setItem('aemp_users_v1', JSON.stringify(list)); }catch(e){}
    return true;
  }
  if (!window.AEMP_USERS) window.AEMP_USERS = {};
  window.AEMP_USERS.validate = validate;
  window.AEMP_USERS.setPassword = setPassword;
  window.AEMP_USERS._sha256 = sha256;
})();
