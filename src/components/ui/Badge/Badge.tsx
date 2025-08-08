import React from "react";
import { useTheme, BadgeVariant } from "@/contexts/ThemeContext";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: "sm" | "md" | "lg";
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "default",
  size = "md",
  children,
  style,
  ...props
}) => {
  const { currentTheme } = useTheme();
  const getVariantStyles = () => {
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "9999px",
      fontWeight: currentTheme.typography.fontWeight.medium,
      borderWidth: "1px",
      borderStyle: "solid",
      whiteSpace: "nowrap" as const,
    };

    switch (variant) {
      case "default":
        return {
          ...baseStyles,
          backgroundColor: currentTheme.colors.background.elevated,
          color: currentTheme.colors.text.secondary,
          borderColor: currentTheme.colors.border.default,
        };

      case "success":
        return {
          ...baseStyles,
          backgroundColor: "rgba(0, 200, 83, 0.1)",
          color: currentTheme.colors.status.success,
          borderColor: "rgba(0, 200, 83, 0.2)",
        };

      case "warning":
        return {
          ...baseStyles,
          backgroundColor: "rgba(255, 152, 0, 0.1)",
          color: currentTheme.colors.status.warning,
          borderColor: "rgba(255, 152, 0, 0.2)",
        };

      case "error":
        return {
          ...baseStyles,
          backgroundColor: "rgba(244, 67, 54, 0.1)",
          color: currentTheme.colors.status.error,
          borderColor: "rgba(244, 67, 54, 0.2)",
        };

      case "info":
        return {
          ...baseStyles,
          backgroundColor: "rgba(33, 150, 243, 0.1)",
          color: currentTheme.colors.status.info,
          borderColor: "rgba(33, 150, 243, 0.2)",
        };

      case "purple":
        return {
          ...baseStyles,
          backgroundColor: "rgba(156, 39, 176, 0.1)",
          color: currentTheme.colors.accent.purple,
          borderColor: "rgba(156, 39, 176, 0.2)",
        };

      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`,
          fontSize: currentTheme.typography.fontSize.xs,
          minHeight: "1.25rem",
        };
      case "md":
        return {
          padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2.5"]}`,
          fontSize: currentTheme.typography.fontSize.sm,
          minHeight: "1.5rem",
        };
      case "lg":
        return {
          padding: `${currentTheme.spacing["1.5"]} ${currentTheme.spacing["3"]}`,
          fontSize: currentTheme.typography.fontSize.sm,
          minHeight: "1.75rem",
        };
      default:
        return {};
    }
  };

  const badgeStyles = {
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style,
  };

  return (
    <span style={badgeStyles} {...props}>
      {children}
    </span>
  );
};

export default Badge;
export type { BadgeProps };
