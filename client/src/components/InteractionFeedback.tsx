"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LuCheck, LuX, LuHeart, LuThumbsUp, LuStar, LuSparkles } from 'react-icons/lu';
import { Button } from "@/components/ui/button";

interface Reaction {
  icon: React.ElementType;
  label: string;
  color: string;
}

const reactions: Reaction[] = [
  { icon: Heart, label: "Love", color: "text-pink-500" },
  { icon: ThumbsUp, label: "Like", color: "text-blue-500" },
  { icon: Star, label: "Star", color: "text-yellow-500" },
  { icon: Sparkles, label: "Wow", color: "text-purple-500" },
];

interface LikeButtonProps {
  onLike?: () => void;
  liked?: boolean;
  count?: number;
}

export function LikeButton({ onLike, liked = false, count = 0 }: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(liked);
  const [likeCount, setLikeCount] = useState(count);
  const [showReaction, setShowReaction] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
    onLike?.();
  };

  return (
    <div className="relative inline-flex">
      <Button
        variant="ghost"
        size="sm"
        className={`gap-1 ${isLiked ? "text-pink-500" : ""}`}
        onClick={handleLike}
        onMouseEnter={() => setShowReaction(true)}
        onMouseLeave={() => setShowReaction(false)}
      >
        <motion.div
          whileTap={{ scale: 0.8 }}
          animate={isLiked ? { scale: [1, 1.2, 1] } : {}}
        >
          <Heart className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`} />
        </motion.div>
        <span>{likeCount}</span>
      </Button>

      <AnimatePresence>
        {showReaction && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 flex gap-1 bg-background border rounded-full p-1 shadow-lg"
          >
            {reactions.map((reaction) => (
              <button
                key={reaction.label}
                className={`p-1.5 rounded-full hover:bg-muted transition-colors ${reaction.color}`}
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(true);
                  setLikeCount(likeCount + 1);
                }}
              >
                <reaction.icon className="h-4 w-4" />
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface FeedbackToastProps {
  message: string;
  type?: "success" | "error" | "info";
  onClose?: () => void;
}

export function FeedbackToast({ message, type = "success", onClose }: FeedbackToastProps) {
  const icons = {
    success: Check,
    error: X,
    info: Sparkles,
  };

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
  };

  const Icon = icons[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="fixed top-4 right-4 z-50 flex items-center gap-2 bg-background border rounded-lg shadow-lg p-3"
    >
      <div className={`h-6 w-6 rounded-full ${colors[type]} flex items-center justify-center`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <span className="text-sm font-medium">{message}</span>
      {onClose && (
        <button onClick={onClose} className="ml-2 text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      )}
    </motion.div>
  );
}

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  message?: string;
}

export function LoadingSpinner({ size = "md", message }: LoadingSpinnerProps) {
  const sizes = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className={`${sizes[size]} border-2 border-primary border-t-transparent rounded-full`}
      />
      {message && <p className="text-sm text-muted-foreground">{message}</p>}
    </div>
  );
}

export function useInteractionFeedback() {
  const [feedback, setFeedback] = useState<{
    message: string;
    type: "success" | "error" | "info";
  } | null>(null);

  const showSuccess = useCallback((message: string) => {
    setFeedback({ message, type: "success" });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const showError = useCallback((message: string) => {
    setFeedback({ message, type: "error" });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  const showInfo = useCallback((message: string) => {
    setFeedback({ message, type: "info" });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  return { feedback, showSuccess, showError, showInfo };
}
