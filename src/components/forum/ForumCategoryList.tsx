import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import type { ForumCategory } from '@/hooks/useForumThreads';
import { FORUM_CATEGORIES } from '@/lib/forum-categories';

interface ForumCategoryListProps {
  onCategorySelect: (category: ForumCategory | null) => void;
  selectedCategory: ForumCategory | null;
}

export const ForumCategoryList: React.FC<ForumCategoryListProps> = ({ 
  onCategorySelect,
  selectedCategory 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Object.entries(FORUM_CATEGORIES).map(([key, { label, icon, description }]) => {
        const isSelected = selectedCategory === key;
        return (
          <Card
            key={key}
            className={`cursor-pointer transition-all hover:scale-105 ${
              isSelected ? 'border-primary ring-2 ring-primary/20' : ''
            }`}
            onClick={() => onCategorySelect(key as ForumCategory)}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span className="text-2xl">{icon}</span>
                {label}
              </CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
          </Card>
        );
      })}
    </div>
  );
};

export default ForumCategoryList;
