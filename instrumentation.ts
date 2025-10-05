/**
 * Instrumentation file for Next.js
 * This runs once when the server starts
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // Only import and run cron in Node.js runtime (not Edge)
    const { initializeCronJobs } = await import('./lib/jobs/cronJobs');
    initializeCronJobs();
  }
}

