import { useState } from "react";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const correct = import.meta.env.VITE_ADMIN_PASSWORD as string;

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    if (!correct) {
      setErr("Admin password not configured.");
      return;
    }
    if (pw === correct) {
      const session = {
        token: "ok",
        exp: Date.now() + 6 * 60 * 60 * 1000,
      };
      localStorage.setItem("matobev_admin_session", JSON.stringify(session));
      window.location.href = "/dashboard";
    } else {
      setErr("Invalid password");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-blue-700">
      <form onSubmit={onSubmit} className="bg-white/85 backdrop-blur rounded-2xl p-6 w-80 shadow-lg border">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold">Matobev Admin</div>
          <div className="text-slate-600 text-sm">Enter password to continue</div>
        </div>
        {err ? <div className="mb-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{err}</div> : null}
        <input
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          type="password"
          className="w-full border rounded px-3 py-2 mb-3"
        />
        <button className="w-full bg-blue-700 hover:bg-blue-800 transition text-white rounded px-3 py-2">
          Enter
        </button>
      </form>
    </div>
  );
}
