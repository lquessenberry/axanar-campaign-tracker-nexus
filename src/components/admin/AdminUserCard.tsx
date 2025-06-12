
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Shield, ShieldCheck, Edit } from "lucide-react";
import { AdminUser } from "@/types/admin";

interface AdminUserCardProps {
  admin: AdminUser;
  currentUserId: string | undefined;
  onRemove: (userId: string, email: string) => void;
  onEdit: (admin: AdminUser) => void;
}

const AdminUserCard = ({ admin, currentUserId, onRemove, onEdit }: AdminUserCardProps) => {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-4">
        <div>
          <div className="font-medium">{admin.email || 'Email not available'}</div>
          <div className="text-sm text-muted-foreground">
            Added {new Date(admin.created_at).toLocaleDateString()}
          </div>
        </div>
        <div className="flex gap-2">
          {admin.is_super_admin && (
            <Badge variant="default" className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3" />
              Super Admin
            </Badge>
          )}
          {admin.is_content_manager && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Content Manager
            </Badge>
          )}
          {!admin.is_super_admin && !admin.is_content_manager && (
            <Badge variant="outline">Admin</Badge>
          )}
        </div>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(admin)}
        >
          <Edit className="h-4 w-4" />
        </Button>
        <Button
          variant="destructive"
          size="sm"
          onClick={() => onRemove(admin.user_id, admin.email)}
          disabled={admin.user_id === currentUserId}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default AdminUserCard;
