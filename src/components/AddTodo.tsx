"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, Input } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface AddTodoProps {
  onAdd: (todo: {
    title: string;
    date: string;
    alarmTime?: string;
    isPinned?: boolean;
  }) => void;
  onCancel: () => void;
  initialDate?: string; // 초기 날짜 (오늘 탭에서 사용)
}

const AddTodo: React.FC<AddTodoProps> = ({ onAdd, onCancel, initialDate }) => {
  const { currentTheme } = useTheme();
  const [title, setTitle] = useState("");
  const [date, setDate] = useState(
    initialDate || new Date().toISOString().split("T")[0]
  );
  const [alarmTime, setAlarmTime] = useState("");
  const [isPinned, setIsPinned] = useState(false);

  // 초기 날짜가 변경되면 업데이트
  useEffect(() => {
    if (initialDate) {
      setDate(initialDate);
    }
  }, [initialDate]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim()) {
        onAdd({
          title: title.trim(),
          date,
          alarmTime: alarmTime || undefined,
          isPinned,
        });
      }
    },
    [title, date, alarmTime, isPinned, onAdd]
  );

  const handleTodayClick = useCallback(() => {
    setDate(new Date().toISOString().split("T")[0]);
  }, []);

  const handleTomorrowClick = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setDate(tomorrow.toISOString().split("T")[0]);
  }, []);

  const containerStyles: React.CSSProperties = {
    padding: currentTheme.spacing["4"],
    backgroundColor: currentTheme.colors.background.secondary,
    border: `1px solid ${currentTheme.colors.border.default}`,
    borderRadius: currentTheme.borderRadius.md,
    marginBottom: currentTheme.spacing["4"],
  };

  const headerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: currentTheme.spacing["3"],
  };

  const leftActionsStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    alignItems: "center",
  };

  const rightActionsStyles: React.CSSProperties = {
    display: "flex",
    gap: currentTheme.spacing["2"],
    alignItems: "center",
  };

  const dateButtonStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: currentTheme.spacing["1"],
    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`,
    backgroundColor: currentTheme.colors.background.tertiary,
    border: `1px solid ${currentTheme.colors.border.default}`,
    borderRadius: currentTheme.borderRadius.sm,
    fontSize: currentTheme.typography.fontSize.sm,
    color: currentTheme.colors.text.primary,
    cursor: "pointer",
    transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
  };

  const actionButtonStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "32px",
    height: "32px",
    backgroundColor: currentTheme.colors.background.tertiary,
    border: `1px solid ${currentTheme.colors.border.default}`,
    borderRadius: currentTheme.borderRadius.sm,
    cursor: "pointer",
    transition: `all ${currentTheme.animation.duration.fast} ${currentTheme.animation.easing.default}`,
  };

  const activeActionButtonStyles: React.CSSProperties = {
    ...actionButtonStyles,
    backgroundColor: currentTheme.colors.primary.brand,
    color: currentTheme.colors.text.inverse,
  };

  const footerStyles: React.CSSProperties = {
    display: "flex",
    justifyContent: "flex-end",
    gap: currentTheme.spacing["2"],
    marginTop: currentTheme.spacing["3"],
  };

  return (
    <div style={containerStyles}>
      <form onSubmit={handleSubmit}>
        {/* 헤더 */}
        <div style={headerStyles}>
          {/* 왼쪽 액션 */}
          <div style={leftActionsStyles}>
            <button
              type="button"
              style={dateButtonStyles}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "date";
                input.value = date;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  if (target.value) {
                    setDate(target.value);
                  }
                };
                input.click();
              }}
            >
              📅 {date}
            </button>
            <button
              type="button"
              style={dateButtonStyles}
              onClick={handleTodayClick}
            >
              오늘
            </button>
            <button
              type="button"
              style={dateButtonStyles}
              onClick={handleTomorrowClick}
            >
              내일
            </button>
          </div>

          {/* 오른쪽 액션 */}
          <div style={rightActionsStyles}>
            <button
              type="button"
              style={alarmTime ? activeActionButtonStyles : actionButtonStyles}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "time";
                input.value = alarmTime;
                input.onchange = (e) => {
                  const target = e.target as HTMLInputElement;
                  setAlarmTime(target.value);
                };
                input.click();
              }}
              title="알람 설정"
            >
              ⏰
            </button>
            <button
              type="button"
              style={isPinned ? activeActionButtonStyles : actionButtonStyles}
              onClick={() => setIsPinned(!isPinned)}
              title="상단 고정"
            >
              📌
            </button>
          </div>
        </div>

        {/* 제목 입력 */}
        <Input
          placeholder="할일을 입력하세요..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "100%",
            marginBottom: currentTheme.spacing["3"],
          }}
          autoFocus
        />

        {/* 푸터 */}
        <div style={footerStyles}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
          >
            취소
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            disabled={!title.trim()}
          >
            추가
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AddTodo;
