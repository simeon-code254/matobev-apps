import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

type Video = {
  id: string;
  user_id: string;
  title?: string | null;
  description?: string | null;
  file_url: string;
  thumbnail_url?: string | null;
  stats?: any;
  created_at?: string;
};

export default function Feed() {
  const [profile, setProfile] = useState<any>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [likes, setLikes] = useState<Record<string, number>>({});
  const [likedByMe, setLikedByMe] = useState<Record<string, boolean>>({});
  const [comments, setComments] = useState<Record<string, any[]>>({});

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      setProfile(prof);

      const { data: vids } = await supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(50);
      setVideos(vids || []);

      if (vids && vids.length) {
        const ids = vids.map(v => v.id);
        const { data: likeRows } = await supabase.from("video_likes").select("video_id").in("video_id", ids);
        const { data: myLikes } = await supabase.from("video_likes").select("video_id").eq("user_id", user.id).in("video_id", ids);
        const { data: cmts } = await supabase.from("video_comments").select("*").in("video_id", ids).order("created_at", { ascending: true });

        const lc: Record<string, number> = {};
        (likeRows || []).forEach((row: any) => { lc[row.video_id] = (lc[row.video_id] || 0) + 1; });
        setLikes(lc);
        const lm: Record<string, boolean> = {};
        (myLikes || []).forEach((row: any) => { lm[row.video_id] = true; });
        setLikedByMe(lm);
        const c: Record<string, any[]> = {};
        (cmts || []).forEach((r: any) => { (c[r.video_id] ||= []).push(r); });
        setComments(c);
      }

      const ch = supabase.channel("realtime-feed")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "videos" }, (payload) => {
          setVideos(prev => [payload.new as any, ...prev]);
        })
        .on("postgres_changes", { event: "*", schema: "public", table: "video_likes" }, (payload) => {
          const vId = (payload.new as any)?.video_id ?? (payload.old as any)?.video_id;
          setLikes(prev => {
            const curr = prev[vId] || 0;
            if (payload.eventType === "INSERT") return { ...prev, [vId]: curr + 1 };
            if (payload.eventType === "DELETE") return { ...prev, [vId]: Math.max(0, curr - 1) };
            return prev;
          });
        })
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "video_comments" }, (payload) => {
          const row = payload.new as any;
          setComments(prev => ({ ...prev, [row.video_id]: [ ...(prev[row.video_id] || []), row ] }));
        })
        .subscribe();

      return () => { supabase.removeChannel(ch); };
    })();
  }, []);

  const toggleLike = async (videoId: string) => {
    if (!profile) return;
      const liked = !!likedByMe[videoId];
      setLikedByMe(prev => ({ ...prev, [videoId]: !liked }));
      setLikes(prev => ({ ...prev, [videoId]: (prev[videoId] || 0) + (liked ? -1 : 1) }));
                if (liked) {
                  await supabase.from("video_likes").delete().eq("video_id", videoId).eq("user_id", profile.id);
                } else {
                  await supabase.from("video_likes").insert({ video_id: videoId, user_id: profile.id });
    }
  };

  const addComment = async (videoId: string, content: string) => {
    if (!content.trim()) return;
    await supabase.from("video_comments").insert({ video_id: videoId, user_id: profile.id, content });
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main className="grid gap-4">
          {videos.length === 0 ? <div className="text-slate-600 text-sm">No videos yet.</div> : null}
          {videos.map((v) => (
            <div key={v.id} className="rounded-2xl bg-white border shadow p-4">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{v.title || "Performance Video"}</div>
                <div className="text-xs text-slate-500">{v.created_at ? new Date(v.created_at).toLocaleString() : ""}</div>
              </div>
              <div className="mt-3 rounded-xl overflow-hidden bg-slate-100">
                {v.thumbnail_url ? (
                  <img src={v.thumbnail_url} className="w-full h-auto object-cover" />
                ) : (
                  <div className="aspect-video bg-slate-200" />
                )}
              </div>
              {v.stats ? (
                <div className="mt-3 grid grid-cols-5 gap-1 text-[11px]">
                  {["speed","stamina","passing","shooting","strength"].map(k => (
                    <div key={k} className="rounded bg-blue-50 px-2 py-1 text-blue-700">{k}: {v.stats?.[k] ?? "—"}</div>
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex items-center gap-3">
                <button onClick={() => toggleLike(v.id)} className={`px-3 py-1 rounded ${likedByMe[v.id] ? "bg-blue-700 text-white" : "bg-blue-50 text-blue-700"}`}>
                  Like {likes[v.id] ? `(${likes[v.id]})` : ""}
                </button>
              </div>
                  <div className="mt-3">
                <div className="text-sm font-medium mb-1">Comments</div>
                <div className="space-y-2">
                  {(comments[v.id] || []).map((c: any) => (
                    <div key={c.id} className="text-sm">
                      <span className="font-semibold">{c.user_id.slice(0,6)}</span>: {c.content}
                        </div>
                      ))}
                </div>
                <CommentInput onSubmit={(text) => addComment(v.id, text)} />
              </div>
            </div>
          ))}
        </main>
        </div>
    </div>
  );
}

function CommentInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [text, setText] = useState("");
  const canPost = useMemo(() => text.trim().length > 0, [text]);
  return (
    <div className="mt-2 flex gap-2">
      <input value={text} onChange={(e)=>setText(e.target.value)} placeholder="Add a comment..." className="flex-1 border rounded px-3 py-2" />
      <button disabled={!canPost} onClick={()=>{ onSubmit(text); setText(""); }} className="px-3 py-2 rounded bg-blue-700 text-white disabled:opacity-50">Post</button>
    </div>
  );
}
