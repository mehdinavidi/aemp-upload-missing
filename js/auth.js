// js/auth.js – robuste Aufrufe, keine Referenzfehler
(function () {
  const btnHome     = document.getElementById('btnHome');
  const btnPack     = document.getElementById('btnPack');      // falls vorhanden
  const btnSteri    = document.getElementById('btnSteri');     // falls vorhanden
  const mainView    = document.getElementById('workspace');    // rechter Bereich
  const listView    = document.getElementById('list');          // linke Liste
  const searchEl    = document.getElementById('search');        // Suchfeld

  // Sichtbares Arbeiten (Workplace) aktivieren
  function showWorkspace() {
    if (mainView) mainView.classList.remove('hidden');
    if (typeof window.renderSetList === 'function') window.renderSetList(searchEl?.value || '');
    if (typeof window.renderDetails === 'function') window.renderDetails();
  }
  window.showWorkspace = showWorkspace;

  // Home-Button geht ins Hauptmenü (falls vorhanden), sonst bleibt im Workspace
  btnHome?.addEventListener('click', () => {
    if (typeof window.showMainMenu === 'function') {
      window.showMainMenu();
    } else {
      showWorkspace();
    }
  });

  // Packplatz öffnen
  btnPack?.addEventListener('click', () => {
    showWorkspace();
  });

  // Steri öffnen
  btnSteri?.addEventListener('click', () => {
    if (typeof window.showSteriView === 'function') window.showSteriView();
    if (typeof window.wireSteri === 'function') window.wireSteri();
  });

  // Beim Start: gleich Workspace anzeigen
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', showWorkspace);
  } else {
    showWorkspace();
  }
})();
