
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  goal: number;
  className?: string;
}

const ProgressBar = ({ current, goal, className }: ProgressBarProps) => {
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm font-medium mb-1">
        <span>${current.toLocaleString()}</span>
        <span className="text-muted-foreground">${goal.toLocaleString()} Goal</span>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div 
          className="h-full bg-axanar-teal rounded-full animate-pulse-glow"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between text-xs mt-1">
        <span className="font-semibold">{percentage}%</span>
        <span className="text-muted-foreground">
          {percentage >= 100 ? "Fully Funded!" : "In Progress"}
        </span>
      </div>
    </div>
  );
};

export default ProgressBar;
