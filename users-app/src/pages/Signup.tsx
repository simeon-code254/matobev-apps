import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AFRICAN_COUNTRIES, UserRole } from "@matobev/shared";
import Input from "../components/ui/Input";
import Select from "../components/ui/Select";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("player");
  const [position, setPosition] = useState("");
  const [country, setCountry] = useState("KE");
  const [club, setClub] = useState("");
  const [league, setLeague] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password
      });
      if (error) throw error;
      const userId = data.user?.id;
      if (userId) {
        const { error: upsertErr } = await supabase.from("profiles").upsert({
          id: userId,
          email,
          role,
          country,
          position,
          team: club,
          league
        });
        if (upsertErr) throw upsertErr;
      }
      setSuccess(true);
      setTimeout(() => { window.location.href = "/login"; }, 1600);
    } catch (err: any) {
      setErrorMsg(err?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="h-full w-full flex items-end p-10">
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-6 text-white max-w-md">
            <div className="mb-4">
              <svg width="100%" height="120" viewBox="0 0 600 120">
                <defs>
                  <linearGradient id="matobevGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#93c5fd"/><stop offset="100%" stopColor="#2563eb"/>
                  </linearGradient>
                  <linearGradient id="ballGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ffffff"/><stop offset="100%" stopColor="#e5e7eb"/>
                  </linearGradient>
                </defs>
                <rect x="20" y="35" width="520" height="50" rx="14" fill="url(#matobevGrad)">
                  <animate attributeName="x" values="20;40;20" dur="6s" repeatCount="indefinite"/>
                </rect>
                <circle cx="70" cy="60" r="16" fill="url(#ballGrad)" stroke="rgba(255,255,255,.6)" strokeWidth="2">
                  <animate attributeName="cx" values="70;520;70" dur="6s" repeatCount="indefinite"/>
                </circle>
              </svg>
            </div>
            <div className="text-2xl font-bold">Create your Matobev account</div>
            <div className="text-white/90 mt-2">Select your role and details to personalize your dashboard.</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-6 shadow-xl border">
            <div className="text-center">
              <div className="text-2xl font-bold">Sign up</div>
              <div className="text-slate-600 text-sm">Join players and scouts across Africa</div>
            </div>
            {errorMsg && <Alert variant="error" className="mt-4">{errorMsg}</Alert>}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Select label="Register as" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                <option value="player">Player</option>
                <option value="scout">Scout</option>
              </Select>
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Input label="Position" value={position} onChange={(e) => setPosition(e.target.value)} />
              <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                {AFRICAN_COUNTRIES.map((c: any) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </Select>
              <Input label="Current Club" value={club} onChange={(e) => setClub(e.target.value)} />
              <Input label="League" value={league} onChange={(e) => setLeague(e.target.value)} />
              <Button type="submit" disabled={loading} fullWidth>{loading ? "Creating account..." : "Create account"}</Button>
            </form>
            {success && (
              <div className="mt-4 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-green-100 border border-green-200 grid place-items-center" style={{ animation: 'pop 400ms ease-out' }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" className="text-green-600">
                    <path fill="currentColor" d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z"/>
                  </svg>
                </div>
              </div>
            )}
            <div className="mt-4 text-center text-sm">
              Already have an account? <a className="text-blue-700 font-medium" href="/login">Log in</a>
            </div>
          </div>
          <div className="text-center text-white/90 text-xs mt-4">
            By creating an account you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
