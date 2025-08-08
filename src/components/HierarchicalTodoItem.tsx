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
} from "@/lib/db";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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

  // 드래그앤드롭 훅 (최상위 레벨에서만 사용)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: todo.id,
    disabled: level > 0, // 하위 항목은 드래그 비활성화
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

  // 스타일 계산 (메모이제이션)
  const indentSize = useMemo(() => level * 24, [level]);
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

  // 레벨별 색상 구분 (메모이제이션)
  const itemColors = useMemo(() => {
    if (isDragging) {
      return {
        backgroundColor: currentTheme.colors.primary.brandHover,
        borderColor: currentTheme.colors.primary.brand,
      };
    }

    if (level === 0) {
      // 최상위 항목: 더 진한 배경색과 강조 테두리
      return {
        backgroundColor: currentTheme.colors.background.primary,
        borderColor: currentTheme.colors.primary.brand,
      };
    } else {
      // 하위 항목: 연한 배경색과 기본 테두리
      return {
        backgroundColor: currentTheme.colors.background.secondary,
        borderColor: currentTheme.colors.border.default,
      };
    }
  }, [isDragging, level, currentTheme.colors]);

  const itemStyles: React.CSSProperties = useMemo(
    () => ({
      ...dragStyle, // dragStyle을 먼저 적용
      marginLeft: `${indentSize}px`,
      marginBottom: currentTheme.spacing["2"],
      padding: currentTheme.spacing["3"],
      backgroundColor: itemColors.backgroundColor,
      border: `1px solid ${itemColors.borderColor}`,
      borderRadius: currentTheme.borderRadius.md,
      borderLeft:
        level === 0
          ? `4px solid ${currentTheme.colors.primary.brand}` // 최상위 항목에 강조 왼쪽 테두리
          : `4px solid ${currentTheme.colors.background.tertiary}`, // 하위 항목에 연한 왼쪽 테두리
      transition: isDragging
        ? "none"
        : `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`, // 우리의 transition이 마지막에 적용되도록
      cursor: level === 0 ? "grab" : "default",
      boxShadow:
        level === 0
          ? `0 2px 4px ${currentTheme.colors.primary.brand}20` // 최상위 항목에 은은한 그림자
          : "none",
    }),
    [dragStyle, indentSize, currentTheme, itemColors, level, isDragging]
  );

  const headerStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      alignItems: "center",
      gap: currentTheme.spacing["2"],
      marginBottom:
        hasChildren && todo.isExpanded ? currentTheme.spacing["2"] : "0",
    }),
    [currentTheme.spacing, hasChildren, todo.isExpanded]
  );

  const titleStyles: React.CSSProperties = useMemo(
    () => ({
      flex: 1,
      fontSize:
        level === 0
          ? currentTheme.typography.fontSize.lg // 최상위: 큰 폰트
          : currentTheme.typography.fontSize.base, // 하위: 기본 폰트
      fontWeight:
        level === 0
          ? currentTheme.typography.fontWeight.bold // 최상위: 볼드
          : currentTheme.typography.fontWeight.medium, // 하위: 미디움
      color: todo.isDone
        ? currentTheme.colors.text.secondary
        : level === 0
        ? currentTheme.colors.text.primary // 최상위: 진한 텍스트
        : currentTheme.colors.text.secondary, // 하위: 연한 텍스트 (더 부드러운 느낌)
      textDecoration: todo.isDone ? "line-through" : "none",
      opacity: todo.isDone ? 0.7 : 1,
      cursor: "pointer",
    }),
    [level, currentTheme.typography, currentTheme.colors.text, todo.isDone]
  );

  const buttonGroupStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["1"],
      alignItems: "center",
    }),
    [currentTheme.spacing]
  );

  const addChildStyles: React.CSSProperties = useMemo(
    () => ({
      display: "flex",
      gap: currentTheme.spacing["2"],
      marginTop: currentTheme.spacing["2"],
      paddingLeft: currentTheme.spacing["6"],
    }),
    [currentTheme.spacing]
  );

  // 확장/축소 아이콘 (메모이제이션)
  const getExpansionIcon = useMemo(() => {
    if (!hasChildren) return null;
    return todo.isExpanded ? "▼" : "▶";
  }, [hasChildren, todo.isExpanded]);

  // 체크박스 아이콘 (메모이제이션)
  const getCheckboxIcon = useMemo(() => {
    if (isLoading) return "⏳";
    return todo.isDone ? "☑️" : "⬜";
  }, [isLoading, todo.isDone]);

  return (
    <div>
      {/* 메인 항목 */}
      <div
        ref={setNodeRef}
        style={itemStyles}
        {...attributes}
        {...(level === 0 ? listeners : {})} // 최상위에서만 드래그 리스너 적용
      >
        <div style={headerStyles}>
          {/* 확장/축소 버튼 */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleExpansionToggle}
              style={{
                minWidth: "24px",
                width: "24px",
                height: "24px",
                padding: "0",
                fontSize: "12px",
              }}
            >
              {getExpansionIcon}
            </Button>
          )}

          {/* 체크박스 */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            disabled={isLoading}
            style={{
              minWidth: "24px",
              width: "24px",
              height: "24px",
              padding: "0",
              fontSize: "16px",
            }}
          >
            {getCheckboxIcon}
          </Button>

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

          {/* 진행률 표시 */}
          {showProgress && !isEditing && (
            <Badge
              variant={level === 0 ? "info" : "default"}
              size={level === 0 ? "md" : "sm"}
              style={
                level === 0
                  ? {
                      backgroundColor: `${currentTheme.colors.primary.brand}20`,
                      color: currentTheme.colors.primary.brand,
                      borderColor: `${currentTheme.colors.primary.brand}40`,
                      borderWidth: "1px",
                      borderStyle: "solid",
                      fontWeight: currentTheme.typography.fontWeight.semibold,
                    }
                  : undefined
              }
            >
              {progress.completed}/{progress.total} ({progress.percentage}%)
            </Badge>
          )}

          {/* 복사 상태 피드백 */}
          {copyStatus && !isEditing && (
            <Badge
              variant={copyStatus.includes("❌") ? "error" : "success"}
              size="sm"
              style={{
                fontSize: "10px",
                animation: `fadeInOut 2s ease-in-out`,
              }}
            >
              {copyStatus}
            </Badge>
          )}

          {/* 버튼 그룹 */}
          <div style={buttonGroupStyles}>
            {isEditing ? (
              <>
                <Button variant="primary" size="sm" onClick={handleSaveEdit}>
                  저장
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelEdit}
                >
                  취소
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  style={{ fontSize: "12px" }}
                  title="제목 수정"
                >
                  ✏️
                </Button>

                {/* 하위 항목 추가 버튼 - 모든 레벨에서 사용 가능 */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsAddingChild(true)}
                  style={{ fontSize: "12px" }}
                  title="하위 항목 추가"
                >
                  ➕
                </Button>

                {/* 복사 버튼 (최상위에서만) */}
                {level === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopyAsMarkdown}
                    style={{ fontSize: "12px" }}
                    title="마크다운으로 복사"
                  >
                    📋
                  </Button>
                )}

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleDelete}
                  style={{
                    fontSize: "12px",
                    color: currentTheme.colors.status.error,
                  }}
                  title="삭제"
                >
                  🗑️
                </Button>
              </>
            )}
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
      </div>

      {/* 자식 항목들 (재귀 렌더링) */}
      {todo.isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <HierarchicalTodoItem
              key={child.id}
              todo={child}
              level={level + 1}
              onUpdate={onUpdate}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HierarchicalTodoItem;
export type { HierarchicalTodo, HierarchicalTodoItemProps };
