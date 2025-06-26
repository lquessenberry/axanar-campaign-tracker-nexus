
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface AdminPlaceholderSectionProps {
  title: string;
  description: string;
  Icon: LucideIcon;
}

const AdminPlaceholderSection = ({ title, description, Icon }: AdminPlaceholderSectionProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <p>This section is under development.</p>
          <p className="text-sm mt-2">Check back soon for updates!</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AdminPlaceholderSection;
