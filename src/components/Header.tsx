"use client";

import React, { useState, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface HeaderProps {
  onSearch?: (query: string) => void;
  onSettingsClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onSearch, onSettingsClick }) => {
  const { currentTheme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");

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

  const headerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: `${currentTheme.spacing["2"]} 0 ${currentTheme.spacing["2"]} ${currentTheme.spacing["4"]}`, // 위아래 패딩을 더 작게
    backgroundColor: currentTheme.colors.background.primary,
    position: "sticky",
    top: 0,
    zIndex: 100,
  };

  const logoStyles: React.CSSProperties = {
    fontSize: currentTheme.typography.fontSize["2xl"],
    fontWeight: currentTheme.typography.fontWeight.bold,
    color: currentTheme.colors.primary.brand,
    cursor: "pointer",
  };

  const searchContainerStyles: React.CSSProperties = {
    flex: 1,
    maxWidth: "600px", // 400px에서 600px로 증가하여 큰 화면에서 더 균형잡힌 레이아웃
    margin: `0 ${currentTheme.spacing["4"]}`, // margin을 spacing["4"]로 줄임
  };

  const actionsStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    alignItems: "center",
  };

  return (
    <header style={headerStyles}>
      {/* 로고 */}
      <div style={logoStyles}>Todo</div>

      {/* 검색 */}
      <div style={searchContainerStyles}>
        <form onSubmit={handleSearch}>
          <Input
            type="search"
            placeholder="태그, 제목, 날짜로 검색..."
            value={searchQuery}
            onChange={handleSearchChange}
            style={{
              width: "100%",
            }}
          />
        </form>
      </div>

      {/* 설정 */}
      <div style={actionsStyles}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onSettingsClick}
          style={{
            minWidth: "40px",
            height: "40px",
            padding: "0",
          }}
        >
          ⚙️
        </Button>
      </div>
    </header>
  );
};

export default Header;
