import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import TopNav from '../components/layout/TopNav';
import { Sidebar } from '../components/layout/Sidebar';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Upload, Video, BarChart3, Download, RefreshCw, CheckCircle, Clock, Zap } from 'lucide-react';

interface Profile {
  id: string;
  full_name?: string | null;
  avatar_url?: string | null;
  role?: string | null;
}

interface AnalysisResult {
  analysis_id: string;
  player_id: string;
  video_id: string;
  video_url: string;
  metrics: {
    speed: number;
    stamina: number;
    shooting_accuracy: number;
    passing_accuracy: number;
    strength: number;
    dribbling: number;
    overall_rating: number;
  };
  player_card: {
    overall_rating: number;
    pace: number;
    shooting: number;
    passing: number;
    dribbling: number;
    defending: number;
    physical: number;
  };
  analysis_date: string;
  processing_time: number;
}

interface PreviousAnalysis {
  id: string;
  video_id: string;
  analysis_date: string;
  metrics: any;
  video_url: string;
  video_title?: string;
  created_at: string;
}

export default function VideoAnalysis() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [previousAnalyses, setPreviousAnalyses] = useState<PreviousAnalysis[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [timeEstimate, setTimeEstimate] = useState<number>(30);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    loadProfile();
    fetchTimeEstimate();
    fetchPreviousAnalyses();
  }, []);

  const loadProfile = async () => {
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
  };

  const fetchTimeEstimate = async () => {
    try {
      const response = await fetch('http://localhost:8003/time_estimate');
      const data = await response.json();
      setTimeEstimate(data.estimated_time_seconds || 30);
    } catch (error) {
      console.error('Error fetching time estimate:', error);
    }
  };

  const fetchPreviousAnalyses = async () => {
    if (!profile?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('video_analysis')
        .select(`
          id, video_id, analysis_date, metrics, video_url, created_at,
          videos!video_analysis_video_id_fkey (title)
        `)
        .eq('player_id', profile.id)
        .order('analysis_date', { ascending: false })
        .limit(10);

      if (error) throw error;
      setPreviousAnalyses(data || []);
    } catch (error) {
      console.error('Error fetching previous analyses:', error);
    }
  };

  const uploadVideo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
    const filePath = `videos/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('videos')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = supabase.storage
      .from('videos')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const analyzeVideo = async (videoUrl: string) => {
    if (!profile?.id) throw new Error('No profile found');

    const response = await fetch('http://localhost:8003/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        video_url: videoUrl,
        player_id: profile.id,
        video_id: `video_${Date.now()}`
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Analysis failed');
    }

    return await response.json();
  };

  const saveAnalysisToDatabase = async (result: AnalysisResult) => {
    const { error } = await supabase
      .from('video_analysis')
      .insert({
        id: result.analysis_id,
        video_id: result.video_id,
        player_id: result.player_id,
        video_url: result.video_url,
        analysis_date: result.analysis_date,
        metrics: result.metrics,
        processing_time: result.processing_time
      });

    if (error) throw error;
  };

  const updatePlayerCard = async (playerCard: any) => {
    if (!profile?.id) return;

    const { error } = await supabase
      .from('player_cards')
      .upsert({
        player_id: profile.id,
        overall_rating: playerCard.overall_rating,
        pace: playerCard.pace,
        shooting: playerCard.shooting,
        passing: playerCard.passing,
        dribbling: playerCard.dribbling,
        defending: playerCard.defending,
        physical: playerCard.physical,
        last_updated: new Date().toISOString()
      });

    if (error) throw error;
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type.startsWith('video/')) {
      setFile(selectedFile);
      setError(null);
    } else {
      setError('Please select a valid video file');
    }
  };

  const handleAnalyze = async () => {
    if (!file || !profile) return;

    setError(null);
    setSuccess(false);
    setAnalyzing(true);
    setProgress(0);

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 1000);

      // Upload video
      setProgress(20);
      const videoUrl = await uploadVideo(file);
      console.log('Video uploaded:', videoUrl);

      // Analyze video
      setProgress(50);
      const result = await analyzeVideo(videoUrl);
      console.log('Analysis result:', result);

      // Save to database
      setProgress(80);
      await saveAnalysisToDatabase(result);
      await updatePlayerCard(result.player_card);

      clearInterval(progressInterval);
      setProgress(100);

      setAnalysisResult(result);
      setSuccess(true);
      
      // Refresh previous analyses
      await fetchPreviousAnalyses();

      // Show success message
      setTimeout(() => {
        setSuccess(false);
      }, 5000);

    } catch (error: any) {
      console.error('Analysis error:', error);
      setError(error.message || 'Analysis failed. Please try again.');
    } finally {
      setAnalyzing(false);
      setProgress(0);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: number; icon: any; color: string }) => (
    <div className="bg-white rounded-xl p-4 border border-slate-200">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="text-sm font-medium text-slate-600">{title}</div>
          <div className="text-2xl font-bold text-slate-900">{value}</div>
        </div>
      </div>
    </div>
  );

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
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">AI Video Analysis</h1>
              <p className="text-slate-600">
                Upload your performance video and get AI-powered analysis with detailed player statistics
              </p>
            </div>

            {/* Upload Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5" />
                  Upload Video
                </CardTitle>
                <CardDescription>
                  Select a video file to analyze your performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={handleFileSelect}
                      className="hidden"
                      id="video-upload"
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                      <div className="text-lg font-medium text-slate-900 mb-2">
                        {file ? file.name : 'Choose video file'}
                      </div>
                      <div className="text-sm text-slate-600">
                        {file ? 'Click to change file' : 'Click to select or drag and drop'}
                      </div>
                    </label>
                  </div>

                  {file && (
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Video className="w-5 h-5 text-slate-600" />
                        <div>
                          <div className="font-medium text-slate-900">{file.name}</div>
                          <div className="text-sm text-slate-600">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB
                          </div>
                        </div>
                      </div>
                      <Button
                        onClick={handleAnalyze}
                        disabled={analyzing}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {analyzing ? (
                          <>
                            <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Zap className="w-4 h-4 mr-2" />
                            Analyze Video
                          </>
                        )}
                      </Button>
                    </div>
                  )}

                  {analyzing && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Analysis Progress</span>
                        <span>{progress}%</span>
                      </div>
                      <Progress value={progress} className="h-2" />
                      <div className="text-sm text-slate-600 text-center">
                        Estimated time: {timeEstimate} seconds
                      </div>
                    </div>
                  )}

                  {error && (
                    <Alert className="border-red-200 bg-red-50">
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  {success && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-800">
                        Analysis completed successfully! Your player card has been updated.
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analysis Results */}
            {analysisResult && (
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    Your performance analysis completed in {analysisResult.processing_time.toFixed(1)}s
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <StatCard
                      title="Overall Rating"
                      value={analysisResult.metrics.overall_rating}
                      icon={BarChart3}
                      color="bg-indigo-500"
                    />
                    <StatCard
                      title="Speed"
                      value={analysisResult.metrics.speed}
                      icon={Zap}
                      color="bg-blue-500"
                    />
                    <StatCard
                      title="Shooting"
                      value={analysisResult.metrics.shooting_accuracy}
                      icon={Zap}
                      color="bg-red-500"
                    />
                    <StatCard
                      title="Passing"
                      value={analysisResult.metrics.passing_accuracy}
                      icon={Zap}
                      color="bg-green-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <StatCard
                      title="Stamina"
                      value={analysisResult.metrics.stamina}
                      icon={Zap}
                      color="bg-purple-500"
                    />
                    <StatCard
                      title="Strength"
                      value={analysisResult.metrics.strength}
                      icon={Zap}
                      color="bg-orange-500"
                    />
                    <StatCard
                      title="Dribbling"
                      value={analysisResult.metrics.dribbling}
                      icon={Zap}
                      color="bg-pink-500"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Previous Analyses */}
            {previousAnalyses.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Previous Analyses</CardTitle>
                  <CardDescription>
                    Your recent video analysis history
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {previousAnalyses.map((analysis) => (
                      <div key={analysis.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <Video className="w-5 h-5 text-slate-600" />
                          <div>
                            <div className="font-medium text-slate-900">
                              {analysis.video_title || 'Performance Video'}
                            </div>
                            <div className="text-sm text-slate-600">
                              {new Date(analysis.analysis_date).toLocaleDateString()} • 
                              Overall: {analysis.metrics.overall_rating}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Download className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
