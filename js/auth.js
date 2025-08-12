// auth.js – robuste Navigation & Login

// Demo-User (ips-1 .. ips-5 / pass: 'bilder')
const PASS = 'bilder';
const USERS = new Set(['ips-1','ips-2','ips-3','ips-4','ips-5']);

// DOM refs
const appTitle     = document.getElementById('appTitle');
const homeBtn      = document.getElementById('homeBtn');
const userBox      = document.getElementById('userBox');
const userNameEl   = document.getElementById('userName');
const logoutBtn    = document.getElementById('logoutBtn');
const loginOverlay = document.getElementById('loginOverlay');
const loginForm    = document.getElementById('loginForm');
const loginUser    = document.getElementById('loginUser');
const loginPass    = document.getElementById('loginPass');
const btnPackplatz = document.getElementById('btnPackplatz');
const btnSteri     = document.getElementById('btnSteri');

function logoutUser(){ setUser(null); }

function showMainMenu(){
  const mainGrid = document.querySelector('main.grid');
  if (mainGrid) mainGrid.classList.add('hidden');
  const steri = document.getElementById('steriView');
  if (steri) steri.classList.add('hidden');
  if (appTitle) appTitle.textContent = 'AEMP • Hauptmenü';
  if (homeBtn) homeBtn.classList.add('hidden');
}

function showWorkspace(){
  const mainGrid = document.querySelector('main.grid');
  if (mainGrid) mainGrid.classList.remove('hidden');
  const steri = document.getElementById('steriView');
  if (steri) steri.classList.add('hidden');
  if (appTitle) appTitle.textContent = 'AEMP Pack-Demo';
  if (homeBtn) homeBtn.classList.remove('hidden');
  if (!window.selectedSetId && window.DATA?.sets?.length) window.selectedSetId = window.DATA.sets[0].id;
  if (typeof window.renderSetList === 'function') window.renderSetList((window.searchEl ? searchEl.value : '') || '');
  if (typeof window.renderDetails === 'function') window.renderDetails();
}

function showSteriView(){
  const mainGrid = document.querySelector('main.grid');
  if (mainGrid) mainGrid.classList.add('hidden');
  const steri = document.getElementById('steriView');
  if (steri) steri.classList.remove('hidden');
  if (appTitle) appTitle.textContent = 'AEMP • Steri-Freigabe';
  if (homeBtn) homeBtn.classList.remove('hidden');
}

function requireLogin(){
  const u = getUser();
  if (!u){
    if (loginOverlay){ loginOverlay.classList.add('show'); loginOverlay.classList.remove('hidden'); }
    if (userBox) userBox.classList.add('hidden');
    showMainMenu();
  } else {
    if (loginOverlay){ loginOverlay.classList.remove('show'); loginOverlay.classList.add('hidden'); }
    if (userBox) userBox.classList.remove('hidden');
    if (userNameEl) userNameEl.textContent = u.username;
    showMainMenu();
  }
}

// Wire
if (loginForm){
  loginForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const username = (loginUser?.value||'').trim().toLowerCase();
    const pass = loginPass?.value||'';
    if (!USERS.has(username) || pass!==PASS){
      alert('Ungültige Zugangsdaten. Demo: ips-1…ips-5 / bilder');
      return;
    }
    setUser({ username });
    requireLogin();
  });
}
logoutBtn && logoutBtn.addEventListener('click', (e)=>{ e.preventDefault(); logoutUser(); window.selectedSetId=null; requireLogin(); });
homeBtn && homeBtn.addEventListener('click', showMainMenu);
btnPackplatz && btnPackplatz.addEventListener('click', showWorkspace);
btnSteri && btnSteri.addEventListener('click', ()=>{ showSteriView(); if (typeof window.wireSteri==='function') window.wireSteri(); });

// Init
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', requireLogin);
} else {
  requireLogin();
}
