
# AEMP Pack-Demo – Upload-on-missing (GitHub Pages-ready)

**Login:** `ips-1` … `ips-5` / Passwort `bilder`

## Neu
- Nach dem Login werden **alle Sets/Instrumente ohne Bild** erkannt.
- Du wirst **gefragt, ob du ein Bild hochladen** möchtest (oder **überspringen**).
- Die Bilder werden **lokal im Browser (localStorage)** als Data-URL gespeichert. Kein Server nötig.

## Veröffentlichen
1. Alle Dateien ins **Repo-Root** hochladen: `index.html`, `style.css`, `app.js`, `README.md`.
2. **Settings → Pages:** Deploy from a branch → `main` / `/ (root)`.
3. Nach ~1 Minute ist die Seite online.

## Hinweise
- Hochgeladene Bilder bleiben **nur auf dem Gerät/Browser** gespeichert (localStorage). Andere Geräte sehen sie nicht.
- Später können wir einen Upload zu deinem Server/Backend einbauen (API), damit Bilder zentral gespeichert werden.
