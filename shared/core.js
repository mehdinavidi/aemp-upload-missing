

(function(){
  const PASS='bilder';
  const DEMO_USERS = new Set(['ips-1','ips-2','ips-3','ips-4','ips-5']);

  function getUser(){ try { return JSON.parse(localStorage.getItem('aemp_user')||'null'); } catch(e){ return null; } }
  function setUser(u){ try{ localStorage.setItem('aemp_user', JSON.stringify(u)); }catch(e){} }
  function logout(){ setUser(null); window.location.href = 'index.html'; }

  async function requireLogin(){
    const u = getUser();
    if (u) return;
    const username = prompt('Benutzer (z. B. ips-1)','ips-1');
    const pass = prompt('Passwort','bilder');
    if (!username || !pass){ alert('Login abgebrochen'); location.reload(); return; }
    let ok = false;
    if (window.AEMP_USERS && AEMP_USERS.validate){
      try{ ok = await AEMP_USERS.validate(username, pass); }catch(e){ ok=false; }
    } else {
      ok = DEMO_USERS.has(username) && pass===PASS;
    }
    if (!ok){ alert('Ungültige Zugangsdaten'); location.reload(); return; }
    setUser({username});
    location.reload();
  }

  window.AEMP = window.AEMP || {};
  window.AEMP.session = { getUser, setUser, logout, requireLogin };
})();
