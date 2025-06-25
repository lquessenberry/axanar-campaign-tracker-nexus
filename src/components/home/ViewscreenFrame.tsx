
import { ReactNode } from "react";
import WarpfieldStars from "@/components/WarpfieldStars";

interface ViewscreenFrameProps {
  children: ReactNode;
}

const ViewscreenFrame = ({ children }: ViewscreenFrameProps) => {
  return (
    <div className="container mx-auto relative px-0 md:px-4">
      <div className="relative max-w-6xl mx-auto">
        {/* Outer Frame */}
        <div className="relative bg-gradient-to-br from-gray-700 via-gray-600 to-gray-800 p-2 md:p-6 rounded-none md:rounded-3xl shadow-2xl">
          {/* Inner Frame */}
          <div className="relative bg-gradient-to-br from-gray-800 via-gray-700 to-gray-900 p-2 md:p-4 rounded-none md:rounded-2xl">
            {/* Viewscreen */}
            <div className="relative h-[85vh] md:h-[60vh] lg:h-[70vh] xl:h-[75vh] rounded-none md:rounded-xl overflow-hidden border-2 md:border-4 border-gray-600 shadow-inner">
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
              <div className="absolute inset-0 flex items-center justify-center text-white z-10 p-4 md:p-6 lg:p-8">
                <div className="w-full max-w-xs sm:max-w-sm md:max-w-2xl lg:max-w-3xl xl:max-w-4xl mx-auto overflow-hidden">
                  {children}
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
  );
};

export default ViewscreenFrame;
