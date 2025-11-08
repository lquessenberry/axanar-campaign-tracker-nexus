import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Legacy Messages page - redirects to unified DirectMessages with support filter
 * This maintains backward compatibility for old links
 */
const Messages = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to DirectMessages with support tab active
    navigate('/direct-messages?tab=support', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to messages...</p>
      </div>
    </div>
  );
};

export default Messages;
