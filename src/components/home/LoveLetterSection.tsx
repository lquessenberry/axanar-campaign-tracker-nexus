import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
interface LoveLetterSectionProps {
  isAuthenticated: boolean;
}
const LoveLetterSection = ({
  isAuthenticated
}: LoveLetterSectionProps) => {
  return <div className="relative mt-8 md:mt-16 overflow-hidden">
      {/* Warp Field Background Image */}
      <div className="absolute inset-0 bg-cover bg-center bg-no-repeat" style={{
      backgroundImage: `url('/lovable-uploads/5e041d9c-79a3-418c-8bb0-3d84978f452a.png')`
    }} />
      
      {/* Gradient Overlay */}
      
      
      {/* Content */}
      
    </div>;
};
export default LoveLetterSection;