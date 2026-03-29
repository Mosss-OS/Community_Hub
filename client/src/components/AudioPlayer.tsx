"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

interface AudioPlayerProps {
  src: string;
  title?: string;
}

export function AudioPlayer({ src, title }: AudioPlayerProps) {
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
    
    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    
    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
    } else {
      audioRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (value: number[]) => {
    audioRef.current!.currentTime = value[0];
    setCurrentTime(value[0]);
  };

  const handleVolume = (value: number[]) => {
    const vol = value[0] / 100;
    audioRef.current!.volume = vol;
    setVolume(vol);
    setIsMuted(vol === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      audioRef.current!.volume = volume || 1;
      setIsMuted(false);
    } else {
      audioRef.current!.volume = 0;
      setIsMuted(true);
    }
  };

  const skip = (seconds: number) => {
    audioRef.current!.currentTime += seconds;
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-xl">
      <audio ref={audioRef} src={src} />
      
      <Button onClick={togglePlay} size="icon" variant="ghost">
        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
      </Button>
      
      <Button onClick={() => skip(-10)} size="icon" variant="ghost">
        <SkipBack className="w-4 h-4" />
      </Button>
      
      <Button onClick={() => skip(10)} size="icon" variant="ghost">
        <SkipForward className="w-4 h-4" />
      </Button>
      
      <div className="flex-1">
        <Slider
          value={[currentTime]}
          max={duration || 100}
          onValueChange={handleSeek}
          className="w-full"
        />
      </div>
      
      <span className="text-sm text-muted-foreground w-20">
        {formatTime(currentTime)} / {formatTime(duration)}
      </span>
      
      <Button onClick={toggleMute} size="icon" variant="ghost">
        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
      </Button>
    </div>
  );
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}
