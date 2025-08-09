"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import TodoFilters from "@/components/TodoFilters";
import AddTodo from "@/components/AddTodo";
import HierarchicalTodoList from "@/components/HierarchicalTodoList";
import {
  getHierarchicalTodosByParent,
  addHierarchicalTodo,
  getHierarchicalTodoProgress,
} from "@/lib/db";

interface HierarchicalTodo {
  id: string;
  title: string;
  isDone: boolean;
  parentId?: string;
  children: string[];
  isExpanded: boolean;
  order: number;
  tags: string[];
  date: string;
  repeat: "none" | "daily" | "weekly" | "monthly";
  alarmTime?: string;
  createdAt: string;
  updatedAt: string;
}

// 내부 컴포넌트 - useTheme 사용
function HomeContent() {
  const { currentTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<"todo" | "note">("todo");
  const [activeFilter, setActiveFilter] = useState("all");
  const [todos, setTodos] = useState<HierarchicalTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddTodo, setShowAddTodo] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 할일 목록 로드
  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);
      const rootTodos = await getHierarchicalTodosByParent();
      setTodos(rootTodos);
    } catch (error) {
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
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekFromNowStr = weekFromNow.toISOString().split("T")[0];

    switch (activeFilter) {
      case "today":
        filtered = filtered.filter((todo) => todo.date === today);
        break;
      case "tomorrow":
        filtered = filtered.filter((todo) => todo.date === tomorrowStr);
        break;
      case "week":
        filtered = filtered.filter((todo) => {
          const todoDate = new Date(todo.date);
          const now = new Date();
          const weekFromNow = new Date();
          weekFromNow.setDate(now.getDate() + 7);
          return todoDate >= now && todoDate <= weekFromNow;
        });
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
  const handleFilterChange = useCallback((filter: string) => {
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
    const today = new Date().toISOString().split("T")[0];
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];
    const weekFromNow = new Date();
    weekFromNow.setDate(weekFromNow.getDate() + 7);
    const weekFromNowStr = weekFromNow.toISOString().split("T")[0];

    return {
      all: todos.length,
      today: todos.filter((todo) => todo.date === today).length,
      tomorrow: todos.filter((todo) => todo.date === tomorrowStr).length,
      week: todos.filter((todo) => {
        const todoDate = new Date(todo.date);
        const now = new Date();
        const weekFromNow = new Date();
        weekFromNow.setDate(now.getDate() + 7);
        return todoDate >= now && todoDate <= weekFromNow;
      }).length,
      defaultGroup: todos.filter(
        (todo) => !todo.tags.length || todo.tags.includes("기본그룹")
      ).length,
    };
  }, [todos]);

  // 할일 추가 버튼 클릭 (오늘 탭에서 자동으로 오늘 날짜 지정)
  const handleAddTodoClick = useCallback(() => {
    setShowAddTodo(true);
  }, []);

  // 오늘 날짜 가져오기
  const getTodayDate = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const containerStyles: React.CSSProperties = {
    minHeight: "100vh",
    backgroundColor: currentTheme.colors.background.primary,
    color: currentTheme.colors.text.primary,
  };

  const mainStyles: React.CSSProperties = {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: currentTheme.spacing["4"],
  };

  const contentStyles: React.CSSProperties = {
    marginTop: currentTheme.spacing["4"],
  };

  const addButtonStyles: React.CSSProperties = {
    position: "fixed",
    bottom: currentTheme.spacing["6"],
    right: currentTheme.spacing["6"],
    zIndex: 1000,
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: "center",
    padding: currentTheme.spacing["8"],
    color: currentTheme.colors.text.secondary,
    fontSize: currentTheme.typography.fontSize.lg,
  };

  return (
    <div style={containerStyles}>
      {/* 헤더 */}
      <Header onSearch={handleSearch} onSettingsClick={handleSettingsClick} />

      {/* 탭 네비게이션 */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      <main style={mainStyles}>
        {activeTab === "todo" && (
          <div style={contentStyles}>
            {/* Todo 필터 */}
            <TodoFilters
              activeFilter={activeFilter}
              onFilterChange={handleFilterChange}
              onAddGroup={handleAddGroup}
              counts={counts}
            />

            {/* 할일 추가 UI */}
            {showAddTodo && (
              <AddTodo
                onAdd={handleAddTodo}
                onCancel={() => setShowAddTodo(false)}
                initialDate={
                  activeFilter === "today" ? getTodayDate() : undefined
                }
              />
            )}

            {/* 할일 목록 또는 빈 상태 */}
            {!isLoading && (
              <>
                {filteredAndSearchedTodos.length > 0 && (
                  <HierarchicalTodoList
                    title=""
                    showAddButton={false}
                    showCopyButton={true}
                    showStats={true}
                    todos={filteredAndSearchedTodos}
                    onUpdate={loadTodos}
                  />
                )}
              </>
            )}

            {/* 로딩 상태 */}
            {isLoading && (
              <div
                style={{
                  textAlign: "center",
                  padding: currentTheme.spacing["8"],
                  color: currentTheme.colors.text.secondary,
                }}
              >
                ⏳ 할일 목록을 불러오는 중...
              </div>
            )}
          </div>
        )}

        {activeTab === "note" && (
          <div style={contentStyles}>
            <div
              style={{
                textAlign: "center",
                padding: currentTheme.spacing["8"],
                color: currentTheme.colors.text.secondary,
              }}
            >
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
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: currentTheme.colors.primary.brand,
              color: currentTheme.colors.text.inverse,
              border: "none",
              fontSize: "24px",
              cursor: "pointer",
              boxShadow: `0 4px 12px ${currentTheme.colors.primary.brand}40`,
              transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
            }}
            title="할일 추가"
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
