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
        console.log("Notion credentials not configured");
        return res.json([]);
      }

      // Try to find the Momente database
      let databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";
      
      // First try the hardcoded database ID
      let eventsResponse;
      try {
        eventsResponse = await notion.databases.query({
          database_id: databaseId,
          sorts: [
            {
              property: "Datum",
              direction: "ascending"
            }
          ],
          page_size: 100
        });
      } catch (dbError) {
        console.log("Hardcoded database ID failed, trying to find Momente database...");
        // If hardcoded ID fails, try to find the database by title
        const momenteDb = await findDatabaseByTitle("Momente");
        if (!momenteDb) {
          console.log("Could not find Momente database");
          return res.json([]);
        }
        databaseId = momenteDb.id;
        eventsResponse = await notion.databases.query({
          database_id: databaseId,
          sorts: [
            {
              property: "Datum",
              direction: "ascending"
            }
          ],
          page_size: 100
        });
      }

      const eventsWithRelations = await Promise.all(eventsResponse.results.map(async (page: any) => {
        const properties = page.properties;
        

        
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

        // Extract image URL from "Dateien" property with better filtering
        let imageUrl = "";
        if (properties.Dateien?.files && properties.Dateien.files.length > 0) {
          // Find first actual image file (not PDF or other documents)
          for (const file of properties.Dateien.files) {
            let url = "";
            if (file.type === "file") {
              url = file.file.url;
            } else if (file.type === "external") {
              url = file.external.url;
            }
            
            // More robust image detection
            if (url) {
              const lowerUrl = url.toLowerCase();
              const isImageFile = lowerUrl.includes('.jpg') || lowerUrl.includes('.jpeg') || 
                                lowerUrl.includes('.png') || lowerUrl.includes('.webp') || 
                                lowerUrl.includes('.gif') || lowerUrl.includes('.svg');
              
              // Also check for common image hosting patterns
              const isImageHost = lowerUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
                                lowerUrl.includes('images.unsplash.com') ||
                                lowerUrl.includes('imgur.com') ||
                                lowerUrl.includes('cloudinary.com');
              
              // Exclude obvious non-image files
              const isNonImage = lowerUrl.includes('.pdf') || lowerUrl.includes('.doc') || 
                               lowerUrl.includes('.txt') || lowerUrl.includes('.zip');
              
              if ((isImageFile || isImageHost) && !isNonImage) {
                imageUrl = url;
                break; // Use first valid image found
              }
            }
          }
        }

        return {
          notionId: page.id,
          title: properties.Name?.title?.[0]?.plain_text || "Untitled Event",
          subtitle: properties.Untertitel?.rich_text?.[0]?.plain_text || "",
          description: properties.Beschreibung?.rich_text?.[0]?.plain_text || "",
          category: primaryCategory,
          location: properties.Ort?.select?.name || "",
          date: eventDate,
          time: eventTime,
          price: properties.Preis?.number ? properties.Preis.number.toString() : "",
          website: properties.URL?.url || "",
          organizer: await (async () => {
            // Handle relation field for organizer
            const organizerRelation = properties["Veranstalter / Brand"];
            if (organizerRelation?.relation && organizerRelation.relation.length > 0) {
              try {
                // Get the first related page
                const relatedPageId = organizerRelation.relation[0].id;
                const relatedPage = await notion.pages.retrieve({ page_id: relatedPageId });
                
                // Try to get the title from the related page properties
                if (relatedPage.properties) {
                  // Look for title property first
                  for (const [key, prop] of Object.entries(relatedPage.properties)) {
                    if (prop.type === 'title' && prop.title && prop.title.length > 0) {
                      const title = prop.title[0].plain_text;
                      if (title && title.trim()) {
                        return title.trim();
                      }
                    }
                  }
                  
                  // Fallback: look for rich_text properties
                  for (const [key, prop] of Object.entries(relatedPage.properties)) {
                    if (prop.type === 'rich_text' && prop.rich_text && prop.rich_text.length > 0) {
                      const text = prop.rich_text[0].plain_text;
                      if (text && text.trim()) {
                        return text.trim();
                      }
                    }
                  }
                  
                  // Fallback: look for select properties  
                  for (const [key, prop] of Object.entries(relatedPage.properties)) {
                    if (prop.type === 'select' && prop.select && prop.select.name) {
                      return prop.select.name;
                    }
                  }
                }
              } catch (error) {
                // If relation page is not accessible, derive organizer from event details
                const eventTitle = properties.Name?.title?.[0]?.plain_text || "";
                const eventLocation = properties.Ort?.select?.name || "";
                
                // Smart fallbacks based on location or title
                if (eventLocation.toLowerCase().includes("schlossberg")) {
                  return "Schlossberg Graz";
                } else if (eventLocation.toLowerCase().includes("mur")) {
                  return "Mur Events";
                } else if (eventTitle.toLowerCase().includes("brunch")) {
                  return "Gastronomie Partner";
                } else if (eventTitle.toLowerCase().includes("konzert") || eventTitle.toLowerCase().includes("musik")) {
                  return "Musik Veranstalter";
                } else if (eventTitle.toLowerCase().includes("kunst") || eventTitle.toLowerCase().includes("kultur")) {
                  return "Kultur Graz";
                }
              }
            }
            return "Event Partner";
          })(),
          attendees: properties["Für wen?"]?.multi_select?.map((audience: any) => audience.name).join(", ") || "",
          imageUrl: imageUrl
        };
      }));

      res.json(eventsWithRelations);
    } catch (error) {
      console.error("Error fetching events:", error);
      console.error("Error details:", error.message);
      if (error.code === 'object_not_found') {
        console.log("Database not found, returning empty array");
        return res.json([]);
      }
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

      // Try to find the Momente database
      let databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";
      
      // First try the hardcoded database ID
      let response;
      try {
        response = await notion.databases.query({
          database_id: databaseId,
          page_size: 100
        });
      } catch (dbError) {
        console.log("Hardcoded database ID failed for categories, trying to find Momente database...");
        // If hardcoded ID fails, try to find the database by title
        const momenteDb = await findDatabaseByTitle("Momente");
        if (!momenteDb) {
          console.log("Could not find Momente database for categories");
          return res.json([]);
        }
        databaseId = momenteDb.id;
        response = await notion.databases.query({
          database_id: databaseId,
          page_size: 100
        });
      }

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
      console.error("Error details:", error.message);
      if (error.code === 'object_not_found') {
        console.log("Database not found, returning empty array");
        return res.json([]);
      }
      res.status(500).json({ 
        message: "Failed to fetch categories from Notion",
        error: error instanceof Error ? error.message : "Unknown error"
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

      // Try to find the Momente database
      let databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";
      
      // First try the hardcoded database ID
      let response;
      try {
        response = await notion.databases.query({
          database_id: databaseId,
          page_size: 100
        });
      } catch (dbError) {
        console.log("Hardcoded database ID failed for audiences, trying to find Momente database...");
        // If hardcoded ID fails, try to find the database by title
        const momenteDb = await findDatabaseByTitle("Momente");
        if (!momenteDb) {
          console.log("Could not find Momente database for audiences");
          return res.json([]);
        }
        databaseId = momenteDb.id;
        response = await notion.databases.query({
          database_id: databaseId,
          page_size: 100
        });
      }

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
      console.error("Error details:", error.message);
      if (error.code === 'object_not_found') {
        console.log("Database not found for audiences, returning empty array");
        return res.json([]);
      }
      res.status(500).json({ 
        message: "Failed to fetch audiences from Notion",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Sync check endpoint
  app.get("/api/sync-check", async (req, res) => {
    try {
      const syncResult = await import("./sync-check").then(module => module.checkNotionEventsSync());
      res.json(syncResult);
    } catch (error) {
      console.error("Error in sync check:", error);
      res.status(500).json({ 
        message: "Sync check failed",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
