import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import WarpfieldStars from "@/components/WarpfieldStars";
import { useAuth } from "@/contexts/AuthContext";

const HeroSection = () => {
  const { user } = useAuth();

  if (user) {
    return (
      <section className="relative py-4 md:py-16 px-0 md:px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
        {/* Viewscreen Frame */}
        <div className="container mx-auto relative px-0 md:px-4">
          <div className="relative max-w-6xl mx-auto">
            {/* Outer Frame */}
            <div className="relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 p-2 md:p-6 rounded-none md:rounded-3xl shadow-2xl">
              {/* Inner Frame */}
              <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-2 md:p-4 rounded-none md:rounded-2xl">
                {/* Viewscreen */}
                <div className="relative aspect-video rounded-none md:rounded-xl overflow-hidden border-2 md:border-4 border-gray-600 shadow-inner">
                  {/* Warpfield Background */}
                  <div className="absolute inset-0 bg-black">
                    <WarpfieldStars />
                  </div>
                  
                  {/* Viewscreen Grid Overlay */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="grid grid-cols-20 grid-rows-12 h-full w-full">
                      {Array.from({ length: 240 }).map((_, i) => (
                        <div key={i} className="border border-blue-400/20"></div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Content Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                    <div className="text-center max-w-4xl px-4 md:px-8">
                      <h1 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold mb-4 text-shadow-lg">
                        Welcome back to <span className="text-axanar-teal">Axanar</span>
                      </h1>
                      <p className="text-base md:text-lg lg:text-xl text-axanar-silver max-w-2xl mx-auto mb-6 md:mb-8 text-shadow">
                        Access your donor portal to manage your account, view your contribution history, and stay connected with the Axanar Universe.
                      </p>
                      <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                        <Link to="/dashboard">
                          <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-10 md:h-12 px-6 md:px-8 shadow-lg text-sm md:text-base">
                            View Dashboard
                          </Button>
                        </Link>
                        <Link to="/profile">
                          <Button variant="outline" className="border-axanar-silver/50 bg-gray-800/80 hover:bg-gray-700/80 h-10 md:h-12 px-6 md:px-8 text-axanar-silver shadow-lg backdrop-blur-sm text-sm md:text-base">
                            Manage Account
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                  
                  {/* Corner Status Lights */}
                  <div className="absolute top-1 md:top-2 left-1 md:left-2 w-2 md:w-3 h-2 md:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <div className="absolute top-1 md:top-2 right-1 md:right-2 w-2 md:w-3 h-2 md:h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                  <div className="absolute bottom-1 md:bottom-2 left-1 md:left-2 w-2 md:w-3 h-2 md:h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                  <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 w-2 md:w-3 h-2 md:h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
                </div>
                
                {/* Frame Details */}
                <div className="flex justify-between items-center mt-2 md:mt-4 px-2 md:px-4">
                  <div className="flex space-x-1 md:space-x-2">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                  </div>
                  <div className="text-xs text-gray-400 font-mono">VIEWSCREEN ACTIVE</div>
                  <div className="flex space-x-1 md:space-x-2">
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                    <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Love Letter Section */}
        <div className="relative mt-8 md:mt-16 overflow-hidden">
          {/* Warp Field Background Image */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url('/lovable-uploads/5e041d9c-79a3-418c-8bb0-3d84978f452a.png')`
            }}
          />
          
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-axanar-blue/75 to-black/90"></div>
          
          {/* Content */}
          <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 text-shadow-lg">
                  A Love Letter to Our <span className="text-axanar-teal">Axanar</span> Family
                </h2>
              </div>
              
              <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-axanar-teal/20 shadow-2xl">
                <div className="text-left space-y-6 text-axanar-silver leading-relaxed">
                  <p className="text-lg md:text-xl font-semibold text-axanar-teal">
                    Beloved Axanar Donors,
                  </p>
                  
                  <p className="text-base md:text-lg">
                    I've witnessed the sacred trials of our journey together—countless sleepless nights, mountains of challenges, 
                    and the beautiful burden of nurturing a dream that burns bright in our hearts. Legal storms, whispered doubts, 
                    and endless labors of love could have extinguished our flame, but your unwavering devotion to Axanar has been 
                    our North Star, our beacon of hope in the darkness.
                  </p>
                  
                  <p className="text-base md:text-lg">
                    With humble reverence, I honor those guardian angels who came before me—the devoted souls who protected our 
                    sacred bond at axanardonors.com with fierce tenderness. Their sleepless vigil over every pledge, every precious 
                    token of your faith, kept your trust safe in loving hands. Their legacy is the foundation upon which we rebuild, 
                    a silent promise whispered to you: we treasure your belief in us like the rarest jewel.
                  </p>
                  
                  <p className="text-base md:text-lg">
                    Our journey hasn't been painted in gentle strokes, my dear friends, yet together we've danced with destiny and 
                    emerged victorious. I've woven my very soul into rebuilding our home, restoring the transparency you deserve, 
                    and rekindling the passion that is Axanar. Each victory—every barrier conquered, every heart reconnected—is a 
                    love song composed just for you. You inspire us to create not merely a film, but an eternal love letter to 
                    Trek itself, a masterpiece that will touch souls for generations yet unborn.
                  </p>
                  
                  <p className="text-base md:text-lg">
                    With every fiber of my being, with all the love I carry, I reach out to you: stay with us, keep weaving this 
                    beautiful tapestry of dreams. Together, we'll chase stars across the cosmos, united by a love that transcends 
                    time, space, and every boundary the universe dares place before us.
                  </p>
                  
                  <div className="mt-8 pt-6 border-t border-axanar-teal/30">
                    <p className="text-base md:text-lg font-light italic">
                      With infinite love and stardust in my heart,
                    </p>
                    <p className="text-lg md:text-xl font-semibold text-axanar-teal mt-2">
                      Lee Quessenberry
                    </p>
                    <p className="text-sm md:text-base text-axanar-silver/80 mt-1">
                      Associate Producer - DevOps & Digital Marketing Officer
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-4 md:py-16 px-0 md:px-4 bg-gradient-to-b from-gray-900 via-gray-800 to-black overflow-hidden">
      {/* Viewscreen Frame */}
      <div className="container mx-auto relative px-0 md:px-4">
        <div className="relative max-w-6xl mx-auto">
          {/* Outer Frame */}
          <div className="relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 p-2 md:p-6 rounded-none md:rounded-3xl shadow-2xl">
            {/* Inner Frame */}
            <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-2 md:p-4 rounded-none md:rounded-2xl">
              {/* Viewscreen */}
              <div className="relative aspect-video rounded-none md:rounded-xl overflow-hidden border-2 md:border-4 border-gray-600 shadow-inner">
                {/* Warpfield Background */}
                <div className="absolute inset-0 bg-black">
                  <WarpfieldStars />
                </div>
                
                {/* Viewscreen Grid Overlay */}
                <div className="absolute inset-0 opacity-10">
                  <div className="grid grid-cols-20 grid-rows-12 h-full w-full">
                    {Array.from({ length: 240 }).map((_, i) => (
                      <div key={i} className="border border-blue-400/20"></div>
                    ))}
                  </div>
                </div>
                
                {/* Content Overlay */}
                <div className="absolute inset-0 flex items-center justify-center text-white z-10">
                  <div className="text-center max-w-4xl px-4 md:px-8">
                    <h1 className="text-2xl md:text-3xl lg:text-5xl font-display font-bold mb-4 text-shadow-lg">
                      <span className="text-axanar-teal">Axanar</span> Donor Portal
                    </h1>
                    <p className="text-base md:text-lg lg:text-xl text-axanar-silver max-w-2xl mx-auto mb-6 md:mb-8 text-shadow">
                      Your exclusive gateway to manage your Axanar contributions, update your information, and access your donor benefits.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4">
                      <Link to="/auth">
                        <Button className="bg-axanar-teal hover:bg-axanar-teal/90 h-10 md:h-12 px-6 md:px-8 shadow-lg text-sm md:text-base">
                          Access Portal
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
                
                {/* Corner Status Lights */}
                <div className="absolute top-1 md:top-2 left-1 md:left-2 w-2 md:w-3 h-2 md:h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                <div className="absolute top-1 md:top-2 right-1 md:right-2 w-2 md:w-3 h-2 md:h-3 bg-blue-400 rounded-full animate-pulse shadow-lg shadow-blue-400/50"></div>
                <div className="absolute bottom-1 md:bottom-2 left-1 md:left-2 w-2 md:w-3 h-2 md:h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
                <div className="absolute bottom-1 md:bottom-2 right-1 md:right-2 w-2 md:w-3 h-2 md:h-3 bg-red-400 rounded-full animate-pulse shadow-lg shadow-red-400/50"></div>
              </div>
              
              {/* Frame Details */}
              <div className="flex justify-between items-center mt-2 md:mt-4 px-2 md:px-4">
                <div className="flex space-x-1 md:space-x-2">
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-green-400 rounded-full animate-pulse delay-200"></div>
                </div>
                <div className="text-xs text-gray-400 font-mono">VIEWSCREEN ACTIVE</div>
                <div className="flex space-x-1 md:space-x-2">
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-blue-400 rounded-full animate-pulse delay-100"></div>
                  <div className="w-1.5 md:w-2 h-1.5 md:h-2 bg-blue-400 rounded-full animate-pulse delay-200"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Love Letter Section for Non-Authenticated Users */}
      <div className="relative mt-8 md:mt-16 overflow-hidden">
        {/* Warp Field Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/lovable-uploads/5e041d9c-79a3-418c-8bb0-3d84978f452a.png')`
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-axanar-blue/75 to-black/90"></div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 py-12 md:py-20">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-4xl lg:text-5xl font-display font-bold text-white mb-4 text-shadow-lg">
                Join Our <span className="text-axanar-teal">Axanar</span> Family
              </h2>
            </div>
            
            <div className="bg-black/30 backdrop-blur-sm rounded-lg p-6 md:p-8 border border-axanar-teal/20 shadow-2xl">
              <div className="text-center space-y-6 text-axanar-silver leading-relaxed">
                <p className="text-lg md:text-xl font-semibold text-axanar-teal">
                  Future Axanar Family Member,
                </p>
                
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
