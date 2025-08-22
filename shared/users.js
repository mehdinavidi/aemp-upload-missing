
/* User-Handling (Demo) */
(function(global){
  const KEY='aemp.users.v1';
  function all(){ try{ return JSON.parse(localStorage.getItem(KEY)) || [] }catch{ return [] } }
  function save(list){ localStorage.setItem(KEY, JSON.stringify(list)); }
  function currentUser(){ try{ return JSON.parse(localStorage.getItem('aemp.current.user.v1')) || {username:'ips-1', role:'IPS'} }catch{ return {username:'ips-1', role:'IPS'} } }
  function currentRole(){ const u=currentUser(); return u.role || 'IPS'; }
  global.AEMP_USERS = { all, save, currentUser, currentRole };
})(window);
