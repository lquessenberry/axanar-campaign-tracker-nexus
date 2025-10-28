import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, SortAsc, Filter } from 'lucide-react';

interface ForumSearchBarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  category: string | null;
  onCategoryChange: (value: string | null) => void;
  sortBy: 'new' | 'hot' | 'top';
  onSortChange: (value: 'new' | 'hot' | 'top') => void;
}

const CATEGORIES = [
  { value: 'all', label: 'All Categories' },
  { value: 'announcements', label: '📢 Announcements' },
  { value: 'general', label: '💬 General Discussion' },
  { value: 'fan-content', label: '🎨 Fan Content' },
  { value: 'support', label: '❓ Support' },
  { value: 'off-topic', label: '☕ Off-Topic' },
];

export const ForumSearchBar: React.FC<ForumSearchBarProps> = ({
  searchQuery,
  onSearchChange,
  category,
  onCategoryChange,
  sortBy,
  onSortChange,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-card/50 rounded-lg border">
      <div className="flex-1 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search threads..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>

      <Select value={category || 'all'} onValueChange={(v) => onCategoryChange(v === 'all' ? null : v)}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <Filter className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CATEGORIES.map((cat) => (
            <SelectItem key={cat.value} value={cat.value}>
              {cat.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select value={sortBy} onValueChange={(v) => onSortChange(v as 'new' | 'hot' | 'top')}>
        <SelectTrigger className="w-full sm:w-[150px]">
          <SortAsc className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="new">🆕 New</SelectItem>
          <SelectItem value="hot">🔥 Hot</SelectItem>
          <SelectItem value="top">⭐ Top</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
