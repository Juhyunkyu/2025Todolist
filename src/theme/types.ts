// Linear App Theme TypeScript 타입 정의

export interface ThemeColors {
  primary: {
    brand: string;
    brandHover: string;
    brandActive: string;
  };
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    surface: string;
    elevated: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    inverse: string;
  };
  border: {
    default: string;
    muted: string;
    accent: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  accent: {
    purple: string;
  };
}

export interface ThemeTypography {
  fontFamily: {
    primary: string[];
    mono: string[];
  };
  fontSize: Record<string, string>;
  fontWeight: Record<string, number>;
  lineHeight: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface ThemeSpacing {
  [key: string]: string;
}

export interface ThemeBorderRadius {
  [key: string]: string;
}

export interface ThemeShadows {
  [key: string]: string;
}

export interface ThemeAnimation {
  duration: {
    fast: string;
    normal: string;
    slow: string;
  };
  easing: {
    default: string;
    in: string;
    out: string;
    inOut: string;
  };
}

export interface ThemeLayout {
  container: {
    maxWidth: string;
    padding: string;
  };
  sidebar: {
    width: string;
    collapsedWidth: string;
  };
  header: {
    height: string;
  };
}

export interface ThemeComponents {
  button: {
    primary: {
      backgroundColor: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      transition: string;
      hover: {
        backgroundColor: string;
      };
      active: {
        backgroundColor: string;
      };
    };
    secondary: {
      backgroundColor: string;
      color: string;
      border: string;
      borderRadius: string;
      padding: string;
      fontSize: string;
      fontWeight: number;
      lineHeight: string;
      transition: string;
      hover: {
        backgroundColor: string;
      };
    };
  };
  input: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    padding: string;
    fontSize: string;
    color: string;
    placeholderColor: string;
    focus: {
      borderColor: string;
      boxShadow: string;
    };
  };
  card: {
    backgroundColor: string;
    border: string;
    borderRadius: string;
    padding: string;
    boxShadow: string;
  };
}

export interface LinearTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  borderRadius: ThemeBorderRadius;
  shadows: ThemeShadows;
  animation: ThemeAnimation;
  layout: ThemeLayout;
  components: ThemeComponents;
}

// 컴포넌트 variant 타입들
export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'purple';
export type InputVariant = 'default' | 'search' | 'error';