import { createSupabaseClient } from "@matobev/shared";

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createSupabaseClient(url, anon);
