
# AEMP Pack-Demo – Ein Packplatz, Hauptmenü & Bildverwaltung per Button (V.1.0.03)

**Login:** `ips-1` … `ips-5` • Passwort `bilder`

## Was ist neu
- **Nach Login** landest du **immer im Hauptmenü**.
- Hauptmenü mit **zwei Buttons**:
  - **Packplatz** → direkt zur Arbeitsplatz-Ansicht (Setliste/Details) wie früher.
  - **Steri-Freigabe** → **Platzhalter** (grau, deaktiviert) – bauen wir später.
- **Bilder-Upload**: keine Abfrage mehr bei fehlenden Bildern.
  - In **Set-Details**: Buttons **„Bild hochladen/ändern“** und **„Bild löschen“**.
  - In **Instrument-Zeilen**: je **„Bild ändern“** und **„Löschen“**.
  - Uploads werden **lokal (Browser, localStorage)** gespeichert.
- **Home-Button (🏠)** in der Kopfzeile – sichtbar nur außerhalb des Hauptmenüs – bringt zurück ins Hauptmenü.
- Packfunktionen bleiben: **Starten, Bearbeiten, Stornieren, Freigeben, Report**, Archivierung nach Freigabe.

## Dateien
- `index.html` – UI (Hauptmenü, Arbeitsplatz, Modals)
- `style.css` – Styles (mobilfreundlich, Drawer, disabled-Buttons)
- `app.js` – Logik (Login → Hauptmenü, Packen, Archiv, Bild hochladen & löschen)
- `README.md` – diese Anleitung

## GitHub Pages – Deploy
1. Alle Dateien ins Repo-Root hochladen/ersetzen.
2. **Settings → Pages**: Deploy from a branch → `main` / `/ (root)`.
3. Seite öffnen, Hard-Reload: **Strg/Cmd + Shift + R**.

## Bedienung
1. Anmelden (`ips-1`…`ips-5` / `bilder`) → Hauptmenü.
2. **Packplatz** → Arbeitsplatz-Ansicht. Links Set wählen.
3. Im Set-Detail: Bilder verwalten, **Packvorgang starten**, speichern.
4. **Freigeben**: Vorgang wandert ins Archiv, Set ist wieder frei.
5. **🏠** zurück ins Hauptmenü.

## Nächste Schritte (wenn du willst)
- „Steri‑Freigabe“-Seite mit Workflow & Berechtigungen.
- Zentrale Bildspeicherung (statt localStorage) via API.
- Barcode-Scan & PWA-Offlinebetrieb.

Viel Erfolg! Wenn irgendwo eine Kleinigkeit hakt, sag Bescheid – ich patch’ es fix.
