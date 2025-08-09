"use client";

import React from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface TabNavigationProps {
  activeTab: "todo" | "note";
  onTabChange: (tab: "todo" | "note") => void;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { currentTheme } = useTheme();

  const containerStyles: React.CSSProperties = {
    display: "flex",
    borderBottom: `1px solid ${currentTheme.colors.border.default}`,
    backgroundColor: currentTheme.colors.background.primary,
    padding: `0 0 0 ${currentTheme.spacing["4"]}`, // 왼쪽 여백만 유지
    marginTop: "0", // 위쪽 간격 제거
  };

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: `${currentTheme.spacing["0"]} ${currentTheme.spacing["4"]}`, // 위아래 패딩 최소화
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
      : `1px solid ${currentTheme.colors.border.default}`, // 비활성 탭의 밑줄을 더 얇게
    outline: "none",
    position: "relative",
    boxSizing: "border-box",
    height: "40px", // 고정 높이로 더 컴팩트하게
    display: "flex",
    alignItems: "center",
  });

  return (
    <nav style={containerStyles}>
      <button
        style={tabStyles(activeTab === "todo")}
        onClick={() => onTabChange("todo")}
      >
        Todo
      </button>
      <button
        style={tabStyles(activeTab === "note")}
        onClick={() => onTabChange("note")}
      >
        Note
      </button>
    </nav>
  );
};

export default TabNavigation;
