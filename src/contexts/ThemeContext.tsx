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

export type ThemeName =
  | "dark"
  | "light"
  | "orange"
  | "pastel"
  | "purple"
  | "gray"
  | "gray-dark";

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
            primary: "#FFF8F0", // 밝은 크림색 배경
            secondary: "#FFE8D1", // 연한 오렌지 배경
            tertiary: "#FFD8B8", // 중간 오렌지 배경
            surface: "#FFC8A0", // 진한 오렌지 배경
            elevated: "#FFB888", // 가장 진한 오렌지 배경
          },
          text: {
            primary: "#8B4513", // 진한 갈색 텍스트
            secondary: "#A0522D", // 중간 갈색 텍스트
            tertiary: "#CD853F", // 연한 갈색 텍스트
            muted: "#DEB887", // 매우 연한 갈색 텍스트
            inverse: "#FFFFFF", // 흰색 텍스트
          },
          primary: {
            brand: "#FF6B35", // 오렌지 브랜드 색상
            brandHover: "#E55A2B", // 오렌지 호버 색상
            brandActive: "#CC4A1F", // 오렌지 액티브 색상
          },
          accent: {
            purple: "#FF8C42", // 오렌지 액센트 색상
          },
          border: {
            default: "#FFB366", // 오렌지 테두리
            muted: "#FFCC99", // 연한 오렌지 테두리
            accent: "#FF6B35", // 오렌지 액센트 테두리
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
    case "purple":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            primary: "#F8F4FF", // 밝은 라벤더 배경
            secondary: "#F0E8FF", // 연한 라벤더 배경
            tertiary: "#E8DCFF", // 중간 라벤더 배경
            surface: "#E0D0FF", // 진한 라벤더 배경
            elevated: "#D8C4FF", // 가장 진한 라벤더 배경
          },
          text: {
            primary: "#4A148C", // 진한 보라색 텍스트
            secondary: "#6A1B9A", // 중간 보라색 텍스트
            tertiary: "#8E24AA", // 연한 보라색 텍스트
            muted: "#AB47BC", // 매우 연한 보라색 텍스트
            inverse: "#FFFFFF", // 흰색 텍스트
          },
          primary: {
            brand: "#9C27B0", // 보라색 브랜드 색상
            brandHover: "#7B1FA2", // 보라색 호버 색상
            brandActive: "#6A1B9A", // 보라색 액티브 색상
          },
          accent: {
            purple: "#E1BEE7", // 보라색 액센트 색상
          },
          border: {
            default: "#CE93D8", // 보라색 테두리
            muted: "#E1BEE7", // 연한 보라색 테두리
            accent: "#9C27B0", // 보라색 액센트 테두리
          },
        },
      };
    case "gray":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            primary: "#F8F9FA", // 밝은 회색 배경
            secondary: "#E9ECEF", // 연한 회색 배경
            tertiary: "#DEE2E6", // 중간 회색 배경
            surface: "#CED4DA", // 진한 회색 배경
            elevated: "#ADB5BD", // 가장 진한 회색 배경
          },
          text: {
            primary: "#212529", // 진한 회색 텍스트
            secondary: "#495057", // 중간 회색 텍스트
            tertiary: "#6C757D", // 연한 회색 텍스트
            muted: "#868E96", // 매우 연한 회색 텍스트
            inverse: "#FFFFFF", // 흰색 텍스트
          },
          primary: {
            brand: "#6C757D", // 회색 브랜드 색상
            brandHover: "#5A6268", // 회색 호버 색상
            brandActive: "#495057", // 회색 액티브 색상
          },
          accent: {
            purple: "#ADB5BD", // 회색 액센트 색상
          },
          border: {
            default: "#CED4DA", // 회색 테두리
            muted: "#E9ECEF", // 연한 회색 테두리
            accent: "#6C757D", // 회색 액센트 테두리
          },
        },
      };
    case "gray-dark":
      return {
        ...theme,
        colors: {
          ...theme.colors,
          background: {
            primary: "#343A40", // 어두운 회색 배경
            secondary: "#495057", // 중간 어두운 회색 배경
            tertiary: "#6C757D", // 연한 어두운 회색 배경
            surface: "#868E96", // 밝은 어두운 회색 배경
            elevated: "#ADB5BD", // 가장 밝은 어두운 회색 배경
          },
          text: {
            primary: "#F8F9FA", // 밝은 회색 텍스트
            secondary: "#E9ECEF", // 연한 회색 텍스트
            tertiary: "#DEE2E6", // 중간 회색 텍스트
            muted: "#CED4DA", // 진한 회색 텍스트
            inverse: "#212529", // 어두운 회색 텍스트
          },
          primary: {
            brand: "#ADB5BD", // 밝은 회색 브랜드 색상
            brandHover: "#CED4DA", // 밝은 회색 호버 색상
            brandActive: "#DEE2E6", // 밝은 회색 액티브 색상
          },
          accent: {
            purple: "#6C757D", // 회색 액센트 색상
          },
          border: {
            default: "#495057", // 어두운 회색 테두리
            muted: "#6C757D", // 중간 어두운 회색 테두리
            accent: "#ADB5BD", // 밝은 회색 액센트 테두리
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
          [
            "dark",
            "light",
            "orange",
            "pastel",
            "purple",
            "gray",
            "gray-dark",
          ].includes(dbTheme)
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

  // 테마가 변경될 때마다 currentTheme을 다시 계산
  const currentTheme = React.useMemo(() => {
    return getThemeColors(selectedTheme);
  }, [selectedTheme]);

  const contextValue: ThemeContextType = React.useMemo(
    () => ({
      currentTheme,
      selectedTheme,
      setSelectedTheme,
      isLoading,
    }),
    [currentTheme, selectedTheme, isLoading]
  );

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};
