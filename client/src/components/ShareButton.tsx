"use client";

import { useState } from "react";
import { Share2, Link, Mail, Twitter, Facebook, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ShareButtonProps {
  title: string;
  url?: string;
  description?: string;
}

export function ShareButton({ title, url, description }: ShareButtonProps) {
  const [showOptions, setShowOptions] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl = url || window.location.href;

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    toast.success("Link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareEmail = () => {
    const subject = encodeURIComponent(title);
    const body = encodeURIComponent(`${title}\n\n${shareUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(`${title} ${shareUrl}`);
    window.open(`https://twitter.com/intent/tweet?text=${text}`, "_blank");
  };

  const shareFacebook = () => {
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, "_blank");
  };

  return (
    <div className="relative">
      <Button variant="outline" size="sm" onClick={() => setShowOptions(!showOptions)}>
        <Share2 className="w-4 h-4 mr-2" />
        Share
      </Button>
      
      {showOptions && (
        <div className="absolute right-0 top-full mt-2 p-2 bg-background border rounded-lg shadow-lg z-10 w-48">
          <button onClick={copyLink} className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
            {copied ? <Check className="w-4 h-4" /> : <Link className="w-4 h-4" />}
            <span className="text-sm">Copy Link</span>
          </button>
          <button onClick={shareEmail} className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
            <Mail className="w-4 h-4" />
            <span className="text-sm">Email</span>
          </button>
          <button onClick={shareTwitter} className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
            <Twitter className="w-4 h-4" />
            <span className="text-sm">Twitter</span>
          </button>
          <button onClick={shareFacebook} className="flex items-center gap-2 w-full p-2 hover:bg-muted rounded">
            <Facebook className="w-4 h-4" />
            <span className="text-sm">Facebook</span>
          </button>
        </div>
      )}
    </div>
  );
}
