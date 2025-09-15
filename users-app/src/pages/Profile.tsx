import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import Sidebar from "../components/layout/Sidebar";

export default function Profile() {
  const [profile, setProfile] = useState<any>(null);
  const [form, setForm] = useState<any>({ full_name: "", country: "", team: "", league: "", position: "", bio: "" });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const africaCountries = ["KE","NG","GH","ZA","TZ","UG","CM","CI","SN","EG","DZ","MA","TN","ET","ZW","ZM","BW","NA","MW","MZ","AO","CD","RW","BI","GM","SL","LR","SO","SD","SS","GA","GN","BJ","BF","NE","TD","CF","CG","GQ","ST","CV","SC","MU","MG","ER","DJ","LY","MR","EH","LS","SZ","KM"];

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { window.location.href = "/login"; return; }
      const { data: prof } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
      if (!prof) { window.location.href = "/login"; return; }
      setProfile(prof);
      setForm({
        full_name: prof.full_name || "",
        country: prof.country || "",
        team: prof.team || "",
        league: prof.league || "",
        position: prof.position || "",
        bio: prof.bio || ""
      });
    })();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    setSaving(true);
    let avatar_url = profile.avatar_url || null;
    if (avatarFile) {
      const path = `${profile.id}/avatar_${Date.now()}.png`;
      const up = await supabase.storage.from("avatars").upload(path, avatarFile, { upsert: false });
      if (!up.error) {
        const pub = supabase.storage.from("avatars").getPublicUrl(path);
        avatar_url = pub.data.publicUrl;
      }
    }
    const payload = { ...form, avatar_url };
    const { error } = await supabase.from("profiles").update(payload).eq("id", profile.id);
    setSaving(false);
    if (error) alert(error.message);
    else window.location.href = "/dashboard";
  };

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <TopNav profile={profile} />
      <div className="mx-auto max-w-7xl p-4 grid md:grid-cols-[240px,1fr] gap-4">
        <Sidebar role={profile.role} />
        <main>
          <div className="rounded-2xl bg-white p-6 border shadow max-w-xl">
            <div className="text-xl font-semibold mb-4">Edit Profile</div>
            <form onSubmit={onSubmit} className="grid gap-3">
              <div>
                <div className="text-sm font-medium mb-1">Avatar</div>
                <input type="file" accept="image/*" onChange={(e)=>setAvatarFile(e.target.files?.[0] || null)} />
              </div>
              <input className="border rounded px-3 py-2" placeholder="Full name" value={form.full_name} onChange={(e)=>setForm({...form, full_name:e.target.value})} />
              <select className="border rounded px-3 py-2" value={form.country} onChange={(e)=>setForm({...form, country:e.target.value})}>
                <option value="">Select country</option>
                {africaCountries.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <input className="border rounded px-3 py-2" placeholder="Team" value={form.team} onChange={(e)=>setForm({...form, team:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="League" value={form.league} onChange={(e)=>setForm({...form, league:e.target.value})} />
              <input className="border rounded px-3 py-2" placeholder="Position" value={form.position} onChange={(e)=>setForm({...form, position:e.target.value})} />
              <textarea className="border rounded px-3 py-2" placeholder="Bio" value={form.bio} onChange={(e)=>setForm({...form, bio:e.target.value})} />
              <button disabled={saving} className="px-4 py-2 rounded bg-blue-700 text-white">{saving ? "Saving..." : "Save"}</button>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
