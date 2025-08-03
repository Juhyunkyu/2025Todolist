"use client";

import React, { useState } from "react";
import { theme } from "@/theme";

// 아이콘 컴포넌트들
const SearchIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);

const PlusIcon = () => (
  <svg
    className="w-4 h-4"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 4v16m8-8H4"
    />
  </svg>
);

export default function ComponentsPage() {
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [searchValue, setSearchValue] = useState("");
  const [checked, setChecked] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState("dark");

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  // 데모용 테마 변경 함수
  const getThemeColors = (): typeof theme => {
    switch (selectedTheme) {
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

  const currentTheme: typeof theme = getThemeColors();

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: currentTheme.colors.background.primary,
        color: currentTheme.colors.text.primary,
        fontFamily: currentTheme.typography.fontFamily.primary.join(", "),
        padding: currentTheme.spacing["8"],
      }}
    >
      <div
        style={{
          maxWidth: currentTheme.layout.container.maxWidth, // 1200px
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: currentTheme.spacing["12"], // 3rem
        }}
      >
        {/* Header */}
        <header style={{ textAlign: "center" }}>
          <h1
            style={{
              fontSize: currentTheme.typography.fontSize["4xl"], // 2.25rem
              fontWeight: currentTheme.typography.fontWeight.bold, // 700
              marginBottom: currentTheme.spacing["4"], // 1rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Linear App Theme
          </h1>
          <p
            style={{
              fontSize: currentTheme.typography.fontSize.lg, // 1.125rem
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["4"], // 1rem
              maxWidth: "600px",
              margin: "0 auto",
              lineHeight: "1.6",
            }}
          >
            Linear의 미니멀하고 전문적인 디자인 시스템을 기반으로 한 재사용
            가능한 컴포넌트 라이브러리입니다.
          </p>
          <div
            style={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
            }}
          >
            Component Demo Gallery -{" "}
            {selectedTheme === "dark"
              ? "다크 모드"
              : selectedTheme === "light"
              ? "라이트 모드"
              : selectedTheme === "orange"
              ? "오렌지 테마"
              : "파스텔 테마"}{" "}
            적용 중
          </div>
        </header>

        {/* Buttons Section */}
        <div
          style={{
            backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
            border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
            borderRadius: currentTheme.borderRadius.lg, // 0.5rem
            padding: currentTheme.spacing["6"], // 1.5rem
          }}
        >
          <h2
            style={{
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
              marginBottom: currentTheme.spacing["2"], // 0.5rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Buttons (순수 JSON 테마)
          </h2>
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["6"], // 1.5rem
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            JSON 테마 파일의 정확한 값들을 직접 적용한 버튼 컴포넌트들입니다.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: currentTheme.spacing["6"], // 1.5rem
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: currentTheme.spacing["3"], // 0.75rem
              }}
            >
              <span
                style={{
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                }}
              >
                Primary Buttons
              </span>
              <div
                style={{
                  display: "flex",
                  gap: currentTheme.spacing["3"], // 0.75rem
                  flexWrap: "wrap",
                }}
              >
                {/* Primary Button - Small */}
                <button
                  style={{
                    backgroundColor: currentTheme.colors.primary.brand, // #5E6AD2
                    color: currentTheme.colors.text.inverse, // #000000 -> #FFFFFF로 수정
                    border: "none",
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                    fontSize: currentTheme.typography.fontSize.xs, // 0.75rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: "pointer",
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  }}
                  onMouseEnter={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.primary.brandHover) // #4C5BC7
                  }
                  onMouseLeave={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.primary.brand) // #5E6AD2
                  }
                >
                  Small
                </button>

                {/* Primary Button - Medium */}
                <button
                  style={{
                    backgroundColor: currentTheme.colors.primary.brand, // #5E6AD2
                    color: "#FFFFFF", // 명시적으로 흰색
                    border: "none",
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 0.5rem 1rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: "pointer",
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  }}
                  onMouseEnter={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.primary.brandHover) // #4C5BC7
                  }
                  onMouseLeave={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.primary.brand) // #5E6AD2
                  }
                >
                  Medium
                </button>

                {/* Primary Button - Large */}
                <button
                  style={{
                    backgroundColor: currentTheme.colors.primary.brand, // #5E6AD2
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["3"]} ${currentTheme.spacing["6"]}`, // 0.75rem 1.5rem
                    fontSize: currentTheme.typography.fontSize.base, // 1rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: "pointer",
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  }}
                  onMouseEnter={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.primary.brandHover) // #4C5BC7
                  }
                  onMouseLeave={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.primary.brand) // #5E6AD2
                  }
                >
                  Large
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: currentTheme.spacing["3"], // 0.75rem
              }}
            >
              <span
                style={{
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                }}
              >
                Secondary & Special Buttons
              </span>
              <div
                style={{
                  display: "flex",
                  gap: currentTheme.spacing["3"], // 0.75rem
                  flexWrap: "wrap",
                }}
              >
                {/* Secondary Button */}
                <button
                  style={{
                    backgroundColor: "transparent",
                    color: currentTheme.colors.text.secondary, // #B4B4B4
                    border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 0.5rem 1rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: "pointer",
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  }}
                  onMouseEnter={
                    (e) =>
                      ((e.target as HTMLElement).style.backgroundColor =
                        currentTheme.colors.background.surface) // #242529
                  }
                  onMouseLeave={(e) =>
                    ((e.target as HTMLElement).style.backgroundColor =
                      "transparent")
                  }
                >
                  Cancel
                </button>

                {/* Loading Button */}
                <button
                  onClick={handleLoadingDemo}
                  style={{
                    backgroundColor: currentTheme.colors.primary.brand, // #5E6AD2
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 0.5rem 1rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? 0.5 : 1,
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                    display: "flex",
                    alignItems: "center",
                    gap: currentTheme.spacing["2"], // 0.5rem
                  }}
                >
                  {loading && (
                    <div
                      style={{
                        width: "1rem",
                        height: "1rem",
                        border: "2px solid currentColor",
                        borderTop: "2px solid transparent",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                      }}
                    />
                  )}
                  {loading ? "Loading..." : "Click to Load"}
                </button>

                {/* Icon Button */}
                <button
                  style={{
                    backgroundColor: currentTheme.colors.primary.brand, // #5E6AD2
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 0.5rem 1rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: "pointer",
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                    display: "flex",
                    alignItems: "center",
                    gap: currentTheme.spacing["2"], // 0.5rem
                  }}
                >
                  <PlusIcon />
                  Add Item
                </button>

                {/* Danger Button */}
                <button
                  style={{
                    backgroundColor: currentTheme.colors.status.error, // #F44336
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 0.5rem 1rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                    cursor: "pointer",
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  }}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Input Section */}
        <div
          style={{
            backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
            border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
            borderRadius: currentTheme.borderRadius.lg, // 0.5rem
            padding: currentTheme.spacing["6"], // 1.5rem
          }}
        >
          <h2
            style={{
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
              marginBottom: currentTheme.spacing["2"], // 0.5rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Input Fields (순수 JSON 테마)
          </h2>
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["6"], // 1.5rem
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            JSON 테마의 정확한 값들을 사용한 입력 필드들입니다.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: currentTheme.spacing["6"], // 1.5rem
            }}
          >
            {/* Basic Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  marginBottom: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                기본 입력
              </label>
              <input
                type="text"
                placeholder="텍스트를 입력하세요"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
                  border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                  borderRadius: currentTheme.borderRadius.md, // 0.375rem
                  padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`, // 0.5rem 0.75rem
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  color: currentTheme.colors.text.primary, // #FFFFFF
                  transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                }}
                onFocus={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    currentTheme.colors.primary.brand; // #5E6AD2
                  (e.target as HTMLInputElement).style.boxShadow =
                    "0 0 0 3px rgba(94, 106, 210, 0.1)";
                }}
                onBlur={(e) => {
                  (e.target as HTMLInputElement).style.borderColor =
                    currentTheme.colors.border.default; // #2E2F33
                  (e.target as HTMLInputElement).style.boxShadow = "none";
                }}
              />
              <p
                style={{
                  marginTop: currentTheme.spacing["1"], // 0.25rem
                  fontSize: currentTheme.typography.fontSize.xs, // 0.75rem
                  color: currentTheme.colors.text.muted, // #666666
                }}
              >
                도움말 텍스트입니다
              </p>
            </div>

            {/* Search Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  marginBottom: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                검색 입력
              </label>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: currentTheme.spacing["3"], // 0.75rem
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: currentTheme.colors.text.muted, // #666666
                  }}
                >
                  <SearchIcon />
                </div>
                <input
                  type="text"
                  placeholder="검색어를 입력하세요"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  style={{
                    width: "100%",
                    backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
                    border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]} ${currentTheme.spacing["2"]} 2.5rem`,
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    color: currentTheme.colors.text.primary, // #FFFFFF
                    transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor =
                      currentTheme.colors.primary.brand; // #5E6AD2
                    e.target.style.boxShadow =
                      "0 0 0 3px rgba(94, 106, 210, 0.1)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor =
                      currentTheme.colors.border.default; // #2E2F33
                    e.target.style.boxShadow = "none";
                  }}
                />
              </div>
            </div>

            {/* Error Input */}
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  marginBottom: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                에러 상태
              </label>
              <input
                type="text"
                placeholder="잘못된 입력"
                defaultValue="invalid@"
                style={{
                  width: "100%",
                  backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
                  border: `1px solid ${currentTheme.colors.status.error}`, // #F44336
                  borderRadius: currentTheme.borderRadius.md, // 0.375rem
                  padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`, // 0.5rem 0.75rem
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  color: currentTheme.colors.text.primary, // #FFFFFF
                  transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                }}
              />
              <p
                style={{
                  marginTop: currentTheme.spacing["1"], // 0.25rem
                  fontSize: currentTheme.typography.fontSize.xs, // 0.75rem
                  color: currentTheme.colors.status.error, // #F44336
                }}
              >
                이 필드는 필수입니다
              </p>
            </div>
          </div>
        </div>

        {/* Badges Section */}
        <div
          style={{
            backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
            border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
            borderRadius: currentTheme.borderRadius.lg, // 0.5rem
            padding: currentTheme.spacing["6"], // 1.5rem
          }}
        >
          <h2
            style={{
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
              marginBottom: currentTheme.spacing["2"], // 0.5rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Badges (순수 JSON 테마)
          </h2>
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["6"], // 1.5rem
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            JSON 테마의 정확한 상태 색상들을 사용한 배지들입니다.
          </p>

          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: currentTheme.spacing["3"], // 0.75rem
            }}
          >
            {/* Default Badge */}
            <span
              style={{
                backgroundColor: currentTheme.colors.background.elevated, // #2E2F33
                color: currentTheme.colors.text.secondary, // #B4B4B4
                border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                borderRadius: "9999px",
                padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                fontWeight: currentTheme.typography.fontWeight.medium, // 500
              }}
            >
              Default
            </span>

            {/* Success Badge */}
            <span
              style={{
                backgroundColor: "rgba(0, 200, 83, 0.1)",
                color: currentTheme.colors.status.success, // #00C853
                border: "1px solid rgba(0, 200, 83, 0.2)",
                borderRadius: "9999px",
                padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                fontWeight: currentTheme.typography.fontWeight.medium, // 500
              }}
            >
              Success
            </span>

            {/* Warning Badge */}
            <span
              style={{
                backgroundColor: "rgba(255, 152, 0, 0.1)",
                color: currentTheme.colors.status.warning, // #FF9800
                border: "1px solid rgba(255, 152, 0, 0.2)",
                borderRadius: "9999px",
                padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                fontWeight: currentTheme.typography.fontWeight.medium, // 500
              }}
            >
              Warning
            </span>

            {/* Error Badge */}
            <span
              style={{
                backgroundColor: "rgba(244, 67, 54, 0.1)",
                color: currentTheme.colors.status.error, // #F44336
                border: "1px solid rgba(244, 67, 54, 0.2)",
                borderRadius: "9999px",
                padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                fontWeight: currentTheme.typography.fontWeight.medium, // 500
              }}
            >
              Error
            </span>

            {/* Info Badge */}
            <span
              style={{
                backgroundColor: "rgba(33, 150, 243, 0.1)",
                color: currentTheme.colors.status.info, // #2196F3
                border: "1px solid rgba(33, 150, 243, 0.2)",
                borderRadius: "9999px",
                padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                fontWeight: currentTheme.typography.fontWeight.medium, // 500
              }}
            >
              Info
            </span>

            {/* Purple Badge */}
            <span
              style={{
                backgroundColor: "rgba(156, 39, 176, 0.1)",
                color: currentTheme.colors.accent.purple, // #9C27B0
                border: "1px solid rgba(156, 39, 176, 0.2)",
                borderRadius: "9999px",
                padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`, // 0.25rem 0.75rem
                fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                fontWeight: currentTheme.typography.fontWeight.medium, // 500
              }}
            >
              Purple
            </span>
          </div>
        </div>

        {/* Cards Section */}
        <div
          style={{
            backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
            border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
            borderRadius: currentTheme.borderRadius.lg, // 0.5rem
            padding: currentTheme.spacing["6"], // 1.5rem
          }}
        >
          <h2
            style={{
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
              marginBottom: currentTheme.spacing["2"], // 0.5rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Cards (순수 JSON 테마)
          </h2>
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["6"], // 1.5rem
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            다양한 스타일의 카드 컴포넌트들입니다.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: currentTheme.spacing["6"], // 1.5rem
            }}
          >
            {/* Basic Card */}
            <div
              style={{
                backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
                border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                borderRadius: currentTheme.borderRadius.lg, // 0.5rem
                padding: currentTheme.spacing["6"], // 1.5rem
                boxShadow: currentTheme.shadows.default,
              }}
            >
              <h3
                style={{
                  fontSize: currentTheme.typography.fontSize.lg, // 1.125rem
                  fontWeight: currentTheme.typography.fontWeight.semibold, // 600
                  color: currentTheme.colors.text.primary, // #FFFFFF
                  marginBottom: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                기본 카드
              </h3>
              <p
                style={{
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  marginBottom: currentTheme.spacing["4"], // 1rem
                }}
              >
                기본적인 카드 레이아웃입니다. 제목과 설명이 포함됩니다.
              </p>
              <button
                style={{
                  backgroundColor: currentTheme.colors.primary.brand, // #5E6AD2
                  color: "#FFFFFF",
                  border: "none",
                  borderRadius: currentTheme.borderRadius.md, // 0.375rem
                  padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 0.5rem 1rem
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  cursor: "pointer",
                  transition: `all ${theme.animation.duration.fast} ${theme.animation.easing.default}`,
                }}
              >
                액션 버튼
              </button>
            </div>

            {/* Elevated Card */}
            <div
              style={{
                backgroundColor: currentTheme.colors.background.elevated, // #2E2F33
                border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                borderRadius: currentTheme.borderRadius.lg, // 0.5rem
                padding: currentTheme.spacing["6"], // 1.5rem
                boxShadow: currentTheme.shadows.lg,
              }}
            >
              <h3
                style={{
                  fontSize: currentTheme.typography.fontSize.lg, // 1.125rem
                  fontWeight: currentTheme.typography.fontWeight.semibold, // 600
                  color: currentTheme.colors.text.primary, // #FFFFFF
                  marginBottom: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                강조 카드
              </h3>
              <p
                style={{
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  marginBottom: currentTheme.spacing["4"], // 1rem
                }}
              >
                더 높은 배경색과 그림자를 가진 강조된 카드입니다.
              </p>
              <div
                style={{
                  display: "flex",
                  gap: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                <span
                  style={{
                    backgroundColor: "rgba(0, 200, 83, 0.1)",
                    color: currentTheme.colors.status.success, // #00C853
                    border: "1px solid rgba(0, 200, 83, 0.2)",
                    borderRadius: "9999px",
                    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`, // 0.25rem 0.5rem
                    fontSize: currentTheme.typography.fontSize.xs, // 0.75rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  }}
                >
                  완료
                </span>
                <span
                  style={{
                    backgroundColor: "rgba(255, 152, 0, 0.1)",
                    color: currentTheme.colors.status.warning, // #FF9800
                    border: "1px solid rgba(255, 152, 0, 0.2)",
                    borderRadius: "9999px",
                    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`, // 0.25rem 0.5rem
                    fontSize: currentTheme.typography.fontSize.xs, // 0.75rem
                    fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  }}
                >
                  진행중
                </span>
              </div>
            </div>

            {/* Glass Effect Card - 테마 적응형 */}
            <div
              style={{
                background: (() => {
                  switch (selectedTheme) {
                    case "light":
                      return "rgba(255, 255, 255, 0.85)";
                    case "pastel":
                      return "rgba(240, 248, 240, 0.85)";
                    case "orange":
                      return "rgba(26, 26, 26, 0.85)";
                    default: // dark
                      return "rgba(26, 27, 30, 0.8)";
                  }
                })(),
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                border: (() => {
                  switch (selectedTheme) {
                    case "light":
                      return "1px solid rgba(218, 220, 224, 0.6)";
                    case "pastel":
                      return "1px solid rgba(168, 230, 207, 0.6)";
                    case "orange":
                      return "1px solid rgba(255, 140, 66, 0.5)";
                    default: // dark
                      return "1px solid rgba(46, 47, 51, 0.5)";
                  }
                })(),
                borderRadius: currentTheme.borderRadius.lg, // 0.5rem
                padding: currentTheme.spacing["6"], // 1.5rem
                boxShadow: (() => {
                  switch (selectedTheme) {
                    case "light":
                      return "0 8px 32px rgba(0, 0, 0, 0.1)";
                    case "pastel":
                      return "0 8px 32px rgba(45, 74, 45, 0.15)";
                    case "orange":
                      return "0 8px 32px rgba(255, 107, 53, 0.2)";
                    default: // dark
                      return currentTheme.shadows.glow;
                  }
                })(),
              }}
            >
              <h3
                style={{
                  fontSize: currentTheme.typography.fontSize.lg, // 1.125rem
                  fontWeight: currentTheme.typography.fontWeight.semibold, // 600
                  color: (() => {
                    switch (selectedTheme) {
                      case "light":
                        return "#1A1A1A"; // 다크 텍스트 (라이트 배경용)
                      case "pastel":
                        return "#1B3B1B"; // 진한 녹색 (파스텔 배경용)
                      default:
                        return currentTheme.colors.text.primary; // 기본값
                    }
                  })(),
                  marginBottom: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                글래스 효과 카드
              </h3>
              <p
                style={{
                  color: (() => {
                    switch (selectedTheme) {
                      case "light":
                        return "#4A4A4A"; // 중간 회색 (라이트 배경용)
                      case "pastel":
                        return "#2D5A2D"; // 중간 녹색 (파스텔 배경용)
                      default:
                        return currentTheme.colors.text.secondary; // 기본값
                    }
                  })(),
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  marginBottom: currentTheme.spacing["4"], // 1rem
                }}
              >
                블러 효과와 반투명성을 가진 모던한 글래스 카드입니다.
              </p>
              <div
                style={{
                  color: (() => {
                    switch (selectedTheme) {
                      case "light":
                        return "#5E6AD2"; // 브랜드 보라색 (라이트 배경에 잘 보임)
                      case "pastel":
                        return "#2D5A2D"; // 진한 녹색 (파스텔 배경에 잘 보임)
                      case "orange":
                        return "#FF6B35"; // 오렌지색 (어두운 배경에 잘 보임)
                      default: // dark
                        return "#A78BFA"; // 밝은 보라색 (다크 배경에 잘 보임)
                    }
                  })(),
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  background: (() => {
                    switch (selectedTheme) {
                      case "light":
                        return "linear-gradient(135deg, rgba(94, 106, 210, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)";
                      case "pastel":
                        return "linear-gradient(135deg, rgba(45, 90, 45, 0.1) 0%, rgba(35, 80, 35, 0.1) 100%)";
                      case "orange":
                        return "linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 140, 66, 0.1) 100%)";
                      default: // dark
                        return "linear-gradient(135deg, rgba(167, 139, 250, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)";
                    }
                  })(),
                  padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`, // 패딩 추가
                  borderRadius: currentTheme.borderRadius.md, // 둥근 모서리
                  border: (() => {
                    switch (selectedTheme) {
                      case "light":
                        return "1px solid rgba(94, 106, 210, 0.2)";
                      case "pastel":
                        return "1px solid rgba(45, 90, 45, 0.2)";
                      case "orange":
                        return "1px solid rgba(255, 107, 53, 0.2)";
                      default: // dark
                        return "1px solid rgba(167, 139, 250, 0.2)";
                    }
                  })(),
                }}
              >
                강조 텍스트 효과
              </div>
            </div>
          </div>
        </div>

        {/* Form Controls Section */}
        <div
          style={{
            backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
            border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
            borderRadius: currentTheme.borderRadius.lg, // 0.5rem
            padding: currentTheme.spacing["6"], // 1.5rem
          }}
        >
          <h2
            style={{
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
              marginBottom: currentTheme.spacing["2"], // 0.5rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Form Controls (순수 JSON 테마)
          </h2>
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["6"], // 1.5rem
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            체크박스, 셀렉트 등의 폼 컨트롤 컴포넌트들입니다.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: currentTheme.spacing["6"], // 1.5rem
            }}
          >
            {/* Checkbox */}
            <div>
              <h3
                style={{
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  marginBottom: currentTheme.spacing["3"], // 0.75rem
                }}
              >
                체크박스
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: currentTheme.spacing["3"], // 0.75rem
                }}
              >
                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: currentTheme.spacing["2"], // 0.5rem
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      accentColor: currentTheme.colors.primary.brand, // #5E6AD2
                    }}
                  />
                  <span
                    style={{
                      fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                      fontWeight: currentTheme.typography.fontWeight.medium, // 500
                      color: currentTheme.colors.text.primary, // #FFFFFF
                    }}
                  >
                    기본 체크박스
                  </span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: currentTheme.spacing["2"], // 0.5rem
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      accentColor: currentTheme.colors.status.success, // #00C853
                    }}
                  />
                  <span
                    style={{
                      fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                      fontWeight: currentTheme.typography.fontWeight.medium, // 500
                      color: currentTheme.colors.text.primary, // #FFFFFF
                    }}
                  >
                    완료된 작업
                  </span>
                </label>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: currentTheme.spacing["2"], // 0.5rem
                    cursor: "pointer",
                    opacity: 0.5,
                  }}
                >
                  <input
                    type="checkbox"
                    disabled
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      accentColor: currentTheme.colors.text.muted, // #666666
                    }}
                  />
                  <span
                    style={{
                      fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                      fontWeight: currentTheme.typography.fontWeight.medium, // 500
                      color: currentTheme.colors.text.muted, // #666666
                    }}
                  >
                    비활성화된 항목
                  </span>
                </label>
              </div>
            </div>

            {/* Select */}
            <div>
              <h3
                style={{
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  marginBottom: currentTheme.spacing["3"], // 0.75rem
                }}
              >
                셀렉트 박스
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: currentTheme.spacing["3"], // 0.75rem
                }}
              >
                <select
                  style={{
                    backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
                    border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`, // 0.5rem 0.75rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    color: currentTheme.colors.text.primary, // #FFFFFF
                    cursor: "pointer",
                  }}
                >
                  <option value="">우선순위 선택</option>
                  <option value="high">높음</option>
                  <option value="medium">보통</option>
                  <option value="low">낮음</option>
                </select>

                <select
                  defaultValue="progress"
                  style={{
                    backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
                    border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["3"]}`, // 0.5rem 0.75rem
                    fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                    color: currentTheme.colors.text.primary, // #FFFFFF
                    cursor: "pointer",
                  }}
                >
                  <option value="todo">할 일</option>
                  <option value="progress">진행중</option>
                  <option value="done">완료</option>
                  <option value="cancelled">취소</option>
                </select>
              </div>
            </div>

            {/* Radio Buttons */}
            <div>
              <h3
                style={{
                  fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                  fontWeight: currentTheme.typography.fontWeight.medium, // 500
                  color: currentTheme.colors.text.secondary, // #B4B4B4
                  marginBottom: currentTheme.spacing["3"], // 0.75rem
                }}
              >
                라디오 버튼
              </h3>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                {["다크 모드", "라이트 모드", "오렌지 테마", "파스텔 테마"].map(
                  (option, index) => (
                    <label
                      key={option}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: currentTheme.spacing["2"], // 0.5rem
                        cursor: "pointer",
                      }}
                    >
                      <input
                        type="radio"
                        name="theme"
                        value={["dark", "light", "orange", "pastel"][index]}
                        checked={
                          selectedTheme ===
                          ["dark", "light", "orange", "pastel"][index]
                        }
                        onChange={(e) => setSelectedTheme(e.target.value)}
                        style={{
                          width: "1rem",
                          height: "1rem",
                          accentColor: currentTheme.colors.primary.brand,
                        }}
                      />
                      <span
                        style={{
                          fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
                          color: currentTheme.colors.text.primary, // #FFFFFF
                        }}
                      >
                        {option}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Color Palette */}
        <div
          style={{
            backgroundColor: currentTheme.colors.background.tertiary, // #1A1B1E
            border: `1px solid ${currentTheme.colors.border.default}`, // #2E2F33
            borderRadius: currentTheme.borderRadius.lg, // 0.5rem
            padding: currentTheme.spacing["6"], // 1.5rem
          }}
        >
          <h2
            style={{
              fontSize: currentTheme.typography.fontSize.xl, // 1.25rem
              fontWeight: currentTheme.typography.fontWeight.semibold, // 600
              marginBottom: currentTheme.spacing["2"], // 0.5rem
              color: currentTheme.colors.text.primary, // #FFFFFF
            }}
          >
            Color Palette (JSON 테마 원본)
          </h2>
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["6"], // 1.5rem
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            JSON 테마 파일에서 직접 가져온 정확한 색상 값들입니다.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: currentTheme.spacing["4"], // 1rem
            }}
          >
            {[
              {
                name: "Brand",
                color: currentTheme.colors.primary.brand,
                category: "Primary",
              },
              {
                name: "Brand Hover",
                color: currentTheme.colors.primary.brandHover,
                category: "Primary",
              },
              {
                name: "Success",
                color: currentTheme.colors.status.success,
                category: "Status",
              },
              {
                name: "Warning",
                color: currentTheme.colors.status.warning,
                category: "Status",
              },
              {
                name: "Error",
                color: currentTheme.colors.status.error,
                category: "Status",
              },
              {
                name: "Info",
                color: currentTheme.colors.status.info,
                category: "Status",
              },
              {
                name: "Purple",
                color: currentTheme.colors.accent.purple,
                category: "Accent",
              },
              {
                name: "Text Primary",
                color: currentTheme.colors.text.primary,
                category: "Text",
              },
              {
                name: "Text Secondary",
                color: currentTheme.colors.text.secondary,
                category: "Text",
              },
              {
                name: "Background Tertiary",
                color: currentTheme.colors.background.tertiary,
                category: "Background",
              },
            ].map((item) => (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: currentTheme.spacing["2"], // 0.5rem
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: "4rem",
                    backgroundColor: item.color,
                    borderRadius: currentTheme.borderRadius.md, // 0.375rem
                    border: `1px solid ${currentTheme.colors.border.muted}`, // #1A1B1E
                  }}
                />
                <div style={{ fontSize: currentTheme.typography.fontSize.xs }}>
                  <div
                    style={{
                      fontWeight: currentTheme.typography.fontWeight.medium, // 500
                      color: currentTheme.colors.text.primary, // #FFFFFF
                    }}
                  >
                    {item.name}
                  </div>
                  <div style={{ color: currentTheme.colors.text.muted }}>
                    {item.color}
                  </div>
                  <div style={{ color: currentTheme.colors.text.tertiary }}>
                    {item.category}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <footer
          style={{
            textAlign: "center",
            padding: `${currentTheme.spacing["8"]} 0`, // 2rem 0
            borderTop: `1px solid ${currentTheme.colors.border.muted}`, // #1A1B1E
          }}
        >
          <p
            style={{
              color: currentTheme.colors.text.secondary, // #B4B4B4
              marginBottom: currentTheme.spacing["2"], // 0.5rem
            }}
          >
            ✅ JSON 테마가 100% 정확히 적용된 데모입니다.
          </p>
          <p
            style={{
              color: currentTheme.colors.text.muted, // #666666
              fontSize: currentTheme.typography.fontSize.sm, // 0.875rem
            }}
          >
            Linear App Theme v1.0.0 - 순수 JSON 값 직접 적용
          </p>
        </footer>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
