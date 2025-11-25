import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, AlertCircle, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function KnownIssues() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Badge variant="outline" className="mb-2">
            <Clock className="h-3 w-3 mr-1" />
            Updated Nov 25, 2025
          </Badge>
          <h1 className="text-4xl font-trek-heading tracking-wider mb-2">
            Platform Status & Known Issues
          </h1>
          <p className="text-muted-foreground">
            Transparency about what we're working on and what's been fixed
          </p>
        </div>

        {/* Currently Working */}
        <Card className="mb-6 border-yellow-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertCircle className="h-5 w-5" />
              Under Investigation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">Address Update Issues</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Some users are experiencing difficulty saving shipping address updates.
                We've added enhanced diagnostics and are investigating donor account linkage.
              </p>
              <Badge variant="secondary" className="text-xs">Priority: High</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Pledge History Accuracy</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Some upgraded pledges may show original amounts instead of current values.
                We're conducting a comprehensive data reconciliation audit.
              </p>
              <Badge variant="secondary" className="text-xs">Priority: High</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Perks Tracking Access</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Some users report difficulty accessing detailed perks information.
                We're improving navigation and permissions.
              </p>
              <Badge variant="secondary" className="text-xs">Priority: Medium</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Recently Fixed */}
        <Card className="mb-6 border-green-500/40">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-500">
              <CheckCircle className="h-5 w-5" />
              Recently Fixed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold mb-2">✅ Campaign URLs</h3>
              <p className="text-sm text-muted-foreground">
                All Kickstarter and Indiegogo campaign links now resolve correctly.
              </p>
              <Badge variant="outline" className="text-xs">Fixed: Nov 25</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">✅ Message System Performance</h3>
              <p className="text-sm text-muted-foreground">
                Direct messaging is now 5-10x faster with pagination and optimistic updates.
              </p>
              <Badge variant="outline" className="text-xs">Fixed: Nov 21</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">✅ Message Deletion</h3>
              <p className="text-sm text-muted-foreground">
                Users can now delete individual messages and entire conversation threads.
              </p>
              <Badge variant="outline" className="text-xs">Fixed: Nov 25</Badge>
            </div>

            <div>
              <h3 className="font-semibold mb-2">✅ Forum Visual Upgrade</h3>
              <p className="text-sm text-muted-foreground">
                Cosmic background, smooth animations, and premium glassmorphism effects.
              </p>
              <Badge variant="outline" className="text-xs">Completed: Nov 21</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Known Limitations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Known Limitations</CardTitle>
            <CardDescription>Features we're planning to add</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <h3 className="font-semibold mb-1 text-sm">📦 Store Purchases</h3>
              <p className="text-xs text-muted-foreground">
                Store purchases (labels, add-ons) require separate import. Currently only
                Kickstarter and Indiegogo pledges are tracked. Coming soon!
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-sm">✉️ Email Changes</h3>
              <p className="text-xs text-muted-foreground">
                Email address changes require admin assistance for security. DM @lee with your request.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-1 text-sm">🔄 Legacy Data</h3>
              <p className="text-xs text-muted-foreground">
                Some historical data may require manual reconciliation. Contact support if your
                records look incorrect.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Support Options */}
        <Alert>
          <MessageSquare className="h-4 w-4" />
          <AlertDescription>
            <strong>Need Help?</strong>
            <div className="mt-2 space-x-2">
              <Link to="/forum">
                <Button variant="outline" size="sm">
                  Forum Support
                </Button>
              </Link>
              <Link to="/direct-messages">
                <Button variant="outline" size="sm">
                  DM @lee
                </Button>
              </Link>
            </div>
          </AlertDescription>
        </Alert>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>This page is updated regularly as we resolve issues and add features.</p>
          <p className="mt-1">Last updated: November 25, 2025</p>
        </div>
      </div>
    </div>
  );
}
