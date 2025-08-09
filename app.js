// app.js with home button logic

// ---- App State / Views + Home button ----
const homeBtn = document.getElementById("homeBtn");
function showMainMenu(){ showView(VIEW_MENU); }
if (homeBtn) homeBtn.addEventListener("click", showMainMenu);

