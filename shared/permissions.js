
/* Simple Rollenrechte */
(function(global){
  const PERMS = {
    canAccessModule(username, role, mod){
      if(role==='Admin') return true;
      const allowed = {
        IPS: ['sterilgut','maschinen-steri','op-ausgabe','steri'],
        QA: ['sterilgut','maschinen-steri','statistiken','steri'],
        Leitung: ['stammdaten','instr','anfrage','sterilgut','maschinen-steri','op-ausgabe','qm','planungsmonitor','steri']
      };
      const list = allowed[role] || [];
      return list.includes(mod);
    }
  };
  global.AEMP_PERMS = PERMS;
})(window);
