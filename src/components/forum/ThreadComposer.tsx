import React from 'react';
import PostComposer from './PostComposer';
import { useCreateThread } from '@/hooks/useForumThreads';

const ThreadComposer: React.FC = () => {
  const createThreadMutation = useCreateThread();

  const handleSubmit = (title: string, content: string) => {
    createThreadMutation.mutate({
      title,
      content,
      category: 'general',
    });
  };

  return (
    <PostComposer
      onSubmit={handleSubmit}
      showTitle={true}
      placeholder="Share your thoughts with the fleet... 🖖"
      submitLabel="🚀 Post Thread"
    />
  );
};

export default ThreadComposer;
