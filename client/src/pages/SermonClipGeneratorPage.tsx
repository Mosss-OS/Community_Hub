import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Slider } from "@/components/ui/slider";
import { LuVideo, LuFilm, LuDownload, LuTrash2, LuPlay, LuSquare, LuInstagram, LuSmartphone, LuMonitor, LuScissors, LuPlus, LuClock, LuLoader2, LuUpload, LuLink as LinkIcon, LuX, LuAlertCircle, LuShare2, LuFacebook, LuTwitter, LuYoutube, LuExternalLink, LuCopy, LuCheck } from 'react-icons/lu';

interface SermonClip {
  id: number;
  title: string;
  sourceVideoUrl: string | null;
  sourceVideoPath: string | null;
  clipStartTime: number;
  clipEndTime: number;
  format: string;
  overlayText: string | null;
  verseReference: string | null;
  outputUrl: string | null;
  status: string;
  createdAt: string;
}

async function fetchClips(): Promise<SermonClip[]> {
  try {
    const res = await fetch("/api/sermon-clips", { credentials: "include" });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Fetch clips error:", res.status, errorText);
      throw new Error(`Failed to fetch clips: ${res.status}`);
    }
    return res.json();
  } catch (err) {
    console.error("Error fetching clips:", err);
    throw err;
  }
}

async function createClip(data: {
  title: string;
  sourceVideoUrl?: string;
  sourceVideoPath?: string;
  clipStartTime: number;
  clipEndTime: number;
  format: string;
  overlayText?: string;
  verseReference?: string;
}) {
  const res = await fetch("/api/sermon-clips", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Create clip error:", res.status, errorText);
    throw new Error(`Failed to create clip: ${res.status}`);
  }
  return res.json();
}

async function uploadVideo(file: File): Promise<{ path: string; url: string }> {
  const formData = new FormData();
  formData.append("video", file);
  
  const res = await fetch("/api/sermon-clips/upload", {
    method: "POST",
    credentials: "include",
    body: formData,
  });
  
  if (!res.ok) {
    const errorText = await res.text();
    console.error("Upload error:", res.status, errorText);
    throw new Error(`Failed to upload video: ${res.status}`);
  }
  return res.json();
}

async function deleteClip(id: number) {
  const res = await fetch(`/api/sermon-clips/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Failed to delete clip");
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(seconds: number): string {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hrs > 0) {
    return `${hrs}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function isYouTubeUrl(url: string): boolean {
  return url.includes("youtube.com") || url.includes("youtu.be");
}

function getYouTubeThumbnail(url: string): string | null {
  let videoId = "";
  if (url.includes("youtube.com/watch")) {
    const match = url.match(/[?&]v=([^&]+)/);
    videoId = match?.[1] || "";
  } else if (url.includes("youtu.be/")) {
    const match = url.match(/youtu\.be\/([^?]+)/);
    videoId = match?.[1] || "";
  }
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : null;
}

function TimelineTracker({ 
  duration, 
  startTime, 
  endTime, 
  onChange 
}: { 
  duration: number; 
  startTime: number; 
  endTime: number; 
  onChange: (start: number, end: number) => void;
}) {
  const timelineRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState<"start" | "end" | null>(null);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!timelineRef.current) return;
    const rect = timelineRef.current.getBoundingClientRect();
    const clickPosition = (e.clientX - rect.left) / rect.width;
    const clickedTime = Math.round(clickPosition * duration);
    
    const distToStart = Math.abs(clickedTime - startTime);
    const distToEnd = Math.abs(clickedTime - endTime);
    
    if (distToStart < distToEnd) {
      onChange(Math.max(0, clickedTime), Math.min(duration, Math.max(clickedTime + 5, endTime)));
    } else {
      onChange(Math.max(0, Math.min(clickedTime - 5, startTime)), Math.min(duration, clickedTime));
    }
  };

  const startPercent = (startTime / duration) * 100;
  const endPercent = (endTime / duration) * 100;
  const selectedWidth = endPercent - startPercent;

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-xs text-gray-500">
        <span>0:00</span>
        <span>{formatDuration(duration)}</span>
      </div>
      
      <div 
        ref={timelineRef}
        className="relative h-16 bg-gray-100 rounded-lg cursor-pointer select-none"
        onClick={handleTimelineClick}
      >
        <div className="absolute inset-y-2 left-2 right-2">
          <div className="h-full bg-gray-300 rounded-full" />
        </div>
        
        <div 
          className="absolute inset-y-2 left-2 bg-indigo-200 rounded-full"
          style={{ 
            left: `calc(0.5rem + ${startPercent}% * (100% - 1rem) / 100)`,
            width: `calc(${selectedWidth}% * (100% - 1rem) / 100)`
          }}
        />
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-600 rounded cursor-ew-resize z-10 hover:bg-indigo-700 transition-colors"
          style={{ left: `calc(0.5rem + ${startPercent}% * (100% - 1rem) / 100% - 8px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging("start");
          }}
        />
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 w-4 h-8 bg-indigo-600 rounded cursor-ew-resize z-10 hover:bg-indigo-700 transition-colors"
          style={{ left: `calc(0.5rem + ${endPercent}% * (100% - 1rem) / 100% - 8px)` }}
          onMouseDown={(e) => {
            e.stopPropagation();
            setIsDragging("end");
          }}
        />
        
        <div 
          className="absolute top-1/2 -translate-y-1/2 h-8 bg-indigo-600/30 rounded z-0"
          style={{ 
            left: `calc(0.5rem + ${startPercent}% * (100% - 1rem) / 100%)`,
            right: `calc(0.5rem + ${(100 - endPercent)}% * (100% - 1rem) / 100%)`
          }}
        />
      </div>
      
      <div className="flex justify-between text-sm font-medium">
        <span className="text-indigo-600">Start: {formatTime(startTime)}</span>
        <span className="text-gray-500">Duration: {formatDuration(endTime - startTime)}</span>
        <span className="text-indigo-600">End: {formatTime(endTime)}</span>
      </div>
    </div>
  );
}

function ShareDialog({ clipId, clipTitle, outputUrl }: { clipId: number; clipTitle: string; outputUrl: string | null }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  if (!outputUrl) return null;

  const clipUrl = `${baseUrl}/sermon-clips/${clipId}`;
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText(clipUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareToFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(clipUrl)}`, '_blank');
  };

  const shareToTwitter = () => {
    window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(clipUrl)}&text=${encodeURIComponent(clipTitle)}`, '_blank');
  };

  const shareToWhatsApp = () => {
    window.open(`https://wa.me/?text=${encodeURIComponent(clipTitle + ' ' + clipUrl)}`, '_blank');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1">
          <Share2 className="w-4 h-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Clip</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Input value={clipUrl} readOnly className="flex-1" />
            <Button size="sm" onClick={handleCopyLink} variant="outline">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <Button variant="outline" className="flex-col gap-2 h-auto py-3" onClick={shareToFacebook}>
              <Facebook className="w-5 h-5 text-blue-600" />
              <span className="text-xs">Facebook</span>
            </Button>
            <Button variant="outline" className="flex-col gap-2 h-auto py-3" onClick={shareToTwitter}>
              <Twitter className="w-5 h-5 text-sky-500" />
              <span className="text-xs">Twitter</span>
            </Button>
            <Button variant="outline" className="flex-col gap-2 h-auto py-3" onClick={shareToWhatsApp}>
              <svg className="w-5 h-5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="text-xs">WhatsApp</span>
            </Button>
          </div>
          
          {outputUrl && (
            <div className="pt-2 border-t">
              <p className="text-sm text-gray-500 mb-2">Download & share directly:</p>
              <Button asChild className="w-full gap-2">
                <a href={outputUrl} download target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4" />
                  Download Clip
                </a>
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function SermonClipGeneratorPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [clips, setClips] = useState<SermonClip[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [videoSourceType, setVideoSourceType] = useState<"url" | "upload">("url");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string>("");
  const [videoDuration, setVideoDuration] = useState<number>(60);
  const [isUploading, setIsUploading] = useState(false);
  const [previewClip, setPreviewClip] = useState<{ start: number; end: number; url: string } | null>(null);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const previewVideoRef = useRef<HTMLVideoElement>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    sourceVideoUrl: "",
    sourceVideoPath: "",
    startTime: 0,
    endTime: 60,
    format: "landscape",
    overlayText: "",
    verseReference: "",
  });

  const isAdmin = user?.isAdmin;

  useEffect(() => {
    if (isAdmin) {
      loadClips();
    }
  }, [isAdmin]);

  useEffect(() => {
    return () => {
      if (uploadedVideoUrl) {
        URL.revokeObjectURL(uploadedVideoUrl);
      }
    };
  }, [uploadedVideoUrl]);

  async function loadClips() {
    try {
      const data = await fetchClips();
      setClips(data);
    } catch (err) {
      console.error("Error loading clips:", err);
      toast({ 
        title: "Error loading clips", 
        description: "Make sure you're logged in as admin", 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  }

  function handleVideoLoaded() {
    if (videoRef.current) {
      const duration = Math.floor(videoRef.current.duration);
      if (duration && duration > 0) {
        setVideoDuration(duration);
        setFormData(prev => ({
          ...prev,
          endTime: Math.min(60, duration)
        }));
      }
    }
  }

  function handleTimelineChange(start: number, end: number) {
    setFormData(prev => ({
      ...prev,
      startTime: start,
      endTime: end
    }));
  }

  async function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("video/")) {
        toast({ title: "Error", description: "Please select a video file", variant: "destructive" });
        return;
      }
      setUploadedFile(file);
      setFormData(prev => ({ ...prev, title: file.name.replace(/\.[^/.]+$/, "") }));
      
      const objectUrl = URL.createObjectURL(file);
      setUploadedVideoUrl(objectUrl);
    }
  }

  function handlePreviewClip() {
    if (!uploadedVideoUrl) return;
    setPreviewClip({
      start: formData.startTime,
      end: formData.endTime,
      url: uploadedVideoUrl
    });
    setIsPreviewPlaying(true);
  }

  function handlePreviewEnded() {
    setIsPreviewPlaying(false);
  }

  function handlePreviewSeek() {
    if (previewVideoRef.current && previewClip) {
      previewVideoRef.current.currentTime = previewClip.start;
    }
  }

  async function handleProcessClip(id: number) {
    try {
      const res = await fetch(`/api/sermon-clips/${id}/process-now`, {
        method: "POST",
        credentials: "include",
      });
      const data = await res.json();
      if (data.success) {
        toast({ title: "Processing complete!", description: "Your clip is ready for download" });
      } else {
        toast({ title: "Processing failed", description: data.message, variant: "destructive" });
      }
      loadClips();
    } catch (err) {
      console.error("Error processing clip:", err);
      toast({ title: "Error", description: "Failed to process clip", variant: "destructive" });
    }
  }

  async function handleCreateClip() {
    if (!formData.title) {
      toast({ title: "Error", description: "Please enter a title", variant: "destructive" });
      return;
    }

    if (videoSourceType === "url" && !formData.sourceVideoUrl) {
      toast({ title: "Error", description: "Please enter a video URL", variant: "destructive" });
      return;
    }

    if (videoSourceType === "upload" && !uploadedFile) {
      toast({ title: "Error", description: "Please select a video file", variant: "destructive" });
      return;
    }

    try {
      let sourceUrl = formData.sourceVideoUrl;
      let sourcePath = formData.sourceVideoPath;

      if (videoSourceType === "upload" && uploadedFile) {
        setIsUploading(true);
        try {
          const uploadResult = await uploadVideo(uploadedFile);
          sourcePath = uploadResult.path;
          sourceUrl = uploadResult.url;
        } catch (uploadErr) {
          console.error("Upload failed:", uploadErr);
          toast({ title: "Upload failed", description: "Could not upload video file", variant: "destructive" });
          setIsUploading(false);
          return;
        }
        setIsUploading(false);
      }

      await createClip({
        title: formData.title,
        sourceVideoUrl: sourceUrl || undefined,
        sourceVideoPath: sourcePath || undefined,
        clipStartTime: formData.startTime,
        clipEndTime: formData.endTime,
        format: formData.format,
        overlayText: formData.overlayText || undefined,
        verseReference: formData.verseReference || undefined,
      });
      
      toast({ title: "Clip created!", description: "Your clip has been created and is ready for processing." });
      setShowCreateDialog(false);
      resetForm();
      loadClips();
    } catch (err) {
      console.error("Error creating clip:", err);
      toast({ title: "Error", description: "Failed to create clip. Make sure you're logged in as admin.", variant: "destructive" });
    }
  }

  function resetForm() {
    setFormData({
      title: "",
      sourceVideoUrl: "",
      sourceVideoPath: "",
      startTime: 0,
      endTime: 60,
      format: "landscape",
      overlayText: "",
      verseReference: "",
    });
    setUploadedFile(null);
    setUploadedVideoUrl("");
    setVideoDuration(60);
  }

  async function handleDeleteClip(id: number) {
    try {
      await deleteClip(id);
      toast({ title: "Clip deleted" });
      loadClips();
    } catch (err) {
      console.error("Error deleting clip:", err);
      toast({ title: "Error", description: "Failed to delete clip", variant: "destructive" });
    }
  }

  const youtubeThumbnail = videoSourceType === "url" && formData.sourceVideoUrl ? getYouTubeThumbnail(formData.sourceVideoUrl) : null;
  const isYouTube = videoSourceType === "url" && formData.sourceVideoUrl ? isYouTubeUrl(formData.sourceVideoUrl) : false;

  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Video className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-semibold mb-2">Admin Access Only</h2>
              <p className="text-gray-600">
                The Sermon Clip Generator is available for church administrators only.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {previewClip && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Preview Clip</h3>
              <Button variant="ghost" size="sm" onClick={() => {
                setPreviewClip(null);
                setIsPreviewPlaying(false);
              }}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <video
              ref={previewVideoRef}
              src={previewClip.url}
              className="w-full aspect-video bg-black"
              onLoadedMetadata={handlePreviewSeek}
              onEnded={handlePreviewEnded}
              controls={isPreviewPlaying}
              autoPlay={isPreviewPlaying}
            />
            <div className="p-4 border-t bg-gray-50">
              <p className="text-sm text-gray-600">
                Preview: {formatTime(previewClip.start)} - {formatTime(previewClip.end)} ({formatDuration(previewClip.end - previewClip.start)})
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Sermon Clip Generator</h1>
          <p className="text-gray-600 text-lg">Create short video clips from sermons for social media</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={(open) => {
          setShowCreateDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Clip
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Sermon Clip</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Clip Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Key Message - John 3:16"
                />
              </div>

              <div className="space-y-2">
                <Label>Video Source</Label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSourceType("url");
                      setUploadedFile(null);
                      setUploadedVideoUrl("");
                    }}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      videoSourceType === "url" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <LinkIcon className="w-5 h-5" />
                    <span className="font-medium">Video URL</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setVideoSourceType("upload");
                      setFormData(prev => ({ ...prev, sourceVideoUrl: "" }));
                    }}
                    className={`flex-1 p-4 rounded-lg border-2 transition-all flex items-center justify-center gap-2 ${
                      videoSourceType === "upload" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <Upload className="w-5 h-5" />
                    <span className="font-medium">Upload File</span>
                  </button>
                </div>
              </div>

              {videoSourceType === "url" ? (
                <div className="space-y-2">
                  <Label htmlFor="videoUrl">Video URL *</Label>
                  <Input
                    id="videoUrl"
                    value={formData.sourceVideoUrl}
                    onChange={(e) => setFormData({ ...formData, sourceVideoUrl: e.target.value })}
                    placeholder="https://youtube.com/watch?v=..."
                  />
                  <p className="text-sm text-gray-500">Paste a YouTube or direct video URL</p>
                  
                  {youtubeThumbnail && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-2">Video Preview (YouTube)</p>
                      <div className="relative aspect-video max-w-md rounded-lg overflow-hidden bg-gray-100">
                        <img src={youtubeThumbnail} alt="Video thumbnail" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-16 h-16 rounded-full bg-black/50 flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                          </div>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Note: Full preview requires uploading the video file
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Upload Video *</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {uploadedFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <Video className="w-8 h-8 text-primary" />
                        <span className="font-medium">{uploadedFile.name}</span>
                        <Button variant="ghost" size="sm" onClick={() => {
                          setUploadedFile(null);
                          setUploadedVideoUrl("");
                        }}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-10 h-10 mx-auto mb-2 text-gray-400" />
                        <p className="text-gray-600 mb-2">Drag and drop a video file or click to browse</p>
                        <Input
                          type="file"
                          accept="video/*"
                          onChange={handleFileSelect}
                          className="max-w-xs mx-auto"
                        />
                      </>
                    )}
                  </div>
                </div>
              )}

              {(uploadedVideoUrl || formData.sourceVideoUrl) && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Timeline - Select Clip Range</Label>
                      <span className="text-sm text-gray-500">
                        Clip Duration: {formatDuration(formData.endTime - formData.startTime)}
                      </span>
                    </div>
                    
                    {uploadedVideoUrl && (
                      <video
                        ref={videoRef}
                        src={uploadedVideoUrl}
                        className="w-full max-h-64 rounded-lg bg-black"
                        onLoadedMetadata={handleVideoLoaded}
                      >
                        Your browser does not support video playback.
                      </video>
                    )}

                    {isYouTube && (
                      <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                          <div>
                            <p className="font-medium text-yellow-800">YouTube URL detected</p>
                            <p className="text-sm text-yellow-700">
                              For precise timeline selection, please download the video and upload it instead.
                              You can estimate the timestamps based on the video.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                    <TimelineTracker 
                      duration={videoDuration}
                      startTime={formData.startTime}
                      endTime={formData.endTime}
                      onChange={handleTimelineChange}
                    />

                    {uploadedVideoUrl && (
                      <div className="flex justify-center pt-2">
                        <Button variant="outline" onClick={handlePreviewClip} className="gap-2">
                          <Play className="w-4 h-4" />
                          Preview Clip
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label>Output Format</Label>
                <div className="grid grid-cols-3 gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: "square" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.format === "square" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <Instagram className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Square</p>
                    <p className="text-xs text-gray-500">1:1 (1080x1080)</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: "vertical" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.format === "vertical" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <Smartphone className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Vertical</p>
                    <p className="text-xs text-gray-500">9:16 (1080x1920)</p>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, format: "landscape" })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      formData.format === "landscape" ? "border-primary bg-primary/5" : "border-gray-200"
                    }`}
                  >
                    <Monitor className="w-6 h-6 mx-auto mb-2" />
                    <p className="text-sm font-medium">Landscape</p>
                    <p className="text-xs text-gray-500">16:9 (1920x1080)</p>
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="overlayText">Overlay Text (Optional)</Label>
                <Textarea
                  id="overlayText"
                  value={formData.overlayText}
                  onChange={(e) => setFormData({ ...formData, overlayText: e.target.value })}
                  placeholder="Enter text to overlay on the video..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="verseReference">Bible Verse Reference (Optional)</Label>
                <Input
                  id="verseReference"
                  value={formData.verseReference}
                  onChange={(e) => setFormData({ ...formData, verseReference: e.target.value })}
                  placeholder="e.g., John 3:16"
                />
              </div>

              <div className="flex justify-end gap-4">
                <Button variant="outline" onClick={() => {
                  setShowCreateDialog(false);
                  resetForm();
                }}>
                  Cancel
                </Button>
                <Button onClick={handleCreateClip} disabled={isUploading}>
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Scissors className="w-4 h-4 mr-2" />
                      Create Clip
                    </>
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {clips.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <div className="text-center py-12">
              <Film className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">No clips yet</h3>
              <p className="text-gray-600 mb-4">Create your first sermon clip to get started</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Clip
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clips.map((clip) => (
            <Card key={clip.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-1">{clip.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    {clip.format === "square" && <Instagram className="w-4 h-4 text-gray-400" />}
                    {clip.format === "vertical" && <Smartphone className="w-4 h-4 text-gray-400" />}
                    {clip.format === "landscape" && <Monitor className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>
                      {formatTime(clip.clipStartTime)} - {formatTime(clip.clipEndTime)}
                    </span>
                    <span className="text-gray-400">
                      ({formatTime(clip.clipEndTime - clip.clipStartTime)})
                    </span>
                  </div>
                  
                  {clip.verseReference && (
                    <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                      📖 {clip.verseReference}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        clip.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : clip.status === "processing"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {clip.status}
                    </span>
                  </div>
                  
                  <div className="flex gap-2 pt-2">
                    {(clip.status === "pending" || clip.status === "failed") && (
                      <Button
                        size="sm"
                        className="flex-1 gap-1"
                        onClick={() => handleProcessClip(clip.id)}
                      >
                        <Play className="w-4 h-4" />
                        Process
                      </Button>
                    )}
                    {clip.status === "processing" && (
                      <Button size="sm" className="flex-1 gap-1" disabled>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteClip(clip.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {clip.outputUrl && clip.status === "completed" && (
                      <>
                        <Button size="sm" className="flex-1 gap-1" asChild>
                          <a href={clip.outputUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="w-4 h-4" />
                            Download
                          </a>
                        </Button>
                        <ShareDialog clipId={clip.id} clipTitle={clip.title} outputUrl={clip.outputUrl} />
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
