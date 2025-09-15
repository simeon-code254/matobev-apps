import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { UserRole } from "@matobev/shared";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";
import DashCard from "../components/ui/DashCard";
import { useVideos } from "../lib/api/useVideos";
import { useTrials } from "../lib/api/useTrials";
import { useNews } from "../lib/api/useNews";
import { useMessagesPreview } from "../lib/api/useMessagesPreview";

type Profile = {
  id: string;
  role: UserRole;
  country: string;
  full_name?: string | null;
  position?: string | null;
  team?: string | null;
  league?: string | null;
  avatar_url?: string | null;
};

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!prof) {
        window.location.href = "/login";
        return;
      }
      setProfile(prof as Profile);
      setLoading(false);
    })();
  }, []);

  const role = profile?.role;
  const welcome = useMemo(() => {
    const name = profile?.full_name ? `, ${profile.full_name}` : "";
    return `Welcome${name}`;
  }, [profile]);

  const videosHook = useVideos(6);
  const trialsHook = useTrials(6, profile?.country, role as any);
  const newsHook = useNews(6);
  const messagesHook = useMessagesPreview(3);

  if (loading) return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">Loading...</div>;
  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={(role as any) || "player"} />

        <main className="space-y-4">
          <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white p-6 shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold">{welcome}</div>
                <div className="text-white/90 text-sm mt-1">
                  {role === "player" ? "Showcase your talent—upload a new performance video." : "Discover players and post verified trials."}
                </div>
              </div>
              <div>
                {role === "player" ? (
                  <a href="/upload" className="px-4 py-2 rounded-lg bg-white text-blue-800 font-semibold">Upload Video</a>
                ) : (
                  <a href="/post-trial" className="px-4 py-2 rounded-lg bg-white text-blue-800 font-semibold">Post Trial</a>
                )}
              </div>
            </div>
          </div>

          {role === "player" && (
            <DashCard title="Your Videos" action={<a href="/upload" className="text-sm text-blue-700">Upload</a>}>
              {videosHook.loading ? (
                <div className="text-slate-600 text-sm">Loading...</div>
              ) : videosHook.data.length === 0 ? (
                <div className="text-slate-600 text-sm">No videos yet.</div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {videosHook.data.map((v: any) => (
                    <div key={v.id} className="rounded-xl border bg-white shadow hover:shadow-md transition overflow-hidden">
                      <div className="aspect-video bg-slate-100">{v.thumbnail_url ? <img src={v.thumbnail_url} className="h-full w-full object-cover" /> : null}</div>
                      <div className="p-3">
                        <div className="font-semibold line-clamp-1">{v.title || "Video"}</div>
                        <div className="text-xs text-slate-500">{v.created_at ? new Date(v.created_at).toLocaleString() : ""}</div>
                        {v.stats ? (
                          <div className="mt-2 grid grid-cols-5 gap-1 text-[10px]">
                            {["speed","stamina","passing","shooting","strength"].map(k => (
                              <div key={k} className="rounded bg-blue-50 px-2 py-1 text-blue-700">{k}: {v.stats?.[k] ?? "—"}</div>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashCard>
          )}

          {role === "player" && (
            <DashCard title="Your Player Card">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-xl bg-white border p-4">
                  <div className="h-40 rounded-lg bg-slate-100" />
                </div>
                <div className="space-y-2">
                  <div className="text-sm text-slate-700">Position: {profile.position || "—"}</div>
                  <div className="text-sm text-slate-700">Team: {profile.team || "—"} • League: {profile.league || "—"}</div>
                  <div className="text-sm text-slate-700">Country: {profile.country}</div>
                  <a href="/card/download" className="inline-block mt-2 px-3 py-2 rounded bg-blue-700 text-white">Download Card</a>
                </div>
              </div>
            </DashCard>
          )}

          {role === "scout" && (
            <DashCard title="Discover Players" action={<a href="/players" className="text-sm text-blue-700">Search</a>}>
              <div className="text-sm text-slate-600">Use filters to find players by country, position, and AI stats.</div>
            </DashCard>
          )}

          <div className="grid lg:grid-cols-3 gap-4">
            <DashCard title="Trials">
              {trialsHook.loading ? (
                <div className="text-slate-600 text-sm">Loading...</div>
              ) : trialsHook.data.length === 0 ? (
                <div className="text-slate-600 text-sm">No trials yet.</div>
              ) : (
                <div className="grid gap-3">
                  {trialsHook.data.map((t: any) => (
                    <div key={t.id} className="rounded-xl border p-3 bg-white">
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-xs text-slate-500">{t.country} • {t.date ? new Date(t.date).toLocaleDateString() : ""}</div>
                      <div className="mt-2">
                        {role === "player" ? (
                          <a href="/messages" className="px-2 py-1 rounded bg-blue-700 text-white text-xs">Apply</a>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </DashCard>

            <DashCard title="News & Tournaments">
              {newsHook.loading ? (
                <div className="text-slate-600 text-sm">Loading...</div>
              ) : newsHook.data.length === 0 ? (
                <div className="text-slate-600 text-sm">No news yet.</div>
              ) : (
                <div className="grid gap-3">
                  {newsHook.data.map((n: any) => (
                    <div key={n.id} className="rounded-xl border p-3 bg-white">
                      <div className="font-semibold">{n.title}</div>
                      <div className="text-xs text-slate-500">{new Date(n.created_at).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </DashCard>

            <DashCard title="Messages">
              {messagesHook.loading ? (
                <div className="text-slate-600 text-sm">Loading...</div>
              ) : messagesHook.data.length === 0 ? (
                <div className="text-slate-600 text-sm">No conversations yet.</div>
              ) : (
                <div className="grid gap-3">
                  {messagesHook.data.map((m: any) => (
                    <a key={m.conversation_id} className="rounded-xl border p-3 bg-white hover:shadow" href={`/messages/${m.conversation_id}`}>
                      <div className="font-semibold">{m.other_party_name || "Conversation"}</div>
                      <div className="text-xs text-slate-500">{m.last_message_preview || ""}</div>
                    </a>
                  ))}
                </div>
              )}
            </DashCard>
          </div>
        </main>
      </div>
    </div>
  );
}
