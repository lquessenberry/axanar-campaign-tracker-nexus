
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Check } from "lucide-react";

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
  
  return (
    <Card className={cn(
      "flex flex-col h-full", 
      isPopular && "border-axanar-accent shadow-md relative",
      isSoldOut && "opacity-70"
    )}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="badge-primary bg-axanar-accent px-3 py-1">Most Popular</span>
        </div>
      )}
      
      <CardContent className="pt-6 flex-grow">
        <h3 className="text-xl font-bold">{title}</h3>
        <div className="my-3">
          <span className="text-2xl font-bold">${price}</span>
          <span className="text-muted-foreground text-sm ml-1">USD</span>
        </div>
        
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        <div className="space-y-2 mb-4">
          {features.map((feature, index) => (
            <div key={index} className="flex items-start">
              <Check className="h-4 w-4 text-axanar-teal mr-2 mt-1 flex-shrink-0" />
              <span className="text-sm">{feature}</span>
            </div>
          ))}
        </div>
        
        <div className="text-sm space-y-1 mt-4">
          <p className="text-muted-foreground">
            {limit ? (
              <span>
                {claimed} of {limit} claimed {availableCount && `(${availableCount} left)`}
              </span>
            ) : (
              <span>{claimed} claimed</span>
            )}
          </p>
          <p className="text-muted-foreground">Est. delivery: {estimatedDelivery}</p>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2">
        <Button 
          className="w-full bg-axanar-teal hover:bg-axanar-teal/90" 
          disabled={isSoldOut}
        >
          {isSoldOut ? "Sold Out" : "Back this Perk"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PerkCard;
