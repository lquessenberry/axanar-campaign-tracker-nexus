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
      <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 text-shadow-lg">
              Welcome Back <span className="text-axanar-teal">Axanar</span> Donors!
            </h2>
          </div>
          
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-axanar-teal/20 shadow-2xl">
            {isAuthenticated ? <div className="text-left space-y-6 text-axanar-silver leading-relaxed">
                <p className="text-lg md:text-xl font-semibold text-axanar-teal">
                  Beloved Axanar Donors,
                </p>
                
                <p className="text-base md:text-lg">
                  I've seen the trials of volunteerism up close—late nights, relentless challenges, and the weight of keeping a dream alive. Legal battles, public doubts, and endless tasks could have dimmed our star, but your love for Axanar has been our guiding light.
                </p>
                
                <p className="text-base md:text-lg">
                  I bow in gratitude to those who came before me, the unsung heroes who fiercely guarded our donor tracking system at axanardonors.com. Their tireless efforts kept every pledge, every piece of your trust, safe and sound. Their work is the bedrock of our revival, a quiet vow to you that we cherish your faith in us.
                </p>
                
                <p className="text-base md:text-lg">
                  Our path hasn't been smooth, yet together, we've defied the odds. I've poured my heart into rebuilding systems, restoring transparency, and reigniting the spark of Axanar. Each step—every hurdle overcome, every connection renewed—is a love letter to you. You inspire us to craft not just a film, but a timeless piece of Trek history that will shine for generations.
                </p>
                
                <p className="text-base md:text-lg">
                  With all I am, I ask you to stay with us, to keep weaving this story. Together, we'll chase the stars, bound by a love that knows no limits.
                </p>
                
                <div className="mt-8 pt-6 border-t border-axanar-teal/30">
                  <p className="text-base md:text-lg font-light italic">
                    Drip Drop,
                  </p>
                  <p className="text-lg md:text-xl font-semibold text-axanar-teal mt-2">
                    Lee Quessenberry
                  </p>
                  <p className="text-sm md:text-base text-axanar-silver/80 mt-1">
                    Associate Producer - DevOps & Digital Marketing Officer
                  </p>
                </div>
              </div> : <div className="text-center space-y-6 text-axanar-silver leading-relaxed">
                <p className="text-lg md:text-xl font-semibold text-axanar-teal">Welcome back Axanar donors,</p>
                
                <p className="text-base md:text-lg">
                  We invite you to become part of something extraordinary—a love story written in starlight and dreams. 
                  Axanar isn't just a film; it's a passionate embrace of everything we cherish about Star Trek, crafted 
                  by fans who understand the sacred bond between story and soul.
                </p>
                
                <p className="text-base md:text-lg">
                  Your support would join a constellation of devoted hearts who believe in our vision. Together, we're 
                  creating more than entertainment—we're weaving a tapestry of hope, adventure, and the infinite 
                  possibilities that await us among the stars.
                </p>
                
                <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
                  <Link to="/auth">
                    <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-12 px-8 shadow-lg text-base">
                      Join Our Journey
                    </Button>
                  </Link>
                </div>
              </div>}
          </div>
        </div>
      </div>
    </div>;
};
export default LoveLetterSection;