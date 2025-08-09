
// steri.js – gepackte Etiketten listen, an-/abhaken und freigeben
(function () {
  // öffentlich machen, damit auth.js sie aufrufen kann
  window.wireSteri = function wireSteri() {
    const scanInput = document.getElementById("scanInput");
    const tbody = document.getElementById("packedTbody");
    const selAll = document.getElementById("selAll");
    const btnRefresh = document.getElementById("refreshPacked");
    const btnClear = document.getElementById("clearSelection");
    const btnRelease = document.getElementById("releaseSelected");

    function getPackedSessions() {
      const sessions = loadSessions();
      const rows = [];
      for (const [setIdStr, sess] of Object.entries(sessions)) {
        if (!sess) continue;
        if (sess.closed_at && !sess.released_at && sess.label) {
          const setId = parseInt(setIdStr, 10);
          const s = getSetById(setId);
          rows.push({
            setId,
            label: sess.label,
            code: s?.code ?? "-",
            name: s?.name ?? "-",
            closed_at: sess.closed_at,
          });
        }
      }
      rows.sort((a, b) => (a.closed_at < b.closed_at ? 1 : -1));
      return rows;
    }

    function renderPacked() {
      const rows = getPackedSessions();
      tbody.innerHTML = rows.map((r) => `
        <tr data-set-id="${r.setId}" data-label="${r.label}">
          <td style="text-align:center"><input type="checkbox" class="rowChk"></td>
          <td>${r.label}</td>
          <td>${r.code} – ${r.name}</td>
          <td><span class="badge warn">bereit</span></td>
        </tr>`).join("");
      selAll.checked = false;
    }

    // Initial laden
    renderPacked();

    // Alle auswählen
    selAll.onchange = () => {
      tbody.querySelectorAll(".rowChk").forEach((cb) => (cb.checked = selAll.checked));
    };

    // Auswahl löschen
    btnClear.onclick = () => {
      tbody.querySelectorAll(".rowChk").forEach((cb) => (cb.checked = false));
      selAll.checked = false;
    };

    // Aktualisieren
    btnRefresh.onclick = () => renderPacked();

    // Scanner/Enter: Tokens splitten und checkbox toggeln
    scanInput.onkeydown = (e) => {
      if (e.key !== "Enter") return;
      e.preventDefault();
      const raw = (scanInput.value || "").trim();
      if (!raw) return;
      const tokens = raw.split(/[\s,;]+/).filter(Boolean);

      tokens.forEach((label) => {
        const tr = tbody.querySelector(`tr[data-label="${CSS.escape(label)}"]`);
        if (tr) {
          const cb = tr.querySelector(".rowChk");
          cb.checked = !cb.checked; // toggle
        } else {
          console.warn("Etikett nicht (gepackt) gefunden:", label);
        }
      });
      const all = tbody.querySelectorAll(".rowChk");
      const yes = tbody.querySelectorAll(".rowChk:checked");
      selAll.checked = all.length && all.length === yes.length;
      scanInput.value = "";
    };

    // Freigeben markierter Zeilen
    btnRelease.onclick = () => {
      const rows = Array.from(tbody.querySelectorAll("tr"));
      const marked = rows.filter((tr) => tr.querySelector(".rowChk")?.checked);
      if (!marked.length) {
        alert("Bitte mindestens ein Etikett auswählen (anhaken oder scannen).");
        return;
      }
      const sessions = loadSessions();
      let count = 0;
      const user = getUser();

      marked.forEach((tr) => {
        const setId = parseInt(tr.getAttribute("data-set-id") || "0", 10);
        const sess = sessions[setId];
        if (!setId || !sess) return;
        sess.released_at = new Date().toISOString();
        sess.steri_by = user?.username || "steri";
        count++;
      });

      saveSessions(sessions);
      alert(count + " Set(s) freigegeben.");
      renderPacked();
      renderSetList(searchEl.value);
      renderDetails();
    };
  };
})();
