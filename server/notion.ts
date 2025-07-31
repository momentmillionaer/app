import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
    auth: process.env.NOTION_INTEGRATION_SECRET!,
});

// Extract the page ID from the Notion page URL
function extractPageIdFromUrl(pageUrl: string): string {
    // For URLs like https://momentmillionaer.notion.site/?v=22dfd1375c6e807d8fa4000cc0b4eda1
    // we need to extract the page ID from the subdomain or use a different approach
    
    // Try different patterns for Notion URLs
    const patterns = [
        /([a-f0-9]{32})(?:[?#]|$)/i,
        /([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
        /\/([a-f0-9]{32})/i,
        /\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i,
        /v=([a-f0-9]{32})/i,
        /v=([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})/i
    ];
    
    for (const pattern of patterns) {
        const match = pageUrl.match(pattern);
        if (match && match[1]) {
            return match[1].replace(/-/g, '');
        }
    }

    // For notion.site URLs, try to extract from subdomain
    const subdomainMatch = pageUrl.match(/https:\/\/([^.]+)\.notion\.site/);
    if (subdomainMatch) {
        // This is a workspace URL, we need to find the actual page ID
        // For now, let's return null and handle this in the database search
        return null;
    }

    throw Error(`Failed to extract page ID from URL: ${pageUrl}`);
}

export const NOTION_PAGE_ID = process.env.NOTION_PAGE_URL ? extractPageIdFromUrl(process.env.NOTION_PAGE_URL) : null;

/**
 * Lists all child databases contained within NOTION_PAGE_ID
 * @returns {Promise<Array<{id: string, title: string}>>} - Array of database objects with id and title
 */
export async function getNotionDatabases() {
    // First, try to search for all accessible databases
    try {
        const response = await notion.search({
            filter: {
                property: "object",
                value: "database"
            },
            page_size: 100
        });

        return response.results;
    } catch (error) {
        console.error("Error searching for databases:", error);
        
        // If we have a page ID, try to get child databases as fallback
        if (NOTION_PAGE_ID) {
            try {
                const childDatabases = [];
                let hasMore = true;
                let startCursor: string | undefined = undefined;

                while (hasMore) {
                    const response = await notion.blocks.children.list({
                        block_id: NOTION_PAGE_ID,
                        start_cursor: startCursor,
                    });

                    // Process the results
                    for (const block of response.results) {
                        // Check if the block is a child database
                        if (block.type === "child_database") {
                            const databaseId = block.id;

                            // Retrieve the database title
                            try {
                                const databaseInfo = await notion.databases.retrieve({
                                    database_id: databaseId,
                                });

                                // Add the database to our list
                                childDatabases.push(databaseInfo);
                            } catch (error) {
                                console.error(`Error retrieving database ${databaseId}:`, error);
                            }
                        }
                    }

                    // Check if there are more results to fetch
                    hasMore = response.has_more;
                    startCursor = response.next_cursor || undefined;
                }

                return childDatabases;
            } catch (error) {
                console.error("Error listing child databases:", error);
            }
        }
        
        throw error;
    }
}

// Find get a Notion database with the matching title
export async function findDatabaseByTitle(title: string) {
    const databases = await getNotionDatabases();

    for (const db of databases) {
        if (db.title && Array.isArray(db.title) && db.title.length > 0) {
            const dbTitle = db.title[0]?.plain_text?.toLowerCase() || "";
            if (dbTitle === title.toLowerCase()) {
                return db;
            }
        }
    }

    return null;
}

// Create a new database if one with a matching title does not exist
export async function createDatabaseIfNotExists(title, properties) {
    const existingDb = await findDatabaseByTitle(title);
    if (existingDb) {
        return existingDb;
    }
    if (!NOTION_PAGE_ID) {
        throw new Error("NOTION_PAGE_URL environment variable is not set");
    }
    
    return await notion.databases.create({
        parent: {
            type: "page_id",
            page_id: NOTION_PAGE_ID
        },
        title: [
            {
                type: "text",
                text: {
                    content: title
                }
            }
        ],
        properties
    });
}


// Get all events from the Notion events database with comprehensive field mapping
export async function getEventsFromNotion(databaseId: string) {
    try {
        const allEvents: any[] = [];
        let hasMore = true;
        let startCursor: string | undefined = undefined;

        // Paginate through all events
        while (hasMore) {
            const response = await notion.databases.query({
                database_id: databaseId,
                start_cursor: startCursor,
                page_size: 100,
            });

            allEvents.push(...response.results);
            hasMore = response.has_more;
            startCursor = response.next_cursor || undefined;
        }

        return allEvents.map((page: any) => {
            const properties = page.properties;

            // Extract event date with proper timezone handling
            const eventDate = properties.Datum?.date?.start
                ? new Date(properties.Datum.date.start)
                : new Date();

            const endDate = properties.Datum?.date?.end
                ? new Date(properties.Datum.date.end)
                : null;

            // Extract image URLs from files property - improved filtering
            const imageUrls = properties.Dateien?.files?.map((file: any) => {
                let url = null;
                if (file.type === 'external') {
                    url = file.external.url;
                } else if (file.type === 'file') {
                    url = file.file.url;
                }
                
                if (url) {
                    const lowerUrl = url.toLowerCase();
                    
                    // Exclude obvious document files first
                    const isDocument = lowerUrl.includes('.pdf') || lowerUrl.includes('.doc') || 
                                     lowerUrl.includes('.docx') || lowerUrl.includes('.txt') ||
                                     lowerUrl.includes('.zip') || lowerUrl.includes('.ppt');
                    
                    if (isDocument) {
                        return null;
                    }
                    
                    // Accept image files or trusted hosting domains
                    const hasImageExtension = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff)$/i);
                    const isTrustedHost = lowerUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
                                        lowerUrl.includes('images.unsplash.com') ||
                                        lowerUrl.includes('imgur.com') ||
                                        lowerUrl.includes('cloudinary.com') ||
                                        lowerUrl.includes('notion.so');
                    
                    return (hasImageExtension || isTrustedHost) ? url : null;
                }
                return null;
            }).filter(Boolean) || [];

            // Get the first image as main image
            const imageUrl = imageUrls.length > 0 ? imageUrls[0] : null;

            // Extract document URLs (PDFs, etc.) - exclude images more strictly
            const documentsUrls = properties.Dateien?.files?.filter((file: any) => {
                const url = file.type === 'external' ? file.external.url : file.file?.url;
                if (!url) return false;
                
                const lowerUrl = url.toLowerCase();
                // Check for document file extensions
                const isDocument = lowerUrl.includes('.pdf') || lowerUrl.includes('.doc') || 
                                 lowerUrl.includes('.docx') || lowerUrl.includes('.txt') || 
                                 lowerUrl.includes('.zip') || lowerUrl.includes('.ppt') ||
                                 lowerUrl.includes('.pptx') || lowerUrl.includes('.xls') ||
                                 lowerUrl.includes('.xlsx');
                
                // Make sure it's NOT an image
                const isImage = lowerUrl.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i) ||
                              lowerUrl.includes('prod-files-secure.s3.us-west-2.amazonaws.com') ||
                              lowerUrl.includes('images.unsplash.com');
                
                return isDocument && !isImage;
            }).map((file: any) => 
                file.type === 'external' ? file.external.url : file.file.url
            ) || [];

            // Extract categories as array
            const categories = properties.Kategorie?.multi_select?.map((cat: any) => cat.name) || [];
            const mainCategory = categories.length > 0 ? categories[0] : "Andere";

            return {
                notionId: page.id,
                title: properties.Name?.title?.[0]?.plain_text || "Untitled Event",
                subtitle: properties.Untertitel?.rich_text?.[0]?.plain_text || null,
                description: properties.Beschreibung?.rich_text?.[0]?.plain_text || "",
                category: mainCategory,
                categories: categories,
                location: properties.Ort?.rich_text?.[0]?.plain_text || "",
                date: eventDate,
                endDate: endDate,
                time: properties.Zeit?.rich_text?.[0]?.plain_text || "",
                price: (() => {
                    // Try multiple field types for price
                    let priceValue = null;
                    
                    // Try as number field
                    if (properties.Preis?.number !== null && properties.Preis?.number !== undefined) {
                        priceValue = properties.Preis.number.toString();
                    }
                    // Try as rich text field
                    else if (properties.Preis?.rich_text?.[0]?.plain_text) {
                        priceValue = properties.Preis.rich_text[0].plain_text;
                    }
                    // Try as title field
                    else if (properties.Preis?.title?.[0]?.plain_text) {
                        priceValue = properties.Preis.title[0].plain_text;
                    }
                    // Try as formula field
                    else if (properties.Preis?.formula?.number !== null && properties.Preis?.formula?.number !== undefined) {
                        priceValue = properties.Preis.formula.number.toString();
                    }
                    // Try other common price field names
                    else if (properties.Price?.number !== null && properties.Price?.number !== undefined) {
                        priceValue = properties.Price.number.toString();
                    }
                    else if (properties.Kosten?.number !== null && properties.Kosten?.number !== undefined) {
                        priceValue = properties.Kosten.number.toString();
                    }
                    
                    if (!priceValue || priceValue.trim() === '') {
                        return "0";
                    }
                    
                    // Clean and parse price - remove everything except numbers, dots, and commas
                    const cleanPrice = priceValue.replace(/[^\d.,]/g, '');
                    
                    if (cleanPrice && cleanPrice !== '') {
                        // Convert comma to dot for proper parsing
                        const normalizedPrice = cleanPrice.replace(',', '.');
                        const parsedPrice = parseFloat(normalizedPrice);
                        
                        if (!isNaN(parsedPrice)) {
                            // Format as string without decimals if it's a whole number
                            return parsedPrice % 1 === 0 ? parsedPrice.toString() : parsedPrice.toFixed(2);
                        }
                    }
                    
                    // Check for free keywords
                    if (priceValue.toLowerCase().includes('kostenlos') || 
                        priceValue.toLowerCase().includes('gratis') || 
                        priceValue.toLowerCase().includes('frei')) {
                        return "0";
                    }
                    
                    return "0";
                })(),
                website: properties.Website?.url || properties.URL?.url || null,
                ticketUrl: properties.Tickets?.url || properties.Ticket?.url || properties["Ticket URL"]?.url || null, // Add ticket URL mapping
                organizer: properties.Veranstalter?.rich_text?.[0]?.plain_text || "",
                attendees: properties["Für wen?"]?.multi_select?.map((aud: any) => aud.name).join(", ") || "",
                imageUrl: imageUrl,
                documentsUrls: documentsUrls,
                isFavorite: properties["Conni's Favorites"]?.checkbox || false,
            };
        });
    } catch (error) {
        console.error("Error fetching events from Notion:", error);
        throw new Error("Failed to fetch events from Notion");
    }
}

// Example function to Get all tasks from the Notion database
export async function getTasks(tasksDatabaseId: string) {
    try {
        const response = await notion.databases.query({
            database_id: tasksDatabaseId,
        });

        return response.results.map((page: any) => {
            const properties = page.properties;

            const dueDate = properties.DueDate?.date?.start
                ? new Date(properties.DueDate.date.start)
                : null;

            const completedAt = properties.CompletedAt?.date?.start
                ? new Date(properties.CompletedAt.date.start)
                : null;

            return {
                notionId: page.id,
                title: properties.Title?.title?.[0]?.plain_text || "Untitled Task",
                description: properties.Description?.rich_text?.[0]?.plain_text || "",
                section: properties.Section?.select?.name || "Uncategorized",
                isCompleted: properties.Completed?.checkbox || false,
                dueDate,
                completedAt,
                priority: properties.Priority?.select?.name || null,
                status: properties.Status?.status?.name || null,
            };
        });
    } catch (error) {
        console.error("Error fetching tasks from Notion:", error);
        throw new Error("Failed to fetch tasks from Notion");
    }
}