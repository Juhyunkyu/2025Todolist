"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Input } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onSettingsClick }) => {
  const { currentTheme, selectedTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [windowWidth, setWindowWidth] = useState(1024);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // 화면 크기 감지
  React.useEffect(() => {
    const checkScreenSize = () => {
      setWindowWidth(window.innerWidth);
      setIsLargeScreen(window.innerWidth > 1200); // page.tsx와 동일한 기준
      // 데스크톱으로 변경되면 모바일 검색창 숨기기
      if (window.innerWidth >= 768) {
        setShowMobileSearch(false);
      }
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSearch?.(searchQuery);
    },
    [searchQuery, onSearch]
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const query = e.target.value;
      setSearchQuery(query);
      if (query.trim() === "") {
        onSearch?.("");
      }
    },
    [onSearch]
  );

  // 모바일 검색 토글 핸들러
  const handleMobileSearchToggle = useCallback(() => {
    setShowMobileSearch(!showMobileSearch);
    if (!showMobileSearch) {
      // 검색창이 열릴 때 포커스
      setTimeout(() => {
        const searchInput = document.querySelector(
          'input[type="search"]'
        ) as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 100);
    }
  }, [showMobileSearch]);

  // 다크모드 감지 (메모이제이션)
  const isDarkMode = useMemo(
    () => selectedTheme === "dark" || selectedTheme === "gray-dark",
    [selectedTheme]
  );

  // 로고 크기 계산 (메모이제이션) - 화면이 클 때 로고가 더 크게
  const logoSize = useMemo(() => {
    if (windowWidth < 480) return "60px"; // 모바일 - 더 크게
    if (windowWidth < 768) return "70px"; // 태블릿 - 더 크게
    if (windowWidth < 1024) return "80px"; // 작은 데스크톱 - 더 크게
    if (windowWidth < 1440) return "90px"; // 중간 데스크톱 - 더 크게
    return "100px"; // 큰 데스크톱 - 더 크게
  }, [windowWidth]);

  // 스타일 객체들 메모이제이션
  const headerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: `${currentTheme.spacing["2"]} 0`, // 여백 제거 - 상위 컨테이너에서 관리
      backgroundColor: currentTheme.colors.background.primary,
      position: "sticky",
      top: 0,
      zIndex: 100,
    }),
    [currentTheme.spacing, currentTheme.colors.background.primary]
  );

  const logoContainerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: currentTheme.spacing["2"],
      cursor: "pointer",
    }),
    [currentTheme.spacing]
  );

  const logoMarkStyles: React.CSSProperties = useMemo(
    () => ({
      position: "relative" as const,
      width: logoSize,
      height: logoSize,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    }),
    [
      logoSize,
      currentTheme.animation.duration.fast,
      currentTheme.animation.easing.default,
    ]
  );

  const searchContainerStyles: React.CSSProperties = useMemo(
    () => ({
      flex: 1,
      maxWidth: windowWidth < 768 ? "100%" : "400px", // 모바일에서는 더 짧게
      margin: `0 ${currentTheme.spacing["4"]}`,
      display: windowWidth < 768 && !showMobileSearch ? "none" : "block",
    }),
    [currentTheme.spacing, windowWidth, showMobileSearch]
  );

  const actionsStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["1"], // 더 작은 간격으로 변경
      alignItems: "center",
    }),
    [currentTheme.spacing]
  );

  const logoImageStyles: React.CSSProperties = useMemo(
    () => ({
      width: logoSize,
      height: logoSize,
      objectFit: "contain" as const,
      filter: isDarkMode ? "brightness(0) invert(1)" : "none",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    }),
    [
      logoSize,
      isDarkMode,
      currentTheme.animation.duration.fast,
      currentTheme.animation.easing.default,
    ]
  );

  const settingsButtonStyles: React.CSSProperties = useMemo(
    () => ({
      minWidth: "48px",
      height: "48px",
      padding: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "20px",
      borderRadius: currentTheme.borderRadius.md,
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    }),
    [
      currentTheme.borderRadius.md,
      currentTheme.animation.duration.fast,
      currentTheme.animation.easing.default,
    ]
  );

  // 설정 아이콘 SVG 컴포넌트
  const SettingsIcon = useMemo(
    () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          color: currentTheme.colors.text.primary,
        }}
      >
        {/* 설정 톱니바퀴 */}
        <circle
          cx="12"
          cy="12"
          r="3"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
      </svg>
    ),
    [currentTheme.colors.text.primary]
  );

  // 돋보기 아이콘 SVG 컴포넌트
  const SearchIcon = useMemo(
    () => (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          color: currentTheme.colors.text.primary,
        }}
      >
        <circle
          cx="11"
          cy="11"
          r="8"
          stroke="currentColor"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="m21 21-4.35-4.35"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
    [currentTheme.colors.text.primary]
  );

  return (
    <header style={headerStyles}>
      {/* 로고 */}
      <div style={logoContainerStyles}>
        <div style={logoMarkStyles}>
          <img src="/todo-logo-q.png" alt="Todo 로고" style={logoImageStyles} />
        </div>
      </div>

      {/* 검색 */}
      <div style={searchContainerStyles}>
        <form onSubmit={handleSearch}>
          <Input
            type="search"
            placeholder="태그, 제목, 날짜로 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{ width: "100%" }}
          />
        </form>
      </div>

      {/* 설정 */}
      <div style={actionsStyles}>
        {/* 모바일에서만 돋보기 아이콘 표시 */}
        {windowWidth < 768 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleMobileSearchToggle}
            style={settingsButtonStyles}
          >
            {SearchIcon}
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          style={settingsButtonStyles}
        >
          {SettingsIcon}
        </Button>
      </div>
    </header>
  );
};

export default Header;
