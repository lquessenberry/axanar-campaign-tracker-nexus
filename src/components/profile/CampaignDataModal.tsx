import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ExternalLink } from 'lucide-react';

interface CampaignData {
  campaign_name: string;
  platform: string;
  pledge_amount: number;
  contribution_date?: string;
  campaign_url?: string;
}

interface CampaignDataModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: CampaignData | null;
}

export function CampaignDataModal({ open, onOpenChange, data }: CampaignDataModalProps) {
  if (!data) return null;


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{data.campaign_name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{data.platform}</Badge>
              {data.contribution_date && (
                <span className="text-sm text-muted-foreground">
                  {new Date(data.contribution_date).toLocaleDateString()}
                </span>
              )}
            </div>
            <span className="text-2xl font-semibold">
              ${data.pledge_amount.toLocaleString()}
            </span>
          </div>

          {data.campaign_url && (
            <a
              href={data.campaign_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              View Original Campaign
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}