import { useEffect, useState } from "react";
import { Logo } from "../components/Logo";
import { supabase } from "../lib/supabaseClient";

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col items-start rounded-xl bg-white/10 px-4 py-3 border border-white/20">
      <div className="text-2xl md:text-3xl font-extrabold text-white drop-shadow-sm">{value}</div>
      <div className="text-white/80 text-sm">{label}</div>
    </div>
  );
}

function Feature({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100 hover:shadow transition">
      <div className="font-semibold">{title}</div>
      <div className="text-slate-600 text-sm mt-1">{desc}</div>
    </div>
  );
}

export default function Landing() {
  const [stats, setStats] = useState<{ cards: number; trials: number; countries: number } | null>(null);
  const [trials, setTrials] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      const cards = await supabase.from("player_cards").select("*", { count: "exact", head: true });
      const trialsResp = await supabase
        .from("trials")
        .select("id,title,country,city,date")
        .order("date", { ascending: true })
        .limit(6);
      const countriesResp = await supabase
        .from("profiles")
        .select("country", { count: "exact", head: true })
        .neq("country", null);
      setStats({
        cards: cards.count ?? 0,
        trials: trialsResp.data?.length ?? 0,
        countries: countriesResp.count ?? 0,
      });
      setTrials(trialsResp.data ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#3b82f6] via-[#2563eb] to-[#1d4ed8]">
      <header className="sticky top-0 z-30 bg-white/20 backdrop-blur-sm border-b border-white/20">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-4 py-3">
          <a className="flex items-center gap-2" href="/">
            <Logo width={28} height={28} />
            <div className="font-semibold text-white tracking-wide">Matobev</div>
          </a>
          <nav className="hidden md:flex gap-8 text-sm text-white/90">
            <a href="#features" className="hover:text-white">Features</a>
            <a href="#discover" className="hover:text-white">Discover</a>
            <a href="#news" className="hover:text-white">News</a>
            <a href="#trials" className="hover:text-white">Trials</a>
          </nav>
          <div className="flex items-center gap-2">
            <a href="/login" className="px-3 py-2 rounded-lg bg-white/90 text-blue-700 hover:bg-white transition">Log in</a>
            <a href="/signup" className="px-3 py-2 rounded-lg bg-blue-900/80 text-white border border-white/20 hover:bg-blue-900">Join Now</a>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-7xl grid md:grid-cols-2 gap-10 items-center px-4 py-16">
          <div className="text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs border border-white/20">
              AI Player Cards • Supabase Realtime • Country-scoped Trials
            </div>
            <h1 className="mt-4 text-4xl md:text-6xl font-extrabold leading-tight drop-shadow-sm">
              Uplift African Football Talent with AI-powered discovery
            </h1>
            <p className="mt-4 text-white/90">
              Players upload clips. Our ML generates verified Player Cards. Scouts search by country, position, and stats—then connect instantly.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="/login" className="px-5 py-3 rounded-xl bg-white text-blue-700 font-semibold shadow">
                Get Started
              </a>
              <a href="#features" className="px-5 py-3 rounded-xl bg-white/20 text-white border border-white/20 hover:bg-white/25">
                Explore Features
              </a>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-3">
              <Stat label="Clips analyzed" value={stats ? String(stats.cards) : "—"} />
              <Stat label="Trials posted" value={stats ? String(stats.trials) : "—"} />
              <Stat label="African countries" value={stats ? String(stats.countries) : "—"} />
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-2 rounded-[22px] bg-gradient-to-br from-white/30 to-white/10 blur-xl" />
            <div className="relative bg-white rounded-2xl border border-slate-100 shadow-lg overflow-hidden">
              <div className="p-5 border-b">
                <div className="font-semibold">AI Player Card</div>
                <div className="text-sm text-slate-600">Generated from a real match clip</div>
              </div>
              <div className="p-5 grid grid-cols-2 gap-4">
                <div className="rounded-xl bg-slate-50 aspect-video border" />
                <div className="space-y-3">
                  <Feature title="Speed" desc="Explosive acceleration and top speed" />
                  <Feature title="Shooting" desc="Technique and shot power" />
                  <Feature title="Passing" desc="Vision, accuracy, and tempo" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <a href="/login" className="block w-full text-center rounded-xl bg-blue-700 text-white py-3 hover:bg-blue-800">
                  Generate your Player Card
                </a>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-14">
            <h2 className="text-2xl md:text-3xl font-bold">Everything you need to showcase talent</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <Feature title="Video uploads" desc="Secure uploads to Supabase Storage with owner-only access." />
              <Feature title="AI analysis" desc="Server-side ML extracts 5 key stats and renders a branded card." />
              <Feature title="Discovery" desc="Scouts search by country, position, and stat thresholds." />
              <Feature title="Trials & News" desc="Admins post verified trials and news surfaced on the landing page." />
              <Feature title="Messaging" desc="Realtime DMs powered by Supabase Realtime—secure and fast." />
              <Feature title="RLS Security" desc="Row Level Security on all tables with precise role access." />
            </div>
          </div>
        </section>

        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-4 pb-14">
            <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
            <div className="mt-6 grid md:grid-cols-3 gap-4">
              <Feature title="1. Upload" desc="Players upload match clips securely." />
              <Feature title="2. Analyze" desc="ML extracts 5 core stats and renders a Player Card." />
              <Feature title="3. Discover" desc="Scouts discover by filters and connect instantly." />
            </div>
          </div>
        </section>

        <section className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white p-6 border shadow-sm">
                <div className="font-semibold">“Matobev helped us find talent quickly.”</div>
                <div className="text-sm text-slate-600 mt-2">— Pro Scout</div>
              </div>
              <div className="rounded-2xl bg-white p-6 border shadow-sm">
                <div className="font-semibold">“The Player Card made my stats stand out.”</div>
                <div className="text-sm text-slate-600 mt-2">— Player</div>
              </div>
              <div className="rounded-2xl bg-white p-6 border shadow-sm">
                <div className="font-semibold">“Country-scoped trials are perfect for us.”</div>
                <div className="text-sm text-slate-600 mt-2">— Academy</div>
              </div>
            </div>
          </div>
        </section>

        <section id="discover" className="bg-slate-50">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="rounded-2xl bg-white p-6 border shadow-sm">
              <div className="font-semibold">Discover top prospects across Africa</div>
              <div className="text-slate-600 text-sm mt-1">
                Live feed of Player Cards will appear here as the platform grows.
              </div>
            </div>
          </div>
        </section>

        <section id="trials" className="bg-white">
          <div className="mx-auto max-w-7xl px-4 py-12">
            <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border p-6">
              <div className="font-semibold">Upcoming Trials</div>
              <div className="text-slate-600 text-sm mt-1">Country-scoped trials posted by scouts and admins.</div>
              <div className="mt-4 grid md:grid-cols-3 gap-3">
                {trials.length === 0 ? (
                  <div className="rounded-xl bg-white p-4 border shadow-sm col-span-3 text-slate-600">
                    No trials yet—check back soon.
                  </div>
                ) : (
                  trials.map((t) => (
                    <div key={t.id} className="rounded-xl bg-white p-4 border shadow-sm">
                      <div className="font-semibold">{t.title}</div>
                      <div className="text-sm text-slate-600 mt-1">
                        {t.country}{t.city ? ` • ${t.city}` : ""}
                      </div>
                      {t.date && (
                        <div className="text-xs text-slate-500 mt-1">
                          {new Date(t.date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-blue-900">
          <div className="mx-auto max-w-7xl px-4 py-14 text-white">
            <div className="grid md:grid-cols-2 items-center gap-8">
              <div>
                <h3 className="text-2xl font-bold">Ready to showcase your talent?</h3>
                <p className="text-white/90 mt-2">Join Matobev and get discovered by scouts across Africa.</p>
              </div>
              <div className="flex md:justify-end">
                <a href="/login" className="px-5 py-3 rounded-xl bg-white text-blue-800 font-semibold">Create your profile</a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-blue-950 border-t border-white/10">
        <div className="mx-auto max-w-7xl px-4 py-6 text-white/80 text-sm flex flex-col md:flex-row gap-2 md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Logo width={18} height={18} />
            <span>Matobev</span>
          </div>
          <div>© {new Date().getFullYear()} Matobev. All rights reserved.</div>
        </div>
      </footer>
    </div>
  );
}
