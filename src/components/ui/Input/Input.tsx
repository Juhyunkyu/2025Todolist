import React, { forwardRef, useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      style,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(error);

    const inputStyles = {
      width: fullWidth ? "100%" : "auto",
      backgroundColor: currentTheme.colors.background.tertiary,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: hasError
        ? currentTheme.colors.status.error
        : isFocused
        ? currentTheme.colors.primary.brand
        : currentTheme.colors.border.default,
      borderRadius: currentTheme.borderRadius.md,
      padding: leftIcon
        ? `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]} ${currentTheme.spacing["2"]} 2.5rem`
        : `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`,
      paddingRight: rightIcon ? "2.5rem" : currentTheme.spacing["3"],
      fontSize: currentTheme.typography.fontSize.sm,
      color: currentTheme.colors.text.primary,
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      outline: "none",
      boxShadow:
        isFocused && !hasError ? "0 0 0 3px rgba(94, 106, 210, 0.1)" : "none",
      ...style,
    };

    const containerStyles = {
      display: "flex" as const,
      flexDirection: "column" as const,
      gap: currentTheme.spacing["1"],
      width: fullWidth ? "100%" : "auto",
    };

    const labelStyles = {
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
      color: currentTheme.colors.text.secondary,
    };

    const helperTextStyles = {
      fontSize: currentTheme.typography.fontSize.xs,
      color: hasError
        ? currentTheme.colors.status.error
        : currentTheme.colors.text.muted,
    };

    const leftIconStyles = {
      position: "absolute" as const,
      left: currentTheme.spacing["3"],
      top: "50%",
      transform: "translateY(-50%)",
      color: currentTheme.colors.text.muted,
      pointerEvents: "none" as const,
    };

    const rightIconStyles = {
      position: "absolute" as const,
      right: currentTheme.spacing["3"],
      top: "50%",
      transform: "translateY(-50%)",
      color: currentTheme.colors.text.muted,
      pointerEvents: "none" as const,
    };

    return (
      <>
        <div style={containerStyles}>
          {label && <label style={labelStyles}>{label}</label>}

          <div
            style={{ position: "relative", width: fullWidth ? "100%" : "auto" }}
          >
            {leftIcon && <div style={leftIconStyles}>{leftIcon}</div>}

            <input
              ref={ref}
              style={inputStyles}
              onFocus={(e) => {
                setIsFocused(true);
                props.onFocus?.(e);
              }}
              onBlur={(e) => {
                setIsFocused(false);
                props.onBlur?.(e);
              }}
              {...props}
            />

            {rightIcon && <div style={rightIconStyles}>{rightIcon}</div>}
          </div>

          {(error || helperText) && (
            <span style={helperTextStyles}>{error || helperText}</span>
          )}
        </div>

        <style jsx>{`
          input::placeholder {
            color: ${currentTheme.colors.text.muted};
          }
        `}</style>
      </>
    );
  }
);

Input.displayName = "Input";

export default Input;
export type { InputProps };
