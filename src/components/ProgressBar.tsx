
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  current: number;
  goal: number;
  className?: string;
}

const ProgressBar = ({ current, goal, className }: ProgressBarProps) => {
  const percentage = Math.round((current / goal) * 100);
  const displayPercentage = Math.min(percentage, 100);
  const isOverfunded = percentage > 100;
  const overfundedAmount = isOverfunded ? current - goal : 0;
  
  console.log('📊 ProgressBar:', { current, goal, percentage, isOverfunded });
  
  return (
    <div className={cn("w-full", className)}>
      <div className="flex justify-between text-sm font-medium mb-1">
        <span>${current.toLocaleString()}</span>
        <span className="text-muted-foreground">${goal.toLocaleString()} Goal</span>
      </div>
      
      <div className="h-3 w-full bg-muted rounded-full overflow-hidden relative">
        <div 
          className={cn(
            "h-full rounded-full transition-all duration-500",
            isOverfunded 
              ? "bg-gradient-to-r from-axanar-teal to-green-500 animate-pulse-glow" 
              : "bg-axanar-teal animate-pulse-glow"
          )}
          style={{ width: `${displayPercentage}%` }}
        />
        {isOverfunded && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
        )}
      </div>
      
      <div className="flex justify-between text-xs mt-2">
        <div className="flex flex-col">
          <span className={cn(
            "font-semibold text-lg",
            isOverfunded ? "text-green-600" : "text-foreground"
          )}>
            {percentage}%
          </span>
          {isOverfunded && (
            <span className="text-green-600 font-medium">
              +${overfundedAmount.toLocaleString()} over goal
            </span>
          )}
        </div>
        <div className="text-right">
          <span className={cn(
            "font-medium",
            isOverfunded ? "text-green-600" : "text-muted-foreground"
          )}>
            {isOverfunded ? "Goal Exceeded!" : percentage >= 100 ? "Fully Funded!" : "In Progress"}
          </span>
          {isOverfunded && (
            <div className="text-xs text-muted-foreground">
              {((percentage - 100)).toFixed(0)}% over target
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProgressBar;
