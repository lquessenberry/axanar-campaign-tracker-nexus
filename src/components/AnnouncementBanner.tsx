import { Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AnnouncementBanner() {
  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-primary/10 border-primary/20">
      <div className="w-full flex items-center justify-center gap-2">
        <Info className="h-4 w-4 flex-shrink-0" />
        <AlertDescription className="text-sm text-center">
          <strong>System Status:</strong> 2014 & 2015 Kickstarter and Indiegogo campaign data (perks & donations) are now fully integrated. 
          Additional platforms coming soon.{" "}
          <Link to="/forum" className="underline hover:text-primary font-medium">
            Learn more in the Forum
          </Link>
        </AlertDescription>
      </div>
    </Alert>
  );
}
