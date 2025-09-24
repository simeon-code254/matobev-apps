import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";
import TopNav from "../components/layout/TopNav";
import { Sidebar } from "../components/layout/Sidebar";
import DashCard from "../components/ui/DashCard";
import { useVideos } from "../lib/api/useVideos";
import { useTrials } from "../lib/api/useTrials";
import { useNews } from "../lib/api/useNews";
import { useMessagesPreview } from "../lib/api/useMessagesPreview";
import { useUsers } from "../lib/api/useUsers";

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  country?: string;
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalVideos: 0,
    totalTrials: 0,
    totalNews: 0,
    totalMessages: 0
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('id, full_name, avatar_url, role, country')
            .eq('id', user.id)
            .single();
          if (error) throw error;
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      }
    };

    const loadStats = async () => {
      try {
        const [usersResult, videosResult, trialsResult, newsResult, messagesResult] = await Promise.all([
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('videos').select('id', { count: 'exact' }),
          supabase.from('trials').select('id', { count: 'exact' }),
          supabase.from('news').select('id', { count: 'exact' }),
          supabase.from('messages').select('id', { count: 'exact' })
        ]);

        setStats({
          totalUsers: usersResult.count || 0,
          totalVideos: videosResult.count || 0,
          totalTrials: trialsResult.count || 0,
          totalNews: newsResult.count || 0,
          totalMessages: messagesResult.count || 0
        });
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    };

    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadProfile(), loadStats()]);
      setLoading(false);
    };

    loadData();
  }, []);

  const videosHook = useVideos(6);
  const trialsHook = useTrials(6);
  const newsHook = useNews(6);
  const messagesHook = useMessagesPreview(3);
  const usersHook = useUsers(6);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-4">Please log in</h1>
          <a href="/login" className="text-indigo-600 hover:text-indigo-700">Go to Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      <Sidebar profile={profile} />
      <div className="flex-1 flex flex-col">
        <TopNav profile={profile} />
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">
                Welcome back, {profile.full_name || 'Admin'}!
              </h1>
              <p className="text-slate-600">
                Manage your platform and oversee all activities
              </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Users</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalUsers}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Videos</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalVideos}</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Trials</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalTrials}</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total News</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalNews}</p>
                  </div>
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">Total Messages</p>
                    <p className="text-3xl font-bold text-slate-900">{stats.totalMessages}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <a
                href="/admin/news"
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Manage News</h3>
                    <p className="text-sm text-slate-600">Create and edit news articles</p>
                  </div>
                </div>
              </a>

              <a
                href="/admin/trials"
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Manage Trials</h3>
                    <p className="text-sm text-slate-600">Oversee trial postings</p>
                  </div>
                </div>
              </a>

              <a
                href="/admin/tournaments"
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Manage Tournaments</h3>
                    <p className="text-sm text-slate-600">Post upcoming tournaments</p>
                  </div>
                </div>
              </a>

              <a
                href="/admin/users"
                className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">Manage Users</h3>
                    <p className="text-sm text-slate-600">View and manage users</p>
                  </div>
                </div>
              </a>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <DashCard title="Recent Videos" action={<a href="/admin/videos" className="text-sm text-blue-700">View All</a>}>
                {videosHook.loading ? (
                  <div className="text-slate-600 text-sm">Loading...</div>
                ) : videosHook.data.length === 0 ? (
                  <div className="text-slate-600 text-sm">No videos yet.</div>
                ) : (
                  <div className="space-y-3">
                    {videosHook.data.map((video: any) => (
                      <div key={video.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-12 h-12 bg-slate-200 rounded-lg flex items-center justify-center">
                          <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{video.title || "Untitled Video"}</div>
                          <div className="text-sm text-slate-500">
                            by {video.profiles?.full_name || "Unknown"} • {new Date(video.created_at).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashCard>

              <DashCard title="Recent Trials" action={<a href="/admin/trials" className="text-sm text-blue-700">View All</a>}>
                {trialsHook.loading ? (
                  <div className="text-slate-600 text-sm">Loading...</div>
                ) : trialsHook.data.length === 0 ? (
                  <div className="text-slate-600 text-sm">No trials yet.</div>
                ) : (
                  <div className="space-y-3">
                    {trialsHook.data.map((trial: any) => (
                      <div key={trial.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="font-medium text-slate-900">{trial.title}</div>
                        <div className="text-sm text-slate-500">
                          {trial.country} • {trial.date ? new Date(trial.date).toLocaleDateString() : ""}
                        </div>
                        <div className="text-xs text-slate-400 mt-1">
                          by {trial.profiles?.full_name || "Unknown"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashCard>

              <DashCard title="Recent News" action={<a href="/admin/news" className="text-sm text-blue-700">View All</a>}>
                {newsHook.loading ? (
                  <div className="text-slate-600 text-sm">Loading...</div>
                ) : newsHook.data.length === 0 ? (
                  <div className="text-slate-600 text-sm">No news yet.</div>
                ) : (
                  <div className="space-y-3">
                    {newsHook.data.map((news: any) => (
                      <div key={news.id} className="p-3 bg-slate-50 rounded-lg">
                        <div className="font-medium text-slate-900">{news.title}</div>
                        <div className="text-sm text-slate-500">
                          {new Date(news.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashCard>

              <DashCard title="Recent Users" action={<a href="/admin/users" className="text-sm text-blue-700">View All</a>}>
                {usersHook.loading ? (
                  <div className="text-slate-600 text-sm">Loading...</div>
                ) : usersHook.data.length === 0 ? (
                  <div className="text-slate-600 text-sm">No users yet.</div>
                ) : (
                  <div className="space-y-3">
                    {usersHook.data.map((user: any) => (
                      <div key={user.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                        <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <span className="text-sm font-medium text-slate-600">
                              {(user.full_name || "U").charAt(0).toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-slate-900">{user.full_name || "Unknown"}</div>
                          <div className="text-sm text-slate-500">
                            {user.role} • {user.country}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </DashCard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}