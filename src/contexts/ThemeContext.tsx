"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { theme } from "@/theme";
import { getSettings, updateSettings } from "@/lib/db";

export type ThemeName = "dark" | "light" | "orange" | "pastel";

// 컴포넌트 variant 타입들을 여기서 export
export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type InputVariant = "default" | "search" | "error";
export type BadgeVariant =
  | "default"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "purple";

interface ThemeContextType {
  currentTheme: typeof theme;
  selectedTheme: ThemeName;
  setSelectedTheme: (themeName: ThemeName) => void;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

// 테마 생성 함수 (showcase 페이지에서 가져옴)
const getThemeColors = (themeName: ThemeName): typeof theme => {
  switch (themeName) {
    case "light":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            primary: "#FFFFFF",
            secondary: "#F8F9FA",
            tertiary: "#F1F3F4",
            surface: "#E8EAED",
            elevated: "#FFFFFF",
          },
          text: {
            primary: "#202124",
            secondary: "#5F6368",
            tertiary: "#80868B",
            muted: "#9AA0A6",
            inverse: "#FFFFFF",
          },
          border: {
            default: "#DADCE0",
            muted: "#E8EAED",
            accent: "#5E6AD2",
          },
        },
      };
    case "orange":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            primary: "#1A1A1A",
            secondary: "#2D1B0E",
            tertiary: "#3D2817",
            surface: "#4A3420",
            elevated: "#5A4029",
          },
          text: {
            primary: "#FFFFFF",
            secondary: "#FFE4D1",
            tertiary: "#FFD1B8",
            muted: "#FFBE9F",
            inverse: "#1A1A1A",
          },
          primary: {
            brand: "#FF6B35",
            brandHover: "#E55A2B",
            brandActive: "#CC4A1F",
          },
          accent: {
            purple: "#FF8C42",
          },
          border: {
            default: "#FF8C42",
            muted: "#CC6B35",
            accent: "#FF6B35",
          },
        },
      };
    case "pastel":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            primary: "#F0F8F0",
            secondary: "#E8F4E8",
            tertiary: "#E0F0E0",
            surface: "#D8ECD8",
            elevated: "#D0E8D0",
          },
          text: {
            primary: "#2D4A2D",
            secondary: "#3D5A3D",
            tertiary: "#4D6A4D",
            muted: "#5D7A5D",
            inverse: "#FFFFFF",
          },
          primary: {
            brand: "#A8E6CF",
            brandHover: "#88D8A3",
            brandActive: "#68C77C",
          },
          accent: {
            purple: "#DDA0DD",
          },
          border: {
            default: "#A8E6CF",
            muted: "#C8F6DF",
            accent: "#88D8A3",
          },
        },
      };
    default: // dark
      return theme;
  }
};

interface ThemeProviderProps {
  children: ReactNode;
  initialTheme?: ThemeName;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  initialTheme = "dark",
}) => {
  const [selectedTheme, setSelectedThemeState] =
    useState<ThemeName>(initialTheme);
  const [isLoading, setIsLoading] = useState(true);

  // IndexedDB에서 테마 로드
  useEffect(() => {
    const loadThemeFromDB = async () => {
      try {
        const settings = await getSettings();
        const dbTheme = settings.theme as ThemeName;
        if (
          dbTheme &&
          ["dark", "light", "orange", "pastel"].includes(dbTheme)
        ) {
          setSelectedThemeState(dbTheme);
        }
      } catch (error) {
        console.error("테마 로드 실패:", error);
        // 에러 시 기본 테마 사용
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeFromDB();
  }, []);

  const setSelectedTheme = async (themeName: ThemeName) => {
    // 즉시 UI 업데이트
    setSelectedThemeState(themeName);

    // IndexedDB에 저장
    try {
      await updateSettings({ theme: themeName });
    } catch (error) {
      console.error("테마 저장 실패:", error);
      // 저장 실패 시에도 UI는 변경된 상태 유지
    }
  };

  const currentTheme = getThemeColors(selectedTheme);

  const contextValue: ThemeContextType = {
    currentTheme,
    selectedTheme,
    setSelectedTheme,
    isLoading,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
