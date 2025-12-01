import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Megaphone } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface AnnouncementThread {
  id: string;
  title: string;
  content: string;
  author_username: string;
  created_at: string;
  comment_count: number;
  like_count: number;
  is_pinned: boolean;
  is_official: boolean;
}

interface AnnouncementsSectionProps {
  threads: AnnouncementThread[];
  renderThread: (thread: AnnouncementThread, index: number) => React.ReactNode;
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({
  threads,
  renderThread,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (threads.length === 0) return null;

  return (
    <Card className="border-2 border-amber-500/40 backdrop-blur-md bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-2xl overflow-hidden">
      <CardHeader className="p-0">
        <Button
          variant="ghost"
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            "w-full justify-between px-4 py-3 h-auto rounded-none",
            "bg-gradient-to-r from-amber-500/20 to-orange-500/20",
            "hover:from-amber-500/30 hover:to-orange-500/30",
            "border-b border-amber-500/20"
          )}
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Megaphone className="h-5 w-5 text-amber-500" />
            </div>
            <span className="font-semibold text-lg">Announcements</span>
            <Badge variant="secondary" className="bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30">
              {threads.length}
            </Badge>
          </div>
          <motion.div
            animate={{ rotate: isExpanded ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-5 w-5 text-muted-foreground" />
          </motion.div>
        </Button>
      </CardHeader>
      
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <CardContent className="p-3 space-y-3">
              {threads.map((thread, index) => (
                <motion.div
                  key={thread.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  {renderThread(thread, index)}
                </motion.div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default AnnouncementsSection;
