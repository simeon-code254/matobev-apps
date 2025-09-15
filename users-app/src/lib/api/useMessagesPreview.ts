import { useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

export function useMessagesPreview(limit = 3) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("messages_view")
        .select("*")
        .order("last_message_at", { ascending: false })
        .limit(limit);
      if (error) setError(error.message);
      setData(data || []);
      setLoading(false);
    })();
  }, [limit]);

  return { data, loading, error };
}
