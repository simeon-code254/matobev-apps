import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Phase = "idle" | "uploading" | "analyzing" | "saving" | "done";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [result, setResult] = useState<any>(null);
  const [videoId, setVideoId] = useState<string | null>(null);
  const mlUrl = import.meta.env.VITE_ML_SERVICE_URL as string;

  const onUpload = async () => {
    if (!file) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setPhase("uploading");
    const path = `${user.id}/${Date.now()}_${file.name}`;
    const uploadRes = await supabase.storage.from("videos").upload(path, file, { upsert: false });
    if (uploadRes.error) { alert(uploadRes.error.message); setPhase("idle"); return; }

    const { data: inserted, error: insErr } = await supabase
      .from("videos")
      .insert({ user_id: user.id, title, description, file_url: path })
      .select("id")
      .maybeSingle();
    if (insErr || !inserted) { alert(insErr?.message || "Failed to save video"); setPhase("idle"); return; }
    setVideoId(inserted.id as string);

    setPhase("analyzing");
    const signed = await supabase.storage.from("videos").createSignedUrl(path, 60 * 10);
    if (!signed.data?.signedUrl) { alert("Could not sign URL"); setPhase("idle"); return; }

    try {
      const res = await fetch(`${mlUrl}/analyze`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ video_url: signed.data.signedUrl }),
      });
      const json = await res.json();
      setResult(json);

      setPhase("saving");
      await supabase.from("videos").update({ stats: json }).eq("id", inserted.id);

      setPhase("done");
    } catch (e: any) {
      alert("Analysis failed");
      setPhase("idle");
    }
  };

  const StatPill = ({ label, value }: { label: string; value: any }) => (
    <div className="rounded bg-blue-50 px-3 py-1 text-blue-700 text-sm">{label}: {value ?? "—"}</div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="mx-auto max-w-3xl">
        <div className="rounded-2xl bg-white border shadow p-6">
          <div className="text-2xl font-bold mb-1">Upload & Analyze</div>
          <div className="text-slate-600 text-sm mb-4">Upload your performance video. Our AI will generate your Player Card stats.</div>

          <div className="grid gap-3">
            <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} />
            <textarea className="border rounded px-3 py-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
            <input type="file" accept="video/*" onChange={e=>setFile(e.target.files?.[0] ?? null)} />
            <button disabled={!file || phase==="uploading" || phase==="analyzing" || phase==="saving"} onClick={onUpload} className="px-4 py-2 rounded bg-blue-700 text-white">
              {phase === "idle" && "Upload & Analyze"}
              {phase === "uploading" && "Uploading..."}
              {phase === "analyzing" && "Analyzing..."}
              {phase === "saving" && "Saving..."}
              {phase === "done" && "Completed"}
            </button>
          </div>

          {phase !== "idle" && (
            <div className="mt-4 text-sm text-slate-600">
              {phase === "uploading" && "Uploading your video to secure storage..."}
              {phase === "analyzing" && "Running AI analysis to compute your stats..."}
              {phase === "saving" && "Saving your Player Card stats..."}
              {phase === "done" && "Done! You can view this in your dashboard and feed."}
            </div>
          )}

          {result && (
            <div className="mt-6 rounded-xl border p-4">
              <div className="font-semibold mb-2">Player Card</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
                {["speed","stamina","passing","shooting","strength"].map((k)=>(
                  <StatPill key={k} label={k} value={result?.[k]} />
                ))}
              </div>
              <div className="mt-4">
                <a href="/dashboard" className="px-3 py-2 rounded bg-blue-700 text-white">Go to Dashboard</a>
                {videoId ? <a href="/feed" className="ml-2 px-3 py-2 rounded bg-blue-100 text-blue-800">Open Feed</a> : null}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
