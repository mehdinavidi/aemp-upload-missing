
function showMainMenu(){
  menuView.classList.remove("hidden");
  document.querySelector("main.grid").classList.add("hidden");
  document.getElementById("steriView").classList.add("hidden");
  appTitle.textContent = "AEMP • Hauptmenü";
  homeBtn.classList.add("hidden");
}
function showWorkspace(){
  menuView.classList.add("hidden");
  document.querySelector("main.grid").classList.remove("hidden");
  document.getElementById("steriView").classList.add("hidden");
  appTitle.textContent = "AEMP Pack-Demo";
  homeBtn.classList.remove("hidden");
  if (!selectedSetId && DATA.sets.length) selectedSetId = DATA.sets[0].id;
  renderSetList(searchEl.value || ""); renderDetails();
}
function showSteriView(){
  menuView.classList.add("hidden");
  document.querySelector("main.grid").classList.add("hidden");
  document.getElementById("steriView").classList.remove("hidden");
  appTitle.textContent = "AEMP • Steri-Freigabe";
  homeBtn.classList.remove("hidden");
}

function requireLogin(){
  const u = getUser();
  if (!u){
    loginOverlay.classList.add("show");
    userBox.classList.add("hidden");
    showMainMenu();
  } else {
    loginOverlay.classList.remove("show");
    loginOverlay.classList.add("hidden");
    userBox.classList.remove("hidden");
    userNameEl.textContent = u.username;
    showMainMenu();
  }
}

loginForm.addEventListener("submit", (e)=>{
  e.preventDefault();
  const username = (loginUser.value||"").trim().toLowerCase();
  const pass = loginPass.value||"";
  if (!USERS.has(username) || pass!==PASS){ alert("Ungültige Zugangsdaten. Demo: ips-1…ips-5 / bilder"); return; }
  setUser({ username }); requireLogin();
});
logoutBtn.addEventListener("click", (e)=>{ e.preventDefault(); logoutUser(); selectedSetId=null; requireLogin(); });
homeBtn.addEventListener("click", showMainMenu);
btnPackplatz.addEventListener("click", showWorkspace);
btnSteri.addEventListener("click", () => { showSteriView(); if (typeof window.wireSteri === 'function') window.wireSteri(); });
