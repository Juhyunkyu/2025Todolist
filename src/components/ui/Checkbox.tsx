import React from "react";
import { cn } from "@/lib/utils";

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
      className,
      label,
      description,
      size = "md",
      indeterminate = false,
      checked,
      ...props
    },
    ref
  ) => {
    const checkboxRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => checkboxRef.current!);

    React.useEffect(() => {
      if (checkboxRef.current) {
        checkboxRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    const sizes = {
      sm: "w-4 h-4",
      md: "w-5 h-5",
      lg: "w-6 h-6",
    };

    const labelSizes = {
      sm: "text-sm",
      md: "text-sm",
      lg: "text-base",
    };

    const checkboxElement = (
      <input
        type="checkbox"
        ref={checkboxRef}
        checked={checked}
        className={cn(
          "rounded border-border bg-bg-tertiary text-brand focus:ring-brand focus:ring-2 focus:ring-opacity-50 transition-colors",
          sizes[size],
          className
        )}
        {...props}
      />
    );

    if (label || description) {
      return (
        <div className="flex items-start space-x-3">
          <div className="flex items-center h-5">{checkboxElement}</div>
          <div className="flex-1 min-w-0">
            {label && (
              <label
                className={cn(
                  "font-medium text-text-primary cursor-pointer",
                  labelSizes[size]
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-sm text-text-secondary mt-1">{description}</p>
            )}
          </div>
        </div>
      );
    }

    return checkboxElement;
  }
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
