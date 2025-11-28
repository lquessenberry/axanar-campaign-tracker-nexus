import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Info, ExternalLink } from "lucide-react";

export function CampaignDataWelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check if user has seen this modal before
    const hasSeenModal = localStorage.getItem("campaign-data-modal-seen");
    if (!hasSeenModal) {
      setOpen(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem("campaign-data-modal-seen", "true");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Info className="h-5 w-5 text-primary" />
            <DialogTitle className="text-2xl">Campaign Data Integration Status</DialogTitle>
          </div>
          <DialogDescription className="text-base leading-relaxed space-y-4 pt-4">
            <p>
              Welcome! We want to ensure you understand which campaign data is currently available on this platform:
            </p>
            
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-foreground">✅ Currently Integrated:</h4>
              <ul className="space-y-1 text-sm ml-4">
                <li>• <strong>2014 & 2015 Kickstarter campaigns</strong> (perks & donations)</li>
                <li>• <strong>2014 & 2015 Indiegogo campaigns</strong> (perks & donations)</li>
              </ul>
            </div>

            <div className="bg-muted/50 border border-border rounded-lg p-4 space-y-2">
              <h4 className="font-semibold text-foreground">🔄 Coming Soon:</h4>
              <ul className="space-y-1 text-sm ml-4">
                <li>• Additional platforms and campaigns</li>
                <li>• WooCommerce store purchases</li>
                <li>• Patreon contributions</li>
              </ul>
            </div>

            <p className="text-sm">
              If you contributed through other platforms or time periods, your data will be added as we continue building the system. 
              For questions or concerns, please visit the forum or contact support.
            </p>

            <div className="flex gap-3 pt-2">
              <Link to="/forum" className="flex-1">
                <Button variant="outline" className="w-full" onClick={handleClose}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Learn More in Forum
                </Button>
              </Link>
              <Button onClick={handleClose} className="flex-1">
                Got It
              </Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
