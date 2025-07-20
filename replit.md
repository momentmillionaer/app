# Momentmillionär - replit.md

## Overview

This is a full-stack event calendar application called "Momentmillionär" built for displaying events in Graz, Austria. The application features a React frontend with a Node.js/Express backend that integrates with Notion as a content management system. Events are stored and managed through Notion databases and displayed in a modern, responsive web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**July 15, 2025 - Event Pagination & Performance Optimization**
- ✓ Fixed critical pagination issue: Now loads all 194 events (previously limited to 100)
- ✓ Implemented comprehensive caching system with 5-minute TTL for events
- ✓ Added intelligent rate-limiting handling with cache fallback mechanisms
- ✓ Response time improved from 6+ seconds to 10ms via caching
- ✓ Successfully implemented full Notion database pagination (100 + 94 events)
- ✓ Enhanced error handling for API rate limits with graceful degradation
- ✓ Cache system includes expired cache fallback during rate limiting
- ✓ All categories and audiences now cached for 10 minutes
- ✓ Application now displays complete event dataset through September 2025

**July 15, 2025 - Advanced Event Features & Interaction Improvements**
- ✓ Added subtitle support to event schema and display between event name and organizer
- ✓ Implemented hover preview for calendar events with EventCard-style popup
- ✓ Added event images as modal headers with gradient overlay
- ✓ Enhanced image loading with better error handling and referrer policy
- ✓ Improved Notion image detection with robust URL filtering
- ✓ Calendar view now shows hover previews on event hover
- ✓ Event modal displays event image as header when available
- ✓ Subtitle field from Notion "Untertitel" property displayed in italic styling
- ✓ Enhanced multi-date event handling with proper past/future date logic
- ✓ Calendar grays out past events while list/grid hide them completely
- ✓ Implemented banner-proportion images (16:9) for EventCards instead of square format
- ✓ Made EventCards more compact with reduced heights and optimized spacing
- ✓ Added automatic sync monitoring system with /api/sync-check endpoint
- ✓ Created comprehensive sync-check tool to monitor Notion database synchronization
- ✓ Implemented automatic sync checking every 5 minutes for live event updates

**July 16, 2025 - Enhanced Image Loading & Document Support**
- ✓ Fixed complex emoji parsing issues by implementing direct category mapping for known categories
- ✓ Added robust character-by-character emoji extraction with Unicode range checking
- ✓ Removed problematic hover link button from grid view that overlapped with free emoji
- ✓ Removed redundant Website field from event modal (blue button already handles links)
- ✓ Added document support from Notion "Dateien" property in event cards and modal
- ✓ Enhanced image loading with referrerPolicy="no-referrer" and loading="lazy" across all components
- ✓ Implemented comprehensive error logging for image loading failures
- ✓ Added documentsUrls field to event schema for PDF and document file support
- ✓ Documents displayed as clickable badges in event cards with file type icons
- ✓ Event modal shows documents section with file name extraction from URLs

**July 16, 2025 - Custom Color Palette & UI Consistency**
- ✓ Implemented purple and orange color highlights from custom color palette instead of only blue/lime
- ✓ Free Events filter button now uses purple background with orange hover state
- ✓ Event hinzufügen button uses orange background with purple hover state
- ✓ Active filter badges now use different brand colors: purple for search, orange for category, blue for audience, lime for dates, cream for free events
- ✓ All form elements made maximally rounded (rounded-full) including search input, category/audience dropdowns
- ✓ Date range picker buttons converted to fully rounded design (rounded-full)
- ✓ Clear filters button simplified to round trash icon only (🗑️) without additional text
- ✓ Removed duplicate "Event hinzufügen" button below filter section as requested
- ✓ Added Instagram preview component for @cornelia.morgen at bottom of events page
- ✓ Instagram preview features gradient purple-to-orange button with hover animations
- ✓ Date range picker action buttons now use orange/purple color scheme instead of blue/lime

**July 16, 2025 - UI Refinements & Content Updates**
- ✓ EventCards reverted back to rounded-[2rem] rectangles as requested (not fully round)
- ✓ Buttons, badges, toggles, and small fields remain fully rounded (rounded-full)
- ✓ Updated Instagram section: "Verfolge meine Reise zum Momentmillionär" and "Event-Recaps, Special Ankündigungen und ganz viele echte Momente"
- ✓ Removed filter summary text from event count display
- ✓ Created new Footer component with copyright, Impressum/Kontakt links, and tagline
- ✓ Footer shows "© momentmillionär" with "Dein Weg zu unvergesslichen Momenten in Graz" tagline
- ✓ Added user's profile image to Instagram section without additional frames
- ✓ Enhanced text with emoji decoration for better visual appeal

**July 16, 2025 - Performance & Reliability Optimizations**
- ✓ Notion database sync frequency changed to twice daily (12-hour intervals) as requested
- ✓ Enhanced caching system: Events cached for 30 minutes with 24-hour backup cache
- ✓ Improved rate limiting handling with multi-level fallback cache system
- ✓ Categories cached for 60 minutes (instead of 10) with 24-hour backup
- ✓ Enhanced image loading with smart retry mechanisms and graceful fallbacks
- ✓ Prioritized AWS S3 images for better reliability and loading performance
- ✓ Added exponential backoff for Notion API pagination to prevent rate limiting
- ✓ Comprehensive error handling ensures app stays functional during API issues

**July 16, 2025 - Responsive Calendar Views & UI Consistency**
- ✓ Updated "Event hinzufügen" button to link to new Tally form (https://tally.so/r/m606Pk)
- ✓ Implemented responsive calendar: Mobile shows weekly view with vertical day list, Desktop keeps monthly view
- ✓ Mobile weekly view features full event title readability with complete event information per day
- ✓ Consistent lime highlighting for today's date across both mobile and desktop views
- ✓ Mobile view shows up to 3 events per day with overflow indicator for better performance
- ✓ Enhanced mobile UX with day-by-day cards including time, location, and free event indicators

**July 17, 2025 - Multi-Day Event Support & Calendar Enhancements**
- ✓ Fixed React hooks errors by moving useState outside map functions
- ✓ Enhanced date-range-picker to support both single day AND range selection with mode toggle
- ✓ Updated latest-event-popup with 2x daily automatic refresh mechanism (12-hour intervals)
- ✓ Made mobile "+ weitere Events" buttons clickable and expandable with full event details
- ✓ Implemented comprehensive multi-day event support with endDate field in schema
- ✓ Multi-day events (like Herbstmesse) now appear on ALL days between start and end dates
- ✓ Enhanced calendar logic to handle both single-day and multi-day events correctly
- ✓ Added automatic date range detection from Notion date properties (start/end)
- ✓ Events with explicit start/end dates now display across entire date range in calendar
- ✓ Maintained backward compatibility with legacy "Termine:" description format
- ✓ Fixed critical date picker off-by-one error with proper timezone handling
- ✓ Rebuilt date picker with "Einzeltag" and "Zeitraum" toggle modes in popup
- ✓ Replaced background image with new user-provided classical painting asset
- ✓ Date selection now uses local date formatting to prevent timezone issues
- ✓ Reduced background overlay opacity from 0.9 to 0.4 for clearer image visibility
- ✓ Today's date now shows only border outline (lime green) instead of filled background
- ✓ Single mode selections show border-only, range mode shows filled backgrounds
- ✓ Range background highlight only appears when both start and end dates selected
- ✓ Fixed mobile date picker styling to match other filter buttons (transparent glass with emoji)
- ✓ Date picker now uses consistent liquid-glass styling across all screen sizes
- ✓ Calendar date selections use rounded corners (12px) instead of full circles for better readability
- ✓ Today's date shows lime green outline with subtle glow effect, no background fill
- ✓ Date range backgrounds (start, middle, end) all use consistent rounded corner styling

**July 17, 2025 - Comprehensive Deployment Setup & Footer Updates**
- ✓ Created complete GitHub deployment configuration with automated CI/CD pipeline
- ✓ Added Vercel deployment setup with optimized build configuration
- ✓ Implemented Docker containerization with multi-stage builds for production efficiency
- ✓ Created comprehensive deployment documentation (README.md, DEPLOYMENT.md)
- ✓ Added Render deployment configuration with render.yaml for streamlined hosting
- ✓ Configured environment variable templates (.env.example) for easy setup
- ✓ Enhanced deployment flexibility with multiple platform support (Vercel, Render, Docker)
- ✓ Added health check endpoints and production-ready error handling
- ✓ Created step-by-step deployment guides for non-technical users
- ✓ Updated Footer links: Impressum → https://www.morgen.co.at/impressum, Kontakt → cornelia@morgen.co.at
- ✓ Implemented comprehensive Event Share functionality with canvas-based image generation
- ✓ Added Share button (purple/orange) in event modal bottom-left with liquid glass share dialog
- ✓ Created social media optimized 1080x1080px images with blurred event background and glass-morphism overlay
- ✓ Added download, share (native API), and link copying functionality for enhanced social sharing
- ✓ Filter UX improvements: automatic switch to grid view when filters applied for better overview
- ✓ Date filtering corrected to show exact date matches instead of events after selected date
- ✓ Removed duplicate grid view option to maintain clean 3-button interface (Calendar, Liste, Raster)
- ✓ Fixed date filtering logic: Single date selections now show exact matches only (dateFrom && !dateTo)
- ✓ Enhanced CORS support in share functionality for better cross-origin image handling
- ✓ PWA setup completed: favicon, app icons, manifest.json for iPhone home screen integration
- ✓ App name "momentmillionär" configured for all devices with custom MM logo as app icon
- ✓ Enhanced share functionality: improved image generation with robust error handling
- ✓ Fixed share buttons: Download, Share (with multiple fallbacks), and Link copy all functional
- ✓ Latest Event Popup: Fixed to show earliest upcoming event, daily refresh (24h intervals)
- ✓ Share dialog now handles image loading failures gracefully with gradient fallbacks
- ✓ Updated share image format to 4:5 ratio (1080x1350px) optimized for Instagram
- ✓ Enhanced background blur (30px) and reduced brightness (0.3) for better text readability
- ✓ Improved glass morphism container opacity for better text contrast
- ✓ Debug logging system added for troubleshooting image generation issues
- ✓ EventCard modal buttons updated with liquid glass styling and rounded corners
- ✓ Share and Tickets buttons now consistent with app's design language
- ✓ SEO optimization files added: robots.txt and sitemap.xml for better search indexing
- ✓ Share image generation improved: proper image scaling without distortion (cover behavior)
- ✓ Background overlay softened to match liquid glass aesthetic of filter section
- ✓ Text shadows and strokes reduced for consistency with app's design language
- ✓ Share image container transparency minimized (4% opacity) with stronger blur (40px) for better readability

**July 20, 2025 - Timezone Implementation & Notion Sync Enhancement**
- ✓ Comprehensive timezone update to GMT+2 (Europe/Vienna) for Weiz, Austria
- ✓ All date/time displays now use Austrian locale (de-AT) and Vienna timezone
- ✓ Server health endpoint includes local Vienna time for monitoring (21:19:43 confirmed)
- ✓ Event card date comparisons updated for accurate Austrian time zones
- ✓ Event modal, latest event popup, and share dialogs use Vienna timezone
- ✓ Manual Notion sync endpoint (/api/sync) created for forced data updates
- ✓ "conni's favoriten" text added in Connihof font for favorites view
- ✓ 199 events successfully synchronized from Notion (1 favorite confirmed: "Cirque Le Roux")
- ✓ TypeScript compatibility issues resolved for event modal components
- ✓ Favorites view correctly implemented with "Conni's Favorites" checkbox detection
- ✓ Share image container updated to gray tone (rgba(128,128,128,0.7)) as requested
- ✓ Share image layout redesigned to match EventCard style in 4:5 format (1080x1350)
- ✓ Removed yellow star from favorites view header, kept only "conni's favoriten" in Connihof font
- ✓ Cleaned up view toggle buttons - removed text from favorites button, kept only star icon
- ✓ Fixed double "conni's favoriten" title - now appears only once in favorites view
- ✓ Share image redesigned to match favorites EventCard style with purple border and glass effect

**July 15, 2025 - Deployment Fixes & Production Readiness**
- ✓ Fixed critical deployment issue: Removed process.exit() from sync check that terminated server
- ✓ Added health check endpoints at / and /health for deployment monitoring
- ✓ Implemented non-blocking sync initialization using setImmediate()
- ✓ Added graceful shutdown handlers for SIGTERM and SIGINT signals
- ✓ Enhanced error handling with timeout fallbacks for production stability
- ✓ Server now stays alive after sync initialization for proper HTTP request handling
- ✓ Background sync monitoring continues without blocking main thread
- ✓ Application now deployment-ready with proper health checks and lifecycle management

**July 14, 2025 - iOS 26 Liquid Glass Design & Typography Updates**
- ✓ Updated app to use dynamic "Kategorie" field from Notion database instead of predefined categories
- ✓ Implemented custom color palette from user's brand colors (#0A0A0A, #0000FF, #D0FE1D, #F3DCFA, #F4F3F2, #FE5C2B, #FEE4C3)
- ✓ Added /api/categories endpoint to fetch available categories from Notion
- ✓ Applied iOS 26 Liquid Glass design with advanced glass morphism effects
- ✓ Enhanced backdrop blur with saturation and brightness adjustments for authentic liquid glass look
- ✓ Implemented dynamic gradient background with subtle color transitions
- ✓ Switched to Helvetica font family throughout the application
- ✓ All UI elements now feature translucent materials with depth and subtle animations
- ✓ Converted all text throughout entire application to white with drop shadows for better readability
- ✓ Fixed all Radix UI Select dropdowns to display white text properly
- ✓ Enlarged "momentmillionär" title (text-4xl/5xl), reduced letter spacing (tracking-tight), reduced spacing to filter section
- ✓ Implemented square thumbnail images (96x96px, sm:128x128px) from Notion "Dateien" property
- ✓ Enhanced calendar view to display EventCard components under calendar with same styling as list view
- ✓ Added blue 🆓 FREE badge for events with 0€ price, positioned left of category badge

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API**: RESTful API design
- **Session Storage**: PostgreSQL-based sessions with connect-pg-simple
- **Database ORM**: Drizzle ORM with PostgreSQL dialect
- **External Integration**: Notion API for content management

### Database Strategy
- **Primary Database**: PostgreSQL (configured via Neon Database)
- **ORM**: Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema synchronization
- **Content Source**: Notion databases serve as the primary content management system

## Key Components

### Core Application Structure
```
├── client/          # React frontend application
├── server/          # Express.js backend API
├── shared/          # Shared TypeScript schemas and types
└── migrations/      # Database migration files
```

### Frontend Components
- **Event Display**: EventCard component for individual event presentation
- **Search & Filtering**: SearchFilters component with category, date, and text search
- **Layout**: Header component with application branding and statistics
- **UI System**: Complete shadcn/ui component library for consistent design

### Backend Services
- **Notion Integration**: Custom service for reading from Notion databases
- **Event API**: RESTful endpoints for event data retrieval
- **Storage Layer**: Abstracted storage interface supporting both memory and database storage

### Database Schema
- **Events Table**: Stores event data synchronized from Notion
  - Core fields: title, description, category, location, date, time
  - Metadata: price, website, attendees, timestamps
  - Notion integration: notionId for synchronization

## Data Flow

### Event Data Pipeline
1. **Content Creation**: Events are created and managed in Notion databases
2. **API Integration**: Backend fetches events from Notion using the official Notion client
3. **Data Transformation**: Raw Notion data is transformed into application schema
4. **Database Storage**: Events can be cached/stored in PostgreSQL for performance
5. **Frontend Display**: React components fetch and display events via REST API

### User Interaction Flow
1. **Page Load**: Application fetches events from `/api/events` endpoint
2. **Real-time Updates**: TanStack Query provides automatic refetching every 5 minutes
3. **Search & Filter**: Client-side filtering for responsive user experience
4. **Event Browsing**: Users can search by text, filter by category, and sort by date

## External Dependencies

### Primary Integrations
- **Notion API**: Content management and event data source
  - Requires NOTION_INTEGRATION_SECRET environment variable
  - Requires NOTION_PAGE_URL for database location
- **Neon Database**: PostgreSQL hosting for application data
  - Requires DATABASE_URL environment variable

### Key Libraries
- **Frontend**: React, TanStack Query, Radix UI, Tailwind CSS, date-fns
- **Backend**: Express.js, Drizzle ORM, Notion SDK, Zod for validation
- **Development**: Vite, TypeScript, ESLint, Replit development tools

### Authentication & Security
- **Session Management**: PostgreSQL-backed sessions via connect-pg-simple
- **Environment Security**: Environment variables for sensitive configuration
- **Type Safety**: Full TypeScript coverage with Zod schema validation

## Deployment Strategy

### Development Environment
- **Local Development**: Vite dev server with HMR for frontend
- **Backend Development**: tsx for TypeScript execution with auto-reload
- **Database**: Drizzle Kit for schema management and migrations

### Production Build
- **Frontend Build**: Vite production build with optimized assets
- **Backend Build**: esbuild for Node.js bundle creation
- **Asset Serving**: Express serves static frontend assets in production

### Environment Configuration
- **Development**: NODE_ENV=development with development-specific middleware
- **Production**: NODE_ENV=production with optimized asset serving
- **Database**: Automatic migration support via `npm run db:push`

### Replit Integration
- **Development Banner**: Automatic Replit development banner injection
- **Cartographer Plugin**: Replit-specific development tooling integration
- **Runtime Error Overlay**: Enhanced development experience with error modals