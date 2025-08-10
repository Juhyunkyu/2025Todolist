"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import HierarchicalTodoItem, { HierarchicalTodo } from "./HierarchicalTodoItem";
import { useHierarchicalTodos } from "@/hooks/useHierarchicalTodos";
import { groupTodosByDate, formatDate } from "@/utils/todoUtils";
import { copyHierarchicalTodosAsMarkdown } from "@/lib/db";

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
    progress,
    addTodo,
    expandAll,
    reorderTodos,
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

  // 새 할일 추가 핸들러
  const handleAddTodo = useCallback(async () => {
    if (newTodoTitle.trim() === "") return;

    const result = await addTodo(newTodoTitle.trim());
    if (result?.success) {
      setNewTodoTitle("");
      setIsAdding(false);
      setMessage(result.message);
      setTimeout(() => setMessage(""), 2000);
    } else {
      setMessage(result?.message || "할일 추가에 실패했습니다.");
      setTimeout(() => setMessage(""), 3000);
    }
  }, [newTodoTitle, addTodo]);

  // 할일 복사 핸들러 (필터링된 데이터 기반)
  const handleCopyTodos = useCallback(async () => {
    try {
      // 현재 표시된 할일들만 복사
      const markdownLines: string[] = [];

      // 날짜별로 그룹화된 할일들을 마크다운으로 변환
      groupedTodos.forEach((group) => {
        if (group.date !== "no-date") {
          markdownLines.push(`## ${formatDate(group.date)}`);
        }

        group.todos.forEach((todo) => {
          const checkbox = todo.isDone ? "[x]" : "[ ]";
          const indent = "  ".repeat(0); // 최상위 레벨
          markdownLines.push(`${indent}${checkbox} ${todo.title}`);
        });

        markdownLines.push(""); // 빈 줄 추가
      });

      const markdown = markdownLines.join("\n");
      await navigator.clipboard.writeText(markdown);
      setMessage("현재 표시된 할일 목록이 클립보드에 복사되었습니다!");
      setTimeout(() => setMessage(""), 2000);
    } catch (error) {
      console.error("Failed to copy todos:", error);
      setMessage("복사에 실패했습니다.");
      setTimeout(() => setMessage(""), 3000);
    }
  }, [groupedTodos]);

  // 전체 펼치기/접기 핸들러 (필터링된 데이터 기반)
  const handleExpandAll = useCallback(async () => {
    if (isExpandingAll) return;

    setIsExpandingAll(true);
    const newExpandState = !isAllExpanded;

    // 현재 표시된 할일들만 펼치기/접기
    const result = await expandAll(newExpandState);
    setMessage(
      result?.message || "현재 표시된 할일들의 펼치기/접기가 완료되었습니다."
    );
    setTimeout(() => setMessage(""), 2000);
    setIsExpandingAll(false);
  }, [isAllExpanded, isExpandingAll, expandAll]);

  // 드래그 종료 핸들러
  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) return;

      const activeIndex = todos.findIndex((todo) => todo.id === active.id);
      const overIndex = todos.findIndex((todo) => todo.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        const newTodos = arrayMove(todos, activeIndex, overIndex);
        const newOrder = newTodos.map((todo) => todo.id);

        const result = await reorderTodos(newOrder);
        setMessage(result?.message || "순서가 변경되었습니다!");
        setTimeout(() => setMessage(""), 2000);
      }
    },
    [todos, reorderTodos]
  );

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
        marginBottom: currentTheme.spacing["4"],
        padding: `${currentTheme.spacing["2"]} 0`,
        borderBottom: `1px solid ${currentTheme.colors.border.default}`,
        backgroundColor: currentTheme.colors.background.primary,
      },
      stats: {
        display: "flex",
        gap: currentTheme.spacing["2"],
        alignItems: "center",
      },
      buttonGroup: {
        display: "flex",
        gap: currentTheme.spacing["2"],
        alignItems: "center",
      },
      addTodo: {
        display: "flex",
        gap: currentTheme.spacing["2"],
        marginBottom: currentTheme.spacing["2"],
        padding: currentTheme.spacing["2"],
        backgroundColor: currentTheme.colors.background.tertiary,
        borderRadius: currentTheme.borderRadius.md,
        border: `1px solid ${currentTheme.colors.border.default}`,
      },
      message: {
        padding: currentTheme.spacing["2"],
        marginBottom: currentTheme.spacing["2"],
        backgroundColor: currentTheme.colors.background.tertiary,
        border: `1px solid ${currentTheme.colors.border.default}`,
        borderRadius: currentTheme.borderRadius.md,
        color: currentTheme.colors.text.primary,
        fontSize: currentTheme.typography.fontSize.sm,
      },
      emptyState: {
        textAlign: "center" as const,
        padding: currentTheme.spacing["4"],
        color: currentTheme.colors.text.secondary,
        fontSize: currentTheme.typography.fontSize.lg,
      },
      dateGroup: {
        marginBottom: currentTheme.spacing["4"],
        display: "flex",
        backgroundColor: currentTheme.colors.background.primary,
      },
      dateHeader: {
        fontSize: currentTheme.typography.fontSize.sm,
        fontWeight: currentTheme.typography.fontWeight.medium,
        color: currentTheme.colors.text.secondary,
        minWidth: "60px",
        paddingTop: currentTheme.spacing["2"],
        paddingRight: currentTheme.spacing["2"],
        textAlign: "left" as const,
        height: "40px",
        display: "flex",
        alignItems: "center",
      },
      contentSection: {
        flex: 1,
        borderLeft: `1px solid ${currentTheme.colors.border.default}`,
        paddingLeft: currentTheme.spacing["4"],
        backgroundColor: currentTheme.colors.background.primary,
      },
      dateGroupDivider: {
        height: "1px",
        backgroundColor: currentTheme.colors.border.default,
        margin: `${currentTheme.spacing["2"]} 0`,
      },
    }),
    [currentTheme]
  );

  return (
    <div style={styles.container}>
      {/* 헤더 */}
      <div style={styles.header}>
        <div>
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
                  padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`,
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
                  padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`,
                  cursor: "default",
                }}
              >
                완료 {filteredProgress.percentage}%
              </span>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div style={styles.buttonGroup}>
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
              if (e.key === "Enter") handleAddTodo();
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
              <div style={styles.dateGroup}>
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
                        {group.todos.map((todo) => (
                          <HierarchicalTodoItem
                            key={`${todo.id}-${todo.isExpanded}-${todo.updatedAt}`}
                            todo={todo}
                            level={0}
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
