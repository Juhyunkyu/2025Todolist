"use client";

import React, { useState, useCallback, useEffect } from "react";
import { Button, Input, Calendar } from "@/components/ui";
import { useTheme } from "@/contexts/ThemeContext";

interface AddTodoProps {
  onAdd: (todo: {
    title: string;
    date: string | null;
    alarmTime?: string;
    isPinned?: boolean;
  }) => void;
  onCancel: () => void;
  initialDate?: string;
  // 수정 모드용 props 추가
  isEditMode?: boolean;
  editTodo?: {
    id: string;
    title: string;
    date: string | null;
    alarmTime?: string;
    tags: string[];
  };
  onEdit?: (updates: {
    title: string;
    date: string | null;
    alarmTime?: string;
    isPinned?: boolean;
  }) => void;
}

// 세련된 SVG 아이콘들
const CalendarIcon = ({
  color = "currentColor",
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect
      x="3"
      y="4"
      width="18"
      height="18"
      rx="2"
      stroke={color}
      strokeWidth="2"
    />
    <path d="M3 10H21" stroke={color} strokeWidth="2" />
    <path d="M8 2L8 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <path d="M16 2L16 6" stroke={color} strokeWidth="2" strokeLinecap="round" />
    <circle cx="8" cy="14" r="1" fill={color} />
    <circle cx="12" cy="14" r="1" fill={color} />
    <circle cx="16" cy="14" r="1" fill={color} />
    <circle cx="8" cy="18" r="1" fill={color} />
    <circle cx="12" cy="18" r="1" fill={color} />
    <circle cx="16" cy="18" r="1" fill={color} />
  </svg>
);

const ClockIcon = ({
  color = "currentColor",
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="2" />
    <path
      d="M12 6V12L16 14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const PinIcon = ({
  color = "currentColor",
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12 2L15.09 8.26L22 9L16.91 13.74L18.18 20.02L12 16.77L5.82 20.02L7.09 13.74L2 9L8.91 8.26L12 2Z"
      fill={color}
    />
  </svg>
);

const CloseIcon = ({
  color = "currentColor",
  size = 16,
}: {
  color?: string;
  size?: number;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18 6L6 18M6 6L18 18"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const AddTodo: React.FC<AddTodoProps> = ({
  onAdd,
  onCancel,
  initialDate,
  isEditMode = false,
  editTodo,
  onEdit,
}) => {
  const { currentTheme } = useTheme();
  const [title, setTitle] = useState(
    isEditMode && editTodo ? editTodo.title : ""
  );
  const [date, setDate] = useState<string | null>(
    isEditMode && editTodo ? editTodo.date : initialDate || null
  );
  const [alarmTime, setAlarmTime] = useState(
    isEditMode && editTodo ? editTodo.alarmTime || "" : ""
  );
  const [isPinned, setIsPinned] = useState(
    isEditMode && editTodo ? editTodo.tags.includes("상단고정") : false
  );
  const [isDateSelected, setIsDateSelected] = useState(false);
  const [isTodaySelected, setIsTodaySelected] = useState(false);
  const [isTomorrowSelected, setIsTomorrowSelected] = useState(false);

  const [showCalendar, setShowCalendar] = useState(false);

  // 날짜 관련 유틸리티 함수들
  const getTodayString = useCallback(() => {
    return new Date().toISOString().split("T")[0];
  }, []);

  const getTomorrowString = useCallback(() => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split("T")[0];
  }, []);

  const formatDisplayDate = useCallback((dateStr: string | null) => {
    if (!dateStr) return "날짜 없음";
    const date = new Date(dateStr);
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dayOfWeek = ["일", "월", "화", "수", "목", "금", "토"][date.getDay()];
    return `${month}.${day}(${dayOfWeek})`;
  }, []);

  // 초기 날짜 설정
  useEffect(() => {
    const targetDate = isEditMode && editTodo ? editTodo.date : initialDate;
    if (targetDate) {
      setDate(targetDate);
      const today = getTodayString();
      const tomorrow = getTomorrowString();

      setIsTodaySelected(targetDate === today);
      setIsTomorrowSelected(targetDate === tomorrow);
      setIsDateSelected(targetDate !== today && targetDate !== tomorrow);
    }
  }, [initialDate, editTodo, isEditMode, getTodayString, getTomorrowString]);

  // 날짜 선택 핸들러들
  const handleDatePickerChange = useCallback(
    (selectedDate: string) => {
      setDate(selectedDate);
      setIsDateSelected(true);

      const today = getTodayString();
      const tomorrow = getTomorrowString();

      setIsTodaySelected(selectedDate === today);
      setIsTomorrowSelected(selectedDate === tomorrow);
    },
    [getTodayString, getTomorrowString]
  );

  const handleTodayClick = useCallback(() => {
    const today = getTodayString();
    if (isTodaySelected) {
      // 해제 - 날짜 없음으로 변경
      setIsTodaySelected(false);
      setIsTomorrowSelected(false);
      setIsDateSelected(false);
      setDate(null);
    } else {
      // 선택
      setIsTodaySelected(true);
      setIsTomorrowSelected(false);
      setIsDateSelected(false);
      setDate(today);
    }
  }, [isTodaySelected, getTodayString]);

  const handleTomorrowClick = useCallback(() => {
    const tomorrow = getTomorrowString();
    if (isTomorrowSelected) {
      // 해제 - 날짜 없음으로 변경
      setIsTomorrowSelected(false);
      setIsTodaySelected(false);
      setIsDateSelected(false);
      setDate(null);
    } else {
      // 선택
      setIsTomorrowSelected(true);
      setIsTodaySelected(false);
      setIsDateSelected(false);
      setDate(tomorrow);
    }
  }, [isTomorrowSelected, getTomorrowString]);

  const handleClearDate = useCallback(() => {
    setIsDateSelected(false);
    setIsTodaySelected(false);
    setIsTomorrowSelected(false);
    setDate(null);
  }, []);

  const handleCalendarClick = useCallback(() => {
    setShowCalendar(true);
  }, []);

  const handleCalendarDateSelect = useCallback((selectedDate: string) => {
    setDate(selectedDate);
    setIsDateSelected(true);
    setIsTodaySelected(false);
    setIsTomorrowSelected(false);
    setShowCalendar(false);
  }, []);

  const handleCalendarClose = useCallback(() => {
    setShowCalendar(false);
  }, []);

  // 알람 시간 설정 함수
  const openTimePicker = useCallback(() => {
    const input = document.createElement("input");
    input.type = "time";
    input.value = alarmTime;
    input.style.position = "absolute";
    input.style.left = "-9999px";
    input.style.opacity = "0";
    document.body.appendChild(input);

    const handleChange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      setAlarmTime(target.value);
      document.body.removeChild(input);
      input.removeEventListener("change", handleChange);
    };

    input.addEventListener("change", handleChange);
    input.click();
  }, [alarmTime]);

  // 폼 제출
  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (title.trim() === "") return;

      const todoData = {
        title: title.trim(),
        date,
        alarmTime: alarmTime || undefined,
        isPinned,
      };

      if (isEditMode && onEdit) {
        onEdit(todoData);
      } else {
        onAdd(todoData);
      }
    },
    [title, date, alarmTime, isPinned, onAdd, onEdit, isEditMode]
  );

  // 스타일 정의
  const containerStyles: React.CSSProperties = {
    padding: currentTheme.spacing["4"],
    backgroundColor: currentTheme.colors.background.secondary,
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

  const baseButtonStyles: React.CSSProperties = {
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

  const todayButtonStyles: React.CSSProperties = {
    ...baseButtonStyles,
    backgroundColor: isTodaySelected
      ? currentTheme.colors.primary.brand
      : currentTheme.colors.background.tertiary,
    color: isTodaySelected
      ? currentTheme.colors.text.inverse
      : currentTheme.colors.text.primary,
  };

  const tomorrowButtonStyles: React.CSSProperties = {
    ...baseButtonStyles,
    backgroundColor: isTomorrowSelected
      ? currentTheme.colors.primary.brand
      : currentTheme.colors.background.tertiary,
    color: isTomorrowSelected
      ? currentTheme.colors.text.inverse
      : currentTheme.colors.text.primary,
  };

  const selectedDateStyles: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: currentTheme.spacing["2"],
    padding: `${currentTheme.spacing["1"]} ${currentTheme.spacing["2"]}`,
    backgroundColor: currentTheme.colors.primary.brand + "20",
    border: `1px solid ${currentTheme.colors.primary.brand}`,
    borderRadius: currentTheme.borderRadius.sm,
    fontSize: currentTheme.typography.fontSize.sm,
    color: currentTheme.colors.primary.brand,
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
    width: "100%", // 전체 너비 사용
  };

  // 날짜가 활성화되었는지 확인 (날짜 없음은 비활성 상태로 간주)
  const isDateActive = isDateSelected || isTodaySelected || isTomorrowSelected;

  return (
    <div style={containerStyles}>
      <form onSubmit={handleSubmit}>
        {/* 헤더 */}
        <div style={headerStyles}>
          {/* 왼쪽 액션 */}
          <div style={leftActionsStyles}>
            {!isDateActive ? (
              // 초기 상태: 캘린더 아이콘, 오늘, 내일
              <>
                {/* 캘린더 아이콘 */}
                <button
                  type="button"
                  style={{
                    ...baseButtonStyles,
                    position: "relative",
                  }}
                  onClick={handleCalendarClick}
                >
                  <CalendarIcon
                    color={currentTheme.colors.text.primary}
                    size={16}
                  />
                </button>

                {/* 오늘 버튼 */}
                <button
                  type="button"
                  style={todayButtonStyles}
                  onClick={handleTodayClick}
                >
                  오늘
                </button>

                {/* 내일 버튼 */}
                <button
                  type="button"
                  style={tomorrowButtonStyles}
                  onClick={handleTomorrowClick}
                >
                  내일
                </button>
              </>
            ) : (
              // 선택된 상태: 날짜와 X 버튼
              <div style={selectedDateStyles}>
                <CalendarIcon
                  color={currentTheme.colors.primary.brand}
                  size={16}
                />
                <span>{formatDisplayDate(date)}</span>
                <button
                  type="button"
                  onClick={handleClearDate}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "none",
                    border: "none",
                    color: "inherit",
                    cursor: "pointer",
                    padding: "0",
                    marginLeft: currentTheme.spacing["1"],
                  }}
                >
                  <CloseIcon
                    color={currentTheme.colors.primary.brand}
                    size={14}
                  />
                </button>
              </div>
            )}
          </div>

          {/* 오른쪽 액션 */}
          <div style={rightActionsStyles}>
            <button
              type="button"
              style={alarmTime ? activeActionButtonStyles : actionButtonStyles}
              onClick={openTimePicker}
              title="알람 설정"
            >
              <ClockIcon
                color={
                  alarmTime
                    ? currentTheme.colors.text.inverse
                    : currentTheme.colors.text.primary
                }
                size={16}
              />
            </button>
            <button
              type="button"
              style={isPinned ? activeActionButtonStyles : actionButtonStyles}
              onClick={() => setIsPinned(!isPinned)}
              title="상단 고정"
            >
              <PinIcon
                color={
                  isPinned
                    ? currentTheme.colors.text.inverse
                    : currentTheme.colors.text.primary
                }
                size={16}
              />
            </button>
          </div>
        </div>

        {/* 제목 입력 */}
        <Input
          placeholder="할일을 입력하세요..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{
            width: "calc(100% - 0px)", // 즐겨찾기 버튼의 오른쪽 테두리까지 맞춤
            marginBottom: currentTheme.spacing["3"],
            boxSizing: "border-box", // 패딩과 보더를 포함한 너비 계산
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
            {isEditMode ? "수정" : "추가"}
          </Button>
        </div>
      </form>

      {/* 캘린더 모달 */}
      {showCalendar && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "25px",
          }}
          onClick={handleCalendarClose}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "480px",
              maxHeight: "90vh",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Calendar
              selectedDate={date || undefined}
              onDateSelect={handleCalendarDateSelect}
              onClose={handleCalendarClose}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AddTodo;
