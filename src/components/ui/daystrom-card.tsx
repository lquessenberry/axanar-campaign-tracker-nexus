import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Daystrom Glass Card - Glassmorphism 2.0 (Proponent #4)
 * Micro-Beveled Edges (Proponent #9)
 */

export interface DaystromCardProps extends React.HTMLAttributes<HTMLDivElement> {
  glassmorphism?: boolean;
}

const DaystromCard = React.forwardRef<HTMLDivElement, DaystromCardProps>(
  ({ className, glassmorphism = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-daystrom-card relative",
        glassmorphism && [
          "backdrop-blur-3xl",
          "bg-black/40 dark:bg-black/40",
          "border border-white/10 dark:border-white/10",
          // Micro-bevel: inner highlight + outer shadow
          "before:absolute before:inset-0 before:rounded-daystrom-card",
          "before:border before:border-white/10 before:pointer-events-none",
          "after:absolute after:inset-0 after:rounded-daystrom-card",
          "after:shadow-[0_1px_0_rgba(0,0,0,0.2)] after:pointer-events-none",
        ],
        !glassmorphism && "bg-card border border-border",
        className
      )}
      style={{
        boxShadow: "var(--shadow-light-md)",
      }}
      {...props}
    />
  )
);
DaystromCard.displayName = "DaystromCard";

const DaystromCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
DaystromCardHeader.displayName = "DaystromCardHeader";

const DaystromCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-light tracking-wide leading-none",
      className
    )}
    {...props}
  />
));
DaystromCardTitle.displayName = "DaystromCardTitle";

const DaystromCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-muted-foreground", className)}
    {...props}
  />
));
DaystromCardDescription.displayName = "DaystromCardDescription";

const DaystromCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
DaystromCardContent.displayName = "DaystromCardContent";

const DaystromCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
));
DaystromCardFooter.displayName = "DaystromCardFooter";

export {
  DaystromCard,
  DaystromCardHeader,
  DaystromCardFooter,
  DaystromCardTitle,
  DaystromCardDescription,
  DaystromCardContent,
};
