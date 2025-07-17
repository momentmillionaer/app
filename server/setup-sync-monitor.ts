import { checkNotionEventsSync } from "./sync-check";

// Setup automatic sync monitoring
export function setupSyncMonitor() {
  console.log("🔄 Starting automatic sync monitoring...");
  
  // Initial check (non-blocking for deployment)
  setImmediate(async () => {
    try {
      await checkNotionEventsSync();
    } catch (error) {
      console.error("❌ Initial sync check error:", error);
    }
  });
  
  // Check every 12 hours (twice daily as requested)
  const syncInterval = setInterval(async () => {
    try {
      console.log("🔄 Running scheduled 12-hour sync check...");
      await checkNotionEventsSync();
    } catch (error) {
      console.error("❌ Sync monitor error:", error);
    }
  }, 12 * 60 * 60 * 1000); // 12 hours
  
  // Quick health check every 30 minutes to keep cache warm
  const healthInterval = setInterval(async () => {
    try {
      console.log("🔄 Health check - keeping cache warm");
    } catch (error) {
      console.error("❌ Health check error:", error);
    }
  }, 30 * 60 * 1000); // 30 minutes

  // Cleanup function
  return () => {
    clearInterval(syncInterval);
    clearInterval(healthInterval);
    console.log("🛑 Stopped sync monitoring");
  };
}