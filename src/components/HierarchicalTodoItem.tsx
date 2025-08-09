"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button, Input, Badge } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import {
  toggleHierarchicalTodo,
  toggleHierarchicalTodoExpansion,
  updateHierarchicalTodo,
  deleteHierarchicalTodo,
  addHierarchicalTodo,
  getHierarchicalTodosByParent,
  getHierarchicalTodoProgress,
  copySingleHierarchicalTodoAsMarkdown,
  reorderHierarchicalTodos,
} from "@/lib/db";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

// 계층적 할일 아이템 타입 정의
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

interface HierarchicalTodoItemProps {
  todo: HierarchicalTodo;
  level?: number;
  onUpdate: () => void;
}

const HierarchicalTodoItem: React.FC<HierarchicalTodoItemProps> = ({
  todo,
  level = 0,
  onUpdate,
}) => {
  const { currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [newChildTitle, setNewChildTitle] = useState("");
  const [children, setChildren] = useState<HierarchicalTodo[]>([]);
  const [progress, setProgress] = useState({
    completed: 0,
    total: 0,
    percentage: 0,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [copyStatus, setCopyStatus] = useState<string>("");
  const [showActions, setShowActions] = useState(false);

  // 드래그앤드롭 센서 설정 (하위 항목용)
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

  // 드래그앤드롭 훅 (모든 레벨에서 사용 가능)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: false, // 모든 레벨에서 드래그 활성화
  });

  // 자식 항목들 로드
  const loadChildren = useCallback(async () => {
    if (todo.children.length > 0 && todo.isExpanded) {
      try {
        const childTodos = await getHierarchicalTodosByParent(todo.id);
        setChildren(childTodos);

        // 진행률 계산
        const progressData = await getHierarchicalTodoProgress(todo.id);
        setProgress(progressData);
      } catch (error) {
        console.error("Failed to load children:", error);
      }
    }
  }, [todo.id, todo.children.length, todo.isExpanded]);

  // 컴포넌트 마운트 시 자식들 로드
  React.useEffect(() => {
    loadChildren();
  }, [loadChildren]);

  // 체크박스 토글 (메모이제이션)
  const handleToggle = useCallback(async () => {
    setIsLoading(true);
    try {
      await toggleHierarchicalTodo(todo.id);
      onUpdate();
      await loadChildren(); // 자식들 상태도 업데이트됨
    } catch (error) {
      console.error("Failed to toggle todo:", error);
    } finally {
      setIsLoading(false);
    }
  }, [todo.id, onUpdate, loadChildren]);

  // 접기/펼치기 토글 (메모이제이션)
  const handleExpansionToggle = useCallback(async () => {
    if (todo.children.length === 0) return;

    try {
      await toggleHierarchicalTodoExpansion(todo.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to toggle expansion:", error);
    }
  }, [todo.id, todo.children.length, onUpdate]);

  // 제목 수정 저장 (메모이제이션)
  const handleSaveEdit = useCallback(async () => {
    if (editTitle.trim() === "") return;

    try {
      await updateHierarchicalTodo(todo.id, { title: editTitle.trim() });
      setIsEditing(false);
      onUpdate();
    } catch (error) {
      console.error("Failed to update todo:", error);
    }
  }, [todo.id, editTitle, onUpdate]);

  // 제목 수정 취소 (메모이제이션)
  const handleCancelEdit = useCallback(() => {
    setEditTitle(todo.title);
    setIsEditing(false);
  }, [todo.title]);

  // 자식 항목 추가 (메모이제이션)
  const handleAddChild = useCallback(async () => {
    if (newChildTitle.trim() === "") return;

    try {
      const nextOrder = children.length;
      await addHierarchicalTodo({
        title: newChildTitle.trim(),
        isDone: false,
        parentId: todo.id,
        isExpanded: false,
        order: nextOrder,
        tags: [],
        date: new Date().toISOString(),
        repeat: "none",
      });

      setNewChildTitle("");
      setIsAddingChild(false);
      onUpdate();
      await loadChildren();
    } catch (error) {
      console.error("Failed to add child todo:", error);
    }
  }, [newChildTitle, children.length, todo.id, onUpdate, loadChildren]);

  // 항목 삭제 (메모이제이션)
  const handleDelete = useCallback(async () => {
    if (
      !confirm(
        `"${todo.title}"을(를) 삭제하시겠습니까?${
          todo.children.length > 0 ? " (하위 항목들도 함께 삭제됩니다)" : ""
        }`
      )
    ) {
      return;
    }

    try {
      await deleteHierarchicalTodo(todo.id);
      onUpdate();
    } catch (error) {
      console.error("Failed to delete todo:", error);
    }
  }, [todo.id, todo.title, todo.children.length, onUpdate]);

  // 개별 항목 복사 (마크다운) (메모이제이션)
  const handleCopyAsMarkdown = useCallback(async () => {
    try {
      const markdown = await copySingleHierarchicalTodoAsMarkdown(todo.id);
      await navigator.clipboard.writeText(markdown);
      setCopyStatus("📋 복사 완료!");
      setTimeout(() => setCopyStatus(""), 2000);
    } catch (error) {
      console.error("Failed to copy todo:", error);
      setCopyStatus("❌ 복사 실패");
      setTimeout(() => setCopyStatus(""), 2000);
    }
  }, [todo.id]);

  // 하위 항목 드래그 종료 핸들러 (메모이제이션)
  const handleChildDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const { active, over } = event;

      if (!over || active.id === over.id) {
        return; // 드롭 위치가 없거나 같은 위치면 아무것도 안함
      }

      const activeIndex = children.findIndex((child) => child.id === active.id);
      const overIndex = children.findIndex((child) => child.id === over.id);

      if (activeIndex !== -1 && overIndex !== -1) {
        // 로컬 상태 즉시 업데이트 (UI 반응성)
        const newChildren = arrayMove(children, activeIndex, overIndex);
        setChildren(newChildren);

        try {
          // 데이터베이스에 새 순서 저장
          const newOrder = newChildren.map((child) => child.id);
          await reorderHierarchicalTodos(todo.id, newOrder); // 현재 항목이 부모
          setCopyStatus("📦 순서 변경!");
          setTimeout(() => setCopyStatus(""), 2000);
          onUpdate(); // 상위 컴포넌트에 변경 알림
        } catch (error) {
          console.error("Failed to reorder child todos:", error);
          // 실패시 원래 순서로 되돌리기
          await loadChildren();
          setCopyStatus("❌ 순서 변경 실패");
          setTimeout(() => setCopyStatus(""), 2000);
        }
      }
    },
    [children, todo.id, onUpdate, loadChildren]
  );

  // 스타일 계산 (메모이제이션)
  const hasChildren = useMemo(
    () => todo.children.length > 0,
    [todo.children.length]
  );
  const showProgress = useMemo(
    () => hasChildren && progress.total > 0,
    [hasChildren, progress.total]
  );

  // 드래그 스타일 (메모이제이션)
  const dragStyle = useMemo(
    () => ({
      transform: CSS.Transform.toString(transform),
      transition,
      opacity: isDragging ? 0.5 : 1,
      zIndex: isDragging ? 1000 : 1,
    }),
    [transform, transition, isDragging]
  );

  const itemStyles: React.CSSProperties = useMemo(
    () => ({
      ...dragStyle,
      display: "flex",
      alignItems: "center",
      padding: `${currentTheme.spacing["2"]} 0`,
      marginLeft: `${level * 30}px`, // 하위 목록 들여쓰기 (30px씩 증가, 기존 20px에서 30px로 증가)
      borderBottom: `1px solid ${currentTheme.colors.border.default}`,
      backgroundColor: currentTheme.colors.background.primary,
      transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      position: "relative",
      minHeight: "40px",
    }),
    [
      dragStyle,
      currentTheme.spacing,
      level,
      currentTheme.colors.border.default,
      currentTheme.colors.background.primary,
      currentTheme.animation.duration.fast,
      currentTheme.animation.easing.default,
    ]
  );

  const headerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: currentTheme.spacing["2"],
      flex: 1,
      paddingLeft: level > 0 ? currentTheme.spacing["2"] : 0, // 하위 목록일 때 추가 패딩
    }),
    [currentTheme.spacing, level]
  );

  const titleStyles: React.CSSProperties = useMemo(
    () => ({
      flex: 1,
      fontSize: currentTheme.typography.fontSize.base,
      fontWeight: currentTheme.typography.fontWeight.normal,
      color: todo.isDone
        ? currentTheme.colors.text.secondary
        : currentTheme.colors.text.primary,
      textDecoration: todo.isDone ? "line-through" : "none",
      opacity: todo.isDone ? 0.7 : 1,
      cursor: "pointer",
    }),
    [
      currentTheme.typography.fontSize.base,
      currentTheme.typography.fontWeight.normal,
      currentTheme.colors.text.secondary,
      currentTheme.colors.text.primary,
      todo.isDone,
    ]
  );

  const buttonGroupStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["1"],
      alignItems: "center",
      opacity: showActions ? 1 : 0,
      transition: `opacity ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
      position: "absolute",
      right: 0,
      top: "50%",
      transform: "translateY(-50%)",
      backgroundColor: currentTheme.colors.background.primary,
      padding: currentTheme.spacing["1"],
      borderRadius: currentTheme.borderRadius.sm,
    }),
    [
      currentTheme.spacing,
      showActions,
      currentTheme.colors.background.primary,
      currentTheme.borderRadius.sm,
      currentTheme.animation.duration.fast,
      currentTheme.animation.easing.default,
    ]
  );

  const addChildStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["2"],
      marginTop: currentTheme.spacing["1"],
      paddingLeft: currentTheme.spacing["6"],
    }),
    [currentTheme.spacing]
  );

  // 확장/축소 아이콘 (메모이제이션) - 더 깔끔한 아이콘
  const getExpansionIcon = useMemo(() => {
    if (!hasChildren) return null;
    return todo.isExpanded ? "−" : "+";
  }, [hasChildren, todo.isExpanded]);

  // 둥근 체크박스 아이콘 (메모이제이션)
  const getCheckboxIcon = useMemo(() => {
    if (isLoading) return "⏳";
    return todo.isDone ? "●" : "○";
  }, [isLoading, todo.isDone]);

  return (
    <div>
      {/* 메인 항목 */}
      <div
        ref={setNodeRef}
        style={itemStyles}
        {...attributes}
        {...listeners}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        <div style={headerStyles}>
          {/* 확장/축소 버튼 */}
          {hasChildren && (
            <button
              onClick={handleExpansionToggle}
              style={{
                background: "none",
                border: "none",
                fontSize: "18px",
                color: currentTheme.colors.text.secondary,
                cursor: "pointer",
                width: "20px",
                height: "20px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
              }}
            >
              {getExpansionIcon}
            </button>
          )}

          {/* 둥근 체크박스 */}
          <button
            onClick={handleToggle}
            disabled={isLoading}
            style={{
              background: "none",
              border: "none",
              fontSize: "16px",
              color: todo.isDone
                ? currentTheme.colors.primary.brand
                : currentTheme.colors.text.secondary,
              cursor: "pointer",
              width: "20px",
              height: "20px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
            }}
          >
            {getCheckboxIcon}
          </button>

          {/* 제목 또는 수정 입력 */}
          {isEditing ? (
            <Input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveEdit();
                if (e.key === "Escape") handleCancelEdit();
              }}
              style={{ flex: 1 }}
              autoFocus
            />
          ) : (
            <span style={titleStyles} onDoubleClick={() => setIsEditing(true)}>
              {todo.title}
            </span>
          )}

          {/* 액션 버튼들 (기본적으로 숨김) */}
          <div style={buttonGroupStyles}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(true)}
              style={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: "0",
                fontSize: "12px",
              }}
            >
              ✏️
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsAddingChild(true)}
              style={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: "0",
                fontSize: "12px",
              }}
            >
              ➕
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyAsMarkdown}
              style={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: "0",
                fontSize: "12px",
              }}
            >
              📋
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              style={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: "0",
                fontSize: "12px",
              }}
            >
              🗑️
            </Button>
          </div>
        </div>
      </div>

      {/* 자식 항목 추가 UI */}
      {isAddingChild && (
        <div style={addChildStyles}>
          <Input
            placeholder="하위 항목 제목을 입력하세요..."
            value={newChildTitle}
            onChange={(e) => setNewChildTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddChild();
              if (e.key === "Escape") {
                setNewChildTitle("");
                setIsAddingChild(false);
              }
            }}
            style={{ flex: 1 }}
            autoFocus
          />
          <Button variant="primary" size="sm" onClick={handleAddChild}>
            추가
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setNewChildTitle("");
              setIsAddingChild(false);
            }}
          >
            취소
          </Button>
        </div>
      )}

      {/* 자식 항목들 (재귀 렌더링) */}
      {todo.isExpanded && children.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleChildDragEnd}
        >
          <SortableContext
            items={children.map((child) => child.id)}
            strategy={verticalListSortingStrategy}
          >
            <div>
              {children.map((child) => (
                <HierarchicalTodoItem
                  key={`${child.id}-${child.isExpanded}-${child.updatedAt}`}
                  todo={child}
                  level={level + 1}
                  onUpdate={onUpdate}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default HierarchicalTodoItem;
export type { HierarchicalTodo, HierarchicalTodoItemProps };
