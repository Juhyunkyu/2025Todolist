import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?: string;
  description?: string;
  size?: "sm" | "md" | "lg";
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      label,
      description,
      size = "md",
      indeterminate = false,
      checked,
      style,
      ...props
    },
    ref
  ) => {
    const { currentTheme } = useTheme();
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const getSizeStyles = () => {
      switch (size) {
        case "sm":
          return {
            width: "1rem",
            height: "1rem",
            fontSize: currentTheme.typography.fontSize.sm,
          };
        case "md":
          return {
            width: "1.25rem",
            height: "1.25rem",
            fontSize: currentTheme.typography.fontSize.sm,
          };
        case "lg":
          return {
            width: "1.5rem",
            height: "1.5rem",
            fontSize: currentTheme.typography.fontSize.base,
          };
        default:
          return {
            width: "1.25rem",
            height: "1.25rem",
            fontSize: currentTheme.typography.fontSize.sm,
          };
      }
    };

    const checkboxStyles: React.CSSProperties = {
      accentColor: currentTheme.colors.primary.brand,
      backgroundColor: currentTheme.colors.background.tertiary,
      borderWidth: "1px",
      borderStyle: "solid",
      borderColor: currentTheme.colors.border.default,
      borderRadius: currentTheme.borderRadius.sm,
      cursor: "pointer",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      ...getSizeStyles(),
      ...style,
    };

    const containerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "flex-start",
      gap: currentTheme.spacing["3"],
    };

    const checkboxContainerStyles: React.CSSProperties = {
      display: "flex",
      alignItems: "center",
      height: "1.25rem",
    };

    const contentStyles: React.CSSProperties = {
      flex: 1,
      minWidth: 0,
    };

    const labelStyles: React.CSSProperties = {
      fontWeight: currentTheme.typography.fontWeight.medium,
      color: currentTheme.colors.text.primary,
      cursor: "pointer",
      fontSize: getSizeStyles().fontSize,
      lineHeight: "1.4",
    };

    const descriptionStyles: React.CSSProperties = {
      fontSize: currentTheme.typography.fontSize.sm,
      color: currentTheme.colors.text.secondary,
      marginTop: currentTheme.spacing["1"],
      lineHeight: "1.5",
    };

    const checkboxElement = (
      <input
        type="checkbox"
        ref={checkboxRef}
        checked={checked}
        style={checkboxStyles}
        {...props}
      />
    );

    if (label || description) {
      return (
        <div style={containerStyles}>
          <div style={checkboxContainerStyles}>{checkboxElement}</div>
          <div style={contentStyles}>
            {label && <label style={labelStyles}>{label}</label>}
            {description && <p style={descriptionStyles}>{description}</p>}
          </div>
        </div>
      );
    }

    return checkboxElement;
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
export type { CheckboxProps };
