import { Button } from "@/components/ui/button";

interface TimedPromptProps {
  isVisible: boolean;
  message: string;
  onDismiss: () => void;
}

const TimedPrompt = ({ isVisible, message, onDismiss }: TimedPromptProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-red-900/95 backdrop-blur-sm flex items-center justify-center overflow-hidden">
      {/* Animated gradient ripple effect */}
      <div className="absolute inset-0 animate-[siren-ripple_2s_ease-in-out_infinite]">
        <div className="absolute inset-0 bg-gradient-radial from-red-400/30 via-red-600/20 to-transparent animate-pulse"></div>
      </div>
      <div className="absolute inset-0 animate-[siren-ripple_2s_ease-in-out_infinite_0.5s]">
        <div className="absolute inset-0 bg-gradient-radial from-red-500/20 via-red-700/15 to-transparent animate-pulse"></div>
      </div>
      
      <div className="relative text-center space-y-8 px-4 z-10">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-mono text-red-100 animate-pulse">
          RED ALERT
        </h1>
        <div className="space-y-4">
          <p className="text-xl md:text-2xl lg:text-3xl text-red-200 font-mono animate-pulse leading-relaxed">
            {message}
          </p>
          <Button 
            onClick={onDismiss}
            className="bg-red-600 hover:bg-red-700 text-white border-red-500 text-lg px-8 py-3 animate-pulse"
          >
            ACKNOWLEDGED
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimedPrompt;