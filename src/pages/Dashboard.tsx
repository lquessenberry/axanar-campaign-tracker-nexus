
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";

/**
 * Legacy Dashboard page - redirects to unified Profile page
 * The donor dashboard is now integrated into the profile page
 */
const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to Profile page which now contains dashboard functionality
    navigate('/profile', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Redirecting to your profile...</p>
      </div>
    </div>
  );
};

export default Dashboard;
