import React from 'react';
import { BadgeVariant } from '@/theme/types';
import { theme } from '@/theme';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  size = 'md',
  children,
  className,
  style,
  ...props
}) => {
  const getVariantStyles = () => {
    const baseStyles = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '9999px',
      fontWeight: theme.typography.fontWeight.medium,
      border: '1px solid',
      whiteSpace: 'nowrap' as const,
    };

    switch (variant) {
      case 'default':
        return {
          ...baseStyles,
          backgroundColor: theme.colors.background.elevated,
          color: theme.colors.text.secondary,
          borderColor: theme.colors.border.default,
        };
      
      case 'success':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(0, 200, 83, 0.1)',
          color: theme.colors.status.success,
          borderColor: 'rgba(0, 200, 83, 0.2)',
        };
      
      case 'warning':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(255, 152, 0, 0.1)',
          color: theme.colors.status.warning,
          borderColor: 'rgba(255, 152, 0, 0.2)',
        };
      
      case 'error':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(244, 67, 54, 0.1)',
          color: theme.colors.status.error,
          borderColor: 'rgba(244, 67, 54, 0.2)',
        };
      
      case 'info':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          color: theme.colors.status.info,
          borderColor: 'rgba(33, 150, 243, 0.2)',
        };
      
      case 'purple':
        return {
          ...baseStyles,
          backgroundColor: 'rgba(156, 39, 176, 0.1)',
          color: theme.colors.accent.purple,
          borderColor: 'rgba(156, 39, 176, 0.2)',
        };
      
      default:
        return baseStyles;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          padding: `${theme.spacing['1']} ${theme.spacing['2']}`,
          fontSize: theme.typography.fontSize.xs,
          minHeight: '1.25rem',
        };
      case 'md':
        return {
          padding: `${theme.spacing['1']} ${theme.spacing['2.5']}`,
          fontSize: theme.typography.fontSize.sm,
          minHeight: '1.5rem',
        };
      case 'lg':
        return {
          padding: `${theme.spacing['1.5']} ${theme.spacing['3']}`,
          fontSize: theme.typography.fontSize.sm,
          minHeight: '1.75rem',
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
    <span
      className={cn('linear-badge', className)}
      style={badgeStyles}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
export type { BadgeProps };