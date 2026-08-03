import { createBrowserClient } from "@supabase/ssr";

export function createSupabaseBrowserClient() {
  const isServerRender = typeof window === "undefined";
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || (isServerRender ? "https://placeholder.supabase.co" : "");
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || (isServerRender ? "sb_publishable_placeholder" : "");

  if (!url || !publishableKey) {
    throw new Error("BookKit authentication is not configured.");
  }

  return createBrowserClient(url, publishableKey);
}
