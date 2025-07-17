# Vereinfachte Upload-Liste für GitHub

## Batch 1: Absolut kritische Dateien (7 Dateien)
Laden Sie diese Dateien zuerst hoch:

1. `package.json` ⭐ (WICHTIGSTE DATEI)
2. `package-lock.json` ⭐
3. `vite.config.ts`
4. `tsconfig.json`
5. `tailwind.config.ts`
6. `components.json`
7. `postcss.config.js`

**Commit Message**: "Add core configuration"

## Batch 2: Source Code Ordner (3 Ordner)
Laden Sie diese kompletten Ordner hoch:

1. `server/` (kompletter Ordner)
2. `client/` (kompletter Ordner)  
3. `shared/` (kompletter Ordner)

**Commit Message**: "Add application source code"

## FERTIG! Test jetzt möglich
Nach diesen 2 Batches (10 Items total):
- Render → "Manual Deploy"
- Build sollte erfolgreich sein
- App sollte laufen

## Optional: Batch 3 (Dokumentation)
Falls gewünscht, später:
- `README.md`
- `DEPLOYMENT.md`
- Andere .md Dateien

## Wichtige Hinweise:
- .gitignore ist optional für Render (nicht kritisch)
- Die ersten 2 Batches reichen für funktionierendes Deployment
- Ordner als Ganzes ziehen (umgeht 100-Dateien-Limit)
- package.json ist der Schlüssel zum Erfolg