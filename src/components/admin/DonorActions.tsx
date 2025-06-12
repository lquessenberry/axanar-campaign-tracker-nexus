
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Mail, Ban, UserCheck } from "lucide-react";

interface Donor {
  id: string;
  first_name?: string;
  last_name?: string;
  full_name?: string;
  donor_name?: string;
  email: string;
  auth_user_id?: string;
  created_at?: string;
  totalPledges: number;
  pledgeCount: number;
}

interface DonorActionsProps {
  donor: Donor;
  onEdit: (donor: Donor) => void;
  onSendEmail: (donor: Donor) => void;
  onBan: (donor: Donor) => void;
  onActivate: (donor: Donor) => void;
}

const DonorActions = ({ donor, onEdit, onSendEmail, onBan, onActivate }: DonorActionsProps) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onEdit(donor)}>
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
