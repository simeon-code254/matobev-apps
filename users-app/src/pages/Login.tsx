import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import Alert from "../components/ui/Alert";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string|null>(null);
  const [infoMsg, setInfoMsg] = useState<string|null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      if (data.user) window.location.href = "/dashboard";
    });
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      window.location.href = "/dashboard";
    } catch (err: any) {
      setErrorMsg("Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  const onReset = async () => {
    setErrorMsg(null);
    setInfoMsg(null);
    if (!email) {
      setErrorMsg("Enter your email first");
      return;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + "/login",
    });
    if (error) setErrorMsg(error.message);
    else setInfoMsg("If this email exists, a reset link has been sent.");
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="h-full w-full flex items-end p-10">
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-6 text-white max-w-md">
            <div className="text-2xl font-bold">Welcome back</div>
            <div className="text-white/90 mt-2">Log in to access your personalized dashboard.</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-6 shadow-xl border">
            <div className="text-center">
              <div className="text-2xl font-bold">Log in</div>
              <div className="text-slate-600 text-sm">Use your email and password</div>
            </div>
            {errorMsg && <Alert variant="error" className="mt-4">{errorMsg}</Alert>}
            {infoMsg && <Alert variant="success" className="mt-4">{infoMsg}</Alert>}
            <form onSubmit={onSubmit} className="mt-6 grid gap-4">
              <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <Button type="submit" disabled={loading} fullWidth>{loading ? "Signing in..." : "Sign in"}</Button>
            </form>
            <div className="mt-3 text-right">
              <button onClick={onReset} className="text-sm text-blue-700 hover:underline">Forgot password?</button>
            </div>
            <div className="mt-4 text-center text-sm">
              New here? <a className="text-blue-700 font-medium" href="/signup">Create an account</a>
            </div>
          </div>
          <div className="text-center text-white/90 text-xs mt-4">
            Need help? Contact support.
          </div>
        </div>
      </div>
    </div>
  );
}
