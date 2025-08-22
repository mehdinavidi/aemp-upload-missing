
/* globaler UI-State */
(function(global){
  const State = {
    get k(){ return 'aemp.ui.state.v1' },
    read(){ try{ return JSON.parse(localStorage.getItem(this.k)) || {} }catch{ return {} } },
    write(s){ localStorage.setItem(this.k, JSON.stringify(s)); }
  };
  global.AEMP_STATE = State;
})(window);
