import { notion, getNotionDatabases } from "./notion";

async function checkMomenteDatabase() {
  try {
    console.log('Looking for "momente" database...');
    const databases = await getNotionDatabases();
    
    const momenteDb = databases.find(db => {
      const title = db.title?.[0]?.plain_text || '';
      return title.toLowerCase().includes('momente') || 
             title.toLowerCase().includes('moment') ||
             title.toLowerCase() === 'momente';
    });
    
    if (!momenteDb) {
      console.log('Available databases:');
      databases.forEach(db => {
        console.log(`  - ${db.title?.[0]?.plain_text || 'Untitled'} (ID: ${db.id})`);
      });
      return;
    }
    
    console.log('Found momente database:', momenteDb.id);
    
    // Check the database structure
    console.log('\nDatabase properties:');
    for (const [key, value] of Object.entries(momenteDb.properties)) {
      console.log(`  ${key}: ${value.type}`);
    }
    
    // Get all entries
    const entries = await notion.databases.query({
      database_id: momenteDb.id,
      page_size: 100
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
    console.error('Error:', error.message);
  }
}

checkMomenteDatabase().then(() => {
  console.log("\nCheck complete!");
  process.exit(0);
}).catch(error => {
  console.error("Check failed:", error);
  process.exit(1);
});