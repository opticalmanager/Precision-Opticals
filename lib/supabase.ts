import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://rtyaihaeogqdxvqyycir.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "sb_publishable_8vAnw-fBN4g2ghDGGHGYyQ_82PEpOXw";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
