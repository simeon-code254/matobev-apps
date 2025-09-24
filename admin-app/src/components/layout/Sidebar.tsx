import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Video, 
  Calendar, 
  Newspaper, 
  BarChart3, 
  Settings, 
  MessageSquare,
  Shield,
  Database
} from 'lucide-react';

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

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      current: true
    },
    {
      name: 'Users',
      href: '/admin/users',
      icon: Users,
      current: false
    },
    {
      name: 'Videos',
      href: '/admin/videos',
      icon: Video,
      current: false
    },
    {
      name: 'Trials',
      href: '/admin/trials',
      icon: Calendar,
      current: false
    },
    {
      name: 'News',
      href: '/admin/news',
      icon: Newspaper,
      current: false
    },
    {
      name: 'Messages',
      href: '/admin/messages',
      icon: MessageSquare,
      current: false
    },
    {
      name: 'Analytics',
      href: '/admin/analytics',
      icon: BarChart3,
      current: false
    }
  ];

  const systemItems = [
    {
      name: 'Database',
      href: '/admin/database',
      icon: Database,
      current: false
    },
    {
      name: 'Security',
      href: '/admin/security',
      icon: Shield,
      current: false
    },
    {
      name: 'Settings',
      href: '/admin/settings',
      icon: Settings,
      current: false
    }
  ];

  return (
    <aside className="hidden md:block w-64 bg-white border-r border-slate-200">
      <div className="sticky top-[64px] h-[calc(100vh-64px)] overflow-y-auto">
        <div className="p-6">
          {/* Admin Profile */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-pink-600 overflow-hidden">
              {profile.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt={profile.full_name || "Admin"} 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                  {(profile.full_name || "A").charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-slate-900 text-sm">
                {profile.full_name || "Administrator"}
              </div>
              <div className="text-xs text-slate-500">
                System Administrator
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <nav className="space-y-2">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Management
            </div>
            {navigationItems.map((item) => {
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

          {/* System */}
          <div className="mt-8">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              System
            </div>
            <nav className="space-y-2">
              {systemItems.map((item) => {
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
            </nav>
          </div>

          {/* Quick Stats */}
          <div className="mt-8 p-4 bg-slate-50 rounded-lg border border-slate-200">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Quick Stats
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600">Active Users</span>
                <span className="font-medium text-slate-900">1,234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Total Videos</span>
                <span className="font-medium text-slate-900">5,678</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Pending Trials</span>
                <span className="font-medium text-slate-900">23</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
