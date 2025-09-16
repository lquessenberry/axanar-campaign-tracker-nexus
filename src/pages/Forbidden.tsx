import { Link, useLocation } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const Forbidden = () => {
  const location = useLocation();
  const from = (location.state as any)?.from || "/";
  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-md px-6">
          <h1 className="text-3xl font-bold mb-3">Access Denied</h1>
          <p className="text-muted-foreground mb-6">
            You don’t have permission to view this page.
          </p>
          <div className="flex gap-3 justify-center">
            <Link to="/">
              <Button variant="outline">Home</Button>
            </Link>
            <Link to="/dashboard" state={{ from }}>
              <Button>Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Forbidden;
