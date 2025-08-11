"use client";

import React, { useState, useMemo, useCallback } from "react";
import { Button, Input } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useHierarchicalTodos } from "@/hooks/useHierarchicalTodos";
import HierarchicalTodoItem, { HierarchicalTodo } from "./HierarchicalTodoItem";
import { groupTodosByDate } from "@/utils/todoUtils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// 반응형 브레이크포인트
const BREAKPOINTS = {
  MOBILE: 400, // 400px 이하에서 세로 배치
  TABLET: 768,
  DESKTOP: 1024,
} as const;

// 날짜 포맷팅 함수
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
  return `${month}.${day}(${dayOfWeek})`;
};

interface HierarchicalTodoListProps {
  title?: string;
  showAddButton?: boolean;
  showCopyButton?: boolean;
  showStats?: boolean;
  todos?: HierarchicalTodo[];
  onUpdate?: () => void;
}

const HierarchicalTodoList: React.FC<HierarchicalTodoListProps> = ({
  title = "계층적 할일 목록",
  showAddButton = true,
  showCopyButton = true,
  showStats = true,
  todos: externalTodos,
  onUpdate,
}) => {
  const { currentTheme } = useTheme();
  const [isAdding, setIsAdding] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [message, setMessage] = useState("");
  const [isExpandingAll, setIsExpandingAll] = useState(false);

  // 커스텀 훅 사용
  const {
    todos,
    isLoading,
    error,
    addTodo,
    expandAll,
    reorderTodos,
    copyAllTodos,
    clearError,
  } = useHierarchicalTodos({ externalTodos, onUpdate });

  // 드래그앤드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 날짜별로 그룹화된 할일 목록 (메모이제이션)
  const groupedTodos = useMemo(() => groupTodosByDate(todos), [todos]);

  // 전체 펼쳐진 상태 확인
  const isAllExpanded = useMemo(() => {
    const todosWithChildren = todos.filter(
      (todo) => todo.children && todo.children.length > 0
    );
    return todosWithChildren.length > 0
      ? todosWithChildren.every((todo) => todo.isExpanded)
      : false;
  }, [todos]);

  // 필터링된 데이터의 진행률 계산
  const filteredProgress = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((todo) => todo.isDone).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { completed, total, percentage };
  }, [todos]);

  // 화면 크기 감지 (클라이언트 사이드에서만)
  const [screenWidth, setScreenWidth] = useState(1200);

  React.useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      setScreenWidth(width);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // 반응형 상태 계산
  const isMobile = screenWidth < BREAKPOINTS.MOBILE;

  // 동적 여백 계산
  const getDynamicSpacing = useCallback(
    (baseSpacing: string) => {
      if (screenWidth >= 1200) return baseSpacing;
      if (screenWidth >= 768) return `calc(${baseSpacing} * 0.8)`;
      if (screenWidth >= 400) return `calc(${baseSpacing} * 0.6)`;
      return `calc(${baseSpacing} * 0.4)`;
    },
    [screenWidth]
  );

  // 할일 추가 핸들러
  const handleAddTodo = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (newTodoTitle.trim() === "") return;

      await addTodo(newTodoTitle.trim());
      setNewTodoTitle("");
      setIsAdding(false);
    },
    [newTodoTitle, addTodo]
  );

  // 전체 펼치기/접기 핸들러
  const handleExpandAll = useCallback(async () => {
    await expandAll(!isAllExpanded);
    setIsExpandingAll(!isAllExpanded);
  }, [expandAll, isAllExpanded]);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeIndex = todos.findIndex(
        (todo) => todo.id === String(active.id)
      );
      const overIndex = todos.findIndex((todo) => todo.id === String(over.id));

      if (activeIndex !== -1 && overIndex !== -1) {
        const newTodos = arrayMove(todos, activeIndex, overIndex);
        const newOrder = newTodos.map((todo) => todo.id);
        await reorderTodos(newOrder);
      }
    },
    [todos, reorderTodos]
  );

  // 할일 목록 복사 핸들러 (하위 항목 포함) - 현재 표시되는 할일들만 복사
  const handleCopyTodos = useCallback(async () => {
    const result = await copyAllTodos(todos);
    if (result.success) {
      setMessage(result.message);
    } else {
      setMessage(result.message);
    }
  }, [copyAllTodos, todos]);

  // 스타일 정의 (메모이제이션)
  const styles = useMemo(
    () => ({
      container: {
        backgroundColor: currentTheme.colors.background.primary,
        border: "none",
        boxShadow: "none",
        color: currentTheme.colors.text.primary,
      },
      header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: getDynamicSpacing(currentTheme.spacing["4"]),
        padding: `${getDynamicSpacing(currentTheme.spacing["2"])} 0`,
        backgroundColor: currentTheme.colors.background.primary,
        flexDirection: "row" as const, // 항상 가로 배치
        gap: getDynamicSpacing(currentTheme.spacing["2"]),
        flexWrap: "wrap" as const,
      },
      headerLeft: {
        display: "flex",
        alignItems: "center",
        gap: getDynamicSpacing(currentTheme.spacing["2"]),
        flexWrap: "wrap" as const,
      },
      headerRight: {
        display: "flex",
        alignItems: "center",
        gap: getDynamicSpacing(currentTheme.spacing["1"]),
        flexWrap: "wrap" as const,
      },
      stats: {
        display: "flex",
        gap: getDynamicSpacing(currentTheme.spacing["1"]),
        alignItems: "center",
        flexWrap: "wrap" as const,
        fontSize:
          screenWidth < 768
            ? currentTheme.typography.fontSize.xs
            : currentTheme.typography.fontSize.sm,
      },
      buttonGroup: {
        display: "flex",
        gap: getDynamicSpacing(currentTheme.spacing["1"]),
        alignItems: "center",
        flexWrap: "wrap" as const,
      },
      addTodo: {
        display: "flex",
        gap: getDynamicSpacing(currentTheme.spacing["2"]),
        marginBottom: getDynamicSpacing(currentTheme.spacing["2"]),
        padding: getDynamicSpacing(currentTheme.spacing["2"]),
        backgroundColor: currentTheme.colors.background.tertiary,
        borderRadius: currentTheme.borderRadius.md,
        border: `1px solid ${currentTheme.colors.border.default}`,
      },
      message: {
        padding: getDynamicSpacing(currentTheme.spacing["2"]),
        marginBottom: getDynamicSpacing(currentTheme.spacing["2"]),
        backgroundColor: currentTheme.colors.background.tertiary,
        border: `1px solid ${currentTheme.colors.border.default}`,
        borderRadius: currentTheme.borderRadius.md,
        color: currentTheme.colors.text.primary,
        fontSize: currentTheme.typography.fontSize.sm,
      },
      emptyState: {
        textAlign: "center" as const,
        padding: getDynamicSpacing(currentTheme.spacing["4"]),
        color: currentTheme.colors.text.secondary,
        fontSize: currentTheme.typography.fontSize.lg,
      },
      dateGroup: {
        marginBottom: getDynamicSpacing(currentTheme.spacing["4"]),
        display: "flex",
        backgroundColor: currentTheme.colors.background.primary,
        flexDirection: isMobile ? ("column" as const) : ("row" as const),
        gap: isMobile ? getDynamicSpacing(currentTheme.spacing["2"]) : 0,
      },
      dateHeader: {
        fontSize: currentTheme.typography.fontSize.sm,
        fontWeight: currentTheme.typography.fontWeight.medium,
        color: currentTheme.colors.text.secondary,
        minWidth: isMobile ? "auto" : "60px",
        width: isMobile ? "auto" : "60px",
        padding: isMobile
          ? `${getDynamicSpacing(
              currentTheme.spacing["1"]
            )} ${getDynamicSpacing(currentTheme.spacing["2"])}`
          : `${getDynamicSpacing(
              currentTheme.spacing["3"]
            )} ${getDynamicSpacing(currentTheme.spacing["2"])}`,
        textAlign: isMobile ? ("left" as const) : ("center" as const),
        height: isMobile ? "auto" : "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: isMobile ? "flex-start" : "center",
        backgroundColor: isMobile
          ? currentTheme.colors.background.secondary
          : "transparent",
        borderRadius: isMobile ? currentTheme.borderRadius.sm : 0,
        border: isMobile
          ? `1px solid ${currentTheme.colors.border.muted}`
          : "none",
      },
      contentSection: {
        flex: 1,
        backgroundColor: currentTheme.colors.background.primary,
        paddingLeft: isMobile
          ? 0
          : getDynamicSpacing(currentTheme.spacing["2"]),
      },
      dateGroupDivider: {
        height: "2px",
        backgroundColor: currentTheme.colors.border.default,
        margin: `${getDynamicSpacing(currentTheme.spacing["4"])} 0`,
        borderRadius: "1px",
        opacity: 0.8,
      },
    }),
    [currentTheme, isMobile, screenWidth, getDynamicSpacing]
  );

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h2
            style={{
              margin: 0,
              padding: 0,
              fontSize: currentTheme.typography.fontSize.lg,
            }}
          >
            {title}
          </h2>
          {showStats && filteredProgress.total > 0 && (
            <div style={styles.stats}>
              <span
                style={{
                  fontSize: currentTheme.typography.fontSize.xs,
                  color: currentTheme.colors.text.secondary,
                  borderBottom: `1px solid ${currentTheme.colors.border.default}`,
                  padding: `${getDynamicSpacing(
                    currentTheme.spacing["1"]
                  )} ${getDynamicSpacing(currentTheme.spacing["2"])}`,
                  cursor: "default",
                }}
              >
                진행 {filteredProgress.completed}/{filteredProgress.total}
              </span>
              <span
                style={{
                  fontSize: currentTheme.typography.fontSize.xs,
                  color: currentTheme.colors.text.secondary,
                  borderBottom: `1px solid ${currentTheme.colors.border.default}`,
                  padding: `${getDynamicSpacing(
                    currentTheme.spacing["1"]
                  )} ${getDynamicSpacing(currentTheme.spacing["2"])}`,
                  cursor: "default",
                }}
              >
                완료 {filteredProgress.percentage}%
              </span>
            </div>
          )}
        </div>

        {/* 액션 버튼들 - 가로로 일직선상 배치 */}
        <div style={styles.headerRight}>
          {showAddButton && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAdding(true)}
            >
              할일 추가
            </Button>
          )}
          {showCopyButton && todos.length > 0 && (
            <Button variant="secondary" size="sm" onClick={handleCopyTodos}>
              복사
            </Button>
          )}
          {todos.some((todo) => todo.children.length > 0) && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handleExpandAll}
              disabled={isExpandingAll}
            >
              {isAllExpanded ? "모두 접기" : "모두 펼치기"}
            </Button>
          )}
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && (
        <div style={styles.message}>
          ❌ {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            style={{ marginLeft: "8px" }}
          >
            ✕
          </Button>
        </div>
      )}

      {/* 성공 메시지 */}
      {message && <div style={styles.message}>{message}</div>}

      {/* 할일 추가 UI */}
      {isAdding && (
        <div style={styles.addTodo}>
          <Input
            placeholder="할일 제목을 입력하세요..."
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddTodo(e);
              if (e.key === "Escape") {
                setNewTodoTitle("");
                setIsAdding(false);
              }
            }}
            style={{ flex: 1 }}
            autoFocus
          />
          <Button variant="primary" size="sm" onClick={handleAddTodo}>
            추가
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNewTodoTitle("");
              setIsAdding(false);
            }}
          >
            취소
          </Button>
        </div>
      )}

      {/* 빈 상태 */}
      {!isLoading && todos.length === 0 && (
        <div style={styles.emptyState}>
          📝 아직 할일이 없습니다.
          <br />
          <br />
          <Button variant="primary" onClick={() => setIsAdding(true)}>
            첫 번째 할일 추가하기
          </Button>
        </div>
      )}

      {/* 할일 목록 - 날짜별 그룹화 */}
      {!isLoading && todos.length > 0 && (
        <div>
          {groupedTodos.map((group, groupIndex) => (
            <div key={group.date}>
              <div
                style={{
                  ...styles.dateGroup,
                  borderBottom:
                    groupIndex === groupedTodos.length - 1
                      ? `2px solid ${currentTheme.colors.border.default}`
                      : "none",
                  paddingBottom:
                    groupIndex === groupedTodos.length - 1
                      ? getDynamicSpacing(currentTheme.spacing["4"])
                      : 0,
                }}
              >
                {/* 날짜 헤더 */}
                <div style={styles.dateHeader}>
                  {group.date !== "no-date" ? formatDate(group.date) : ""}
                </div>

                {/* 내용 섹션 */}
                <div style={styles.contentSection}>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={group.todos.map((todo) => todo.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      <div>
                        {group.todos.map((todo, todoIndex) => (
                          <HierarchicalTodoItem
                            key={`${todo.id}-${todo.isExpanded}-${todo.updatedAt}`}
                            todo={todo}
                            level={0}
                            isLast={todoIndex === group.todos.length - 1}
                            onUpdate={() => {
                              if (onUpdate) {
                                onUpdate();
                              }
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* 날짜 그룹 구분선 */}
              {groupIndex < groupedTodos.length - 1 && (
                <div style={styles.dateGroupDivider} />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HierarchicalTodoList;
export type { HierarchicalTodoListProps };
