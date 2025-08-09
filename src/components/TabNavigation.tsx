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
    backgroundColor: currentTheme.colors.background.primary,
    borderBottom: `1px solid ${currentTheme.colors.border.default}`,
  };

  const tabStyles = (isActive: boolean): React.CSSProperties => ({
    flex: 1,
    padding: `${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`,
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
      : "2px solid transparent",
    outline: "none",
    position: "relative",
    boxSizing: "border-box",
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
