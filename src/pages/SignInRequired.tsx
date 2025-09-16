import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const SignInRequired = () => {
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold mb-3">Authentication Required</h1>
          <p className="text-muted-foreground mb-6">
            Please sign in to continue. After signing in, well bring you right back.
          </p>
          <Link to="/auth" state={{ from }}>
            <Button className="bg-primary hover:bg-primary/90">Sign In</Button>
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default SignInRequired;
