
# AEMP Pack-Demo – V.1.2.00 (modular + GitHub Upload)

## Features
- Login (ips-1…ips-5 / bilder) → Hauptmenü → Packplatz
- Setliste links, Details rechts, Bilder je Set/Instrument hochladen/löschen
- Packvorgang mit **Soll/Ist**, Status pro Zeile (✔ / ❗ / ✖) + Live-Zähler
- Report-Modal mit Druckansicht
- Mobile-optimiert (Drawer)
- **Modulare JS-Struktur** (/js)
- **Serverseitiger Upload nach GitHub** via `/server` (Vercel)

## Lokaler Test
1. Öffne `index.html` im Browser (doppelklick).
2. Login: `ips-1` / `bilder`.
3. Im Packplatz: Bilder hochladen (bleiben lokal, oder auf GitHub wenn `UPLOAD_ENDPOINT` gesetzt ist).

## GitHub-Upload aktivieren
1. `/server` bei **Vercel** deployen (siehe `server/ENV_EXAMPLE.txt` Variablen).
2. Oben in `index.html` `window.UPLOAD_ENDPOINT` setzen, z. B.:
   ```html
   <script>window.UPLOAD_ENDPOINT="https://aemp-upload-proxy.vercel.app/api";</script>
   ```
3. Danach werden Bilder beim Upload **ins GitHub-Repo** gespeichert, URL kommt zurück und wird als Bildquelle verwendet.

## Struktur
- `index.html`, `style.css`, `favicon.svg`
- `js/`
  - `core.js` – Daten, Storage, DOM-Referenzen
  - `auth.js` – Login/Hauptmenü/Navigation
  - `list.js` – Setliste
  - `details.js` – Detailseite + Bildverwaltung
  - `pack.js` – Packdialog + Speichern
  - `report.js` – Report & Drucken
  - `init.js` – Event-Wiring & Bootstrap
  - `github.js` – Client-Helper für Upload/Remove
- `server/` – Vercel-Functions für Upload & Delete

Viel Spaß! Änderungen gern durchgeben – ich passe schnell an.
