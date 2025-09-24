import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import TopNav from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import PlayableVideoCard from '../components/ui/PlayableVideoCard';
import { usePlayerCard } from '../lib/useProfile';
import { playerCardEventManager } from '../lib/playerCardEvents';
import StatusViewer from '../components/status/StatusViewer';
import StatusUpload from '../components/status/StatusUpload';
import { CountryFlag } from '../components/ui/CountryFlag';

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
  country?: string;
  position?: string | null;
  team?: string | null;
  league?: string | null;
}

interface Video {
  id: string;
  title?: string | null;
  thumbnail_url?: string | null;
  file_url: string;
  stats?: any;
  created_at?: string;
  profiles?: {
    id: string;
    full_name?: string | null;
    country?: string;
    avatar_url?: string | null;
  };
}

interface Status {
  id: string;
  user_id: string;
  video_url: string;
  thumbnail_url?: string;
  created_at: string;
  profiles?: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export default function Dashboard() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [videos, setVideos] = useState<Video[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [loading, setLoading] = useState(true);
  const [showStatusUpload, setShowStatusUpload] = useState(false);
  const [showStatusViewer, setShowStatusViewer] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<Status | null>(null);
  const [selectedStatusOwner, setSelectedStatusOwner] = useState<Profile | null>(null);
  const [playerCardHook] = usePlayerCard();

  const loadProfile = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData, error } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url, role, country, position, team, league')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfile(profileData);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, []);

  const loadVideos = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id, title, thumbnail_url, file_url, stats, created_at,
          profiles!videos_user_id_fkey (id, full_name, country, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }, []);

  const loadStatuses = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('statuses')
        .select(`
          id, user_id, video_url, thumbnail_url, created_at,
          profiles!statuses_user_id_fkey (id, full_name, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setStatuses(data || []);
    } catch (error) {
      console.error('Error loading statuses:', error);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([
        loadProfile(),
        loadVideos(),
        loadStatuses()
      ]);
      setLoading(false);
    };
    loadData();
  }, [loadProfile, loadVideos, loadStatuses]);

  // Auto-refresh data when page becomes visible
  useEffect(() => {
    const handleFocus = () => {
      loadVideos();
      loadStatuses();
      if (playerCardHook) {
        playerCardHook.refetch();
      }
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadVideos();
        loadStatuses();
        if (playerCardHook) {
          playerCardHook.refetch();
        }
      }
    };

    // Listen for player card updates from other components
    const handlePlayerCardUpdate = (playerId: string, stats: any) => {
      if (profile?.id === playerId) {
        console.log("Player card updated from another component - refreshing data");
        playerCardHook.refetch();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Add player card update listener
    import("../lib/playerCardEvents").then(({ playerCardEventManager }) => {
      playerCardEventManager.addListener(handlePlayerCardUpdate);
    });

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      
      // Remove player card update listener
      import("../lib/playerCardEvents").then(({ playerCardEventManager }) => {
        playerCardEventManager.removeListener(handlePlayerCardUpdate);
      });
    };
  }, [loadVideos, loadStatuses, playerCardHook, profile?.id]);

  const handleOpenStatus = (status: Status, owner: Profile, allStatuses: Status[]) => {
    setSelectedStatus(status);
    setSelectedStatusOwner({ ...owner, statuses: allStatuses });
    setShowStatusViewer(true);
  };

  const handleCloseStatusViewer = () => {
    setShowStatusViewer(false);
    setSelectedStatus(null);
    setSelectedStatusOwner(null);
  };

  const handleStatusUploaded = () => {
    loadStatuses();
    setShowStatusUpload(false);
  };

  // Group statuses by user
  const usersWithStatuses = statuses.reduce((acc, status) => {
    const userId = status.user_id;
    if (!acc[userId]) {
      acc[userId] = {
        id: userId,
        full_name: status.profiles?.full_name,
        avatar_url: status.profiles?.avatar_url,
        statuses: [],
        latestStatus: status
      };
    }
    acc[userId].statuses.push(status);
    return acc;
  }, {} as Record<string, any>);

  const usersWithStatusesArray = Object.values(usersWithStatuses);
  const currentUserStatuses = usersWithStatusesArray.find(user => user.id === profile?.id)?.statuses || [];
  const currentUserHasStatus = currentUserStatuses.length > 0;

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

  const renderStatusSection = () => {
    if (statuses.length === 0) {
      return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">Status Updates</h3>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-slate-500">Live</span>
            </div>
          </div>
          
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Share Your Story</h4>
              <p className="text-slate-600 mb-6 max-w-sm">Connect with your community by sharing quick video updates about your training, matches, or achievements.</p>
              <button
                onClick={() => setShowStatusUpload(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create Your First Status
              </button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Status Updates</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-slate-500">Live</span>
          </div>
        </div>
        
        <div className="flex gap-3 md:gap-4 overflow-x-auto pb-2 scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
          {/* Add Your Story */}
          <div 
            className="flex flex-col items-center gap-2 min-w-[60px] md:min-w-[70px] cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => {
              if (currentUserStatuses.length > 0) {
                const profileWithStatuses = {
                  ...profile,
                  statuses: currentUserStatuses
                };
                handleOpenStatus(currentUserStatuses[0], profileWithStatuses, currentUserStatuses);
              } else {
                setShowStatusUpload(true);
              }
            }}
          >
            <div className="relative">
              {currentUserHasStatus ? (
                <div className="w-18 h-18 rounded-full p-0.5 bg-gradient-to-tr from-blue-400 via-blue-500 to-blue-600">
                  <div className="w-16 h-16 rounded-full bg-white p-0.5">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt={profile.full_name || "You"} 
                          className="w-full h-full object-cover object-center"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                          {(profile?.full_name || "Y").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden border-2 border-white shadow-md">
                  {profile?.avatar_url ? (
                    <img 
                      src={profile.avatar_url} 
                      alt={profile.full_name || "You"} 
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold">
                      {(profile?.full_name || "Y").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center">
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
            </div>
            <span className="text-xs text-slate-600 text-center truncate w-full">
              {currentUserHasStatus ? `Your Story (${currentUserStatuses.length})` : 'Your Story'}
            </span>
          </div>

          {/* Other Users' Stories */}
          {usersWithStatusesArray.slice(0, 8).map((user) => (
            <div 
              key={user.id} 
              className="flex flex-col items-center gap-2 min-w-[60px] md:min-w-[70px] cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => {
                if (user.latestStatus) {
                  const userWithStatuses = {
                    ...user,
                    statuses: user.statuses || [user.latestStatus]
                  };
                  handleOpenStatus(user.latestStatus, userWithStatuses, user.statuses || [user.latestStatus]);
                }
              }}
            >
              <div className="relative">
                <div className="w-18 h-18 rounded-full p-0.5 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500">
                  <div className="w-16 h-16 rounded-full bg-white p-0.5">
                    <div className="w-15 h-15 rounded-full bg-gradient-to-br from-pink-500 to-red-600 overflow-hidden">
                      {user.avatar_url ? (
                        <img 
                          src={user.avatar_url} 
                          alt={user.full_name || "User"} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 text-lg font-semibold">
                          {user.full_name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-2 border-white rounded-full"></div>
              </div>
              <span className="text-xs text-center text-slate-600 font-medium">{user.full_name?.split(' ')[0] || 'User'}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

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
                Welcome back, {profile.full_name || 'Player'}!
              </h1>
              <p className="text-slate-600">
                {profile.role === 'player' 
                  ? 'Track your performance and connect with scouts' 
                  : 'Discover talented players and manage trials'
                }
              </p>
            </div>

            {/* Status Updates Section */}
            {renderStatusSection()}

            {/* AI Analysis Button for Players */}
            {profile.role === 'player' && (
              <div className="mt-6 mb-8">
                <a
                  href="/video-analysis"
                  className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  AI Video Analysis
                </a>
              </div>
            )}

            {/* Your Performance Videos Section */}
            {profile.role === 'player' && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-slate-900">Your Performance Videos</h2>
                  <a
                    href="/upload"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Upload Video
                  </a>
                </div>
                
                {videos.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No videos yet</h3>
                    <p className="text-slate-600 mb-6">Upload your first performance video to get started with AI analysis</p>
                    <a
                      href="/upload"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Upload Your First Video
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {videos.map((video) => (
                      <PlayableVideoCard 
                        key={video.id} 
                        video={video} 
                        showStats={false}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Player Card Section */}
            {profile.role === 'player' && playerCardHook && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 mb-8">
                <h2 className="text-xl font-semibold text-slate-900 mb-6">Your Player Card</h2>
                {playerCardHook.loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                  </div>
                ) : playerCardHook.data ? (
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden border-4 border-white shadow-lg">
                          {profile.avatar_url ? (
                            <img 
                              src={profile.avatar_url} 
                              alt={profile.full_name || "Player"} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                              {(profile.full_name || "P").charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-slate-900">{profile.full_name || "Player"}</h3>
                          <p className="text-slate-600">{profile.position || "Position"} • {profile.team || "Team"}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <CountryFlag country={profile.country || "US"} size="sm" />
                            <span className="text-sm text-slate-500">{profile.country}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-indigo-600 mb-2">
                          {playerCardHook.data.overall_rating || 0}
                        </div>
                        <div className="text-sm text-slate-600">Overall Rating</div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { key: 'pace', label: 'Pace', value: playerCardHook.data.pace || 0 },
                          { key: 'shooting', label: 'Shooting', value: playerCardHook.data.shooting || 0 },
                          { key: 'passing', label: 'Passing', value: playerCardHook.data.passing || 0 },
                          { key: 'dribbling', label: 'Dribbling', value: playerCardHook.data.dribbling || 0 },
                          { key: 'defending', label: 'Defending', value: playerCardHook.data.defending || 0 },
                          { key: 'physical', label: 'Physical', value: playerCardHook.data.physical || 0 }
                        ].map((stat) => (
                          <div key={stat.key} className="text-center">
                            <div className="text-lg font-semibold text-slate-900">{stat.value}</div>
                            <div className="text-xs text-slate-500">{stat.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">No player card yet</h3>
                    <p className="text-slate-600 mb-4">Upload a video for AI analysis to generate your player card</p>
                    <a
                      href="/video-analysis"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
                    >
                      Analyze Video
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Status Upload Modal */}
      {showStatusUpload && (
        <StatusUpload
          onClose={() => setShowStatusUpload(false)}
          onUploaded={handleStatusUploaded}
        />
      )}

      {/* Status Viewer Modal */}
      {showStatusViewer && selectedStatus && selectedStatusOwner && (
        <StatusViewer
          status={selectedStatus}
          statusOwner={selectedStatusOwner}
          onClose={handleCloseStatusViewer}
          allStatuses={selectedStatusOwner.statuses || [selectedStatus]}
          currentStatusIndex={selectedStatusOwner.statuses?.findIndex((s: any) => s.id === selectedStatus.id) || 0}
          onAddNewStatus={() => {
            setShowStatusViewer(false);
            setShowStatusUpload(true);
          }}
          isCurrentUser={selectedStatusOwner.id === profile?.id}
        />
      )}
    </div>
  );
}