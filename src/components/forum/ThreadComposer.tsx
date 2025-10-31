import React, { useState } from 'react';
import PostComposer from './PostComposer';
import { useCreateThread, ForumCategory } from '@/hooks/useForumThreads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { FORUM_CATEGORIES } from '@/lib/forum-categories';

const ThreadComposer: React.FC = () => {
  const createThreadMutation = useCreateThread();
  const [selectedCategory, setSelectedCategory] = useState<ForumCategory>('general');

  const handleSubmit = (title: string, content: string) => {
    createThreadMutation.mutate({
      title,
      content,
      category: selectedCategory,
    });
  };

  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default ThreadComposer;
