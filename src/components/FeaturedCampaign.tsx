
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProgressBar from "./ProgressBar";

interface FeaturedCampaignProps {
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

const FeaturedCampaign = ({
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
}: FeaturedCampaignProps) => {
  return (
    <div className="relative overflow-hidden rounded-lg bg-axanar-dark text-white">
      <div className="absolute inset-0 z-0">
        <img 
          src={image} 
          alt={title} 
          className="w-full h-full object-cover opacity-40" 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-axanar-dark to-transparent"></div>
      </div>
      
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-6 p-6 md:p-10">
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <span className="badge-primary bg-axanar-teal hover:bg-axanar-teal/80">{category}</span>
            <h1 className="text-3xl md:text-4xl font-bold mt-3">{title}</h1>
            <p className="text-sm text-axanar-silver/80 mt-2">By {creator}</p>
          </div>
          
          <p className="text-axanar-silver leading-relaxed">{description}</p>
          
          <div className="pt-2">
            <ProgressBar current={current} goal={goal} />
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-2xl font-bold">{backers}</p>
                <p className="text-sm text-axanar-silver/80">Backers</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{daysLeft}</p>
                <p className="text-sm text-axanar-silver/80">{daysLeft === 1 ? "Day Left" : "Days Left"}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Link to={`/campaign/${id}`}>
              <Button className="bg-axanar-teal hover:bg-axanar-teal/90 w-full sm:w-auto">
                Back this Project
              </Button>
            </Link>
            <Button variant="outline" className="border-white/30 hover:bg-white/10 w-full sm:w-auto">
              Learn More
            </Button>
          </div>
        </div>
        
        <div className="hidden md:flex items-center justify-center">
          <div className="rounded-lg overflow-hidden shadow-lg border border-white/10">
            <img 
              src={image} 
              alt={title} 
              className="w-full h-full object-cover aspect-video" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedCampaign;
