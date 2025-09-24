import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useNews(limit = 6) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("news")
        .select("id, title, thumbnail_url, created_at")
        .order("created_at", { ascending: false })
        .limit(limit);
      if (error) setError(error.message);
      setData(data || []);
      setLoading(false);
    })();
  }, [limit]);

  return { data, loading, error };
}
