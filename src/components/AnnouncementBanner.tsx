import { Info } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AnnouncementBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-primary/10 border-primary/20">
      <Info className="h-4 w-4" />
      <AlertDescription className="text-sm">
        <strong>System Status:</strong> Kickstarter and Indiegogo campaign data (perks & donations) are now fully integrated. 
        Additional platforms coming soon as we continue building the system.
      </AlertDescription>
    </Alert>
  );
}
