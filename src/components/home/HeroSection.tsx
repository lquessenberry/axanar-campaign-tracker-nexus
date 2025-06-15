
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
    </section>
  );
};

export default HeroSection;
