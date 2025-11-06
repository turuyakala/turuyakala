/**
 * Environment Variables Validation
 * Validates required environment variables at startup
 */

const requiredEnvVars = {
  DATABASE_URL: process.env.DATABASE_URL,
  DIRECT_URL: process.env.DIRECT_URL,
  NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
} as const;

const optionalEnvVars = {
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  CRON_SECRET: process.env.CRON_SECRET,
  NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  NODE_ENV: process.env.NODE_ENV || 'development',
} as const;

/**
 * Validate required environment variables
 * Throws error if any required variable is missing
 */
export function validateEnv() {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      `Please check your .env file or environment configuration.`
    );
  }

  // Warn about optional but recommended variables
  const warnings: string[] = [];

  if (!optionalEnvVars.ENCRYPTION_KEY) {
    warnings.push('ENCRYPTION_KEY: Required for supplier integration');
  }

  if (!optionalEnvVars.CRON_SECRET && optionalEnvVars.NODE_ENV === 'production') {
    warnings.push('CRON_SECRET: Recommended for production (cron endpoint security)');
  }

  if (warnings.length > 0 && optionalEnvVars.NODE_ENV === 'development') {
    console.warn('⚠️  Environment variable warnings:');
    warnings.forEach(w => console.warn(`   - ${w}`));
  }

  return {
    required: requiredEnvVars,
    optional: optionalEnvVars,
  };
}

/**
 * Get validated environment variables
 * Use this instead of process.env directly
 */
export const env = {
  ...requiredEnvVars,
  ...optionalEnvVars,
} as const;

// Validate on module load (only in production or when explicitly enabled)
if (process.env.NODE_ENV === 'production' || process.env.VALIDATE_ENV === 'true') {
  try {
    validateEnv();
  } catch (error) {
    console.error('❌ Environment validation failed:', error);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
}

