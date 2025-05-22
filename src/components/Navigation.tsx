
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, Search } from "lucide-react";

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-axanar-dark text-white border-b border-axanar-teal/20">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-display font-bold text-axanar-teal">AXANAR</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm font-medium hover:text-axanar-teal transition-colors">
              Home
            </Link>
            <Link to="/campaigns" className="text-sm font-medium hover:text-axanar-teal transition-colors">
              Campaigns
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-axanar-teal transition-colors">
              About
            </Link>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="icon">
                <Search className="h-5 w-5" />
              </Button>
              <Link to="/login">
                <Button variant="outline" className="border-axanar-teal text-axanar-teal hover:bg-axanar-teal/10">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="bg-axanar-teal text-white hover:bg-axanar-teal/90">
                  Start a Campaign
                </Button>
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pt-4 pb-2 space-y-4 animate-fade-in">
            <Link to="/" className="block py-2 text-sm font-medium hover:text-axanar-teal">
              Home
            </Link>
            <Link to="/campaigns" className="block py-2 text-sm font-medium hover:text-axanar-teal">
              Campaigns
            </Link>
            <Link to="/about" className="block py-2 text-sm font-medium hover:text-axanar-teal">
              About
            </Link>
            <div className="pt-2 flex flex-col space-y-2">
              <Link to="/login">
                <Button variant="outline" className="w-full border-axanar-teal text-axanar-teal">
                  Sign In
                </Button>
              </Link>
              <Link to="/register">
                <Button className="w-full bg-axanar-teal text-white">
                  Start a Campaign
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
