"use client";

import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useTheme } from "@/contexts/ThemeContext";

// 타입 정의
type FilterType = "all" | "today" | "tomorrow" | "week" | "defaultGroup";

interface FilterInfo {
  key: FilterType;
  label: string;
  ariaLabel: string;
}

interface FilterCounts {
  all: number;
  today: number;
  tomorrow: number;
  week: number;
  defaultGroup: number;
}

interface TodoFiltersProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  onAddGroup?: () => void;
  counts: FilterCounts;
  /** 필터 컨테이너의 ID (접근성을 위해 필요) */
  containerId?: string;
}

// 필터 정보 상수
const FILTERS: FilterInfo[] = [
  { key: "all", label: "All", ariaLabel: "모든 할일" },
  { key: "today", label: "오늘", ariaLabel: "오늘 할일" },
  { key: "tomorrow", label: "내일", ariaLabel: "내일 할일" },
  { key: "week", label: "7일", ariaLabel: "7일 내 할일" },
  { key: "defaultGroup", label: "기본그룹", ariaLabel: "기본그룹 할일" },
] as const;

// 스크롤 관련 커스텀 훅
const useScrollNavigation = (
  scrollContainerRef: React.RefObject<HTMLDivElement | null>
) => {
  const [showRightIndicator, setShowRightIndicator] = useState(false);
  const [showLeftIndicator, setShowLeftIndicator] = useState(false);

  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = scrollWidth - clientWidth;

    setShowLeftIndicator(scrollLeft > 0);
    setShowRightIndicator(scrollLeft < maxScrollLeft - 1);
  }, [scrollContainerRef]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    checkScrollPosition();
    container.addEventListener("scroll", checkScrollPosition);

    return () => {
      container.removeEventListener("scroll", checkScrollPosition);
    };
  }, [checkScrollPosition]);

  const scrollToDirection = useCallback(
    (direction: "left" | "right") => {
      if (!scrollContainerRef.current) return;

      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.8;
      const currentScrollLeft = container.scrollLeft;
      const maxScrollLeft = container.scrollWidth - container.clientWidth;

      const newScrollLeft =
        direction === "left"
          ? Math.max(0, currentScrollLeft - scrollAmount)
          : Math.min(maxScrollLeft, currentScrollLeft + scrollAmount);

      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      });
    },
    [scrollContainerRef]
  );

  return {
    showLeftIndicator,
    showRightIndicator,
    scrollToDirection,
  };
};

const TodoFilters: React.FC<TodoFiltersProps> = ({
  activeFilter,
  onFilterChange,
  onAddGroup,
  counts,
  containerId = "todo-filters",
}) => {
  const { currentTheme } = useTheme();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { showLeftIndicator, showRightIndicator, scrollToDirection } =
    useScrollNavigation(scrollContainerRef);

  // 필터 데이터 메모이제이션
  const filters = useMemo(
    () =>
      FILTERS.map((filter) => ({
        ...filter,
        count: counts[filter.key],
      })),
    [counts]
  );

  // 컨테이너 스타일 메모이제이션
  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["1"],
      padding: `${currentTheme.spacing["0"]} 0`,
      backgroundColor: currentTheme.colors.background.primary,
      overflowX: "auto",
      scrollbarWidth: "none",
      msOverflowStyle: "none",
      WebkitOverflowScrolling: "touch",
      position: "relative",
      marginTop: "0",
    }),
    [currentTheme.spacing, currentTheme.colors.background.primary]
  );

  // 필터 버튼 스타일 메모이제이션
  const getFilterButtonStyles = useCallback(
    (isActive: boolean): React.CSSProperties => ({
      display: "flex",
      alignItems: "center",
      gap: currentTheme.spacing["1"],
      padding: `${currentTheme.spacing["0"]} ${currentTheme.spacing["2"]}`,
      backgroundColor: isActive
        ? currentTheme.colors.primary.brand
        : "transparent",
      color: isActive
        ? currentTheme.colors.text.inverse
        : currentTheme.colors.text.primary,
      border: "none",
      borderRadius: currentTheme.borderRadius.md,
      fontSize: currentTheme.typography.fontSize.base,
      fontWeight: isActive
        ? currentTheme.typography.fontWeight.medium
        : currentTheme.typography.fontWeight.normal,
      cursor: "pointer",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      whiteSpace: "nowrap",
      position: "relative",
      flexShrink: 0,
      height: "32px",
    }),
    [currentTheme]
  );

  // 배지 스타일 메모이제이션
  const getBadgeStyles = useCallback(
    (isActive: boolean): React.CSSProperties => ({
      backgroundColor: isActive
        ? currentTheme.colors.text.inverse
        : currentTheme.colors.background.primary,
      color: isActive
        ? currentTheme.colors.primary.brand
        : currentTheme.colors.text.primary,
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.semibold,
      padding: `${currentTheme.spacing["0"]} ${currentTheme.spacing["1"]}`,
      borderRadius: currentTheme.borderRadius.full,
      minWidth: "16px",
      height: "16px",
      textAlign: "center",
      border: `1px solid ${
        isActive
          ? currentTheme.colors.primary.brand
          : currentTheme.colors.border.default
      }`,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      lineHeight: "1",
    }),
    [currentTheme]
  );

  // 추가 그룹 버튼 스타일 메모이제이션
  const addGroupButtonStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: `${currentTheme.spacing["0"]} ${currentTheme.spacing["2"]}`,
      backgroundColor: currentTheme.colors.background.secondary,
      color: currentTheme.colors.text.primary,
      border: `1px solid ${currentTheme.colors.border.default}`,
      borderRadius: currentTheme.borderRadius.md,
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
      cursor: "pointer",
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      minWidth: "32px",
      height: "32px",
      flexShrink: 0,
    }),
    [currentTheme]
  );

  // 스크롤 인디케이터 스타일 메모이제이션
  const getIndicatorStyles = useCallback(
    (direction: "left" | "right", isVisible: boolean): React.CSSProperties => ({
      position: "absolute",
      [direction]: 0,
      top: 0,
      bottom: 0,
      width: "40px",
      background: `linear-gradient(to ${
        direction === "left" ? "left" : "right"
      }, transparent, ${currentTheme.colors.background.primary} 70%)`,
      cursor: "pointer",
      opacity: isVisible ? 1 : 0,
      transition: `opacity ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      zIndex: 1,
    }),
    [currentTheme]
  );

  // 필터 클릭 핸들러 메모이제이션
  const handleFilterClick = useCallback(
    (filterKey: FilterType) => {
      onFilterChange(filterKey);

      // 다음 tick에서 스크롤 실행
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
    (e: React.KeyboardEvent, filterKey: FilterType) => {
      switch (e.key) {
        case "Enter":
        case " ":
          e.preventDefault();
          handleFilterClick(filterKey);
          break;
        case "ArrowRight":
          e.preventDefault();
          const currentIndex = filters.findIndex((f) => f.key === activeFilter);
          const nextIndex = (currentIndex + 1) % filters.length;
          handleFilterClick(filters[nextIndex].key);
          break;
        case "ArrowLeft":
          e.preventDefault();
          const prevCurrentIndex = filters.findIndex(
            (f) => f.key === activeFilter
          );
          const prevIndex =
            prevCurrentIndex === 0 ? filters.length - 1 : prevCurrentIndex - 1;
          handleFilterClick(filters[prevIndex].key);
          break;
      }
    },
    [activeFilter, filters, handleFilterClick]
  );

  // 스크롤 인디케이터 클릭 핸들러
  const handleScrollLeft = useCallback(() => {
    scrollToDirection("left");
  }, [scrollToDirection]);

  const handleScrollRight = useCallback(() => {
    scrollToDirection("right");
  }, [scrollToDirection]);

  return (
    <div style={{ position: "relative" }}>
      {/* 왼쪽 스크롤 인디케이터 */}
      {showLeftIndicator && (
        <div
          style={getIndicatorStyles("left", showLeftIndicator)}
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
          style={getIndicatorStyles("right", showRightIndicator)}
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
        role="tablist"
        aria-label="할일 필터"
        id={containerId}
      >
        {filters.map((filter, index) => {
          const isActive = activeFilter === filter.key;
          const filterId = `${containerId}-${filter.key}`;

          return (
            <button
              key={filter.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`${filter.key}-panel`}
              aria-label={`${filter.ariaLabel} (${filter.count}개 항목)`}
              id={filterId}
              tabIndex={isActive ? 0 : -1}
              style={{
                ...getFilterButtonStyles(isActive),
                paddingLeft:
                  index === 0
                    ? currentTheme.spacing["4"]
                    : currentTheme.spacing["2"],
              }}
              onClick={() => handleFilterClick(filter.key)}
              onKeyDown={(e) => handleKeyDown(e, filter.key)}
            >
              {filter.label}
              <span style={getBadgeStyles(isActive)}>{filter.count}</span>
            </button>
          );
        })}

        {/* 그룹 추가 버튼 */}
        {onAddGroup && (
          <button
            style={addGroupButtonStyles}
            onClick={onAddGroup}
            title="그룹 추가"
            aria-label="새 그룹 추가"
            tabIndex={0}
          >
            +
          </button>
        )}
      </div>
    </div>
  );
};

export default TodoFilters;
