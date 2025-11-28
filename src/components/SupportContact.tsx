import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupportContact = () => {
  return (
    <Card className="border-primary/20 bg-card">
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Mail className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">Need Help?</h3>
              <p className="text-sm text-muted-foreground">
                Contact our support team
              </p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <a href="mailto:axanartech@gmail.com">
                <Mail className="h-4 w-4 mr-2" />
                axanartech@gmail.com
              </a>
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              asChild
            >
              <Link to="/direct-messages?tab=support&new=true">
                <MessageSquare className="h-4 w-4 mr-2" />
                Open Support Ticket
              </Link>
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            For pledge amount discrepancies, please include your email address and 
            campaign name in your message.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
