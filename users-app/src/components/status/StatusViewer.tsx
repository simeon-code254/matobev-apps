import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, Heart, MessageCircle, Share, MoreHorizontal } from 'lucide-react';

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

interface StatusViewerProps {
  status: Status;
  statusOwner: {
    id: string;
    full_name?: string | null;
    avatar_url?: string | null;
    statuses?: Status[];
  };
  onClose: () => void;
  allStatuses: Status[];
  currentStatusIndex: number;
  onAddNewStatus?: () => void;
  isCurrentUser?: boolean;
}

export default function StatusViewer({
  status,
  statusOwner,
  onClose,
  allStatuses,
  currentStatusIndex,
  onAddNewStatus,
  isCurrentUser = false
}: StatusViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(currentStatusIndex);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(Math.floor(Math.random() * 50) + 10);

  const currentStatus = allStatuses[currentIndex];

  useEffect(() => {
    setCurrentIndex(currentStatusIndex);
  }, [currentStatusIndex]);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            handleNext();
            return 0;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  const handleNext = () => {
    if (currentIndex < allStatuses.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    }
  };

  const handleLike = () => {
    setLiked(!liked);
    setLikes(prev => liked ? prev - 1 : prev + 1);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const formatTime = (timestamp: string) => {
    const now = new Date();
    const statusTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - statusTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
      {/* Background Video */}
      <div className="absolute inset-0">
        <video
          src={currentStatus.video_url}
          className="w-full h-full object-cover"
          autoPlay
          loop
          muted
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30" />
      </div>

      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 z-10">
        <div 
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white">
            {statusOwner.avatar_url ? (
              <img 
                src={statusOwner.avatar_url} 
                alt={statusOwner.full_name || "User"} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold">
                {(statusOwner.full_name || "U").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="text-white font-semibold">{statusOwner.full_name || "User"}</div>
            <div className="text-white/80 text-sm">{formatTime(currentStatus.created_at)}</div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      </div>

      <div className="absolute right-0 top-1/2 -translate-y-1/2 z-20">
        <button
          onClick={handleNext}
          disabled={currentIndex === allStatuses.length - 1}
          className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Action Buttons */}
      <div className="absolute right-4 bottom-20 z-20 flex flex-col gap-4">
        <button
          onClick={handleLike}
          className={`p-3 rounded-full transition-colors ${
            liked 
              ? 'bg-red-500 text-white' 
              : 'bg-black/20 text-white hover:bg-black/40'
          }`}
        >
          <Heart className={`w-6 h-6 ${liked ? 'fill-current' : ''}`} />
        </button>
        
        <button className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
          <MessageCircle className="w-6 h-6" />
        </button>
        
        <button className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
          <Share className="w-6 h-6" />
        </button>
        
        <button className="p-3 rounded-full bg-black/20 text-white hover:bg-black/40 transition-colors">
          <MoreHorizontal className="w-6 h-6" />
        </button>
      </div>

      {/* Status Counter */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20">
        <div className="flex gap-1">
          {allStatuses.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentIndex 
                  ? 'bg-white w-8' 
                  : 'bg-white/50 w-1'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Add New Status Button for Current User */}
      {isCurrentUser && onAddNewStatus && (
        <div className="absolute bottom-4 right-4 z-20">
          <button
            onClick={onAddNewStatus}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-colors text-sm font-medium"
          >
            Add New Status
          </button>
        </div>
      )}

      {/* Play/Pause Overlay */}
      <div 
        className="absolute inset-0 z-10 flex items-center justify-center cursor-pointer"
        onClick={handlePlayPause}
      >
        {!isPlaying && (
          <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <div className="w-0 h-0 border-l-[12px] border-l-white border-y-[8px] border-y-transparent ml-1" />
          </div>
        )}
      </div>
    </div>
  );
}
