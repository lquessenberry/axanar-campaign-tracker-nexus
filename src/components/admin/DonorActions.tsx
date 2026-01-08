
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Mail, Ban, UserCheck, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
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
}

interface DonorActionsProps {
  donor: Donor;
  onSendEmail: (donor: Donor) => void;
  onBan: (donor: Donor) => void;
  onActivate: (donor: Donor) => void;
}

const DonorActions = ({ donor, onSendEmail, onBan, onActivate }: DonorActionsProps) => {
  const navigate = useNavigate();
  const { startImpersonation } = useImpersonation();
  const { toast } = useToast();

  const handleEditDonor = () => {
    if (donor.auth_user_id) {
      navigate(`/profile/${donor.auth_user_id}`);
    } else {
      // For legacy donors without auth_user_id, we could show a message or create an account first
      onActivate(donor);
    }
  };

  const handleViewAsUser = () => {
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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {donor.auth_user_id && (
          <>
            <DropdownMenuItem onClick={handleViewAsUser} className="text-amber-600">
              <Eye className="mr-2 h-4 w-4" />
              View as User
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}
        <DropdownMenuItem onClick={handleEditDonor}>
          <Edit className="mr-2 h-4 w-4" />
          Edit Donor
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onSendEmail(donor)}>
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>
        {donor.auth_user_id ? (
          <DropdownMenuItem onClick={() => onBan(donor)} className="text-red-600">
            <Ban className="mr-2 h-4 w-4" />
            Ban User
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem onClick={() => onActivate(donor)}>
            <UserCheck className="mr-2 h-4 w-4" />
            Create Account
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DonorActions;
