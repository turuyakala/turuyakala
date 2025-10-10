import cron from 'node-cron';
import { syncAllSuppliers } from './syncService';
import { cleanupExpiredOffers } from './cleanupService';

/**
 * Initialize cron jobs (for development/self-hosted environments)
 */
export function initializeCronJobs() {
  // Only run cron jobs in development or if explicitly enabled
  const enableCron = process.env.ENABLE_CRON === 'true' || process.env.NODE_ENV === 'development';

  if (!enableCron) {
    console.log('⏸️  Cron jobs disabled (use cloud cron service in production)');
    return;
  }

  console.log('🚀 Initializing cron jobs...');

  // Every 15 minutes: Sync active suppliers
  cron.schedule('*/15 * * * *', async () => {
    console.log('⏰ Cron: Starting scheduled sync...');
    try {
      await syncAllSuppliers();
    } catch (error) {
      console.error('❌ Cron: Sync failed:', error);
    }
  });

  // Every hour: Cleanup expired and sold out offers
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Cron: Starting cleanup...');
    try {
      await cleanupExpiredOffers();
    } catch (error) {
      console.error('❌ Cron: Cleanup failed:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
  console.log('📅 Schedules:');
  console.log('   - Sync: */15 * * * * (every 15 minutes)');
  console.log('   - Cleanup: 0 * * * * (every hour)');
}

/**
 * Stop all cron jobs (for graceful shutdown)
 */
export function stopCronJobs() {
  cron.getTasks().forEach(task => task.stop());
  console.log('🛑 Cron jobs stopped');
}

