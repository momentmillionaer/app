import type { Express } from "express";
import { createServer, type Server } from "http";
import { notion, findDatabaseByTitle } from "./notion";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Get all events from Notion database
  app.get("/api/events", async (req, res) => {
    try {
      // Check if Notion is configured
      if (!process.env.NOTION_INTEGRATION_SECRET || !process.env.NOTION_PAGE_URL) {
        return res.json([]);
      }

      // Use the correct Momente database
      const databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";

      const response = await notion.databases.query({
        database_id: databaseId,
        sorts: [
          {
            property: "Datum",
            direction: "ascending"
          }
        ],
        page_size: 100
      });

      const events = response.results.map((page: any) => {
        const properties = page.properties;
        
        // Debug: Log all available properties
        console.log("Available properties:", Object.keys(properties));
        
        // Use categories directly from your Notion database
        const categories = properties.Kategorie?.multi_select?.map((cat: any) => cat.name) || [];
        const primaryCategory = categories.length > 0 ? categories[0] : "Sonstiges";

        // Extract time from datetime if available
        let eventDate = null;
        let eventTime = "";
        if (properties.Datum?.date?.start) {
          const fullDate = new Date(properties.Datum.date.start);
          eventDate = fullDate.toISOString().split('T')[0];
          // If it includes time, extract it
          if (properties.Datum.date.start.includes('T')) {
            eventTime = fullDate.toLocaleTimeString('de-DE', { 
              hour: '2-digit', 
              minute: '2-digit',
              timeZone: 'Europe/Vienna'
            });
          }
        }

        // Extract image URL from file properties - trying different possible names
        let imageUrl = "";
        
        // Try different property names for files/images
        const fileProperties = ['Datein', 'Files', 'Bilder', 'Image', 'Bild', 'Foto', 'Photo'];
        
        for (const propName of fileProperties) {
          if (properties[propName]?.files && properties[propName].files.length > 0) {
            const firstFile = properties[propName].files[0];
            if (firstFile.type === "file") {
              imageUrl = firstFile.file.url;
            } else if (firstFile.type === "external") {
              imageUrl = firstFile.external.url;
            }
            if (imageUrl) {
              console.log(`Found image in property "${propName}":`, imageUrl);
              break;
            }
          }
        }

        return {
          notionId: page.id,
          title: properties.Name?.title?.[0]?.plain_text || "Untitled Event",
          description: properties.Beschreibung?.rich_text?.[0]?.plain_text || "",
          category: primaryCategory,
          location: properties.Ort?.select?.name || "",
          date: eventDate,
          time: eventTime,
          price: properties.Preis?.number ? properties.Preis.number.toString() : "",
          website: properties.URL?.url || "",
          attendees: properties["Für wen?"]?.multi_select?.map((audience: any) => audience.name).join(", ") || "",
          imageUrl: imageUrl
        };
      });

      res.json(events);
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ 
        message: "Failed to fetch events from Notion",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get available categories from Notion database
  app.get("/api/categories", async (req, res) => {
    try {
      if (!process.env.NOTION_INTEGRATION_SECRET || !process.env.NOTION_PAGE_URL) {
        return res.json([]);
      }

      const databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";
      const response = await notion.databases.query({
        database_id: databaseId,
        page_size: 100
      });

      // Extract all unique categories
      const categoriesSet = new Set<string>();
      response.results.forEach((page: any) => {
        const categories = page.properties.Kategorie?.multi_select?.map((cat: any) => cat.name) || [];
        categories.forEach((cat: string) => categoriesSet.add(cat));
      });

      const sortedCategories = Array.from(categoriesSet).sort();
      res.json(sortedCategories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ 
        message: "Failed to fetch categories from Notion"
      });
    }
  });

  // Search and filter events
  app.get("/api/events/search", async (req, res) => {
    try {
      const { q, category, dateFrom, dateTo } = req.query;
      
      const eventsDb = await findDatabaseByTitle("Events");
      
      if (!eventsDb) {
        return res.status(404).json({ 
          message: "Events database not found. Please run setup first." 
        });
      }

      // Build Notion query filters
      const filters: any[] = [];
      
      if (category && category !== "" && category !== "all") {
        filters.push({
          property: "Category",
          select: {
            equals: category
          }
        });
      }

      if (dateFrom) {
        filters.push({
          property: "Date",
          date: {
            on_or_after: dateFrom
          }
        });
      }

      if (dateTo) {
        filters.push({
          property: "Date",
          date: {
            on_or_before: dateTo
          }
        });
      }

      const queryParams: any = {
        database_id: eventsDb.id,
        sorts: [
          {
            property: "Date", 
            direction: "ascending"
          }
        ]
      };

      if (filters.length > 0) {
        queryParams.filter = filters.length === 1 ? filters[0] : {
          and: filters
        };
      }

      const response = await notion.databases.query(queryParams);

      let events = response.results.map((page: any) => {
        const properties = page.properties;
        
        return {
          notionId: page.id,
          title: properties.Title?.title?.[0]?.plain_text || "Untitled Event",
          description: properties.Description?.rich_text?.[0]?.plain_text || "",
          category: properties.Category?.select?.name?.toLowerCase() || "other",
          location: properties.Location?.rich_text?.[0]?.plain_text || "",
          date: properties.Date?.date?.start || null,
          time: properties.Time?.rich_text?.[0]?.plain_text || "",
          price: properties.Price?.rich_text?.[0]?.plain_text || "",
          website: properties.Website?.url || "",
          attendees: properties.Attendees?.rich_text?.[0]?.plain_text || "",
        };
      });

      // Client-side text search (since Notion doesn't support full-text search)
      if (q && typeof q === "string") {
        const searchTerm = q.toLowerCase();
        events = events.filter(event => 
          event.title.toLowerCase().includes(searchTerm) ||
          event.description.toLowerCase().includes(searchTerm) ||
          event.location.toLowerCase().includes(searchTerm)
        );
      }

      res.json(events);
    } catch (error) {
      console.error("Error searching events:", error);
      res.status(500).json({ 
        message: "Failed to search events",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Get all available audience values from Notion database
  app.get("/api/audiences", async (req, res) => {
    try {
      if (!process.env.NOTION_INTEGRATION_SECRET || !process.env.NOTION_PAGE_URL) {
        return res.json([]);
      }

      const databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";

      const response = await notion.databases.query({
        database_id: databaseId,
        page_size: 100
      });

      const audienceSet = new Set<string>();
      
      response.results.forEach((page: any) => {
        const properties = page.properties;
        const audiences = properties["Für wen?"]?.multi_select?.map((audience: any) => audience.name) || [];
        audiences.forEach((audience: string) => audienceSet.add(audience));
      });

      const uniqueAudiences = Array.from(audienceSet).sort();
      res.json(uniqueAudiences);
    } catch (error) {
      console.error("Error fetching audiences:", error);
      res.status(500).json({ 
        message: "Failed to fetch audiences from Notion",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
