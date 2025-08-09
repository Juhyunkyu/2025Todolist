"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Button,
  Input,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Badge,
} from "@/components/ui";
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
      await loadTodos();
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
      } catch (error) {
        console.error("Failed to reorder todos:", error);
        // 실패시 원래 순서로 되돌리기
        await loadTodos();
        setMessage("❌ 순서 변경에 실패했습니다.");
        setTimeout(() => setMessage(""), 2000);
      }
    }
  };

  // 스타일 정의
  const containerStyles: React.CSSProperties = {
    width: "100%",
    maxWidth: "800px",
    margin: "0 auto",
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: currentTheme.spacing["4"],
  };

  const statsStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    alignItems: "center",
  };

  const buttonGroupStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    alignItems: "center",
  };

  const addTodoStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    marginBottom: currentTheme.spacing["4"],
    padding: currentTheme.spacing["3"],
    backgroundColor: currentTheme.colors.background.tertiary,
    borderRadius: currentTheme.borderRadius.md,
    border: `1px solid ${currentTheme.colors.border.default}`,
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: "center",
    padding: currentTheme.spacing["8"],
    color: currentTheme.colors.text.secondary,
    fontSize: currentTheme.typography.fontSize.lg,
  };

  const messageStyles: React.CSSProperties = {
    padding: currentTheme.spacing["2"],
    marginBottom: currentTheme.spacing["4"],
    backgroundColor: currentTheme.colors.background.tertiary,
    border: `1px solid ${currentTheme.colors.border.default}`,
    borderRadius: currentTheme.borderRadius.md,
    color: currentTheme.colors.text.primary,
    fontSize: currentTheme.typography.fontSize.sm,
  };

  return (
    <Card
      style={{
        ...containerStyles,
        border: "none",
        backgroundColor: "transparent",
      }}
    >
      <CardHeader>
        <div style={headerStyles}>
          <div>
            <CardTitle>{title}</CardTitle>
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

          <div style={buttonGroupStyles}>
            {showCopyButton && todos.length > 0 && (
              <Button variant="secondary" size="sm" onClick={handleCopyTodos}>
                📋 복사
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpandAll}
              disabled={isExpandingAll}
            >
              {isExpandingAll
                ? "⏳ 처리중..."
                : isAllExpanded
                ? "📁 전체 접기"
                : "📂 전체 펼치기"}
            </Button>
            {showAddButton && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsAdding(true)}
                disabled={isAdding}
              >
                ➕ 추가
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 메시지 표시 */}
        {message && (
          <div style={messageStyles}>
            {message}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMessage("")}
              style={{
                float: "right",
                fontSize: "12px",
                padding: "2px 6px",
                minHeight: "auto",
              }}
            >
              ✕
            </Button>
          </div>
        )}

        {/* 새 할일 추가 UI */}
        {isAdding && (
          <div style={addTodoStyles}>
            <Input
              placeholder="새 할일 제목을 입력하세요..."
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

        {/* 로딩 상태 */}
        {isLoading && (
          <div style={emptyStateStyles}>⏳ 할일 목록을 불러오는 중...</div>
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

        {/* 할일 목록 */}
        {!isLoading && todos.length > 0 && (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={todos.map((todo) => todo.id)}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {todos.map((todo) => (
                  <HierarchicalTodoItem
                    key={`${todo.id}-${todo.isExpanded}-${todo.updatedAt}`}
                    todo={todo}
                    level={0}
                    onUpdate={loadTodos}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </CardContent>
    </Card>
  );
};

export default HierarchicalTodoList;
export type { HierarchicalTodoListProps };
