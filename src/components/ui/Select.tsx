import React from "react";
import { cn } from "@/lib/utils";

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
      className,
      label,
      error,
      helperText,
      options,
      placeholder = "Select an option...",
      size = "md",
      ...props
    },
    ref
  ) => {
    const baseClasses =
      "input-base appearance-none bg-no-repeat bg-right pr-10 cursor-pointer";

    const sizes = {
      sm: "py-1.5 text-sm",
      md: "py-2 text-sm",
      lg: "py-3 text-base",
    };

    const chevronIcon = (
      <svg
        className="w-4 h-4 text-text-muted pointer-events-none"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    );

    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
          </label>
        )}

        <div className="relative">
          <select
            ref={ref}
            className={cn(
              baseClasses,
              sizes[size],
              error &&
                "border-status-error focus:border-status-error focus:ring-status-error/20",
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
                className="bg-bg-tertiary text-text-primary"
              >
                {option.label}
              </option>
            ))}
          </select>

          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {chevronIcon}
          </div>
        </div>

        {error && <p className="mt-1 text-sm text-status-error">{error}</p>}

        {helperText && !error && (
          <p className="mt-1 text-sm text-text-muted">{helperText}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
