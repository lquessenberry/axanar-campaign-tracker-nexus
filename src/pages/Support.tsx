import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

/**
 * Legacy Support page - redirects to unified DirectMessages with support conversation
 * This maintains backward compatibility for old links
 */
const Support = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to DirectMessages with support tab and new conversation prompt
    navigate('/direct-messages?tab=support&new=true', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to support...</p>
      </div>
    </div>
  );
};

export default Support;
