function requireLogin(){
  const u = getUser();
  if (!u){
    console.log("no user -> show login");
    loginOverlay.classList.remove("hidden");
    loginOverlay.classList.add("show");
    userBox.classList.add("hidden");
    homeBtn.classList.add("hidden");
    menuView.classList.add("hidden");
    document.getElementById("details").classList.add("hidden");
    setListEl.classList.add("hidden");
    searchEl.classList.add("hidden");
  } else {
    console.log("user present:", u.username);
    loginOverlay.classList.remove("show");
    loginOverlay.classList.add("hidden");
    userBox.classList.remove("hidden"); userBox.style.display='flex';
    userNameEl.textContent = u.username;
    showMainMenu();
    renderSetList(searchEl.value || "");
    renderDetails();
  }
}


loginForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = (loginUser.value || "").trim().toLowerCase();
  const pass = loginPass.value || "";
  if (!USERS.has(username) || pass !== PASS) {
    alert("Ungültige Zugangsdaten. Demo: ips-1 … ips-5 / bilder");
    return;
  }
  setUser({ username });
  requireLogin();
});

logoutBtn.addEventListener("click", (e)=>{ e.preventDefault(); console.log("logout clicked"); logoutUser(); selectedSetId = null; requireLogin(); loginOverlay.classList.remove("hidden"); loginOverlay.classList.add("show"); });
homeBtn.addEventListener("click", showMainMenu);
