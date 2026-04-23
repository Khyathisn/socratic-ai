import { createClient as createBrowserClient } from '@/utils/supabase/client'

// Singleton Supabase browser client — prevents multiple GoTrueClient warnings
let client: ReturnType<typeof createBrowserClient> | null = null

function getClient() {
  if (!client) {
    client = createBrowserClient()
  }
  return client
}

// Default export for backward compatibility across all pages
export const supabase = getClient()
