(function(){
  const PASS='bilder'; 
  const USERS = new Set(['ips-1','ips-2','ips-3','ips-4','ips-5']);
  function getUser(){ try { return JSON.parse(localStorage.getItem('aemp_user')||'null'); } catch(e){ return null; } }
  function setUser(u){ try{ localStorage.setItem('aemp_user', JSON.stringify(u)); }catch(e){} }
  function logout(){ setUser(null); window.location.href = 'index.html'; }
  function requireLogin(){
    const u = getUser();
    if (!u){
      const username = prompt('Benutzer (ips-1..ips-5):','ips-1');
      const pass = prompt('Passwort:','bilder');
      if (!username || !USERS.has(username) || pass!==PASS){
        alert('Ungültig. Demo: ips-1..5 / bilder'); location.reload(); return;
      }
      setUser({username});
    }
  }
  window.AEMP = window.AEMP || {};
  window.AEMP.session = { getUser, setUser, logout, requireLogin };
})();
