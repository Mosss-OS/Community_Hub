"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Monitor, Headphones, Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

interface AudioOnlyModeProps {
  audioUrl: string;
  title: string;
  speaker?: string;
  date?: string;
  coverImage?: string;
  onNext?: () => void;
  onPrevious?: () => void;
}

export function AudioOnlyMode({
  audioUrl,
  title,
  speaker,
  date,
  coverImage,
  onNext,
  onPrevious,
}: AudioOnlyModeProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (value: number[]) => {
    if (audioRef.current) {
      audioRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skipBackward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 15);
    }
  };

  const skipForward = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 15);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const downloadAudio = () => {
    const link = document.createElement("a");
    link.href = audioUrl;
    link.download = `${title}.mp3`;
    link.click();
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />
      
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {coverImage && (
            <img
              src={coverImage}
              alt={title}
              className="w-14 h-14 rounded-lg object-cover flex-shrink-0"
            />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{title}</p>
            {(speaker || date) && (
              <p className="text-sm text-muted-foreground truncate">
                {speaker} {date && `• ${date}`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={onPrevious} disabled={!onPrevious}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button size="icon" onClick={togglePlay} className="h-10 w-10">
              {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </Button>
            <Button variant="ghost" size="icon" onClick={onNext} disabled={!onNext}>
              <SkipForward className="h-4 w-4" />
            </Button>
          </div>

          <div className="hidden md:flex items-center gap-2 w-64">
            <span className="text-xs text-muted-foreground w-10">{formatTime(currentTime)}</span>
            <Slider
              value={[currentTime]}
              max={duration || 100}
              step={1}
              onValueChange={handleSeek}
              className="flex-1"
            />
            <span className="text-xs text-muted-foreground w-10">{formatTime(duration)}</span>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={toggleMute}>
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume * 100]}
              max={100}
              step={1}
              onValueChange={handleVolumeChange}
              className="w-20"
            />
          </div>

          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={downloadAudio}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="md:hidden mt-2">
          <Slider
            value={[currentTime]}
            max={duration || 100}
            step={1}
            onValueChange={handleSeek}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AudioPlayerWidgetProps {
  audioUrl: string;
  title: string;
  show waveform?: boolean;
}

export function AudioPlayerWidget({ audioUrl, title }: AudioPlayerWidgetProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-full">
      <Button
        size="icon"
        className="h-10 w-10 rounded-full"
        onClick={togglePlay}
      >
        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </Button>
      
      <div className="flex-1">
        <p className="text-sm font-medium truncate">{title}</p>
        <Progress value={isPlaying ? 45 : 0} className="h-1 mt-1" />
      </div>

      <Button variant="ghost" size="icon">
        <Headphones className="h-4 w-4" />
      </Button>
    </div>
  );
}
