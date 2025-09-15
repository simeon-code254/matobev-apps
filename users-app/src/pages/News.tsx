import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

export default function News() {
  const [profile, setProfile] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);
      const { data } = await supabase.from("news").select("*").order("created_at", { ascending: false }).limit(50);
      setNews(data || []);
    })();
  }, []);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main className="grid gap-3">
          {news.length === 0 ? <div className="text-slate-600 text-sm">No news yet.</div> : null}
          {news.map((n:any)=>(
            <div key={n.id} className="rounded-2xl bg-white border shadow p-3">
              <div className="font-semibold">{n.title}</div>
              <div className="text-xs text-slate-500">{new Date(n.created_at).toLocaleString()}</div>
              <div className="text-sm mt-2">{n.description}</div>
            </div>
          ))}
        </main>
      </div>
    </div>
  );
}
