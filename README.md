# Momentmillionär - Event Calendar App

Eine moderne Event-Kalender-Anwendung für Graz, Österreich, die Events aus Notion-Datenbanken synchronisiert und in einer responsiven Web-Oberfläche anzeigt.

## Features

- 🎭 **Dynamische Event-Anzeige**: Synchronisation mit Notion-Datenbanken
- 📱 **Responsive Design**: Optimiert für Desktop und Mobile
- 🔍 **Intelligente Suche**: Text-, Kategorie- und Datumsfilter
- 📅 **Mehrere Ansichten**: Karten-, Listen- und Kalenderansicht
- 🎨 **Modernes UI**: iOS 26 Liquid Glass Design mit Custom Color Palette
- ⚡ **Performance**: Caching-System mit 30-minütiger TTL
- 🔄 **Auto-Sync**: Automatische Synchronisation alle 12 Stunden

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (Neon), Drizzle ORM
- **External API**: Notion API für Content Management
- **Build Tool**: Vite
- **Routing**: Wouter
- **State Management**: TanStack Query

## Deployment

### GitHub + Vercel (Empfohlen)

1. **Repository erstellen**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/momentmillionaer/app.git
   git push -u origin main
   ```

2. **Vercel Setup**:
   - Vercel-Account mit GitHub verbinden
   - Repository importieren
   - Environment Variables konfigurieren:
     - `DATABASE_URL`
     - `NOTION_INTEGRATION_SECRET`
     - `NOTION_PAGE_URL`
     - `NODE_ENV=production`

3. **Automatisches Deployment**:
   - Push zu `main` Branch löst automatisches Deployment aus
   - GitHub Actions Workflow bereits konfiguriert

### Alternative: Docker

```bash
# Docker Build
docker build -t momentmillionaer-app .

# Docker Run
docker run -p 5000:5000 \
  -e DATABASE_URL="your_database_url" \
  -e NOTION_INTEGRATION_SECRET="your_notion_secret" \
  -e NOTION_PAGE_URL="your_notion_page_url" \
  momentmillionaer-app
```

## Environment Variables

Erstellen Sie eine `.env` Datei mit folgenden Variablen:

```env
# Database
DATABASE_URL="postgresql://user:password@host:port/database"

# Notion API
NOTION_INTEGRATION_SECRET="secret_your_notion_integration_token"
NOTION_PAGE_URL="https://notion.so/your-page-id"

# Application
NODE_ENV="production"
PORT="5000"
```

## Local Development

```bash
# Dependencies installieren
npm install

# Development Server starten
npm run dev

# Production Build
npm run build

# Production Start
npm start
```

## Features im Detail

### Event Management
- Vollständige Notion-Integration für Event-Daten
- Multi-Day Event Support
- Automatische Bild- und Dokumenterkennung
- Kategorien und Zielgruppen-Filtering

### Design System
- Custom Color Palette: Purple, Orange, Lime, Cream
- Liquid Glass UI mit Backdrop Blur Effekten
- Konsistente Rounded Corner Philosophie
- Mobile-First Responsive Design

### Performance
- Intelligentes Caching-System
- Rate-Limiting Protection
- Image Lazy Loading
- Optimierte Bundle Sizes

## Architektur

```
├── client/          # React Frontend
├── server/          # Express Backend
├── shared/          # Geteilte TypeScript Types
├── .github/         # GitHub Actions Workflows
├── vercel.json      # Vercel Deployment Config
└── Dockerfile       # Docker Container Config
```

## Support

Bei Fragen oder Problemen öffnen Sie bitte ein Issue im GitHub Repository.

## License

MIT License - siehe LICENSE Datei für Details.