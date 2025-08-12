# AEMP – Serverseitige Bildspeicherung über GitHub (Vercel)

Dieses Update speichert Bilder zentral in **einem GitHub-Repo**.
Der Browser lädt/löscht Bilder über zwei **Serverless-Endpoints** (Vercel).

## Setup (einmalig)

1. **GitHub-Repo** für Uploads anlegen (z. B. `aemp-uploads`).
2. **PAT** (Personal Access Token) mit `repo`-Scope erstellen.
3. **Vercel**: Ordner `server/` als neues Projekt importieren & deployen.
4. In Vercel Umgebungsvariablen setzen (Settings → Environment Variables):
   - `GITHUB_TOKEN` – dein PAT
   - `GITHUB_OWNER` – dein GitHub-Name/Organisation
   - `GITHUB_REPO` – das Upload-Repo
   - `GITHUB_BRANCH` – `main` (oder anderer Branch)
5. Nach dem Deploy die **Basis-URL** merken, z. B. `https://aemp-upload-proxy.vercel.app/api`.

## Frontend konfigurieren

In `index.html` die Zeile setzen:
```html
<script>window.UPLOAD_ENDPOINT="https://DEINE-VERCEL-URL.vercel.app/api";</script>
```
`js/github.js` ist bereits eingebunden und kümmert sich um:
- `GithubUpload.upload(kind, id, file)`
- `GithubUpload.remove(path, sha)`

Der bestehende Upload-Handler nutzt automatisch den Server, wenn `UPLOAD_ENDPOINT` gesetzt ist – sonst **Fallback** auf lokale Speicherung.

## Vorteile
- Zentrale Bildablage → **alle Geräte** sehen dieselben Bilder.
- Kein Token im Browser (Sicherheit).
- Einfache `<img src>`-URLs (`raw.githubusercontent.com/...`).

## Hinweis
- Für Produktion kannst du im Server eine **Whitelist** für `kind` (`set|inst`) erzwingen oder eine einfache Auth ergänzen (optional).


## Mehrere Bilder pro Set/Instrument (V.1.0.21)
- Frontend speichert pro Set/Instrument jetzt **eine Galerie (Array)**.
- Upload-Dialog erlaubt **Mehrfachauswahl**.
- Galerie je Set/Instrument mit **Miniaturbildern**, **Löschen** (einzeln) und **Lightbox**.
- **Serverpfad** trennt automatisch: `images/{kind}/{id}/...` (legt Ordner je Set/Instrument an).
