import { createClient as createSupabaseClient } from '@supabase/supabase-js';

// Service-role client — server only, never exposed to the browser
export function createServiceClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  return createSupabaseClient(
    url!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
