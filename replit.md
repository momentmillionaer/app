# Momentmillionär - replit.md

## Overview

Momentmillionär is a full-stack event calendar application designed to display events in Graz, Austria. It features a React frontend and a Node.js/Express backend, utilizing Notion as a robust content management system. The primary purpose is to provide a modern, responsive web interface for users to discover events, with all event data managed and synchronized through Notion databases. The project aims to be the go-to platform for unforgettable moments in Graz.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions
- Modern, responsive design with a focus on intuitive user experience.
- iOS 26 Liquid Glass design principles, including advanced glass morphism effects, translucent materials, and subtle animations.
- Custom color palette: utilizing brand colors (#0A0A0A, #0000FF, #D0FE1D, #F3DCFA, #F4F3F2, #FE5C2B, #FEE4C3) for highlights and consistent branding.
- Typography: Helvetica font family used throughout the application for clean readability.
- All text is white with drop shadows for better readability against various backgrounds.
- Elements like buttons, badges, and toggles are fully rounded (rounded-full) while EventCards are rounded-[2rem].
- Dynamic gradient background with subtle color transitions.
- Automatic filtering of past events when filters are active, preserving full view otherwise.
- Consistent date display in Austrian locale (de-AT) and Vienna timezone (GMT+2).

### Technical Implementations
- **Frontend**: React 18 with TypeScript, Wouter for routing, TanStack Query for server state, Radix UI components with shadcn/ui styling, Tailwind CSS for styling, Vite for building.
- **Backend**: Node.js with Express.js, TypeScript with ES modules, RESTful API.
- **Data Flow**: Events managed in Notion, fetched by backend via Notion API, transformed, and potentially cached/stored in PostgreSQL. Frontend displays data from REST API.
- **Image Handling**: Enhanced image loading with `referrerPolicy="no-referrer"`, `loading="lazy"`, robust error handling, and retry mechanisms.
- **Multi-day Event Support**: Logic to display events spanning multiple days correctly across all relevant dates in the calendar.
- **Performance**: Comprehensive caching system for events (30 min TTL, 24 hr backup) and categories (60 min TTL, 24 hr backup). Intelligent rate-limiting handling with cache fallbacks. Exponential backoff for Notion API pagination.
- **Event Sharing**: SimpleShareGenerator component using Canvas-based image generation for social media optimized sharing (1080x1350px 4:5 ratio and 1080x1920px 9:16 story format) with event details, gradient background, and glass-morphism overlay. Fully functional without external dependencies.
- **PWA Setup**: `favicon`, app icons, `manifest.json` for home screen integration on mobile devices.
- **SEO**: `robots.txt` and `sitemap.xml` included.

### Feature Specifications
- **Event Display**: EventCard component for individual events, with support for subtitles, organizer, price, and documents.
- **Search & Filtering**: Comprehensive search, category, audience, date range, and "free events" filters.
- **Calendar Views**: Responsive calendar with mobile weekly view (vertical day list) and desktop monthly view. Hover previews for events.
- **Notion Integration**: Dynamic fetching of categories and audiences directly from Notion database.
- **Price Handling**: Robust price parsing from Notion (Number, Rich Text, Title, Formula fields) with `€ XX,XX` formatting.
- **Document Support**: Display of linked documents from Notion with file type icons.
- **Favoriten View**: Redesigned EventCards with event image as full background, enhanced blur, and glow effects.

### System Design Choices
- **Separation of Concerns**: Clear `client/`, `server/`, `shared/`, and `migrations/` directories.
- **Database Strategy**: PostgreSQL (Neon Database) as primary, Drizzle ORM for type-safe operations, Drizzle Kit for schema management. Notion is the primary content source.
- **Session Management**: PostgreSQL-backed sessions (`connect-pg-simple`).
- **Type Safety**: Full TypeScript coverage and Zod for validation.
- **Deployment**: Automated CI/CD (GitHub, Vercel, Render), Docker containerization, health checks, graceful shutdown handlers.

## External Dependencies

### Primary Integrations
- **Notion API**: Used for content management, fetching event data, categories, and audiences.
- **Neon Database**: Provides PostgreSQL hosting for application data storage and caching.

### Key Libraries
- **Frontend**: React, TanStack Query, Radix UI, Tailwind CSS, Wouter, date-fns.
- **Backend**: Express.js, Drizzle ORM, Notion SDK (official Notion client), Zod.

### Other Integrations
- **Tally.so**: Used for the "Event hinzufügen" form.