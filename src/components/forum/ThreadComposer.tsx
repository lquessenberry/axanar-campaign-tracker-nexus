import React, { useState } from 'react';
import PostComposer from './PostComposer';
import { useCreateThread, ForumCategory } from '@/hooks/useForumThreads';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { FORUM_CATEGORIES } from '@/lib/forum-categories';
import { motion } from 'framer-motion';

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
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <Button 
            variant="outline" 
            className="w-full justify-between border-2 border-nebula-purple/30 hover:border-nebula-purple hover:bg-gradient-to-r hover:from-nebula-purple/10 hover:to-nebula-cyan/10 h-14 rounded-3xl backdrop-blur-md transition-all shadow-lg hover:shadow-nebula-purple/20"
          >
            <span className="flex items-center gap-3">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              >
                <Sparkles className="h-5 w-5 text-nebula-purple" />
              </motion.div>
              <span className="text-lg font-semibold">Create New Cosmic Thread</span>
            </span>
            {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
          </Button>
        </motion.div>
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
