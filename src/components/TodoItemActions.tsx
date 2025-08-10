import React, { useState } from "react";
import { Button } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";
import { EditIcon, AddIcon, CopyIcon, DeleteIcon } from "./icons/ActionIcons";

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
  const [hoveredButton, setHoveredButton] = useState<string | null>(null);

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
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
  };

  const buttonHoverStyle = {
    ...buttonStyle,
    backgroundColor: currentTheme.colors.background.secondary,
    border: `1px solid ${currentTheme.colors.border.default}`,
    transform: "translateY(-1px)",
    boxShadow: `0 2px 4px rgba(0, 0, 0, 0.1)`,
  };

  const iconColor = currentTheme.colors.text.secondary;

  return (
    <div style={buttonGroupStyles}>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        style={hoveredButton === "edit" ? buttonHoverStyle : buttonStyle}
        onMouseEnter={() => setHoveredButton("edit")}
        onMouseLeave={() => setHoveredButton(null)}
        aria-label="편집"
      >
        <EditIcon size={14} color={iconColor} />
      </Button>
      {canAddChild && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onAddChild();
          }}
          style={hoveredButton === "add" ? buttonHoverStyle : buttonStyle}
          onMouseEnter={() => setHoveredButton("add")}
          onMouseLeave={() => setHoveredButton(null)}
          aria-label="하위 항목 추가"
        >
          <AddIcon size={14} color={iconColor} />
        </Button>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onCopy();
        }}
        style={hoveredButton === "copy" ? buttonHoverStyle : buttonStyle}
        onMouseEnter={() => setHoveredButton("copy")}
        onMouseLeave={() => setHoveredButton(null)}
        aria-label="복사"
      >
        <CopyIcon size={14} color={iconColor} />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        style={hoveredButton === "delete" ? buttonHoverStyle : buttonStyle}
        onMouseEnter={() => setHoveredButton("delete")}
        onMouseLeave={() => setHoveredButton(null)}
        aria-label="삭제"
      >
        <DeleteIcon size={14} color={iconColor} />
      </Button>
    </div>
  );
};

export default TodoItemActions;
