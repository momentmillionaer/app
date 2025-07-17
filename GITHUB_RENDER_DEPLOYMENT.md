# GitHub + Render Deployment Guide

## Schritt 1: GitHub Repository erstellen

1. **Neues Repository auf GitHub erstellen:**
   - Gehen Sie zu https://github.com
   - Klicken Sie auf "New repository"
   - Repository Name: `momentmillionaer-app`
   - Setzen Sie es auf "Public" oder "Private"
   - **NICHT** "Initialize with README" auswählen
   - Klicken Sie "Create repository"

2. **Code zu GitHub pushen:**
   ```bash
   # In Ihrem Replit Terminal ausführen:
   git init
   git add .
   git commit -m "PWA Setup: Favicon, App Icons und exakte Datumsfilterung"
   git branch -M main
   git remote add origin https://github.com/IHR-USERNAME/momentmillionaer-app.git
   git push -u origin main
   ```

## Schritt 2: Render Setup

1. **Bei Render anmelden:**
   - Gehen Sie zu https://render.com
   - Melden Sie sich mit GitHub an

2. **Neuen Web Service erstellen:**
   - Klicken Sie auf "New +"
   - Wählen Sie "Web Service"
   - Verbinden Sie Ihr GitHub Repository
   - Wählen Sie `momentmillionaer-app` aus

3. **Build Settings konfigurieren:**
   - **Name:** `momentmillionaer`
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
   - **Auto-Deploy:** `Yes` (aktiviert)

## Schritt 3: Environment Variables

Fügen Sie diese Environment Variables in Render hinzu:

```
NODE_ENV=production
NOTION_INTEGRATION_SECRET=IHR_NOTION_SECRET
NOTION_PAGE_URL=IHR_NOTION_PAGE_URL
```

**So fügen Sie sie hinzu:**
1. Gehen Sie zu Ihrem Service Dashboard
2. Klicken Sie auf "Environment" 
3. Klicken Sie "Add Environment Variable"
4. Fügen Sie jede Variable einzeln hinzu

## Schritt 4: Deployment

1. **Ersten Deploy starten:**
   - Klicken Sie "Create Web Service"
   - Render beginnt automatisch mit dem Build
   - Dies dauert 5-10 Minuten

2. **Deploy-Status überwachen:**
   - Schauen Sie in die Logs
   - Bei Erfolg erhalten Sie eine URL: `https://momentmillionaer.onrender.com`

## Schritt 5: Automatische Updates

**Jedes Mal wenn Sie Änderungen machen:**

1. **In Replit:**
   ```bash
   git add .
   git commit -m "Beschreibung Ihrer Änderungen"
   git push
   ```

2. **Render erkennt automatisch:**
   - Jeder Push zu `main` triggert neuen Deploy
   - Sie sehen den Fortschritt in Render Dashboard
   - Nach 5-10 Minuten sind Änderungen live

## Wichtige Hinweise

- **Erste Deployment:** Kann 10-15 Minuten dauern
- **Updates:** 5-10 Minuten
- **Kostenlos:** Render Free Tier hat 750 Stunden/Monat
- **Custom Domain:** Können Sie später in Render Settings hinzufügen

## Bei Problemen

1. **Build Fehler:** Schauen Sie in Render Logs
2. **Environment Variables:** Prüfen Sie ob alle gesetzt sind
3. **GitHub Sync:** Prüfen Sie ob letzter Commit gepusht wurde

Ihre App ist dann live unter: `https://momentmillionaer.onrender.com`