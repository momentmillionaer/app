# GitHub Upload Strategie (100 Dateien Limit)

## Problem: GitHub erlaubt nur 100 Dateien gleichzeitig

## Lösung: Schrittweiser Upload in der richtigen Reihenfolge

### Upload Reihenfolge (kritisch → weniger kritisch):

**Upload 1 - Kern-Dateien (KRITISCH):**
- package.json
- package-lock.json
- vite.config.ts
- tsconfig.json
- tailwind.config.ts
- components.json
- postcss.config.js
- .gitignore

**Upload 2 - Server-Ordner komplett:**
- server/ (gesamter Ordner mit allen Unterordnern)

**Upload 3 - Client-Hauptdateien:**
- client/index.html
- client/src/ (gesamter Ordner - falls unter 100 Dateien)

**Upload 4 - Shared-Ordner:**
- shared/ (gesamter Ordner)

**Upload 5 - Konfiguration & Dokumentation:**
- README.md
- DEPLOYMENT.md
- render.yaml
- Dockerfile
- .env.example
- Alle anderen .md Dateien

**Upload 6 - Optionale Dateien:**
- attached_assets/ (falls benötigt)
- .github/ (falls vorhanden)

## Wichtige Tipps:

1. **Ordner-Upload**: GitHub kann ganze Ordner auf einmal hochladen
2. **Drag & Drop**: Ziehen Sie komplette Ordner ins GitHub-Fenster
3. **Batch-Commits**: Jeder Upload ist ein separater Commit
4. **Reihenfolge beachten**: package.json ZUERST, dann Code-Ordner

## Nach jedem Upload:
- Commit message eingeben
- "Commit new files" klicken
- Warten bis Upload abgeschlossen
- Nächsten Batch hochladen

## Test nach Upload 1-3:
Nach den ersten 3 Uploads können Sie bereits testen:
- Render "Manual Deploy" starten
- Build sollte bereits funktionieren