
import { Button } from "@/components/ui/button";
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardFooter,
  EnhancedProgress
} from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Package, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PerkCardProps {
  title: string;
  price: number;
  description: string;
  features: string[];
  claimed: number;
  limit?: number;
  estimatedDelivery: string;
  isPopular?: boolean;
}

const PerkCard = ({
  title,
  price,
  description,
  features,
  claimed,
  limit,
  estimatedDelivery,
  isPopular = false
}: PerkCardProps) => {
  const isSoldOut = limit ? claimed >= limit : false;
  const availableCount = limit ? limit - claimed : null;
  const claimedPercentage = limit ? (claimed / limit) * 100 : 0;
  
  return (
    <EnhancedCard 
      variant={isPopular ? "accent" : "primary"}
      className={cn(
        "flex flex-col h-full relative min-h-[28rem]",
        isSoldOut && "opacity-70 grayscale"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
          <Badge className="bg-accent text-accent-foreground px-3 py-1 flex items-center gap-1">
            <Star className="h-3 w-3" />
            Most Popular
          </Badge>
        </div>
      )}
      
      {/* Header */}
      <div className="p-6 pb-2">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-bold">{title}</h3>
          {limit && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Package className="h-3 w-3" />
              <span>Limited</span>
            </div>
          )}
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">${price}</span>
          <span className="text-muted-foreground text-sm">USD</span>
        </div>
      </div>
      
      {/* Content */}
      <EnhancedCardContent className="flex-grow">
        <p className="text-sm text-muted-foreground mb-6">{description}</p>
        
        <div className="space-y-3 mb-6">
          <h4 className="text-sm font-semibold text-foreground">Includes:</h4>
          {features.map((feature, index) => (
            <div key={index} className="flex items-start gap-2">
              <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        {/* Availability Progress */}
        {limit && (
          <div className="mb-4">
            <EnhancedProgress 
              value={claimed} 
              max={limit}
              label="Claimed"
              variant={claimedPercentage > 80 ? "warning" : "success"}
              showPercentage={false}
            />
            <div className="flex justify-between items-center mt-1 text-xs text-muted-foreground">
              <span>{claimed} claimed</span>
              <span>{availableCount} remaining</span>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Est. delivery: {estimatedDelivery}</span>
        </div>
      </EnhancedCardContent>
      
      {/* Footer */}
      <EnhancedCardFooter>
        <Button 
          className={cn(
            "w-full transition-all duration-200",
            isPopular 
              ? "bg-accent hover:bg-accent/90 text-accent-foreground" 
              : "bg-primary hover:bg-primary/90",
            isSoldOut && "cursor-not-allowed opacity-50"
          )}
          disabled={isSoldOut}
        >
          {isSoldOut ? "Sold Out" : `Back this Perk • $${price}`}
        </Button>
      </EnhancedCardFooter>
    </EnhancedCard>
  );
};

export default PerkCard;
