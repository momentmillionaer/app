# GitHub Upload Checklist - Schritt für Schritt

## Batch 1: Kern-Dependencies (8 Dateien) ⚠️ KRITISCH
□ package.json
□ package-lock.json  
□ vite.config.ts
□ tsconfig.json
□ tailwind.config.ts
□ components.json
□ postcss.config.js
□ .gitignore

**Commit Message:** "Add core configuration files"

## Batch 2: Server Code (1 Ordner)
□ server/ (kompletter Ordner mit allen Unterordnern)

**Commit Message:** "Add server code and API"

## Batch 3: Client Code (1 Ordner)
□ client/ (kompletter Ordner mit allen Unterordnern)

**Commit Message:** "Add client application"

## Batch 4: Shared Code (1 Ordner)
□ shared/ (kompletter Ordner)

**Commit Message:** "Add shared types and schemas"

## TEST PUNKT: Nach Batch 1-4 
✅ **Render Test**: Manual Deploy starten
✅ **Build Test**: Sollte erfolgreich sein

## Batch 5: Deployment Config (falls unter 100 Dateien)
□ README.md
□ DEPLOYMENT.md
□ render.yaml
□ Dockerfile
□ .dockerignore
□ .env.example
□ vercel.json

**Commit Message:** "Add deployment configuration"

## Batch 6: Dokumentation (Rest)
□ Alle anderen .md Dateien
□ attached_assets/ (falls gewünscht)
□ .github/ (falls vorhanden)

**Commit Message:** "Add documentation and assets"

## Erfolgskontrolle:

Nach jedem Batch prüfen:
1. ✅ Dateien im GitHub Repository sichtbar
2. ✅ Ordnerstrukturen korrekt
3. ✅ Keine Fehler beim Upload

Nach Batch 1-4:
1. ✅ Render Manual Deploy funktioniert
2. ✅ Build erfolgreich
3. ✅ App läuft

## Wichtige Notizen:
- Ordner werden als Ganzes hochgeladen (1 Ordner = 1 "Datei")
- package.json ist kritisch für Render Build
- client/ und server/ Ordner enthalten den kompletten App-Code
- Nach Batch 4 sollte die App bereits funktionieren