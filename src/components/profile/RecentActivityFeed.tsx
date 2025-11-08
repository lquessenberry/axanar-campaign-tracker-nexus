import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, DollarSign, Trophy, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface ActivityItem {
  type: 'forum' | 'contribution' | 'achievement';
  title: string;
  description?: string;
  date: string;
  link?: string;
  amount?: number;
}

interface RecentActivityFeedProps {
  pledges?: any[];
  achievements?: any[];
  forumThreads?: any[];
  forumComments?: any[];
  limit?: number;
}

const RecentActivityFeed: React.FC<RecentActivityFeedProps> = ({
  pledges = [],
  achievements = [],
  forumThreads = [],
  forumComments = [],
  limit = 10
}) => {
  const activities: ActivityItem[] = [];

  // Add contributions
  pledges.forEach(pledge => {
    activities.push({
      type: 'contribution',
      title: 'Made a contribution',
      description: pledge.campaigns?.name || 'Campaign',
      date: pledge.created_at,
      amount: Number(pledge.amount),
      link: pledge.campaigns?.id ? `/campaigns/${pledge.campaigns.id}` : undefined
    });
  });

  // Add achievements
  achievements.forEach(achievement => {
    activities.push({
      type: 'achievement',
      title: 'Unlocked achievement',
      description: achievement.achievement_type?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()),
      date: achievement.earned_at
    });
  });

  // Add forum threads
  forumThreads.forEach(thread => {
    activities.push({
      type: 'forum',
      title: 'Created thread',
      description: thread.title,
      date: thread.created_at,
      link: `/forum/thread/${thread.id}`
    });
  });

  // Add forum comments
  forumComments.forEach(comment => {
    activities.push({
      type: 'forum',
      title: 'Posted a comment',
      description: comment.content?.substring(0, 100) + (comment.content?.length > 100 ? '...' : ''),
      date: comment.created_at,
      link: comment.thread_id ? `/forum/thread/${comment.thread_id}` : undefined
    });
  });

  // Sort by date (most recent first) and limit
  const sortedActivities = activities
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);

  const getIcon = (type: string) => {
    switch (type) {
      case 'forum':
        return <MessageSquare className="h-4 w-4" />;
      case 'contribution':
        return <DollarSign className="h-4 w-4" />;
      case 'achievement':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Calendar className="h-4 w-4" />;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case 'forum':
        return 'text-blue-500 bg-blue-500/10';
      case 'contribution':
        return 'text-green-500 bg-green-500/10';
      case 'achievement':
        return 'text-purple-500 bg-purple-500/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  if (sortedActivities.length === 0) {
    return (
      <Card className="bg-card/50 backdrop-blur-sm border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No recent activity. Start contributing or join forum discussions!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card/50 backdrop-blur-sm border-border/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedActivities.map((activity, index) => {
            const content = (
              <div className="flex gap-4 p-3 rounded-lg hover:bg-background/40 transition-colors">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${getIconColor(activity.type)}`}>
                  {getIcon(activity.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {activity.title}
                        {activity.amount && (
                          <span className="ml-2 text-green-600 dark:text-green-400 font-semibold">
                            ${activity.amount.toLocaleString()}
                          </span>
                        )}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-muted-foreground truncate">
                          {activity.description}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </div>
            );

            if (activity.link) {
              return (
                <Link key={index} to={activity.link}>
                  {content}
                </Link>
              );
            }

            return <div key={index}>{content}</div>;
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivityFeed;
