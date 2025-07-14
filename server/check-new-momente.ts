import { notion } from "./notion";

async function checkNewMomenteDatabase() {
  try {
    const databaseId = "22dfd137-5c6e-8058-917a-cbbedff172a3";
    
    console.log('Checking new Momente database...');
    
    const dbInfo = await notion.databases.retrieve({
      database_id: databaseId
    });
    
    console.log('Database found:', dbInfo.title?.[0]?.plain_text || 'Untitled');
    
    console.log('\nDatabase properties:');
    for (const [key, value] of Object.entries(dbInfo.properties)) {
      console.log(`  ${key}: ${value.type}`);
    }
    
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
    console.error('Error:', error.message);
  }
}

checkNewMomenteDatabase().then(() => {
  console.log("\nCheck complete!");
  process.exit(0);
}).catch(error => {
  console.error("Check failed:", error);
  process.exit(1);
});