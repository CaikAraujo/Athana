/**
 * Central, validated access to environment configuration.
 * Nothing here has a secret default: missing production secrets fail fast.
 */
const isProd = process.env.NODE_ENV === 'production';
const isBuild = process.env.NEXT_PHASE === 'phase-production-build';

function required(name: string, devFallback?: string): string {
  const v = process.env[name];
  if (v) return v;
  if ((!isProd || isBuild) && devFallback !== undefined) return devFallback;
  throw new Error(`Missing required environment variable ${name}`);
}

export const env = {
  isProd,
  get appUrl() {
    return (process.env.APP_URL || 'http://localhost:3000').replace(/\/$/, '');
  },
  get sessionSecret() {
    const s = required('SESSION_SECRET', 'dev-only-secret-change-me-0123456789abcdef');
    if (isProd && !isBuild && (s.length < 32 || s.startsWith('dev-only'))) {
      throw new Error('SESSION_SECRET must be a random string of at least 32 characters in production');
    }
    return s;
  },
  /** stripe | test. "test" is a sandbox that never moves money and is refused in production unless explicitly allowed (staging). */
  get paymentsMode(): 'stripe' | 'test' {
    const mode = process.env.PAYMENTS_MODE || (process.env.STRIPE_SECRET_KEY ? 'stripe' : 'test');
    if (mode === 'test' && isProd && !isBuild && process.env.ALLOW_TEST_PAYMENTS !== 'true') {
      throw new Error('PAYMENTS_MODE=test is not allowed in production (set ALLOW_TEST_PAYMENTS=true on staging only)');
    }
    return mode === 'stripe' ? 'stripe' : 'test';
  },
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  /** resend | log. "log" stores emails in EmailLog without sending. */
  emailProvider: (process.env.EMAIL_PROVIDER || (process.env.RESEND_API_KEY ? 'resend' : 'log')) as 'resend' | 'log',
  resendApiKey: process.env.RESEND_API_KEY,
  emailFrom: process.env.EMAIL_FROM || 'Athana <contact@athana.ch>',
  adminEmail: process.env.CONTACT_EMAIL || 'contact@athana.ch',
  storageDir: process.env.STORAGE_DIR || './storage',
  cronSecret: process.env.CRON_SECRET,
  analytics: {
    ga4: process.env.NEXT_PUBLIC_GA4_ID || '',
    gtm: process.env.NEXT_PUBLIC_GTM_ID || '',
    googleAds: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || '',
    googleAdsPurchaseLabel: process.env.NEXT_PUBLIC_GOOGLE_ADS_PURCHASE_LABEL || '',
    metaPixel: process.env.NEXT_PUBLIC_META_PIXEL_ID || '',
  },
};
