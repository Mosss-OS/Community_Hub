"use client";

import { useState, useRef } from "react";
import { LuCamera, LuLoader2 } from 'react-icons/lu';

interface UserCoverProps {
  currentCover?: string;
  onCoverChange?: (url: string) => void;
}

export function UserCover({ currentCover, onCoverChange }: UserCoverProps) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setIsUploading(true);
    // Simulate upload - in production, this would upload to storage
    await new Promise(r => setTimeout(r, 1000));
    const mockUrl = URL.createObjectURL(file);
    onCoverChange?.(mockUrl);
    setIsUploading(false);
  };

  return (
    <div 
      className="relative h-32 sm:h-48 rounded-xl overflow-hidden bg-muted cursor-pointer group"
      onClick={() => fileInputRef.current?.click()}
    >
      {currentCover ? (
        <img src={currentCover} alt="Cover" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-primary/20 to-accent/20" />
      )}
      
      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
        {isUploading ? (
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        ) : (
          <div className="flex items-center gap-2 text-white">
            <Camera className="w-6 h-6" />
            <span>Change Cover</span>
          </div>
        )}
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
