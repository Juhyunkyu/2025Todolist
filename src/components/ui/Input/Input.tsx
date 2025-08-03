import React, { forwardRef, useState } from 'react';
import { InputVariant } from '@/theme/types';
import { theme } from '@/theme';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: InputVariant;
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
      variant = 'default',
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      style,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(error);

    const getInputStyles = () => {
      const baseStyles = {
        width: fullWidth ? '100%' : 'auto',
        backgroundColor: theme.colors.background.tertiary,
        border: `1px solid ${hasError ? theme.colors.status.error : theme.colors.border.default}`,
        borderRadius: theme.borderRadius.md,
        padding: leftIcon || rightIcon 
          ? `${theme.spacing['2']} ${theme.spacing['3']} ${theme.spacing['2']} ${leftIcon ? '2.5rem' : theme.spacing['3']}`
          : `${theme.spacing['2']} ${theme.spacing['3']}`,
        fontSize: theme.typography.fontSize.sm,
        color: theme.colors.text.primary,
        transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
        outline: 'none',
        '::placeholder': {
          color: theme.colors.text.muted,
        },
      };

      if (isFocused && !hasError) {
        return {
          ...baseStyles,
          borderColor: theme.colors.primary.brand,
          boxShadow: `0 0 0 3px rgba(94, 106, 210, 0.1)`,
        };
      }

      return baseStyles;
    };

    const containerStyles = {
      display: 'flex',
      flexDirection: 'column' as const,
      gap: theme.spacing['1'],
      width: fullWidth ? '100%' : 'auto',
    };

    const labelStyles = {
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      color: theme.colors.text.secondary,
    };

    const helperTextStyles = {
      fontSize: theme.typography.fontSize.xs,
      color: hasError ? theme.colors.status.error : theme.colors.text.muted,
    };

    const iconContainerStyles = {
      position: 'absolute' as const,
      top: '50%',
      transform: 'translateY(-50%)',
      color: theme.colors.text.muted,
      pointerEvents: 'none' as const,
    };

    const leftIconStyles = {
      ...iconContainerStyles,
      left: theme.spacing['3'],
    };

    const rightIconStyles = {
      ...iconContainerStyles,
      right: theme.spacing['3'],
    };

    return (
      <div style={containerStyles}>
        {label && (
          <label style={labelStyles}>
            {label}
          </label>
        )}
        
        <div style={{ position: 'relative', width: fullWidth ? '100%' : 'auto' }}>
          {leftIcon && (
            <div style={leftIconStyles}>
              {leftIcon}
            </div>
          )}
          
          <input
            ref={ref}
            className={cn('linear-input', className)}
            style={{
              ...getInputStyles(),
              paddingRight: rightIcon ? '2.5rem' : theme.spacing['3'],
              ...style,
            }}
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
          
          {rightIcon && (
            <div style={rightIconStyles}>
              {rightIcon}
            </div>
          )}
        </div>
        
        {(error || helperText) && (
          <span style={helperTextStyles}>
            {error || helperText}
          </span>
        )}
        
        <style jsx>{`
          .linear-input::placeholder {
            color: ${theme.colors.text.muted};
          }
        `}</style>
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
export type { InputProps };