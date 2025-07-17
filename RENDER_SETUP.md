# Render Deployment Guide für Momentmillionär

## Schritt-für-Schritt Anleitung

### 1. Code zu GitHub hochladen

**Option A: Replit Download**
1. Replit → **Download as ZIP**
2. ZIP-Datei entpacken

**Option B: GitHub Repository erstellen**
1. **GitHub.com** → **"New repository"**
2. **Name**: `app` 
3. **Owner**: Ihr GitHub Username
4. **Public** oder **Private**
5. **NICHT** "Add README" ankreuzen
6. **"Create repository"**

**Option C: Dateien hochladen**
1. **"uploading an existing file"** klicken
2. Alle entpackten Dateien auswählen
3. **Commit message**: "Initial commit: Momentmillionär Event App"
4. **"Commit new files"**

### 2. Render Account erstellen

1. **[render.com](https://render.com)** besuchen
2. **"Get Started"** klicken
3. Mit **GitHub** anmelden
4. Render Zugriff auf Repositories gewähren

### 3. Web Service erstellen

1. **Dashboard** → **"New +"** → **"Web Service"**
2. **GitHub Repository** auswählen: `ihr-username/app`
3. **Konfiguration**:

```
Name: momentmillionaer-app
Branch: main
Root Directory: (leer lassen)
Runtime: Node
Build Command: npm install && npm run build
Start Command: npm start
```

### 4. Environment Variables hinzufügen

**Settings** → **Environment** → **Add Environment Variable**:

```
NODE_ENV=production
DATABASE_URL=postgresql://user:password@host:port/database
NOTION_INTEGRATION_SECRET=secret_your_notion_integration_token
NOTION_PAGE_URL=https://notion.so/your-database-page-id
```

### 5. PostgreSQL Database (Optional)

Falls Sie eine neue Database benötigen:

1. **"New +"** → **"PostgreSQL"**
2. **Name**: `momentmillionaer-db`
3. **Plan**: Free
4. **"Create Database"**
5. **Connection String** kopieren
6. Als `DATABASE_URL` im Web Service eintragen

### 6. Deploy

1. **"Create Web Service"** klicken
2. Render startet automatisch das Deployment
3. **Logs** verfolgen bis "Deploy live"
4. **URL** klicken um App zu besuchen

## Nach dem Deployment

### Health Check
Ihre App ist erreichbar unter: `https://momentmillionaer-app.onrender.com`

### Automatische Updates
- Bei jedem Push zu GitHub wird automatisch neu deployed
- Logs verfügbar im Render Dashboard
- Monitoring und Metrics integriert

### Custom Domain (Optional)
1. **Settings** → **Custom Domains**
2. **Add Custom Domain**: `app.momentmillionaer.at`
3. DNS-Einstellungen bei Ihrem Domain-Provider konfigurieren

## Notion API Setup

### Integration erstellen
1. **[notion.so/my-integrations](https://notion.so/my-integrations)**
2. **"New integration"**
3. **Name**: "Momentmillionär App"
4. **Associated workspace**: Ihr Workspace
5. **"Submit"**
6. **Internal Integration Secret** kopieren

### Database teilen
1. Ihre Events-Database in Notion öffnen
2. **"Share"** → **"Invite"**
3. Integration auswählen
4. **Page URL** kopieren

### Environment Variables aktualisieren
```
NOTION_INTEGRATION_SECRET=secret_xxxxxxxxx
NOTION_PAGE_URL=https://notion.so/xxxxxxxxx
```

## Troubleshooting

### Build Errors
- **Logs** im Render Dashboard prüfen
- Sicherstellen dass `package.json` korrekt ist
- Node Version 18 verwenden

### Database Connection
- `DATABASE_URL` Format prüfen
- Database erreichbar und korrekte Credentials

### Notion API Errors
- Integration Secret korrekt
- Database mit Integration geteilt
- Page URL vollständig

### Performance
- Free Plan: App schläft nach 15 Min Inaktivität
- Paid Plan: Immer aktiv
- Cold Start: Erste Anfrage kann langsamer sein

## Kosten

### Free Plan
- 750 Stunden/Monat
- App schläft bei Inaktivität
- 100GB Bandbreite
- Community Support

### Paid Plans
- Ab $7/Monat
- Immer aktiv
- Mehr Ressourcen
- Priority Support

## Support

- **Render Docs**: [render.com/docs](https://render.com/docs)
- **Community**: [render.com/community](https://render.com/community)
- **Support**: Bei Problemen Ticket erstellen