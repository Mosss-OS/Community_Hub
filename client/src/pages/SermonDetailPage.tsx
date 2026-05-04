import { useRoute } from "wouter";
import { useSermon, useShareSermon, useDownloadSermon } from "@/hooks/use-sermons";
import { useAuth } from "@/hooks/use-auth";
import { useRecordOnlineAttendance } from "@/hooks/use-attendance";
import { format } from "date-fns";
import { Play, Calendar, User, ArrowLeft, Share2, Download, Headphones, X, Check, Link as LinkIcon, Eye, Loader2, FileText, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { FaXTwitter, FaWhatsapp, FaFacebook, FaEnvelope, FaLinkedin, FaLink } from "react-icons/fa6";
import { SermonNotes } from "@/components/SermonNotes";
import { LiveQA } from "@/components/LiveQA";

export default function SermonDetailPage() {
  const [, params] = useRoute<{ id: string }>("/sermons/:id");
  const sermonId = params?.id ? parseInt(params.id) : null;
  const { data: sermon, isLoading, error } = useSermon(sermonId!);
  const { user } = useAuth();
  const recordAttendance = useRecordOnlineAttendance();
  const shareSermon = useShareSermon();
  const downloadSermon = useDownloadSermon();
  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [checkedIn, setCheckedIn] = useState(false);

  const handleOnlineCheckin = async () => {
    if (!user || !sermon) return;
    try {
      await recordAttendance.mutateAsync({
        userId: user.id,
        serviceType: sermon.isUpcoming ? "ONLINE_LIVE" : "ONLINE_REPLAY",
        serviceId: sermonId!,
        serviceName: sermon.title,
        serviceDate: new Date(sermon.date).toISOString(),
        watchDuration: 600,
        isReplay: !sermon.isUpcoming,
      });
      setCheckedIn(true);
    } catch (err) {
      console.error("Failed to check in:", err);
    }
  };
  
  useEffect(() => {
    if (showShareModal && sermonId && !shareSermon.data) {
      shareSermon.mutate(sermonId);
    }
  }, [showShareModal, sermonId]);

  const handleShare = (platform: string) => {
    const links = shareSermon.data;
    if (!links) return;

    switch (platform) {
      case 'x':
        window.open(links.x, '_blank');
        break;
      case 'whatsapp':
        window.open(links.whatsapp, '_blank');
        break;
      case 'facebook':
        window.open(links.facebook, '_blank');
        break;
      case 'email':
        window.open(links.email, '_blank');
        break;
      case 'linkedin':
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(links.copyLink)}`, '_blank');
        break;
      default:
        break;
    }
  };

  const handleDownload = async (type?: "video" | "audio") => {
    if (!sermonId) return;
    try {
      const result = await downloadSermon.mutateAsync({ id: sermonId, type });
      window.open(result.url, '_blank');
    } catch (e) {
      console.error("Download failed", e);
    }
  };

  const copyLink = async () => {
    const links = shareSermon.data;
    if (!links) return;
    await navigator.clipboard.writeText(links.copyLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-6 md:py-8">
          <Skeleton className="h-6 md:h-8 w-24 md:w-32 mb-6 md:mb-8" />
          <Skeleton className="h-8 md:h-12 w-2/3 mb-2 md:mb-4" />
          <Skeleton className="h-4 md:h-6 w-1/3 mb-6 md:mb-8" />
          <Skeleton className="aspect-video w-full rounded-xl" />
          <Skeleton className="h-24 md:h-32 w-full mt-4 md:mt-6 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !sermon) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-5xl mx-auto px-3 md:px-4 py-12 md:py-20 text-center">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-3 md:mb-4">Sermon not found</h1>
          <Button asChild>
            <Link href="/sermons">Back to Sermons</Link>
          </Button>
        </div>
      </div>
    );
  }

  const sermonDate = new Date(sermon.date);

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-5xl mx-auto px-3 md:px-4 py-5 md:py-8">
        {/* Back Button */}
        <Link href="/sermons" className="inline-flex items-center gap-1.5 md:gap-2 text-sm md:text-base text-gray-500 hover:text-gray-900 mb-5 md:mb-8">
          <ArrowLeft className="w-3.5 h-3.5 md:w-4 md:h-4" />
          Back to Sermons
        </Link>

        {/* Header */}
        <div className="mb-5 md:mb-8">
          {sermon.series && (
            <Badge variant="secondary" className="mb-2 md:mb-4 bg-purple-50 text-purple-700 text-xs md:text-sm">
              {sermon.series}
            </Badge>
          )}
          
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-3 md:mb-4">
            {sermon.title}
          </h1>
          
          <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-base text-gray-500">
            <div className="flex items-center gap-1.5 md:gap-2">
              <User className="w-3.5 h-3.5 md:w-5 md:h-5" />
              <span className="font-medium text-gray-900 text-sm md:text-base">{sermon.speaker}</span>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2">
              <Calendar className="w-3.5 h-3.5 md:w-5 md:h-5" />
              <span>{format(sermonDate, "MMMM d, yyyy")}</span>
            </div>
          </div>
        </div>

        {/* Video Player */}
        <Card className="border border-gray-100 overflow-hidden mb-5 md:mb-8">
          <div className="aspect-video bg-gray-50 relative">
            {sermon.videoUrl ? (
              <iframe
                src={sermon.videoUrl.replace('watch?v=', 'embed/')}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : sermon.thumbnailUrl ? (
              <div className="relative w-full h-full">
                <img src={sermon.thumbnailUrl} alt={sermon.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <div className="w-14 h-14 md:w-20 md:h-20 rounded-full bg-white/90 flex items-center justify-center">
                    <Play className="h-6 w-6 md:h-8 md:w-8 text-purple-600 ml-1" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Play className="h-12 w-12 md:h-16 md:w-16 text-gray-200" />
              </div>
            )}
            
            {/* Online Check-in Button */}
            {user && sermon.videoUrl && (
              <div className="absolute bottom-4 right-4">
                {checkedIn ? (
                  <Badge className="bg-green-500 hover:bg-green-600 gap-1 px-3 py-1.5">
                    <Check className="h-3 w-3" /> Checked In
                  </Badge>
                ) : recordAttendance.isPending ? (
                  <Button size="sm" disabled className="gap-1">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking in...
                  </Button>
                ) : (
                  <Button 
                    size="sm" 
                    onClick={handleOnlineCheckin}
                    className="gap-1 bg-green-600 hover:bg-green-700"
                  >
                    <Eye className="h-3 w-3" /> I'm Watching
                  </Button>
                )}
              </div>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">
          {/* Description & Transcript */}
          <div className="lg:col-span-2 space-y-5 md:space-y-8">
            <Card className="border border-gray-100">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg md:text-xl font-semibold text-gray-900 mb-3 md:mb-4">About this message</h2>
                <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                  {sermon.description || "No description available."}
                </p>
              </CardContent>
            </Card>

            {/* Transcript */}
            {(sermon as any).transcript && (
              <Card className="border border-gray-100">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <h2 className="text-lg md:text-xl font-semibold text-gray-900">Transcript</h2>
                    </div>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Search transcript..."
                        className="pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary/20"
                        id="transcript-search"
                      />
                    </div>
                  </div>
                  <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed max-h-96 overflow-y-auto" id="transcript-content">
                    {(sermon as any).transcriptTimestamps ? (
                      <div className="space-y-3">
                        {(sermon as any).transcriptTimestamps.map((segment: any, idx: number) => (
                          <div key={idx} className="flex gap-3 group cursor-pointer hover:bg-muted/50 p-2 rounded-lg transition-colors" onClick={() => {
                            const video = document.querySelector('video') as HTMLVideoElement;
                            if (video) video.currentTime = segment.timestamp;
                          }}>
                            <span className="text-xs text-primary font-mono bg-primary/10 px-2 py-1 rounded shrink-0">
                              {Math.floor(segment.timestamp / 60)}:{String(Math.floor(segment.timestamp % 60)).padStart(2, '0')}
                            </span>
                            <p className="text-sm">{segment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="whitespace-pre-wrap">{(sermon as any).transcript}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div>
            <Card className="border border-gray-100 sticky top-20 md:top-24">
              <CardContent className="p-4 md:p-6">
                <h3 className="font-semibold text-gray-900 mb-3 md:mb-4 text-base md:text-lg">Sermon Details</h3>
                <div className="space-y-3 md:space-y-4 mb-4 md:mb-6">
                  <div className="flex items-center gap-2 md:gap-3 text-gray-600">
                    <User className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Speaker</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{sermon.speaker}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-gray-600">
                    <Calendar className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                    <div>
                      <p className="text-xs md:text-sm text-gray-500">Date</p>
                      <p className="font-medium text-gray-900 text-sm md:text-base">{format(sermonDate, "MMMM d, yyyy")}</p>
                    </div>
                  </div>
                  {sermon.series && (
                    <div className="flex items-center gap-2 md:gap-3 text-gray-600">
                      <Play className="w-4 h-4 md:w-5 md:h-5 text-purple-600" />
                      <div>
                        <p className="text-xs md:text-sm text-gray-500">Series</p>
                        <p className="font-medium text-gray-900 text-sm md:text-base">{sermon.series}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full text-xs md:text-sm py-2" 
                    size="sm"
                    onClick={() => setShowShareModal(true)}
                  >
                    <Share2 className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                    Share
                  </Button>
                  {sermon.audioUrl && (
                    <>
                      <Button 
                        variant="outline" 
                        className="w-full text-xs md:text-sm py-2" 
                        size="sm"
                        onClick={() => handleDownload("audio")}
                      >
                        <Headphones className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                        Listen Audio
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full text-xs md:text-sm py-2" 
                        size="sm"
                        onClick={() => handleDownload("audio")}
                      >
                        <Download className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                        Download Audio
                      </Button>
                    </>
                  )}
                  {sermon.videoUrl && (
                    <Button 
                      variant="outline" 
                      className="w-full text-xs md:text-sm py-2" 
                      size="sm"
                      onClick={() => handleDownload("video")}
                    >
                      <Download className="w-3 h-3 md:w-4 md:h-4 mr-1.5 md:mr-2" />
                      Download Video
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sermon Notes */}
        {sermonId && <SermonNotes sermonId={sermonId} />}
        
        {sermonId && <LiveQA sermonId={sermonId} />}
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Share this sermon</h3>
                <button onClick={() => setShowShareModal(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleShare('x')}
                  disabled={!shareSermon.data}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaXTwitter className="w-6 h-6" style={{ color: '#000000' }} />
                  <span className="text-xs">X</span>
                </button>
                <button
                  onClick={() => handleShare('whatsapp')}
                  disabled={!shareSermon.data}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaWhatsapp className="w-6 h-6" style={{ color: '#25D366' }} />
                  <span className="text-xs">WhatsApp</span>
                </button>
                <button
                  onClick={() => handleShare('facebook')}
                  disabled={!shareSermon.data}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaFacebook className="w-6 h-6" style={{ color: '#1877F2' }} />
                  <span className="text-xs">Facebook</span>
                </button>
                <button
                  onClick={() => handleShare('email')}
                  disabled={!shareSermon.data}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaEnvelope className="w-6 h-6" style={{ color: '#EA4335' }} />
                  <span className="text-xs">Email</span>
                </button>
                <button
                  onClick={() => handleShare('linkedin')}
                  disabled={!shareSermon.data}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  <FaLinkedin className="w-6 h-6" style={{ color: '#0A66C2' }} />
                  <span className="text-xs">LinkedIn</span>
                </button>
                <button
                  onClick={copyLink}
                  disabled={!shareSermon.data}
                  className="flex flex-col items-center gap-2 p-3 rounded-lg border hover:bg-gray-50 disabled:opacity-50"
                >
                  {copied ? (
                    <Check className="w-6 h-6 text-green-500" />
                  ) : (
                    <FaLink className="w-6 h-6 text-gray-600" />
                  )}
                  <span className="text-xs">{copied ? "Copied!" : "Copy Link"}</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
