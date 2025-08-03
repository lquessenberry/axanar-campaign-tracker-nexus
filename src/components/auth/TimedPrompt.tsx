import { Button } from "@/components/ui/button";

interface TimedPromptProps {
  isVisible: boolean;
  message: string;
  onDismiss: () => void;
}

const TimedPrompt = ({ isVisible, message, onDismiss }: TimedPromptProps) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 bg-red-900/95 backdrop-blur-sm flex items-center justify-center">
      <div className="text-center space-y-8 px-4">
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold font-mono text-red-100 animate-pulse">
          RED ALERT
        </h1>
        <div className="space-y-4">
          <p className="text-xl md:text-2xl lg:text-3xl text-red-200 font-mono animate-pulse">
            {message}
          </p>
          <Button 
            onClick={onDismiss}
            className="bg-red-600 hover:bg-red-700 text-white border-red-500 text-lg px-8 py-3"
          >
            ACKNOWLEDGED
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimedPrompt;