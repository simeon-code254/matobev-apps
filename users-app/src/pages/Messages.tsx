import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

export default function Messages() {
  const [profile, setProfile] = useState<any>(null);
  const [convos, setConvos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);
      const { data } = await supabase.from("messages_view").select("*").order("last_message_at", { ascending: false }).limit(50);
      setConvos(data || []);
    })();
  }, []);

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main className="space-y-3">
          {convos.length === 0 ? <div className="text-slate-600 text-sm">No conversations yet.</div> : null}
          {convos.map((c:any)=>(
            <a key={c.conversation_id} className="block rounded-xl bg-white border shadow p-3 hover:shadow-md" href={`/messages/${c.conversation_id}`}>
              <div className="font-semibold">{c.other_party_name || "Conversation"}</div>
              <div className="text-xs text-slate-500">{c.last_message_preview || ""}</div>
            </a>
          ))}
        </main>
      </div>
    </div>
  );
}
