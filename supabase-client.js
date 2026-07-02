import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// TODO: replace with your Supabase project's Project URL and anon public key
// (Settings -> API in the Supabase dashboard). Safe to commit: RLS policies
// on the tables/bucket are what protect the data, not hiding this key.
const SUPABASE_URL = 'https://your-project-ref.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-public-key';

// Lets gallery.js tell "not set up yet" apart from "configured but unreachable"
export const SUPABASE_CONFIGURED = !SUPABASE_URL.includes('your-project-ref');

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
