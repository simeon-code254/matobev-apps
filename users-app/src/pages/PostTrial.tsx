import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

export default function PostTrial() {
  const [profile, setProfile] = useState<any>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [country, setCountry] = useState("");

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!prof || prof.role !== "scout") { window.location.href = "/dashboard"; return; }
      setProfile(prof);
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    await supabase.from("trials").insert({
      title, description, date, country, created_by: profile.id
    });
    window.location.href = "/dashboard";
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main>
          <div className="rounded-2xl bg-white p-6 border shadow max-w-xl">
            <div className="text-xl font-semibold mb-4">Create Trial</div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={(e)=>setTitle(e.target.value)} required />
              <textarea className="border rounded px-3 py-2" placeholder="Description" value={description} onChange={(e)=>setDescription(e.target.value)} />
              <input className="border rounded px-3 py-2" type="date" value={date} onChange={(e)=>setDate(e.target.value)} required />
              <input className="border rounded px-3 py-2" placeholder="Country code (e.g., KE)" value={country} onChange={(e)=>setCountry(e.target.value)} required />
              <button className="px-4 py-2 rounded bg-blue-700 text-white">Post</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
