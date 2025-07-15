import { Link } from "react-router-dom";

interface CTAButton {
  to: string;
  text: string;
  emoji?: string;
  primary?: boolean;
}

interface AxanarCTAProps {
  badge?: string;
  title: string;
  description: string;
  buttons: CTAButton[];
  subtitle?: string;
}

const AxanarCTA = ({ badge, title, description, buttons, subtitle }: AxanarCTAProps) => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 to-axanar-teal/10 border border-primary/20 rounded-2xl p-8 md:p-12">
      <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)] opacity-20"></div>
      <div className="relative z-10 max-w-2xl mx-auto text-center">
        {badge && (
          <div className="inline-flex items-center gap-2 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-full px-4 py-2 text-sm font-medium text-primary mb-6">
            <span className="w-2 h-2 bg-axanar-teal rounded-full animate-pulse"></span>
            {badge}
          </div>
        )}
        <h3 className="text-2xl md:text-3xl font-bold font-heading mb-4 bg-gradient-to-r from-primary to-axanar-teal bg-clip-text text-transparent">
          {title}
        </h3>
        <p className="text-muted-foreground mb-8 text-lg leading-relaxed">
          {description}
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {buttons.map((button, index) => (
            <Link 
              key={index}
              to={button.to} 
              className={
                button.primary 
                  ? "group relative inline-flex items-center justify-center bg-gradient-to-r from-axanar-teal to-primary hover:from-primary hover:to-axanar-teal text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-axanar-teal/25"
                  : "group inline-flex items-center justify-center border-2 border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-4 px-8 rounded-xl transition-all duration-300 backdrop-blur-sm"
              }
            >
              {button.emoji && <span className="mr-2">{button.emoji}</span>}
              {button.text}
              {button.primary && <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>}
            </Link>
          ))}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground/70 mt-6">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

export default AxanarCTA;