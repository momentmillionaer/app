import { notion } from "./notion";

// Function to check and log current events from Notion
export async function checkNotionEventsSync() {
  try {
    console.log("🔄 Checking Notion events sync...");
    
    // Check if Notion is configured
    if (!process.env.NOTION_INTEGRATION_SECRET || !process.env.NOTION_PAGE_URL) {
      console.log("❌ Notion not configured - missing secrets");
      return;
    }

    // Use the correct Momente database
    const databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";

    // Get all events from Notion
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

    console.log(`📊 Found ${response.results.length} events in Notion database`);

    // Get current date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count future events
    let futureEvents = 0;
    let pastEvents = 0;
    let todayEvents = 0;

    response.results.forEach((page: any) => {
      const properties = page.properties;
      
      if (properties.Datum?.date?.start) {
        const eventDate = new Date(properties.Datum.date.start);
        eventDate.setHours(0, 0, 0, 0);
        
        if (eventDate > today) {
          futureEvents++;
        } else if (eventDate < today) {
          pastEvents++;
        } else {
          todayEvents++;
        }
      }
    });

    console.log(`📅 Events breakdown:`);
    console.log(`   - Future events: ${futureEvents}`);
    console.log(`   - Today's events: ${todayEvents}`);
    console.log(`   - Past events: ${pastEvents}`);

    // Log recent events for verification
    const recentEvents = response.results.slice(0, 5);
    console.log(`\n📝 Recent events (first 5):`);
    recentEvents.forEach((page: any, index) => {
      const properties = page.properties;
      const title = properties.Name?.title?.[0]?.plain_text || "Untitled";
      const date = properties.Datum?.date?.start || "No date";
      const category = properties.Kategorie?.multi_select?.map((cat: any) => cat.name).join(", ") || "No category";
      
      console.log(`   ${index + 1}. ${title}`);
      console.log(`      Date: ${date}`);
      console.log(`      Category: ${category}`);
      console.log(`      ID: ${page.id}`);
    });

    console.log(`\n✅ Sync check completed at ${new Date().toISOString()}`);
    
    return {
      total: response.results.length,
      future: futureEvents,
      today: todayEvents,
      past: pastEvents,
      lastChecked: new Date().toISOString()
    };

  } catch (error) {
    console.error("❌ Error checking Notion events sync:", error);
    return null;
  }
}

// Run sync check if called directly (removed process.exit for deployment compatibility)
if (import.meta.url === `file://${process.argv[1]}`) {
  checkNotionEventsSync().then(() => {
    console.log("✅ Sync check completed - keeping process alive");
  });
}