import React, { forwardRef } from 'react';
import { ButtonVariant, ButtonSize } from '@/theme/types';
import { theme } from '@/theme';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
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
      variant = 'primary',
      size = 'md',
      loading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      children,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const getVariantStyles = () => {
      const baseStyles = {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing['2'],
        borderRadius: theme.borderRadius.md,
        fontWeight: theme.typography.fontWeight.medium,
        transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        opacity: disabled || loading ? 0.5 : 1,
        width: fullWidth ? '100%' : 'auto',
      };

      switch (variant) {
        case 'primary':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.primary.brand,
            color: theme.colors.text.inverse,
            border: 'none',
            ':hover': !disabled && !loading ? {
              backgroundColor: theme.colors.primary.brandHover,
            } : {},
            ':active': !disabled && !loading ? {
              backgroundColor: theme.colors.primary.brandActive,
            } : {},
          };
        
        case 'secondary':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            color: theme.colors.text.secondary,
            border: `1px solid ${theme.colors.border.default}`,
            ':hover': !disabled && !loading ? {
              backgroundColor: theme.colors.background.surface,
            } : {},
          };
        
        case 'ghost':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            color: theme.colors.text.secondary,
            border: 'none',
            ':hover': !disabled && !loading ? {
              backgroundColor: theme.colors.background.surface,
            } : {},
          };
        
        case 'danger':
          return {
            ...baseStyles,
            backgroundColor: theme.colors.status.error,
            color: theme.colors.text.inverse,
            border: 'none',
            ':hover': !disabled && !loading ? {
              backgroundColor: '#d32f2f', // 약간 어두운 빨강
            } : {},
          };
        
        default:
          return baseStyles;
      }
    };

    const getSizeStyles = () => {
      switch (size) {
        case 'sm':
          return {
            padding: `${theme.spacing['1']} ${theme.spacing['3']}`,
            fontSize: theme.typography.fontSize.xs,
            minHeight: '2rem',
          };
        case 'md':
          return {
            padding: `${theme.spacing['2']} ${theme.spacing['4']}`,
            fontSize: theme.typography.fontSize.sm,
            minHeight: '2.5rem',
          };
        case 'lg':
          return {
            padding: `${theme.spacing['3']} ${theme.spacing['6']}`,
            fontSize: theme.typography.fontSize.base,
            minHeight: '3rem',
          };
        default:
          return {};
      }
    };

    const buttonStyles = {
      ...getVariantStyles(),
      ...getSizeStyles(),
    };

    const LoadingSpinner = () => (
      <div
        style={{
          width: '1rem',
          height: '1rem',
          border: '2px solid currentColor',
          borderTop: '2px solid transparent',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }}
      />
    );

    return (
      <>
        <button
          ref={ref}
          className={cn('linear-button', className)}
          style={buttonStyles}
          disabled={disabled || loading}
          {...props}
        >
          {loading && <LoadingSpinner />}
          {!loading && leftIcon && leftIcon}
          {children}
          {!loading && rightIcon && rightIcon}
        </button>
        
        <style jsx>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          .linear-button:hover {
            ${Object.entries(buttonStyles[':hover'] || {})
              .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
              .join('\n')}
          }
          
          .linear-button:active {
            ${Object.entries(buttonStyles[':active'] || {})
              .map(([key, value]) => `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${value};`)
              .join('\n')}
          }
        `}</style>
      </>
    );
  }
);

Button.displayName = 'Button';

export default Button;
export type { ButtonProps };