const searchEl = document.getElementById('search');

searchEl.addEventListener("input", ()=> renderSetList(searchEl ? searchEl.value : ""));
resetBtn.addEventListener("click", ()=>{
  if (confirm("Lokale Packdaten & Login zurücksetzen? (Bilder bleiben erhalten)")){ resetSessions(); selectedSetId=null; requireLogin(); }
});

// basic ESC to close overlays (if login not visible)
document.addEventListener("keydown",(e)=>{
  if(e.key==="Escape" && !loginOverlay.classList.contains("show")){
    modalBackdrop.classList.remove("show");
    reportBackdrop.classList.remove("show");
    uploadBackdrop.classList.remove("show");
    lightboxBackdrop.classList.remove("show");
  }
});

requireLogin();

const uploadHint = document.getElementById('uploadHint'); if (uploadHint) uploadHint.style.display = (window.UPLOAD_ENDPOINT?'none':'inline');
