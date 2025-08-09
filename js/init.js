
searchEl.addEventListener("input", ()=> renderSetList(searchEl.value));
resetBtn.addEventListener("click", ()=>{
  if (confirm("Lokale Packdaten & Login zurücksetzen? (Bilder bleiben erhalten)")){ resetSessions(); selectedSetId=null; requireLogin(); }
});

// Mobile drawer
const drawer = setListEl;
const drawerBackdrop = document.getElementById("drawerBackdrop");
function openDrawer(){ drawer.classList.add("open"); drawerBackdrop.classList.add("show"); }
function closeDrawer(){ drawer.classList.remove("open"); drawerBackdrop.classList.remove("show"); }
drawerBackdrop.addEventListener("click", closeDrawer);

document.addEventListener("keydown",(e)=>{
  if (e.key==="Escape"){
    if (!loginOverlay.classList.contains("show")){
      modalBackdrop.classList.remove("show"); modalBackdrop.classList.add("hidden");
      reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden");
      uploadBackdrop.classList.remove("show"); uploadBackdrop.classList.add("hidden");
      lightboxBackdrop.classList.remove("show"); lightboxBackdrop.classList.add("hidden");
    }
  }
});

requireLogin();
