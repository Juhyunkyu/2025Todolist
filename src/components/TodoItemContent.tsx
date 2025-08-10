import React from "react";
import { Input } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface TodoItemContentProps {
  todo: {
    title: string;
    isDone: boolean;
  };
  isEditing: boolean;
  editTitle: string;
  onTitleChange: (title: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onDoubleClick: () => void;
}

const TodoItemContent: React.FC<TodoItemContentProps> = ({
  todo,
  isEditing,
  editTitle,
  onTitleChange,
  onSave,
  onCancel,
  onDoubleClick,
}) => {
  const { currentTheme } = useTheme();

  const titleStyles: React.CSSProperties = {
    flex: 1,
    fontSize: currentTheme.typography.fontSize.base,
    fontWeight: currentTheme.typography.fontWeight.normal,
    color: todo.isDone
      ? currentTheme.colors.text.secondary
      : currentTheme.colors.text.primary,
    textDecoration: todo.isDone ? "line-through" : "none",
    opacity: todo.isDone ? 0.7 : 1,
    cursor: "pointer",
  };

  if (isEditing) {
    return (
      <Input
        value={editTitle}
        onChange={(e) => onTitleChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") onSave();
          if (e.key === "Escape") onCancel();
        }}
        style={{ flex: 1 }}
        autoFocus
        aria-label="할일 제목 편집"
      />
    );
  }

  return (
    <span
      style={titleStyles}
      onDoubleClick={onDoubleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onDoubleClick();
        }
      }}
      aria-label={`할일: ${todo.title}`}
    >
      {todo.title}
    </span>
  );
};

export default TodoItemContent;
