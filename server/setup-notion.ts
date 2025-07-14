import { notion, NOTION_PAGE_ID, createDatabaseIfNotExists } from "./notion";

// Environment variables validation
if (!process.env.NOTION_INTEGRATION_SECRET) {
    throw new Error("NOTION_INTEGRATION_SECRET is not defined. Please add it to your environment variables.");
}

if (!process.env.NOTION_PAGE_URL) {
    throw new Error("NOTION_PAGE_URL is not defined. Please add it to your environment variables.");
}

async function setupNotionDatabases() {
    await createDatabaseIfNotExists("Events", {
        // Title property (required for all databases)
        Title: {
            title: {}
        },
        Description: {
            rich_text: {}
        },
        Category: {
            select: {
                options: [
                    { name: "Musik", color: "blue" },
                    { name: "Theater", color: "green" },
                    { name: "Kunst", color: "purple" },
                    { name: "Sport", color: "orange" },
                    { name: "Food & Drink", color: "red" },
                    { name: "Workshop", color: "yellow" },
                    { name: "Festival", color: "pink" },
                    { name: "Sonstiges", color: "gray" }
                ]
            }
        },
        Location: {
            rich_text: {}
        },
        Date: {
            date: {}
        },
        Time: {
            rich_text: {}
        },
        Price: {
            rich_text: {}
        },
        Website: {
            url: {}
        },
        Attendees: {
            rich_text: {}
        }
    });
}

// Run the setup
setupNotionDatabases().then(() => {
    console.log("Notion database setup complete!");
    process.exit(0);
}).catch(error => {
    console.error("Setup failed:", error);
    process.exit(1);
});
