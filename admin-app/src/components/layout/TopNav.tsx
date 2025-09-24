import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Bell, Settings, LogOut, User } from 'lucide-react';

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface TopNavProps {
  profile: Profile | null;
}

export default function TopNav({ profile }: TopNavProps) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/login';
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-7xl px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">M</span>
          </div>
          <div>
            <div className="font-bold text-slate-900">Matobev Admin</div>
            <div className="text-xs text-slate-500">Management Dashboard</div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          <a href="/admin/dashboard" className="text-slate-700 hover:text-indigo-700 font-medium">Dashboard</a>
          <a href="/admin/users" className="text-slate-700 hover:text-indigo-700">Users</a>
          <a href="/admin/videos" className="text-slate-700 hover:text-indigo-700">Videos</a>
          <a href="/admin/trials" className="text-slate-700 hover:text-indigo-700">Trials</a>
          <a href="/admin/news" className="text-slate-700 hover:text-indigo-700">News</a>
          <a href="/admin/analytics" className="text-slate-700 hover:text-indigo-700">Analytics</a>
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
          </button>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-medium text-slate-900">
                {profile?.full_name || 'Admin'}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {profile?.role || 'Administrator'}
              </div>
            </div>
            
            <div className="relative group">
              <button className="flex items-center gap-2 p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || "Admin"} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                      {(profile?.full_name || "A").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {/* Dropdown */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <a
                    href="/admin/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <User className="w-4 h-4" />
                    Profile
                  </a>
                  <a
                    href="/admin/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </a>
                  <div className="border-t border-slate-200 my-1"></div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
