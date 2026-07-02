import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Set PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY in .env (see .env.example)
// with your Supabase project's Project URL and anon public key (Settings ->
// API in the Supabase dashboard). Safe to commit the key itself: RLS policies
// on the tables/bucket are what protect the data, not hiding this key — the
// env var split is purely so dev/staging/prod can point at different projects.
const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL || 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY || 'your-anon-public-key';

// Lets gallery.js tell "not set up yet" apart from "configured but unreachable"
export const SUPABASE_CONFIGURED = !SUPABASE_URL.includes('your-project-ref');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
