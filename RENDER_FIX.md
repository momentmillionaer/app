# Render Build Fix - Vite Fehler lösen

## Problem
```
sh: 1: vite: not found
==> Build failed 😞
```

## Ursache
- Render verwendet `npm ci` welches nur `dependencies` installiert
- Vite, TypeScript und andere Build-Tools sind in `devDependencies`
- Daher fehlen die Build-Tools für den Build-Prozess

## Sofortige Lösung

### In Render Dashboard:
1. **Settings** → **Build & Deploy**
2. **Build Command** ändern von:
   ```
   npm ci && npm run build
   ```
   zu:
   ```
   npm install && npm run build
   ```
3. **"Save Changes"** klicken
4. **"Manual Deploy"** starten

### Warum das funktioniert:
- `npm install` installiert sowohl `dependencies` als auch `devDependencies`
- `npm ci` installiert nur `dependencies` (Production-Modus)
- Build-Tools wie Vite sind in `devDependencies` und werden für den Build benötigt

## Alternative Build Commands:

### Option 1 (Empfohlen):
```bash
npm install && npm run build
```

### Option 2 (Explizit):
```bash
npm install --include=dev && npm run build
```

### Option 3 (Mit Cache-Bereinigung):
```bash
npm cache clean --force && npm install && npm run build
```

## Nach dem Fix:
- Build läuft erfolgreich durch
- Frontend wird mit Vite gebaut
- Backend wird mit esbuild erstellt
- App startet normal mit `npm start`

## Bestätigung des Erfolgs:
Logs sollten zeigen:
```
> vite build && esbuild server/index.ts ...
✓ built in XXXms
==> Build succeeded 🎉
```