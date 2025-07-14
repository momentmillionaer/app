import { notion, getNotionDatabases } from "./notion";

async function checkDatabases() {
  try {
    console.log('Checking all databases in your Notion page...');
    const databases = await getNotionDatabases();
    
    console.log('Found databases:', databases.length);
    for (const db of databases) {
      console.log('Database:', db.title?.[0]?.plain_text || 'Untitled', 'ID:', db.id);
      
      // Check entries in each database
      const entries = await notion.databases.query({
        database_id: db.id,
        page_size: 100
      });
      console.log('  Entries:', entries.results.length);
      
      if (entries.results.length > 0) {
        console.log('  Sample entries:');
        entries.results.slice(0, 5).forEach(entry => {
          const title = entry.properties?.Title?.title?.[0]?.plain_text || 
                       entry.properties?.Name?.title?.[0]?.plain_text || 
                       'No title';
          console.log('    -', title);
        });
      }
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkDatabases().then(() => {
  console.log("Database check complete!");
  process.exit(0);
}).catch(error => {
  console.error("Database check failed:", error);
  process.exit(1);
});