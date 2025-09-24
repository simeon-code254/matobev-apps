import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';

interface PlayerCard {
  player_id: string;
  overall_rating: number;
  pace: number;
  shooting: number;
  passing: number;
  dribbling: number;
  defending: number;
  physical: number;
  last_updated: string;
}

export function usePlayerCard() {
  const [data, setData] = useState<PlayerCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlayerCard = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setData(null);
        setLoading(false);
        return;
      }

      const { data: playerCard, error } = await supabase
        .from('player_cards')
        .select('*')
        .eq('player_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setData(playerCard);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    setLoading(true);
    fetchPlayerCard();
  };

  useEffect(() => {
    fetchPlayerCard();
  }, []);

  return { data, loading, error, refetch };
}