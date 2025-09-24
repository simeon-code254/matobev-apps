import React, { useState, useRef } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize } from 'lucide-react';
import StatsDisplay from './StatsDisplay';
import CountryFlag from './CountryFlag';

interface PlayableVideoCardProps {
  video: {
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
  };
  showStats?: boolean;
}

export default function PlayableVideoCard({ video, showStats = true }: PlayableVideoCardProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (videoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const newTime = (clickX / rect.width) * duration;
      videoRef.current.currentTime = newTime;
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative group">
      {/* Video Container */}
      <div 
        className="relative bg-slate-900 rounded-lg overflow-hidden cursor-pointer"
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(false)}
        onClick={togglePlay}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          src={video.file_url}
          poster={video.thumbnail_url || undefined}
          className="w-full h-64 object-cover"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          muted={isMuted}
        />

        {/* Play/Pause Overlay */}
        {!isPlaying && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
            <div className="w-16 h-16 rounded-full bg-white bg-opacity-90 flex items-center justify-center hover:bg-opacity-100 transition-all">
              <Play className="w-6 h-6 text-slate-900 ml-1" />
            </div>
          </div>
        )}

        {/* Video Controls */}
        {showControls && (
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
            {/* Progress Bar */}
            <div 
              className="w-full h-1 bg-white bg-opacity-30 rounded-full mb-3 cursor-pointer"
              onClick={handleSeek}
            >
              <div 
                className="h-full bg-white rounded-full transition-all"
                style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePlay();
                  }}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  {isPlaying ? (
                    <Pause className="w-5 h-5" />
                  ) : (
                    <Play className="w-5 h-5" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleMute();
                  }}
                  className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <span className="text-sm">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </span>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (videoRef.current) {
                    videoRef.current.requestFullscreen();
                  }
                }}
                className="hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Time Badge */}
        <div className="absolute top-3 right-3 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
          {formatTime(duration)}
        </div>
      </div>

      {/* Video Info */}
      <div className="p-4">
        {/* Title and Country */}
        <div className="flex items-center justify-between mb-2">
          <div className="text-slate-900 font-semibold text-sm line-clamp-1 flex-1 mr-2">
            {video.title || "Untitled Video"}
          </div>
          {video.profiles?.country && (
            <div className="flex-shrink-0">
              <CountryFlag country={video.profiles.country} size="sm" />
            </div>
          )}
        </div>
        
        {/* Stats Display */}
        {video.stats && showStats ? (
          <StatsDisplay stats={video.stats} compact />
        ) : (
          <div className="text-slate-500 text-xs">Analysis pending...</div>
        )}
      </div>
    </div>
  );
}
