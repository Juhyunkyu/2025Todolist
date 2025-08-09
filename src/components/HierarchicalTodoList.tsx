"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import HierarchicalTodoItem, { HierarchicalTodo } from "./HierarchicalTodoItem";
import {
  getHierarchicalTodosByParent,
  addHierarchicalTodo,
  copyHierarchicalTodosAsMarkdown,
  getHierarchicalTodoProgress,
  reorderHierarchicalTodos,
  expandAllHierarchicalTodos,
} from "@/lib/db";

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
  todos?: HierarchicalTodo[]; // 외부에서 전달받은 데이터
  onUpdate?: () => void; // 데이터 업데이트 콜백
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
  const [todos, setTodos] = useState<HierarchicalTodo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [message, setMessage] = useState("");
  const [isAllExpanded, setIsAllExpanded] = useState(false);
  const [isExpandingAll, setIsExpandingAll] = useState(false);

  // 드래그앤드롭 센서 설정
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px 이동 후 드래그 시작 (실수 방지)
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 날짜별로 그룹화된 할일 목록
  const groupedTodos = useMemo(() => {
    const groups: { [key: string]: HierarchicalTodo[] } = {};

    todos.forEach((todo) => {
      const date = todo.date || "no-date";
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(todo);
    });

    // 날짜별로 정렬 (최신 날짜가 위로)
    return Object.entries(groups)
      .sort(([a], [b]) => {
        if (a === "no-date") return 1;
        if (b === "no-date") return -1;
        return new Date(b).getTime() - new Date(a).getTime();
      })
      .map(([date, todos]) => ({
        date,
        todos: todos.sort((a, b) => a.order - b.order),
      }));
  }, [todos]);

  // 날짜 포맷팅 함수
  const formatDate = useCallback((dateString: string) => {
    if (dateString === "no-date") return "";

    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    return `${month}.${day.toString().padStart(2, "0")}`;
  }, []);

  // 할일 목록 로드
  const loadTodos = useCallback(async () => {
    try {
      setIsLoading(true);

      // 외부에서 전달받은 데이터가 있으면 사용, 없으면 직접 로드
      if (externalTodos) {
        setTodos(externalTodos);
      } else {
        const rootTodos = await getHierarchicalTodosByParent(); // 최상위 항목들만
        setTodos(rootTodos);
      }

      // 전체 진행률 계산
      if (showStats) {
        try {
          const progressData = await getHierarchicalTodoProgress();
          setProgress(progressData);
        } catch (progressError) {
          console.error("Failed to load progress:", progressError);
          // 진행률 로드 실패해도 계속 진행
        }
      }

      // 전체 펼쳐진 상태 확인 (로드된 데이터 기준)
      try {
        const currentTodos = externalTodos || todos;
        const todosWithChildren = currentTodos.filter(
          (todo) => todo.children && todo.children.length > 0
        );
        const allExpanded =
          todosWithChildren.length > 0
            ? todosWithChildren.every((todo) => todo.isExpanded)
            : false;
        setIsAllExpanded(allExpanded);
      } catch (expandError) {
        console.error("Failed to check expand state:", expandError);
        setIsAllExpanded(false); // 기본값으로 설정
      }
    } catch (error) {
      console.error("Failed to load hierarchical todos:", error);
      setMessage("할일 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [externalTodos, showStats]);

  // 외부 데이터가 변경될 때마다 업데이트
  useEffect(() => {
    if (externalTodos) {
      setTodos(externalTodos);
      setIsLoading(false);
    } else {
      loadTodos();
    }
  }, [externalTodos, loadTodos]);

  // 새 최상위 할일 추가
  const handleAddTodo = async () => {
    if (newTodoTitle.trim() === "") return;

    try {
      const nextOrder = todos.length;
      await addHierarchicalTodo({
        title: newTodoTitle.trim(),
        isDone: false,
        isExpanded: false,
        order: nextOrder,
        tags: [],
        date: new Date().toISOString(),
        repeat: "none",
      });

      setNewTodoTitle("");
      setIsAdding(false);
      setMessage("새 할일이 추가되었습니다.");

      // 외부에서 전달받은 onUpdate 콜백이 있으면 호출, 없으면 loadTodos 호출
      if (onUpdate) {
        onUpdate();
      } else {
        await loadTodos();
      }
    } catch (error) {
      console.error("Failed to add todo:", error);
      setMessage("할일 추가에 실패했습니다.");
    }
  };

  // 할일 복사 (마크다운 형식)
  const handleCopyTodos = async () => {
    try {
      const markdown = await copyHierarchicalTodosAsMarkdown();
      await navigator.clipboard.writeText(markdown);
      setMessage("할일 목록이 클립보드에 복사되었습니다!");
    } catch (error) {
      console.error("Failed to copy todos:", error);
      setMessage("복사에 실패했습니다.");
    }
  };

  // 전체 펼치기/접기 - 즉시 반응하는 버전
  const handleExpandAll = async () => {
    if (isExpandingAll) return;

    const newExpandState = !isAllExpanded;

    try {
      setIsExpandingAll(true);

      // 1. 즉시 로컬 상태 업데이트 (사용자가 바로 변화를 봄)
      setIsAllExpanded(newExpandState);

      // 2. 메모리의 todos 데이터를 즉시 업데이트 (UI 즉시 반응)
      const updatedTodos = todos.map((todo) => ({
        ...todo,
        isExpanded: newExpandState,
        updatedAt: new Date().toISOString(),
      }));
      setTodos(updatedTodos);

      // 3. 메시지 즉시 표시
      const action = newExpandState ? "펼쳐졌습니다" : "접혀졌습니다";
      setMessage(`📂 모든 할일이 ${action}!`);
      setTimeout(() => setMessage(""), 2000);

      // 4. 백그라운드에서 DB 업데이트 (사용자는 기다리지 않음)
      expandAllHierarchicalTodos(newExpandState)
        .then(() => {
          // 5. DB 업데이트 완료 후 최종 새로고침
          return getHierarchicalTodosByParent();
        })
        .then((refreshedTodos) => {
          setTodos(refreshedTodos);
          // 최종 상태 재확인
          const todosWithChildren = refreshedTodos.filter(
            (todo) => todo.children && todo.children.length > 0
          );
          const actualExpandState =
            todosWithChildren.length > 0
              ? todosWithChildren.every((todo) => todo.isExpanded)
              : false;
          setIsAllExpanded(actualExpandState);
        })
        .catch((error) => {
          console.error("백그라운드 DB 업데이트 실패:", error);
          // DB 업데이트 실패 시 원래 상태로 되돌리기
          setIsAllExpanded(!newExpandState);
          setMessage("❌ 저장에 실패했습니다. 다시 시도해주세요.");
          setTimeout(() => setMessage(""), 3000);
        });
    } finally {
      setIsExpandingAll(false);
    }
  };

  // 드래그 종료 핸들러
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return; // 드롭 위치가 없거나 같은 위치면 아무것도 안함
    }

    const activeIndex = todos.findIndex((todo) => todo.id === active.id);
    const overIndex = todos.findIndex((todo) => todo.id === over.id);

    if (activeIndex !== -1 && overIndex !== -1) {
      // 로컬 상태 즉시 업데이트 (UI 반응성)
      const newTodos = arrayMove(todos, activeIndex, overIndex);
      setTodos(newTodos);

      try {
        // 데이터베이스에 새 순서 저장
        const newOrder = newTodos.map((todo) => todo.id);
        await reorderHierarchicalTodos(undefined, newOrder); // 최상위 레벨
        setMessage("📦 순서가 변경되었습니다!");
        setTimeout(() => setMessage(""), 2000);

        // 외부에서 전달받은 onUpdate 콜백이 있으면 호출
        if (onUpdate) {
          onUpdate();
        }
      } catch (error) {
        console.error("Failed to reorder todos:", error);
        // 실패시 원래 순서로 되돌리기
        if (onUpdate) {
          onUpdate();
        } else {
          await loadTodos();
        }
        setMessage("❌ 순서 변경에 실패했습니다.");
        setTimeout(() => setMessage(""), 2000);
      }
    }
  };

  // 스타일 정의 - 테마 변경 시 자동 업데이트
  const containerStyles: React.CSSProperties = useMemo(
    () => ({
      backgroundColor: currentTheme.colors.background.primary,
      border: "none",
      boxShadow: "none",
      color: currentTheme.colors.text.primary,
    }),
    [currentTheme.colors.background.primary, currentTheme.colors.text.primary]
  );

  const headerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: currentTheme.spacing["4"],
      padding: `${currentTheme.spacing["2"]} 0`,
      borderBottom: `1px solid ${currentTheme.colors.border.default}`,
      backgroundColor: currentTheme.colors.background.primary,
    }),
    [
      currentTheme.spacing,
      currentTheme.colors.border.default,
      currentTheme.colors.background.primary,
    ]
  );

  const statsStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["2"],
      alignItems: "center",
    }),
    [currentTheme.spacing]
  );

  const buttonGroupStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["2"],
      alignItems: "center",
    }),
    [currentTheme.spacing]
  );

  const addTodoStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["2"],
      marginBottom: currentTheme.spacing["2"],
      padding: currentTheme.spacing["2"],
      backgroundColor: currentTheme.colors.background.tertiary,
      borderRadius: currentTheme.borderRadius.md,
      border: `1px solid ${currentTheme.colors.border.default}`,
    }),
    [
      currentTheme.spacing,
      currentTheme.colors.background.tertiary,
      currentTheme.borderRadius.md,
      currentTheme.colors.border.default,
    ]
  );

  const emptyStateStyles: React.CSSProperties = useMemo(
    () => ({
      textAlign: "center",
      padding: currentTheme.spacing["4"],
      color: currentTheme.colors.text.secondary,
      fontSize: currentTheme.typography.fontSize.lg,
    }),
    [
      currentTheme.spacing,
      currentTheme.colors.text.secondary,
      currentTheme.typography.fontSize.lg,
    ]
  );

  const messageStyles: React.CSSProperties = useMemo(
    () => ({
      padding: currentTheme.spacing["2"],
      marginBottom: currentTheme.spacing["2"],
      backgroundColor: currentTheme.colors.background.tertiary,
      border: `1px solid ${currentTheme.colors.border.default}`,
      borderRadius: currentTheme.borderRadius.md,
      color: currentTheme.colors.text.primary,
      fontSize: currentTheme.typography.fontSize.sm,
    }),
    [
      currentTheme.spacing,
      currentTheme.colors.background.tertiary,
      currentTheme.colors.border.default,
      currentTheme.borderRadius.md,
      currentTheme.colors.text.primary,
      currentTheme.typography.fontSize.sm,
    ]
  );

  const dateGroupStyles: React.CSSProperties = useMemo(
    () => ({
      marginBottom: currentTheme.spacing["4"],
      display: "flex",
      backgroundColor: currentTheme.colors.background.primary,
    }),
    [currentTheme.spacing, currentTheme.colors.background.primary]
  );

  const dateHeaderStyles: React.CSSProperties = useMemo(
    () => ({
      fontSize: currentTheme.typography.fontSize.sm,
      fontWeight: currentTheme.typography.fontWeight.medium,
      color: currentTheme.colors.text.secondary,
      minWidth: "60px",
      paddingTop: currentTheme.spacing["2"],
      paddingRight: currentTheme.spacing["2"],
      textAlign: "left",
      height: "40px", // 고정 높이로 정렬 맞추기
      display: "flex",
      alignItems: "center",
    }),
    [
      currentTheme.typography.fontSize.sm,
      currentTheme.typography.fontWeight.medium,
      currentTheme.colors.text.secondary,
      currentTheme.spacing,
    ]
  );

  const dateDividerStyles: React.CSSProperties = useMemo(
    () => ({
      width: "1px",
      backgroundColor: currentTheme.colors.border.default,
      margin: `${currentTheme.spacing["1"]} 0`,
    }),
    [currentTheme.colors.border.default, currentTheme.spacing]
  );

  const contentSectionStyles: React.CSSProperties = useMemo(
    () => ({
      flex: 1,
      borderLeft: `1px solid ${currentTheme.colors.border.default}`,
      paddingLeft: currentTheme.spacing["4"],
      backgroundColor: currentTheme.colors.background.primary,
    }),
    [
      currentTheme.colors.border.default,
      currentTheme.spacing,
      currentTheme.colors.background.primary,
    ]
  );

  const dateGroupDividerStyles: React.CSSProperties = useMemo(
    () => ({
      height: "1px",
      backgroundColor: currentTheme.colors.border.default,
      margin: `${currentTheme.spacing["2"]} 0`,
    }),
    [currentTheme.colors.border.default, currentTheme.spacing]
  );

  return (
    <div style={containerStyles}>
      {/* 헤더 */}
      <div style={headerStyles}>
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
          {showStats && progress.total > 0 && (
            <div style={statsStyles}>
              <Badge variant="info">
                전체: {progress.completed}/{progress.total}
              </Badge>
              <Badge
                variant={
                  progress.percentage === 100
                    ? "success"
                    : progress.percentage > 50
                    ? "info"
                    : "default"
                }
              >
                {progress.percentage}% 완료
              </Badge>
            </div>
          )}
        </div>

        {/* 액션 버튼들 */}
        <div style={buttonGroupStyles}>
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
              variant="ghost"
              size="sm"
              onClick={handleExpandAll}
              disabled={isExpandingAll}
            >
              {isAllExpanded ? "모두 접기" : "모두 펼치기"}
            </Button>
          )}
        </div>
      </div>

      {/* 메시지 표시 */}
      {message && <div style={messageStyles}>{message}</div>}

      {/* 할일 추가 UI */}
      {isAdding && (
        <div style={addTodoStyles}>
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
        <div style={emptyStateStyles}>
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
              <div style={dateGroupStyles}>
                {/* 날짜 헤더 */}
                <div style={dateHeaderStyles}>
                  {group.date !== "no-date" ? formatDate(group.date) : ""}
                </div>

                {/* 내용 섹션 */}
                <div style={contentSectionStyles}>
                  {/* 해당 날짜의 할일들 */}
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
                              } else {
                                loadTodos();
                              }
                            }}
                          />
                        ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </div>
              </div>

              {/* 날짜 그룹 구분선 (마지막 그룹이 아닌 경우에만) */}
              {groupIndex < groupedTodos.length - 1 && (
                <div style={dateGroupDividerStyles} />
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
