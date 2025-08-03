import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface TimedPromptProps {
  isVisible: boolean;
  message: string;
  onDismiss: () => void;
}

const TimedPrompt = ({ isVisible, message, onDismiss }: TimedPromptProps) => {
  return (
    <Dialog open={isVisible} onOpenChange={onDismiss}>
      <DialogContent className="sm:max-w-md bg-red-900/90 border-red-500 text-red-100">
        <DialogHeader>
          <DialogTitle className="text-red-100 text-center font-mono">
            ⚠️ SECURITY ALERT ⚠️
          </DialogTitle>
        </DialogHeader>
        <div className="text-center space-y-4">
          <p className="text-red-200 font-mono text-lg animate-pulse">
            {message}
          </p>
          <Button 
            onClick={onDismiss}
            className="bg-red-600 hover:bg-red-700 text-white border-red-500"
          >
            ACKNOWLEDGED
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimedPrompt;