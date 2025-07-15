# Momentmillionär - replit.md

## Overview

This is a full-stack event calendar application called "Momentmillionär" built for displaying events in Graz, Austria. The application features a React frontend with a Node.js/Express backend that integrates with Notion as a content management system. Events are stored and managed through Notion databases and displayed in a modern, responsive web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

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