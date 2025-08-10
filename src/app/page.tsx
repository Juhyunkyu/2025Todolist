"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import TodoFilters from "@/components/TodoFilters";
import AddTodo from "@/components/AddTodo";
import HierarchicalTodoList from "@/components/HierarchicalTodoList";
import type { HierarchicalTodo } from "@/components/HierarchicalTodoItem";
import {
  getHierarchicalTodosByParent,
  addHierarchicalTodo,
  getHierarchicalTodoProgress,
} from "@/lib/db";

// 타입 정의
type FilterType = "all" | "today" | "tomorrow" | "week" | "defaultGroup";
type TabType = "todo" | "note";

// 상수 정의
const CONSTANTS = {
  LARGE_SCREEN_BREAKPOINT: 1200,
  LARGE_SCREEN_MAX_WIDTH: "1800px",
  DEFAULT_MAX_WIDTH: "1600px",
  ADD_BUTTON_SIZE: 56,
  WEEK_DAYS: 7,
} as const;

// 날짜 유틸리티 함수들
const dateUtils = {
  getTodayDate: (): string => new Date().toISOString().split("T")[0],

  getTomorrowDate: (): string => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  },

  getWeekFromNowDate: (): string => {
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + CONSTANTS.WEEK_DAYS);
    return weekFromNow.toISOString().split("T")[0];
  },

  isDateInWeekRange: (date: string): boolean => {
    const todoDate = new Date(date);
    const now = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(now.getDate() + CONSTANTS.WEEK_DAYS);
    return todoDate >= now && todoDate <= weekFromNow;
  },

  isDateToday: (date: string): boolean => date === dateUtils.getTodayDate(),
  isDateTomorrow: (date: string): boolean =>
    date === dateUtils.getTomorrowDate(),
} as const;

// 에러 타입 정의
interface ErrorState {
  hasError: boolean;
  message: string;
}

// 내부 컴포넌트 - useTheme 사용
function HomeContent() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("todo");
  const [activeFilter, setActiveFilter] = useState<FilterType>("all");
  const [todos, setTodos] = useState<HierarchicalTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLargeScreen, setIsLargeScreen] = useState(false);
  const [error, setError] = useState<ErrorState>({
    hasError: false,
    message: "",
  });

  // 화면 크기 감지
  useEffect(() => {
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth > CONSTANTS.LARGE_SCREEN_BREAKPOINT);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 할일 목록 로드
  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      setError({ hasError: false, message: "" });
      const rootTodos = await getHierarchicalTodosByParent();
      setTodos(rootTodos);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "할일 목록을 불러오는데 실패했습니다.";
      setError({ hasError: true, message: errorMessage });
      console.error("Failed to load todos:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadTodos();
  }, [loadTodos]);

  // 필터링된 할일 목록 계산
  const filteredAndSearchedTodos = useMemo(() => {
    let filtered = todos;

    // 검색 필터링
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (todo) =>
          todo.title.toLowerCase().includes(query) ||
          todo.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          todo.date.includes(query)
      );
    }

    // 필터별 필터링
    switch (activeFilter) {
      case "today":
        filtered = filtered.filter((todo) => dateUtils.isDateToday(todo.date));
        break;
      case "tomorrow":
        filtered = filtered.filter((todo) =>
          dateUtils.isDateTomorrow(todo.date)
        );
        break;
      case "week":
        filtered = filtered.filter((todo) =>
          dateUtils.isDateInWeekRange(todo.date)
        );
        break;
      case "defaultGroup":
        filtered = filtered.filter(
          (todo) => !todo.tags.length || todo.tags.includes("기본그룹")
        );
        break;
      default:
        // "all" - 모든 할일 표시
        break;
    }

    return filtered;
  }, [todos, activeFilter, searchQuery]);

  // 할일 추가
  const handleAddTodo = useCallback(
    async (todoData: {
      title: string;
      date: string;
      alarmTime?: string;
      isPinned?: boolean;
    }) => {
      try {
        const nextOrder = todos.length;
        await addHierarchicalTodo({
          title: todoData.title,
          isDone: false,
          isExpanded: false,
          order: nextOrder,
          tags: todoData.isPinned ? ["상단고정"] : [],
          date: todoData.date,
          repeat: "none",
          alarmTime: todoData.alarmTime,
        });

        setShowAddTodo(false);
        await loadTodos();
      } catch (error) {
        console.error("Failed to add todo:", error);
      }
    },
    [todos.length, loadTodos]
  );

  // 검색 처리
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  // 필터 변경
  const handleFilterChange = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  // 그룹 추가
  const handleAddGroup = useCallback(() => {
    // TODO: 그룹 추가 기능 구현
    console.log("Add group clicked");
    // 임시로 알림 표시
    alert("그룹 추가 기능은 곧 구현될 예정입니다.");
  }, []);

  // 설정 클릭 (나중에 구현)
  const handleSettingsClick = useCallback(() => {
    // TODO: 설정 페이지로 이동
    console.log("Settings clicked");
  }, []);

  // 카운트 계산
  const counts = useMemo(() => {
    return {
      all: todos.length,
      today: todos.filter((todo) => dateUtils.isDateToday(todo.date)).length,
      tomorrow: todos.filter((todo) => dateUtils.isDateTomorrow(todo.date))
        .length,
      week: todos.filter((todo) => dateUtils.isDateInWeekRange(todo.date))
        .length,
      defaultGroup: todos.filter(
        (todo) => !todo.tags.length || todo.tags.includes("기본그룹")
      ).length,
    };
  }, [todos]);

  // 할일 추가 버튼 클릭
  const handleAddTodoClick = useCallback(() => {
    setShowAddTodo(true);
  }, []);

  // 스타일 객체들 최적화
  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      minHeight: "100vh",
      backgroundColor: currentTheme.colors.background.primary,
      color: currentTheme.colors.text.primary,
    }),
    [currentTheme.colors.background.primary, currentTheme.colors.text.primary]
  );

  const mainStyles: React.CSSProperties = useMemo(
    () => ({
      maxWidth: isLargeScreen
        ? CONSTANTS.LARGE_SCREEN_MAX_WIDTH
        : CONSTANTS.DEFAULT_MAX_WIDTH,
      margin: "0 auto",
      padding: `0 ${
        isLargeScreen ? currentTheme.spacing["8"] : currentTheme.spacing["4"]
      }`,
    }),
    [isLargeScreen, currentTheme.spacing]
  );

  const contentStyles: React.CSSProperties = useMemo(
    () => ({
      marginTop: currentTheme.spacing["0"],
    }),
    [currentTheme.spacing]
  );

  const addButtonStyles: React.CSSProperties = useMemo(
    () => ({
      position: "fixed" as const,
      bottom: currentTheme.spacing["6"],
      right: currentTheme.spacing["6"],
      zIndex: 1000,
    }),
    [currentTheme.spacing]
  );

  const addButtonInnerStyles: React.CSSProperties = useMemo(
    () => ({
      width: `${CONSTANTS.ADD_BUTTON_SIZE}px`,
      height: `${CONSTANTS.ADD_BUTTON_SIZE}px`,
      borderRadius: "50%",
      backgroundColor: currentTheme.colors.primary.brand,
      color: currentTheme.colors.text.inverse,
      border: "none",
      fontSize: "24px",
      cursor: "pointer",
      boxShadow: `0 4px 12px ${currentTheme.colors.primary.brand}40`,
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
    }),
    [
      currentTheme.colors.primary.brand,
      currentTheme.colors.text.inverse,
      currentTheme.animation,
    ]
  );

  const loadingStyles: React.CSSProperties = useMemo(
    () => ({
      textAlign: "center" as const,
      padding: currentTheme.spacing["8"],
      color: currentTheme.colors.text.secondary,
    }),
    [currentTheme.spacing, currentTheme.colors.text.secondary]
  );

  const emptyStateStyles: React.CSSProperties = useMemo(
    () => ({
      textAlign: "center" as const,
      padding: currentTheme.spacing["8"],
      color: currentTheme.colors.text.secondary,
      fontSize: currentTheme.typography.fontSize.lg,
    }),
    [
      currentTheme.spacing,
      currentTheme.colors.text.secondary,
      currentTheme.typography.fontSize.lg,
    ]
  );

  return (
    <div style={containerStyles}>
      {/* 헤더 */}
      <Header onSearch={handleSearch} onSettingsClick={handleSettingsClick} />

      {/* 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={mainStyles} role="main" aria-label="할일 관리 메인 콘텐츠">
        {activeTab === "todo" && (
          <div style={contentStyles}>
            {/* 에러 상태 표시 */}
            {error.hasError && (
              <div
                role="alert"
                aria-live="polite"
                style={{
                  backgroundColor: "#fee2e2",
                  color: "#dc2626",
                  padding: currentTheme.spacing["4"],
                  marginBottom: currentTheme.spacing["4"],
                  borderRadius: currentTheme.borderRadius.md,
                  border: "1px solid #fca5a5",
                }}
              >
                <strong>오류:</strong> {error.message}
                <button
                  onClick={() => setError({ hasError: false, message: "" })}
                  style={{
                    marginLeft: currentTheme.spacing["2"],
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    textDecoration: "underline",
                  }}
                >
                  닫기
                </button>
              </div>
            )}

            {/* Todo 필터 */}
            <div
              style={{
                marginTop: "15px",
                marginBottom: currentTheme.spacing["0"],
              }}
            >
              <TodoFilters
                activeFilter={activeFilter}
                onFilterChange={handleFilterChange}
                onAddGroup={handleAddGroup}
                counts={counts}
              />
            </div>

            {/* 할일 추가 UI */}
            {showAddTodo && (
              <AddTodo
                onAdd={handleAddTodo}
                onCancel={() => setShowAddTodo(false)}
                initialDate={
                  activeFilter === "today"
                    ? dateUtils.getTodayDate()
                    : undefined
                }
              />
            )}

            {/* 할일 목록 또는 빈 상태 */}
            {!isLoading && (
              <>
                {filteredAndSearchedTodos.length > 0 ? (
                  <HierarchicalTodoList
                    title=""
                    showAddButton={false}
                    showCopyButton={true}
                    showStats={true}
                    todos={filteredAndSearchedTodos}
                    onUpdate={loadTodos}
                  />
                ) : (
                  <div
                    role="status"
                    aria-live="polite"
                    style={emptyStateStyles}
                  >
                    {searchQuery.trim()
                      ? `"${searchQuery}"에 대한 검색 결과가 없습니다.`
                      : "할일이 없습니다. 새로운 할일을 추가해보세요!"}
                  </div>
                )}
              </>
            )}

            {/* 로딩 상태 */}
            {isLoading && (
              <div role="status" aria-live="polite" style={loadingStyles}>
                ⏳ 할일 목록을 불러오는 중...
              </div>
            )}
          </div>
        )}

        {activeTab === "note" && (
          <div style={contentStyles}>
            <div role="status" aria-live="polite" style={emptyStateStyles}>
              📝 Note 기능은 곧 구현될 예정입니다.
            </div>
          </div>
        )}
      </main>

      {/* 할일 추가 버튼 */}
      {activeTab === "todo" && !showAddTodo && (
        <div style={addButtonStyles}>
          <button
            onClick={handleAddTodoClick}
            style={addButtonInnerStyles}
            title="할일 추가"
            aria-label="새로운 할일 추가"
            role="button"
          >
            +
          </button>
        </div>
      )}
    </div>
  );
}

// 메인 컴포넌트 - ThemeProvider로 감싸기
export default function Home() {
  return (
    <ThemeProvider>
      <HomeContent />
    </ThemeProvider>
  );
}
