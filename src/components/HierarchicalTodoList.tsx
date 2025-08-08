"use client";

import React, { useState, useEffect } from "react";
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
}

const HierarchicalTodoList: React.FC<HierarchicalTodoListProps> = ({
  title = "계층적 할일 목록",
  showAddButton = true,
  showCopyButton = true,
  showStats = true,
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
  const loadTodos = async () => {
    try {
      setIsLoading(true);
      const rootTodos = await getHierarchicalTodosByParent(); // 최상위 항목들만
      setTodos(rootTodos);

      // 전체 진행률 계산
      if (showStats) {
        const progressData = await getHierarchicalTodoProgress();
        setProgress(progressData);
      }
    } catch (error) {
      console.error("Failed to load hierarchical todos:", error);
      setMessage("할일 목록을 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 컴포넌트 마운트 시 로드
  useEffect(() => {
    loadTodos();
  }, []);

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

  // 전체 펼치기/접기
  const handleExpandAll = async () => {
    // 이 기능은 복잡하므로 일단 메시지만 표시
    setMessage("전체 펼치기/접기 기능은 곧 추가될 예정입니다.");
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
    <Card style={containerStyles}>
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
            <Button variant="ghost" size="sm" onClick={handleExpandAll}>
              📂 전체 펼치기
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
                    key={todo.id}
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
