
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, ReferenceLine } from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface CampaignChartProps {
  campaigns: Array<{
    id: string;
    title: string;
    current_amount: number;
    goal_amount: number;
    category: string;
  }>;
}

const CampaignChart = ({ campaigns }: CampaignChartProps) => {
  const chartData = campaigns.map(campaign => {
    const percentage = (campaign.current_amount / campaign.goal_amount) * 100;
    const isOverfunded = percentage > 100;
    
    return {
      name: campaign.title.length > 20 ? campaign.title.substring(0, 20) + '...' : campaign.title,
      fullName: campaign.title,
      current: campaign.current_amount,
      goal: campaign.goal_amount,
      percentage: Math.round(percentage),
      overfunded: isOverfunded ? percentage - 100 : 0,
      category: campaign.category,
      fill: isOverfunded ? "#10b981" : "#1dd3b0"
    };
  });

  const chartConfig = {
    current: {
      label: "Amount Raised",
    },
    goal: {
      label: "Goal Amount",
    },
    percentage: {
      label: "Funding %",
    },
  };

  return (
    <ChartContainer config={chartConfig} className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
          <XAxis 
            dataKey="name" 
            angle={-45}
            textAnchor="end"
            height={80}
            interval={0}
            fontSize={12}
          />
          <YAxis 
            tickFormatter={(value) => `${value}%`}
            domain={[0, Math.max(150, Math.max(...chartData.map(d => d.percentage)))]}
          />
          <Tooltip 
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg p-3 shadow-lg">
                    <p className="font-semibold mb-2">{data.fullName}</p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Raised:</span> ${data.current.toLocaleString()}
                    </p>
                    <p className="text-sm">
                      <span className="text-muted-foreground">Goal:</span> ${data.goal.toLocaleString()}
                    </p>
                    <p className={`text-sm font-medium ${data.percentage > 100 ? 'text-green-600' : 'text-foreground'}`}>
                      {data.percentage}% {data.percentage > 100 ? '(Goal Exceeded!)' : 'of goal'}
                    </p>
                    {data.overfunded > 0 && (
                      <p className="text-sm text-green-600">
                        +{data.overfunded.toFixed(0)}% over target
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">{data.category}</p>
                  </div>
                );
              }
              return null;
            }}
          />
          <ReferenceLine y={100} stroke="#ef4444" strokeDasharray="5 5" opacity={0.7} />
          <Bar 
            dataKey="percentage" 
            fill="#1dd3b0"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default CampaignChart;
