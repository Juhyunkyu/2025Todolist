"use client";

import React, { useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { useHierarchicalTodoItem } from "@/hooks/useHierarchicalTodoItem";
import TodoItemActions from "./TodoItemActions";
import TodoItemContent from "./TodoItemContent";
import AddChildInput from "./AddChildInput";
import AddTodo from "./AddTodo";
import {
  ExpandIcon,
  CollapseIcon,
  CheckIcon,
  CircleIcon,
  LoadingIcon,
} from "./icons/ActionIcons";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

// 상수 정의
const MAX_HIERARCHY_LEVEL = 2; // 최대 2단계까지만 허용

// 계층적 할일 아이템 타입 정의
interface HierarchicalTodo {
  id: string;
  title: string;
  isDone: boolean;
  parentId?: string;
  children: string[]; // 자식 항목들의 ID 배열 (데이터베이스 저장용)
  isExpanded: boolean;
  order: number;
  tags: string[];
  date: string | null; // 날짜가 설정되지 않을 수 있음
  repeat: "none" | "daily" | "weekly" | "monthly";
  alarmTime?: string;
  createdAt: string;
  updatedAt: string;
}

interface HierarchicalTodoItemProps {
  todo: HierarchicalTodo;
  level?: number;
  onUpdate: () => void;
  isLast?: boolean; // 마지막 항목인지 여부
}

const HierarchicalTodoItem: React.FC<HierarchicalTodoItemProps> = React.memo(
  ({ todo, level = 0, onUpdate }) => {
    const { currentTheme } = useTheme();

    // 커스텀 훅 사용
    const {
      isEditing,
      editTitle,
      isAddingChild,
      newChildTitle,
      children,
      isLoading,
      showActions,
      error,
      handleToggle,
      handleExpansionToggle,
      handleSaveEdit,
      handleCancelEdit,
      handleAddChild,
      handleDelete,
      handleCopyAsMarkdown,
      handleChildDragEnd,
      setIsEditing,
      setEditTitle,
      setIsAddingChild,
      setNewChildTitle,
      setShowActions,
      setError,
    } = useHierarchicalTodoItem({ todo, onUpdate, level });

    // 최상위 할일 수정 모드 상태
    const [isFullEditMode, setIsFullEditMode] = useState(false);

    const handleFullEditCancel = useCallback(() => {
      setIsFullEditMode(false);
      handleCancelEdit();
    }, [handleCancelEdit]);

    // 드래그앤드롭 센서 설정
    const sensors = useSensors(
      useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
      }),
      useSensor(KeyboardSensor, {
        coordinateGetter: sortableKeyboardCoordinates,
      })
    );

    // 드래그앤드롭 훅
    const { attributes, listeners, setNodeRef, transform, isDragging } =
      useSortable({
        id: todo.id,
        disabled: false,
      });

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
    const isMobile = screenWidth < 400;

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

    // 스타일 계산 (메모이제이션)
    const styles = useMemo(
      () => ({
        item: {
          transform: CSS.Transform.toString(transform),
          opacity: isDragging ? 0.5 : 1,
          zIndex: isDragging ? 1000 : 1,
          display: "flex",
          alignItems: "center",
          paddingTop: getDynamicSpacing(currentTheme.spacing["2"]),
          paddingBottom: getDynamicSpacing(currentTheme.spacing["2"]),
          paddingRight: 0,
          marginLeft: isMobile ? `${level * 8}px` : `${level * 16}px`, // 모바일에서 들여쓰기 줄임
          backgroundColor: currentTheme.colors.background.primary,
          transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
          position: "relative" as const,
          minHeight: isMobile ? "32px" : "40px",
          // 계층 레벨에 따른 시각적 구분
          paddingLeft:
            level > 0
              ? isMobile
                ? getDynamicSpacing(currentTheme.spacing["2"])
                : getDynamicSpacing(currentTheme.spacing["3"])
              : 0,
        },
        header: {
          display: "flex",
          flexDirection: "column" as const,
          flex: 1,
          paddingLeft:
            level > 0
              ? isMobile
                ? getDynamicSpacing(currentTheme.spacing["1"])
                : getDynamicSpacing(currentTheme.spacing["2"])
              : 0,
        },
        titleRow: {
          display: "flex",
          alignItems: "flex-start", // 상단 정렬로 변경하여 고정 위치 유지
          gap: isMobile
            ? getDynamicSpacing(currentTheme.spacing["1"])
            : getDynamicSpacing(currentTheme.spacing["2"]),
          width: "100%",
        },
        titleSection: {
          display: "flex",
          flexDirection: "column" as const,
          flex: 1,
        },
        expansionButton: {
          background: "none",
          border: "none",
          fontSize: "18px",
          color: currentTheme.colors.text.secondary,
          cursor: "pointer",
          width: "20px",
          height: "24px", // 고정 높이로 설정
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          flexShrink: 0, // 크기 고정
        },
        checkboxButton: {
          background: "none",
          border: "none",
          fontSize: "16px",
          color: todo.isDone
            ? currentTheme.colors.primary.brand
            : currentTheme.colors.text.secondary,
          cursor: "pointer",
          width: "20px",
          height: "24px", // 고정 높이로 설정
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 0,
          flexShrink: 0, // 크기 고정
        },

        error: {
          color: currentTheme.colors.status.error,
          fontSize: currentTheme.typography.fontSize.sm,
          marginTop: currentTheme.spacing["1"],
          paddingLeft: currentTheme.spacing["6"],
        },
      }),
      [
        currentTheme,
        level,
        todo.isDone,
        transform,
        isDragging,
        getDynamicSpacing,
        isMobile,
      ]
    );

    // 확장/축소 아이콘 (간단한 계산이므로 useMemo 불필요)
    const expansionIcon =
      todo.children.length > 0 ? (
        todo.isExpanded ? (
          <CollapseIcon size={16} color={currentTheme.colors.text.secondary} />
        ) : (
          <ExpandIcon size={16} color={currentTheme.colors.text.secondary} />
        )
      ) : null;

    // 체크박스 아이콘 (간단한 계산이므로 useMemo 불필요)
    const checkboxIcon = isLoading ? (
      <LoadingIcon size={16} color={currentTheme.colors.text.secondary} />
    ) : todo.isDone ? (
      <CheckIcon size={16} color={currentTheme.colors.primary.brand} />
    ) : (
      <CircleIcon size={16} color={currentTheme.colors.text.secondary} />
    );

    // 최상위 할일이고 전체 수정 모드일 때 AddTodo 컴포넌트를 수정 모드로 렌더링
    if (level === 0 && isFullEditMode) {
      return (
        <AddTodo
          isEditMode={true}
          editTodo={todo}
          onAdd={() => {}} // 수정 모드에서는 사용되지 않음
          onEdit={async () => {
            try {
              // 기존 수정 로직과 통합
              await handleSaveEdit();
              setIsFullEditMode(false);
            } catch (error) {
              console.error("Failed to save todo:", error);
            }
          }}
          onCancel={handleFullEditCancel}
        />
      );
    }

    return (
      <div>
        {/* 메인 항목 */}
        <div
          ref={setNodeRef}
          style={styles.item}
          {...attributes}
          {...listeners}
          onClick={() => setShowActions(!showActions)}
          onBlur={(e) => {
            // 다른 요소로 포커스가 이동했을 때 액션 버튼 숨기기
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setShowActions(false);
            }
          }}
          role="treeitem"
          aria-expanded={todo.isExpanded}
          aria-checked={todo.isDone}
          aria-selected={false}
          tabIndex={0}
        >
          <div style={styles.header}>
            {/* 제목 행 */}
            <div style={styles.titleRow}>
              {/* 확장/축소 버튼 또는 투명한 플레이스홀더 */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (todo.children.length > 0) {
                    handleExpansionToggle();
                  }
                }}
                style={{
                  ...styles.expansionButton,
                  opacity: todo.children.length > 0 ? 1 : 0, // 하위 항목이 없으면 투명하게
                  cursor: todo.children.length > 0 ? "pointer" : "default",
                }}
                aria-label={
                  todo.children.length > 0
                    ? todo.isExpanded
                      ? "접기"
                      : "펼치기"
                    : ""
                }
                disabled={todo.children.length === 0}
              >
                {expansionIcon || " "} {/* 하위 항목이 없으면 공백 문자 */}
              </button>

              {/* 체크박스 - 이제 들여쓰기 불필요 (플레이스홀더로 정렬됨) */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleToggle();
                }}
                disabled={isLoading}
                style={styles.checkboxButton}
                aria-label={todo.isDone ? "완료 취소" : "완료"}
              >
                {checkboxIcon}
              </button>

              {/* 제목 섹션 (제목 + 액션 버튼들) */}
              <div style={styles.titleSection}>
                {/* 제목 또는 수정 입력 */}
                <TodoItemContent
                  todo={todo}
                  isEditing={isEditing}
                  editTitle={editTitle}
                  onTitleChange={setEditTitle}
                  onSave={handleSaveEdit}
                  onCancel={handleCancelEdit}
                  onDoubleClick={() => {
                    if (level === 0) {
                      // 최상위 할일이면 전체 수정 모드로 전환
                      setIsFullEditMode(true);
                    } else {
                      // 하위 할일이면 기존 수정 모드
                      setIsEditing(true);
                    }
                  }}
                />

                {/* 액션 버튼들 - 텍스트 바로 아래에 표시 (수정 모드가 아닐 때만) */}
                {showActions && !isEditing && (
                  <div
                    style={{
                      display: "flex",
                      marginTop: getDynamicSpacing(currentTheme.spacing["2"]),
                    }}
                  >
                    <TodoItemActions
                      onEdit={() => {
                        if (level === 0) {
                          // 최상위 할일이면 전체 수정 모드로 전환
                          setIsFullEditMode(true);
                        } else {
                          // 하위 할일이면 기존 수정 모드
                          setIsEditing(true);
                        }
                      }}
                      onAddChild={() => setIsAddingChild(true)}
                      onCopy={handleCopyAsMarkdown}
                      onDelete={handleDelete}
                      level={level}
                      maxLevel={MAX_HIERARCHY_LEVEL}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div style={styles.error}>
            ❌ {error}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              style={{ marginLeft: "8px" }}
            >
              ✕
            </Button>
          </div>
        )}

        {/* 자식 항목 추가 UI */}
        {isAddingChild && level < MAX_HIERARCHY_LEVEL && (
          <AddChildInput
            value={newChildTitle}
            onChange={setNewChildTitle}
            onSave={handleAddChild}
            onCancel={() => {
              setNewChildTitle("");
              setIsAddingChild(false);
            }}
            level={level}
          />
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
  }
);

HierarchicalTodoItem.displayName = "HierarchicalTodoItem";

export default HierarchicalTodoItem;
export type { HierarchicalTodo, HierarchicalTodoItemProps };
