
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DonorStatsCardsProps {
  totalCount: number;
  activeDonorsCount: number;
  totalRaised: number;
}

const DonorStatsCards = ({ totalCount, activeDonorsCount, totalRaised }: DonorStatsCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Total Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">{totalCount?.toLocaleString() || 0}</div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Active Donors</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-green-400">
            {activeDonorsCount?.toLocaleString() || 0}
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Total Raised</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-primary">
            ${totalRaised?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DonorStatsCards;
