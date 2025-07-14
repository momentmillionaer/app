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

      // Use the Momentmillionär Entries database (accessible)
      const databaseId = "22ffd137-5c6e-8043-ad8e-efd20cbb70c1";

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
        
        // Map categories from your database to frontend format
        const categories = properties.Kategorie?.multi_select?.map((cat: any) => cat.name) || [];
        const primaryCategory = categories.length > 0 ? mapCategoryToFrontend(categories[0]) : "other";

        return {
          notionId: page.id,
          title: properties.Eventname?.title?.[0]?.plain_text || "Untitled Event",
          description: properties.Beschreibung?.rich_text?.[0]?.plain_text || "",
          category: primaryCategory,
          location: properties.Ort?.rich_text?.[0]?.plain_text || "",
          date: properties.Datum?.date?.start || null,
          time: properties.Uhrzeit?.rich_text?.[0]?.plain_text || "",
          price: properties.Preis?.number ? properties.Preis.number.toString() : "",
          website: properties.URL?.url || "",
          attendees: "", // Not tracked in your database
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

  function mapCategoryToFrontend(category: string): string {
    const mapping: { [key: string]: string } = {
      "Essen": "food",
      "Frühshoppen": "food",
      "Party": "musik",
      "Sport": "sport",
      "Musik": "musik",
      "Kreativ": "kunst",
      "Workshop / Input": "workshop",
      "Natur": "other"
    };
    return mapping[category] || "other";
  }

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

  const httpServer = createServer(app);
  return httpServer;
}
