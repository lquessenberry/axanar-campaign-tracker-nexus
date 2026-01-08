
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Eye, UserCheck } from "lucide-react";
import DonorActions from "./DonorActions";
import { useImpersonation } from "@/contexts/ImpersonationContext";
import { useToast } from "@/hooks/use-toast";

interface Donor {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  donor_name?: string;
  email: string;
  auth_user_id?: string;
  username?: string;
  created_at?: string;
  totalDonations: number;
  donationCount: number;
  lastDonationDate?: string;
}

interface DonorTableProps {
  donors: Donor[];
  selectedDonors: Set<string>;
  onSelectDonor: (donorId: string, checked: boolean) => void;
  onSendEmail: (donor: Donor) => void;
  onBan: (donor: Donor) => void;
  onActivate: (donor: Donor) => void;
}

const DonorTable = ({ 
  donors, 
  selectedDonors, 
  onSelectDonor,
  onSendEmail,
  onBan,
  onActivate
}: DonorTableProps) => {
  const { startImpersonation } = useImpersonation();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleViewAsUser = (donor: Donor) => {
    if (!donor.auth_user_id) {
      toast({
        title: "Cannot View as User",
        description: "This donor doesn't have a linked account yet.",
        variant: "destructive",
      });
      return;
    }
    
    startImpersonation({
      id: donor.auth_user_id,
      username: donor.username || undefined,
      full_name: donor.full_name || donor.donor_name || `${donor.first_name || ''} ${donor.last_name || ''}`.trim() || undefined,
      email: donor.email,
      donor_id: donor.id,
    });
    
    toast({
      title: "Impersonation Started",
      description: `Now viewing site as ${donor.donor_name || donor.full_name || donor.email}`,
    });
    
    navigate('/profile');
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="w-12">
              <span className="sr-only">Select</span>
            </TableHead>
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Donations</TableHead>
            <TableHead className="text-muted-foreground">Total Donated</TableHead>
            <TableHead className="text-muted-foreground">Last Donation</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Joined</TableHead>
            <TableHead className="text-muted-foreground w-12">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donors?.map((donor) => (
            <TableRow key={donor.id} className="border-border">
              <TableCell>
                <Checkbox
                  checked={selectedDonors.has(donor.id)}
                  onCheckedChange={(checked) => onSelectDonor(donor.id, !!checked)}
                />
              </TableCell>
              <TableCell className="text-card-foreground">
                {donor.auth_user_id && donor.username ? (
                  <Link 
                    to={`/u/${donor.username}`}
                    className="hover:text-primary hover:underline transition-colors cursor-pointer"
                  >
                    {donor.first_name && donor.last_name 
                      ? `${donor.first_name} ${donor.last_name}`
                      : donor.full_name || donor.donor_name || 'Unknown'
                    }
                  </Link>
                ) : (
                  <span>
                    {donor.first_name && donor.last_name 
                      ? `${donor.first_name} ${donor.last_name}`
                      : donor.full_name || donor.donor_name || 'Unknown'
                    }
                  </span>
                )}
              </TableCell>
              <TableCell className="text-card-foreground">{donor.email}</TableCell>
              <TableCell className="text-card-foreground">{donor.donationCount}</TableCell>
              <TableCell className="text-card-foreground">
                ${donor.totalDonations.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-card-foreground">
                {donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'No donations'}
              </TableCell>
              <TableCell>
                <Badge 
                  variant={donor.auth_user_id ? "default" : "secondary"}
                  className={donor.auth_user_id 
                    ? "bg-green-600 text-white" 
                    : "bg-yellow-600 text-white"
                  }
                >
                  {donor.auth_user_id ? "Registered" : "Legacy"}
                </Badge>
              </TableCell>
              <TableCell className="text-card-foreground">
                {donor.created_at ? new Date(donor.created_at).toLocaleDateString() : 'N/A'}
              </TableCell>
              <TableCell className="flex items-center gap-1">
                {donor.auth_user_id && (
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    title="View as this user"
                    onClick={() => handleViewAsUser(donor)}
                    className="text-amber-500 hover:text-amber-600 hover:bg-amber-500/10"
                  >
                    <UserCheck className="h-4 w-4" />
                  </Button>
                )}
                <Button size="icon" variant="ghost" asChild title="View full profile">
                  <Link to={`/admin/donor/${donor.id}`}>
                    <Eye className="h-4 w-4" />
                  </Link>
                </Button>
                <DonorActions
                  donor={donor}
                  onSendEmail={onSendEmail}
                  onBan={onBan}
                  onActivate={onActivate}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DonorTable;
