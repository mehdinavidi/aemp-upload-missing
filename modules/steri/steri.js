
/* Steri Module */
(function(global){
  const Steri = {};
  Steri.start = function mount(container){
    if(!container) return;
    container.innerHTML = `<div class="card"><h2>Steri – Freigabe</h2><p>Demo-Inhalt. Hier würden Freigaben angezeigt.</p></div>`;
  };
  global.AEMP_STERI = Steri;
})(window);
