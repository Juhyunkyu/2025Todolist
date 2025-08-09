import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "glass";
  padding?: "none" | "sm" | "md" | "lg";
  children: React.ReactNode;
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "default", padding = "md", children, style, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const getVariantStyles = () => {
      const baseStyles = {
        backgroundColor: currentTheme.colors.background.secondary,
        border: `1px solid ${currentTheme.colors.border.default}`,
        borderRadius: currentTheme.borderRadius.lg,
        transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      };

      switch (variant) {
        case "elevated":
          return {
            ...baseStyles,
            boxShadow: currentTheme.shadows.default,
          };
        case "glass":
          return {
            ...baseStyles,
            backgroundColor: "rgba(26, 27, 30, 0.8)",
            backdropFilter: "blur(8px)",
          };
        default:
          return baseStyles;
      }
    };

    const getPaddingStyles = () => {
      switch (padding) {
        case "none":
          return { padding: 0 };
        case "sm":
          return { padding: currentTheme.spacing["3"] };
        case "md":
          return { padding: currentTheme.spacing["6"] };
        case "lg":
          return { padding: currentTheme.spacing["8"] };
        default:
          return {};
      }
    };

    const cardStyles = {
      ...getVariantStyles(),
      ...getPaddingStyles(),
      ...style,
    };

    return (
      <div ref={ref} style={cardStyles} {...props}>
        {children}
      </div>
    );
  }
);

const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, style, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const headerStyles = {
      display: "flex",
      flexDirection: "column" as const,
      gap: currentTheme.spacing["1.5"],
      paddingBottom: currentTheme.spacing["4"],
      ...style,
    };

    return (
      <div ref={ref} style={headerStyles} {...props}>
        {children}
      </div>
    );
  }
);

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ children, style, ...props }, ref) => {
  const { currentTheme } = useTheme();
  const titleStyles = {
    fontSize: currentTheme.typography.fontSize.lg,
    fontWeight: currentTheme.typography.fontWeight.semibold,
    lineHeight: 1,
    letterSpacing: "-0.025em",
    color: currentTheme.colors.text.primary,
    ...style,
  };

  return (
    <h3 ref={ref} style={titleStyles} {...props}>
      {children}
    </h3>
  );
});

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ children, style, ...props }, ref) => {
  const { currentTheme } = useTheme();
  const descriptionStyles = {
    fontSize: currentTheme.typography.fontSize.sm,
    color: currentTheme.colors.text.secondary,
    ...style,
  };

  return (
    <p ref={ref} style={descriptionStyles} {...props}>
      {children}
    </p>
  );
});

const CardContent = React.forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, style, ...props }, ref) => {
    const contentStyles = {
      paddingTop: 0,
      ...style,
    };

    return (
      <div ref={ref} style={contentStyles} {...props}>
        {children}
      </div>
    );
  }
);

const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, style, ...props }, ref) => {
    const { currentTheme } = useTheme();
    const footerStyles = {
      display: "flex",
      alignItems: "center",
      paddingTop: currentTheme.spacing["4"],
      ...style,
    };

    return (
      <div ref={ref} style={footerStyles} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";
CardHeader.displayName = "CardHeader";
CardTitle.displayName = "CardTitle";
CardDescription.displayName = "CardDescription";
CardContent.displayName = "CardContent";
CardFooter.displayName = "CardFooter";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
