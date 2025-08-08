import React, { forwardRef, useState } from "react";
import { useTheme, ButtonVariant, ButtonSize } from "@/contexts/ThemeContext";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      disabled,
      style,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const [isHovered, setIsHovered] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const getVariantStyles = () => {
      const baseStyles = {
        display: "inline-flex" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
        gap: currentTheme.spacing["2"],
        borderRadius: currentTheme.borderRadius.md,
        fontWeight: currentTheme.typography.fontWeight.medium,
        transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.5 : 1,
        width: fullWidth ? "100%" : "auto",
        borderWidth: "0",
      };

      switch (variant) {
        case "primary":
          return {
            ...baseStyles,
            backgroundColor: isActive
              ? currentTheme.colors.primary.brandActive
              : isHovered && !disabled && !loading
              ? currentTheme.colors.primary.brandHover
              : currentTheme.colors.primary.brand,
            color: "#FFFFFF",
          };

        case "secondary":
          return {
            ...baseStyles,
            backgroundColor:
              isHovered && !disabled && !loading
                ? currentTheme.colors.background.surface
                : "transparent",
            color: currentTheme.colors.text.secondary,
            borderWidth: "1px",
            borderStyle: "solid",
            borderColor: currentTheme.colors.border.default,
          };

        case "ghost":
          return {
            ...baseStyles,
            backgroundColor:
              isHovered && !disabled && !loading
                ? currentTheme.colors.background.surface
                : "transparent",
            color: currentTheme.colors.text.secondary,
          };

        case "danger":
          return {
            ...baseStyles,
            backgroundColor: isActive
              ? "#d32f2f"
              : isHovered && !disabled && !loading
              ? "#e53935"
              : currentTheme.colors.status.error,
            color: "#FFFFFF",
          };

        default:
          return baseStyles;
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return {
            padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`,
            fontSize: currentTheme.typography.fontSize.xs,
            minHeight: "2rem",
          };
        case "md":
          return {
            padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`,
            fontSize: currentTheme.typography.fontSize.sm,
            minHeight: "2.5rem",
          };
        case "lg":
          return {
            padding: `${currentTheme.spacing["3"]} ${currentTheme.spacing["6"]}`,
            fontSize: currentTheme.typography.fontSize.base,
            minHeight: "3rem",
          };
        default:
          return {};
      }
    };

    const buttonStyles = {
      ...getVariantStyles(),
      ...getSizeStyles(),
      ...style,
    };

    const LoadingSpinner = () => (
      <div
        style={{
          width: "1rem",
          height: "1rem",
          borderWidth: "2px",
          borderStyle: "solid",
          borderColor: "currentColor",
          borderTopColor: "transparent",
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      />
    );

    return (
      <>
        <button
          ref={ref}
          style={buttonStyles}
          disabled={disabled || loading}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => {
            setIsHovered(false);
            setIsActive(false);
          }}
          onMouseDown={() => setIsActive(true)}
          onMouseUp={() => setIsActive(false)}
          {...props}
        >
          {loading && <LoadingSpinner />}
          {!loading && leftIcon && leftIcon}
          {children}
          {!loading && rightIcon && rightIcon}
        </button>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </>
    );
  }
);

Button.displayName = "Button";

export default Button;
export type { ButtonProps };
