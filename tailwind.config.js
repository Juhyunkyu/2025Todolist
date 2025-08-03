/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Primary brand colors (JSON에서 가져온 정확한 값들)
        brand: {
          DEFAULT: '#5E6AD2',
          hover: '#4C5BC7',
          active: '#3A4AB3',
        },
        // Background colors (JSON의 background 섹션)
        bg: {
          primary: '#000000',
          secondary: '#0D0E10',
          tertiary: '#1A1B1E',
          surface: '#242529',
          elevated: '#2E2F33',
        },
        // Text colors (JSON의 text 섹션)
        text: {
          primary: '#FFFFFF',
          secondary: '#B4B4B4',
          tertiary: '#8C8C8C',
          muted: '#666666',
          inverse: '#000000',
        },
        // Border colors (JSON의 border 섹션)
        border: {
          DEFAULT: '#2E2F33',
          muted: '#1A1B1E',
          accent: '#5E6AD2',
        },
        // Status colors (JSON의 status 섹션)
        status: {
          success: '#00C853',
          warning: '#FF9800',
          error: '#F44336',
          info: '#2196F3',
        },
        // Accent colors (JSON의 accent 섹션)
        accent: {
          purple: '#9C27B0',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'Cascadia Code', 'Roboto Mono', 'Consolas', 'monospace'],
      },
      fontSize: {
        xs: '0.75rem',      // JSON: typography.fontSize.xs
        sm: '0.875rem',     // JSON: typography.fontSize.sm
        base: '1rem',       // JSON: typography.fontSize.base
        lg: '1.125rem',     // JSON: typography.fontSize.lg
        xl: '1.25rem',      // JSON: typography.fontSize.xl
        '2xl': '1.5rem',    // JSON: typography.fontSize.2xl
        '3xl': '1.875rem',  // JSON: typography.fontSize.3xl
        '4xl': '2.25rem',   // JSON: typography.fontSize.4xl
        '5xl': '3rem',      // JSON: typography.fontSize.5xl
      },
      fontWeight: {
        light: 300,         // JSON: typography.fontWeight.light
        normal: 400,        // JSON: typography.fontWeight.normal
        medium: 500,        // JSON: typography.fontWeight.medium
        semibold: 600,      // JSON: typography.fontWeight.semibold
        bold: 700,          // JSON: typography.fontWeight.bold
      },
      lineHeight: {
        tight: 1.25,        // JSON: typography.lineHeight.tight
        normal: 1.5,        // JSON: typography.lineHeight.normal
        relaxed: 1.75,      // JSON: typography.lineHeight.relaxed
      },
      letterSpacing: {
        tight: '-0.025em',  // JSON: typography.letterSpacing.tight
        normal: '0',        // JSON: typography.letterSpacing.normal
        wide: '0.025em',    // JSON: typography.letterSpacing.wide
      },
      spacing: {
        '1': '0.25rem',     // JSON: spacing.1
        '2': '0.5rem',      // JSON: spacing.2
        '3': '0.75rem',     // JSON: spacing.3
        '4': '1rem',        // JSON: spacing.4
        '6': '1.5rem',      // JSON: spacing.6
        '8': '2rem',        // JSON: spacing.8
        '12': '3rem',       // JSON: spacing.12
        '16': '4rem',       // JSON: spacing.16
        '20': '5rem',       // JSON: spacing.20
        '24': '6rem',       // JSON: spacing.24
      },
      borderRadius: {
        none: '0',          // JSON: borderRadius.none
        sm: '0.125rem',     // JSON: borderRadius.sm
        DEFAULT: '0.25rem', // JSON: borderRadius.default
        md: '0.375rem',     // JSON: borderRadius.md
        lg: '0.5rem',       // JSON: borderRadius.lg
        xl: '0.75rem',      // JSON: borderRadius.xl
        '2xl': '1rem',      // JSON: borderRadius.2xl
        full: '9999px',     // JSON: borderRadius.full
      },
      boxShadow: {
        none: 'none',       // JSON: shadows.none
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',                                    // JSON: shadows.sm
        DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)', // JSON: shadows.default
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)', // JSON: shadows.md
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)', // JSON: shadows.lg
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', // JSON: shadows.xl
        glow: '0 0 20px rgba(94, 106, 210, 0.3)', // JSON: shadows.glow
      },
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',     // JSON: animation.duration.fast
        'slide-up': 'slideUp 300ms ease-out',   // JSON: animation.duration.normal
        'slide-down': 'slideDown 300ms ease-out', // JSON: animation.duration.normal
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      transitionDuration: {
        fast: '150ms',      // JSON: animation.duration.fast
        normal: '300ms',    // JSON: animation.duration.normal
        slow: '500ms',      // JSON: animation.duration.slow
      },
      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)', // JSON: animation.easing.default
        in: 'cubic-bezier(0.4, 0, 1, 1)',        // JSON: animation.easing.in
        out: 'cubic-bezier(0, 0, 0.2, 1)',       // JSON: animation.easing.out
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)', // JSON: animation.easing.inOut
      },
    },
  },
  plugins: [],
}