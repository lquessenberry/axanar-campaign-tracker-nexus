
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

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

interface DonorTableProps {
  donors: Donor[];
}

const DonorTable = ({ donors }: DonorTableProps) => {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="border-border">
            <TableHead className="text-muted-foreground">Name</TableHead>
            <TableHead className="text-muted-foreground">Email</TableHead>
            <TableHead className="text-muted-foreground">Pledges</TableHead>
            <TableHead className="text-muted-foreground">Total Donated</TableHead>
            <TableHead className="text-muted-foreground">Status</TableHead>
            <TableHead className="text-muted-foreground">Joined</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {donors?.map((donor) => (
            <TableRow key={donor.id} className="border-border">
              <TableCell className="text-card-foreground">
                {donor.first_name && donor.last_name 
                  ? `${donor.first_name} ${donor.last_name}`
                  : donor.full_name || donor.donor_name || 'Unknown'
                }
              </TableCell>
              <TableCell className="text-card-foreground">{donor.email}</TableCell>
              <TableCell className="text-card-foreground">{donor.pledgeCount}</TableCell>
              <TableCell className="text-card-foreground">
                ${donor.totalPledges.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
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
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DonorTable;
