/**
 * ✏️ Forum Post Composer
 * Rich text editor with emoji support for creating posts
 */

import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bold, Italic, Link as LinkIcon, Quote, Code, Send } from 'lucide-react';
import EmojiPicker from './EmojiPicker';
import { parseEmojis } from '@/lib/forum-emojis';
import { sanitizeHtml } from '@/utils/sanitizeHtml';

interface PostComposerProps {
  onSubmit?: (title: string, content: string) => void;
  placeholder?: string;
  showTitle?: boolean;
  submitLabel?: string;
}

export const PostComposer: React.FC<PostComposerProps> = ({
  onSubmit,
  placeholder = "Share your thoughts with the fleet... 🖖",
  showTitle = true,
  submitLabel = "🚀 Post to Forum"
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    
    // Reset cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const handleEmojiSelect = (emoji: string) => {
    if (!textareaRef.current) return;
    
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const newText = content.substring(0, start) + emoji + content.substring(start);
    
    setContent(newText);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  const handleSubmit = () => {
    if (onSubmit && content.trim()) {
      onSubmit(title, content);
      setTitle('');
      setContent('');
    }
  };

  return (
    <Card className="border-2 border-axanar-teal/30 bg-gradient-to-br from-card via-card to-muted/20">
      <CardHeader className="bg-gradient-to-r from-axanar-teal/10 to-blue-500/10 border-b border-border/50">
        <CardTitle className="text-lg flex items-center gap-2">
          ✏️ New Post
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-4">
        {/* Title Input */}
        {showTitle && (
          <div className="space-y-2">
            <Label htmlFor="post-title" className="text-sm font-semibold">
              📝 Thread Title
            </Label>
            <Input
              id="post-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter your thread title..."
              className="border-2"
            />
          </div>
        )}

        {/* Formatting Toolbar */}
        <div className="flex flex-wrap items-center gap-2 p-2 bg-muted/30 rounded-lg border border-border/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText('**', '**')}
            title="Bold"
            className="h-8"
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText('*', '*')}
            title="Italic"
            className="h-8"
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText('[', '](url)')}
            title="Insert Link"
            className="h-8"
          >
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText('> ', '')}
            title="Quote"
            className="h-8"
          >
            <Quote className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => insertText('`', '`')}
            title="Code"
            className="h-8"
          >
            <Code className="h-4 w-4" />
          </Button>

          <div className="h-4 w-px bg-border mx-1" />

          <EmojiPicker onEmojiSelect={handleEmojiSelect} />

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs"
            >
              {showPreview ? '✏️ Edit' : '👁️ Preview'}
            </Button>
          </div>
        </div>

        {/* Content Editor / Preview */}
        {showPreview ? (
          <div className="min-h-[200px] p-4 bg-background/50 rounded-lg border-2 border-border/50">
            <div 
              className="prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHtml(parseEmojis(content).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br />'))
              }}
            />
            {!content && (
              <p className="text-muted-foreground italic">Nothing to preview yet...</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="post-content" className="text-sm font-semibold">
              💬 Message
            </Label>
            <Textarea
              id="post-content"
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={placeholder}
              className="min-h-[200px] border-2 font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              💡 Tip: Use :shortcode: for emojis (e.g. :vulcan: = 🖖) · Markdown supported
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50">
          <div className="text-xs text-muted-foreground">
            {content.length} characters
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setTitle('');
                setContent('');
              }}
            >
              Clear
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="bg-axanar-teal hover:bg-axanar-teal/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {submitLabel}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostComposer;
