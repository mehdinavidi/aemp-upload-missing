
/* Core Utils */
(function(global){
  const Core = {};
  Core.el = (html)=>{ const d=document.createElement('div'); d.innerHTML=html.trim(); return d.firstChild; }
  Core.byId = (id)=> document.getElementById(id);
  Core.q = (sel,root=document)=> root.querySelector(sel);
  Core.qq = (sel,root=document)=> Array.from(root.querySelectorAll(sel));
  global.AEMP_CORE = Core;
})(window);
