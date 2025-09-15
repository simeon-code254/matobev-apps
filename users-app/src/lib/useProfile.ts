import { useEffect, useState } from "react";
import { supabase } from "./supabaseClient";

export type Profile = { id: string; role: "player" | "scout"; country: string } | null;

export function useProfile() {
  const [profile, setProfile] = useState<Profile>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const { data, error } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (error) console.error(error);
      setProfile((data as any) ?? null);
      setLoading(false);
    })();
  }, []);

  return { profile, loading };
}
