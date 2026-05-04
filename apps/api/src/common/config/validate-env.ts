type NodeEnvironment = 'development' | 'test' | 'production';

export type AppEnvironment = {
  NODE_ENV: NodeEnvironment;
  PORT: number;
  API_PREFIX: string;
  FRONTEND_URL: string;
  DATABASE_URL: string;
  PLATFORM_ROOT_DOMAIN: string;
  SUPABASE_URL?: string;
  SUPABASE_PUBLISHABLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  R2_ACCOUNT_ID?: string;
  R2_ACCESS_KEY_ID?: string;
  R2_SECRET_ACCESS_KEY?: string;
  R2_BUCKET_NAME?: string;
  R2_PUBLIC_URL?: string;
  RESEND_API_KEY?: string;
  RESEND_FROM_EMAIL?: string;
  POSTHOG_API_KEY?: string;
  POSTHOG_HOST?: string;
};

function parsePort(value: string | undefined): number {
  if (!value) {
    return 4000;
  }

  const port = Number(value);

  if (!Number.isInteger(port) || port <= 0) {
    throw new Error('PORT must be a positive integer.');
  }

  return port;
}

export function validateEnv(config: Record<string, unknown>): AppEnvironment {
  const nodeEnv = (config.NODE_ENV as string | undefined) ?? 'development';
  const errors: string[] = [];

  if (!['development', 'test', 'production'].includes(nodeEnv)) {
    errors.push('NODE_ENV must be development, test or production.');
  }

  if (!config.DATABASE_URL) {
    errors.push('DATABASE_URL is required.');
  }

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration:\n- ${errors.join('\n- ')}`,
    );
  }

  return {
    NODE_ENV: nodeEnv as NodeEnvironment,
    PORT: parsePort(config.PORT as string | undefined),
    API_PREFIX: (config.API_PREFIX as string | undefined) ?? 'api',
    FRONTEND_URL:
      (config.FRONTEND_URL as string | undefined) ?? 'http://localhost:3000',
    DATABASE_URL: config.DATABASE_URL as string,
    PLATFORM_ROOT_DOMAIN:
      (config.PLATFORM_ROOT_DOMAIN as string | undefined) ?? 'midominio.local',
    SUPABASE_URL: config.SUPABASE_URL as string | undefined,
    SUPABASE_PUBLISHABLE_KEY: config.SUPABASE_PUBLISHABLE_KEY as
      | string
      | undefined,
    SUPABASE_SECRET_KEY: config.SUPABASE_SECRET_KEY as string | undefined,
    SUPABASE_ANON_KEY: config.SUPABASE_ANON_KEY as string | undefined,
    SUPABASE_SERVICE_ROLE_KEY: config.SUPABASE_SERVICE_ROLE_KEY as
      | string
      | undefined,
    R2_ACCOUNT_ID: config.R2_ACCOUNT_ID as string | undefined,
    R2_ACCESS_KEY_ID: config.R2_ACCESS_KEY_ID as string | undefined,
    R2_SECRET_ACCESS_KEY: config.R2_SECRET_ACCESS_KEY as string | undefined,
    R2_BUCKET_NAME: config.R2_BUCKET_NAME as string | undefined,
    R2_PUBLIC_URL: config.R2_PUBLIC_URL as string | undefined,
    RESEND_API_KEY: config.RESEND_API_KEY as string | undefined,
    RESEND_FROM_EMAIL: config.RESEND_FROM_EMAIL as string | undefined,
    POSTHOG_API_KEY: config.POSTHOG_API_KEY as string | undefined,
    POSTHOG_HOST: config.POSTHOG_HOST as string | undefined,
  };
}

