
# AEMP Pack-Demo (Hauptmenü + Freigabe + Mobile + Home-Button)

**Login:** `ips-1` … `ips-5` / Passwort `bilder`

## Neu in diesem Build
- **Home-Button (Haus-Icon)** in der Kopfzeile – sichtbar **nur außerhalb** des Hauptmenüs.
- Klick auf 🏠 führt direkt zurück ins **Hauptmenü**, ohne Logout.
- Bestehende Features bleiben: Packplätze, Arbeitsplatz, Archiv/Freigaben, Upload bei fehlenden Bildern, mobile Drawer/Modals.

## Dateien
- `index.html` – UI mit Home-Button
- `style.css` – Styles (responsive, mobilefreundlich)
- `app.js` – Logik inkl. Home-Button-Steuerung und View-Wechsel
- `README.md` – diese Anleitung

## Schnellstart (GitHub Pages)
1. Dateien ins Repo-Root hochladen/ersetzen.
2. Pages aktivieren: Settings → Pages → Deploy from a branch → `main`/`/(root)`.
3. Seite aufrufen und testen (Hard-Reload: Strg/Cmd+Shift+R).

## Nutzung
1. **Anmelden** (ips-1…ips-5 / bilder).
2. **Packplatz wählen** → **Zum Arbeitsplatz**.
3. Sets auswählen, **Packvorgang starten**, speichern, **Freigeben** (landet im Archiv), **Bearbeiten**/**Stornieren** vor Freigabe möglich.
4. **🏠 Home-Button** bringt dich jederzeit zurück zum **Hauptmenü** (im Hauptmenü selbst ausgeblendet).

## Bilder
- Wenn Bilder fehlen, kommt nach Login ein Upload-Dialog (lokale Speicherung via `localStorage`).

Viel Spaß! Sag Bescheid, wenn der Home-Button zusätzlich **nur für bestimmte Rollen** sichtbar sein soll – kann ich schnell ergänzen.
