function openReport(setId){
  const s = getSetById(setId); const sess = loadSessions()[setId];
  if (!sess){ alert("Kein Packvorgang vorhanden."); return; }
  reportTitle.textContent = `Packreport – ${s.code} – ${s.name}`;
  const rows = sess.lines.map(l=>`<tr><td>${l.instrument_name}</td><td>${l.qty_required}</td><td>${l.qty_found}</td><td>${(l.qty_found<l.qty_required||l.missing) ? "Ja" : "Nein"}</td><td>${l.reason || ""}</td><td>${l.note || ""}</td></tr>`).join("");
  reportBody.innerHTML = `<div class="muted">Abgeschlossen: ${new Date(sess.closed_at).toLocaleString()}</div><div class="muted">Benutzer: ${sess.closed_by || sess.started_by || "-"}</div><table><thead><tr><th>Instrument</th><th>Soll</th><th>Ist</th><th>Fehlteil</th><th>Grund</th><th>Notiz</th></tr></thead><tbody>${rows}</tbody></table>`;
  reportBackdrop.classList.remove("hidden"); reportBackdrop.classList.add("show");
}


reportClose.addEventListener("click", () => { reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden"); });
reportBackdrop.addEventListener("click", (e) => { if (e.target === reportBackdrop) { reportBackdrop.classList.remove("show"); reportBackdrop.classList.add("hidden"); } });
reportPrint.addEventListener("click", () => { setTimeout(()=>window.print(), 50); });

