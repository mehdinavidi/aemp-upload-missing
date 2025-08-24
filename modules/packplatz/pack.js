window.Packplatz = window.Packplatz || {};
(function(ns){
  function yyyymmddHHMM(d=new Date()){
    const p=n=>String(n).padStart(2,'0');
    return d.getFullYear()+p(d.getMonth()+1)+p(d.getDate())+'-'+p(d.getHours())+p(d.getMinutes());
  }
  ns.startPack = function(){
    const d = AEMP.state.getData();
    const set = d.sets.find(s=>s.id===window.selectedSetId);
    if (!set){ alert('Kein Set gewählt'); return; }
    const rand = Math.random().toString(36).slice(2,6).toUpperCase();
    const label = `ETK-${set.code}-${yyyymmddHHMM()}-${rand}`;
    AEMP.state.addSession({ label, setId:set.id, status:'gepackt' });
    alert('Gepackt. Etikett: '+label+'\n(unter Steri-Freigabe sichtbar)');
  };
})(window.Packplatz);
