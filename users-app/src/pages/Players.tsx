import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

export default function Players() {
  const [profile, setProfile] = useState<any>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [q, setQ] = useState("");
  const [country, setCountry] = useState("");
  const [position, setPosition] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      const query = supabase.from("profiles").select("id,full_name,country,position,team,league,avatar_url").eq("role","player").limit(30);
      if (q) query.ilike("full_name", `%${q}%`);
      if (country) query.eq("country", country);
      if (position) query.ilike("position", `%${position}%`);
      const { data } = await query;
      setPlayers(data || []);
    })();
  }, [q, country, position]);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main className="space-y-4">
          <div className="rounded-2xl bg-white p-4 border shadow">
            <div className="grid sm:grid-cols-3 gap-3">
              <input className="border rounded px-3 py-2" placeholder="Search name" value={q} onChange={(e)=>setQ(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Country code (e.g., KE)" value={country} onChange={(e)=>setCountry(e.target.value)} />
              <input className="border rounded px-3 py-2" placeholder="Position" value={position} onChange={(e)=>setPosition(e.target.value)} />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {players.map(p => (
              <div key={p.id} className="rounded-xl bg-white border shadow p-3">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200 overflow-hidden">{p.avatar_url ? <img src={p.avatar_url} className="h-full w-full object-cover" /> : null}</div>
                  <div>
                    <div className="font-semibold">{p.full_name || "Player"}</div>
                    <div className="text-xs text-slate-500">{p.country} • {p.position || "—"}</div>
                  </div>
                </div>
                <div className="mt-2 text-sm text-slate-600">{p.team || "—"} • {p.league || "—"}</div>
                <div className="mt-3">
                  <a href={`/messages/new?to=${p.id}`} className="px-3 py-1 rounded bg-blue-700 text-white text-sm">Message</a>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
