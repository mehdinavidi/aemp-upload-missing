
searchEl.addEventListener("input", () => renderSetList(searchEl.value));
resetBtn.addEventListener("click", () => {
  if (confirm("Lokale Packdaten & Login zurücksetzen? (Bilder bleiben erhalten)")) {
    resetSessions();
    selectedSetId = null;
    requireLogin();
  }
});


const drawer = document.getElementById("setList");
const drawerBackdrop = document.getElementById("drawerBackdrop");
const toggleSidebarBtn = document.getElementById("toggleSidebar");
function openDrawer() { drawer.classList.remove("hidden"); drawer.classList.add("open"); drawerBackdrop.classList.add("show"); }
function closeDrawer() { drawer.classList.remove("open"); drawerBackdrop.classList.remove("show"); }
if (toggleSidebarBtn) toggleSidebarBtn.addEventListener("click", openDrawer);
if (drawerBackdrop) drawerBackdrop.addEventListener("click", closeDrawer);
function maybeCloseDrawerForMobile() { if (window.matchMedia("(max-width: 900px)").matches) closeDrawer(); }
const _origRenderSetList = renderSetList;
renderSetList = function(filter="") {
  _origRenderSetList(filter);
  document.querySelectorAll("#setList .item").forEach(el => {
    el.addEventListener("click", () => { maybeCloseDrawerForMobile(); }, { once: true });
  });
};


document.addEventListener('keydown', (e)=>{
  if (e.key === 'Escape'){
    if (!loginOverlay.classList.contains('show')) {
      if (typeof closeModal === 'function') closeModal();
      reportBackdrop.classList.remove('show'); reportBackdrop.classList.add('hidden');
      uploadBackdrop.classList.remove('show'); uploadBackdrop.classList.add('hidden');
      lbBackdrop.classList.remove('show'); lbBackdrop.classList.add('hidden');
    }
  }
});

// boot
requireLogin();
