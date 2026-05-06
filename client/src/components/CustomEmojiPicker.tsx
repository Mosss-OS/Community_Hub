import { useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { LuSmile } from 'react-icons/lu';

const CUSTOM_EMOJIS = [
  { id: "pray", emoji: "🙏", label: "Prayer" },
  { id: "heart", emoji: "❤️", label: "Love" },
  { id: "hands", emoji: "🙌", label: "Praise" },
  { id: "star", emoji: "⭐", label: "Favorite" },
  { id: "fire", emoji: "🔥", label: "Fire" },
  { id: "dove", emoji: "🕊", label: "Peace" },
  { id: "cross", emoji: "✝️", label: "Faith" },
  { id: "book", emoji: "📖", label: "Bible" },
];

interface EmojiReaction {
  emoji: string;
  count: number;
  reacted: boolean;
}

interface CustomEmojiPickerProps {
  onReact: (emojiId: string) => void;
  reactions?: EmojiReaction[];
}

export function CustomEmojiPicker({ onReact, reactions = [] }: CustomEmojiPickerProps) {
  const [open, setOpen] = useState(false);

  const handleReact = (emojiId: string) => {
    onReact(emojiId);
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {reactions.map((reaction) => (
        <button
          key={reaction.emoji}
          onClick={() => onReact(reaction.emoji)}
          className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
            reaction.reacted 
              ? "bg-primary/20 text-primary" 
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <span>{reaction.emoji}</span>
          <span className="text-xs">{reaction.count}</span>
        </button>
      ))}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="ghost" size="sm" className="rounded-full">
            <Smile className="w-4 h-4" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2">
          <div className="grid grid-cols-4 gap-2">
            {CUSTOM_EMOJIS.map((item) => (
              <button
                key={item.id}
                onClick={() => handleReact(item.id)}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-xl"
                title={item.label}
              >
                {item.emoji}
              </button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export function useEmojiReactions(initialReactions?: EmojiReaction[]) {
  const [reactions, setReactions] = useState<EmojiReaction[]>(
    initialReactions || CUSTOM_EMOJIS.map(e => ({ emoji: e.emoji, count: 0, reacted: false }))
  );

  const handleReact = (emojiId: string) => {
    setReactions(prev => prev.map(r => {
      const emojiItem = CUSTOM_EMOJIS.find(e => e.id === emojiId);
      if (!emojiItem) return r;
      if (r.emoji === emojiItem.emoji) {
        return { ...r, count: r.reacted ? r.count - 1 : r.count + 1, reacted: !r.reacted };
      }
      return r;
    }));
  };

  return { reactions, handleReact };
}
