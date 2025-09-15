import React, { useEffect, useState } from "react";

type Profile = { id: string; full_name?: string|null; country: string; role: "player"|"scout"|"admin"; approved: boolean };

export default function Approve() {
  const [items, setItems] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const url = (import.meta as any).env.VITE_SUPABASE_URL as string;
        const anon = (import.meta as any).env.VITE_SUPABASE_ANON_KEY as string;
        const res = await fetch(`${url}/rest/v1/profiles?select=*`, {
          headers: { apikey: anon, Authorization: `Bearer ${anon}` }
        });
        const data = await res.json();
        setItems((data as Profile[]).filter(p => !p.approved));
      } catch {}
      setLoading(false);
    })();
  }, []);

  async function approve(id: string, approved: boolean) {
    const adminPw = (import.meta as any).env.VITE_ADMIN_PASSWORD as string;
    const ml = ((import.meta as any).env.VITE_ML_SERVICE_URL as string) || "";
    await fetch(`${ml}/admin/approve`, {
      method: "POST",
      headers: { "content-type":"application/json", "x-admin-password": adminPw },
      body: JSON.stringify({ user_id: id, approved })
    });
    setItems(prev => prev.filter(p => p.id !== id));
  }

  if (loading) return <div className="p-6">Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-xl font-semibold mb-4">Pending Approvals</h1>
      <div className="space-y-3">
        {items.map(p => (
          <div key={p.id} className="bg-white rounded-xl shadow p-4 flex items-center justify-between">
            <div>
              <div className="font-semibold">{p.full_name || p.id.slice(0,8)}</div>
              <div className="text-sm text-slate-600">{p.role} • {p.country}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>approve(p.id, true)} className="px-3 py-2 rounded bg-blue-700 text-white">Approve</button>
              <button onClick={()=>approve(p.id, false)} className="px-3 py-2 rounded bg-slate-200">Reject</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <div className="text-slate-600">No pending approvals.</div>}
      </div>
    </div>
  );
}
