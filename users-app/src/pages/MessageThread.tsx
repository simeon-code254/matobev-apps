import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

export default function MessageThread() {
  const [profile, setProfile] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const conversationId = window.location.pathname.split("/").pop();

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);
      const { data } = await supabase.from("messages").select("*").eq("conversation_id", conversationId).order("created_at", { ascending: true });
      setMessages(data || []);

      const channel = supabase
        .channel(`conversation:${conversationId}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `conversation_id=eq.${conversationId}` }, (payload: any) => {
          setMessages((m) => [...m, payload.new]);
        })
        .subscribe();

      return () => { supabase.removeChannel(channel); };
    })();
  }, [conversationId]);

  const [content, setContent] = useState("");

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !content) return;
    await supabase.from("messages").insert({ conversation_id: conversationId, sender_id: profile.id, content });
    setContent("");
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main className="space-y-3">
          <div className="rounded-2xl bg-white border shadow p-3">
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {messages.map((m:any)=>(
                <div key={m.id} className="text-sm"><span className="font-semibold">{m.sender_id === profile.id ? "You" : "Them"}:</span> {m.content}</div>
              ))}
            </div>
            <form onSubmit={send} className="mt-3 flex gap-2">
              <input className="border rounded px-3 py-2 flex-1" value={content} onChange={(e)=>setContent(e.target.value)} placeholder="Type a message..." />
              <button className="px-4 py-2 rounded bg-blue-700 text-white">Send</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
