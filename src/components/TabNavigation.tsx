"use client";

import React, { useMemo, useCallback } from "react";
import { useTheme } from "@/contexts/ThemeContext";

// 탭 타입 정의
type TabType = "todo" | "note";

// 탭 정보 인터페이스
interface TabInfo {
  id: TabType;
  label: string;
  ariaLabel: string;
}

// 탭 정보 상수
const TABS: TabInfo[] = [
  {
    id: "todo",
    label: "Todo",
    ariaLabel: "할일 목록 탭",
  },
  {
    id: "note",
    label: "Note",
    ariaLabel: "노트 탭",
  },
] as const;

interface TabNavigationProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  /** 탭 컨테이너의 ID (접근성을 위해 필요) */
  containerId?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
  containerId = "tab-navigation",
}) => {
  const { currentTheme } = useTheme();

  // 컨테이너 스타일 메모이제이션
  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      borderBottom: `1px solid ${currentTheme.colors.border.default}`,
      backgroundColor: currentTheme.colors.background.primary,
      padding: "0", // 여백 제거 - 상위 컨테이너에서 관리
      marginTop: "0",
    }),
    [currentTheme.colors.border.default, currentTheme.colors.background.primary]
  );

  // 탭 스타일 생성 함수 메모이제이션
  const getTabStyles = useCallback(
    (isActive: boolean): React.CSSProperties => ({
      flex: 1,
      padding: `${currentTheme.spacing["0"]} ${currentTheme.spacing["4"]}`,
      backgroundColor: "transparent",
      color: isActive
        ? currentTheme.colors.primary.brand
        : currentTheme.colors.text.secondary,
      fontSize: currentTheme.typography.fontSize.base,
      fontWeight: isActive
        ? currentTheme.typography.fontWeight.semibold
        : currentTheme.typography.fontWeight.medium,
      cursor: "pointer",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      border: "none",
      borderBottom: isActive
        ? `2px solid ${currentTheme.colors.primary.brand}`
        : `1px solid ${currentTheme.colors.border.default}`,
      outline: "none",
      position: "relative" as const,
      boxSizing: "border-box" as const,
      height: "40px",
      display: "flex",
      alignItems: "center",
    }),
    [currentTheme]
  );

  // 탭 변경 핸들러 메모이제이션
  const handleTabChange = useCallback(
    (tabId: TabType) => {
      onTabChange(tabId);
    },
    [onTabChange]
  );

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, tabId: TabType) => {
      switch (event.key) {
        case "Enter":
        case " ":
          event.preventDefault();
          handleTabChange(tabId);
          break;
        case "ArrowRight":
          event.preventDefault();
          const currentIndex = TABS.findIndex((tab) => tab.id === activeTab);
          const nextIndex = (currentIndex + 1) % TABS.length;
          handleTabChange(TABS[nextIndex].id);
          break;
        case "ArrowLeft":
          event.preventDefault();
          const prevCurrentIndex = TABS.findIndex(
            (tab) => tab.id === activeTab
          );
          const prevIndex =
            prevCurrentIndex === 0 ? TABS.length - 1 : prevCurrentIndex - 1;
          handleTabChange(TABS[prevIndex].id);
          break;
      }
    },
    [activeTab, handleTabChange]
  );

  return (
    <nav
      role="tablist"
      aria-label="탭 네비게이션"
      style={containerStyles}
      id={containerId}
    >
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        const tabId = `${containerId}-${tab.id}`;

        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`${tab.id}-panel`}
            aria-label={tab.ariaLabel}
            id={tabId}
            tabIndex={isActive ? 0 : -1}
            style={getTabStyles(isActive)}
            onClick={() => handleTabChange(tab.id)}
            onKeyDown={(e) => handleKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
};

export default TabNavigation;
