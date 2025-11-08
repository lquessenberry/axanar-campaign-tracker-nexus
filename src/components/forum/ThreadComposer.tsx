import React, { useState } from 'react';
import PostComposer from './PostComposer';
import { useCreateThread, ForumCategory } from '@/hooks/useForumThreads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, PenSquare } from 'lucide-react';
import { FORUM_CATEGORIES } from '@/lib/forum-categories';

const ThreadComposer: React.FC = () => {
  const createThreadMutation = useCreateThread();
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>('general');
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = (title: string, content: string) => {
    createThreadMutation.mutate({
      title,
      content,
      category: selectedCategory,
    });
    setIsOpen(false);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
      <CollapsibleTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between border-2 border-axanar-teal/30 hover:border-axanar-teal/50 h-12"
        >
          <span className="flex items-center gap-2">
            <PenSquare className="h-4 w-4" />
            ✨ Create New Thread
          </span>
          {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="space-y-4">
        <div className="space-y-2">
          <Label>Category</Label>
          <Select value={selectedCategory} onValueChange={(val) => setSelectedCategory(val as ForumCategory)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(FORUM_CATEGORIES).map(([key, { label, icon }]) => (
                <SelectItem key={key} value={key}>
                  {icon} {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <PostComposer
          onSubmit={handleSubmit}
          showTitle={true}
          placeholder="Share your thoughts with the fleet... 🖖"
          submitLabel="🚀 Post Thread"
        />
      </CollapsibleContent>
    </Collapsible>
  );
};

export default ThreadComposer;
