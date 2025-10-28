import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Smile } from 'lucide-react';
import { FORUM_EMOJIS } from '@/lib/forum-emojis';

interface EmojiPickerButtonProps {
  onEmojiSelect: (emoji: string) => void;
}

export const EmojiPickerButton: React.FC<EmojiPickerButtonProps> = ({ onEmojiSelect }) => {
  const [open, setOpen] = useState(false);

  const handleSelect = (emoji: string) => {
    onEmojiSelect(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm" type="button">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="grid grid-cols-8 gap-1 max-h-64 overflow-y-auto">
          {FORUM_EMOJIS.map((emoji) => (
            <button
              key={emoji.shortcode}
              type="button"
              onClick={() => handleSelect(emoji.code)}
              className="p-2 hover:bg-accent rounded text-2xl transition-colors"
              title={emoji.description}
            >
              {emoji.emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};
