import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import TopNav from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { usePlayerCard } from '../lib/useProfile';
import { playerCardEventManager } from '../lib/playerCardEvents';
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface VideoAnalysis {
  id: string;
  video_id: string;
  player_id: string;
  analysis_date: string;
  metrics: {
    speed: number;
    stamina: number;
    shooting_accuracy: number;
    passing_accuracy: number;
    strength: number;
    dribbling: number;
    overall_rating: number;
  };
  video_url: string;
  video_title?: string;
  created_at: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: JSX.Element;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon, color }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-sm border border-slate-200 flex items-start gap-4`}>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color} bg-opacity-20`}>
      {React.cloneElement(icon, { className: `w-6 h-6 ${color.replace('bg-', 'text-')}` })}
    </div>
    <div>
      <p className="text-sm font-medium text-slate-600">{title}</p>
      <p className="text-3xl font-bold text-slate-900 mt-1">{value}</p>
      <p className="text-xs text-slate-500 mt-1">{description}</p>
    </div>
  </div>
);

export default function Analytics() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analysisHistory, setAnalysisHistory] = useState<VideoAnalysis[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<VideoAnalysis | null>(null);
  const playerCardHook = usePlayerCard();

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, []);

  const fetchAnalysisHistory = useCallback(async (range: '7d' | '30d' | '90d' | '1y') => {
    if (!profile?.id) return;

    setLoading(true);
    try {
      const now = new Date();
      let startDate = new Date();

      switch (range) {
        case '7d': startDate.setDate(now.getDate() - 7); break;
        case '30d': startDate.setMonth(now.getMonth() - 1); break;
        case '90d': startDate.setMonth(now.getMonth() - 3); break;
        case '1y': startDate.setFullYear(now.getFullYear() - 1); break;
      }

      const { data, error } = await supabase
        .from('video_analysis')
        .select('*')
        .eq('player_id', profile.id)
        .gte('analysis_date', startDate.toISOString())
        .order('analysis_date', { ascending: false });

      if (error) throw error;
      setAnalysisHistory(data || []);
      if (data && data.length > 0) {
        setSelectedAnalysis(data[0]); // Select the latest analysis by default
      } else {
        setSelectedAnalysis(null);
      }
    } catch (error) {
      console.error('Error fetching analysis history:', error);
      setAnalysisHistory([]);
      setSelectedAnalysis(null);
    } finally {
      setLoading(false);
    }
  }, [profile?.id]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (profile?.id) {
      fetchAnalysisHistory(timeRange);
    }
  }, [profile?.id, timeRange, fetchAnalysisHistory]);

  // Auto-refresh data when page becomes visible
  useEffect(() => {
    const handleFocus = () => {
      fetchAnalysisHistory(timeRange);
      playerCardHook.refetch();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchAnalysisHistory(timeRange);
        playerCardHook.refetch();
      }
    };

    // Listen for player card updates from other components
    const handlePlayerCardUpdate = (playerId: string, stats: any) => {
      if (profile?.id === playerId) {
        console.log("Player card updated from another component - refreshing analytics data");
        fetchAnalysisHistory(timeRange);
        playerCardHook.refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add player card update listener
    playerCardEventManager.addListener(handlePlayerCardUpdate);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      playerCardEventManager.removeListener(handlePlayerCardUpdate);
    };
  }, [fetchAnalysisHistory, timeRange, playerCardHook, profile?.id]);

  const handleAnalysisClick = (analysis: VideoAnalysis) => {
    setSelectedAnalysis(analysis);
  };

  const getChartData = () => {
    if (!analysisHistory.length) return [];
    const sortedHistory = [...analysisHistory].sort((a, b) => new Date(a.analysis_date).getTime() - new Date(b.analysis_date).getTime());
    return sortedHistory.map(analysis => ({
      date: format(new Date(analysis.analysis_date), 'MMM dd'),
      Speed: analysis.metrics.speed,
      Stamina: analysis.metrics.stamina,
      Shooting: analysis.metrics.shooting_accuracy,
      Passing: analysis.metrics.passing_accuracy,
      Strength: analysis.metrics.strength,
      Dribbling: analysis.metrics.dribbling,
      Overall: analysis.metrics.overall_rating,
    }));
  };

  const latestMetrics = selectedAnalysis?.metrics || playerCardHook.data;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
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
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Analytics Dashboard</h1>
              <p className="text-slate-600">Track your performance and engagement</p>
            </div>

            {/* Time Range Selector */}
            <div className="mb-6">
              <div className="flex gap-2">
                {(['7d', '30d', '90d', '1y'] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                      timeRange === range
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {range === '7d' ? 'Last 7 Days' : range === '30d' ? 'Last 30 Days' : range === '90d' ? 'Last 90 Days' : 'Last Year'}
                  </button>
                ))}
              </div>
            </div>

            {/* Overview Stats */}
            {latestMetrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                  title="Overall Rating"
                  value={latestMetrics.overall_rating?.toFixed(1) || 'N/A'}
                  description="Latest calculated overall performance"
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
                  color="bg-indigo-500"
                />
                <StatCard
                  title="Avg Speed"
                  value={latestMetrics.speed?.toFixed(1) || 'N/A'}
                  description="Average speed during gameplay"
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>}
                  color="bg-blue-500"
                />
                <StatCard
                  title="Avg Stamina"
                  value={latestMetrics.stamina?.toFixed(1) || 'N/A'}
                  description="Average stamina during gameplay"
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>}
                  color="bg-green-500"
                />
                <StatCard
                  title="Shooting Acc."
                  value={`${latestMetrics.shooting_accuracy?.toFixed(1) || 'N/A'}%`}
                  description="Accuracy of shots on target"
                  icon={<svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>}
                  color="bg-red-500"
                />
              </div>
            ) : (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8 text-center text-slate-600">
                No analysis data available for the selected period. Upload a video to get started!
              </div>
            )}

            {/* Performance Trend Chart */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
              <h3 className="text-xl font-semibold text-slate-900 mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={getChartData()} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                    labelStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    itemStyle={{ color: '#475569' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="Speed" stroke="#3b82f6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Stamina" stroke="#22c55e" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Shooting" stroke="#ef4444" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Passing" stroke="#a855f7" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Dribbling" stroke="#f97316" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Strength" stroke="#14b8a6" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="Overall" stroke="#6366f1" strokeWidth={3} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed Analysis & History */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Detailed Analysis</h3>
                {selectedAnalysis ? (
                  <div className="space-y-4">
                    <p className="text-sm text-slate-600">
                      Analysis Date: <span className="font-medium text-slate-800">{format(new Date(selectedAnalysis.analysis_date), 'PPP p')}</span>
                    </p>
                    <p className="text-sm text-slate-600">
                      Video: <a href={selectedAnalysis.video_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{selectedAnalysis.video_title || 'View Video'}</a>
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Speed</p>
                        <p className="text-lg font-bold text-slate-900">{selectedAnalysis.metrics.speed.toFixed(1)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Stamina</p>
                        <p className="text-lg font-bold text-slate-900">{selectedAnalysis.metrics.stamina.toFixed(1)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Shooting Accuracy</p>
                        <p className="text-lg font-bold text-slate-900">{selectedAnalysis.metrics.shooting_accuracy.toFixed(1)}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Passing Accuracy</p>
                        <p className="text-lg font-bold text-slate-900">{selectedAnalysis.metrics.passing_accuracy.toFixed(1)}%</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Strength</p>
                        <p className="text-lg font-bold text-slate-900">{selectedAnalysis.metrics.strength.toFixed(1)}</p>
                      </div>
                      <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
                        <p className="text-sm font-medium text-slate-700">Dribbling</p>
                        <p className="text-lg font-bold text-slate-900">{selectedAnalysis.metrics.dribbling.toFixed(1)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-slate-600 py-8">
                    Select an analysis from the history to view details.
                  </div>
                )}
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-xl font-semibold text-slate-900 mb-4">Analysis History</h3>
                {analysisHistory.length > 0 ? (
                  <div className="space-y-3">
                    {analysisHistory.map((analysis) => (
                      <button
                        key={analysis.id}
                        onClick={() => handleAnalysisClick(analysis)}
                        className={`w-full text-left p-3 rounded-lg border transition-colors ${
                          selectedAnalysis?.id === analysis.id
                            ? 'border-indigo-400 bg-indigo-50 shadow-sm'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <p className="font-medium text-slate-900">{analysis.video_title || `Analysis on ${format(new Date(analysis.analysis_date), 'MMM dd, yyyy')}`}</p>
                        <p className="text-sm text-slate-600">Overall: {analysis.metrics.overall_rating.toFixed(1)}</p>
                        <p className="text-xs text-slate-500">{format(new Date(analysis.analysis_date), 'PPP p')}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-slate-600 py-8">
                    No past analyses found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
