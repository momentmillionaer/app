# Deployment Guide für Momentmillionär

## Option 1: GitHub + Vercel (Empfohlen)

### Schritt 1: GitHub Repository erstellen

1. Erstellen Sie ein neues Repository auf GitHub: `https://github.com/momentmillionaer/app`

2. Pushen Sie den Code zu GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Momentmillionär Event App"
   git branch -M main
   git remote add origin https://github.com/momentmillionaer/app.git
   git push -u origin main
   ```

### Schritt 2: Vercel Setup

1. Gehen Sie zu [vercel.com](https://vercel.com) und loggen Sie sich mit GitHub ein
2. Klicken Sie auf "New Project"
3. Importieren Sie Ihr GitHub Repository
4. Vercel erkennt automatisch die `vercel.json` Konfiguration

### Schritt 3: Environment Variables in Vercel

Fügen Sie folgende Environment Variables in den Vercel-Projekteinstellungen hinzu:

```
DATABASE_URL=postgresql://user:password@host:port/database
NOTION_INTEGRATION_SECRET=secret_your_notion_integration_token
NOTION_PAGE_URL=https://notion.so/your-page-id
NODE_ENV=production
```

### Schritt 4: Deploy

- Klicken Sie auf "Deploy"
- Bei jedem Push zu `main` erfolgt automatisches Re-Deployment
- Ihre App ist verfügbar unter: `https://your-project-name.vercel.app`

## Option 2: GitHub + Netlify

### Schritt 1: Netlify Build Settings

Erstellen Sie `netlify.toml`:

```toml
[build]
  publish = "client/dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/api/*"
  to = "/.netlify/functions/server/:splat"
  status = 200

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Schritt 2: Serverless Function

Erstellen Sie `netlify/functions/server.js`:

```javascript
import { app } from '../../server/index.js';
import serverless from 'serverless-http';

export const handler = serverless(app);
```

## Option 3: Railway

1. Gehen Sie zu [railway.app](https://railway.app)
2. Verbinden Sie Ihr GitHub Repository
3. Fügen Sie Environment Variables hinzu
4. Railway deployt automatisch mit dem Dockerfile

## Option 4: Render

1. Gehen Sie zu [render.com](https://render.com)
2. Erstellen Sie einen neuen "Web Service"
3. Verbinden Sie Ihr GitHub Repository
4. Konfiguration:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Node Version: 18

## Option 5: Render (Empfohlen für einfaches Setup)

### Schritt 1: GitHub Repository vorbereiten
1. Laden Sie die Zip-Datei von Replit herunter
2. Erstellen Sie ein GitHub Repository: `momentmillionaer/app`
3. Laden Sie alle Dateien hoch

### Schritt 2: Render Setup
1. Gehen Sie zu [render.com](https://render.com)
2. **"New +"** → **"Web Service"**
3. **GitHub Repository verbinden**: `momentmillionaer/app`
4. **Konfiguration**:
   - **Name**: `momentmillionaer-app`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: 18

### Schritt 3: Environment Variables
Fügen Sie in Render folgende Environment Variables hinzu:
```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
NOTION_INTEGRATION_SECRET=secret_your_notion_token
NOTION_PAGE_URL=https://notion.so/your-page-id
```

### Schritt 4: PostgreSQL Database (Optional)
- **"New +"** → **"PostgreSQL"**
- **Name**: `momentmillionaer-db`
- Verbinden Sie die Database URL mit Ihrem Web Service

### Vorteile von Render:
- Kostenloser Plan verfügbar
- Automatische SSL-Zertifikate
- Einfache Environment Variable Verwaltung
- Integrierte PostgreSQL-Option
- Automatisches Deployment bei Git-Push

## Option 6: DigitalOcean App Platform

1. Gehen Sie zu [cloud.digitalocean.com](https://cloud.digitalocean.com)
2. Erstellen Sie eine neue App
3. Verbinden Sie Ihr GitHub Repository
4. DigitalOcean erkennt automatisch die Node.js App

## Wichtige Hinweise

### Database Setup
- Stellen Sie sicher, dass Ihre PostgreSQL-Datenbank öffentlich erreichbar ist
- Verwenden Sie Services wie [Neon](https://neon.tech) oder [Supabase](https://supabase.com)
- Führen Sie `npm run db:push` aus, um das Schema zu erstellen

### Notion API Setup
1. Erstellen Sie eine Notion Integration: [notion.so/my-integrations](https://notion.so/my-integrations)
2. Teilen Sie Ihre Event-Datenbank mit der Integration
3. Kopieren Sie das Secret und die Page URL

### SSL/HTTPS
- Alle empfohlenen Platforms bieten automatisches SSL
- Ihre App läuft automatisch über HTTPS

### Custom Domain
- Konfigurieren Sie Ihre eigene Domain in den Platform-Einstellungen
- Beispiel: `app.momentmillionaer.at`

### Monitoring
- Nutzen Sie die integrierten Monitoring-Tools der Platforms
- Logs sind in den jeweiligen Dashboards verfügbar

## Troubleshooting

### Build Errors
- Überprüfen Sie, dass alle Dependencies in `package.json` stehen
- Stellen Sie sicher, dass `NODE_ENV=production` gesetzt ist

### Database Connection
- Überprüfen Sie die `DATABASE_URL` Variable
- Testen Sie die Verbindung lokal mit `npm run db:push`

### Notion API Errors
- Überprüfen Sie das `NOTION_INTEGRATION_SECRET`
- Stellen Sie sicher, dass die Integration Zugriff auf die Datenbank hat

## Support

Bei Deployment-Problemen:
1. Überprüfen Sie die Platform-spezifischen Logs
2. Testen Sie das Build lokal mit `npm run build`
3. Überprüfen Sie alle Environment Variables