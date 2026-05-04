import { createBrowserClient } from "@supabase/ssr";
import { getPublicEnv } from "../env";

export function createSupabaseBrowserClient() {
  const env = getPublicEnv();

  return createBrowserClient(env.supabaseUrl, env.supabasePublishableKey);
}
