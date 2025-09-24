import React from 'react';
import { Home, Video, Users, Calendar, BarChart3, MessageSquare, Settings, Upload, Plus, Newspaper } from 'lucide-react';

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface SidebarProps {
  profile: Profile | null;
}

export function Sidebar({ profile }: SidebarProps) {
  if (!profile) return null;

  const isPlayer = profile.role === 'player';
  const isScout = profile.role === 'scout';
  const isAdmin = profile.role === 'admin';

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      current: true
    },
    {
      name: 'Feed',
      href: '/feed',
      icon: Video,
      current: false
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: false,
      show: isPlayer
    },
    {
      name: 'Calendar',
      href: '/calendar',
      icon: Calendar,
      current: false,
      show: isPlayer
    },
    {
      name: 'Players',
      href: '/players',
      icon: Users,
      current: false,
      show: isScout || isAdmin
    },
    {
      name: 'Messages',
      href: '/messages',
      icon: MessageSquare,
      current: false
    },
    {
      name: 'News',
      href: '/news',
      icon: Newspaper,
      current: false
    }
  ];

  const actionItems = [
    {
      name: 'Upload Video',
      href: '/upload',
      icon: Upload,
      show: isPlayer
    },
    {
      name: 'Post Trial',
      href: '/post-trial',
      icon: Plus,
      show: isScout
    }
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-slate-200">
      <div className="sticky top-[72px] h-[calc(100vh-72px)] overflow-y-auto">
        <div className="p-6">
          {/* User Profile */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || "User"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  {(profile.full_name || "U").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">
                {profile.full_name || "User"}
              </div>
              <div className="text-xs text-slate-500 capitalize">
                {profile.role || "Player"}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Navigation
            </div>
            {navigationItems.map((item) => {
              if (item.show === false) return null;
              const Icon = item.icon;
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </a>
              );
            })}
          </nav>

          {/* Actions */}
          {actionItems.some(item => item.show) && (
            <div className="mt-8">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Quick Actions
              </div>
              <div className="space-y-2">
                {actionItems.map((item) => {
                  if (!item.show) return null;
                  const Icon = item.icon;
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Icon className="w-4 h-4" />
                      {item.name}
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Settings */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <a
              href="/settings"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Settings
            </a>
          </div>
        </div>
      </div>
    </aside>
  );
}
