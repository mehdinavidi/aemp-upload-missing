// js/core.js – stable helpers

/* Storage */
function loadJSON(k, fallback){
  try { const raw = localStorage.getItem(k); return raw ? JSON.parse(raw) : (fallback===undefined?null:fallback); }
  catch(e){ return (fallback===undefined?null:fallback); }
}
function saveJSON(k, v){
  try { localStorage.setItem(k, JSON.stringify(v)); return true; }
  catch(e){
    console.warn('localStorage save failed for', k, e);
    if (typeof notify==='function') notify('Speichern im Browser fehlgeschlagen (Speicher voll). Bitte Server-Upload aktivieren.');
    return false;
  }
}

/* Notify */
function notify(msg){ try{ alert(msg); }catch(e){} }

/* Session user helpers */
function setUser(u){ saveJSON('aemp_user', u||null); }
function getUser(){ return loadJSON('aemp_user', null); }

/* Export to window (optional) */
window.loadJSON = loadJSON;
window.saveJSON = saveJSON;
window.setUser  = setUser;
window.getUser  = getUser;
