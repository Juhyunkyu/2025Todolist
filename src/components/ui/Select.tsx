import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  size?: "sm" | "md" | "lg";
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder = "Select an option...",
      size = "md",
      style,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const hasError = Boolean(error);

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return {
            padding: `${currentTheme.spacing["1.5"]} ${currentTheme.spacing["3"]}`,
            fontSize: currentTheme.typography.fontSize.sm,
            minHeight: "2rem",
          };
        case "md":
          return {
            padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`,
            fontSize: currentTheme.typography.fontSize.sm,
            minHeight: "2.5rem",
          };
        case "lg":
          return {
            padding: `${currentTheme.spacing["3"]} ${currentTheme.spacing["4"]}`,
            fontSize: currentTheme.typography.fontSize.base,
            minHeight: "3rem",
          };
        default:
          return {
            padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`,
            fontSize: currentTheme.typography.fontSize.sm,
            minHeight: "2.5rem",
          };
      }
    };

    const containerStyles: React.CSSProperties = {
      width: "100%",
    };

    const labelStyles: React.CSSProperties = {
      display: "block",
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
      color: currentTheme.colors.text.secondary,
      marginBottom: currentTheme.spacing["2"],
    };

    const selectContainerStyles: React.CSSProperties = {
      position: "relative",
    };

    const selectStyles: React.CSSProperties = {
      width: "100%",
      backgroundColor: currentTheme.colors.background.tertiary,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: hasError
        ? currentTheme.colors.status.error
        : currentTheme.colors.border.default,
      borderRadius: currentTheme.borderRadius.md,
      color: currentTheme.colors.text.primary,
      appearance: "none",
      backgroundImage: "none",
      cursor: "pointer",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      paddingRight: `${currentTheme.spacing["10"]}`, // Space for chevron
      ...getSizeStyles(),
      ...style,
    };

    const chevronStyles: React.CSSProperties = {
      position: "absolute",
      right: currentTheme.spacing["3"],
      top: "50%",
      transform: "translateY(-50%)",
      pointerEvents: "none",
      color: currentTheme.colors.text.muted,
    };

    const errorTextStyles: React.CSSProperties = {
      marginTop: currentTheme.spacing["1"],
      fontSize: currentTheme.typography.fontSize.sm,
      color: currentTheme.colors.status.error,
    };

    const helperTextStyles: React.CSSProperties = {
      marginTop: currentTheme.spacing["1"],
      fontSize: currentTheme.typography.fontSize.sm,
      color: currentTheme.colors.text.muted,
    };

    const optionStyles: React.CSSProperties = {
      backgroundColor: currentTheme.colors.background.tertiary,
      color: currentTheme.colors.text.primary,
    };

    return (
      <div style={containerStyles}>
        {label && <label style={labelStyles}>{label}</label>}

        <div style={selectContainerStyles}>
          <select
            ref={ref}
            style={selectStyles}
            onFocus={(e) => {
              (e.target as HTMLSelectElement).style.borderColor = hasError
                ? currentTheme.colors.status.error
                : currentTheme.colors.primary.brand;
              (e.target as HTMLSelectElement).style.boxShadow = hasError
                ? `0 0 0 3px rgba(244, 67, 54, 0.1)`
                : `0 0 0 3px rgba(94, 106, 210, 0.1)`;
              props.onFocus?.(e);
            }}
            onBlur={(e) => {
              (e.target as HTMLSelectElement).style.borderColor = hasError
                ? currentTheme.colors.status.error
                : currentTheme.colors.border.default;
              (e.target as HTMLSelectElement).style.boxShadow = "none";
              props.onBlur?.(e);
            }}
            {...props}
          >
            {placeholder && (
              <option value="" disabled style={optionStyles}>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                style={optionStyles}
              >
                {option.label}
              </option>
            ))}
          </select>

          <div style={chevronStyles}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>

        {error && <p style={errorTextStyles}>{error}</p>}

        {helperText && !error && <p style={helperTextStyles}>{helperText}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
export type { SelectProps, SelectOption };
