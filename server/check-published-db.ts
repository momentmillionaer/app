import { notion } from "./notion";

async function checkPublishedDatabase() {
  try {
    console.log('Checking published database structure...');
    
    // Try the view ID from the public URL
    const databaseId = "22ffd1375c6e80bdaddc000c4f4752bc";
    
    try {
      // First try to get the database info
      const dbInfo = await notion.databases.retrieve({
        database_id: databaseId
      });
      
      console.log('Database found:', dbInfo.title?.[0]?.plain_text || 'Untitled');
      console.log('Database ID:', databaseId);
      
      console.log('\nDatabase properties:');
      for (const [key, value] of Object.entries(dbInfo.properties)) {
        console.log(`  ${key}: ${value.type}`);
      }
      
      // Get entries
      const entries = await notion.databases.query({
        database_id: databaseId,
        page_size: 20
      });
      
      console.log('\nEntries found:', entries.results.length);
      
      entries.results.slice(0, 5).forEach((entry, index) => {
        console.log(`\nEntry ${index + 1}:`);
        for (const [key, value] of Object.entries(entry.properties)) {
          let displayValue = 'No value';
          
          switch (value.type) {
            case 'title':
              displayValue = value.title?.[0]?.plain_text || 'No title';
              break;
            case 'rich_text':
              displayValue = value.rich_text?.[0]?.plain_text || 'No text';
              break;
            case 'select':
              displayValue = value.select?.name || 'No selection';
              break;
            case 'multi_select':
              displayValue = value.multi_select?.map(s => s.name).join(', ') || 'No selections';
              break;
            case 'date':
              displayValue = value.date?.start || 'No date';
              break;
            case 'url':
              displayValue = value.url || 'No URL';
              break;
            case 'number':
              displayValue = value.number?.toString() || 'No number';
              break;
            case 'checkbox':
              displayValue = value.checkbox ? 'Yes' : 'No';
              break;
            default:
              displayValue = `${value.type} field`;
          }
          
          console.log(`  ${key}: ${displayValue}`);
        }
      });
      
    } catch (error) {
      console.error('Error accessing database:', error.message);
      
      // If that doesn't work, let's search for databases with "momente" in the name
      console.log('\nSearching for databases with "momente"...');
      
      const response = await notion.search({
        filter: {
          property: "object",
          value: "database"
        },
        page_size: 100
      });
      
      console.log('All accessible databases:');
      response.results.forEach(db => {
        console.log(`  - ${db.title?.[0]?.plain_text || 'Untitled'} (ID: ${db.id})`);
      });
      
      const momenteDbs = response.results.filter(db => {
        const title = db.title?.[0]?.plain_text || '';
        return title.toLowerCase().includes('momente') || 
               title.toLowerCase().includes('moment') ||
               title.toLowerCase().includes('events') ||
               title.toLowerCase() === 'momente';
      });
      
      console.log('Found databases with "momente":', momenteDbs.length);
      momenteDbs.forEach(db => {
        console.log(`  - ${db.title?.[0]?.plain_text || 'Untitled'} (ID: ${db.id})`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

checkPublishedDatabase().then(() => {
  console.log("\nCheck complete!");
  process.exit(0);
}).catch(error => {
  console.error("Check failed:", error);
  process.exit(1);
});