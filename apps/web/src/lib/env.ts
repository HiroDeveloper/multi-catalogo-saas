export type PublicEnv = {
  appName: string;
  apiUrl: string;
  rootDomain: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  isSupabaseConfigured: boolean;
};

export function getPublicEnv(): PublicEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabasePublishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    "";

  return {
    appName: process.env.NEXT_PUBLIC_APP_NAME ?? "Multi Catalogo SaaS",
    apiUrl: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
    rootDomain: process.env.NEXT_PUBLIC_ROOT_DOMAIN ?? "midominio.local",
    supabaseUrl,
    supabasePublishableKey,
    isSupabaseConfigured: Boolean(supabaseUrl && supabasePublishableKey),
  };
}
