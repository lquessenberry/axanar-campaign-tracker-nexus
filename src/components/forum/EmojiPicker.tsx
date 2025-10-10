/**
 * 🎮 Retro Emoji Picker Component
 * MySpace meets phpBB aesthetic for Axanar forums
 */

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Smile } from 'lucide-react';
import {
  EMOJI_CATEGORIES,
  getEmojisByCategory,
  QUICK_EMOJIS,
  type ForumEmoji
} from '@/lib/forum-emojis';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
  trigger?: React.ReactNode;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  onEmojiSelect,
  trigger 
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('starfleet');

  const handleEmojiClick = (emoji: ForumEmoji) => {
    onEmojiSelect(emoji.emoji);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        {trigger || (
          <Button 
            variant="outline" 
            size="sm"
            className="gap-2 border-2 hover:border-axanar-teal/50 transition-all"
          >
            <Smile className="h-4 w-4" />
            Emojis 😊
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0 border-2 border-axanar-teal/30 bg-card/95 backdrop-blur"
        align="start"
      >
        <div className="p-3 border-b border-border/50 bg-gradient-to-r from-axanar-teal/10 to-blue-500/10">
          <h3 className="font-bold text-sm flex items-center gap-2">
            🖖 Star Trek Emoji Picker
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Click to insert · MySpace style activated!
          </p>
        </div>

        {/* Quick Access */}
        <div className="p-3 border-b border-border/50">
          <p className="text-xs font-semibold mb-2 text-muted-foreground">⚡ QUICK ACCESS</p>
          <div className="flex flex-wrap gap-1">
            {QUICK_EMOJIS.map((emoji, idx) => (
              <button
                key={idx}
                onClick={() => onEmojiSelect(emoji)}
                className="text-2xl hover:scale-125 transition-transform hover:bg-axanar-teal/10 rounded p-1"
                title={emoji}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Category Tabs */}
        <Tabs defaultValue="starfleet" className="w-full">
          <TabsList className="w-full rounded-none border-b bg-muted/50 h-auto p-0 flex-wrap justify-start">
            {EMOJI_CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs px-2 py-1.5 data-[state=active]:bg-axanar-teal/20 data-[state=active]:text-axanar-teal"
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className="mr-1">{cat.icon}</span>
                {cat.label.split(' ')[1]}
              </TabsTrigger>
            ))}
          </TabsList>

          {EMOJI_CATEGORIES.map((cat) => (
            <TabsContent key={cat.id} value={cat.id} className="p-3 max-h-48 overflow-y-auto">
              <div className="grid grid-cols-6 gap-1">
                {getEmojisByCategory(cat.id as any).map((emojiData, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleEmojiClick(emojiData)}
                    className="text-2xl hover:scale-125 transition-transform hover:bg-axanar-teal/10 rounded p-2 relative group"
                    title={emojiData.description}
                  >
                    {emojiData.emoji}
                    <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 bg-black/90 text-white text-[10px] px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 mb-1">
                      :{emojiData.shortcode}:
                    </span>
                  </button>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>

        {/* Footer */}
        <div className="p-2 border-t border-border/50 bg-muted/30 text-[10px] text-center text-muted-foreground">
          💖 Retro vibes · Use :shortcode: in posts!
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
