import type { Express } from "express";
import { createServer, type Server } from "http";
import { notion, findDatabaseByTitle, getEventsFromNotion } from "./notion";
import { cache } from "./cache";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint for deployment monitoring (only /health, not root)
  app.get("/health", (req, res) => {
    const viennaTime = new Date().toLocaleString("de-AT", { 
      timeZone: "Europe/Vienna",
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    res.json({ 
      status: "healthy", 
      message: "Momentmillionär Event Calendar API", 
      timestamp: new Date().toISOString(),
      localTime: viennaTime,
      timezone: "Europe/Vienna (GMT+2)",
      uptime: process.uptime()
    });
  });

  // Manual sync trigger - clears cache and forces fresh data
  app.post("/api/sync", async (req, res) => {
    try {
      console.log("🔄 Manual sync triggered - clearing caches...");
      
      // Clear all relevant caches
      if (cache.delete) {
        cache.delete("events");
        cache.delete("events-backup");
        cache.delete("categories");
        cache.delete("categories-backup");
        cache.delete("audiences");
      } else {
        // Alternative cache clearing if delete method not available
        cache.set("events", null, 0);
        cache.set("events-backup", null, 0);
        cache.set("categories", null, 0);
        cache.set("categories-backup", null, 0);
        cache.set("audiences", null, 0);
      }
      
      console.log("✅ Caches cleared, forcing fresh Notion sync...");
      
      // Trigger a fresh fetch by making a request to our own events endpoint
      // This will force a new Notion API call since cache is cleared
      const response = await fetch(`http://localhost:${process.env.PORT || 5000}/api/events`);
      
      if (response.ok) {
        const events = await response.json();
        res.json({ 
          success: true, 
          message: "Sync completed successfully",
          eventCount: events.length,
          timestamp: new Date().toISOString()
        });
      } else {
        throw new Error(`Events API returned ${response.status}`);
      }
    } catch (error) {
      console.error("❌ Manual sync failed:", error);
      res.status(500).json({ 
        success: false, 
        error: "Sync failed", 
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  
  // Get all events from Notion database
  app.get("/api/events", async (req, res) => {
    try {
      // Check if Notion is configured
      if (!process.env.NOTION_INTEGRATION_SECRET) {
        console.log("NOTION_INTEGRATION_SECRET not configured");
        return res.status(503).json({ 
          error: "Notion integration not configured",
          message: "NOTION_INTEGRATION_SECRET nicht gesetzt"
        });
      }

      // Check cache first
      const cachedEvents = cache.get("events");
      if (cachedEvents) {
        console.log("Returning cached events");
        return res.json(cachedEvents);
      }

      // Try to find the Momente database by searching all databases
      console.log("Searching for Momente database...");
      
      let databaseId = null;
      let eventsResponse;
      
      try {
        // Search for all databases
        const searchResponse = await notion.search({
          query: "Momente",
          filter: {
            property: "object",
            value: "database"
          }
        });
        
        console.log(`Found ${searchResponse.results.length} databases with "Momente" in name`);
        
        // Find the Momente database
        const momenteDb = searchResponse.results.find((db: any) => 
          db.title && db.title.some((title: any) => 
            title.plain_text && title.plain_text.toLowerCase().includes("momente")
          )
        );
        
        if (!momenteDb) {
          console.log("Momente database not found in search results");
          return res.status(404).json({ 
            error: "Momente database not found",
            message: "Momente-Datenbank nicht gefunden. Bitte prüfen Sie die Notion-Integration."
          });
        }
        
        databaseId = momenteDb.id;
        console.log(`Found Momente database with ID: ${databaseId}`);
        
        // Use the new getEventsFromNotion function
        const allEventsData = await getEventsFromNotion(databaseId);
        console.log(`Successfully loaded ${allEventsData.length} total events from Momente database`);
        
        // Cache the events (30 minutes) and backup (24 hours)
        cache.set("events", allEventsData, 30 * 60 * 1000); // 30 minutes
        console.log("Cached events for 30 minutes");
        
        cache.set("events-backup", allEventsData, 24 * 60 * 60 * 1000); // 24 hours
        console.log("Long-term cached events-backup for 24 hours");
        
        return res.json(allEventsData);
        
      } catch (searchError) {
        console.error("Error searching for Momente database:", searchError);
        
        // Handle rate limiting specifically - use expired cache as fallback
        if (searchError.code === 'rate_limited') {
          console.log("Rate limited, checking for any cached events (including expired)");
          
          // First try expired regular cache
          let fallbackEvents = cache.getExpiredCache("events");
          
          // Then try long-term backup cache
          if (!fallbackEvents) {
            fallbackEvents = cache.get("events-backup");
          }
          
          // Finally try expired backup cache
          if (!fallbackEvents) {
            fallbackEvents = cache.getExpiredCache("events-backup");
          }
          
          if (fallbackEvents) {
            console.log("Returning cached events due to rate limit");
            res.set('X-Cache', 'fallback');
            res.set('X-Cache-Warning', 'rate-limited-fallback');
            return res.json(fallbackEvents);
          }
          
          return res.status(429).json({ 
            error: "Rate limited",
            message: "Zu viele Anfragen. Die Events werden in wenigen Minuten wieder verfügbar sein.",
            details: "Notion API rate limit erreicht"
          });
        }
        
        return res.status(500).json({ 
          error: "Database search failed",
          message: "Fehler beim Suchen der Momente-Datenbank",
          details: searchError.message
        });
      }

      // This code should not be reached since we return early above
      return res.status(500).json({ 
        error: "Unexpected code path",
        message: "Ein unerwarteter Fehler ist aufgetreten"
      });

    } catch (error) {
      console.error("❌ Error fetching events:", error);
      
      // Handle rate limiting with cache fallback
      if (error.code === 'rate_limited') {
        console.log("Rate limited, trying fallback cache...");
        
        let fallbackEvents = cache.getExpiredCache("events") || cache.get("events-backup") || cache.getExpiredCache("events-backup");
        
        if (fallbackEvents) {
          console.log("Returning cached events due to rate limit");
          res.set('X-Cache', 'fallback');
          return res.json(fallbackEvents);
        }
      }
      
      res.status(500).json({ 
        error: "Failed to fetch events",
        message: "Fehler beim Laden der Events. Bitte versuchen Sie es später erneut.",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all categories from events
  app.get("/api/categories", async (req, res) => {
    try {
      // Check cache first
      const cachedCategories = cache.get("categories");
      if (cachedCategories) {
        console.log("Returning cached categories");
        return res.json(cachedCategories);
      }

      // Get events to extract categories
      const eventsResponse = await fetch(`http://localhost:${process.env.PORT || 5000}/api/events`);
      if (!eventsResponse.ok) {
        throw new Error("Failed to fetch events for categories");
      }
      
      const events = await eventsResponse.json();
      
      // Extract unique categories from all events
      const categoriesSet = new Set();
      events.forEach((event: any) => {
        if (event.categories && Array.isArray(event.categories)) {
          event.categories.forEach((cat: string) => categoriesSet.add(cat));
        } else if (event.category) {
          categoriesSet.add(event.category);
        }
      });
      
      const categories = Array.from(categoriesSet).sort();
      
      // Cache categories (60 minutes) and backup (24 hours)
      cache.set("categories", categories, 60 * 60 * 1000); // 60 minutes  
      console.log("Cached categories for 60 minutes");
      
      cache.set("categories-backup", categories, 24 * 60 * 60 * 1000); // 24 hours
      console.log("Long-term cached categories-backup for 24 hours");
      
      res.json(categories);
      
    } catch (error) {
      console.error("❌ Error fetching categories:", error);
      
      // Try fallback cache
      let fallbackCategories = cache.getExpiredCache("categories") || cache.get("categories-backup") || cache.getExpiredCache("categories-backup");
      
      if (fallbackCategories) {
        console.log("Returning cached categories due to error");
        res.set('X-Cache', 'fallback');
        return res.json(fallbackCategories);
      }
      
      res.status(500).json({ 
        error: "Failed to fetch categories",
        message: "Fehler beim Laden der Kategorien",
        details: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all audiences from events
  app.get("/api/audiences", async (req, res) => {
    try {
      // Check cache first (skip if refresh requested)
      const refresh = req.query.refresh === 'true';
      if (!refresh) {
        const cachedAudiences = cache.get("audiences");
        if (cachedAudiences) {
          console.log("Returning cached audiences");
          return res.json(cachedAudiences);
        }
      } else {
        console.log("Refreshing audiences cache...");
      }

      // Try to find the Momente database
      const searchResponse = await notion.search({
        query: "Momente",
        filter: {
          property: "object",
          value: "database"
        }
      });
      
      const momenteDb = searchResponse.results.find((db: any) => 
        db.title && db.title.some((title: any) => 
          title.plain_text && title.plain_text.toLowerCase().includes("momente")
        )
      );
      
      if (!momenteDb) {
        throw new Error("Momente database not found");
      }
      
      // Get database properties to extract audience options
      const databaseResponse = await notion.databases.retrieve({
        database_id: momenteDb.id
      });
      
      const audienceProperty = databaseResponse.properties["Für wen?"];
      let audiences = [];
      
      if (audienceProperty && audienceProperty.type === 'multi_select') {
        audiences = audienceProperty.multi_select.options.map((option: any) => option.name);
      }
      
      // Cache audiences (10 minutes)
      cache.set("audiences", audiences, 10 * 60 * 1000); // 10 minutes
      console.log("Cached audiences for 10 minutes");
      
      res.json(audiences);
      
    } catch (error) {
      console.error("❌ Error fetching audiences:", error);
      
      // Return empty array as fallback for audiences
      res.json([]);
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
        

