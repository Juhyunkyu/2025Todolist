import { LinearTheme } from './types';
import themeJson from './theme.json';

// JSON 테마를 TypeScript 타입과 함께 export
export const theme: LinearTheme = themeJson as LinearTheme;

// CSS 변수로 변환하는 유틸리티 함수
export const getCSSVariables = () => {
  return {
    // Primary colors
    '--brand': theme.colors.primary.brand,
    '--brand-hover': theme.colors.primary.brandHover,
    '--brand-active': theme.colors.primary.brandActive,
    
    // Background colors
    '--bg-primary': theme.colors.background.primary,
    '--bg-secondary': theme.colors.background.secondary,
    '--bg-tertiary': theme.colors.background.tertiary,
    '--bg-surface': theme.colors.background.surface,
    '--bg-elevated': theme.colors.background.elevated,
    
    // Text colors
    '--text-primary': theme.colors.text.primary,
    '--text-secondary': theme.colors.text.secondary,
    '--text-tertiary': theme.colors.text.tertiary,
    '--text-muted': theme.colors.text.muted,
    '--text-inverse': theme.colors.text.inverse,
    
    // Border colors
    '--border-default': theme.colors.border.default,
    '--border-muted': theme.colors.border.muted,
    '--border-accent': theme.colors.border.accent,
    
    // Status colors
    '--status-success': theme.colors.status.success,
    '--status-warning': theme.colors.status.warning,
    '--status-error': theme.colors.status.error,
    '--status-info': theme.colors.status.info,
    
    // Accent colors
    '--accent-purple': theme.colors.accent.purple,
    
    // Animation durations
    '--duration-fast': theme.animation.duration.fast,
    '--duration-normal': theme.animation.duration.normal,
    '--duration-slow': theme.animation.duration.slow,
    
    // Layout
    '--container-max-width': theme.layout.container.maxWidth,
    '--sidebar-width': theme.layout.sidebar.width,
    '--sidebar-collapsed-width': theme.layout.sidebar.collapsedWidth,
    '--header-height': theme.layout.header.height,
  };
};

// 스타일 객체 생성 유틸리티
export const createThemeStyles = () => ({
  colors: theme.colors,
  typography: theme.typography,
  spacing: theme.spacing,
  borderRadius: theme.borderRadius,
  shadows: theme.shadows,
  animation: theme.animation,
  layout: theme.layout,
  components: theme.components,
});

// 자주 사용되는 스타일 조합들
export const commonStyles = {
  card: {
    backgroundColor: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing['6'],
  },
  
  input: {
    backgroundColor: theme.colors.background.tertiary,
    border: `1px solid ${theme.colors.border.default}`,
    borderRadius: theme.borderRadius.md,
    padding: `${theme.spacing['2']} ${theme.spacing['3']}`,
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.primary,
    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
  },
  
  button: {
    primary: {
      backgroundColor: theme.colors.primary.brand,
      color: theme.colors.text.inverse,
      border: 'none',
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing['2']} ${theme.spacing['4']}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
    },
    
    secondary: {
      backgroundColor: 'transparent',
      color: theme.colors.text.secondary,
      border: `1px solid ${theme.colors.border.default}`,
      borderRadius: theme.borderRadius.md,
      padding: `${theme.spacing['2']} ${theme.spacing['4']}`,
      fontSize: theme.typography.fontSize.sm,
      fontWeight: theme.typography.fontWeight.medium,
      cursor: 'pointer',
      transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
    },
  },
};

export * from './types';
export { default as themeJson } from './theme.json';