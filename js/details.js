// js/details.js – stabile Version, stellt window.renderDetails bereit
(function () {
  const detailsEl = document.getElementById('details');

  function getSetById(id) {
    return (window.DATA?.sets || []).find(s => s.id === id);
  }
  function getInstrumentById(id) {
    return (window.DATA?.instruments || []).find(i => i.id === id);
  }
  function getSetLines(setId) {
    const rel = (window.DATA?.setInstruments || []).filter(x => x.set_id === setId);
    return rel.map(x => ({
      qty_required: x.qty_required,
      instrument: getInstrumentById(x.instrument_id)
    }));
  }

  // FIXE Aktionsleiste unten rechts (erstellt sie einmal)
  function ensureFixedBar() {
    let fab = document.getElementById('fabActions');
    if (!fab) {
      fab = document.createElement('div');
      fab.id = 'fabActions';
      fab.className = 'fab-fixed';
      fab.innerHTML = `
        <button id="reportBtn" class="ghost">Packformular</button>
        <button id="cancelBtn" class="danger">Stornieren</button>
        <button id="startPack" class="primary">Packen</button>
      `;
      document.body.appendChild(fab);
    }
  }

  // ---- öffentliche Render-Funktion
  window.renderDetails = function renderDetails() {
    if (!detailsEl) return;

    const sid = window.selectedSetId;
    const set = getSetById(sid);

    // Kein Set gewählt
    if (!set) {
      detailsEl.innerHTML = `
        <div class="placeholder center" style="padding:32px">
          <h3>Wähle links ein Set aus</h3>
          <p class="subtle">Dann siehst du hier die Details und kannst packen.</p>
        </div>`;
      return;
    }

    const lines = getSetLines(set.id);

    const rows = lines.map(l => `
      <tr>
        <td>
          <div class="hstack" style="gap:10px;align-items:center">
            <img class="ithumb" src="${(l.instrument?.image_url)||''}" alt="">
            <div>
              <div>${l.instrument?.name || '-'}</div>
              <div class="subtle">${l.instrument?.code || ''}</div>
            </div>
          </div>
        </td>
        <td class="qty">${l.qty_required}</td>
        <td>${l.instrument?.category || '-'}</td>
        <td style="text-align:right">
          <button class="ghost" data-action="inst-upload" data-id="${l.instrument?.id || 0}">Bilder hinzufügen</button>
        </td>
      </tr>
    `).join('');

    detailsEl.innerHTML = `
      <div class="vstack" style="gap:10px">
        <h2>${set.code} – ${set.name}</h2>

        <table class="table">
          <thead>
            <tr>
              <th>Instrument</th>
              <th>Soll</th>
              <th>Kategorie</th>
              <th></th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    `;

    // Fixe Leiste unten rechts sicherstellen
    ensureFixedBar();

    // Events der festen Leiste neu binden
    const startBtn  = document.getElementById('startPack');
    const cancelBtn = document.getElementById('cancelBtn');
    const reportBtn = document.getElementById('reportBtn');

    // Schutz: Buttons können nur gebunden werden, wenn sie existieren
    if (startBtn)  startBtn.onclick  = () => (window.openPackModalV2 ? openPackModalV2(set, lines) : console.warn('openPackModalV2 fehlt'));
    if (cancelBtn) cancelBtn.onclick = () => (window.cancelCurrentPack ? cancelCurrentPack(set.id) : console.warn('cancelCurrentPack fehlt'));
    if (reportBtn) reportBtn.onclick = () => (window.openReport ? openReport(set.id) : console.warn('openReport fehlt'));
  };
})();
