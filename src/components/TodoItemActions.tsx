import React from "react";
import { Button } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface TodoItemActionsProps {
  isEditing: boolean;
  onEdit: () => void;
  onAddChild: () => void;
  onCopy: () => void;
  onDelete: () => void;
  showActions: boolean;
}

const TodoItemActions: React.FC<TodoItemActionsProps> = ({
  isEditing,
  onEdit,
  onAddChild,
  onCopy,
  onDelete,
  showActions,
}) => {
  const { currentTheme } = useTheme();

  const buttonGroupStyles: React.CSSProperties = {
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
  };

  const buttonStyle = {
    minWidth: "24px",
    width: "24px",
    height: "24px",
    padding: "0",
    fontSize: "12px",
  };

  return (
    <div style={buttonGroupStyles}>
      <Button
        variant="ghost"
        size="sm"
        onClick={onEdit}
        style={buttonStyle}
        aria-label="편집"
      >
        ✏️
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onAddChild}
        style={buttonStyle}
        aria-label="하위 항목 추가"
      >
        ➕
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onCopy}
        style={buttonStyle}
        aria-label="복사"
      >
        📋
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
        style={buttonStyle}
        aria-label="삭제"
      >
        🗑️
      </Button>
    </div>
  );
};

export default TodoItemActions;
