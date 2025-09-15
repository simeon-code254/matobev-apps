import { supabase } from "../../lib/supabaseClient";

type Props = {
  profile: {
    role: string;
    avatar_url?: string|null;
  };
};

export default function TopNav({ profile }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
      <div className="mx-auto max-w-7xl px-4 h-14 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700" />
          <div className="font-semibold text-slate-800">Matobev</div>
        </a>
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/dashboard" className="text-slate-700 hover:text-blue-700">Home</a>
          <a href="/feed" className="text-slate-700 hover:text-blue-700">Feed</a>
          <a href="/upload" className="text-slate-700 hover:text-blue-700">Videos</a>
          <a href="/trials" className="text-slate-700 hover:text-blue-700">Trials</a>
          <a href="/messages" className="text-slate-700 hover:text-blue-700">Messages</a>
          <a href="/profile" className="text-slate-700 hover:text-blue-700">Profile</a>
        </nav>
        <div className="flex items-center gap-3">
          <div className="hidden md:block text-xs text-slate-500">Role: {profile.role}</div>
          <div className="h-8 w-8 rounded-full bg-blue-200 overflow-hidden">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="avatar" className="h-full w-full object-cover" /> : null}
          </div>
          <div className="relative">
            <details>
              <summary className="list-none cursor-pointer text-sm px-2 py-1 rounded border hover:bg-slate-50">Menu</summary>
              <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow">
                <a className="block px-3 py-2 text-sm hover:bg-slate-50" href="/settings">Settings</a>
                <button
                  className="block w-full text-left px-3 py-2 text-sm hover:bg-slate-50"
                  onClick={async () => { await supabase.auth.signOut(); window.location.href = "/"; }}
                >
                  Logout
                </button>
              </div>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
