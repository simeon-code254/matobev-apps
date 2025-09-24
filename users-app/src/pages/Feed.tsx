import * as React from 'react';
import { supabase } from '../lib/supabaseClient';
import TopNav from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import PlayableVideoCard from '../components/ui/PlayableVideoCard';
import { Heart, MessageCircle, Share, MoreHorizontal, Play } from 'lucide-react';

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role: string;
  country?: string;
}

interface Video {
  id: string;
  user_id: string;
  title?: string | null;
  description?: string | null;
  file_url: string;
  thumbnail_url?: string | null;
  stats?: any;
  created_at?: string;
  profiles?: {
    id: string;
    full_name?: string | null;
    country?: string;
    avatar_url?: string | null;
  };
}

interface Comment {
  id: string;
  video_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles?: {
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

export default function Feed() {
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [videos, setVideos] = React.useState<Video[]>([]);
  const [likes, setLikes] = React.useState<Record<string, number>>({});
  const [likedByMe, setLikedByMe] = React.useState<Record<string, boolean>>({});
  const [comments, setComments] = React.useState<Record<string, Comment[]>>({});
  const [loading, setLoading] = React.useState(true);
  const [likingVideos, setLikingVideos] = React.useState<Set<string>>(new Set());

  const loadProfile = React.useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = "/login";
        return;
      }
      
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, role, country')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      setProfile(profileData);
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  }, []);

  const loadVideos = React.useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select(`
          id, user_id, title, description, file_url, thumbnail_url, stats, created_at,
          profiles!videos_user_id_fkey (id, full_name, country, avatar_url)
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  }, []);

  const loadLikesAndComments = React.useCallback(async (videoIds: string[]) => {
    if (!profile?.id || videoIds.length === 0) return;

    try {
      const [likesResult, myLikesResult, commentsResult] = await Promise.all([
        supabase
          .from('video_likes')
          .select('video_id')
          .in('video_id', videoIds),
        supabase
          .from('video_likes')
          .select('video_id')
          .eq('user_id', profile.id)
          .in('video_id', videoIds),
        supabase
          .from('video_comments')
          .select(`
            id, video_id, user_id, content, created_at,
            profiles!video_comments_user_id_fkey (full_name, avatar_url)
          `)
          .in('video_id', videoIds)
          .order('created_at', { ascending: true })
      ]);

      // Process likes
      const likesCount: Record<string, number> = {};
      (likesResult.data || []).forEach((row: any) => {
        likesCount[row.video_id] = (likesCount[row.video_id] || 0) + 1;
      });
      setLikes(likesCount);

      // Process my likes
      const myLikes: Record<string, boolean> = {};
      (myLikesResult.data || []).forEach((row: any) => {
        myLikes[row.video_id] = true;
      });
      setLikedByMe(myLikes);

      // Process comments
      const commentsByVideo: Record<string, Comment[]> = {};
      (commentsResult.data || []).forEach((comment: any) => {
        if (!commentsByVideo[comment.video_id]) {
          commentsByVideo[comment.video_id] = [];
        }
        commentsByVideo[comment.video_id].push(comment);
      });
      setComments(commentsByVideo);
    } catch (error) {
      console.error('Error loading likes and comments:', error);
    }
  }, [profile?.id]);

  React.useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await loadProfile();
      await loadVideos();
      setLoading(false);
    };
    loadData();
  }, [loadProfile, loadVideos]);

  React.useEffect(() => {
    if (videos.length > 0) {
      const videoIds = videos.map((v: Video) => v.id);
      loadLikesAndComments(videoIds);
    }
  }, [videos, loadLikesAndComments]);

  // Real-time subscriptions
  React.useEffect(() => {
    const channel = supabase.channel('realtime-feed')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'videos' }, 
        (payload: any) => {
          setVideos((prev: Video[]) => [payload.new as Video, ...prev]);
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'video_likes' }, 
        (payload: any) => {
          const videoId = payload.new?.video_id ?? payload.old?.video_id;
          setLikes((prev: Record<string, number>) => {
            const current = prev[videoId] || 0;
            if (payload.eventType === 'INSERT') {
              return { ...prev, [videoId]: current + 1 };
            } else if (payload.eventType === 'DELETE') {
              return { ...prev, [videoId]: Math.max(0, current - 1) };
            }
            return prev;
          });
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'video_comments' }, 
        (payload: any) => {
          const comment = payload.new as Comment;
          setComments((prev: Record<string, Comment[]>) => ({
            ...prev,
            [comment.video_id]: [...(prev[comment.video_id] || []), comment]
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const toggleLike = async (videoId: string) => {
    if (!profile || likingVideos.has(videoId)) return;
    
    setLikingVideos((prev: Set<string>) => new Set(prev).add(videoId));
    
    try {
      const currentlyLiked = !!likedByMe[videoId];
      const currentLikeCount = likes[videoId] || 0;
      
      // Update local state optimistically
      setLikedByMe((prev: Record<string, boolean>) => ({ ...prev, [videoId]: !currentlyLiked }));
      setLikes((prev: Record<string, number>) => ({ 
        ...prev, 
        [videoId]: currentlyLiked ? Math.max(0, currentLikeCount - 1) : currentLikeCount + 1 
      }));
      
      // Make database call
      if (currentlyLiked) {
        const { error } = await supabase
          .from('video_likes')
          .delete()
          .eq('video_id', videoId)
          .eq('user_id', profile.id);
        
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('video_likes')
          .insert({ video_id: videoId, user_id: profile.id });
        
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revert optimistic update on error
      const currentlyLiked = !!likedByMe[videoId];
      const currentLikeCount = likes[videoId] || 0;
      
      setLikedByMe((prev: Record<string, boolean>) => ({ ...prev, [videoId]: currentlyLiked }));
      setLikes((prev: Record<string, number>) => ({ 
        ...prev, 
        [videoId]: currentlyLiked ? currentLikeCount + 1 : Math.max(0, currentLikeCount - 1)
      }));
    } finally {
      setLikingVideos((prev: Set<string>) => {
        const newSet = new Set(prev);
        newSet.delete(videoId);
        return newSet;
      });
    }
  };

  const addComment = async (videoId: string, content: string) => {
    if (!profile || !content.trim()) return;
    
    try {
      const { error } = await supabase
        .from('video_comments')
        .insert({ 
          video_id: videoId, 
          user_id: profile.id, 
          content: content.trim() 
        });
      
      if (error) throw error;
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };

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
      <Sidebar profile={profile!} />
      <div className="flex-1 flex flex-col">
        <TopNav profile={profile!} />
        <main className="flex-1 p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">Performance Feed</h1>
              <p className="text-slate-600">Discover amazing football performances from players around the world</p>
            </div>

            {/* Videos Grid */}
            {videos.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Play className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">No videos yet</h3>
                <p className="text-slate-600 mb-6">Be the first to share a performance video!</p>
                <a
                  href="/upload"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium"
                >
                  <Play className="w-5 h-5" />
                  Upload Video
                </a>
              </div>
            ) : (
              <div className="space-y-6">
                {videos.map((video: Video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    likes={likes[video.id] || 0}
                    likedByMe={!!likedByMe[video.id]}
                    comments={comments[video.id] || []}
                    onLike={() => toggleLike(video.id)}
                    onComment={(content) => addComment(video.id, content)}
                    isLiking={likingVideos.has(video.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

interface VideoCardProps {
  video: Video;
  likes: number;
  likedByMe: boolean;
  comments: Comment[];
  onLike: () => void;
  onComment: (content: string) => void;
  isLiking: boolean;
  key?: string;
}

function VideoCard({ video, likes, likedByMe, comments, onLike, onComment, isLiking }: VideoCardProps) {
  const [showComments, setShowComments] = React.useState(false);
  const [commentText, setCommentText] = React.useState('');

  const handleCommentSubmit = (e: any) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      {/* Video Header */}
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 overflow-hidden">
            {video.profiles?.avatar_url ? (
              <img 
                src={video.profiles.avatar_url} 
                alt={video.profiles.full_name || "User"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold">
                {(video.profiles?.full_name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="font-semibold text-slate-900">
              {video.profiles?.full_name || "Unknown User"}
            </div>
            <div className="text-sm text-slate-500">
              {video.created_at ? new Date(video.created_at).toLocaleDateString() : ""}
            </div>
          </div>
          <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
            <MoreHorizontal className="w-5 h-5 text-slate-600" />
          </button>
        </div>
      </div>

      {/* Video Content */}
      <div className="relative">
        <PlayableVideoCard video={video} showStats={true} />
      </div>

      {/* Video Info */}
      <div className="p-4">
        <h3 className="font-semibold text-slate-900 mb-2">
          {video.title || "Performance Video"}
        </h3>
        {video.description && (
          <p className="text-slate-600 text-sm mb-3">{video.description}</p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-4 mb-4">
          <button
            onClick={onLike}
            disabled={isLiking}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              likedByMe
                ? 'bg-red-50 text-red-600 border border-red-200'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
            } ${isLiking ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Heart className={`w-4 h-4 ${likedByMe ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">{likes}</span>
          </button>

          <button
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="text-sm font-medium">{comments.length}</span>
          </button>

          <button className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors">
            <Share className="w-4 h-4" />
            <span className="text-sm font-medium">Share</span>
          </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="border-t border-slate-100 pt-4">
            <div className="space-y-3 mb-4">
              {comments.map((comment) => (
                <div key={comment.id} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
                    {comment.profiles?.avatar_url ? (
                      <img 
                        src={comment.profiles.avatar_url} 
                        alt={comment.profiles.full_name || "User"} 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-xs font-medium text-slate-600">
                        {(comment.profiles?.full_name || "U").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm">
                      <span className="font-semibold text-slate-900">
                        {comment.profiles?.full_name || "Unknown"}
                      </span>
                      <span className="text-slate-600 ml-2">{comment.content}</span>
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Comment */}
            <form onSubmit={handleCommentSubmit} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="flex-1 px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Post
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}