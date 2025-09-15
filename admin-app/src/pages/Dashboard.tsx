import React, { useEffect, useState } from "react";

function GateContent() {
  const [ok, setOk] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("matobev_admin_session");
      if (!raw) {
        window.location.href = "/login";
        return;
      }
      const sess = JSON.parse(raw);
      const now = Date.now();
      if (!sess?.token || !sess?.exp || now > sess.exp) {
        localStorage.removeItem("matobev_admin_session");
        window.location.href = "/login";
        return;
      }
      setOk(true);
    } catch {
      window.location.href = "/login";
    }
  }, []);

  if (!ok) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="sticky top-0 z-10 bg-white/70 backdrop-blur border-b">
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="font-bold text-blue-700">Matobev Admin</div>
          <nav className="flex items-center gap-4 text-sm">
            <a href="#news" className="hover:underline">News</a>
            <a href="#trials" className="hover:underline">Trials</a>
            <a href="#tournaments" className="hover:underline">Tournaments</a>
            <a href="#users" className="hover:underline">Users</a>
            <a href="#analytics" className="hover:underline">Analytics</a>
            <a href="#settings" className="hover:underline">Settings</a>
          </nav>
          <button
            onClick={() => { localStorage.removeItem("matobev_admin_session"); window.location.href = "/login"; }}
            className="px-3 py-1.5 rounded bg-blue-700 text-white text-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 grid gap-6">
        <section id="news" className="rounded-2xl bg-white p-5 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">News</div>
              <div className="text-sm text-slate-600">Create, edit, delete news articles with thumbnails.</div>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-700 text-white text-sm">Add News</button>
          </div>
        </section>

        <section id="trials" className="rounded-2xl bg-white p-5 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Trials</div>
              <div className="text-sm text-slate-600">Manage official trials (admins) and oversee scout-posted trials.</div>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-700 text-white text-sm">Add Trial</button>
          </div>
        </section>

        <section id="tournaments" className="rounded-2xl bg-white p-5 shadow border">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-semibold">Tournaments</div>
              <div className="text-sm text-slate-600">Post upcoming tournaments (title, country, dates, poster).</div>
            </div>
            <button className="px-3 py-1.5 rounded bg-blue-700 text-white text-sm">Add Tournament</button>
          </div>
        </section>

        <section id="users" className="rounded-2xl bg-white p-5 shadow border">
          <div className="text-lg font-semibold mb-2">Users</div>
          <div className="text-sm text-slate-600">View players/scouts, search/filter, suspend/ban, reset profiles.</div>
        </section>

        <section id="analytics" className="rounded-2xl bg-white p-5 shadow border">
          <div className="text-lg font-semibold mb-2">Analytics</div>
          <div className="text-sm text-slate-600">Overview of users, videos, messages, and trials KPIs.</div>
        </section>

        <section id="settings" className="rounded-2xl bg-white p-5 shadow border">
          <div className="text-lg font-semibold mb-2">Settings</div>
          <div className="text-sm text-slate-600">Platform configuration and admin password note.</div>
        </section>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return <GateContent />;
}
