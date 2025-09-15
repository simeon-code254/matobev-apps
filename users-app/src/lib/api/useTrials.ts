import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useTrials(limit = 6, country?: string, role?: "player" | "scout") {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("trials")
        .select("id,title,description,country,date,thumbnail_url,created_by")
        .gte("date", new Date().toISOString())
        .order("date", { ascending: true })
        .limit(limit);
      if (error) setError(error.message);
      const rows = data || [];
      const filtered = role === "player" && country ? rows.filter((r) => r.country === country) : rows;
      setData(filtered);
      setLoading(false);
    })();
  }, [limit, country, role]);

  return { data, loading, error };
}
