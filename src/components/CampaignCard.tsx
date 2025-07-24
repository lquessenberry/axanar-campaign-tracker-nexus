
import { Link } from "react-router-dom";
import { 
  EnhancedCard, 
  EnhancedCardContent, 
  EnhancedCardFooter,
  EnhancedProgress
} from "@/components/ui/enhanced-card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users } from "lucide-react";

interface CampaignCardProps {
  id: string;
  title: string;
  description: string;
  image: string;
  creator: string;
  category: string;
  current: number;
  goal: number;
  backers: number;
  daysLeft: number;
}

const CampaignCard = ({
  id,
  title,
  description,
  image,
  creator,
  category,
  current,
  goal,
  backers,
  daysLeft
}: CampaignCardProps) => {
  const percentage = Math.round((current / goal) * 100);
  
  return (
    <Link to={`/campaign/${id}`} className="block">
      <EnhancedCard 
        variant="primary" 
        className="overflow-hidden h-full flex flex-col group cursor-pointer min-h-[24rem]"
      >
        {/* Header with image and category */}
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-4 left-4">
            <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
              {category}
            </Badge>
          </div>
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm rounded-full px-2 py-1">
              <Calendar className="h-3 w-3" />
              <span className="text-xs font-medium">
                {daysLeft > 0 ? `${daysLeft}d left` : "Ended"}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content */}
        <EnhancedCardContent className="flex-grow">
          <h3 className="text-lg font-bold line-clamp-2 mb-2">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{description}</p>
          <p className="text-xs text-muted-foreground mb-4">By {creator}</p>
          
          <EnhancedProgress 
            value={current} 
            max={goal} 
            label="Progress"
            variant="primary"
            showPercentage={true}
          />
          
          <div className="mt-3 flex justify-between items-center text-sm">
            <span className="font-semibold">${current.toLocaleString()}</span>
            <span className="text-muted-foreground">of ${goal.toLocaleString()}</span>
          </div>
        </EnhancedCardContent>
        
        {/* Footer */}
        <EnhancedCardFooter className="text-xs">
          <div className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            <span>{backers} Backers</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-muted-foreground">
              {percentage}% funded
            </span>
          </div>
        </EnhancedCardFooter>
      </EnhancedCard>
    </Link>
  );
};

export default CampaignCard;
