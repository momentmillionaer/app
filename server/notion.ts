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