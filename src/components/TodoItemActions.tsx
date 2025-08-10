import React from "react";
import { Button } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface TodoItemActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onAddChild: () => void;
  onCopy: () => void;
  onDelete: () => void;
  level?: number; // 계층 레벨 추가
  maxLevel?: number; // 최대 계층 레벨 추가
}

const TodoItemActions: React.FC<TodoItemActionsProps> = ({
  isEditing,
  onEdit,
  onAddChild,
  onCopy,
  onDelete,
  level = 0,
  maxLevel = 2,
}) => {
  const { currentTheme } = useTheme();

  // 최대 계층 레벨에 도달했는지 확인
  const canAddChild = level < maxLevel;

  const buttonGroupStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["1"],
    alignItems: "center",
    padding: currentTheme.spacing["2"],
    backgroundColor: currentTheme.colors.background.secondary,
    borderRadius: currentTheme.borderRadius.md,
    border: `1px solid ${currentTheme.colors.border.muted}`,
    boxShadow: `0 1px 3px rgba(0, 0, 0, 0.1)`,
  };

  const buttonStyle = {
    minWidth: "28px",
    width: "28px",
    height: "28px",
    padding: "0",
    fontSize: "12px",
    backgroundColor: currentTheme.colors.background.primary,
    border: `1px solid ${currentTheme.colors.border.muted}`,
    borderRadius: currentTheme.borderRadius.sm,
    transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
  };

  return (
    <div style={buttonGroupStyles}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        style={buttonStyle}
        aria-label="편집"
      >
        ✏️
      </Button>
      {canAddChild && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          style={buttonStyle}
          aria-label="하위 항목 추가"
        >
          ➕
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        style={buttonStyle}
        aria-label="복사"
      >
        📋
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={buttonStyle}
        aria-label="삭제"
      >
        🗑️
      </Button>
    </div>
  );
};

export default TodoItemActions;
