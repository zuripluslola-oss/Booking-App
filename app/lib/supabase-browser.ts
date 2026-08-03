import { createBrowserClient } from "@supabase/ssr";

const BOOKKIT_SUPABASE_URL = "https://nfezatqbhtxzvdkpsjcm.supabase.co";
const BOOKKIT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_MJ6O6aO4xQpD15H8GHf-xw_M08ViVCl";

export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || BOOKKIT_SUPABASE_URL;
  const publishableKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    BOOKKIT_SUPABASE_PUBLISHABLE_KEY;

  return createBrowserClient(url, publishableKey);
}
