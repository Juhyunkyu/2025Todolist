"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useTheme } from "@/contexts/ThemeContext";

interface TodoFiltersProps {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  onAddGroup?: () => void;
  counts: {
    all: number;
    today: number;
    tomorrow: number;
    week: number;
    defaultGroup: number;
  };
}

const TodoFilters: React.FC<TodoFiltersProps> = ({
  activeFilter,
  onFilterChange,
  onAddGroup,
  counts,
}) => {
  const { currentTheme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);

  const filters = useMemo(
    () => [
      { key: "all", label: "All", count: counts.all },
      { key: "today", label: "오늘", count: counts.today },
      { key: "tomorrow", label: "내일", count: counts.tomorrow },
      { key: "week", label: "7일", count: counts.week },
      { key: "defaultGroup", label: "기본그룹", count: counts.defaultGroup },
    ],
    [counts]
  );

  // 스크롤 위치 확인 함수
  const checkScrollPosition = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    const maxScrollLeft = scrollWidth - clientWidth;

    setShowLeftIndicator(scrollLeft > 0);
    setShowRightIndicator(scrollLeft < maxScrollLeft - 1); // 1px 오차 허용
  }, []);

  // 스크롤 이벤트 리스너
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  // 텝 클릭 시 자동 스크롤 함수
  const handleTabClick = useCallback(
    (filterKey: string) => {
      onFilterChange(filterKey);

      // 다음 tick에서 스크롤 실행 (DOM 업데이트 후)
      setTimeout(() => {
        const container = scrollContainerRef.current;
        if (!container) return;

        const buttons = container.querySelectorAll("button");
        const targetButton = Array.from(buttons).find((button) => {
          const text = button.textContent || "";
          const filter = filters.find((f) => f.key === filterKey);
          return filter && text.includes(filter.label);
        });

        if (targetButton) {
          targetButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }
      }, 0);
    },
    [onFilterChange, filters]
  );

  // 키보드 네비게이션 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, filterKey: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleTabClick(filterKey);
      }
    },
    [handleTabClick]
  );

  // 스크롤 인디케이터 클릭 핸들러
  const handleScrollLeft = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // 화면 너비의 80%만큼 스크롤

    container.scrollTo({
      left: Math.max(0, container.scrollLeft - scrollAmount),
      behavior: "smooth",
    });
  }, []);

  const handleScrollRight = useCallback(() => {
    if (!scrollContainerRef.current) return;

    const container = scrollContainerRef.current;
    const scrollAmount = container.clientWidth * 0.8; // 화면 너비의 80%만큼 스크롤
    const maxScrollLeft = container.scrollWidth - container.clientWidth;

    container.scrollTo({
      left: Math.min(maxScrollLeft, container.scrollLeft + scrollAmount),
      behavior: "smooth",
    });
  }, []);

  const containerStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`, // 왼쪽 여백을 spacing["4"]에서 spacing["2"]로 줄임
    backgroundColor: currentTheme.colors.background.primary,
    overflowX: "auto",
    scrollbarWidth: "none", // Firefox
    msOverflowStyle: "none", // IE/Edge
    WebkitOverflowScrolling: "touch", // iOS smooth scrolling
    position: "relative", // 인디케이터 위치를 위해
  };

  const filterButtonStyles = (isActive: boolean): React.CSSProperties => ({
    display: "flex",
    alignItems: "center",
    gap: currentTheme.spacing["2"],
    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`,
    backgroundColor: isActive
      ? currentTheme.colors.primary.brand
      : "transparent",
    color: isActive
      ? currentTheme.colors.text.inverse
      : currentTheme.colors.text.primary,
    border: "none",
    borderRadius: currentTheme.borderRadius.md,
    fontSize: currentTheme.typography.fontSize.sm,
    fontWeight: isActive
      ? currentTheme.typography.fontWeight.semibold
      : currentTheme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    whiteSpace: "nowrap",
    position: "relative",
    flexShrink: 0, // 버튼이 축소되지 않도록 설정
  });

  const badgeStyles = (isActive: boolean): React.CSSProperties => ({
    backgroundColor: isActive
      ? currentTheme.colors.text.inverse
      : currentTheme.colors.background.primary,
    color: isActive
      ? currentTheme.colors.primary.brand
      : currentTheme.colors.text.primary,
    fontSize: currentTheme.typography.fontSize.xs,
    fontWeight: currentTheme.typography.fontWeight.semibold,
    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`,
    borderRadius: currentTheme.borderRadius.full,
    minWidth: "20px",
    textAlign: "center",
  });

  const addGroupButtonStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["3"]}`,
    backgroundColor: currentTheme.colors.background.secondary,
    color: currentTheme.colors.text.primary,
    border: `1px solid ${currentTheme.colors.border.default}`,
    borderRadius: currentTheme.borderRadius.md,
    fontSize: currentTheme.typography.fontSize.sm,
    fontWeight: currentTheme.typography.fontWeight.medium,
    cursor: "pointer",
    transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    minWidth: "40px",
    flexShrink: 0, // + 버튼이 축소되지 않도록 설정
  };

  // 스크롤 인디케이터 스타일
  const rightIndicatorStyles: React.CSSProperties = {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: "40px",
    background: `linear-gradient(to right, transparent, ${currentTheme.colors.background.primary} 70%)`,
    cursor: "pointer",
    opacity: showRightIndicator ? 1 : 0,
    transition: `opacity ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    zIndex: 1,
  };

  const leftIndicatorStyles: React.CSSProperties = {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: "40px",
    background: `linear-gradient(to left, transparent, ${currentTheme.colors.background.primary} 70%)`,
    cursor: "pointer",
    opacity: showLeftIndicator ? 1 : 0,
    transition: `opacity ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    zIndex: 1,
  };

  return (
    <div style={{ position: "relative" }}>
      {/* 왼쪽 스크롤 인디케이터 */}
      {showLeftIndicator && (
        <div
          style={leftIndicatorStyles}
          onClick={handleScrollLeft}
          role="button"
          tabIndex={0}
          aria-label="왼쪽으로 스크롤"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleScrollLeft();
            }
          }}
        />
      )}

      {/* 오른쪽 스크롤 인디케이터 */}
      {showRightIndicator && (
        <div
          style={rightIndicatorStyles}
          onClick={handleScrollRight}
          role="button"
          tabIndex={0}
          aria-label="오른쪽으로 스크롤"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleScrollRight();
            }
          }}
        />
      )}

      <div
        ref={scrollContainerRef}
        style={containerStyles}
        className="todo-filters-scroll"
      >
        {filters.map((filter) => (
          <button
            key={filter.key}
            style={filterButtonStyles(activeFilter === filter.key)}
            onClick={() => handleTabClick(filter.key)}
            onKeyDown={(e) => handleKeyDown(e, filter.key)}
            tabIndex={0}
            role="tab"
            aria-selected={activeFilter === filter.key}
            aria-label={`${filter.label} 필터 (${filter.count}개 항목)`}
          >
            {filter.label}
            <span style={badgeStyles(activeFilter === filter.key)}>
              {filter.count}
            </span>
          </button>
        ))}

        {/* 기본그룹 옆에 + 버튼 */}
        <button
          style={addGroupButtonStyles}
          onClick={onAddGroup}
          title="그룹 추가"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default TodoFilters;
