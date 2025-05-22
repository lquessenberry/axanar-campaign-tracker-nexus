
import { Link } from "react-router-dom";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import ProgressBar from "./ProgressBar";

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
  return (
    <Link to={`/campaign/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full flex flex-col">
        <div className="relative h-48 overflow-hidden">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-2 left-2">
            <span className="badge-primary">{category}</span>
          </div>
        </div>
        
        <CardContent className="pt-4 flex-grow">
          <h3 className="text-lg font-bold line-clamp-1">{title}</h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-3">{description}</p>
          <p className="text-xs text-muted-foreground mb-4">By {creator}</p>
          
          <ProgressBar current={current} goal={goal} />
        </CardContent>
        
        <CardFooter className="border-t pt-3 flex justify-between text-xs text-muted-foreground">
          <span>{backers} Backers</span>
          <span>{daysLeft > 0 ? `${daysLeft} days left` : "Campaign ended"}</span>
        </CardFooter>
      </Card>
    </Link>
  );
};

export default CampaignCard;
