import { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import { AFRICAN_COUNTRIES, UserRole } from "@matobev/shared";
import Button from "../components/ui/Button";
import Select from "../components/ui/Select";
import Alert from "../components/ui/Alert";

function AuthPage() {
  const [phase, setPhase] = useState<"signin" | "onboard" | "done">("signin");
  const [role, setRole] = useState<UserRole>("player");
  const [country, setCountry] = useState("KE");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }: any) => {
      if (data.user) setPhase("onboard");
    });
  }, []);

  const signInWithGoogle = async () => {
    setErrorMsg(null);
    setLoading(true);
    try {
      const redirectTo = (import.meta as any).env.VITE_AUTH_REDIRECT_URL as string | undefined;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo, skipBrowserRedirect: false },
      });
      if (error) setErrorMsg(error.message || "Google sign-in failed");
    } catch (e: any) {
      setErrorMsg(e?.message || "Unexpected error during Google sign-in");
    } finally {
      setLoading(false);
    }
  };

  const completeOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setErrorMsg("Not authenticated.");
      return;
    }
    const { error } = await supabase.from("profiles").upsert({
      id: user.id,
      role,
      country,
    });
    if (error) {
      setErrorMsg(error.message || "Failed to save profile");
      return;
    }
    setPhase("done");
    window.location.href = "/dashboard";
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-gradient-to-br from-blue-500 to-blue-700">
      <div className="relative hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.25),transparent_60%)]" />
        <div className="h-full w-full flex items-end p-10">
          <div className="rounded-2xl bg-white/10 border border-white/20 backdrop-blur p-6 text-white max-w-md">
            <div className="text-2xl font-bold">Matobev</div>
            <div className="text-white/90 mt-2">
              Showcase your talent. Upload match clips and get an AI-generated Player Card scouts can trust.
            </div>
            <div className="grid grid-cols-3 gap-3 mt-6">
              <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                <div className="text-xl font-extrabold">54</div>
                <div className="text-xs">Countries</div>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                <div className="text-xl font-extrabold">5</div>
                <div className="text-xs">Key Stats</div>
              </div>
              <div className="rounded-xl bg-white/10 border border-white/20 p-3">
                <div className="text-xl font-extrabold">Realtime</div>
                <div className="text-xs">Messaging</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="rounded-2xl bg-white p-6 shadow-xl border">
            <div className="text-center">
              <div className="text-2xl font-bold">Welcome to Matobev</div>
              <div className="text-slate-600 text-sm">Sign in with Google to continue</div>
            </div>

            {errorMsg && <Alert variant="error" className="mt-4">{errorMsg}</Alert>}

            {phase === "signin" && (
              <div className="mt-6">
                <Button onClick={signInWithGoogle} disabled={loading} className="mt-1" fullWidth>
                  {loading ? "Redirecting..." : "Continue with Google"}
                </Button>
              </div>
            )}

            {phase === "onboard" && (
              <div className="mt-6">
                <div className="grid gap-4">
                  <Select label="Role" value={role} onChange={(e) => setRole(e.target.value as UserRole)}>
                    <option value="player">Player</option>
                    <option value="scout">Scout</option>
                  </Select>
                  <Select label="Country" value={country} onChange={(e) => setCountry(e.target.value)}>
                    {AFRICAN_COUNTRIES.map((c: any) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </Select>
                </div>
                <Button onClick={completeOnboarding} className="mt-4" fullWidth>
                  Complete
                </Button>
              </div>
            )}

            {phase === "done" && <div className="mt-6 text-center text-slate-600">Redirecting…</div>}
          </div>

          <div className="text-center text-white/90 text-xs mt-4">
            By continuing you agree to our Terms and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
}
export default AuthPage;
