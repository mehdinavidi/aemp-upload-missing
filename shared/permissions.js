// shared/permissions.js (V1.1.11)
// Per-User Modul- und Funktions-Berechtigungen
(function(){
  const KEY = 'aemp_user_perms_v1';

  // bekannte Module (Tiles) und Funktionen
  const MODULES = [
    'stammdaten','instr-management','qm','statistiken','planungsmonitor','planungsmonitor-op',
    'op-modul','buchungsmodule','packplatz','fallwagen-menue','dokumentenlenkung',
    'maschinen-alle','maschinen-rdg','maschinen-rdg-e','maschinen-steri','maschinen-trockner','maschinen-siegelgeraete','steri'
  ];
  const FUNCTIONS = {
    'packplatz': ['packformular','stornieren','packen'],
    'steri': ['freigeben','scan']
  };

  function _load(){
    try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ return {}; }
  }
  function _save(map){ try{ localStorage.setItem(KEY, JSON.stringify(map)); }catch(e){} }

  function get(username){
    const map=_load(); return map[username] || null;
  }
  function set(username, config){
    const map=_load(); map[username]=config||{}; _save(map); return map[username];
  }
  function ensureDefaults(username, role){
    // Admin: alles erlaubt
    if((role||'').toLowerCase().includes('admin')){
      const all = { modules:{}, functions:{} };
      MODULES.forEach(m=> all.modules[m]=true);
      Object.keys(FUNCTIONS).forEach(m=>{
        all.functions[m] = {}; FUNCTIONS[m].forEach(f=> all.functions[m][f]=true);
      });
      return set(username, all);
    }
    // Benutzer: minimale Defaults
    const def = { modules:{}, functions:{} };
    ['packplatz','steri'].forEach(m=> def.modules[m]=true);
    def.functions['packplatz'] = { packformular:false, stornieren:false, packen:true };
    def.functions['steri'] = { freigeben:false, scan:true };
    return set(username, def);
  }

  function canAccessModule(username, role, module){
    const p = get(username) || ensureDefaults(username, role);
    return !!(p.modules && p.modules[module]);
  }
  function can(username, role, module, fn){
    const p = get(username) || ensureDefaults(username, role);
    if((role||'').toLowerCase().includes('admin')) return true;
    return !!(p.functions && p.functions[module] && p.functions[module][fn]);
  }

  window.AEMP_PERMS = { MODULES, FUNCTIONS, get, set, ensureDefaults, canAccessModule, can };
})();
