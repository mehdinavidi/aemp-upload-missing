# AEMP Demo – V.1.1.25

Diese Version liefert die Packplatz-Funktionalität **als Module** (ohne eigene Seite):
- `modules/packplatz/list.js` – Set-Tabelle mit Barcode/Enter, sticky Spalten, Spaltenmenü, Persistenz
- `modules/packplatz/pack.js` – Packdialog (Soll/Ist, ✔ ❗ ✖, Gründe, Persistenz)
- `modules/packplatz/details.js` – rechte Detailansicht (Bild/Meta/Instrumente)

**Integration**: Binde die Module in eine beliebige Seite ein und verdrahte die Provider-Funktionen (`getSets`, `loadDetails`, `getItemsForSet`) mit eurer API.
