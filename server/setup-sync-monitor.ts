import { checkNotionEventsSync } from "./sync-check";

// Setup automatic sync monitoring
export function setupSyncMonitor() {
  console.log("🔄 Starting automatic sync monitoring...");
  
  // Initial check
  checkNotionEventsSync();
  
  // Check every 5 minutes
  const interval = setInterval(async () => {
    try {
      await checkNotionEventsSync();
    } catch (error) {
      console.error("❌ Sync monitor error:", error);
    }
  }, 5 * 60 * 1000); // 5 minutes

  // Cleanup function
  return () => {
    clearInterval(interval);
    console.log("🛑 Stopped sync monitoring");
  };
}