import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

type Trial = {
  id: string;
  title: string;
  description?: string | null;
  country: string;
  date: string;
  thumbnail_url?: string | null;
  created_by?: string | null;
};

export default function Trials() {
  const [profile, setProfile] = useState<any>(null);
  const [trials, setTrials] = useState<Trial[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);
      let query = supabase.from("trials").select("*").order("date", { ascending: true }).limit(100);
      if (prof?.role === "player" && prof.country) {
        query = query.eq("country", prof.country);
      }
      const { data } = await query;
      setTrials((data as Trial[]) || []);
    })();
  }, []);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main className="grid gap-3">
          {trials.length === 0 ? (
            <div className="text-slate-600 text-sm">No trials available{profile.role === "player" && profile.country ? ` in ${profile.country}` : ""}.</div>
          ) : null}
          {trials.map((t) => (
            <div key={t.id} className="rounded-2xl bg-white border shadow p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{t.title}</div>
                <div className="text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</div>
              </div>
              <div className="text-xs text-slate-500 mt-1">Country: {t.country}</div>
              {t.description ? <div className="text-sm mt-2">{t.description}</div> : null}
              {profile.role === "player" ? (
                <div className="mt-3">
                  <a href={`/messages/new?trial=${t.id}&to=${t.created_by || ""}`} className="px-3 py-1 rounded bg-blue-700 text-white text-sm">Apply</a>
                </div>
              ) : null}
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
