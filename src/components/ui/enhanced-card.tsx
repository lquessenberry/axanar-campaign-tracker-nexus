import * as React from "react";
import { cn } from "@/lib/utils";

const enhancedCardVariants = {
  default: "bg-gradient-to-br from-background via-background to-muted",
  primary: `
    bg-gradient-to-br from-primary/20 via-background to-background
    before:bg-gradient-to-r before:from-background before:via-background before:to-primary
  `,
  accent: `
    bg-gradient-to-br from-accent/20 via-background to-background
    before:bg-gradient-to-r before:from-background before:via-background before:to-accent
  `,
  success: `
    bg-gradient-to-br from-green-500/20 via-background to-background
    before:bg-gradient-to-r before:from-background before:via-background before:to-green-500
  `,
  warning: `
    bg-gradient-to-br from-orange-500/20 via-background to-background
    before:bg-gradient-to-r before:from-background before:via-background before:to-orange-500
  `,
  destructive: `
    bg-gradient-to-br from-destructive/20 via-background to-background
    before:bg-gradient-to-r before:from-background before:via-background before:to-destructive
  `
};

interface EnhancedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: keyof typeof enhancedCardVariants;
  glassmorphism?: boolean;
}

const EnhancedCard = React.forwardRef<HTMLDivElement, EnhancedCardProps>(
  ({ className, variant = "default", glassmorphism = false, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        // Base styles
        "relative rounded-[2.25rem] border shadow-lg transition-all duration-300",
        "hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1",
        
        // Gradient border effect
        "before:absolute before:inset-0 before:rounded-[2.25rem] before:p-[2px]",
        "before:bg-gradient-to-r before:from-transparent before:via-border before:to-transparent",
        "before:mask-radial before:mask-size-[100%_100%] before:mask-position-[center]",
        "before:-z-10",
        
        // Glass morphism effect
        glassmorphism && "backdrop-blur-sm bg-background/80",
        
        // Variant backgrounds
        enhancedCardVariants[variant],
        
        className
      )}
      {...props}
    />
  )
);
EnhancedCard.displayName = "EnhancedCard";

const EnhancedCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-6 pb-2",
      className
    )}
    {...props}
  />
));
EnhancedCardHeader.displayName = "EnhancedCardHeader";

const EnhancedCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, children, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  >
    {children}
  </h3>
));
EnhancedCardTitle.displayName = "EnhancedCardTitle";

const EnhancedCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
EnhancedCardDescription.displayName = "EnhancedCardDescription";

const EnhancedCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div 
    ref={ref} 
    className={cn("p-6 pt-2", className)} 
    {...props} 
  />
));
EnhancedCardContent.displayName = "EnhancedCardContent";

const EnhancedCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between p-6 pt-2",
      "border-t border-border/50 bg-muted/20 rounded-b-[2.25rem]",
      className
    )}
    {...props}
  />
));
EnhancedCardFooter.displayName = "EnhancedCardFooter";

// Progress bar component for enhanced cards
interface EnhancedProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
  max: number;
  label?: string;
  variant?: "primary" | "accent" | "success" | "warning" | "destructive";
  showPercentage?: boolean;
}

const EnhancedProgress = React.forwardRef<HTMLDivElement, EnhancedProgressProps>(
  ({ value, max, label, variant = "primary", showPercentage = true, className, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);
    
    const variantColors = {
      primary: "bg-primary",
      accent: "bg-accent",
      success: "bg-green-500",
      warning: "bg-orange-500",
      destructive: "bg-destructive"
    };

    return (
      <div ref={ref} className={cn("space-y-2", className)} {...props}>
        {label && (
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-foreground">{label}</span>
            {showPercentage && (
              <span className="text-sm text-muted-foreground">{Math.round(percentage)}%</span>
            )}
          </div>
        )}
        <div className="w-full bg-muted rounded-full h-2">
          <div
            className={cn("h-2 rounded-full transition-all duration-500", variantColors[variant])}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  }
);
EnhancedProgress.displayName = "EnhancedProgress";

export {
  EnhancedCard,
  EnhancedCardHeader,
  EnhancedCardFooter,
  EnhancedCardTitle,
  EnhancedCardDescription,
  EnhancedCardContent,
  EnhancedProgress
};