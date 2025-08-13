(function(){
  window.AEMP = window.AEMP || {};
  const SESS_KEY = 'aemp_sessions';
  function getData(){ return window.DATA || {sets:[], instruments:[], setInstruments:[]}; }
  function getSessions(){ try { return JSON.parse(localStorage.getItem(SESS_KEY)||'[]'); } catch(e){ return []; } }
  function saveSessions(list){ try { localStorage.setItem(SESS_KEY, JSON.stringify(list)); } catch(e){} }
  function addSession(sess){ const list = getSessions(); list.push(sess); saveSessions(list); return sess; }
  function findByLabel(label){ return getSessions().find(s=>s.label===label); }
  window.AEMP.state = { getData, getSessions, saveSessions, addSession, findByLabel };
})();
